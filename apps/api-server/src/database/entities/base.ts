import {
  type ColumnOptions,
  CreateDateColumn,
  DeleteDateColumn,
  type Point,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** id + created_at + updated_at for every table. */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}

/** Business records that are archived instead of deleted. */
export abstract class SoftDeleteEntity extends BaseEntity {
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at!: Date | null;
}

/** PostGIS geography point (WGS84). Stored as GeoJSON `{ type: 'Point', coordinates: [lng, lat] }`. */
export const geoPoint = (opts: Partial<ColumnOptions> = {}): ColumnOptions => ({
  type: 'geography',
  spatialFeatureType: 'Point',
  srid: 4326,
  ...opts,
});

export type GeoPoint = Point;

export const toPoint = (lat: number, lng: number): Point => ({
  type: 'Point',
  coordinates: [lng, lat],
});

export const fromPoint = (
  p: Point | null | undefined,
): { lat: number; lng: number } | null =>
  p ? { lat: p.coordinates[1], lng: p.coordinates[0] } : null;
