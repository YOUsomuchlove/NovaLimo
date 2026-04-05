'use client';

import { Typography } from 'antd';
import { AdminMessagePatterns, AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../../components/AdminPenMeta';

export default function DevUiMessagesPage() {
  return (
    <AdminShell title="UI · Message library (dev)">
      <AdminPenMeta id="nvUiMsgLib" name="NovaLimo UI · Message & Popup Library" />
      <Typography.Paragraph type="secondary" className="!mb-4 text-xs">
        Trang dev — đối chiếu toast/alert/modal với pen; không bắt buộc production.
      </Typography.Paragraph>
      <AdminMessagePatterns />
    </AdminShell>
  );
}
