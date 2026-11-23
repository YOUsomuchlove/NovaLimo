'use client';

import type { VehicleDto } from '@limousine-workspace/shared-types';
import {
  Avatar,
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
import ImgCrop from 'antd-img-crop';
import {
  ArrowLeft,
  KeyRound,
  Trash2,
  Upload as UploadIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';
import { AdminShell } from '../../../../components/shell/AdminShell';
import { adminApi, resolveUploadUrl } from '../../../../lib/api';

export default function DriverCreatePage() {
  const router = useRouter();
  const toast = useToast();

  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('NovaDriver2026');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseClass, setLicenseClass] = useState('D');
  const [licenseExpiresOn, setLicenseExpiresOn] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [defaultVehicleId, setDefaultVehicleId] = useState<string>('');
  const [hiredOn, setHiredOn] = useState('');
  const [note, setNote] = useState('');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void adminApi
      .vehicles({ limit: 100 })
      .then((res) => setVehicles(res.items))
      .catch(() => null);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !password) {
      toast.error('Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Mật khẩu.');
      return;
    }
    setSaving(true);
    try {
      const created = await adminApi.createDriver({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        password,
        avatar_url: avatarUrl || undefined,
        profile: {
          license_number: licenseNumber.trim() || undefined,
          license_class: licenseClass.trim() || undefined,
          license_expires_on: licenseExpiresOn || undefined,
          date_of_birth: dateOfBirth || undefined,
          address: address.trim() || undefined,
          emergency_contact: emergencyContact.trim() || undefined,
          default_vehicle_id: defaultVehicleId || undefined,
          hired_on: hiredOn || undefined,
          note: note.trim() || undefined,
        },
      });
      toast.success(`Đã tạo tài xế ${created.full_name}`);
      router.push(`/vehicles/drivers/${created.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Không thể tạo hồ sơ tài xế',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Tạo tài xế mới"
      subtitle="Tạo hồ sơ và tài khoản đăng nhập ứng dụng Mobile cho tài xế"
      breadcrumbs={[
        { label: 'Đội xe & Tài xế', href: '/vehicles/drivers' },
        { label: 'Tạo tài xế mới' },
      ]}
      headerExtra={
        <Link href="/vehicles/drivers">
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
        {/* Hero Card (frame vnCreDrv) */}
        <Card className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-5">
            <Avatar
              name={fullName || 'Tài xế mới'}
              src={resolveUploadUrl(avatarUrl)}
              size={84}
            />
            <div>
              <h2 className="text-lg font-semibold text-fg">
                Hồ sơ & tài khoản ứng dụng tài xế
              </h2>
              <p className="mt-1 text-xs text-fg-muted">
                Tài xế đăng nhập ứng dụng Mobile bằng Số điện thoại và Mật khẩu
                bạn khởi tạo.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <ImgCrop
                  rotationSlider
                  aspect={1}
                  cropShape="round"
                  quality={0.92}
                  modalTitle="Cắt ảnh đại diện tài xế"
                  modalOk="Xác nhận"
                  modalCancel="Hủy"
                >
                  <Upload
                    accept="image/jpeg,image/png,image/webp"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      setUploading(true);
                      void adminApi
                        .upload('avatars', file)
                        .then((res) => {
                          setAvatarUrl(res.url);
                          toast.success('Đã tải ảnh đại diện');
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
                      Tải ảnh đại diện
                    </Button>
                  </Upload>
                </ImgCrop>
                {avatarUrl && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    leftIcon={<Trash2 className="size-3.5" />}
                    onClick={() => setAvatarUrl('')}
                  >
                    Xóa ảnh
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/vehicles/drivers">
              <Button type="button" variant="ghost">
                Hủy
              </Button>
            </Link>
            <Button type="submit" loading={saving}>
              Tạo tài xế
            </Button>
          </div>
        </Card>

        {/* Contact & Account Section */}
        <Card>
          <FormSection
            title="Thông tin liên hệ & Đăng nhập"
            description="Số điện thoại cũng là tài khoản đăng nhập trên ứng dụng Tài xế."
          >
            <Field label="Họ và tên" required>
              {(p) => (
                <Input
                  {...p}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn An"
                />
              )}
            </Field>

            <Field label="Số điện thoại (Tài khoản đăng nhập)" required>
              {(p) => (
                <Input
                  {...p}
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                />
              )}
            </Field>

            <Field label="Email">
              {(p) => (
                <Input
                  {...p}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="an.nv@novalimo.vn"
                />
              )}
            </Field>

            <Field
              label="Mật khẩu khởi tạo"
              required
              hint="Tối thiểu 8 ký tự, có cả chữ và số. Có thể đổi lại sau khi tạo."
            >
              {(p) => (
                <div className="flex gap-2">
                  <Input
                    {...p}
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-md"
                    title="Sinh mật khẩu ngẫu nhiên"
                    onClick={() =>
                      setPassword(
                        `Nova${Math.floor(1000 + Math.random() * 9000)}a`,
                      )
                    }
                  >
                    <KeyRound className="size-4" />
                  </Button>
                </div>
              )}
            </Field>
          </FormSection>

          <FormSection
            title="Giấy phép lái xe & Phân công xe"
            description="Thông tin bằng lái, phương tiện gắn mặc định và liên hệ khẩn cấp."
          >
            <Field label="Số Giấy phép lái xe (GPLX)">
              {(p) => (
                <Input
                  {...p}
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="012345678901"
                />
              )}
            </Field>

            <Field label="Hạng bằng lái">
              {() => (
                <Select
                  className="w-full"
                  value={licenseClass}
                  onChange={(v) => setLicenseClass(v)}
                  options={[
                    { value: 'B2', label: 'Hạng B2' },
                    { value: 'C', label: 'Hạng C' },
                    { value: 'D', label: 'Hạng D (10–30 chỗ)' },
                    { value: 'E', label: 'Hạng E (> 30 chỗ)' },
                  ]}
                />
              )}
            </Field>

            <Field label="Hạn GPLX">
              {(p) => (
                <Input
                  {...p}
                  type="date"
                  value={licenseExpiresOn}
                  onChange={(e) => setLicenseExpiresOn(e.target.value)}
                />
              )}
            </Field>

            <Field label="Xe gắn mặc định">
              {() => (
                <Select
                  className="w-full"
                  value={defaultVehicleId}
                  onChange={(v) => setDefaultVehicleId(v)}
                  options={[
                    { value: '', label: 'Chưa gắn xe cố định' },
                    ...vehicles.map((v) => ({
                      value: v.id,
                      label: `${v.license_plate} — ${v.vehicle_type.name}`,
                    })),
                  ]}
                />
              )}
            </Field>

            <Field label="Ngày sinh">
              {(p) => (
                <Input
                  {...p}
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              )}
            </Field>

            <Field label="Ngày vào làm">
              {(p) => (
                <Input
                  {...p}
                  type="date"
                  value={hiredOn}
                  onChange={(e) => setHiredOn(e.target.value)}
                />
              )}
            </Field>

            <Field label="Địa chỉ thường trú">
              {(p) => (
                <Input
                  {...p}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Cầu Giấy, Hà Nội"
                />
              )}
            </Field>

            <Field label="Liên hệ khẩn cấp">
              {(p) => (
                <Input
                  {...p}
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Vợ/Chồng — 0988xxxxxx"
                />
              )}
            </Field>

            <Field label="Ghi chú nội bộ" className="sm:col-span-2">
              {(p) => (
                <Textarea
                  {...p}
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Chuyên tuyến Hà Nội – Hạ Long, thông thạo phố cổ…"
                />
              )}
            </Field>
          </FormSection>

          <CardFooter>
            <Link href="/vehicles/drivers">
              <Button type="button" variant="ghost">
                Hủy
              </Button>
            </Link>
            <Button type="submit" loading={saving}>
              Tạo tài xế
            </Button>
          </CardFooter>
        </Card>
      </form>
    </AdminShell>
  );
}
