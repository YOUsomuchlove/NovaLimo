'use client';

import { Card, Tabs, Typography } from 'antd';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../components/AdminPenMeta';

export default function SettingsPage() {
  return (
    <AdminShell title="Cấu hình">
      <AdminPenMeta id="nvCfgRoutesStops" name="Cấu hình — nhóm tab (5 màn pen)" />
      <Tabs
        items={[
          {
            key: 'routes',
            label: 'Tuyến / điểm',
            children: (
              <Card className="border-slate-200">
                <Typography.Text type="secondary">nvCfgRoutesStops</Typography.Text>
              </Card>
            ),
          },
          {
            key: 'slots',
            label: 'Khung giờ',
            children: (
              <Card className="border-slate-200">
                <Typography.Text type="secondary">nvCfgTimeSlots</Typography.Text>
              </Card>
            ),
          },
          {
            key: 'pricing',
            label: 'Giá',
            children: (
              <Card className="border-slate-200">
                <Typography.Text type="secondary">nvCfgPricing</Typography.Text>
              </Card>
            ),
          },
          {
            key: 'cod',
            label: 'COD',
            children: (
              <Card className="border-slate-200">
                <Typography.Text type="secondary">nvCfgCodPolicy</Typography.Text>
              </Card>
            ),
          },
          {
            key: 'notifications',
            label: 'Thông báo',
            children: (
              <Card className="border-slate-200">
                <Typography.Text type="secondary">nvCfgNotifications</Typography.Text>
              </Card>
            ),
          },
        ]}
      />
    </AdminShell>
  );
}
