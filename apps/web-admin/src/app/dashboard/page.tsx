'use client';

import { Card, Col, Row, Statistic } from 'antd';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../components/AdminPenMeta';

export default function DashboardPage() {
  return (
    <AdminShell title="Dashboard">
      <AdminPenMeta id="nvDash" name="NovaLimo Admin · Dashboard & Analytics" />
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic title="Chuyến hôm nay" value={0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic title="Đơn chờ xử lý" value={0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic title="Xe đang chạy" value={0} />
          </Card>
        </Col>
      </Row>
    </AdminShell>
  );
}
