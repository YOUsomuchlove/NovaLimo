import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import {
  DEFAULT_SETTINGS,
  type SettingKey,
} from '../../database/seed/default-settings';
import { SettingEntity } from '../../database/entities';

type Widen<T> = T extends number
  ? number
  : T extends string
    ? string
    : T extends object
      ? { -readonly [K in keyof T]: Widen<T[K]> }
      : T;
export type SettingValue<K extends SettingKey> = Widen<
  (typeof DEFAULT_SETTINGS)[K]
>;

/** Typed access to business settings; missing keys fall back to defaults (merged shallowly). */
@Injectable()
export class SettingsService {
  private cache = new Map<string, { value: unknown; at: number }>();

  constructor(
    @InjectRepository(SettingEntity)
    private readonly repo: Repository<SettingEntity>,
  ) {}

  async get<K extends SettingKey>(key: K): Promise<SettingValue<K>> {
    const hit = this.cache.get(key);
    if (hit && Date.now() - hit.at < 30_000)
      return hit.value as SettingValue<K>;
    const row = await this.repo.findOneBy({ key });
    const value = {
      ...DEFAULT_SETTINGS[key],
      ...((row?.value as object) ?? {}),
    } as SettingValue<K>;
    this.cache.set(key, { value, at: Date.now() });
    return value;
  }

  async all(): Promise<Record<SettingKey, unknown>> {
    const out = {} as Record<SettingKey, unknown>;
    for (const key of Object.keys(DEFAULT_SETTINGS) as SettingKey[])
      out[key] = await this.get(key);
    return out;
  }

  async set(
    key: string,
    value: Record<string, unknown>,
    userId: string,
  ): Promise<unknown> {
    if (!(key in DEFAULT_SETTINGS))
      throw new NotFoundException('Không có cấu hình này');
    const defaults = DEFAULT_SETTINGS[key as SettingKey] as Record<
      string,
      unknown
    >;
    // Only known keys, same primitive types as the defaults.
    const clean = Object.fromEntries(
      Object.entries(value).filter(
        ([k, v]) => k in defaults && typeof v === typeof defaults[k],
      ),
    );
    const current = (await this.get(key as SettingKey)) as Record<
      string,
      unknown
    >;
    const next = { ...current, ...clean };
    await this.repo.save({ key, value: next, updated_by_id: userId });
    this.cache.delete(key);
    return next;
  }
}
