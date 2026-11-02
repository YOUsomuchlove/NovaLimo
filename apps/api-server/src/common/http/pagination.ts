import type { Paginated } from '@limousine-workspace/shared-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export class ListQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ description: 'Tìm kiếm' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({ description: 'field hoặc -field (giảm dần)' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  sort?: string;
}

/**
 * Applies paging + whitelisted sorting to a query builder and returns `Paginated<R>`.
 * `sortable` maps public sort keys to SQL columns so clients cannot sort on arbitrary SQL.
 */
export async function paginate<E extends ObjectLiteral, R>(
  qb: SelectQueryBuilder<E>,
  query: ListQueryDto,
  map: (row: E) => R,
  sortable: Record<string, string> = {},
  defaultSort: [string, 'ASC' | 'DESC'] = [`${qb.alias}.created_at`, 'DESC'],
): Promise<Paginated<R>> {
  const desc = query.sort?.startsWith('-');
  const key = query.sort?.replace(/^-/, '');
  const column = key ? sortable[key] : undefined;
  if (column) qb.orderBy(column, desc ? 'DESC' : 'ASC');
  else qb.orderBy(defaultSort[0], defaultSort[1]);
  const [rows, total] = await qb
    .skip((query.page - 1) * query.limit)
    .take(query.limit)
    .getManyAndCount();
  return { items: rows.map(map), total, page: query.page, limit: query.limit };
}

/** Escape LIKE wildcards in user search input. */
export const likeTerm = (q: string) =>
  `%${q.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
