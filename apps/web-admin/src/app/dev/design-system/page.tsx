'use client';

import {
  type ThemeName,
  categorical,
  darkTheme,
  lightTheme,
  palette,
} from '@limousine-workspace/design-tokens';
import type { Booking } from '@limousine-workspace/shared-types';
import {
  AddressAutocomplete,
  Avatar,
  Badge,
  Button,
  Card,
  CardFooter,
  CardHeader,
  Checkbox,
  DataTable,
  DateTime,
  DescriptionList,
  Divider,
  EmptyState,
  ErrorState,
  Field,
  FilterBar,
  FormSection,
  type GeoAddress,
  Input,
  Kbd,
  KpiCard,
  MapView,
  Money,
  NovaThemeProvider,
  PageHeader,
  Phone,
  SEAT_LAYOUTS,
  SeatLegend,
  SeatMap,
  SegmentedControl,
  Skeleton,
  SkeletonText,
  StatusTag,
  Stepper,
  Switch,
  Textarea,
  Timeline,
  buttonClasses,
  cn,
  useConfirm,
  useToast,
} from '@limousine-workspace/shared-ui';
import { DatePicker, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Banknote,
  Bus,
  CalendarClock,
  Moon,
  Plus,
  Sun,
  Ticket,
  Trash2,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useMemo, useState } from 'react';

const NAV = [
  ['colors', 'Màu sắc'],
  ['type', 'Typography'],
  ['buttons', 'Button'],
  ['status', 'Badge & trạng thái'],
  ['forms', 'Form'],
  ['cards', 'Card & KPI'],
  ['feedback', 'Trạng thái rỗng / lỗi'],
  ['layout', 'Layout chi tiết'],
  ['table', 'Bảng dữ liệu'],
  ['booking', 'Đặt vé'],
  ['map', 'Bản đồ'],
] as const;

export default function DesignSystemPage() {
  const [mode, setMode] = useState<ThemeName>('dark');
  return (
    <div data-theme={mode} className="min-h-screen bg-canvas text-fg">
      <NovaThemeProvider mode={mode}>
        <div className="mx-auto flex max-w-[1440px] gap-10 px-4 py-8 sm:px-8 lg:py-12">
          <aside className="sticky top-8 hidden h-fit w-52 shrink-0 lg:block">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-muted">
              NovaLimo DS
            </p>
            <nav className="flex flex-col gap-0.5">
              {NAV.map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="rounded-control px-3 py-2 text-ui text-fg-secondary transition-colors hover:bg-surface-2 hover:text-fg"
                >
                  {label}
                </a>
              ))}
            </nav>
          </aside>
          <main className="min-w-0 flex-1">
            <PageHeader
              linkComponent={Link}
              breadcrumbs={[
                { label: 'Dev', href: '/dashboard' },
                { label: 'Design system' },
              ]}
              title="NovaLimo Design System"
              description="Token, component và pattern dùng chung cho Web Admin, Web Booking. Đối chiếu frame “halo: design system components” và “Message & Popup Library” trong pen."
              meta={<Badge tone="brand">v1 · GĐ 1</Badge>}
              actions={
                <SegmentedControl
                  ariaLabel="Chế độ màu"
                  value={mode}
                  onChange={setMode}
                  options={[
                    {
                      value: 'dark',
                      label: 'Tối',
                      icon: <Moon className="size-3.5" />,
                    },
                    {
                      value: 'light',
                      label: 'Sáng',
                      icon: <Sun className="size-3.5" />,
                    },
                  ]}
                />
              }
            />
            <div className="flex flex-col gap-14">
              <ColorsSection mode={mode} />
              <TypeSection />
              <ButtonsSection />
              <StatusSection />
              <FormsSection />
              <CardsSection />
              <FeedbackSection />
              <LayoutSection />
              <TableSection />
              <BookingSection />
              <MapSection mode={mode} />
            </div>
          </main>
        </div>
      </NovaThemeProvider>
    </div>
  );
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <div className="mb-5 border-b border-border-subtle pb-3">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 text-ui text-fg-muted">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

/* ---------------- Colors ---------------- */

function Swatch({
  name,
  value,
  className,
}: {
  name: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          'size-10 shrink-0 rounded-control border border-border-default',
          className,
        )}
      />
      <div className="min-w-0">
        <p className="truncate text-ui font-medium text-fg">{name}</p>
        <p className="truncate font-mono text-[11px] text-fg-muted">{value}</p>
      </div>
    </div>
  );
}

