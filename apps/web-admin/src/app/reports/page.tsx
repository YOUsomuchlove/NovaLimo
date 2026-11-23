'use client';

import { categorical, darkTheme } from '@limousine-workspace/design-tokens';
import type { ReportSeriesPoint } from '@limousine-workspace/shared-types';
import {
  Button,
  Card,
  CardHeader,
  DataTable,
  ErrorState,
  Input,
  KpiCard,
  Money,
  SegmentedControl,
  Skeleton,
} from '@limousine-workspace/shared-ui';
import type { ColumnsType } from 'antd/es/table';
import {
  Banknote,
  Bus,
  Download,
  Package,
  RefreshCw,
  Users,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
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
import { AdminShell } from '../../components/shell/AdminShell';
import {
  type CargoReportDto,
  type DriversReportDto,
  type RevenueReportDto,
  type TripsReportDto,
  adminApi,
  exportToCsv,
} from '../../lib/api';

type ReportTab = 'revenue' | 'trips' | 'cargo' | 'drivers';

function defaultRange(daysBack = 14): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime() - daysBack * 86_400_000);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function ReportsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = (searchParams.get('tab') as ReportTab) || 'revenue';
  const [tab, setTab] = useState<ReportTab>(
    ['revenue', 'trips', 'cargo', 'drivers'].includes(initialTab)
      ? initialTab
      : 'revenue',
  );

  const [range, setRange] = useState(() => defaultRange(14));
  const [revData, setRevData] = useState<RevenueReportDto | null>(null);
  const [tripsData, setTripsData] = useState<TripsReportDto | null>(null);
  const [cargoData, setCargoData] = useState<CargoReportDto | null>(null);
  const [driversData, setDriversData] = useState<DriversReportDto | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rev, trp, crg, drv] = await Promise.all([
        adminApi.reportRevenue(range),
        adminApi.reportTrips(range),
        adminApi.reportCargo(range),
        adminApi.reportDrivers(range),
      ]);
      setRevData(rev);
      setTripsData(trp);
      setCargoData(crg);
      setDriversData(drv);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleExport = () => {
    if (tab === 'revenue' && revData) {
      exportToCsv('novalimo-report-revenue.csv', revData.series, [
        { header: 'Ngày', value: (r) => String(r.date) },
        { header: 'Doanh thu vé', value: (r) => Number(r.tickets ?? 0) },
        { header: 'Hàng hóa & COD', value: (r) => Number(r.cargo ?? 0) },
        { header: 'Thu khác', value: (r) => Number(r.other ?? 0) },
        { header: 'Chi phí', value: (r) => Number(r.expense ?? 0) },
      ]);
    } else if (tab === 'trips' && tripsData) {
      exportToCsv('novalimo-report-trips.csv', tripsData.series, [
        { header: 'Ngày', value: (r) => String(r.date) },
        { header: 'Số lô chuyến', value: (r) => Number(r.departures ?? 0) },
        { header: 'Chuyến hoàn thành', value: (r) => Number(r.runs ?? 0) },
        { header: 'Hành khách', value: (r) => Number(r.passengers ?? 0) },
        { header: 'Lấp đầy (%)', value: (r) => r.occupancy_pct },
      ]);
    } else if (tab === 'cargo' && cargoData) {
      exportToCsv('novalimo-report-cargo.csv', cargoData.series, [
        { header: 'Ngày', value: (r) => String(r.date) },
        { header: 'Tổng vận đơn', value: (r) => Number(r.orders ?? 0) },
        { header: 'Đã giao', value: (r) => Number(r.delivered ?? 0) },
        { header: 'Cước phí VND', value: (r) => Number(r.fees ?? 0) },
        {
          header: 'COD đã thu VND',
          value: (r) => Number(r.cod_collected ?? 0),
        },
      ]);
    } else if (tab === 'drivers' && driversData) {
      exportToCsv('novalimo-report-drivers.csv', driversData.drivers, [
        { header: 'Tài xế', value: (r) => r.full_name },
        { header: 'Chuyến hoàn thành', value: (r) => r.runs },
        { header: 'Khách đã trả', value: (r) => r.passengers },
        { header: 'Kiện hàng đã giao', value: (r) => r.cargos },
        { header: 'Khách không đến', value: (r) => r.no_shows },
        { header: 'Sự cố', value: (r) => r.incidents },
      ]);
    }
  };

  const revColumns: ColumnsType<ReportSeriesPoint> = useMemo(
    () => [
      { title: 'Ngày', dataIndex: 'date', key: 'date' },
      {
        title: 'Doanh thu vé',
        key: 'tickets',
        render: (_, r) => <Money value={Number(r.tickets ?? 0)} />,
      },
      {
        title: 'Cước hàng & COD',
        key: 'cargo',
        render: (_, r) => <Money value={Number(r.cargo ?? 0)} />,
      },
      {
        title: 'Chi phí vận hành',
        key: 'expense',
        render: (_, r) => (
          <Money
            value={-Number(r.expense ?? 0)}
            signed
            className="text-danger-fg"
          />
        ),
      },
    ],
    [],
  );

  const driverColumns: ColumnsType<DriversReportDto['drivers'][number]> =
    useMemo(
      () => [
        {
          title: 'Tài xế',
          dataIndex: 'full_name',
          key: 'full_name',
          render: (n: string) => (
            <span className="font-semibold text-fg">{n}</span>
          ),
        },
        {
          title: 'Chuyến hoàn thành',
          dataIndex: 'runs',
          key: 'runs',
          render: (v: number) => (
            <span className="font-mono font-bold text-brand-fg">
              {v} chuyến
            </span>
          ),
        },
        {
          title: 'Hành khách phục vụ',
          dataIndex: 'passengers',
          key: 'passengers',
          render: (v: number) => `${v} khách`,
        },
        {
          title: 'Kiện hàng đã giao',
          dataIndex: 'cargos',
          key: 'cargos',
          render: (v: number) => `${v} kiện`,
        },
        {
          title: 'No-show / Sự cố',
          key: 'inc',
          render: (_, r) => (
            <span className="text-xs text-fg-secondary">
              {r.no_shows} no-show · {r.incidents} sự cố
            </span>
          ),
        },
      ],
      [],
    );

  return (
    <div className="flex flex-col gap-6">
      {/* Top 4-Tab Bar & Date Range Filter (frames nvRptRevenue / nvRptTrips / nvRptCargoCod / nvRptDriverPerf) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SegmentedControl<ReportTab>
          ariaLabel="Loại báo cáo"
          value={tab}
          onChange={(next) => {
            setTab(next);
            router.replace(`/reports?tab=${next}`);
          }}
          options={[
            {
              value: 'revenue',
              label: 'Báo cáo Doanh thu',
              icon: <Banknote className="size-4" />,
            },
            {
              value: 'trips',
              label: 'Báo cáo Chuyến',
              icon: <Bus className="size-4" />,
            },
            {
              value: 'cargo',
              label: 'Hàng hóa / COD',
              icon: <Package className="size-4" />,
            },
            {
              value: 'drivers',
              label: 'Hiệu suất Tài xế',
              icon: <Users className="size-4" />,
            },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={range.from}
            onChange={(e) => setRange({ ...range, from: e.target.value })}
            className="w-40"
          />
          <span className="text-xs text-fg-muted">đến</span>
          <Input
            type="date"
            value={range.to}
            onChange={(e) => setRange({ ...range, to: e.target.value })}
            className="w-40"
          />
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="size-3.5" />}
            onClick={handleExport}
          >
            Xuất Excel / CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className="size-3.5" />}
            onClick={load}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {error ? (
        <Card>
          <ErrorState onRetry={load} />
        </Card>
      ) : loading ? (
        <Skeleton className="h-96 w-full" rounded="card" />
      ) : (
        <>
          {/* TAB 1: REVENUE (nvRptRevenue) */}
          {tab === 'revenue' && revData && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  label="Tổng thu trong kỳ"
                  value={<Money value={revData.totals.income_vnd} />}
                  icon={<Banknote className="size-4" />}
                />
                <KpiCard
                  label="Doanh thu vé hành khách"
                  value={<Money value={revData.totals.tickets_vnd} />}
                />
                <KpiCard
                  label="Doanh thu Hàng hóa & COD"
                  value={<Money value={revData.totals.cargo_vnd} />}
                />
                <KpiCard
                  label="Lợi nhuận ròng (Thu - Chi)"
                  value={<Money value={revData.totals.net_vnd} signed />}
                />
              </div>

              <Card>
                <CardHeader
                  title="Biểu đồ Doanh thu & Chi phí theo ngày (nvRptRevenue)"
                  description={`Từ ${range.from} đến ${range.to}`}
                />
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revData.series}>
                      <CartesianGrid
                        stroke={darkTheme.borderSubtle}
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        stroke={darkTheme.fgMuted}
                        fontSize={12}
                      />
                      <YAxis
                        stroke={darkTheme.fgMuted}
                        fontSize={12}
                        tickFormatter={(v: number) =>
                          `${(v / 1_000_000).toFixed(0)}tr`
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          background: darkTheme.surface2,
                          borderColor: darkTheme.borderStrong,
                          borderRadius: 10,
                        }}
                      />
                      <Bar
                        dataKey="tickets"
                        name="Vé hành khách"
                        fill={darkTheme.brand}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="cargo"
                        name="Hàng hóa & COD"
                        fill={categorical[1]}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="expense"
                        name="Chi phí"
                        fill={categorical[4]}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <DataTable<ReportSeriesPoint>
                columns={revColumns}
                data={revData.series}
                rowKey="date"
              />
            </div>
          )}

          {/* TAB 2: TRIPS (nvRptTrips) */}
          {tab === 'trips' && tripsData && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <KpiCard
                  label="Tổng chuyến hoàn thành"
                  value={String(
                    tripsData.series.reduce(
                      (s, p) => s + Number(p.runs ?? 0),
                      0,
                    ),
                  )}
                  icon={<Bus className="size-4" />}
                />
                <KpiCard
                  label="Tổng lượt khách vận chuyển"
                  value={`${tripsData.series.reduce((s, p) => s + Number(p.passengers ?? 0), 0)} khách`}
                  icon={<Users className="size-4" />}
                />
                <KpiCard
                  label="Tuyến đông khách nhất"
                  value={tripsData.routes[0]?.name ?? '—'}
                />
              </div>

              <Card>
                <CardHeader title="Biểu đồ Lượt khách & Tỷ lệ lấp đầy (nvRptTrips)" />
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={tripsData.series}>
                      <CartesianGrid
                        stroke={darkTheme.borderSubtle}
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        stroke={darkTheme.fgMuted}
                        fontSize={12}
                      />
                      <YAxis stroke={darkTheme.fgMuted} fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: darkTheme.surface2,
                          borderColor: darkTheme.borderStrong,
                          borderRadius: 10,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="passengers"
                        name="Hành khách"
                        stroke={darkTheme.brand}
                        fill={darkTheme.brandSubtle}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: CARGO & COD (nvRptCargoCod) */}
          {tab === 'cargo' && cargoData && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <KpiCard
                  label="Tổng vận đơn ký gửi"
                  value={`${cargoData.series.reduce((s, p) => s + Number(p.orders ?? 0), 0)} kiện`}
                  icon={<Package className="size-4" />}
                />
                <KpiCard
                  label="Tổng cước vận chuyển"
                  value={
                    <Money
                      value={cargoData.series.reduce(
                        (s, p) => s + Number(p.fees ?? 0),
                        0,
                      )}
                    />
                  }
                />
                <KpiCard
                  label="Tổng COD đã thu hộ"
                  value={
                    <Money
                      value={cargoData.series.reduce(
                        (s, p) => s + Number(p.cod_collected ?? 0),
                        0,
                      )}
                    />
                  }
                />
              </div>

              <Card>
                <CardHeader title="Biểu đồ Cước vận chuyển & COD thu hộ (nvRptCargoCod)" />
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cargoData.series}>
                      <CartesianGrid
                        stroke={darkTheme.borderSubtle}
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        stroke={darkTheme.fgMuted}
                        fontSize={12}
                      />
                      <YAxis stroke={darkTheme.fgMuted} fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: darkTheme.surface2,
                          borderColor: darkTheme.borderStrong,
                          borderRadius: 10,
                        }}
                      />
                      <Bar
                        dataKey="fees"
                        name="Cước vận chuyển"
                        fill={darkTheme.brand}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="cod_collected"
                        name="COD đã thu"
                        fill={categorical[2]}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 4: DRIVERS PERFORMANCE (nvRptDriverPerf) */}
          {tab === 'drivers' && driversData && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <KpiCard
                  label="Tài xế dẫn đầu kỳ này"
                  value={driversData.drivers[0]?.full_name ?? '—'}
                  icon={<Users className="size-4" />}
                />
                <KpiCard
                  label="Số chuyến của Top Driver"
                  value={`${driversData.drivers[0]?.runs ?? 0} chuyến`}
                />
                <KpiCard
                  label="Tổng số tài xế hoạt động"
                  value={`${driversData.drivers.length} tài xế`}
                />
              </div>

              <DataTable<DriversReportDto['drivers'][number]>
                columns={driverColumns}
                data={driversData.drivers}
                rowKey="id"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <AdminShell
      title="Báo cáo & Phân tích"
      subtitle="Báo cáo Doanh thu · Chuyến · Hàng hóa/COD · Hiệu suất Tài xế"
    >
      <Suspense fallback={null}>
        <ReportsContent />
      </Suspense>
    </AdminShell>
  );
}
