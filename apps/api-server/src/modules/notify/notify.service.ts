import type { NotificationDto } from '@limousine-workspace/shared-types';
import { RealtimeEvents } from '@limousine-workspace/utils-core';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { InjectEnv } from '../../config/config.module';
import type { Env } from '../../config/env';
import { NotificationEntity } from '../../database/entities';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { SettingsService } from '../settings/settings.service';

type TemplateKey =
  | 'booking_confirmed'
  | 'booking_reminder'
  | 'otp'
  | 'cargo_created';

const render = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));

export const toNotificationDto = (n: NotificationEntity): NotificationDto => ({
  id: n.id,
  kind: n.kind,
  title: n.title,
  body: n.body,
  data: n.data,
  read_at: n.read_at?.toISOString() ?? null,
  created_at: n.created_at.toISOString(),
});

/**
 * Outbound messages. SMS goes through a provider adapter (`console` in dev logs the text);
 * in-app notifications are stored and pushed over the socket.
 */
@Injectable()
export class NotifyService {
  private readonly logger = new Logger('Notify');

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notifications: Repository<NotificationEntity>,
    private readonly settings: SettingsService,
    private readonly realtime: RealtimeGateway,
    @InjectEnv() private readonly env: Env,
  ) {}

  async sms(
    phone: string,
    template: TemplateKey,
    vars: Record<string, string | number>,
  ): Promise<void> {
    const templates = await this.settings.get('notifications.templates');
    const text = render(templates[template], vars);
    if (this.env.SMS_PROVIDER === 'console') {
      this.logger.log(`[SMS → ${phone}] ${text}`);
      return;
    }
    // Real providers (eSMS / SpeedSMS) are wired here once credentials are available.
    this.logger.warn(
      `SMS provider ${this.env.SMS_PROVIDER} not implemented — message to ${phone} dropped`,
    );
  }

  async inApp(
    userId: string,
    kind: string,
    title: string,
    body: string,
    data: Record<string, unknown> | null = null,
  ): Promise<void> {
    const n = await this.notifications.save(
      this.notifications.create({ user_id: userId, kind, title, body, data }),
    );
    this.realtime.toDriver(
      userId,
      RealtimeEvents.notification,
      toNotificationDto(n),
    );
  }
}
