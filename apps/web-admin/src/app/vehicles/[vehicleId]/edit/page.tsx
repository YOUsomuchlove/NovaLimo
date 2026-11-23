'use client';

import type {
  VehicleDto,
  VehicleStatus,
  VehicleTypeDto,
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
import { Select, Upload } from 'antd';
import { ArrowLeft, Bus, Upload as UploadIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { AdminShell } from '../../../../components/shell/AdminShell';
import { adminApi, resolveUploadUrl } from '../../../../lib/api';

export default function VehicleEditPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const router = useRouter();
  const toast = useToast();

  const [vehicle, setVehicle] = useState<VehicleDto | null>(null);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleTypeId, setVehicleTypeId] = useState('');
  const [status, setStatus] = useState<VehicleStatus>('AVAILABLE');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [odometerKm, setOdometerKm] = useState('0');
  const [regExpires, setRegExpires] = useState('');
  const [insExpires, setInsExpires] = useState('');
  const [nextMaint, setNextMaint] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [note, setNote] = useState('');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!vehicleId) return;
    setLoading(true);
    setError(null);
    try {
      const [v, types] = await Promise.all([
        adminApi.vehicle(vehicleId),
        adminApi.vehicleTypes(),
      ]);
      setVehicle(v);
      setVehicleTypes(types);
      setLicensePlate(v.license_plate);
      setVehicleTypeId(v.vehicle_type.id);
      setStatus(v.status);
      setBrand(v.brand ?? '');
      setModel(v.model ?? '');
      setYear(v.year ? String(v.year) : '');
      setColor(v.color ?? '');
      setOdometerKm(String(v.odometer_km ?? 0));
      setRegExpires(v.registration_expires_on ?? '');
      setInsExpires(v.insurance_expires_on ?? '');
      setNextMaint(v.next_maintenance_on ?? '');
      setImageUrl(v.image_url ?? '');
      setNote(v.note ?? '');
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedType = vehicleTypes.find((t) => t.id === vehicleTypeId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!vehicleId) return;
    setSaving(true);
    try {
      await adminApi.updateVehicle(vehicleId, {
        license_plate: licensePlate.trim().toUpperCase(),
        vehicle_type_id: vehicleTypeId,
        status,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        year: year ? Number(year) : undefined,
        color: color.trim() || undefined,
        odometer_km: odometerKm ? Number(odometerKm) : 0,
        registration_expires_on: regExpires || undefined,
        insurance_expires_on: insExpires || undefined,
        next_maintenance_on: nextMaint || undefined,
        image_url: imageUrl || undefined,
        note: note.trim() || undefined,
      });
      toast.success('Đã lưu thay đổi phương tiện');
      router.push(`/vehicles/${vehicleId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Sửa xe"
      subtitle="Cập nhật thông tin phương tiện trong đội xe"
      breadcrumbs={[
        { label: 'Đội xe & Tài xế', href: '/vehicles' },
        {
          label: vehicle?.license_plate ?? 'Chi tiết',
          href: `/vehicles/${vehicleId}`,
        },
        { label: 'Sửa xe' },
      ]}
      headerExtra={
        <Link href={`/vehicles/${vehicleId}`}>
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
      ) : loading ? (
        <Card>
          <Skeleton className="h-64 w-full" rounded="card" />
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Hero Card (frame smD7h) */}
          <Card className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-5">
              {imageUrl ? (
                <img
                  src={resolveUploadUrl(imageUrl)}
                  alt={licensePlate}
                  className="h-24 w-36 rounded-control border border-border-subtle object-cover"
                />
              ) : (
                <div className="flex h-24 w-36 items-center justify-center rounded-control border border-dashed border-border-strong bg-surface-2 text-brand-fg">
                  <Bus className="size-7" />
                </div>
              )}
              <div>
                <h2 className="font-mono text-xl font-bold text-fg">
                  {licensePlate}
                </h2>
                <p className="mt-1 text-xs text-fg-muted">
                  Cập nhật hình ảnh, trạng thái và lịch bảo dưỡng phương tiện
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Upload
                    accept="image/jpeg,image/png,image/webp"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      setUploading(true);
                      void adminApi
                        .upload('vehicles', file)
                        .then((res) => {
                          setImageUrl(res.url);
                          toast.success('Đã tải ảnh xe');
                        })
                        .catch((e) =>
                          toast.error(
                            e instanceof Error ? e.message : 'Lỗi tải ảnh',
                          ),
                        )
                        .finally(() => setUploading(false));
                      return false;
                    }}
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      loading={uploading}
                      leftIcon={<UploadIcon className="size-3.5" />}
                    >
                      Đổi ảnh xe
                    </Button>
                  </Upload>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/vehicles/${vehicleId}`}>
                <Button type="button" variant="ghost">
                  Hủy
                </Button>
              </Link>
              <Button type="submit" loading={saving}>
                Lưu thay đổi
              </Button>
            </div>
          </Card>

          <Card>
            <FormSection title="Thông tin phương tiện">
              <Field label="Biển số" required>
                {(p) => (
                  <Input
                    {...p}
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                  />
                )}
              </Field>

              <Field label="Loại xe" required>
                {() => (
                  <Select
                    className="w-full"
                    value={vehicleTypeId}
                    onChange={(v) => setVehicleTypeId(v)}
                    options={vehicleTypes.map((vt) => ({
                      value: vt.id,
                      label: `${vt.name} (${vt.capacity} chỗ)`,
                    }))}
                  />
                )}
              </Field>

              <Field label="Số chỗ">
                {(p) => (
                  <Input
                    {...p}
                    disabled
                    value={
                      selectedType
                        ? `${selectedType.capacity} ghế`
                        : `${vehicle?.vehicle_type.capacity ?? 9} ghế`
                    }
                  />
                )}
              </Field>

              <Field label="Trạng thái">
                {() => (
                  <Select
                    className="w-full"
                    value={status}
                    onChange={(v) => setStatus(v)}
                    options={[
                      { value: 'AVAILABLE', label: 'Sẵn sàng' },
                      { value: 'IN_USE', label: 'Đang chạy' },
                      { value: 'MAINTENANCE', label: 'Bảo dưỡng' },
                      { value: 'INACTIVE', label: 'Ngừng hoạt động' },
                    ]}
                  />
                )}
              </Field>

              <Field label="Màu sơn">
                {(p) => (
                  <Input
                    {...p}
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                )}
              </Field>

              <Field label="Hãng xe">
                {(p) => (
                  <Input
                    {...p}
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                )}
              </Field>

              <Field label="Mẫu xe">
                {(p) => (
                  <Input
                    {...p}
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                )}
              </Field>

              <Field label="Năm sản xuất">
                {(p) => (
                  <Input
                    {...p}
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                )}
              </Field>
            </FormSection>

            <FormSection title="Odometer & Bảo dưỡng">
              <Field label="Số KM đã chạy">
                {(p) => (
                  <Input
                    {...p}
                    type="number"
                    min={0}
                    value={odometerKm}
                    onChange={(e) => setOdometerKm(e.target.value)}
                  />
                )}
              </Field>
              <Field label="Bảo dưỡng kế tiếp">
                {(p) => (
                  <Input
                    {...p}
                    type="date"
                    value={nextMaint}
                    onChange={(e) => setNextMaint(e.target.value)}
                  />
                )}
              </Field>
              <Field label="Hạn đăng kiểm">
                {(p) => (
                  <Input
                    {...p}
                    type="date"
                    value={regExpires}
                    onChange={(e) => setRegExpires(e.target.value)}
                  />
                )}
              </Field>
              <Field label="Hạn bảo hiểm">
                {(p) => (
                  <Input
                    {...p}
                    type="date"
                    value={insExpires}
                    onChange={(e) => setInsExpires(e.target.value)}
                  />
                )}
              </Field>
              <Field label="Ghi chú" className="sm:col-span-2">
                {(p) => (
                  <Textarea
                    {...p}
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                )}
              </Field>
            </FormSection>

            <CardFooter>
              <Link href={`/vehicles/${vehicleId}`}>
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
