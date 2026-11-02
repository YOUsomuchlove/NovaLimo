'use client';

import type { ReactNode } from 'react';
import { Tabs, Typography } from 'antd';
import { AdminShell } from '@limousine-workspace/shared-ui/legacy';
import { AdminConsoleHeaderExtras } from '../../components/AdminConsoleHeaderExtras';

const panelShell =
  'rounded-xl border border-white/[0.06] bg-[#121620] p-5 sm:p-6';

function ReportPanel({ children }: { children: ReactNode }) {
  return <div className={panelShell}>{children}</div>;
}

const tabsDark =
  '[&_.ant-tabs-nav]:mb-4 [&_.ant-tabs-nav::before]:border-white/10! [&_.ant-tabs-tab]:text-[#9ca3af]! [&_.ant-tabs-tab-btn]:font-semibold! [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:text-white! [&_.ant-tabs-ink-bar]:bg-[#d4af37]!';

export default function ReportsPage() {
  return (
    <AdminShell
      title="Báo cáo & phân tích"
      subtitle="Phân tích doanh thu, chuyến, tài xế và hàng hóa"
      consoleChrome
      headerExtra={<AdminConsoleHeaderExtras />}
    >
      <Tabs
        className={tabsDark}
        items={[
          {
            key: 'revenue',
            label: 'Doanh thu',
            children: (
              <ReportPanel>
                <Typography.Title level={5} className="!mt-0 !text-white">
                  Doanh thu
                </Typography.Title>
                <Typography.Paragraph className="!mb-0 text-[13px] text-[#9ca3af]">
                  Báo cáo doanh thu theo tuyến / ngày (placeholder).
                </Typography.Paragraph>
                <div className="mt-5 flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-white/[0.08] bg-[#0b0e14]">
                  <span className="text-[13px] font-medium text-[#6b7280]">
                    Biểu đồ
                  </span>
                </div>
              </ReportPanel>
            ),
          },
          {
            key: 'trips',
            label: 'Chuyến',
            children: (
              <ReportPanel>
                <Typography.Title level={5} className="!mt-0 !text-white">
                  Chuyến
                </Typography.Title>
                <Typography.Paragraph className="!mb-0 text-[13px] text-[#9ca3af]">
                  Hiệu suất chuyến, tỷ lệ đúng giờ (placeholder).
                </Typography.Paragraph>
                <div className="mt-5 flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-white/[0.08] bg-[#0b0e14]">
                  <span className="text-[13px] font-medium text-[#6b7280]">
                    Biểu đồ
                  </span>
                </div>
              </ReportPanel>
            ),
          },
          {
            key: 'drivers',
            label: 'Tài xế',
            children: (
              <ReportPanel>
                <Typography.Title level={5} className="!mt-0 !text-white">
                  Tài xế
                </Typography.Title>
                <Typography.Paragraph className="!mb-0 text-[13px] text-[#9ca3af]">
                  Hiệu suất tài xế, lương / thưởng (placeholder).
                </Typography.Paragraph>
                <div className="mt-5 flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-white/[0.08] bg-[#0b0e14]">
                  <span className="text-[13px] font-medium text-[#6b7280]">
                    Biểu đồ
                  </span>
                </div>
              </ReportPanel>
            ),
          },
          {
            key: 'cargo',
            label: 'Hàng hóa / COD',
            children: (
              <ReportPanel>
                <Typography.Title level={5} className="!mt-0 !text-white">
                  Hàng hóa / COD
                </Typography.Title>
                <Typography.Paragraph className="!mb-0 text-[13px] text-[#9ca3af]">
                  Đối soát COD, kiện hàng (placeholder).
                </Typography.Paragraph>
                <div className="mt-5 flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-white/[0.08] bg-[#0b0e14]">
                  <span className="text-[13px] font-medium text-[#6b7280]">
                    Biểu đồ
                  </span>
                </div>
              </ReportPanel>
            ),
          },
        ]}
      />
    </AdminShell>
  );
}
