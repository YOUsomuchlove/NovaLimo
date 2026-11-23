'use client';

import type {
  VehicleStatus,
  VehicleTypeDto,
} from '@limousine-workspace/shared-types';
import {
  Button,
  Card,
  CardFooter,
  Field,
  FormSection,
  Input,
  Textarea,
  useToast,
} from '@limousine-workspace/shared-ui';
import { Select, Upload } from 'antd';
import { ArrowLeft, Bus, Upload as UploadIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';
import { AdminShell } from '../../../components/shell/AdminShell';
import { adminApi, resolveUploadUrl } from '../../../lib/api';

export default function VehicleCreatePage() {
  const router = useRouter();
  const toast = useToast();

  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeDto[]>([]);
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleTypeId, setVehicleTypeId] = useState('');
  const [status, setStatus] = useState<VehicleStatus>('AVAILABLE');
  const [brand, setBrand] = useState('Ford');
  const [model, setModel] = useState('Transit DCar Limousine');
  const [year, setYear] = useState('2025');
  const [color, setColor] = useState('Đen');
  const [odometerKm, setOdometerKm] = useState('0');
  const [regExpires, setRegExpires] = useState('');
  const [insExpires, setInsExpires] = useState('');
  const [nextMaint, setNextMaint] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [note, setNote] = useState('');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void adminApi
      .vehicleTypes()
      .then((list) => {
        setVehicleTypes(list);
        if (list.length > 0) setVehicleTypeId(list[0].id);
      })
      .catch(() => null);
  }, []);

  const selectedType = vehicleTypes.find((t) => t.id === vehicleTypeId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!licensePlate.trim()) {
      toast.error('Vui lòng nhập biển số xe (VD: 29B-123.45)');
      return;
    }
    if (!vehicleTypeId) {
      toast.error('Vui lòng chọn loại xe');
      return;
    }
    setSaving(true);
    try {
      const created = await adminApi.createVehicle({
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
      toast.success(`Đã tạo phương tiện ${created.license_plate}`);
      router.push(`/vehicles/${created.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Không thể tạo phương tiện',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Tạo xe mới"
      subtitle="Nhập thông tin phương tiện trước khi đưa vào đội xe"
      breadcrumbs={[
        { label: 'Đội xe & Tài xế', href: '/vehicles' },
        { label: 'Tạo xe mới' },
      ]}
      headerExtra={
        <Link href="/vehicles">
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Hero Card (frame vnCreVeh) */}
        <Card className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-5">
            {imageUrl ? (
              <img
                src={resolveUploadUrl(imageUrl)}
                alt="Ảnh xe"
                className="h-24 w-36 rounded-control border border-border-subtle object-cover"
              />
            ) : (
              <div className="flex h-24 w-36 flex-col items-center justify-center rounded-control border border-dashed border-border-strong bg-surface-2 text-fg-muted">
                <Bus className="size-6 text-brand-fg" />
                <span className="mt-1 text-[11px]">Ảnh phương tiện</span>
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-fg">
                Đăng ký phương tiện mới
              </h2>
              <p className="mt-1 text-xs text-fg-muted">
                Biển số được kiểm tra trùng tự động trước khi lưu vào hệ thống.
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
                        toast.success('Đã tải ảnh phương tiện');
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
                    Tải ảnh xe
                  </Button>
                </Upload>
                {imageUrl && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setImageUrl('')}
                  >
                    Gỡ ảnh
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/vehicles">
              <Button type="button" variant="ghost">
                Hủy
              </Button>
            </Link>
            <Button type="submit" loading={saving}>
              Tạo xe
            </Button>
          </div>
        </Card>

        {/* Form Fields Card */}
        <Card>
          <FormSection
            title="Thông tin phương tiện"
            description="Biển số, loại xe, số chỗ và trạng thái khai thác ban đầu."
          >
            <Field
              label="Biển số"
              required
              hint="Định dạng chuẩn VN: 29B-123.45 hoặc 51K-999.99"
            >
              {(p) => (
                <Input
                  {...p}
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="29B-123.45"
                />
              )}
            </Field>

            <Field label="Loại xe" required>
              {() => (
                <Select
                  className="w-full"
                  value={vehicleTypeId}
                  onChange={(v) => setVehicleTypeId(v)}
                  placeholder="Chọn loại xe…"
                  options={vehicleTypes.map((vt) => ({
                    value: vt.id,
                    label: `${vt.name} (${vt.capacity} chỗ)`,
                  }))}
                />
              )}
            </Field>

            <Field label="Số chỗ ngồi (theo loại xe)">
              {(p) => (
                <Input
                  {...p}
                  disabled
                  value={selectedType ? `${selectedType.capacity} ghế` : '—'}
                />
              )}
            </Field>

            <Field label="Trạng thái ban đầu">
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

            <Field label="Hãng sản xuất">
              {(p) => (
                <Input
                  {...p}
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ford / Hyundai / Mercedes"
                />
              )}
            </Field>

            <Field label="Dòng xe / Phiên bản">
              {(p) => (
                <Input
                  {...p}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Transit DCar Limousine"
                />
              )}
            </Field>

            <Field label="Màu sơn">
              {(p) => (
                <Input
                  {...p}
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Đen"
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
                  placeholder="2025"
                />
              )}
            </Field>
          </FormSection>

          <FormSection
            title="Lịch bảo dưỡng & Đăng kiểm"
            description="Theo dõi số công-tơ-mét và hạn đăng kiểm / bảo hiểm định kỳ."
          >
            <Field label="Số KM hiện tại (Odometer)">
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

            <Field label="Ngày bảo dưỡng kế tiếp">
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

            <Field label="Ghi chú vận hành" className="sm:col-span-2">
              {(p) => (
                <Textarea
                  {...p}
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Xe mới nhập đội, có ghế massage VIP hàng giữa…"
                />
              )}
            </Field>
          </FormSection>

          <CardFooter>
            <Link href="/vehicles">
              <Button type="button" variant="ghost">
                Hủy
              </Button>
            </Link>
            <Button type="submit" loading={saving}>
              Tạo xe
            </Button>
          </CardFooter>
        </Card>
      </form>
    </AdminShell>
  );
}
