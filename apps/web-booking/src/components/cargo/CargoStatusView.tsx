'use client';

import type { CargoDto } from '@limousine-workspace/shared-types';
import {
  Button,
  Card,
  DescriptionList,
  ErrorState,
  Field,
  Input,
  Money,
  SkeletonText,
  StatusTag,
  Timeline,
  type TimelineItem,
} from '@limousine-workspace/shared-ui';
import {
  formatDateTime,
  formatVnPhone,
  isValidVnPhone,
  normalizeVnPhone,
} from '@limousine-workspace/utils-core';
import { CheckCircle2, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ApiError, publicApi } from '../../lib/api';
import { ticketPhones } from '../../lib/session';

function timeline(c: CargoDto): TimelineItem[] {
  const items: TimelineItem[] = [
    {
      title: 'Đã tiếp nhận đơn',
      time: formatDateTime(c.created_at),
      tone: 'neutral',
    },
  ];
  if (c.picked_up_at)
    items.unshift({
      title: 'Tài xế đã nhận hàng',
      time: formatDateTime(c.picked_up_at),
      tone: 'brand',
    });
  if (c.delivered_at)
    items.unshift({
      title: 'Đã giao thành công',
      time: formatDateTime(c.delivered_at),
      tone: 'success',
      description: c.cod_amount_vnd ? 'Đã thu hộ COD' : undefined,
    });
  if (c.status === 'RETURNED')
    items.unshift({ title: 'Đã hoàn trả người gửi', tone: 'danger' });
  if (c.status === 'CANCELLED')
    items.unshift({ title: 'Đơn đã hủy', tone: 'neutral' });
  return items;
}

/** B4 + tracking: shows a waybill once a phone on it is known (sender or receiver). */
export function CargoStatusView({
  code,
  created,
}: {
  code: string;
  created?: boolean;
}) {
  const [phone, setPhone] = useState('');
  const [state, setState] = useState<
    CargoDto | 'ask' | 'loading' | 'notfound' | 'error'
  >('loading');

  const load = useCallback(
    async (p: string) => {
      setState('loading');
      try {
        const c = await publicApi.cargoTrack(code, p);
        ticketPhones.set(code, p);
        setState(c);
      } catch (e) {
        setState(
          e instanceof ApiError && e.status === 404 ? 'notfound' : 'error',
        );
      }
    },
    [code],
  );

  useEffect(() => {
    const saved = ticketPhones.get(code);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser storage once
    if (saved) void load(saved);
    else setState('ask');
  }, [code, load]);

  if (state === 'ask' || state === 'notfound') {
    return (
      <Card padding="lg" className="mx-auto max-w-md">
        <h1 className="text-xl font-semibold text-fg">Vận đơn {code}</h1>
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (isValidVnPhone(phone)) void load(normalizeVnPhone(phone));
          }}
        >
          <Field
            label="SĐT người gửi hoặc người nhận"
            error={
              state === 'notfound' ? 'Không khớp với vận đơn này' : undefined
            }
          >
            {(p) => (
              <Input
                {...p}
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            )}
          </Field>
          <Button type="submit" leftIcon={<Search className="size-4" />}>
            Xem vận đơn
          </Button>
        </form>
      </Card>
    );
  }
  if (state === 'loading')
    return (
      <Card padding="lg" className="mx-auto max-w-3xl">
        <SkeletonText lines={6} />
      </Card>
    );
  if (state === 'error')
    return (
      <Card className="mx-auto max-w-3xl">
        <ErrorState />
      </Card>
    );

  const c = state;
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Card
        padding="lg"
        className="flex flex-col items-center gap-4 text-center"
      >
        {created && (
          <span className="flex size-16 items-center justify-center rounded-full bg-success-bg text-success-fg ring-8 ring-success-bg/40">
            <CheckCircle2 className="size-8" />
          </span>
        )}
        <h1 className="text-2xl font-semibold text-fg">
          {created ? 'Đã tạo đơn gửi hàng!' : 'Thông tin vận đơn'}
        </h1>
        {created && (
          <p className="max-w-md text-sm text-fg-muted">
            Nhân viên sẽ gọi xác nhận thời gian lấy hàng. Vui lòng ghi mã vận
            đơn lên kiện hàng.
          </p>
        )}
        <div className="rounded-card border border-dashed border-brand/50 bg-brand-subtle px-6 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">
            Mã vận đơn
          </p>
          <p className="font-mono text-3xl font-semibold tracking-[0.12em] text-brand-fg">
            {c.waybill_code}
          </p>
        </div>
        <StatusTag domain="cargo" status={c.status} />
      </Card>
      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <Card padding="lg">
          <DescriptionList
            items={[
              { label: 'Tuyến', value: c.route.name },
              {
                label: 'Kiện',
                value: `${c.size} · ${c.weight_kg} kg${c.is_fragile ? ' · dễ vỡ' : ''}`,
              },
              {
                label: 'Người gửi',
                value: `${c.sender.name} · ${formatVnPhone(c.sender.phone)}`,
              },
              {
                label: 'Người nhận',
                value: `${c.receiver.name} · ${formatVnPhone(c.receiver.phone)}`,
              },
              { label: 'Lấy hàng tại', value: c.sender.address, full: true },
              { label: 'Giao tới', value: c.receiver.address, full: true },
              {
                label: 'Cước',
                value: <Money value={c.fee_vnd} className="font-semibold" />,
              },
              {
                label: 'Thu hộ COD',
                value: c.cod_amount_vnd ? (
                  <Money value={c.cod_amount_vnd} />
                ) : (
                  'Không'
                ),
              },
            ]}
          />
        </Card>
        <Card padding="lg">
          <h2 className="mb-5 text-sm font-semibold text-fg">Hành trình</h2>
          <Timeline items={timeline(c)} />
        </Card>
      </div>
    </div>
  );
}
