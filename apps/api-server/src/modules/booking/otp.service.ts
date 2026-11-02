import type { OtpPurpose } from '@limousine-workspace/shared-types';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { IsNull, MoreThan, type Repository } from 'typeorm';
import { DomainError } from '../../common/http/exception.filter';
import { OtpCodeEntity } from '../../database/entities';
import { NotifyService } from '../notify/notify.service';

const TTL_MIN = 5;
const MAX_ATTEMPTS = 5;
const RESEND_SECONDS = 60;
const MAX_PER_HOUR = 5;
const LOOKUP_AUDIENCE = 'booking-lookup';

const hash = (phone: string, code: string) =>
  createHash('sha256').update(`${phone}:${code}`).digest('hex');

/** SMS one-time codes guarding "my bookings" (prevents listing someone else's trips by phone). */
@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OtpCodeEntity)
    private readonly codes: Repository<OtpCodeEntity>,
    private readonly notify: NotifyService,
    private readonly jwt: JwtService,
  ) {}

  async request(
    phone: string,
    purpose: OtpPurpose,
  ): Promise<{ expires_in: number; resend_in: number }> {
    const hourAgo = new Date(Date.now() - 3_600_000);
    const recent = await this.codes.find({
      where: { phone, purpose, created_at: MoreThan(hourAgo) },
      order: { created_at: 'DESC' },
    });
    if (
      recent[0] &&
      Date.now() - recent[0].created_at.getTime() < RESEND_SECONDS * 1000
    ) {
      throw new DomainError(
        429,
        'OTP_TOO_SOON',
        'Vui lòng đợi 60 giây trước khi gửi lại mã',
      );
    }
    if (recent.length >= MAX_PER_HOUR)
      throw new DomainError(
        429,
        'OTP_LIMIT',
        'Bạn đã yêu cầu quá nhiều mã, thử lại sau 1 giờ',
      );

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    await this.codes.update(
      { phone, purpose, consumed_at: IsNull() },
      { consumed_at: new Date() },
    );
    await this.codes.insert({
      phone,
      purpose,
      code_hash: hash(phone, code),
      expires_at: new Date(Date.now() + TTL_MIN * 60_000),
    });
    await this.notify.sms(phone, 'otp', { code });
    return { expires_in: TTL_MIN * 60, resend_in: RESEND_SECONDS };
  }

  /** Verifies the code and returns a 30-minute token scoped to this phone. */
  async verify(
    phone: string,
    code: string,
    purpose: OtpPurpose,
  ): Promise<{ lookup_token: string; expires_in: number }> {
    const row = await this.codes.findOne({
      where: { phone, purpose, consumed_at: IsNull() },
      order: { created_at: 'DESC' },
    });
    const fail = () =>
      new DomainError(
        400,
        'OTP_INVALID',
        'Mã xác thực không đúng hoặc đã hết hạn',
      );
    if (!row || row.expires_at < new Date() || row.attempts >= MAX_ATTEMPTS)
      throw fail();
    const ok = timingSafeEqual(
      Buffer.from(row.code_hash),
      Buffer.from(hash(phone, code)),
    );
    if (!ok) {
      await this.codes.increment({ id: row.id }, 'attempts', 1);
      throw fail();
    }
    await this.codes.update(row.id, { consumed_at: new Date() });
    const lookup_token = await this.jwt.signAsync(
      { phone },
      { audience: LOOKUP_AUDIENCE, expiresIn: '30m' },
    );
    return { lookup_token, expires_in: 1800 };
  }

  async phoneFromToken(token: string | undefined): Promise<string> {
    if (!token)
      throw new UnauthorizedException({
        code: 'OTP_REQUIRED',
        message: 'Vui lòng xác thực số điện thoại',
      });
    try {
      const { phone } = await this.jwt.verifyAsync<{ phone: string }>(token, {
        audience: LOOKUP_AUDIENCE,
      });
      return phone;
    } catch {
      throw new UnauthorizedException({
        code: 'OTP_REQUIRED',
        message: 'Phiên tra cứu đã hết hạn, vui lòng xác thực lại',
      });
    }
  }
}
