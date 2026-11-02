import type {
  DashboardStatsDto,
  ReportSeriesPoint,
} from '@limousine-workspace/shared-types';
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { IsDateString } from 'class-validator';
import type { DataSource } from 'typeorm';
import { DomainError } from '../../common/http/exception.filter';
import { addDays, vnDateString, vnDayRange } from '../../common/time';
import { TripsService } from '../trips/trips.service';

export class RangeQuery {
  @ApiProperty({ example: '2026-11-01' }) @IsDateString() from!: string;
  @ApiProperty({ example: '2026-11-30' }) @IsDateString() to!: string;
}

const TZ = `'Asia/Ho_Chi_Minh'`;
const pct = (now: number, before: number) =>
  before > 0 ? Math.round(((now - before) / before) * 1000) / 10 : null;

/** Read-only aggregates for the dashboard and the four report screens (SQL, VN calendar days). */
@Injectable()
export class ReportsService {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    private readonly trips: TripsService,
  ) {}

  private range(q: RangeQuery) {
    const fromDate = q.from.slice(0, 10);
    const toDate = q.to.slice(0, 10);
    if (toDate < fromDate)
      throw new DomainError(400, 'BAD_RANGE', 'Khoảng ngày không hợp lệ');
    if ((+new Date(toDate) - +new Date(fromDate)) / 86_400_000 > 366)
      throw new DomainError(400, 'RANGE_TOO_LONG', 'Tối đa 1 năm');
    return {
      from: vnDayRange(fromDate).from,
      to: vnDayRange(toDate).to,
      fromDate,
      toDate,
    };
  }

  /** Fill missing days with zeros so charts have a continuous axis. */
  private fill(
    rows: ReportSeriesPoint[],
    fromDate: string,
    toDate: string,
    keys: string[],
  ): ReportSeriesPoint[] {
    const byDate = new Map(rows.map((r) => [r.date, r]));
    const out: ReportSeriesPoint[] = [];
    for (let d = fromDate; d <= toDate; d = addDays(d, 1)) {
      const r = byDate.get(d);
      out.push({
        date: d,
        ...Object.fromEntries(keys.map((k) => [k, Number(r?.[k] ?? 0)])),
      });
    }
    return out;
  }

  async dashboard(): Promise<DashboardStatsDto> {
    const today = vnDateString();
    const yesterday = addDays(today, -1);
    const t = vnDayRange(today);
    const y = vnDayRange(yesterday);

    const money = async (from: Date, to: Date) => {
      const [r] = await this.db.query(
        `SELECT COALESCE(SUM(amount_vnd) FILTER (WHERE kind = 'INCOME'), 0)::bigint AS revenue FROM finance_transactions WHERE occurred_at >= $1 AND occurred_at < $2`,
        [from, to],
      );
      return Number(r.revenue);
    };
    const tickets = async (from: Date, to: Date) => {
      const [r] = await this.db.query(
        `SELECT COUNT(s.id)::int AS n FROM booking_seats s JOIN bookings b ON b.id = s.booking_id
          WHERE s.is_active AND b.created_at >= $1 AND b.created_at < $2`,
        [from, to],
      );
      return Number(r.n);
    };

    const [revToday, revYesterday, tixToday, tixYesterday] = await Promise.all([
      money(t.from, t.to),
      money(y.from, y.to),
      tickets(t.from, t.to),
      tickets(y.from, y.to),
    ]);

    const [ops] = await this.db.query(
      `SELECT
         (SELECT COUNT(*)::int FROM trip_batches WHERE departure_at >= $1 AND departure_at < $2 AND status <> 'CANCELLED') AS trips_today,
         (SELECT COUNT(*)::int FROM trip_runs WHERE status = 'IN_PROGRESS') AS runs_in_progress,
         (SELECT COUNT(*)::int FROM vehicles WHERE deleted_at IS NULL) AS v_total,
         (SELECT COUNT(*)::int FROM vehicles WHERE deleted_at IS NULL AND status = 'IN_USE') AS v_in_use,
         (SELECT COUNT(*)::int FROM vehicles WHERE deleted_at IS NULL AND status = 'MAINTENANCE') AS v_maint,
         (SELECT COUNT(*)::int FROM bookings WHERE cancelled_at >= $1 AND cancelled_at < $2) AS cancellations,
         (SELECT COUNT(*)::int FROM incidents WHERE status <> 'RESOLVED') AS open_incidents,
         (SELECT COALESCE(SUM(cod_amount_vnd), 0)::bigint FROM cargos WHERE cod_amount_vnd > 0 AND cod_collected_at IS NOT NULL AND cod_settlement_id IS NULL) AS pending_cod`,
      [t.from, t.to],
    );
    const [occ] = await this.db.query(
      `SELECT COALESCE(SUM(sold), 0)::int AS sold, COALESCE(SUM(total), 0)::int AS total FROM (
         SELECT (SELECT COUNT(*) FROM booking_seats s WHERE s.trip_batch_id = tb.id AND s.is_active) AS sold,
                vt.capacity * tb.planned_vehicles AS total
           FROM trip_batches tb JOIN vehicle_types vt ON vt.id = tb.vehicle_type_id
          WHERE tb.departure_at >= $1 AND tb.departure_at < $2 AND tb.status <> 'CANCELLED') x`,
      [t.from, t.to],
    );
    const weekFrom = addDays(today, -6);
    const series = await this.db.query(
      `SELECT to_char(d, 'YYYY-MM-DD') AS date,
              COALESCE((SELECT SUM(amount_vnd) FROM finance_transactions f WHERE f.kind = 'INCOME' AND (f.occurred_at AT TIME ZONE ${TZ})::date = d), 0)::bigint AS revenue_vnd,
              COALESCE((SELECT COUNT(*) FROM booking_seats s JOIN bookings b ON b.id = s.booking_id WHERE s.is_active AND (b.created_at AT TIME ZONE ${TZ})::date = d), 0)::int AS tickets
         FROM generate_series($1::date, $2::date, interval '1 day') d`,
      [weekFrom, today],
    );
    const upcoming = await this.trips.list({
      page: 1,
      limit: 6,
      from: today,
      to: addDays(today, 1),
      status: 'OPEN',
    } as never);

    return {
      date: today,
      revenue_today_vnd: revToday,
      revenue_delta_pct: pct(revToday, revYesterday),
      tickets_today: tixToday,
      tickets_delta_pct: pct(tixToday, tixYesterday),
      trips_today: ops.trips_today,
      runs_in_progress: ops.runs_in_progress,
      vehicles: {
        total: ops.v_total,
        in_use: ops.v_in_use,
        maintenance: ops.v_maint,
      },
      occupancy_pct: occ.total
        ? Math.round((occ.sold / occ.total) * 1000) / 10
        : 0,
      cancellations_today: ops.cancellations,
      open_incidents: ops.open_incidents,
      pending_cod_vnd: Number(ops.pending_cod),
      revenue_last_7_days: series.map(
        (r: { date: string; revenue_vnd: string; tickets: number }) => ({
          date: r.date,
          revenue_vnd: Number(r.revenue_vnd),
          tickets: r.tickets,
        }),
      ),
      upcoming: upcoming.items.filter(
        (b) => new Date(b.departure_at) > new Date(),
      ),
    };
  }

  /** Revenue by day: ticket income, cargo/COD income, expenses. */
  async revenue(q: RangeQuery) {
    const r = this.range(q);
    const rows = await this.db.query(
      `SELECT to_char(occurred_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS date,
              SUM(amount_vnd) FILTER (WHERE kind = 'INCOME' AND category = 'TICKET') AS tickets,
              SUM(amount_vnd) FILTER (WHERE kind = 'INCOME' AND category IN ('CARGO', 'COD')) AS cargo,
              SUM(amount_vnd) FILTER (WHERE kind = 'INCOME' AND category NOT IN ('TICKET', 'CARGO', 'COD')) AS other,
              SUM(amount_vnd) FILTER (WHERE kind = 'EXPENSE') AS expense
         FROM finance_transactions WHERE occurred_at >= $1 AND occurred_at < $2 GROUP BY 1`,
      [r.from, r.to],
    );
    const series = this.fill(rows, r.fromDate, r.toDate, [
      'tickets',
      'cargo',
      'other',
      'expense',
    ]);
    const total = (k: string) => series.reduce((s, p) => s + Number(p[k]), 0);
    const income = total('tickets') + total('cargo') + total('other');
    return {
      series,
      totals: {
        tickets_vnd: total('tickets'),
        cargo_vnd: total('cargo'),
        other_vnd: total('other'),
        income_vnd: income,
        expense_vnd: total('expense'),
        net_vnd: income - total('expense'),
      },
    };
  }

  /** Trips by day: departures, runs, passengers, occupancy. Plus top routes. */
  async tripsReport(q: RangeQuery) {
    const r = this.range(q);
    const rows = await this.db.query(
      `WITH b AS (
         SELECT (tb.departure_at AT TIME ZONE ${TZ})::date AS d,
                vt.capacity * tb.planned_vehicles AS capacity,
                (SELECT COUNT(*) FROM booking_seats s WHERE s.trip_batch_id = tb.id AND s.is_active) AS passengers,
                (SELECT COUNT(*) FROM trip_runs tr WHERE tr.trip_batch_id = tb.id AND tr.status = 'FINISHED') AS runs
           FROM trip_batches tb JOIN vehicle_types vt ON vt.id = tb.vehicle_type_id
          WHERE tb.departure_at >= $1 AND tb.departure_at < $2 AND tb.status <> 'CANCELLED')
       SELECT to_char(d, 'YYYY-MM-DD') AS date, COUNT(*) AS departures, SUM(runs) AS runs,
              SUM(passengers) AS passengers, SUM(capacity) AS capacity
         FROM b GROUP BY d`,
      [r.from, r.to],
    );
    const series = this.fill(rows, r.fromDate, r.toDate, [
      'departures',
      'runs',
      'passengers',
      'capacity',
    ]).map((p) => ({
      ...p,
      occupancy_pct: Number(p.capacity)
        ? Math.round((Number(p.passengers) / Number(p.capacity)) * 1000) / 10
        : 0,
    }));
    const routes = await this.db.query(
      `SELECT r.id, r.name, COUNT(s.id)::int AS passengers, COALESCE(SUM(s.price_vnd), 0)::bigint AS revenue_vnd
         FROM routes r
         JOIN trip_batches tb ON tb.route_id = r.id AND tb.departure_at >= $1 AND tb.departure_at < $2
         JOIN booking_seats s ON s.trip_batch_id = tb.id AND s.is_active
        GROUP BY r.id, r.name ORDER BY passengers DESC LIMIT 10`,
      [r.from, r.to],
    );
    return {
      series,
      routes: routes.map((x: { revenue_vnd: string }) => ({
        ...x,
        revenue_vnd: Number(x.revenue_vnd),
      })),
    };
  }

  /** Cargo by day: orders, delivered, fees, COD collected. */
  async cargo(q: RangeQuery) {
    const r = this.range(q);
    const rows = await this.db.query(
      `SELECT to_char(created_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS date,
              COUNT(*) AS orders,
              COUNT(*) FILTER (WHERE status = 'DELIVERED') AS delivered,
              COALESCE(SUM(fee_vnd) FILTER (WHERE status <> 'CANCELLED'), 0) AS fees,
              COALESCE(SUM(cod_amount_vnd) FILTER (WHERE cod_collected_at IS NOT NULL), 0) AS cod_collected
         FROM cargos WHERE created_at >= $1 AND created_at < $2 GROUP BY 1`,
      [r.from, r.to],
    );
    return {
      series: this.fill(rows, r.fromDate, r.toDate, [
        'orders',
        'delivered',
        'fees',
        'cod_collected',
      ]),
    };
  }

  /** Per-driver performance in the period. */
  async drivers(q: RangeQuery) {
    const r = this.range(q);
    const rows = await this.db.query(
      `SELECT u.id, u.full_name,
              COUNT(DISTINCT tr.id) FILTER (WHERE tr.status = 'FINISHED')::int AS runs,
              COUNT(s.id) FILTER (WHERE b.status = 'DROPPED_OFF')::int AS passengers,
              COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'NO_SHOW')::int AS no_shows,
              (SELECT COUNT(*)::int FROM cargos c JOIN trip_runs r2 ON r2.id = c.trip_run_id WHERE r2.driver_id = u.id AND c.status = 'DELIVERED' AND c.delivered_at >= $1 AND c.delivered_at < $2) AS cargos,
              (SELECT COUNT(*)::int FROM incidents i WHERE i.driver_id = u.id AND i.created_at >= $1 AND i.created_at < $2) AS incidents
         FROM users u
         LEFT JOIN trip_runs tr ON tr.driver_id = u.id AND tr.finished_at >= $1 AND tr.finished_at < $2
         LEFT JOIN bookings b ON b.trip_run_id = tr.id
         LEFT JOIN booking_seats s ON s.booking_id = b.id AND s.is_active
        WHERE u.kind = 'DRIVER' AND u.deleted_at IS NULL
        GROUP BY u.id, u.full_name ORDER BY runs DESC, passengers DESC`,
      [r.from, r.to],
    );
    return { drivers: rows };
  }
}
