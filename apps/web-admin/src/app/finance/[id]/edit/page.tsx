'use client';

import type {
  FinanceCategory,
  FinanceKind,
  FinanceTransactionDto,
} from '@limousine-workspace/shared-types';
import {
  Button,
  Card,
  CardFooter,
  ErrorState,
  Field,
  FormSection,
  Input,
  Skeleton,
  Textarea,
  useToast,
} from '@limousine-workspace/shared-ui';
import { Select } from 'antd';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { AdminShell } from '../../../../components/shell/AdminShell';
import { adminApi } from '../../../../lib/api';

export default function FinanceEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [txn, setTxn] = useState<FinanceTransactionDto | null>(null);
  const [kind, setKind] = useState<FinanceKind>('INCOME');
  const [category, setCategory] = useState<FinanceCategory>('TICKET');
  const [amountVnd, setAmountVnd] = useState('0');
  const [occurredAt, setOccurredAt] = useState('');
  const [memo, setMemo] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const t = await adminApi.financeTransaction(id);
      setTxn(t);
      setKind(t.kind);
      setCategory(t.category);
      setAmountVnd(String(t.amount_vnd));
      setOccurredAt(t.occurred_at.slice(0, 16));
      setMemo(t.memo ?? '');
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await adminApi.updateFinanceTransaction(id, {
        kind,
        category,
        amount_vnd: Number(amountVnd) || 0,
        occurred_at: occurredAt
          ? new Date(occurredAt).toISOString()
          : undefined,
        memo: memo.trim() || undefined,
      });
      toast.success('Đã cập nhật bút toán tài chính');
      router.push(`/finance/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Sửa giao dịch"
      subtitle="Cập nhật nội dung, số tiền và hạng mục trước khi khóa sổ"
      breadcrumbs={[
        { label: 'Tài chính & Sổ quỹ', href: '/finance' },
        {
          label: txn ? `GD-${txn.id.slice(0, 8).toUpperCase()}` : 'Chi tiết',
          href: `/finance/${id}`,
        },
        { label: 'Sửa giao dịch' },
      ]}
      headerExtra={
        <Link href={`/finance/${id}`}>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowLeft className="size-4" />}
          >
            Quay lại
          </Button>
        </Link>
      }
    >
      {error ? (
        <Card>
          <ErrorState onRetry={load} />
        </Card>
      ) : loading || !txn ? (
        <Card>
          <Skeleton className="h-64 w-full" rounded="card" />
        </Card>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-4xl flex-col gap-6"
        >
          <Card>
            <FormSection
              title="Dữ liệu bút toán (nvFnEd)"
              description="Mọi thao tác chỉnh sửa bút toán đều được tự động ghi vào Audit Log."
            >
              <Field label="Mã giao dịch (Khóa)">
                {(p) => (
                  <Input
                    {...p}
                    disabled
                    value={`GD-${txn.id.slice(0, 8).toUpperCase()}`}
                  />
                )}
              </Field>
              <Field label="Thời gian ghi nhận">
                {(p) => (
                  <Input
                    {...p}
                    type="datetime-local"
                    value={occurredAt}
                    onChange={(e) => setOccurredAt(e.target.value)}
                  />
                )}
              </Field>
              <Field label="Loại bút toán">
                {() => (
                  <Select
                    className="w-full"
                    value={kind}
                    onChange={(v) => setKind(v)}
                    options={[
                      { value: 'INCOME', label: 'Thu (+)' },
                      { value: 'EXPENSE', label: 'Chi (-)' },
                    ]}
                  />
                )}
              </Field>
              <Field label="Hạng mục">
                {() => (
                  <Select
                    className="w-full"
                    value={category}
                    onChange={(v) => setCategory(v)}
                    options={[
                      { value: 'TICKET', label: 'Doanh thu vé' },
                      { value: 'CARGO', label: 'Cước hàng hóa' },
                      { value: 'COD', label: 'Đối soát COD' },
                      { value: 'FUEL', label: 'Nhiên liệu' },
                      { value: 'TOLL', label: 'Phí cầu đường' },
                      { value: 'SALARY', label: 'Lương tài xế / NV' },
                      { value: 'MAINTENANCE', label: 'Bảo dưỡng xe' },
                      { value: 'REFUND', label: 'Hoàn tiền vé' },
                      { value: 'OTHER', label: 'Khác' },
                    ]}
                  />
                )}
              </Field>
              <Field label="Số tiền (VND)" required className="sm:col-span-2">
                {(p) => (
                  <Input
                    {...p}
                    type="number"
                    min={1}
                    value={amountVnd}
                    onChange={(e) => setAmountVnd(e.target.value)}
                  />
                )}
              </Field>
              <Field label="Nội dung chi tiết" className="sm:col-span-2">
                {(p) => (
                  <Textarea
                    {...p}
                    rows={3}
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                  />
                )}
              </Field>
            </FormSection>

            <CardFooter>
              <Link href={`/finance/${id}`}>
                <Button type="button" variant="ghost">
                  Hủy
                </Button>
              </Link>
              <Button type="submit" loading={saving}>
                Lưu thay đổi
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </AdminShell>
  );
}
