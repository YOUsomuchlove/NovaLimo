'use client';

import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { getApiBaseUrl } from '../../lib/api';

type Stats = {
  trip_batches_open: number;
  trip_batches_clustered: number;
  trip_runs_in_progress: number;
  bookings_total: number;
  revenue_paid_vnd: number;
  vehicles_available: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/admin/stats`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Stats;
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setErr('Không tải được thống kê.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = stats
    ? [
        { name: 'OPEN', value: stats.trip_batches_open },
        { name: 'CLUSTERED', value: stats.trip_batches_clustered },
        { name: 'Runs chạy', value: stats.trip_runs_in_progress },
      ]
    : [];

  return (
    <AdminShell title="Dashboard">
      <Typography.Title level={4} className="!mt-0">
        Tổng quan vận hành
      </Typography.Title>
      {err ? (
        <Typography.Text type="danger">{err}</Typography.Text>
      ) : null}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Khung giờ mở (OPEN)"
              value={stats?.trip_batches_open ?? '—'}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Đã xếp (CLUSTERED)"
              value={stats?.trip_batches_clustered ?? '—'}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Chuyến đang chạy"
              value={stats?.trip_runs_in_progress ?? '—'}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic title="Tổng vé" value={stats?.bookings_total ?? '—'} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Doanh thu đã thu (PAID)"
              value={(stats?.revenue_paid_vnd ?? 0).toLocaleString('vi-VN')}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Xe sẵn sàng"
              value={stats?.vehicles_available ?? '—'}
            />
          </Card>
        </Col>
      </Row>

      <Card className="mt-6" title="Phân bổ trạng thái (demo chart)">
        <div className="h-64 min-h-[256px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#1677ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </AdminShell>
  );
}
