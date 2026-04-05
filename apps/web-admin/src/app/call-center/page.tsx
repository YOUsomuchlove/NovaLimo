'use client';

import { Card, Tabs, Typography } from 'antd';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../components/AdminPenMeta';

export default function CallCenterPage() {
  return (
    <AdminShell title="Tổng đài / CS">
      <AdminPenMeta id="nvCcCreateBooking" name="Tổng đài — nhóm màn (tabs)" />
      <Tabs
        items={[
          {
            key: 'create',
            label: 'Tạo vé thủ công',
            children: (
              <Card className="border-slate-200">
                <Typography.Text type="secondary">
                  Frame <code className="font-mono">nvCcCreateBooking</code>
                </Typography.Text>
              </Card>
            ),
          },
          {
            key: 'requests',
            label: 'Yêu cầu / CS',
            children: (
              <Card className="border-slate-200">
                <Typography.Text type="secondary">
                  Frame <code className="font-mono">nvCcRequests</code>
                </Typography.Text>
              </Card>
            ),
          },
          {
            key: 'inbox',
            label: 'Hộp thư hỗ trợ',
            children: (
              <Card className="border-slate-200">
                <Typography.Text type="secondary">
                  Frame <code className="font-mono">nvCcSupportInbox</code>
                </Typography.Text>
              </Card>
            ),
          },
        ]}
      />
    </AdminShell>
  );
}
