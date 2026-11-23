'use client';

import type {
  FinanceCategory,
  FinanceKind,
  FinanceTransactionDto,
} from '@limousine-workspace/shared-types';
import {
  Badge,
  Button,
  DataTable,
  DateTime,
  Field,
  FilterBar,
  Input,
  KpiCard,
  Money,
  StatusTag,
  Textarea,
  useToast,
} from '@limousine-workspace/shared-ui';
import { Modal, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../components/shell/AdminShell';
import { adminApi, exportToCsv } from '../../lib/api';

const CATEGORY_LABELS: Record<FinanceCategory, string> = {
  TICKET: 'Doanh thu vé',
  CARGO: 'Cước hàng hóa',
  COD: 'Đối soát COD',
  FUEL: 'Nhiên liệu',
  TOLL: 'Phí cầu đường',
  SALARY: 'Lương tài xế / NV',
  MAINTENANCE: 'Bảo dưỡng xe',
  REFUND: 'Hoàn tiền vé',
  OTHER: 'Khác',
};

export default function FinancePage() {
  const router = useRouter();
  const toast = useToast();

  const [txns, setTxns] = useState<FinanceTransactionDto[] | undefined>(
    undefined,
  );
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<FinanceKind | ''>('');
  const [category, setCategory] = useState<FinanceCategory | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // Create Transaction Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [fKind, setFKind] = useState<FinanceKind>('EXPENSE');
  const [fCat, setFCat] = useState<FinanceCategory>('FUEL');
  const [fAmount, setFAmount] = useState('1500000');
  const [fDate, setFDate] = useState(() =>
    new Date().toISOString().slice(0, 16),
  );
  const [fMemo, setFMemo] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.financeTransactions({
        page,
        limit,
        q: q.trim() || undefined,
        kind: kind || undefined,
        category: category || undefined,
      });
      setTxns(res.items);
      setTotal(res.total);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, kind, category]);

  useEffect(() => {
    void load();
  }, [load]);

  const kpis = useMemo(() => {
    const list = txns ?? [];
    const income = list
      .filter((t) => t.kind === 'INCOME')
      .reduce((s, t) => s + t.amount_vnd, 0);
    const expense = list
      .filter((t) => t.kind === 'EXPENSE')
      .reduce((s, t) => s + t.amount_vnd, 0);
    return {
      income,
      expense,
      net: income - expense,
      count: total || list.length,
    };
  }, [txns, total]);

  const handleCreate = async () => {
    if (!Number(fAmount) || Number(fAmount) <= 0) {
      toast.error('Số tiền giao dịch phải lớn hơn 0');
      return;
    }
    setSaving(true);
    try {
      const created = await adminApi.createFinanceTransaction({
        kind: fKind,
        category: fCat,
        amount_vnd: Number(fAmount),
        occurred_at: new Date(fDate).toISOString(),
        memo: fMemo.trim() || undefined,
      });
      toast.success('Đã ghi nhận bút toán vào Sổ quỹ');
      setCreateOpen(false);
      setFMemo('');
      router.push(`/finance/${created.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể tạo giao dịch');
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<FinanceTransactionDto> = useMemo(
    () => [
      {
        title: 'Mã GD',
        dataIndex: 'id',
        key: 'id',
        render: (id: string) => (
          <Link
            href={`/finance/${id}`}
            className="font-mono text-xs font-semibold text-brand-fg hover:underline"
          >
            GD-{id.slice(0, 8).toUpperCase()}
          </Link>
        ),
      },
      {
        title: 'Thời gian',
        dataIndex: 'occurred_at',
        key: 'occurred_at',
        render: (d: string) => <DateTime value={d} />,
      },
      {
        title: 'Loại',
        dataIndex: 'kind',
        key: 'kind',
        render: (k: FinanceKind) => <StatusTag domain="finance" status={k} />,
      },
      {
        title: 'Hạng mục',
        dataIndex: 'category',
        key: 'category',
        render: (c: FinanceCategory) => (
          <Badge tone="neutral">{CATEGORY_LABELS[c] ?? c}</Badge>
        ),
      },
      {
        title: 'Nội dung / Diễn giải',
        dataIndex: 'memo',
        key: 'memo',
        render: (m: string | null, r) => (
          <div>
            <p className="text-sm text-fg">
              {m || CATEGORY_LABELS[r.category]}
            </p>
            {r.reference_type && (
              <p className="text-xs text-fg-muted">
                Tham chiếu: {r.reference_type}
              </p>
            )}
          </div>
        ),
      },
      {
        title: 'Số tiền',
        key: 'amount',
        render: (_, r) => (
          <Money
            value={r.kind === 'INCOME' ? r.amount_vnd : -r.amount_vnd}
            signed
            className={`font-semibold ${
              r.kind === 'INCOME' ? 'text-success-fg' : 'text-danger-fg'
            }`}
          />
        ),
      },
      {
        title: 'Người lập',
        key: 'creator',
        render: (_, r) => (
          <span className="text-xs text-fg-secondary">
            {r.created_by?.full_name ?? 'Hệ thống tự động'}
          </span>
        ),
      },
      {
        title: 'Thao tác',
        key: 'actions',
        align: 'right',
        render: (_, r) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Link href={`/finance/${r.id}`}>
              <Button size="icon-sm" variant="ghost" aria-label="Chi tiết">
                <Eye className="size-4" />
              </Button>
            </Link>
            <Link href={`/finance/${r.id}/edit`}>
              <Button size="icon-sm" variant="ghost" aria-label="Chỉnh sửa">
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
      title="Quản lý Tài chính"
      subtitle="Sổ quỹ · Thu/Chi · Đối soát tự động · Xuất báo cáo kế toán"
    >
      <div className="flex flex-col gap-6">
        {/* 4 KPI Cards (frame nvFnKpi) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Tổng thu (trang hiện tại)"
            value={<Money value={kpis.income} />}
            icon={<ArrowUpRight className="size-4" />}
          />
          <KpiCard
            label="Tổng chi (trang hiện tại)"
            value={<Money value={kpis.expense} />}
            icon={<ArrowDownRight className="size-4" />}
          />
          <KpiCard
            label="Chênh lệch Thu - Chi"
            value={<Money value={kpis.net} signed />}
            icon={<Wallet className="size-4" />}
          />
          <KpiCard
            label="Tổng bút toán sổ quỹ"
            value={`${kpis.count} GD`}
            icon={<Wallet className="size-4" />}
          />
        </div>

        {/* Table */}
        <DataTable<FinanceTransactionDto>
          columns={columns}
          data={txns}
          rowKey="id"
          loading={loading}
          error={error}
          onRetry={load}
          onRowClick={(row) => router.push(`/finance/${row.id}`)}
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
                placeholder: 'Tìm theo nội dung phiếu thu/chi…',
              }}
              onReset={
                q || kind || category
                  ? () => {
                      setQ('');
                      setKind('');
                      setCategory('');
                      setPage(1);
                    }
                  : undefined
              }
              actions={
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Download className="size-3.5" />}
                    onClick={() => {
                      if (!txns?.length) return;
                      exportToCsv('novalimo-finance.csv', txns, [
                        { header: 'Mã GD', value: (r) => r.id },
                        { header: 'Thời gian', value: (r) => r.occurred_at },
                        { header: 'Loại', value: (r) => r.kind },
                        { header: 'Hạng mục', value: (r) => r.category },
                        { header: 'Số tiền VND', value: (r) => r.amount_vnd },
                        { header: 'Diễn giải', value: (r) => r.memo },
                      ]);
                    }}
                  >
                    Xuất CSV
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<RefreshCw className="size-3.5" />}
                    onClick={load}
                  >
                    Làm mới
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<Plus className="size-4" />}
                    onClick={() => setCreateOpen(true)}
                  >
                    Tạo phiếu Thu / Chi
                  </Button>
                </>
              }
            >
              <Select
                className="w-full sm:w-40"
                value={kind}
                onChange={(v) => {
                  setKind(v);
                  setPage(1);
                }}
                options={[
                  { value: '', label: 'Thu & Chi' },
                  { value: 'INCOME', label: 'Phiếu Thu (+)' },
                  { value: 'EXPENSE', label: 'Phiếu Chi (-)' },
                ]}
              />
              <Select
                className="w-full sm:w-48"
                value={category}
                onChange={(v) => {
                  setCategory(v);
                  setPage(1);
                }}
                options={[
                  { value: '', label: 'Mọi hạng mục' },
                  ...Object.entries(CATEGORY_LABELS).map(([k, v]) => ({
                    value: k,
                    label: v,
                  })),
                ]}
              />
            </FilterBar>
          }
          empty={{
            title: 'Chưa có bút toán tài chính nào',
            description:
              'Tạo phiếu thu/chi hoặc xác nhận thanh toán vé / đối soát COD.',
          }}
        />
      </div>

      <Modal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        title="Tạo phiếu Thu / Chi sổ quỹ"
        footer={null}
      >
        <div className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Loại bút toán" required>
              {() => (
                <Select
                  className="w-full"
                  value={fKind}
                  onChange={(v) => setFKind(v)}
                  options={[
                    { value: 'INCOME', label: 'Phiếu Thu (+)' },
                    { value: 'EXPENSE', label: 'Phiếu Chi (-)' },
                  ]}
                />
              )}
            </Field>
            <Field label="Hạng mục" required>
              {() => (
                <Select
                  className="w-full"
                  value={fCat}
                  onChange={(v) => setFCat(v)}
                  options={Object.entries(CATEGORY_LABELS).map(([k, v]) => ({
                    value: k,
                    label: v,
                  }))}
                />
              )}
            </Field>
          </div>
          <Field label="Số tiền (VND)" required>
            {(p) => (
              <Input
                {...p}
                type="number"
                min={1000}
                value={fAmount}
                onChange={(e) => setFAmount(e.target.value)}
              />
            )}
          </Field>
          <Field label="Thời điểm phát sinh" required>
            {(p) => (
              <Input
                {...p}
                type="datetime-local"
                value={fDate}
                onChange={(e) => setFDate(e.target.value)}
              />
            )}
          </Field>
          <Field label="Nội dung / Diễn giải chứng từ">
            {(p) => (
              <Textarea
                {...p}
                rows={3}
                value={fMemo}
                onChange={(e) => setFMemo(e.target.value)}
                placeholder="VD: Đổ dầu xe 29B-123.45 / Lương tài xế ca đêm…"
              />
            )}
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Hủy
            </Button>
            <Button loading={saving} onClick={handleCreate}>
              Ghi sổ quỹ
            </Button>
          </div>
        </div>
      </Modal>
    </AdminShell>
  );
}
