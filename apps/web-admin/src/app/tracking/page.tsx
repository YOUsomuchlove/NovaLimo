'use client';

import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Typography } from 'antd';
import { io, type Socket } from 'socket.io-client';
import { AdminMapPlaceholder, AdminShell } from '@limousine-workspace/shared-ui';
import { getSocketBaseUrl } from '../../lib/api';

export default function TrackingPage() {
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
    socket.on('trip_batch_updated', (payload: unknown) => {
      setLog((l) => [
        ...l,
        `trip_batch_updated: ${JSON.stringify(payload).slice(0, 200)}…`,
      ]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <AdminShell title="Giám sát GPS">
      <Typography.Paragraph type="secondary">
        Lắng nghe sự kiện realtime từ server (namespace{' '}
        <code>/realtime</code>). Vị trí xe trên bản đồ cần luồng dữ liệu từ
        app tài xế — bản đồ đầy đủ sẽ bổ sung sau.
      </Typography.Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Bản đồ (placeholder)">
            <AdminMapPlaceholder />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Socket">
            <Typography.Text>
              Trạng thái:{' '}
              {connected ? (
                <Typography.Text type="success">Đã kết nối</Typography.Text>
              ) : (
                <Typography.Text type="secondary">Đang chờ…</Typography.Text>
              )}
            </Typography.Text>
            <pre className="mt-3 max-h-72 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
              {log.join('\n')}
            </pre>
          </Card>
        </Col>
      </Row>
    </AdminShell>
  );
}
