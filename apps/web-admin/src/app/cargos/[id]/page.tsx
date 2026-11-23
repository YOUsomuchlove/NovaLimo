'use client';

import {
  CARGO_TRANSITIONS,
  type CargoDto,
  type CargoStatus,
} from '@limousine-workspace/shared-types';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DateTime,
  DescriptionList,
  DetailLayout,
  ErrorState,
  MapView,
  Money,
  Skeleton,
  StatusTag,
  Timeline,
  useToast,
} from '@limousine-workspace/shared-ui';
import { ArrowLeft, Edit, Printer } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AdminShell } from '../../../components/shell/AdminShell';
import { adminApi, resolveUploadUrl } from '../../../lib/api';

const CARGO_STATUS_LABELS: Record<CargoStatus, string> = {
  CREATED: 'Chờ tiếp nhận',
  PICKED_UP: 'Xác nhận đã nhận hàng',
  IN_TRANSIT: 'Đang vận chuyển',
  DELIVERED: 'Hoàn tất giao hàng',
  RETURNED: 'Hoàn trả người gửi',
  CANCELLED: 'Hủy vận đơn',
};

export default function CargoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [cargo, setCargo] = useState<CargoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const c = await adminApi.cargo(id);
      setCargo(c);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStatusChange = async (next: CargoStatus) => {
    if (!cargo) return;
    try {
      const updated = await adminApi.updateCargo(cargo.id, { status: next });
      setCargo(updated);
      toast.success(
        `Đã chuyển trạng thái vận đơn sang ${CARGO_STATUS_LABELS[next]}`,
      );
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Không thể chuyển trạng thái',
      );
    }
  };

  const nextStatuses = cargo ? CARGO_TRANSITIONS[cargo.status] : [];

  return (
    <AdminShell
      title="Chi tiết vận đơn ký gửi"
      subtitle="Xem thông tin vận đơn, phí vận chuyển, COD và lịch sử trạng thái"
      breadcrumbs={[
        { label: 'Vận hành Hàng hóa', href: '/cargos' },
        { label: cargo?.waybill_code ?? 'Chi tiết vận đơn' },
      ]}
      headerExtra={
        <div className="flex items-center gap-2">
          <Link href="/cargos">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Danh sách
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
          {cargo && (
            <Link href={`/cargos/${cargo.id}/edit`}>
              <Button size="sm" leftIcon={<Edit className="size-4" />}>
                Sửa đơn
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
      ) : loading || !cargo ? (
        <Card className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full" rounded="card" />
          <Skeleton className="h-64 w-full" rounded="card" />
        </Card>
      ) : (
        <DetailLayout
          main={
            <>
              {/* Hero Card (frame nvOrdP2Det) */}
              <Card className="print-sheet flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-mono text-2xl font-bold text-brand-fg">
                      {cargo.waybill_code}
                    </h2>
                    <StatusTag domain="cargo" status={cargo.status} />
                    {cargo.is_fragile && <Badge tone="warning">Dễ vỡ</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-fg-secondary">
                    Ký gửi hàng hóa · Tuyến {cargo.route.name} ·{' '}
                    <DateTime value={cargo.created_at} />
                  </p>
                </div>

                <div className="no-print flex flex-wrap gap-2">
                  {nextStatuses.map((st) => (
                    <Button
                      key={st}
                      size="sm"
                      variant={st === 'CANCELLED' ? 'danger' : 'secondary'}
                      onClick={() => void handleStatusChange(st)}
                    >
                      {CARGO_STATUS_LABELS[st]}
                    </Button>
                  ))}
                </div>
              </Card>

              <Card className="print-sheet">
                <CardHeader title="Thông tin vận đơn" />
                <DescriptionList
                  columns={2}
                  items={[
                    { label: 'Mã vận đơn', value: cargo.waybill_code },
                    {
                      label: 'Quy cách kiện hàng',
                      value: `Cỡ ${cargo.size} · ${cargo.weight_kg} kg ${cargo.is_fragile ? '· Dễ vỡ' : ''}`,
                    },
                    {
                      label: 'Người gửi & Điểm nhận (PostGIS)',
                      value: `${cargo.sender.name} (${cargo.sender.phone}) — ${cargo.sender.address}`,
                      full: true,
                    },
                    {
                      label: 'Người nhận & Điểm giao (PostGIS)',
                      value: `${cargo.receiver.name} (${cargo.receiver.phone}) — ${cargo.receiver.address}`,
                      full: true,
                    },
                    {
                      label: 'Nội dung hàng hóa',
                      value: cargo.description,
                      full: true,
                    },
                    {
                      label: 'Phí vận chuyển',
                      value: (
                        <span>
                          <Money
                            value={cargo.fee_vnd}
                            className="font-bold text-brand-fg"
                          />{' '}
                          (
                          {cargo.fee_payer === 'SENDER'
                            ? 'Người gửi trả'
                            : 'Người nhận trả'}
                          )
                        </span>
                      ),
                    },
                    {
                      label: 'Thu hộ COD',
                      value:
                        cargo.cod_amount_vnd > 0 ? (
                          <span>
                            <Money
                              value={cargo.cod_amount_vnd}
                              className="font-bold text-fg"
                            />{' '}
                            {cargo.cod_collected_at
                              ? '(Đã thu COD)'
                              : '(Chưa thu)'}
                          </span>
                        ) : (
                          'Không thu hộ COD'
                        ),
                    },
                    {
                      label: 'Chuyến xe vận chuyển',
                      value: cargo.trip_run_id ? (
                        <Link
                          href={`/trip-runs/${cargo.trip_run_id}`}
                          className="font-semibold text-brand-fg hover:underline"
                        >
                          Xem chuyến chạy →
                        </Link>
                      ) : (
                        <Link
                          href="/cargos/handoff"
                          className="text-brand-fg hover:underline"
                        >
                          Chưa gán xe — Bàn giao trung chuyển →
                        </Link>
                      ),
                    },
                    {
                      label: 'Ghi chú',
                      value: cargo.note ?? '—',
                    },
                  ]}
                />

                {cargo.proof_photo_url && (
                  <div className="mt-6 border-t border-border-subtle pt-4">
                    <p className="mb-2 text-xs font-semibold uppercase text-fg-muted">
                      Ảnh xác nhận giao/nhận hàng
                    </p>
                    <img
                      src={resolveUploadUrl(cargo.proof_photo_url)}
                      alt="Ảnh xác nhận"
                      className="max-h-64 rounded-control border border-border-subtle object-cover"
                    />
                  </div>
                )}
              </Card>

              <Card className="no-print">
                <CardHeader title="Bản đồ điểm nhận / giao PostGIS" />
                <MapView
                  height={260}
                  markers={[
                    {
                      id: 'sender',
                      lat: cargo.sender.location.lat,
                      lng: cargo.sender.location.lng,
                      label: 'N',
                      title: `Nhận: ${cargo.sender.address}`,
                      tone: 'info',
                    },
                    {
                      id: 'receiver',
                      lat: cargo.receiver.location.lat,
                      lng: cargo.receiver.location.lng,
                      label: 'G',
                      title: `Giao: ${cargo.receiver.address}`,
                      tone: 'brand',
                    },
                  ]}
                />
              </Card>
            </>
          }
          aside={
            <Card>
              <CardHeader title="Lịch sử trạng thái" />
              <Timeline
                items={[
                  {
                    title: 'Tiếp nhận vận đơn',
                    time: <DateTime value={cargo.created_at} />,
                    tone: 'brand',
                  },
                  ...(cargo.picked_up_at
                    ? [
                        {
                          title: 'Tài xế đã nhận hàng',
                          time: <DateTime value={cargo.picked_up_at} />,
                          tone: 'info' as const,
                        },
                      ]
                    : []),
                  ...(cargo.delivered_at
                    ? [
                        {
                          title: 'Hoàn tất giao hàng',
                          time: <DateTime value={cargo.delivered_at} />,
                          tone: 'success' as const,
                        },
                      ]
                    : []),
                ]}
              />
            </Card>
          }
        />
      )}
    </AdminShell>
  );
}
