'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, List, Spin, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { Booking, TripRun } from '@limousine-workspace/shared-types';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { getApiBaseUrl } from '../../../lib/api';

type Detail = { trip_run: TripRun; bookings: Booking[] };

export default function TripRunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Detail | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!id) return;
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${getApiBaseUrl()}/trip-runs/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as Detail;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setErr('Không tải được chi tiết chuyến.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <AdminShell title="Chi tiết chuyến">
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => router.push('/trip-runs')}
        style={{ marginBottom: 8 }}
      >
        Về danh sách chuyến
      </Button>

      {loading ? (
        <Spin />
      ) : err ? (
        <Typography.Text type="danger">{err}</Typography.Text>
      ) : data ? (
        <>
          <Card size="small" style={{ marginBottom: 16 }}>
            <Typography.Text>
              Chuyến: <strong>{data.trip_run.id}</strong> — Trạng thái:{' '}
              {data.trip_run.status}
            </Typography.Text>
          </Card>
          <Typography.Title level={5}>Thứ tự đón</Typography.Title>
          <List
            dataSource={data.bookings}
            renderItem={(b) => (
              <List.Item>
                <List.Item.Meta
                  title={`#${b.pickup_order ?? '-'} ${b.passenger_name}`}
                  description={`${b.pickup_address} → ${b.dropoff_address}`}
                />
              </List.Item>
            )}
          />
        </>
      ) : null}
    </AdminShell>
  );
}
