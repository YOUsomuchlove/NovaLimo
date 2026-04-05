'use client';

/**
 * Khớp frame nvUiMsgLib — Thư viện Toast/Alert/Modal (web-admin.pen).
 * Dùng trong Storybook hoặc /dev/ui-messages để đối chiếu pixel.
 */
import { Alert, Button, Modal, Space, Typography } from 'antd';
import React, { useState } from 'react';

export function AdminMessagePatterns() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-[#1F2937] bg-[#020617] p-6">
      <Typography.Title level={4} className="!mb-1 !text-white">
        Thư viện Message & Popup · NovaLimo
      </Typography.Title>
      <Typography.Paragraph className="!mb-6 text-sm text-[#9CA6C4]">
        Các mẫu Toast, Alert, Banner và Modal dùng chung — đối chiếu nvUiMsgLib.
      </Typography.Paragraph>

      <Space direction="vertical" size="middle" className="w-full">
        <Alert
          message="Thông báo thành công"
          type="success"
          showIcon
          className="border-[#1F2937] bg-[#0f172a] text-slate-100 [&_.ant-alert-message]:text-slate-100"
        />
        <Alert
          message="Cảnh báo vận hành"
          type="warning"
          showIcon
          className="border-[#1F2937] bg-[#0f172a]"
        />
        <Alert
          message="Lỗi xử lý"
          type="error"
          showIcon
          className="border-[#1F2937] bg-[#0f172a]"
        />
        <Button type="primary" onClick={() => setOpen(true)}>
          Mở Modal xác nhận
        </Button>
        <Modal
          title="Xác nhận"
          open={open}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          okText="Đồng ý"
          cancelText="Hủy"
        >
          <Typography.Text>Nội dung modal mẫu (đối chiếu popup trong pen).</Typography.Text>
        </Modal>
      </Space>
    </div>
  );
}
