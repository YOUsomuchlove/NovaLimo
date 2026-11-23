'use client';

import { categorical, darkTheme } from '@limousine-workspace/design-tokens';
import type {
  DashboardStatsDto,
  TripBatchDto,
} from '@limousine-workspace/shared-types';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DataTable,
  DateTime,
  ErrorState,
  KpiCard,
  Money,
  Skeleton,
  StatusTag,
} from '@limousine-workspace/shared-ui';
import type { ColumnsType } from 'antd/es/table';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Bus,
  CalendarClock,
  Network,
  Percent,
  RefreshCw,
  Ticket,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { type RevenueReportDto, adminApi } from '../../lib/api';

function formatShortDate(isoDate: string): string {
  const parts = isoDate.slice(0, 10).split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}`;
}

export function DashboardConsoleView() {
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [revReport, setRevReport] = useState<RevenueReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await adminApi.dashboard();
      setStats(d);
      if (d.revenue_last_7_days.length > 0) {
        const from = d.revenue_last_7_days[0].date;
        const to = d.revenue_last_7_days[d.revenue_last_7_days.length - 1].date;
        const r = await adminApi.reportRevenue({ from, to }).catch(() => null);
        setRevReport(r);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const revenueTrend = useMemo(
    () => stats?.revenue_last_7_days.map((p) => p.revenue_vnd) ?? [],
    [stats],
  );
  const ticketTrend = useMemo(
    () => stats?.revenue_last_7_days.map((p) => p.tickets) ?? [],
    [stats],
  );
  const weekRevenueTotal = useMemo(
    () =>
      stats?.revenue_last_7_days.reduce((s, p) => s + p.revenue_vnd, 0) ?? 0,
    [stats],
  );

  const chartSeries = useMemo(
    () =>
      (stats?.revenue_last_7_days ?? []).map((p) => ({
        dateLabel: formatShortDate(p.date),
        revenue_vnd: p.revenue_vnd,
        tickets: p.tickets,
      })),
    [stats],
  );

  const financeSeries = useMemo(
    () =>
      (revReport?.series ?? []).map((p) => ({
        dateLabel: formatShortDate(String(p.date)),
        income:
          Number(p.tickets ?? 0) + Number(p.cargo ?? 0) + Number(p.other ?? 0),
        expense: Number(p.expense ?? 0),
      })),
    [revReport],
  );

  const upcomingColumns: ColumnsType<TripBatchDto> = useMemo(
    () => [
      {
        title: 'Mã lô',
        dataIndex: 'code',
        key: 'code',
        render: (code: string) => (
          <span className="font-mono text-xs font-semibold text-fg">
            {code}
          </span>
        ),
      },
      {
        title: 'Tuyến đường',
        key: 'route',
        render: (_, r) => (
          <div>
            <p className="text-ui font-medium text-fg">{r.route.name}</p>
            <p className="text-xs text-fg-muted">
              {r.vehicle_type.name} · {r.planned_vehicles} xe dự kiến
            </p>
          </div>
        ),
      },
      {
        title: 'Khởi hành',
        dataIndex: 'departure_at',
        key: 'departure_at',
        render: (v: string) => (
          <DateTime value={v} className="text-ui font-medium text-fg" />
        ),
      },
      {
        title: 'Lấp đầy ghế',
        key: 'seats',
        render: (_, r) => {
          const pct = r.seats_total
            ? Math.round((r.seats_sold / r.seats_total) * 100)
            : 0;
          return (
            <div className="min-w-[140px]">
              <div className="flex items-center justify-between text-xs tabular-nums">
                <span className="font-semibold text-fg">
                  {r.seats_sold}/{r.seats_total} ghế
                </span>
                <span className="text-fg-muted">{pct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-pill bg-surface-3">
                <div
                  className="h-full rounded-pill bg-brand transition-all"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        title: 'Giá cơ bản',
        dataIndex: 'price_vnd',
        key: 'price_vnd',
        render: (v: number) => <Money value={v} className="text-ui text-fg" />,
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (s: TripBatchDto['status']) => (
          <StatusTag domain="tripBatch" status={s} />
        ),
      },
      {
        title: 'Thao tác',
        key: 'actions',
        align: 'right',
        render: (_, r) => (
          <Link
            href={`/dispatch/${r.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-fg hover:underline"
          >
            Điều phối
            <ArrowRight className="size-3.5" />
          </Link>
        ),
      },
    ],
    [],
  );

  if (error && !stats) {
    return (
      <Card>
        <ErrorState
          title="Không tải được dữ liệu Bảng điều khiển"
          description={
            error instanceof Error
              ? error.message
              : 'Vui lòng kiểm tra kết nối tới máy chủ API hoặc đăng nhập lại.'
          }
          onRetry={load}
        />
      </Card>
    );
  }

  const availableVehicles = stats
    ? Math.max(
        0,
        stats.vehicles.total -
          stats.vehicles.in_use -
          stats.vehicles.maintenance,
      )
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Action & Alert Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">
            <CalendarClock className="size-3.5" />
            Hôm nay · {stats?.date ?? 'Đang tải…'}
          </Badge>
          {stats && stats.runs_in_progress > 0 && (
            <Badge tone="info">
              {stats.runs_in_progress} chuyến đang lăn bánh
            </Badge>
          )}
          {stats && stats.open_incidents > 0 && (
            <Link href="/monitor">
              <Badge tone="danger">
                <AlertTriangle className="size-3.5" />
                {stats.open_incidents} sự cố SOS cần xử lý
              </Badge>
            </Link>
          )}
          {stats && stats.pending_cod_vnd > 0 && (
            <Link href="/cargos/cod-reconcile">
              <Badge tone="warning">
                <Wallet className="size-3.5" />
                COD chờ đối soát:{' '}
                <Money value={stats.pending_cod_vnd} compact />
              </Badge>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className="size-3.5" />}
            onClick={load}
          >
            Làm mới
          </Button>
          <Link href="/dispatch">
            <Button size="sm" leftIcon={<Network className="size-3.5" />}>
              Mở Điều phối thông minh
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards (frame nvDash) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          loading={loading && !stats}
          label="Tổng doanh thu hôm nay"
          value={<Money value={stats?.revenue_today_vnd ?? 0} />}
          icon={<Banknote className="size-4" />}
          delta={stats?.revenue_delta_pct ?? undefined}
          deltaLabel="so với hôm qua"
          trend={revenueTrend}
        />
        <KpiCard
          loading={loading && !stats}
          label="Vé đã bán hôm nay"
          value={`${(stats?.tickets_today ?? 0).toLocaleString('vi-VN')} vé`}
          icon={<Ticket className="size-4" />}
          delta={stats?.tickets_delta_pct ?? undefined}
          deltaLabel={
            stats
              ? `so với hôm qua · ${stats.cancellations_today} vé hủy`
              : 'so với hôm qua'
          }
          trend={ticketTrend}
        />
        <KpiCard
          loading={loading && !stats}
          label="Tỷ lệ lấp đầy ghế"
          value={`${stats?.occupancy_pct ?? 0}%`}
          icon={<Percent className="size-4" />}
          delta={stats ? stats.occupancy_pct - 80 : undefined}
          deltaLabel={`trên ${stats?.trips_today ?? 0} lô chuyến hôm nay`}
        />
        <KpiCard
          loading={loading && !stats}
          label="Xe đang chạy"
          value={
            stats
              ? `${stats.vehicles.in_use} / ${stats.vehicles.total} xe`
              : '0 / 0 xe'
          }
          icon={<Bus className="size-4" />}
          delta={
            stats && stats.vehicles.total > 0
              ? Math.round((stats.vehicles.in_use / stats.vehicles.total) * 100)
              : undefined
          }
          deltaLabel={
            stats
              ? `${stats.vehicles.maintenance} bảo trì · ${availableVehicles} sẵn sàng`
              : undefined
          }
        />
      </div>

      {/* 2 Charts Row (frame nvDash: chartRevenue + chartCostSalary) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Doanh thu theo ngày"
            description={
              <span>
                7 ngày gần nhất · Tổng:{' '}
                <Money
                  value={weekRevenueTotal}
                  className="font-semibold text-brand-fg"
                />
              </span>
            }
            actions={
              <Link
                href="/reports?tab=revenue"
                className="text-xs font-semibold text-brand-fg hover:underline"
              >
                Chi tiết báo cáo →
              </Link>
            }
          />
          {loading && !stats ? (
            <Skeleton className="h-64 w-full" rounded="card" />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartSeries}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={darkTheme.brand}
                        stopOpacity={0.38}
                      />
                      <stop
                        offset="100%"
                        stopColor={darkTheme.brand}
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke={darkTheme.borderSubtle}
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="dateLabel"
                    stroke={darkTheme.fgMuted}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={darkTheme.fgMuted}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1_000_000
                        ? `${(v / 1_000_000).toFixed(0)}tr`
                        : `${(v / 1_000).toFixed(0)}k`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      background: darkTheme.surface2,
                      borderColor: darkTheme.borderStrong,
                      borderRadius: 10,
                      color: darkTheme.fg,
                    }}
                    formatter={(val: unknown) => [
                      `${Number(val ?? 0).toLocaleString('vi-VN')} ₫`,
                      'Doanh thu',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue_vnd"
                    stroke={darkTheme.brand}
                    strokeWidth={2.25}
                    fill="url(#revGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Chi phí phát sinh & thu chi trong tuần"
            description={
              revReport ? (
                <span>
                  Thu ròng:{' '}
                  <Money
                    value={revReport.totals.net_vnd}
                    signed
                    className="font-semibold text-fg"
                  />{' '}
                  · Chi phí:{' '}
                  <Money
                    value={revReport.totals.expense_vnd}
                    className="text-fg-secondary"
                  />
                </span>
              ) : (
                'Đối chiếu tổng thu vé/hàng hóa và chi phí vận hành'
              )
            }
            actions={
              <div className="flex items-center gap-3 text-xs text-fg-secondary">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: categorical[2] }}
                  />
                  Thu (Vé & Hàng)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: categorical[4] }}
                  />
                  Chi phí & Lương
                </span>
              </div>
            }
          />
          {loading && !stats ? (
            <Skeleton className="h-64 w-full" rounded="card" />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    financeSeries.length > 0
                      ? financeSeries
                      : chartSeries.map((c) => ({
                          dateLabel: c.dateLabel,
                          income: c.revenue_vnd,
                          expense: 0,
                        }))
                  }
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke={darkTheme.borderSubtle}
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="dateLabel"
                    stroke={darkTheme.fgMuted}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={darkTheme.fgMuted}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1_000_000
                        ? `${(v / 1_000_000).toFixed(0)}tr`
                        : `${(v / 1_000).toFixed(0)}k`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      background: darkTheme.surface2,
                      borderColor: darkTheme.borderStrong,
                      borderRadius: 10,
                      color: darkTheme.fg,
                    }}
                    formatter={(val: unknown, name: unknown) => [
                      `${Number(val ?? 0).toLocaleString('vi-VN')} ₫`,
                      name === 'income' ? 'Tổng thu' : 'Chi phí & Lương',
                    ]}
                  />
                  <Bar
                    dataKey="income"
                    fill={categorical[2]}
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="expense"
                    fill={categorical[4]}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Upcoming Departures Table */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-fg">
              Lô chuyến sắp khởi hành
            </h2>
            <p className="text-xs text-fg-muted">
              Các khung giờ đang mở bán và chuẩn bị xếp xe điều phối
            </p>
          </div>
          <Link
            href="/settings?tab=time-slots"
            className="text-xs font-semibold text-brand-fg hover:underline"
          >
            Quản lý khung giờ →
          </Link>
        </div>

        <DataTable<TripBatchDto>
          columns={upcomingColumns}
          data={stats?.upcoming}
          rowKey="id"
          loading={loading}
          empty={{
            title: 'Chưa có lô chuyến sắp khởi hành',
            description:
              'Bạn có thể sinh lô chuyến tự động từ Khung giờ trong mục Cấu hình.',
            action: (
              <Link href="/settings?tab=time-slots">
                <Button size="sm">Sinh lô chuyến</Button>
              </Link>
            ),
          }}
        />
      </div>
    </div>
  );
}
