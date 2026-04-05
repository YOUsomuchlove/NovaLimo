'use client';

import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Typography } from 'antd';
import { RealtimeEvents } from '@limousine-workspace/utils-core';
import { io, type Socket } from 'socket.io-client';
import { AdminMapPlaceholder, AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../components/AdminPenMeta';
import { getSocketBaseUrl } from '../../lib/api';

export default function MonitorPage() {
  const [log, setLog] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket: Socket = io(`${getSocketBaseUrl()}/realtime`, {
      transports: ['websocket'],
    });
    socket.on('connect', () => {
      setConnected(true);
      setLog((l) => [...l, 'Đã kết nối Socket.io /realtime']);
    });
    socket.on('disconnect', () => {
      setConnected(false);
      setLog((l) => [...l, 'Ngắt kết nối']);
    });
    const push = (label: string, payload: unknown) =>
      setLog((l) => [
        ...l,
        `${label}: ${JSON.stringify(payload).slice(0, 200)}…`,
      ]);
    socket.on(RealtimeEvents.tripBatchUpdated, (payload: unknown) => {
      push(RealtimeEvents.tripBatchUpdated, payload);
    });
    socket.on(RealtimeEvents.tripRunUpdated, (payload: unknown) => {
      push(RealtimeEvents.tripRunUpdated, payload);
    });
    socket.on(RealtimeEvents.bookingStatusChanged, (payload: unknown) => {
      push(RealtimeEvents.bookingStatusChanged, payload);
    });
    socket.on(RealtimeEvents.driverLocation, (payload: unknown) => {
      push(RealtimeEvents.driverLocation, payload);
    });
    socket.on(RealtimeEvents.driverChat, (payload: unknown) => {
      push(RealtimeEvents.driverChat, payload);
    });
    socket.on(RealtimeEvents.shiftStarted, (payload: unknown) => {
      push(RealtimeEvents.shiftStarted, payload);
    });
    socket.on(RealtimeEvents.shiftEnded, (payload: unknown) => {
      push(RealtimeEvents.shiftEnded, payload);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <AdminShell title="Giám sát">
      <AdminPenMeta id="nvGsMap" name="NovaLimo Admin · Giám sát Hành trình (Command Center)" />
      <Typography.Paragraph type="secondary" className="max-w-3xl">
        Lắng nghe sự kiện realtime từ server (namespace{' '}
        <code className="rounded bg-slate-200 px-1">/realtime</code>). Vị trí xe trên bản đồ cần luồng
        dữ liệu từ app tài xế — bản đồ đầy đủ sẽ bổ sung sau.
      </Typography.Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Bản đồ (placeholder)" className="min-w-0">
            <div className="min-h-[240px] w-full min-w-0">
              <AdminMapPlaceholder />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Socket" className="min-w-0">
            <Typography.Text>
              Trạng thái:{' '}
              {connected ? (
                <Typography.Text type="success">Đã kết nối</Typography.Text>
              ) : (
                <Typography.Text type="secondary">Đang chờ…</Typography.Text>
              )}
            </Typography.Text>
            <pre className="mt-3 max-h-72 overflow-auto rounded bg-[#0B1020] p-3 text-xs text-slate-100">
              {log.join('\n')}
            </pre>
          </Card>
        </Col>
      </Row>
    </AdminShell>
  );
}
