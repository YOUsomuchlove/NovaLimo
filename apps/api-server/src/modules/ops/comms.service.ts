import {
  INCIDENT_KINDS,
  INCIDENT_STATUSES,
  type ChatMessageDto,
  type IncidentDto,
  type IncidentKind,
  type IncidentStatus,
  type NotificationDto,
  type Paginated,
} from '@limousine-workspace/shared-types';
import { RealtimeEvents } from '@limousine-workspace/utils-core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { In, IsNull, LessThan, type Repository } from 'typeorm';
import { ListQueryDto, paginate } from '../../common/http/pagination';
import {
  ChatMessageEntity,
  IncidentEntity,
  NotificationEntity,
  TripRunEntity,
  UserEntity,
  fromPoint,
  toPoint,
} from '../../database/entities';
import { toNotificationDto } from '../notify/notify.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PointDto } from './driver.service';

/* ---------------- DTOs ---------------- */

export class SendChatDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(2000) body!: string;
}

export class ChatHistoryQuery {
  @ApiPropertyOptional({
    description: 'Lấy tin trước thời điểm này (phân trang lùi)',
  })
  @IsOptional()
  @IsDateString()
  before?: string;
}

export class MarkReadDto {
  @ApiPropertyOptional({
    type: [String],
    description: 'Bỏ trống = đánh dấu tất cả',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsUUID('4', { each: true })
  ids?: string[];
}

export class ReportIncidentDto {
  @ApiProperty({ enum: INCIDENT_KINDS })
  @IsIn(INCIDENT_KINDS)
  kind!: IncidentKind;
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  description!: string;
  @ApiPropertyOptional({ type: PointDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PointDto)
  location?: PointDto;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  photo_url?: string;
}

export class IncidentListQuery extends ListQueryDto {
  @ApiPropertyOptional({ enum: INCIDENT_STATUSES })
  @IsOptional()
  @IsIn(INCIDENT_STATUSES)
  status?: IncidentStatus;
}

export class UpdateIncidentDto {
  @ApiProperty({ enum: INCIDENT_STATUSES })
  @IsIn(INCIDENT_STATUSES)
  status!: IncidentStatus;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  resolution_note?: string;
}

/* ---------------- service ---------------- */

@Injectable()
export class CommsService {
  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly chat: Repository<ChatMessageEntity>,
    @InjectRepository(NotificationEntity)
    private readonly notifications: Repository<NotificationEntity>,
    @InjectRepository(IncidentEntity)
    private readonly incidents: Repository<IncidentEntity>,
    @InjectRepository(TripRunEntity)
    private readonly runs: Repository<TripRunEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly realtime: RealtimeGateway,
  ) {}

  /* ---------- chat (one thread per driver) ---------- */

  private toChatDto(m: ChatMessageEntity): ChatMessageDto {
    return {
      id: m.id,
      driver_id: m.driver_id,
      sender_role: m.sender_role,
      sender_name: m.sender?.full_name ?? '',
      body: m.body,
      read_at: m.read_at?.toISOString() ?? null,
      created_at: m.created_at.toISOString(),
    };
  }

  async history(driverId: string, before?: string): Promise<ChatMessageDto[]> {
    const rows = await this.chat.find({
      where: {
        driver_id: driverId,
        ...(before ? { created_at: LessThan(new Date(before)) } : {}),
      },
      relations: { sender: true },
      order: { created_at: 'DESC' },
      take: 50,
    });
    return rows.reverse().map((m) => this.toChatDto(m));
  }

  async send(
    driverId: string,
    senderId: string,
    role: 'DRIVER' | 'OPS',
    body: string,
  ): Promise<ChatMessageDto> {
    if (
      role === 'OPS' &&
      !(await this.users.existsBy({ id: driverId, kind: 'DRIVER' }))
    )
      throw new NotFoundException('Không tìm thấy tài xế');
    const saved = await this.chat.save(
      this.chat.create({
        driver_id: driverId,
        sender_user_id: senderId,
        sender_role: role,
        body: body.trim(),
      }),
    );
    const dto = this.toChatDto(
      (await this.chat.findOne({
        where: { id: saved.id },
        relations: { sender: true },
      })) as ChatMessageEntity,
    );
    this.realtime.toOpsAndDriver(driverId, RealtimeEvents.chatMessage, dto);
    return dto;
  }

  /** Messages from the other side become read when a participant opens the thread. */
  async markThreadRead(
    driverId: string,
    readerRole: 'DRIVER' | 'OPS',
  ): Promise<void> {
    await this.chat.update(
      {
        driver_id: driverId,
        sender_role: readerRole === 'DRIVER' ? 'OPS' : 'DRIVER',
        read_at: IsNull(),
      },
      { read_at: new Date() },
    );
  }

  /** Ops inbox: one row per driver with last message and unread count. */
  async threads() {
    return this.chat
      .query(
        `SELECT DISTINCT ON (m.driver_id)
              m.driver_id, u.full_name AS driver_name, u.avatar_url,
              m.body AS last_body, m.sender_role AS last_sender_role, m.created_at AS last_at,
              (SELECT COUNT(*)::int FROM chat_messages x WHERE x.driver_id = m.driver_id AND x.sender_role = 'DRIVER' AND x.read_at IS NULL) AS unread
         FROM chat_messages m JOIN users u ON u.id = m.driver_id
        ORDER BY m.driver_id, m.created_at DESC`,
      )
      .then((rows: { last_at: Date }[]) =>
        rows.sort((a, b) => +new Date(b.last_at) - +new Date(a.last_at)),
      );
  }

  /* ---------- notifications ---------- */

  async listNotifications(userId: string): Promise<NotificationDto[]> {
    const rows = await this.notifications.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: 100,
    });
    return rows.map(toNotificationDto);
  }

