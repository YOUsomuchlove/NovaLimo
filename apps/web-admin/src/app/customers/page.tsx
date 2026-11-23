'use client';

import type { CustomerDto } from '@limousine-workspace/shared-types';
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  DateTime,
  Field,
  FilterBar,
  Input,
  Money,
  Phone,
  SegmentedControl,
  Textarea,
  useToast,
} from '@limousine-workspace/shared-ui';
import { Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Edit, Eye, Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../components/shell/AdminShell';
import { adminApi } from '../../lib/api';

type CustomerTagFilter = 'ALL' | 'VIP' | 'BLACKLIST';

export default function CustomersPage() {
  const router = useRouter();
  const toast = useToast();

  const [customers, setCustomers] = useState<CustomerDto[] | undefined>(
    undefined,
  );
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [q, setQ] = useState('');
  const [tagFilter, setTagFilter] = useState<CustomerTagFilter>('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // Create Customer Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cTags, setCTags] = useState<string[]>(['VIP']);
  const [cNote, setCNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.customers({
        page,
        limit,
        q: q.trim() || undefined,
      });
      setCustomers(res.items);
      setTotal(res.total);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, q]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredCustomers = useMemo(() => {
    if (!customers) return undefined;
    if (tagFilter === 'ALL') return customers;
    return customers.filter((c) =>
      c.tags.some((t) => t.toUpperCase() === tagFilter),
    );
  }, [customers, tagFilter]);

  const handleCreate = async () => {
    if (!cName.trim() || !cPhone.trim()) {
      toast.error('Vui lòng nhập Họ tên và Số điện thoại khách hàng');
      return;
    }
    setSaving(true);
    try {
      const created = await adminApi.createCustomer({
        full_name: cName.trim(),
        phone: cPhone.trim(),
        email: cEmail.trim() || undefined,
        tags: cTags,
        note: cNote.trim() || undefined,
      });
      toast.success(`Đã tạo hồ sơ khách hàng ${created.full_name}`);
      setCreateOpen(false);
      setCName('');
      setCPhone('');
      setCEmail('');
      setCNote('');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể tạo khách hàng');
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<CustomerDto> = useMemo(
    () => [
      {
        title: 'Khách hàng',
        key: 'name',
        render: (_, c) => (
          <div className="flex items-center gap-3">
            <Avatar name={c.full_name} size={34} />
            <div>
              <Link
                href={`/customers/${c.id}`}
                className="text-sm font-semibold text-fg hover:text-brand-fg"
              >
                {c.full_name}
              </Link>
              <p className="text-xs text-fg-muted">
                {c.email || c.note || 'Khách hàng thành viên'}
              </p>
            </div>
          </div>
        ),
      },
      {
        title: 'Số điện thoại',
        dataIndex: 'phone',
        key: 'phone',
        render: (p: string) => (
          <Phone value={p} link className="text-sm font-medium text-fg" />
        ),
      },
      {
        title: 'Nhãn (Tag)',
        key: 'tags',
        render: (_, c) =>
          c.tags.length === 0 ? (
            <span className="text-xs text-fg-muted">—</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {c.tags.map((t) => (
                <Badge
                  key={t}
                  tone={
                    t.toUpperCase() === 'VIP'
                      ? 'brand'
                      : t.toUpperCase() === 'BLACKLIST'
                        ? 'danger'
                        : 'info'
                  }
                >
                  {t}
                </Badge>
              ))}
            </div>
          ),
      },
      {
        title: 'Chuyến gần nhất',
        dataIndex: 'last_trip_at',
        key: 'last_trip_at',
        render: (d: string | null) => <DateTime value={d} />,
      },
      {
        title: 'Lịch sử & Tổng chi tiêu (LTV)',
        key: 'stats',
        render: (_, c) => (
          <div className="text-xs">
            <span className="font-semibold text-fg">
              Vé: {c.booking_count} đơn
            </span>
            <span className="mx-1.5 text-fg-muted">·</span>
            <Money
              value={c.total_spent_vnd}
              className="font-semibold text-brand-fg"
            />
          </div>
        ),
      },
      {
        title: 'Thao tác',
        key: 'actions',
        align: 'right',
        render: (_, c) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Link href={`/customers/${c.id}`}>
              <Button size="icon-sm" variant="ghost" aria-label="Xem hồ sơ">
                <Eye className="size-4" />
              </Button>
            </Link>
            <Link href={`/customers/${c.id}/edit`}>
              <Button size="icon-sm" variant="ghost" aria-label="Sửa hồ sơ">
                <Edit className="size-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminShell
      title="Khách hàng"
      subtitle="Danh sách khách hàng (CRM) · Nhãn VIP / Blacklist · Lịch sử vé & ký gửi"
    >
      <div className="flex flex-col gap-6">
        {/* Top Tag Filter & Actions (frame nvCustListFilters) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SegmentedControl<CustomerTagFilter>
            ariaLabel="Lọc theo nhãn khách hàng"
            value={tagFilter}
            onChange={setTagFilter}
            options={[
              { value: 'ALL', label: 'Tất cả' },
              { value: 'VIP', label: 'VIP' },
              { value: 'BLACKLIST', label: 'Blacklist' },
            ]}
          />

          <Button
            leftIcon={<Plus className="size-4" />}
            onClick={() => setCreateOpen(true)}
          >
            Tạo khách hàng
          </Button>
        </div>

        <DataTable<CustomerDto>
          columns={columns}
          data={filteredCustomers}
          rowKey="id"
          loading={loading}
          error={error}
          onRetry={load}
          onRowClick={(row) => router.push(`/customers/${row.id}`)}
          pagination={{
            page,
            pageSize: limit,
            total,
            onChange: (p, ps) => {
              setPage(p);
              setLimit(ps);
            },
          }}
          toolbar={
            <FilterBar
              search={{
                value: q,
                onChange: (v) => {
                  setQ(v);
                  setPage(1);
                },
                placeholder: 'Tìm khách theo tên hoặc số điện thoại…',
              }}
              onReset={
                q
                  ? () => {
                      setQ('');
                      setPage(1);
                    }
                  : undefined
              }
              actions={
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RefreshCw className="size-3.5" />}
                  onClick={load}
                >
                  Làm mới
                </Button>
              }
            />
          }
          empty={{
            title: 'Chưa có hồ sơ khách hàng nào',
            description:
              'Khách đặt vé sẽ tự động được liên kết theo SĐT hoặc bạn có thể tạo mới.',
          }}
        />
      </div>

      <Modal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        title="Tạo hồ sơ khách hàng mới"
        footer={null}
      >
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Họ và tên" required>
            {(p) => (
              <Input
                {...p}
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                placeholder="Trần Thị Mai"
              />
            )}
          </Field>
          <Field label="Số điện thoại" required>
            {(p) => (
              <Input
                {...p}
                type="tel"
                value={cPhone}
                onChange={(e) => setCPhone(e.target.value)}
                placeholder="0903123456"
              />
            )}
          </Field>
          <Field label="Email">
            {(p) => (
              <Input
                {...p}
                type="email"
                value={cEmail}
                onChange={(e) => setCEmail(e.target.value)}
              />
            )}
          </Field>
          <Field label="Nhãn phân loại">
            {() => (
              <div className="flex gap-2">
                {['VIP', 'THÂN THIẾT', 'DOANH NGHIỆP', 'BLACKLIST'].map(
                  (tag) => {
                    const active = cTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setCTags((prev) =>
                            prev.includes(tag)
                              ? prev.filter((x) => x !== tag)
                              : [...prev, tag],
                          )
                        }
                        className={`rounded-control border px-3 py-1 text-xs font-semibold ${
                          active
                            ? 'border-brand-border bg-brand-subtle text-brand-fg'
                            : 'border-border-subtle bg-surface-2 text-fg-muted'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </Field>
          <Field label="Ghi chú sở thích / lưu ý">
            {(p) => (
              <Textarea
                {...p}
                rows={2}
                value={cNote}
                onChange={(e) => setCNote(e.target.value)}
                placeholder="VD: Ưu tiên ghế đầu, hay đi chuyến sáng…"
              />
            )}
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Hủy
            </Button>
            <Button loading={saving} onClick={handleCreate}>
              Lưu khách hàng
            </Button>
          </div>
        </div>
      </Modal>
    </AdminShell>
  );
}
