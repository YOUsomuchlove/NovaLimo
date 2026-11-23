'use client';

import {
  Badge,
  Button,
  Money,
  SEAT_LAYOUTS,
  SeatLegend,
  SeatMap,
  SegmentedControl,
  useToast,
} from '@limousine-workspace/shared-ui';
import { ArrowRight, CheckCircle2, Crown, Sparkles, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type VehicleKey = 'limousine9' | 'limousine12';

const BASE_PRICE = 260_000;
const VIP_SURCHARGE = 40_000;

export function InteractiveSeatDemo({
  firstRouteId,
}: {
  firstRouteId?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [vehicle, setVehicle] = useState<VehicleKey>('limousine9');
  const [selected, setSelected] = useState<string[]>(['A1']);

  const layout = SEAT_LAYOUTS[vehicle];
  const taken = useMemo(
    () => (vehicle === 'limousine9' ? ['B2', 'C2'] : ['B2', 'C2', 'E2']),
    [vehicle],
  );
  const held = useMemo(() => ['C1'], []);

  const vipLabels = useMemo(() => {
    const set = new Set<string>();
    for (const row of layout.rows) {
      for (const cell of row) {
        if (cell?.tier === 'VIP') set.add(cell.label);
      }
    }
    return set;
  }, [layout]);

  const toggle = (label: string) => {
    setSelected((prev) =>
      prev.includes(label)
        ? prev.filter((x) => x !== label)
        : prev.length >= 4
          ? (toast.info('Bản demo cho phép chọn thử tối đa 4 ghế'), prev)
          : [...prev, label],
    );
  };

  const subtotal = selected.reduce(
    (sum, l) => sum + BASE_PRICE + (vipLabels.has(l) ? VIP_SURCHARGE : 0),
    0,
  );
  const discount = selected.length >= 3 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const bookNow = () => {
    const seatsCount = Math.max(1, selected.length);
    if (firstRouteId && !firstRouteId.startsWith('demo-')) {
      router.push(`/search?route=${firstRouteId}&seats=${seatsCount}`);
      return;
    }
    toast.success(
      `Đã chọn thử ${seatsCount} ghế (${selected.join(', ') || 'A1'}). Chọn tuyến ở khung tìm kiếm để đặt chuyến thực tế!`,
    );
    document.getElementById('dat-ve')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="grid items-center gap-8 rounded-sheet border border-border-default bg-surface-1 p-6 shadow-e2 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand" icon={<Sparkles className="size-3.5" />}>
            Trải nghiệm tương tác trực tiếp
          </Badge>
          <Badge tone="success" dot>
            Cập nhật ghế theo thời gian thực
          </Badge>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          Thử chọn ghế ngay trên sơ đồ khoang xe
        </h2>
        <p className="text-sm leading-relaxed text-fg-secondary sm:text-base">
          Chạm vào từng vị trí ghế bên cạnh để xem giá ghế thường và ghế VIP
          massage. Đặt từ <strong>3 ghế trở lên</strong> tự động áp dụng ưu đãi
          nhóm <strong>10%</strong>.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
            Chọn dòng xe demo:
          </span>
          <SegmentedControl
            ariaLabel="Dòng xe demo"
            value={vehicle}
            onChange={(v) => {
              setVehicle(v);
              setSelected(['A1']);
            }}
            options={[
              { value: 'limousine9', label: 'Limousine 9 chỗ VIP' },
              { value: 'limousine12', label: 'Limousine 12 chỗ' },
            ]}
          />
        </div>

        <ul className="grid gap-2.5 text-sm text-fg-secondary sm:grid-cols-2">
          {[
            'Không lo trùng ghế — giữ chỗ 10 phút',
            'Ghế VIP ngả sâu, massage & USB-C',
            'Giá minh bạch, không phụ thu ẩn',
            'Quét VietQR nhận vé điện tử sau 5 giây',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-success-fg" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-1 rounded-panel border border-border-subtle bg-canvas p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-fg-muted">
                Ghế bạn đang chọn thử ({selected.length})
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {selected.length ? (
                  selected.map((l) => (
                    <Badge
                      key={l}
                      tone={vipLabels.has(l) ? 'brand' : 'neutral'}
                      size="sm"
                      icon={
                        vipLabels.has(l) ? (
                          <Crown className="size-3" />
                        ) : undefined
                      }
                    >
                      Ghế {l}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-fg-muted">
                    Chạm vào 1 ghế trống bên cạnh
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              {discount > 0 && (
                <p className="text-xs font-medium text-success-fg">
                  Đã giảm 10% nhóm (-{discount.toLocaleString('vi-VN')}đ)
                </p>
              )}
              <Money
                value={total}
                className="text-2xl font-semibold text-brand-fg"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
              <Zap className="size-3.5 text-brand-fg" /> Minh họa tuyến Hà Nội →
              Hạ Long
            </span>
            <Button
              size="md"
              onClick={bookNow}
              rightIcon={<ArrowRight className="size-4" />}
            >
              Đặt ngay với {Math.max(1, selected.length)} ghế
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-5 rounded-panel border border-border-subtle bg-canvas/80 p-6">
        <SeatMap
          layout={layout}
          selected={selected}
          taken={taken}
          held={held}
          maxSelectable={4}
          onToggle={toggle}
          priceOf={(c) => BASE_PRICE + (c.tier === 'VIP' ? VIP_SURCHARGE : 0)}
        />
        <SeatLegend className="justify-center" />
      </div>
    </div>
  );
}
