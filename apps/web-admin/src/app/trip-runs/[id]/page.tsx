'use client';

import { Card, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../../components/AdminPenMeta';

export default function TripRunDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <AdminShell title={`Chi tiết chuyến · ${id}`}>
      <AdminPenMeta id="nvTripRunDet" name="NovaLimo Admin · Chi tiết Chuyến" />
      <Card className="border-slate-200">
        <Typography.Paragraph>
          <Link href={`/trip-runs/${id}/manifest`}>Phơi lệnh (Manifest)</Link>
          {' · '}
          <Link href={`/trip-runs/${id}/edit`}>Chỉnh sửa</Link>
        </Typography.Paragraph>
      </Card>
    </AdminShell>
  );
}
