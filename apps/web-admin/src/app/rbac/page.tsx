'use client';

import { Card, Tabs, Typography } from 'antd';
import Link from 'next/link';
import { AdminShell } from '@limousine-workspace/shared-ui/legacy';
import { AdminPenMeta } from '../../components/AdminPenMeta';

export default function RbacPage() {
  return (
    <AdminShell title="Phân quyền">
      <AdminPenMeta
        id="nvRbacUsers"
        name="RBAC — Users / Roles / Permissions"
      />
      <Typography.Paragraph className="!mb-4">
        <Link href="/audit">Audit Log</Link>
      </Typography.Paragraph>
      <Tabs
        items={[
          {
            key: 'users',
            label: 'Users',
            children: (
              <Card className="border-slate-200">
                <Typography.Text type="secondary">nvRbacUsers</Typography.Text>
              </Card>
            ),
          },
          {
            key: 'roles',
            label: 'Roles',
            children: (
              <Card className="border-slate-200">
                <Typography.Text type="secondary">nvRbacRoles</Typography.Text>
              </Card>
            ),
          },
          {
            key: 'permissions',
            label: 'Permissions',
            children: (
              <Card className="border-slate-200">
                <Typography.Text type="secondary">
                  nvRbacPermissions
                </Typography.Text>
              </Card>
            ),
          },
        ]}
      />
    </AdminShell>
  );
}
