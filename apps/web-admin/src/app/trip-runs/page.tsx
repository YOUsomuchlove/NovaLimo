'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, Col, Row, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TripRun } from '@limousine-workspace/shared-types';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { getApiBaseUrl } from '../../lib/api';

export default function TripRunsListPage() {
  const [rows, setRows] = useState<TripRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/trip-runs`);
        if (!res.ok) throw new Error('fail');
        const data = (await res.json()) as TripRun[];
        if (!cancelled) setRows(data);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const columns: ColumnsType<TripRun> = [
    {
      title: 'ID',
      dataIndex: 'id',
      ellipsis: true,
      render: (id: string) => id.slice(0, 10) + '…',
    },
    { title: 'Batch', dataIndex: 'trip_batch_id', ellipsis: true },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (s: string) => <Tag>{s}</Tag>,
    },
    {
      title: '',
      key: 'a',
      render: (_, r) => (
        <Link href={`/trip-runs/${r.id}`}>
          <Button size="small" type="link">
            Chi tiết
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <AdminShell title="Chuyến xe">
      <Typography.Paragraph type="secondary">
        Danh sách chuyến (trip_run) trên toàn hệ thống.
      </Typography.Paragraph>
      <div className="hidden md:block">
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={rows}
          pagination={{ pageSize: 8 }}
        />
      </div>
      <Row gutter={[12, 12]} className="mt-4 md:hidden">
        {rows.map((r) => (
          <Col xs={24} key={r.id}>
            <Card size="small">
              <Tag>{r.status}</Tag>
              <Link href={`/trip-runs/${r.id}`}>
                <Button block size="small" type="primary" className="mt-2">
                  Chi tiết
                </Button>
              </Link>
            </Card>
          </Col>
        ))}
      </Row>
    </AdminShell>
  );
}
