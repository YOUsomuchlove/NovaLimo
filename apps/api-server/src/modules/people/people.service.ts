import type {
  AuditLogDto,
  DriverDto,
  Paginated,
  RoleDto,
  StaffUserDto,
} from '@limousine-workspace/shared-types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { In, IsNull, type Repository } from 'typeorm';
import { DomainError } from '../../common/http/exception.filter';
import { likeTerm, paginate } from '../../common/http/pagination';
import { vnDayRange } from '../../common/time';
import {
  AuditLogEntity,
  DriverProfileEntity,
  DriverShiftEntity,
  RefreshTokenEntity,
  RoleEntity,
  UserEntity,
  UserRoleEntity,
  VehicleEntity,
} from '../../database/entities';
import type {
  AuditListQuery,
  CreateDriverDto,
  CreateRoleDto,
  CreateStaffDto,
  PeopleListQuery,
  UpdateDriverDto,
  UpdateRoleDto,
  UpdateStaffDto,
} from './people.dto';

const iso = (d: Date | null) => d?.toISOString() ?? null;

@Injectable()
export class PeopleService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(DriverProfileEntity)
    private readonly profiles: Repository<DriverProfileEntity>,
    @InjectRepository(RoleEntity)
    private readonly roles: Repository<RoleEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoles: Repository<UserRoleEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly tokens: Repository<RefreshTokenEntity>,
    @InjectRepository(DriverShiftEntity)
    private readonly shifts: Repository<DriverShiftEntity>,
    @InjectRepository(VehicleEntity)
    private readonly vehicles: Repository<VehicleEntity>,
    @InjectRepository(AuditLogEntity)
    private readonly audit: Repository<AuditLogEntity>,
  ) {}

  /* ================= staff ================= */

  async listStaff(q: PeopleListQuery): Promise<Paginated<StaffUserDto>> {
    const qb = this.users.createQueryBuilder('u').where("u.kind = 'STAFF'");
    if (q.status) qb.andWhere('u.status = :s', { s: q.status });
    if (q.role_id)
      qb.andWhere(
        'u.id IN (SELECT user_id FROM user_roles WHERE role_id = :r)',
        { r: q.role_id },
      );
    if (q.q)
      qb.andWhere(
        '(u.full_name ILIKE :q OR u.phone ILIKE :q OR u.email ILIKE :q)',
        { q: likeTerm(q.q) },
      );
    const page = await paginate(qb, q, (u) => u, {
      name: 'u.full_name',
      last_login: 'u.last_login_at',
      created_at: 'u.created_at',
    });
    const roleMap = await this.rolesByUser(page.items.map((u) => u.id));
    return {
      ...page,
      items: page.items.map((u) => this.toStaffDto(u, roleMap.get(u.id) ?? [])),
    };
  }

  async getStaff(id: string): Promise<StaffUserDto> {
    const u = await this.users.findOneBy({ id, kind: 'STAFF' });
    if (!u) throw new NotFoundException('Không tìm thấy nhân viên');
    return this.toStaffDto(u, (await this.rolesByUser([id])).get(id) ?? []);
  }

  async createStaff(dto: CreateStaffDto): Promise<StaffUserDto> {
    await this.assertRoles(dto.role_ids);
    const u = await this.users.save(
      this.users.create({
        full_name: dto.full_name,
        phone: dto.phone,
        email: dto.email ?? null,
        kind: 'STAFF',
        password_hash: bcrypt.hashSync(dto.password, 10),
      }),
    );
    await this.userRoles.insert(
      dto.role_ids.map((role_id) => ({ user_id: u.id, role_id })),
    );
    return this.getStaff(u.id);
  }

  async updateStaff(
    id: string,
    dto: UpdateStaffDto,
    actorId: string,
  ): Promise<StaffUserDto> {
    const u = await this.users.findOneBy({ id, kind: 'STAFF' });
    if (!u) throw new NotFoundException('Không tìm thấy nhân viên');
    if (id === actorId && dto.status && dto.status !== 'ACTIVE')
      throw new DomainError(
        400,
        'SELF_LOCK',
        'Không thể tự khóa tài khoản của mình',
      );
    const { role_ids, ...rest } = dto;
    await this.users.save(Object.assign(u, rest));
    if (role_ids) {
      await this.assertRoles(role_ids);
      if (id === actorId) {
        const current = (await this.rolesByUser([id])).get(id) ?? [];
        const hadSuper = current.some((r) => r.slug === 'superadmin');
        const keepsSuper = (await this.roles.findBy({ id: In(role_ids) })).some(
          (r) => r.slug === 'superadmin',
        );
        if (hadSuper && !keepsSuper)
          throw new DomainError(
            400,
            'SELF_DEMOTE',
            'Không thể tự gỡ quyền quản trị của mình',
          );
      }
      await this.userRoles.delete({ user_id: id });
      if (role_ids.length)
        await this.userRoles.insert(
          role_ids.map((role_id) => ({ user_id: id, role_id })),
        );
    }
    if (dto.status && dto.status !== 'ACTIVE') await this.revokeSessions(id);
    return this.getStaff(id);
  }

  /* ================= drivers ================= */

  async listDrivers(q: PeopleListQuery): Promise<Paginated<DriverDto>> {
    const qb = this.users
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.driver_profile', 'p')
      .leftJoinAndSelect('p.default_vehicle', 'v')
      .where("u.kind = 'DRIVER'");
    if (q.status) qb.andWhere('u.status = :s', { s: q.status });
    if (q.q)
      qb.andWhere(
        '(u.full_name ILIKE :q OR u.phone ILIKE :q OR p.license_number ILIKE :q)',
        { q: likeTerm(q.q) },
      );
    const page = await paginate(qb, q, (u) => u, {
      name: 'u.full_name',
      created_at: 'u.created_at',
    });
    const onShift = await this.onShift(page.items.map((u) => u.id));
    return {
      ...page,
      items: page.items.map((u) => this.toDriverDto(u, onShift.has(u.id))),
    };
  }

  async getDriver(id: string): Promise<DriverDto> {
    const u = await this.users.findOne({
      where: { id, kind: 'DRIVER' },
      relations: { driver_profile: { default_vehicle: true } },
    });
    if (!u) throw new NotFoundException('Không tìm thấy tài xế');
    return this.toDriverDto(u, (await this.onShift([id])).has(id));
  }

  async createDriver(dto: CreateDriverDto): Promise<DriverDto> {
    if (dto.profile?.default_vehicle_id)
      await this.assertVehicle(dto.profile.default_vehicle_id);
    const id = await this.users.manager.transaction(async (m) => {
      const u = await m.save(
        m.create(UserEntity, {
          full_name: dto.full_name,
          phone: dto.phone,
          email: dto.email ?? null,
          avatar_url: dto.avatar_url ?? null,
          kind: 'DRIVER',
          password_hash: bcrypt.hashSync(dto.password, 10),
        }),
      );
      await m.insert(DriverProfileEntity, {
        user_id: u.id,
        ...(dto.profile ?? {}),
      });
      return u.id;
    });
    return this.getDriver(id);
  }

  async updateDriver(id: string, dto: UpdateDriverDto): Promise<DriverDto> {
    const u = await this.users.findOneBy({ id, kind: 'DRIVER' });
    if (!u) throw new NotFoundException('Không tìm thấy tài xế');
    const { profile, ...rest } = dto;
    if (profile?.default_vehicle_id)
      await this.assertVehicle(profile.default_vehicle_id);
    await this.users.save(Object.assign(u, rest));
    if (profile)
      await this.profiles.upsert({ user_id: id, ...profile }, ['user_id']);
    if (dto.status && dto.status !== 'ACTIVE') await this.revokeSessions(id);
    return this.getDriver(id);
  }

  /* ================= shared ================= */

  async resetPassword(id: string, password: string): Promise<void> {
    const res = await this.users.update(
      { id, deleted_at: IsNull() },
      {
        password_hash: bcrypt.hashSync(password, 10),
        failed_login_count: 0,
        locked_until: null,
      },
    );
    if (!res.affected) throw new NotFoundException('Không tìm thấy tài khoản');
    await this.revokeSessions(id);
  }

  async archiveUser(id: string, actorId: string): Promise<void> {
    if (id === actorId)
      throw new DomainError(
        400,
        'SELF_DELETE',
        'Không thể xóa tài khoản của chính mình',
      );
    const res = await this.users.update(
      { id, deleted_at: IsNull() },
      { status: 'INACTIVE' },
    );
    if (!res.affected) throw new NotFoundException('Không tìm thấy tài khoản');
    await this.users.softDelete(id);
    await this.revokeSessions(id);
  }

  /* ================= roles ================= */

  async listRoles(): Promise<RoleDto[]> {
    const rows = await this.roles.find();
    const counts = await this.userRoles
      .createQueryBuilder('ur')
      .select('ur.role_id', 'role_id')
      .addSelect('COUNT(*)', 'n')
      .groupBy('ur.role_id')
      .getRawMany<{ role_id: string; n: string }>();
    const byRole = new Map(counts.map((c) => [c.role_id, Number(c.n)]));
    return rows
      .sort(
        (a, b) =>
          Number(b.is_system) - Number(a.is_system) ||
          a.name.localeCompare(b.name),
      )
      .map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        description: r.description,
        is_system: r.is_system,
        permissions: r.permissions,
        user_count: byRole.get(r.id) ?? 0,
      }));
  }

  async createRole(dto: CreateRoleDto): Promise<RoleDto> {
    const r = await this.roles.save(this.roles.create(dto));
    return { ...r, user_count: 0 };
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<RoleDto> {
    const r = await this.roles.findOneBy({ id });
    if (!r) throw new NotFoundException('Không tìm thấy vai trò');
    if (r.is_system)
      throw new DomainError(
        409,
        'SYSTEM_ROLE',
        'Không thể sửa vai trò hệ thống',
      );
    await this.roles.save(Object.assign(r, dto));
    return (await this.listRoles()).find((x) => x.id === id) as RoleDto;
  }

  async deleteRole(id: string): Promise<void> {
    const r = await this.roles.findOneBy({ id });
    if (!r) throw new NotFoundException('Không tìm thấy vai trò');
    if (r.is_system)
      throw new DomainError(
        409,
        'SYSTEM_ROLE',
        'Không thể xóa vai trò hệ thống',
      );
    if (await this.userRoles.existsBy({ role_id: id }))
      throw new DomainError(
        409,
        'ROLE_IN_USE',
        'Vai trò đang được gán cho nhân viên',
      );
    await this.roles.delete(id);
  }

  /* ================= audit ================= */

  async listAudit(q: AuditListQuery): Promise<Paginated<AuditLogDto>> {
    const qb = this.audit
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.actor', 'u');
    if (q.actor_id)
      qb.andWhere('a.actor_user_id = :actor', { actor: q.actor_id });
    if (q.resource) qb.andWhere('a.resource = :res', { res: q.resource });
    if (q.resource_id)
      qb.andWhere('a.resource_id = :rid', { rid: q.resource_id });
    if (q.from)
      qb.andWhere('a.created_at >= :from', {
        from: vnDayRange(q.from.slice(0, 10)).from,
      });
    if (q.to)
      qb.andWhere('a.created_at < :to', {
        to: vnDayRange(q.to.slice(0, 10)).to,
      });
    if (q.q)
      qb.andWhere('(a.action ILIKE :q OR u.full_name ILIKE :q)', {
        q: likeTerm(q.q),
      });
    return paginate(qb, q, (a) => ({
      id: a.id,
      actor: a.actor ? { id: a.actor.id, full_name: a.actor.full_name } : null,
      action: a.action,
      resource: a.resource,
      resource_id: a.resource_id,
      payload: a.payload,
      status_code: a.status_code,
      ip: a.ip,
      created_at: a.created_at.toISOString(),
    }));
  }

  /* ================= helpers ================= */

  private async rolesByUser(
    userIds: string[],
  ): Promise<Map<string, RoleEntity[]>> {
    if (!userIds.length) return new Map();
    const links = await this.userRoles.find({
      where: { user_id: In(userIds) },
      relations: { role: true },
    });
    const out = new Map<string, RoleEntity[]>();
    for (const l of links)
      out.set(l.user_id, [...(out.get(l.user_id) ?? []), l.role]);
    return out;
  }

  private async onShift(driverIds: string[]): Promise<Set<string>> {
    if (!driverIds.length) return new Set();
    const rows = await this.shifts.find({
      where: { driver_id: In(driverIds), ended_at: IsNull() },
      select: { driver_id: true },
    });
    return new Set(rows.map((r) => r.driver_id));
  }

  private async assertRoles(ids: string[]) {
    if (
      ids.length &&
      (await this.roles.countBy({ id: In(ids) })) !== ids.length
    )
      throw new DomainError(400, 'UNKNOWN_ROLE', 'Vai trò không tồn tại');
  }

  private async assertVehicle(id: string) {
    if (!(await this.vehicles.existsBy({ id })))
      throw new DomainError(400, 'UNKNOWN_VEHICLE', 'Xe không tồn tại');
  }

  private async revokeSessions(userId: string) {
    await this.tokens.update(
      { user_id: userId, revoked_at: IsNull() },
      { revoked_at: new Date() },
    );
  }

  private toStaffDto(u: UserEntity, roles: RoleEntity[]): StaffUserDto {
    return {
      id: u.id,
      full_name: u.full_name,
      phone: u.phone,
      email: u.email,
      kind: u.kind,
      status: u.status,
      avatar_url: u.avatar_url,
      last_login_at: iso(u.last_login_at),
      roles: roles.map((r) => ({ id: r.id, slug: r.slug, name: r.name })),
      created_at: u.created_at.toISOString(),
    };
  }

  private toDriverDto(u: UserEntity, onShift: boolean): DriverDto {
    const p = u.driver_profile;
    return {
      id: u.id,
      full_name: u.full_name,
      phone: u.phone,
      email: u.email,
      kind: u.kind,
      status: u.status,
      avatar_url: u.avatar_url,
      last_login_at: iso(u.last_login_at),
      created_at: u.created_at.toISOString(),
      on_shift: onShift,
      profile: {
        license_number: p?.license_number ?? null,
        license_class: p?.license_class ?? null,
        license_expires_on: p?.license_expires_on ?? null,
        date_of_birth: p?.date_of_birth ?? null,
        address: p?.address ?? null,
        emergency_contact: p?.emergency_contact ?? null,
        default_vehicle: p?.default_vehicle
          ? {
              id: p.default_vehicle.id,
              license_plate: p.default_vehicle.license_plate,
            }
          : null,
        hired_on: p?.hired_on ?? null,
        note: p?.note ?? null,
      },
    };
  }
}
