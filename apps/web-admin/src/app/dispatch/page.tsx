'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  Col,
  Row,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TripBatch } from '@limousine-workspace/shared-types';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { getApiBaseUrl } from '../../lib/api';

function useIsMobileLg() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 991.98px)');
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

export default function DispatchPage() {
  const isMobile = useIsMobileLg();
  const api = getApiBaseUrl();
  const [batches, setBatches] = useState<TripBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [clustering, setClustering] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api}/trip-batches`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as TripBatch[];
      setBatches(data);
    } catch {
      message.error('Không tải được danh sách khung giờ.');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCluster(id: string) {
    setClustering(id);
    try {
      const res = await fetch(`${api}/trip-batches/${id}/cluster`, {
        method: 'POST',
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      message.success('Xếp xe thành công');
      await load();
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Xếp xe thất bại');
    } finally {
      setClustering(null);
    }
  }

  const columns: ColumnsType<TripBatch & { key: string }> = [
    { title: 'Tuyến', dataIndex: 'route_name', key: 'route' },
    {
      title: 'Giờ xuất phát',
      key: 'dep',
      render: (_, r) => new Date(r.departure_time).toLocaleString('vi-VN'),
    },
    { title: 'Trạng thái', dataIndex: 'status', width: 120 },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 280,
      render: (_, r) => (
        <Space wrap>
          {r.status === 'OPEN' ? (
            <Button
              type="primary"
              size="small"
              loading={clustering === r.id}
              onClick={() => onCluster(r.id)}
            >
              Xếp xe tự động
            </Button>
          ) : null}
          {r.status === 'CLUSTERED' ? (
            <Link href={`/dispatch/${r.id}`}>
              <Button size="small">Kéo thả / Xuất lệnh</Button>
            </Link>
          ) : null}
        </Space>
      ),
    },
  ];

  const dataSource = useMemo(
    () => batches.map((b) => ({ ...b, key: b.id })),
    [batches],
  );

  return (
    <AdminShell title="Điều phối — Khung giờ">
      <Typography.Paragraph type="secondary">
        Chọn khung giờ OPEN để chạy thuật toán xếp xe. Sau khi CLUSTERED, mở bảng
        kéo thả để chỉnh và chốt lệnh.
      </Typography.Paragraph>

      <Card>
        <Space style={{ marginBottom: 12 }}>
          <Button size="small" onClick={() => void load()}>
            Làm mới
          </Button>
        </Space>

        {isMobile ? (
          <Row gutter={[12, 12]}>
            {dataSource.map((x) => (
              <Col xs={24} key={x.key}>
                <Card size="small">
                  <Typography.Text strong>{x.route_name}</Typography.Text>
                  <div className="mt-2 flex justify-between">
                    <Typography.Text type="secondary">
                      {new Date(x.departure_time).toLocaleString('vi-VN')}
                    </Typography.Text>
                    <Typography.Text>{x.status}</Typography.Text>
                  </div>
                  <Space className="mt-2" wrap>
                    {x.status === 'OPEN' ? (
                      <Button
                        type="primary"
                        block
                        loading={clustering === x.id}
                        onClick={() => onCluster(x.id)}
                      >
                        Xếp xe tự động
                      </Button>
                    ) : null}
                    {x.status === 'CLUSTERED' ? (
                      <Link href={`/dispatch/${x.id}`} className="block w-full">
                        <Button block size="small">
                          Kéo thả / Xuất lệnh
                        </Button>
                      </Link>
                    ) : null}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Table
            size="middle"
            loading={loading}
            columns={columns}
            dataSource={dataSource}
            pagination={{ pageSize: 8 }}
          />
        )}
      </Card>
    </AdminShell>
  );
}
