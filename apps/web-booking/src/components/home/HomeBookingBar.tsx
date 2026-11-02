'use client';

import React from 'react';
import { Button, Col, DatePicker, Row, Select } from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  FlagOutlined,
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { HOME_HERO_SLIDES } from '../../lib/booking-pen-assets';

function cn(...parts: (string | undefined | false)[]) {
  return parts.filter(Boolean).join(' ');
}

export type HomeBookingBarProps = {
  loading: boolean;
  showFallback: boolean;
  routeOptions: { value: string; label: string }[];
  fallbackRoute: string | undefined;
  setFallbackRoute: React.Dispatch<React.SetStateAction<string | undefined>>;
  origins: string[];
  destinations: string[];
  from: string | undefined;
  to: string | undefined;
  setFrom: React.Dispatch<React.SetStateAction<string | undefined>>;
  setTo: React.Dispatch<React.SetStateAction<string | undefined>>;
  date: Dayjs;
  setDate: (d: Dayjs) => void;
  canSearch: boolean;
  onSearch: () => void;
  slide: number;
  setSlide: React.Dispatch<React.SetStateAction<number>>;
};

/**
 * Thanh đặt vé kính mờ + điều khiển carousel — pen ODwwy.
 */
export function HomeBookingBar({
  loading,
  showFallback,
  routeOptions,
  fallbackRoute,
  setFallbackRoute,
  origins,
  destinations,
  from,
  to,
  setFrom,
  setTo,
  date,
  setDate,
  canSearch,
  onSearch,
  slide,
  setSlide,
}: HomeBookingBarProps) {
  const selectUiClass = 'nova-select w-full';

  const dateUiClass =
    'w-full h-14 min-h-14 rounded-2xl !pl-11 !pr-10 shadow-none [&_.ant-picker-input>input]:!h-14 [&_.ant-picker-input>input]:!leading-[56px] [&_.ant-picker-input>input]:!text-[#E8E8EA] [&_.ant-picker-input>input]:!font-semibold [&_.ant-picker-suffix]:!text-[#D4AF37] [&_.ant-picker-clear]:!text-[#8B90A0]';
  const popupRootClassName =
    '!bg-[#0B1020] [&_.ant-select-item-option-content]:!text-[#E8E8EA] [&_.ant-select-item-option-selected:not(.ant-select-item-option-disabled)]:!bg-white/10 [&_.ant-select-item-option-active:not(.ant-select-item-option-disabled)]:!bg-white/10';

  return (
    <div className="nova-bookingbar pointer-events-auto mx-auto mt-auto w-full max-w-[1040px] pb-5 md:pb-7">
      <div
        className={cn(
          'relative min-h-[120px] overflow-hidden rounded-[24px] border border-[#2B283D] bg-[#0B1020]/80 px-5 py-5 shadow-[0_18px_60px_rgba(0,0,0,0.60)] backdrop-blur-md md:px-6 md:py-6',
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
          aria-hidden
        />
        {showFallback ? (
          <>
            <p className="mb-3 block text-xs text-[#B8BCC8] md:text-sm">
              Chọn tuyến (dữ liệu chưa tách điểm đi / điểm đến)
            </p>
            <Row gutter={[12, 16]} align="bottom">
              <Col xs={24} md={10} lg={10}>
                <p className="mb-2 text-[13px] font-semibold text-[#D4AF37]">
                  Tuyến
                </p>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]">
                    <SearchOutlined />
                  </span>
                  <Select
                    className={selectUiClass}
                    size="large"
                    loading={loading}
                    options={routeOptions}
                    value={fallbackRoute}
                    placeholder="Chọn tuyến"
                    onChange={setFallbackRoute}
                    showSearch
                    optionFilterProp="label"
                    classNames={{ popup: { root: popupRootClassName } }}
                  />
                </div>
              </Col>
              <Col xs={24} md={7} lg={7}>
                <p className="mb-2 text-[13px] font-semibold text-[#D4AF37]">
                  Ngày khởi hành
                </p>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]">
                    <CalendarOutlined />
                  </span>
                  <DatePicker
                    className={dateUiClass}
                    size="large"
                    style={{ background: '#0B1020', borderColor: '#2B283D' }}
                    value={date}
                    onChange={(d) => d && setDate(d)}
                    format="DD/MM/YYYY"
                    suffixIcon={<span />}
                    classNames={{ popup: { root: popupRootClassName } }}
                    disabledDate={(current) =>
                      current ? current < dayjs().startOf('day') : false
                    }
                  />
                </div>
              </Col>
              <Col xs={24} md={7} lg={7}>
                <Button
                  type="primary"
                  size="large"
                  block
                  className="h-14 rounded-2xl border-0 bg-nova-gold! font-extrabold! text-[#0B1020]! shadow-[0_10px_26px_rgba(0,0,0,0.28)] hover:bg-nova-gold-hover!"
                  disabled={!canSearch}
                  onClick={onSearch}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                  <SearchOutlined className="text-[16px]" aria-hidden />
                  Tìm kiếm
                  </span>
                </Button>
              </Col>
            </Row>
          </>
        ) : (
          <Row gutter={[12, 16]} align="bottom">
            <Col xs={24} md={6} lg={6}>
              <p className="mb-2 text-[13px] font-semibold text-[#D4AF37]">
                Điểm đi
              </p>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]">
                  <EnvironmentOutlined />
                </span>
                <Select
                  className={selectUiClass}
                  size="large"
                  loading={loading}
                  options={origins.map((o) => ({ value: o, label: o }))}
                  value={from}
                  placeholder="Điểm đi"
                  onChange={(v) => {
                    setFrom(v);
                    setTo(undefined);
                  }}
                  showSearch
                  optionFilterProp="label"
                  classNames={{ popup: { root: popupRootClassName } }}
                />
              </div>
            </Col>
            <Col xs={24} md={6} lg={6}>
              <p className="mb-2 text-[13px] font-semibold text-[#D4AF37]">
                Điểm đến
              </p>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]">
                  <FlagOutlined />
                </span>
                <Select
                  className={selectUiClass}
                  size="large"
                  loading={loading}
                  options={destinations.map((o) => ({ value: o, label: o }))}
                  value={to}
                  placeholder="Điểm đến"
                  onChange={setTo}
                  disabled={!from}
                  showSearch
                  optionFilterProp="label"
                  classNames={{ popup: { root: popupRootClassName } }}
                />
              </div>
            </Col>
            <Col xs={24} md={6} lg={6}>
              <p className="mb-2 text-[13px] font-semibold text-[#D4AF37]">
                Ngày khởi hành
              </p>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]">
                  <CalendarOutlined />
                </span>
                <DatePicker
                  className={dateUiClass}
                  size="large"
                  style={{ background: '#0B1020', borderColor: '#2B283D' }}
                  value={date}
                  onChange={(d) => d && setDate(d)}
                  format="DD/MM/YYYY"
                  suffixIcon={<span />}
                  classNames={{ popup: { root: popupRootClassName } }}
                  disabledDate={(current) =>
                    current ? current < dayjs().startOf('day') : false
                  }
                />
              </div>
            </Col>
            <Col xs={24} md={6} lg={6} className="flex">
              <Button
                type="primary"
                size="large"
                block
                className="h-14 w-full rounded-2xl border-0 bg-nova-gold! font-extrabold! text-[#0B1020]! shadow-[0_12px_30px_rgba(0,0,0,0.30)] hover:bg-nova-gold-hover! lg:w-auto lg:min-w-[190px] lg:px-5"
                disabled={!canSearch}
                onClick={onSearch}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <SearchOutlined className="text-[16px]" aria-hidden />
                  Tìm kiếm
                </span>
              </Button>
            </Col>
          </Row>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        {HOME_HERO_SLIDES.map((_, i) => (
          <button
            key={String(i)}
            type="button"
            className={cn(
              'h-2 rounded-full transition-all',
              i === slide
                ? 'w-8 bg-nova-gold'
                : 'w-2 bg-white/35 hover:bg-white/55',
            )}
            aria-label={`Slide ${i + 1}`}
            aria-current={i === slide}
            onClick={() => setSlide(i)}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 -top-2 hidden items-center justify-between md:flex">
        <div className="pointer-events-auto">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
            aria-label="Trước"
            onClick={() =>
              setSlide(
                (s) =>
                  (s - 1 + HOME_HERO_SLIDES.length) % HOME_HERO_SLIDES.length,
              )
            }
          >
            <LeftOutlined />
          </button>
        </div>
        <div className="pointer-events-auto">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
            aria-label="Sau"
            onClick={() => setSlide((s) => (s + 1) % HOME_HERO_SLIDES.length)}
          >
            <RightOutlined />
          </button>
        </div>
      </div>
    </div>
  );
}
