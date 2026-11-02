import type {
  AuthTokens,
  Me,
  UserKind,
} from '@limousine-workspace/shared-types';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { IsNull, type Repository } from 'typeorm';
import type { AuthUser } from '../../common/auth/auth-user';
import { DomainError } from '../../common/http/exception.filter';
import { InjectEnv } from '../../config/config.module';
import type { Env } from '../../config/env';
import {
  RefreshTokenEntity,
  RoleEntity,
  UserEntity,
  UserRoleEntity,
} from '../../database/entities';

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;

/** Compared against when the phone is unknown so response time doesn't reveal which accounts exist. */
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

interface ClientInfo {
  ip?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly tokens: Repository<RefreshTokenEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoles: Repository<UserRoleEntity>,
    private readonly jwt: JwtService,
    @InjectEnv() private readonly env: Env,
  ) {}

  /** Phone + password login for a given account kind, with lockout after repeated failures. */
  async login(
    kind: UserKind,
    phone: string,
    password: string,
    client: ClientInfo,
  ): Promise<AuthTokens> {
    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.password_hash')
      .where('u.phone = :phone AND u.kind = :kind AND u.deleted_at IS NULL', {
        phone,
        kind,
      })
      .getOne();

    // Same message for unknown phone / wrong password — no account enumeration.
    const invalid = () =>
      new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Số điện thoại hoặc mật khẩu không đúng',
      });
    if (!user) {
      bcrypt.compareSync(password, DUMMY_HASH);
      throw invalid();
    }
    if (user.status !== 'ACTIVE')
      throw new UnauthorizedException({
        code: 'ACCOUNT_DISABLED',
        message: 'Tài khoản đã bị khóa, liên hệ quản trị',
      });
    if (user.locked_until && user.locked_until > new Date()) {
      throw new UnauthorizedException({
        code: 'ACCOUNT_LOCKED',
        message: `Đăng nhập sai quá nhiều lần, thử lại sau ${LOCK_MINUTES} phút`,
      });
    }
    if (!bcrypt.compareSync(password, user.password_hash)) {
      const failed = user.failed_login_count + 1;
      await this.users.update(user.id, {
        failed_login_count: failed >= MAX_FAILED_LOGINS ? 0 : failed,
        locked_until:
          failed >= MAX_FAILED_LOGINS
            ? new Date(Date.now() + LOCK_MINUTES * 60_000)
            : null,
      });
      throw invalid();
    }
    await this.users.update(user.id, {
      failed_login_count: 0,
      locked_until: null,
      last_login_at: new Date(),
    });
    return this.issueTokens(user, client);
  }

  /** Rotates the refresh token. Reusing an already-rotated token revokes the whole family (theft detection). */
  async refresh(refreshToken: string, client: ClientInfo): Promise<AuthTokens> {
    const row = await this.tokens.findOne({
      where: { token_hash: sha256(refreshToken) },
      relations: { user: true },
    });
    const invalid = () =>
      new UnauthorizedException({
        code: 'REFRESH_INVALID',
        message: 'Phiên đăng nhập hết hạn',
      });
    if (!row) throw invalid();
    if (row.revoked_at) {
      await this.tokens.update(
        { user_id: row.user_id, revoked_at: IsNull() },
        { revoked_at: new Date() },
      );
      throw invalid();
    }
    if (
      row.expires_at < new Date() ||
      !row.user ||
      row.user.status !== 'ACTIVE' ||
      row.user.deleted_at
    )
      throw invalid();

    const tokens = await this.issueTokens(row.user, client);
    const next = await this.tokens.findOneByOrFail({
      token_hash: sha256(tokens.refresh_token),
    });
    await this.tokens.update(row.id, {
      revoked_at: new Date(),
      replaced_by_id: next.id,
    });
    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokens.update(
      { token_hash: sha256(refreshToken), revoked_at: IsNull() },
      { revoked_at: new Date() },
    );
  }

  async me(userId: string): Promise<Me> {
    const user = await this.users.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException();
    const roles = await this.rolesOf(user.id);
    return {
      id: user.id,
      full_name: user.full_name,
      phone: user.phone,
      email: user.email,
      kind: user.kind,
      avatar_url: user.avatar_url,
      roles: roles.map((r) => ({ slug: r.slug, name: r.name })),
      permissions: [...new Set(roles.flatMap((r) => r.permissions))].sort(),
    };
  }

  async changePassword(
    user: AuthUser,
    current: string,
    next: string,
  ): Promise<void> {
    const row = await this.users
      .createQueryBuilder('u')
      .addSelect('u.password_hash')
      .where('u.id = :id', { id: user.sub })
      .getOne();
    if (!row || !bcrypt.compareSync(current, row.password_hash)) {
      throw new DomainError(
        400,
        'WRONG_PASSWORD',
        'Mật khẩu hiện tại không đúng',
      );
    }
    await this.users.update(row.id, {
      password_hash: bcrypt.hashSync(next, 10),
    });
    // Sign out other devices.
    await this.tokens.update(
      { user_id: row.id, revoked_at: IsNull() },
      { revoked_at: new Date() },
    );
  }

  private async rolesOf(userId: string): Promise<RoleEntity[]> {
    const links = await this.userRoles.find({
      where: { user_id: userId },
      relations: { role: true },
    });
    return links.map((l) => l.role);
  }

  private async issueTokens(
    user: UserEntity,
    client: ClientInfo,
  ): Promise<AuthTokens> {
    const perms =
      user.kind === 'STAFF'
        ? [
            ...new Set(
              (await this.rolesOf(user.id)).flatMap((r) => r.permissions),
            ),
          ]
        : [];
    const claims: AuthUser = { sub: user.id, kind: user.kind, perms };
    const access_token = await this.jwt.signAsync(claims);
    const { exp, iat } = this.jwt.decode<{ exp: number; iat: number }>(
      access_token,
    );

    const refresh_token = randomBytes(32).toString('base64url');
    await this.tokens.insert({
      user_id: user.id,
      token_hash: sha256(refresh_token),
      expires_at: new Date(
        Date.now() + this.env.JWT_REFRESH_TTL_DAYS * 86_400_000,
      ),
      user_agent: client.userAgent?.slice(0, 255) ?? null,
      ip: client.ip ?? null,
    });
    return { access_token, refresh_token, expires_in: exp - iat };
  }
}
