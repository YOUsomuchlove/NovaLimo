'use client';

import { Input, Table, type TableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { RotateCcw, Search } from 'lucide-react';
import type { Key, ReactNode } from 'react';
import { Button } from '../primitives/Button';
import { EmptyState, ErrorState, Skeleton } from '../primitives/Feedback';
import { cn } from '../utils/cn';

/* ---------- FilterBar ---------- */

export function FilterBar({
  search,
  children,
  actions,
  onReset,
  className,
}: {
  search?: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  };
  /** Filter controls (antd Select / DatePicker / SegmentedControl…) */
  children?: ReactNode;
  actions?: ReactNode;
  /** Shows a "Xóa lọc" button when provided */
  onReset?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between',
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {search && (
          <Input
            allowClear
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder ?? 'Tìm kiếm…'}
            prefix={<Search className="size-4 text-fg-muted" />}
            className="w-full sm:max-w-xs"
          />
        )}
        {children}
        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw className="size-3.5" />}
            onClick={onReset}
          >
            Xóa lọc
          </Button>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

/* ---------- DataTable ---------- */

export interface ServerPagination {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
}

export interface DataTableProps<T> {
  columns: ColumnsType<T>;
  data: T[] | undefined;
  rowKey: keyof T | ((row: T) => Key);
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  pagination?: ServerPagination;
  empty?: { title?: ReactNode; description?: ReactNode; action?: ReactNode };
  /** Toolbar above the table (usually a `<FilterBar/>`) */
  toolbar?: ReactNode;
  onRowClick?: (row: T) => void;
  rowSelection?: TableProps<T>['rowSelection'];
  /** Horizontal scroll width for many columns */
  scrollX?: number | string;
  className?: string;
}

/**
 * antd Table with the four states every list screen needs (loading skeleton, empty, error, data)
 * and server-side pagination. Sticky header, row hover in brand tint (from the antd theme).
 */
export function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  loading,
  error,
  onRetry,
  pagination,
  empty,
  toolbar,
  onRowClick,
  rowSelection,
  scrollX = 'max-content',
  className,
}: DataTableProps<T>) {
  const firstLoad = loading && !data;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-card border border-border-subtle bg-surface-1 shadow-e1',
        className,
      )}
    >
      {toolbar && (
        <div className="border-b border-border-subtle p-4">{toolbar}</div>
      )}

      {error ? (
        <ErrorState onRetry={onRetry} />
      ) : firstLoad ? (
        <div className="flex flex-col" aria-busy>
          <div className="h-11 border-b border-border-subtle bg-surface-2" />
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-6 border-b border-border-subtle px-4 py-4 last:border-b-0"
            >
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="ml-auto h-6 w-20" rounded="tag" />
            </div>
          ))}
        </div>
      ) : (
        <Table<T>
          columns={columns}
          dataSource={data}
          rowKey={rowKey as TableProps<T>['rowKey']}
          loading={loading ? { indicator: undefined } : false}
          rowSelection={rowSelection}
          sticky
          scroll={{ x: scrollX }}
          onRow={
            onRowClick
              ? (row) => ({
                  onClick: () => onRowClick(row),
                  className: 'cursor-pointer',
                })
              : undefined
          }
          locale={{
            emptyText: (
              <EmptyState
                compact
                title={empty?.title ?? 'Chưa có dữ liệu'}
                description={empty?.description}
                action={empty?.action}
              />
            ),
          }}
          pagination={
            pagination
              ? {
                  current: pagination.page,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  onChange: pagination.onChange,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 20, 50, 100],
                  showTotal: (total, [from, to]) =>
                    `${from}–${to} / ${total.toLocaleString('vi-VN')}`,
                  className: '!px-4',
                }
              : false
          }
        />
      )}
    </div>
  );
}