// Full class names so Tailwind can see them at build time.
const STATUS_SWATCH = [
  ['success', 'bg-success-bg border-success-border', 'text-success-fg'],
  ['warning', 'bg-warning-bg border-warning-border', 'text-warning-fg'],
  ['danger', 'bg-danger-bg border-danger-border', 'text-danger-fg'],
  ['info', 'bg-info-bg border-info-border', 'text-info-fg'],
] as const;

function ColorsSection({ mode }: { mode: ThemeName }) {
  const t = mode === 'dark' ? darkTheme : lightTheme;
  const semantic: [string, string, string][] = [
    ['canvas', t.canvas, 'bg-canvas'],
    ['surface-1', t.surface1, 'bg-surface-1'],
    ['surface-2', t.surface2, 'bg-surface-2'],
    ['surface-3', t.surface3, 'bg-surface-3'],
    ['fg', t.fg, 'bg-fg'],
    ['fg-secondary', t.fgSecondary, 'bg-fg-secondary'],
    ['fg-muted', t.fgMuted, 'bg-fg-muted'],
    ['fg-disabled', t.fgDisabled, 'bg-fg-disabled'],
    ['brand', t.brand, 'bg-brand'],
    ['brand-hover', t.brandHover, 'bg-brand-hover'],
    ['brand-subtle', t.brandSubtle, 'bg-brand-subtle'],
    ['border-strong', t.borderStrong, 'bg-border-strong'],
  ];
  return (
    <Section
      id="colors"
      title="Màu sắc"
      description="Dùng token ngữ nghĩa (bg-surface-1, text-fg-muted…). Mã hex chỉ tồn tại trong libs/design-tokens."
    >
      <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader title="Semantic" description={`Theme: ${mode}`} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {semantic.map(([n, v, c]) => (
              <Swatch key={n} name={n} value={v} className={c} />
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Trạng thái" />
          <div className="grid grid-cols-2 gap-3">
            {STATUS_SWATCH.map(([k, box, text]) => (
              <div
                key={k}
                className={cn('rounded-control border px-3 py-2.5', box)}
              >
                <p className={cn('text-ui font-semibold capitalize', text)}>
                  {k}
                </p>
                <p className="font-mono text-[11px] text-fg-muted">
                  {t[k].solid}
                </p>
              </div>
            ))}
          </div>
          <Divider className="my-5" />
          <p className="mb-2 text-ui font-medium text-fg-secondary">
            Categorical (biểu đồ / xe trên bản đồ)
          </p>
          <div className="flex flex-wrap gap-2">
            {categorical.map((c) => (
              <span
                key={c}
                className="size-7 rounded-full ring-2 ring-surface-1"
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader
          title="Palette"
          description="navy · gold — navy-800 và gold-500 là màu neo lấy từ pen"
        />
        {(['navy', 'gold'] as const).map((fam) => (
          <div key={fam} className="mb-4 last:mb-0">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-fg-muted">
              {fam}
            </p>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {Object.entries(palette[fam]).map(([shade, hex]) => (
                <div key={shade}>
                  <div
                    className="h-12 rounded-control border border-border-subtle"
                    style={{ background: hex }}
                  />
                  <p className="mt-1 text-[11px] text-fg-muted">{shade}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </Section>
  );
}

/* ---------------- Typography ---------------- */

function TypeSection() {
  const rows: [string, string, string][] = [
    [
      'text-display',
      'Hành trình đẳng cấp',
      'text-display font-semibold tracking-tight',
    ],
    [
      'text-4xl',
      'Điều phối thông minh',
      'text-4xl font-semibold tracking-tight',
    ],
    ['text-2xl', 'Quản lý chuyến xe', 'text-2xl font-semibold'],
    ['text-lg', 'Tiêu đề khối nội dung', 'text-lg font-medium'],
    ['text-base', 'Nội dung đọc thông thường cho khách hàng.', 'text-base'],
    [
      'text-sm',
      'Nội dung giao diện quản trị mặc định.',
      'text-sm text-fg-secondary',
    ],
    [
      'text-ui',
      'Ô bảng dữ liệu, nhãn form (13px)',
      'text-ui text-fg-secondary',
    ],
    ['text-xs', 'Chú thích · thời gian cập nhật', 'text-xs text-fg-muted'],
  ];
  return (
    <Section
      id="type"
      title="Typography"
      description="Inter (latin + vietnamese). Số tiền, giờ dùng tabular-nums."
    >
      <Card padding="none">
        {rows.map(([token, sample, cls]) => (
          <div
            key={token}
            className="flex flex-col gap-1 border-b border-border-subtle px-6 py-4 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-8"
          >
            <code className="w-28 shrink-0 font-mono text-[11px] text-fg-muted">
              {token}
            </code>
            <p className={cn('min-w-0 truncate', cls)}>{sample}</p>
          </div>
        ))}
        <div className="flex flex-wrap items-baseline gap-6 px-6 py-4">
          <Money value={1_650_000} className="text-2xl font-semibold" />
          <Money
            value={125_400_000}
            compact
            className="text-lg text-brand-fg"
          />
          <Phone value="0912345678" />
          <Phone value="0912345678" masked className="text-fg-muted" />
          <DateTime
            value="2026-11-02T07:05:00Z"
            className="text-fg-secondary"
          />
          <span className="text-ui text-fg-muted">
            Tìm nhanh <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>
          </span>
        </div>
      </Card>
    </Section>
  );
}

/* ---------------- Buttons ---------------- */

function ButtonsSection() {
  const toast = useToast();
  const confirm = useConfirm();
  return (
    <Section
      id="buttons"
      title="Button"
      description="Primary vàng gold cho hành động chính duy nhất trên màn; còn lại dùng secondary/ghost."
    >
      <Card className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            leftIcon={<Plus className="size-4" />}
            onClick={() => toast.success('Đã tạo lô chuyến mới')}
          >
            Tạo lô chuyến
          </Button>
          <Button variant="secondary">Xuất Excel</Button>
          <Button variant="outline">Xem chi tiết</Button>
          <Button variant="ghost">Hủy</Button>
          <Button
            variant="danger"
            leftIcon={<Trash2 className="size-4" />}
            onClick={async () => {
              if (
                await confirm({
                  title: 'Xóa xe 29A-123.45?',
                  content: 'Hành động này không thể hoàn tác.',
                  okText: 'Xóa',
                  danger: true,
                })
              )
                toast.success('Đã xóa xe');
            }}
          >
            Xóa
          </Button>
          <Button variant="link">Liên kết</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button loading>Đang lưu</Button>
          <Button disabled>Vô hiệu</Button>
          <Button size="icon-md" variant="secondary" aria-label="Lịch">
            <CalendarClock className="size-4" />
          </Button>
          <Link
            href="/dashboard"
            className={buttonClasses({ variant: 'outline', size: 'md' })}
          >
            Next Link dạng nút
          </Link>
        </div>
      </Card>
    </Section>
  );
}

/* ---------------- Status ---------------- */

function StatusSection() {
  return (
    <Section
      id="status"
      title="Badge & trạng thái"
      description="StatusTag ánh xạ enum từ shared-types → nhãn tiếng Việt + màu, dùng chung cho mọi app."
    >
      <Card className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-2">
          {(
            [
              'neutral',
              'brand',
              'success',
              'warning',
              'danger',
              'info',
            ] as const
          ).map((t) => (
            <Badge key={t} tone={t}>
              {t}
            </Badge>
          ))}
          {(['brand', 'success', 'danger'] as const).map((t) => (
            <Badge key={t} tone={t} variant="solid">
              {t}
            </Badge>
          ))}
        </div>
        <DescriptionList
          columns={3}
          items={[
            {
              label: 'Vé',
              value: (
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      'WAITING',
                      'PICKED_UP',
                      'DROPPED_OFF',
                      'CANCELLED',
                    ] as const
                  ).map((s) => (
                    <StatusTag key={s} domain="booking" status={s} />
                  ))}
                </div>
              ),
            },
            {
              label: 'Chuyến chạy',
              value: (
                <div className="flex flex-wrap gap-2">
                  {(['PENDING', 'IN_PROGRESS', 'FINISHED'] as const).map(
                    (s) => (
                      <StatusTag key={s} domain="tripRun" status={s} />
                    ),
                  )}
                </div>
              ),
            },
            {
              label: 'Thanh toán',
              value: (
                <div className="flex flex-wrap gap-2">
                  {(['PENDING', 'PAID', 'FAILED'] as const).map((s) => (
                    <StatusTag key={s} domain="payment" status={s} />
                  ))}
                </div>
              ),
            },
            {
              label: 'Xe',
              value: (
                <div className="flex flex-wrap gap-2">
                  {(['AVAILABLE', 'IN_USE', 'MAINTENANCE'] as const).map(
                    (s) => (
                      <StatusTag key={s} domain="vehicle" status={s} />
                    ),
                  )}
                </div>
              ),
            },
            {
              label: 'Lô chuyến',
              value: (
                <div className="flex flex-wrap gap-2">
                  {(['OPEN', 'CLUSTERED', 'COMPLETED'] as const).map((s) => (
                    <StatusTag key={s} domain="tripBatch" status={s} />
                  ))}
                </div>
              ),
            },
            {
              label: 'Hàng hóa',
              value: (
                <div className="flex flex-wrap gap-2">
                  {(['PENDING', 'PICKED_UP', 'DELIVERED'] as const).map((s) => (
                    <StatusTag key={s} domain="cargo" status={s} />
                  ))}
                </div>
              ),
            },
          ]}
        />
        <div className="flex items-center gap-3">
          <Avatar name="Nguyễn Văn Tài" status="online" />
          <Avatar name="Trần Thị Mai" size={44} status="busy" />
          <Avatar name="Lê Hoàng" size={28} />
        </div>
      </Card>
    </Section>
  );
}

/* ---------------- Forms ---------------- */

function FormsSection() {
  const [vip, setVip] = useState(true);
  const [seg, setSeg] = useState<'all' | 'open' | 'closed'>('all');
  const [addr, setAddr] = useState<GeoAddress>({ address: '' });
  return (
    <Section
      id="forms"
      title="Form"
      description="Control native (booking) và antd đã theme (admin) có cùng chiều cao 40px, bo góc, focus ring vàng."
    >
      <Card>
        <FormSection
          title="Thông tin hành khách"
          description="Dùng Field + Input cho web đặt vé."
        >
          <Field label="Họ và tên" required>
            {(p) => <Input {...p} placeholder="Nguyễn Văn A" />}
          </Field>
          <Field
            label="Số điện thoại"
            required
            error="Số điện thoại không hợp lệ"
          >
            {(p) => <Input {...p} defaultValue="09123" inputMode="tel" />}
          </Field>
          <Field
            label="Điểm đón"
            hint="Chọn một gợi ý để xác định toạ độ"
            className="sm:col-span-2"
          >
            {(p) => (
              <AddressAutocomplete
                id={p.id}
                value={addr}
                onChange={setAddr}
                search={async (q) => [
                  {
                    display_name: `${q} — Hoàn Kiếm, Hà Nội`,
                    lat: 21.0285,
                    lng: 105.8542,
                  },
                  {
                    display_name: `${q} — Cầu Giấy, Hà Nội`,
                    lat: 21.0362,
                    lng: 105.7905,
                  },
                ]}
              />
            )}
          </Field>
          <Field label="Ghi chú" className="sm:col-span-2">
            {(p) => (
              <Textarea
                {...p}
                rows={3}
                placeholder="Ví dụ: mang theo 2 vali lớn"
              />
            )}
          </Field>
        </FormSection>
        <FormSection
          title="Bộ lọc & lựa chọn"
          description="antd Select / DatePicker cho admin."
        >
          <Field label="Tuyến">
            {() => (
              <Select
                className="w-full"
                defaultValue="hn-qn"
                options={[
                  { value: 'hn-qn', label: 'Hà Nội → Quảng Ninh' },
                  { value: 'hn-nb', label: 'Hà Nội → Nội Bài' },
                ]}
              />
            )}
          </Field>
          <Field label="Ngày khởi hành">
            {() => <DatePicker className="w-full" format="DD/MM/YYYY" />}
          </Field>
          <div className="flex flex-col gap-4">
            <Checkbox
              label="Gửi SMS xác nhận"
              description="Khách nhận mã vé qua tin nhắn"
              defaultChecked
            />
            <Switch
              checked={vip}
              onChange={setVip}
              label="Bật phụ thu ghế VIP"
            />
          </div>
          <SegmentedControl
            value={seg}
            onChange={setSeg}
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'open', label: 'Đang mở' },
              { value: 'closed', label: 'Đã đóng' },
            ]}
          />
        </FormSection>
        <CardFooter>
          <Button variant="ghost">Hủy</Button>
          <Button>Lưu thay đổi</Button>
        </CardFooter>
      </Card>
    </Section>
  );
}

/* ---------------- Cards & KPI ---------------- */

function CardsSection() {
  return (
    <Section
      id="cards"
      title="Card & KPI"
      description="KPI dashboard có delta và sparkline; viền sáng mảnh phía trên tạo chiều sâu."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Doanh thu hôm nay"
          value={<Money value={52_400_000} compact />}
          icon={<Banknote className="size-4" />}
          delta={12.4}
          trend={[12, 18, 15, 22, 19, 27, 31]}
        />
        <KpiCard
          label="Vé đã bán"
          value="320"
          icon={<Ticket className="size-4" />}
          delta={4.1}
          trend={[30, 28, 35, 33, 40, 38, 44]}
        />
        <KpiCard
          label="Xe đang chạy"
          value="18 / 24"
          icon={<Bus className="size-4" />}
        />
        <KpiCard
          label="Tỉ lệ hủy"
          value="2,3%"
          icon={<Users className="size-4" />}
          delta={-0.8}
          invertDelta
          trend={[5, 4, 4.2, 3.6, 3, 2.8, 2.3]}
        />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader title="Default" description="bg-surface-1 · shadow-e1" />
          <SkeletonText lines={2} />
        </Card>
        <Card variant="elevated">
          <CardHeader title="Elevated" description="bg-surface-2 · shadow-e2" />
          <SkeletonText lines={2} />
        </Card>
        <Card variant="glass" interactive>
          <CardHeader
            title="Glass · interactive"
            description="Dùng trên ảnh hero của web đặt vé"
          />
          <SkeletonText lines={2} />
        </Card>
      </div>
      <div className="mt-4">
        <KpiCard label="Đang tải" value="" loading />
      </div>
    </Section>
  );
}

/* ---------------- Feedback ---------------- */

function FeedbackSection() {
  return (
    <Section
      id="feedback"
      title="Trạng thái rỗng / lỗi / đang tải"
      description="Mọi màn danh sách bắt buộc có đủ 4 trạng thái (DoD)."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card padding="none">
          <EmptyState
            title="Chưa có chuyến nào"
            description="Tạo lô chuyến đầu tiên để bắt đầu nhận khách."
            action={<Button size="sm">Tạo lô chuyến</Button>}
          />
        </Card>
        <Card padding="none">
          <ErrorState onRetry={() => undefined} />
        </Card>
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10" rounded="pill" />
            <div className="flex-1">
              <SkeletonText lines={2} />
            </div>
          </div>
          <Skeleton className="h-32" rounded="card" />
        </Card>
      </div>
    </Section>
  );
}

/* ---------------- Detail layout ---------------- */

function LayoutSection() {
  return (
    <Section
      id="layout"
      title="Layout chi tiết"
      description="DescriptionList + Timeline cho màn chi tiết vé / chuyến."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader
            title="Vé NL-2611-0042"
            description="Hà Nội → Quảng Ninh · 14:00"
            actions={<StatusTag domain="booking" status="PICKED_UP" />}
          />
          <DescriptionList
            items={[
              { label: 'Hành khách', value: 'Nguyễn Văn A' },
              {
                label: 'Số điện thoại',
                value: <Phone value="0912345678" link />,
              },
              { label: 'Ghế', value: 'A1 (VIP)' },
              {
                label: 'Tổng tiền',
                value: <Money value={400_000} className="font-semibold" />,
              },
              {
                label: 'Điểm đón',
                value: '36 Hàng Bài, Hoàn Kiếm, Hà Nội',
                full: true,
              },
            ]}
          />
        </Card>
        <Card>
          <CardHeader title="Lịch sử" />
          <Timeline
            items={[
              {
                title: 'Đã lên xe',
                time: '13:52',
                tone: 'brand',
                description: 'Tài xế Nguyễn Văn Tài xác nhận',
              },
              {
                title: 'Đã thanh toán',
                time: '10:14',
                tone: 'success',
                description: 'VietQR · 400.000 ₫',
              },
              { title: 'Đặt vé', time: '10:12', tone: 'neutral' },
            ]}
          />
        </Card>
      </div>
    </Section>
  );
}

/* ---------------- Table ---------------- */

type Row = Pick<
  Booking,
  'id' | 'passenger_name' | 'passenger_phone' | 'pickup_address' | 'status'
> & { amount: number };

const ROWS: Row[] = [
  {
    id: '1',
    passenger_name: 'Nguyễn Văn A',
    passenger_phone: '0912345678',
    pickup_address: '36 Hàng Bài, Hoàn Kiếm',
    status: 'WAITING',
    amount: 350000,
  },
  {
    id: '2',
    passenger_name: 'Trần Thị Mai',
    passenger_phone: '0987654321',
    pickup_address: '89 Trần Duy Hưng, Cầu Giấy',
    status: 'PICKED_UP',
    amount: 400000,
  },
  {
    id: '3',
    passenger_name: 'Lê Hoàng Long',
    passenger_phone: '0901234567',
    pickup_address: 'Times City, Hai Bà Trưng',
    status: 'DROPPED_OFF',
    amount: 350000,
  },
  {
    id: '4',
    passenger_name: 'Phạm Thu Hà',
    passenger_phone: '0934567890',
    pickup_address: 'Royal City, Thanh Xuân',
    status: 'CANCELLED',
    amount: 350000,
  },
];

function TableSection() {
  const [q, setQ] = useState('');
  const [state, setState] = useState<'data' | 'loading' | 'empty' | 'error'>(
    'data',
  );
  const columns: ColumnsType<Row> = useMemo(
    () => [
      {
        title: 'Hành khách',
        dataIndex: 'passenger_name',
        render: (_, r) => (
          <div className="flex items-center gap-3">
            <Avatar name={r.passenger_name} size={32} />
            <div>
              <p className="font-medium text-fg">{r.passenger_name}</p>
              <Phone
                value={r.passenger_phone}
                masked
                className="text-xs text-fg-muted"
              />
            </div>
          </div>
        ),
      },
      { title: 'Điểm đón', dataIndex: 'pickup_address', ellipsis: true },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        render: (s: Row['status']) => <StatusTag domain="booking" status={s} />,
      },
      {
        title: 'Thành tiền',
        dataIndex: 'amount',
        align: 'right',
        render: (v: number) => <Money value={v} className="font-medium" />,
      },
    ],
    [],
  );
  const data =
    state === 'data'
      ? ROWS.filter((r) =>
          r.passenger_name.toLowerCase().includes(q.toLowerCase()),
        )
      : state === 'empty'
        ? []
        : undefined;
  return (
    <Section
      id="table"
      title="Bảng dữ liệu"
      description="DataTable = antd Table + FilterBar + skeleton/empty/error + phân trang server."
    >
      <DataTable<Row>
        columns={columns}
        data={data}
        rowKey="id"
        loading={state === 'loading'}
        error={state === 'error' ? new Error('demo') : undefined}
        onRetry={() => setState('data')}
        pagination={{
          page: 1,
          pageSize: 10,
          total: data?.length ?? 0,
          onChange: () => undefined,
        }}
        empty={{
          title: 'Không có vé phù hợp',
          description: 'Thử đổi bộ lọc hoặc khoảng ngày.',
        }}
        toolbar={
          <FilterBar
            search={{
              value: q,
              onChange: setQ,
              placeholder: 'Tìm hành khách…',
            }}
            onReset={() => setQ('')}
            actions={
              <SegmentedControl
                size="sm"
                value={state}
                onChange={setState}
                options={[
                  { value: 'data', label: 'Dữ liệu' },
                  { value: 'loading', label: 'Đang tải' },
                  { value: 'empty', label: 'Rỗng' },
                  { value: 'error', label: 'Lỗi' },
                ]}
              />
            }
          />
        }
      />
    </Section>
  );
}

/* ---------------- Booking ---------------- */

function BookingSection() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>(['B1']);
  const [layout, setLayout] = useState<'limousine9' | 'limousine12'>(
    'limousine9',
  );
  const base = 350_000;
  const priceOf = (cell: { tier?: string }) =>
    cell.tier === 'vip' ? base + 50_000 : base;
  const all = SEAT_LAYOUTS[layout].rows
    .flat()
    .filter((c): c is NonNullable<typeof c> => !!c);
  const total = all
    .filter((c) => selected.includes(c.label))
    .reduce((s, c) => s + priceOf(c), 0);
  return (
    <Section
      id="booking"
      title="Đặt vé"
      description="Stepper + SeatMap (layout lấy từ loại xe, ghế giữ chỗ, VIP, đã bán)."
    >
      <Card className="mb-6">
        <Stepper
          current={step}
          steps={[
            { title: 'Chọn ghế' },
            { title: 'Thông tin' },
            { title: 'Thanh toán' },
            { title: 'Hoàn tất' },
          ]}
        />
        <div className="mt-6 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            Quay lại
          </Button>
          <Button
            size="sm"
            disabled={step === 3}
            onClick={() => setStep((s) => s + 1)}
          >
            Tiếp tục
          </Button>
        </div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="flex flex-col items-center gap-5">
          <SegmentedControl
            value={layout}
            onChange={(v) => {
              setLayout(v);
              setSelected([]);
            }}
            options={[
              { value: 'limousine9', label: '9 chỗ' },
              { value: 'limousine12', label: '12 chỗ' },
            ]}
          />
          <SeatMap
            layout={SEAT_LAYOUTS[layout]}
            selected={selected}
            taken={['A2', 'C3']}
            held={['D1']}
            maxSelectable={4}
            priceOf={priceOf}
            onToggle={(l) =>
              setSelected((s) =>
                s.includes(l) ? s.filter((x) => x !== l) : [...s, l],
              )
            }
          />
        </Card>
        <Card variant="elevated" className="flex flex-col">
          <CardHeader
            title="Tóm tắt"
            description="Hà Nội → Quảng Ninh · 14:00 · T2, 02/11"
          />
          <SeatLegend className="mb-6" />
          <div className="flex flex-wrap gap-2">
            {selected.length ? (
              selected.map((s) => (
                <Badge key={s} tone="brand">
                  {s}
                </Badge>
              ))
            ) : (
              <span className="text-ui text-fg-muted">Chưa chọn ghế</span>
            )}
          </div>
          <div className="mt-auto flex items-end justify-between border-t border-border-subtle pt-5">
            <div>
              <p className="text-ui text-fg-muted">
                Tạm tính ({selected.length} ghế)
              </p>
              <Money value={total} className="text-2xl font-semibold text-fg" />
            </div>
            <Button size="lg" disabled={!selected.length}>
              Tiếp tục
            </Button>
          </div>
        </Card>
      </div>
    </Section>
  );
}

/* ---------------- Map ---------------- */

function MapSection({ mode }: { mode: ThemeName }) {
  const markers = useMemo(
    () => [
      {
        id: 'p1',
        lat: 21.0285,
        lng: 105.8542,
        label: '1',
        kind: 'pickup' as const,
        colorIndex: 0,
        title: 'Đón 1 · Hoàn Kiếm',
      },
      {
        id: 'p2',
        lat: 21.0362,
        lng: 105.7905,
        label: '2',
        kind: 'pickup' as const,
        colorIndex: 0,
        title: 'Đón 2 · Cầu Giấy',
      },
      {
        id: 'p3',
        lat: 21.0058,
        lng: 105.8433,
        label: '1',
        kind: 'pickup' as const,
        colorIndex: 1,
        title: 'Đón 1 · Hai Bà Trưng',
      },
      {
        id: 'v1',
        lat: 21.045,
        lng: 105.83,
        kind: 'vehicle' as const,
        colorIndex: 0,
        title: '29A-123.45',
      },
      {
        id: 'd1',
        lat: 21.2187,
        lng: 105.8042,
        label: 'T',
        kind: 'dropoff' as const,
        colorIndex: 1,
        title: 'Trả · Nội Bài',
      },
    ],
    [],
  );
  const routes = useMemo(
    () => [
      {
        id: 'r1',
        colorIndex: 0,
        coordinates: [
          [105.8542, 21.0285],
          [105.83, 21.045],
          [105.7905, 21.0362],
        ] as [number, number][],
      },
      {
        id: 'r2',
        colorIndex: 1,
        dashed: true,
        coordinates: [
          [105.8433, 21.0058],
          [105.82, 21.12],
          [105.8042, 21.2187],
        ] as [number, number][],
      },
    ],
    [],
  );
  return (
    <Section
      id="map"
      title="Bản đồ"
      description="MapLibre + OpenFreeMap (không cần API key); ghim đánh số theo thứ tự đón, màu theo xe, tuyến theo categorical palette."
    >
      <MapView
        key={mode}
        theme={mode}
        markers={markers}
        routes={routes}
        className="h-[440px]"
      />
    </Section>
  );
}
