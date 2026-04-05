'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Button, Card, Space, Tag, Typography } from 'antd';
import { PageSection } from '../../../components/blocks/PageSection';
import { BookingPageScaffold } from '../../../components/layout/BookingPageScaffold';
import { PEN_BG, PEN_OVERLAY } from '../../../lib/booking-pen-assets';

function CargoResultsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const route = searchParams.get('route') ?? '—';
  const weight = searchParams.get('w') ?? '—';

  const standard = 240000;
  const fast = 310000;

  function confirm() {
    router.push('/cargo/success');
  }

  return (
    <div className="bg-[#0B1020]">
      <BookingPageScaffold
        bgSrc={PEN_BG.cargoResults}
        overlayClassName={PEN_OVERLAY.cargoResults}
        minHeight="min-h-[240px]"
      >
        <PageSection className="!py-8 sm:!py-10">
          <Typography.Title
            level={2}
            className="!mb-1 !text-2xl !font-black !text-white sm:!text-3xl md:!text-4xl"
          >
            Kết quả báo giá
          </Typography.Title>
          <Typography.Text className="text-sm font-semibold text-[#B2CCFF] sm:text-base">
            Ước tính theo khung kiện bạn nhập — phí cuối có thể điều chỉnh khi kiểm tra
            thực tế tại bến.
          </Typography.Text>
        </PageSection>
      </BookingPageScaffold>

      <PageSection className="bg-[#0B1020] pb-16 pt-4">
        <Card className="w-full max-w-4xl rounded-[20px] border-[#E5E7EB] shadow-md">
          <Typography.Title level={4} className="!mt-0 !text-[#0B1020]">
            Phương án gợi ý
          </Typography.Title>
          <p className="text-[#616167]">
            Tuyến <strong>{route}</strong> · {weight} kg — Tiêu chuẩn{' '}
            <strong className="text-[#D4AF37]">{standard.toLocaleString('vi-VN')} ₫</strong>{' '}
            · Nhanh (+4h){' '}
            <strong className="text-[#D4AF37]">{fast.toLocaleString('vi-VN')} ₫</strong>
          </p>
          <Space className="mt-4" wrap>
            <Tag color="success">Đủ điều kiện gửi</Tag>
            <Tag color="warning">Dễ vỡ: xếp riêng</Tag>
          </Space>
          <Alert
            className="mt-6 border-[#E8D4A0] bg-[#FFF9E8] text-[#0B1020]"
            message="Lưu ý chính sách"
            description="Phụ phí phát sinh khi kiểm tra thực tế khác khai báo (theo điều khoản)."
            type="warning"
            showIcon
          />
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              type="primary"
              size="large"
              block
              onClick={confirm}
              className="!font-black !text-[#0B1020] sm:!w-auto"
            >
              Xác nhận gửi hàng
            </Button>
            <Link href="/cargo/book" className="w-full sm:w-auto">
              <Button size="large" block className="sm:!w-auto">
                Chỉnh lại thông tin
              </Button>
            </Link>
          </div>
        </Card>
      </PageSection>
    </div>
  );
}

export default function CargoResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-600">Đang tải…</div>
      }
    >
      <CargoResultsInner />
    </Suspense>
  );
}
