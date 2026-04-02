'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Alert,
  Button,
  Card,
  Col,
  Row,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import type { Booking, TripBatch, TripRun } from '@limousine-workspace/shared-types';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { getApiBaseUrl } from '../../../lib/api';

type BoardRow = {
  trip_run: TripRun;
  vehicle_capacity: number;
  bookings: Booking[];
};

type BoardPayload = {
  trip_batch: TripBatch;
  waiting: Booking[];
  runs: BoardRow[];
};

export default function DispatchBoardPage() {
  const params = useParams<{ batchId: string }>();
  const batchId = params.batchId;
  const api = getApiBaseUrl();

  const [batch, setBatch] = useState<TripBatch | null>(null);
  const [waiting, setWaiting] = useState<Booking[]>([]);
  const [runBookings, setRunBookings] = useState<Record<string, Booking[]>>({});
  const [capacities, setCapacities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const dragRef = useRef<{ bookingId: string; from: string } | null>(null);
  const boardRef = useRef({ waiting: [] as Booking[], runBookings: {} as Record<string, Booking[]> });
  useEffect(() => {
    boardRef.current = { waiting, runBookings };
  }, [waiting, runBookings]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api}/trip-batches/${batchId}/dispatch-board`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as BoardPayload;
      setBatch(data.trip_batch);
      setWaiting(data.waiting);
      const rb: Record<string, Booking[]> = {};
      const cap: Record<string, number> = {};
      for (const r of data.runs) {
        rb[r.trip_run.id] = r.bookings;
        cap[r.trip_run.id] = r.vehicle_capacity;
      }
      setRunBookings(rb);
      setCapacities(cap);
    } catch {
      message.error('Không tải được bảng điều phối');
    } finally {
      setLoading(false);
    }
  }, [api, batchId]);

  useEffect(() => {
    void load();
  }, [load]);

  const runIds = useMemo(() => Object.keys(runBookings), [runBookings]);

  const overflow = useMemo(() => {
    const o: string[] = [];
    for (const rid of runIds) {
      const n = runBookings[rid]?.length ?? 0;
      const cap = capacities[rid] ?? 0;
      if (n > cap) o.push(rid);
    }
    return o;
  }, [runIds, runBookings, capacities]);

  function moveTo(bookingId: string, from: string, to: string) {
    const { waiting: w0, runBookings: rb0 } = boardRef.current;
    let booking: Booking | undefined;
    let w = [...w0];
    const rb: Record<string, Booking[]> = {};
    for (const k of Object.keys(rb0)) {
      rb[k] = [...(rb0[k] ?? [])];
    }

    if (from === 'waiting') {
      const ix = w.findIndex((b) => b.id === bookingId);
      if (ix < 0) return;
      booking = w[ix];
      w = w.filter((b) => b.id !== bookingId);
    } else {
      const list = rb[from];
      if (!list) return;
      const ix = list.findIndex((b) => b.id === bookingId);
      if (ix < 0) return;
      booking = list[ix];
      rb[from] = list.filter((b) => b.id !== bookingId);
    }
    if (!booking) return;

    if (to === 'waiting') {
      w = [...w, booking];
    } else {
      rb[to] = [...(rb[to] ?? []), booking];
    }

    setWaiting(w);
    setRunBookings(rb);
  }

  async function finalize() {
    if (overflow.length > 0) {
      message.error('Vượt sức chỗ một hoặc nhiều xe — xử lý trước khi xuất lệnh');
      return;
    }
    if (batch?.status !== 'CLUSTERED') {
      message.error('Batch phải ở trạng thái CLUSTERED');
      return;
    }
    const items: Array<{
      booking_id: string;
      trip_run_id: string;
      pickup_order: number;
      dropoff_order: number;
    }> = [];
    for (const rid of runIds) {
      const list = runBookings[rid] ?? [];
      list.forEach((b, i) => {
        const ord = i + 1;
        items.push({
          booking_id: b.id,
          trip_run_id: rid,
          pickup_order: ord,
          dropoff_order: ord,
        });
      });
    }
    for (const b of waiting) {
      message.warning('Còn khách trong rổ chờ — gán hết sang xe trước khi xuất lệnh');
      return;
    }
    if (items.length === 0) {
      message.error('Không có booking để ghi nhận');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${api}/trip-batches/${batchId}/finalize-dispatch`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      message.success('Đã xuất lệnh');
      await load();
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Lỗi');
    } finally {
      setSaving(false);
    }
  }

  function BookingCard({
    b,
    from,
  }: {
    b: Booking;
    from: string;
  }) {
    return (
      <Card
        size="small"
        className="mb-2 cursor-grab select-none"
        draggable
        onDragStart={(e) => {
          dragRef.current = { bookingId: b.id, from };
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragEnd={() => {
          dragRef.current = null;
        }}
      >
        <Typography.Text strong>{b.passenger_name}</Typography.Text>
        <div className="text-xs text-slate-500">{b.passenger_phone}</div>
        <Tag className="mt-1">{b.seat_label ?? '—'}</Tag>
      </Card>
    );
  }

  function DropZone({
    runId,
    title,
    children,
  }: {
    runId: string;
    title: string;
    children: React.ReactNode;
  }) {
    const cap = capacities[runId] ?? 0;
    const n = (runBookings[runId] ?? []).length;
    const over = n > cap;
    return (
      <Card
        size="small"
        className="min-h-[200px]"
        title={
          <Space>
            <span>{title}</span>
            <Tag color={over ? 'red' : 'blue'}>
              {n}/{cap} khách
            </Tag>
          </Space>
        }
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={() => {
          const d = dragRef.current;
          if (!d) return;
          moveTo(d.bookingId, d.from, runId);
          dragRef.current = null;
        }}
      >
        {children}
      </Card>
    );
  }

  if (loading || !batch) {
    return (
      <AdminShell title="Điều phối">
        <Typography.Text>Đang tải…</Typography.Text>
      </AdminShell>
    );
  }

  return (
    <AdminShell title={`Điều phối — ${batch.route_name}`}>
      <Space className="mb-4">
        <Link href="/dispatch">
          <Button type="link">← Quay lại danh sách</Button>
        </Link>
      </Space>

      {batch.status !== 'CLUSTERED' ? (
        <Alert
          type="warning"
          showIcon
          message="Chưa CLUSTERED — chạy Xếp xe tự động từ trang Điều phối trước."
        />
      ) : null}

      {overflow.length > 0 ? (
        <Alert
          type="error"
          showIcon
          className="mb-4"
          message="Vượt sức chỗ một hoặc nhiều xe — kéo bớt khách sang xe khác hoặc rổ chờ."
        />
      ) : null}

      <Typography.Paragraph type="secondary">
        Kéo thả thẻ khách giữa các cột (HTML5 DnD). Sau đó bấm Xuất lệnh để chốt
        lên server.
      </Typography.Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card
            size="small"
            title="Rổ chờ"
            className="min-h-[200px]"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={() => {
              const d = dragRef.current;
              if (!d) return;
              moveTo(d.bookingId, d.from, 'waiting');
              dragRef.current = null;
            }}
          >
            {waiting.map((b) => (
              <BookingCard key={b.id} b={b} from="waiting" />
            ))}
            {waiting.length === 0 ? (
              <Typography.Text type="secondary">Trống</Typography.Text>
            ) : null}
          </Card>
        </Col>

        {runIds.map((rid) => (
          <Col xs={24} md={9} key={rid}>
            <DropZone runId={rid} title={`Xe ${rid.slice(0, 8)}…`}>
              {(runBookings[rid] ?? []).map((b) => (
                <BookingCard key={b.id} b={b} from={rid} />
              ))}
            </DropZone>
          </Col>
        ))}
      </Row>

      <Button
        type="primary"
        className="mt-6"
        loading={saving}
        disabled={batch.status !== 'CLUSTERED' || overflow.length > 0}
        onClick={() => void finalize()}
      >
        Xuất lệnh
      </Button>
    </AdminShell>
  );
}
