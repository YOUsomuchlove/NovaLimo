'use client';

import type { FinanceTransactionDto } from '@limousine-workspace/shared-types';
import {
  Button,
  Card,
  CardHeader,
  DateTime,
  DescriptionList,
  ErrorState,
  Money,
  Skeleton,
  StatusTag,
} from '@limousine-workspace/shared-ui';
import { ArrowLeft, Edit, Printer } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AdminShell } from '../../../components/shell/AdminShell';
import { adminApi } from '../../../lib/api';

export default function FinanceDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [txn, setTxn] = useState<FinanceTransactionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const t = await adminApi.financeTransaction(id);
      setTxn(t);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminShell
      title="Chi tiết giao dịch"
      subtitle="Xem đầy đủ thu/chi, hạng mục và chứng từ đối soát"
      breadcrumbs={[
        { label: 'Tài chính & Sổ quỹ', href: '/finance' },
        { label: txn ? `GD-${txn.id.slice(0, 8).toUpperCase()}` : 'Chi tiết' },
      ]}
      headerExtra={
        <div className="flex items-center gap-2">
          <Link href="/finance">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Sổ quỹ
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Printer className="size-4" />}
            onClick={() => window.print()}
          >
            In phiếu
          </Button>
          {txn && (
            <Link href={`/finance/${txn.id}/edit`}>
              <Button size="sm" leftIcon={<Edit className="size-4" />}>
                Sửa giao dịch
              </Button>
            </Link>
          )}
        </div>
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
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          {/* Hero Card (frame nvFnDet) */}
          <Card className="print-sheet flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-2xl font-bold text-brand-fg">
                  GD-{txn.id.slice(0, 8).toUpperCase()}
                </h2>
                <StatusTag domain="finance" status={txn.kind} />
              </div>
              <p className="mt-1 text-sm text-fg-secondary">
                {txn.memo || txn.category} ·{' '}
                <DateTime value={txn.occurred_at} />
              </p>
            </div>
            <Money
              value={txn.kind === 'INCOME' ? txn.amount_vnd : -txn.amount_vnd}
              signed
              className={`text-2xl font-bold ${
                txn.kind === 'INCOME' ? 'text-success-fg' : 'text-danger-fg'
              }`}
            />
          </Card>

          <Card className="print-sheet">
            <CardHeader title="Thông tin giao dịch" />
            <DescriptionList
              columns={2}
              items={[
                {
                  label: 'Mã giao dịch',
                  value: `GD-${txn.id.slice(0, 8).toUpperCase()}`,
                },
                {
                  label: 'Thời gian ghi nhận',
                  value: <DateTime value={txn.occurred_at} />,
                },
                {
                  label: 'Loại bút toán',
                  value: <StatusTag domain="finance" status={txn.kind} />,
                },
                { label: 'Hạng mục kế toán', value: txn.category },
                {
                  label: 'Số tiền',
                  value: (
                    <Money
                      value={
                        txn.kind === 'INCOME' ? txn.amount_vnd : -txn.amount_vnd
                      }
                      signed
                      className="font-bold text-fg"
                    />
                  ),
                },
                {
                  label: 'Người lập phiếu',
                  value: txn.created_by?.full_name ?? 'Hệ thống tự động',
                },
                {
                  label: 'Chứng từ tham chiếu',
                  value: txn.reference_type
                    ? `${txn.reference_type} (${txn.reference_id ?? ''})`
                    : 'Bút toán trực tiếp',
                },
                {
                  label: 'Ngày tạo bản ghi',
                  value: <DateTime value={txn.created_at} />,
                },
                {
                  label: 'Nội dung & Chứng từ',
                  value: txn.memo ?? '—',
                  full: true,
                },
              ]}
            />
          </Card>
        </div>
      )}
    </AdminShell>
  );
}
