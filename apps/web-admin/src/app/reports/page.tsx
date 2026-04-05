'use client';

import { Card, Tabs, Typography } from 'antd';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../components/AdminPenMeta';

export default function ReportsPage() {
  return (
    <AdminShell title="Báo cáo">
      <AdminPenMeta id="nvRptRevenue" name="Báo cáo — nhóm tab (4 màn pen)" />
      <Tabs
        items={[
          {
            key: 'revenue',
            label: 'Doanh thu',
            children: (
              <Card className="border-slate-200">
                <Typography.Text type="secondary">nvRptRevenue</Typography.Text>
              </Card>
            ),
          },
          {
            key: 'trips',
            label: 'Chuyến',
            children: (
              <Card className="border-slate-200">
                <Typography.Text type="secondary">nvRptTrips</Typography.Text>
              </Card>
            ),
          },
          {
            key: 'drivers',
            label: 'Tài xế',
            children: (
              <Card className="border-slate-200">
                <Typography.Text type="secondary">nvRptDriverPerf</Typography.Text>
              </Card>
            ),
          },
          {
            key: 'cargo',
            label: 'Hàng hóa / COD',
            children: (
              <Card className="border-slate-200">
                <Typography.Text type="secondary">nvRptCargoCod</Typography.Text>
              </Card>
            ),
          },
        ]}
      />
    </AdminShell>
  );
}
