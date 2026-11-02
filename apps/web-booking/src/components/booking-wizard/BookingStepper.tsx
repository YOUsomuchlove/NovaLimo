'use client';

import React from 'react';
import { Steps } from 'antd';

const STEP_ITEMS = [
  { title: 'Chọn chuyến' },
  { title: 'Chọn ghế' },
  { title: 'Thông tin' },
  { title: 'Thanh toán' },
];

export type BookingStepperProps = {
  /** Bước wizard: 0 = ghế, 1 = thông tin, 2 = thanh toán (bước Xong không dùng stepper). */
  wizardStep: 0 | 1 | 2;
  isMdUp: boolean;
};

/**
 * Thanh tiến độ 4 bước — khớp mockup đặt vé (Chọn chuyến → … → Thanh toán).
 * `current` của antd = chỉ số bước đang xử lý: wizardStep + 1.
 */
export function BookingStepper({ wizardStep, isMdUp }: BookingStepperProps) {
  return (
    <Steps
      current={wizardStep + 1}
      items={STEP_ITEMS}
      direction={isMdUp ? 'horizontal' : 'vertical'}
      size={isMdUp ? 'default' : 'small'}
      className="mb-8 [&_.ant-steps-item-finish_.ant-steps-item-icon]:!border-nova-gold [&_.ant-steps-item-finish_.ant-steps-item-icon]:!bg-nova-gold/20 [&_.ant-steps-item-process_.ant-steps-item-icon]:!border-nova-gold [&_.ant-steps-item-process_.ant-steps-item-icon]:!bg-nova-gold [&_.ant-steps-item-process_.ant-steps-item-title]:!text-nova-gold [&_.ant-steps-item-title]:!text-xs [&_.ant-steps-item-title]:!font-bold sm:[&_.ant-steps-item-title]:!text-sm [&_.ant-steps-item-title]:!text-[#E8EAEF] [&_.ant-steps-item-wait_.ant-steps-item-title]:!text-white/40"
    />
  );
}