  async markNotificationsRead(userId: string, ids?: string[]): Promise<void> {
    await this.notifications.update(
      {
        user_id: userId,
        read_at: IsNull(),
        ...(ids?.length ? { id: In(ids) } : {}),
      },
      { read_at: new Date() },
    );
  }

  /* ---------- incidents (SOS) ---------- */

  private toIncidentDto(i: IncidentEntity): IncidentDto {
    return {
      id: i.id,
      driver: {
        id: i.driver.id,
        full_name: i.driver.full_name,
        phone: i.driver.phone,
      },
      trip_run_id: i.trip_run_id,
      kind: i.kind,
      description: i.description,
      location: fromPoint(i.point),
      photo_url: i.photo_url,
      status: i.status,
      resolved_at: i.resolved_at?.toISOString() ?? null,
      resolution_note: i.resolution_note,
      created_at: i.created_at.toISOString(),
    };
  }

  async report(driverId: string, dto: ReportIncidentDto): Promise<IncidentDto> {
    const active = await this.runs.findOneBy({
      driver_id: driverId,
      status: In(['IN_PROGRESS', 'DISPATCHED']),
    });
    const saved = await this.incidents.save(
      this.incidents.create({
        driver_id: driverId,
        trip_run_id: active?.id ?? null,
        kind: dto.kind,
        description: dto.description,
        point: dto.location
          ? toPoint(dto.location.lat, dto.location.lng)
          : null,
        photo_url: dto.photo_url ?? null,
      }),
    );
    const dto2 = this.toIncidentDto(
      (await this.incidents.findOne({
        where: { id: saved.id },
        relations: { driver: true },
      })) as IncidentEntity,
    );
    this.realtime.toOps(RealtimeEvents.incidentReported, dto2);
    return dto2;
  }

  async listIncidents(q: IncidentListQuery): Promise<Paginated<IncidentDto>> {
    const qb = this.incidents
      .createQueryBuilder('i')
      .innerJoinAndSelect('i.driver', 'd');
    if (q.status) qb.andWhere('i.status = :s', { s: q.status });
    return paginate(qb, q, (i) => this.toIncidentDto(i));
  }

  async updateIncident(
    id: string,
    dto: UpdateIncidentDto,
    userId: string,
  ): Promise<IncidentDto> {
    const i = await this.incidents.findOne({
      where: { id },
      relations: { driver: true },
    });
    if (!i) throw new NotFoundException('Không tìm thấy sự cố');
    Object.assign(i, {
      status: dto.status,
      handled_by_id: userId,
      resolution_note: dto.resolution_note ?? i.resolution_note,
      resolved_at: dto.status === 'RESOLVED' ? new Date() : null,
    });
    await this.incidents.save(i);
    const out = this.toIncidentDto(i);
    this.realtime.toOps(RealtimeEvents.incidentReported, out);
    return out;
  }
}
