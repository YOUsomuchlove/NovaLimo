'use client';

import type {
  DriverDto,
  UserStatus,
  VehicleDto,
} from '@limousine-workspace/shared-types';
import {
  Avatar,
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
import ImgCrop from 'antd-img-crop';
import { ArrowLeft, KeyRound, Upload as UploadIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { AdminShell } from '../../../../../components/shell/AdminShell';
import { adminApi, resolveUploadUrl } from '../../../../../lib/api';

export default function DriverEditPage() {
  const { driverId } = useParams<{ driverId: string }>();
  const router = useRouter();
  const toast = useToast();

  const [driver, setDriver] = useState<DriverDto | null>(null);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseClass, setLicenseClass] = useState('D');
  const [licenseExpiresOn, setLicenseExpiresOn] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [defaultVehicleId, setDefaultVehicleId] = useState('');
  const [hiredOn, setHiredOn] = useState('');
  const [note, setNote] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!driverId) return;
    setLoading(true);
    setError(null);
    try {
      const [d, v] = await Promise.all([
        adminApi.driver(driverId),
        adminApi.vehicles({ limit: 100 }),
      ]);
      setDriver(d);
      setVehicles(v.items);
      setFullName(d.full_name);
      setPhone(d.phone);
      setEmail(d.email ?? '');
      setStatus(d.status);
      setAvatarUrl(d.avatar_url ?? '');
      setLicenseNumber(d.profile.license_number ?? '');
      setLicenseClass(d.profile.license_class ?? 'D');
      setLicenseExpiresOn(d.profile.license_expires_on ?? '');
      setDateOfBirth(d.profile.date_of_birth ?? '');
      setAddress(d.profile.address ?? '');
      setEmergencyContact(d.profile.emergency_contact ?? '');
      setDefaultVehicleId(d.profile.default_vehicle?.id ?? '');
      setHiredOn(d.profile.hired_on ?? '');
      setNote(d.profile.note ?? '');
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!driverId) return;
    setSaving(true);
    try {
      await adminApi.updateDriver(driverId, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        status,
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
      if (newPassword.trim()) {
        await adminApi.resetDriverPassword(driverId, newPassword.trim());
      }
      toast.success('Đã lưu hồ sơ tài xế');
      router.push(`/vehicles/drivers/${driverId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Sửa tài xế"
      subtitle="Chỉnh sửa hồ sơ tài xế và quyền truy cập ứng dụng"
      breadcrumbs={[
        { label: 'Đội xe & Tài xế', href: '/vehicles/drivers' },
        {
          label: driver?.full_name ?? 'Chi tiết',
          href: `/vehicles/drivers/${driverId}`,
        },
        { label: 'Sửa tài xế' },
      ]}
      headerExtra={
        <Link href={`/vehicles/drivers/${driverId}`}>
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
          {/* Hero Card (frame kvt1Y) */}
          <Card className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-5">
              <Avatar
                name={fullName}
                src={resolveUploadUrl(avatarUrl)}
                size={76}
              />
              <div>
                <h2 className="text-xl font-bold text-fg">{fullName}</h2>
                <p className="mt-1 text-xs text-fg-muted">
                  Cập nhật thông tin cá nhân, bằng lái, xe gắn mặc định và trạng
                  thái khóa tài khoản.
                </p>
                <div className="mt-3">
                  <ImgCrop
                    rotationSlider
                    aspect={1}
                    cropShape="round"
                    quality={0.92}
                    modalTitle="Cắt ảnh đại diện"
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
                            toast.success('Đã cập nhật ảnh đại diện');
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
                        Đổi ảnh đại diện
                      </Button>
                    </Upload>
                  </ImgCrop>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/vehicles/drivers/${driverId}`}>
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
            <FormSection
              title="Thông tin liên hệ & Tài khoản ứng dụng"
              description="Có thể khóa/mở khóa đăng nhập hoặc nhập mật khẩu mới nếu tài xế quên mật khẩu."
            >
              <Field label="Họ và tên" required>
                {(p) => (
                  <Input
                    {...p}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                )}
              </Field>

              <Field label="Số điện thoại (Tên đăng nhập)" required>
                {(p) => (
                  <Input
                    {...p}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
                  />
                )}
              </Field>

              <Field label="Trạng thái tài khoản App">
                {() => (
                  <Select
                    className="w-full"
                    value={status}
                    onChange={(v) => setStatus(v)}
                    options={[
                      { value: 'ACTIVE', label: 'Đang hoạt động' },
                      { value: 'LOCKED', label: 'Khóa đăng nhập' },
                      { value: 'INACTIVE', label: 'Ngừng làm việc' },
                    ]}
                  />
                )}
              </Field>

              <Field
                label="Đặt lại mật khẩu mới (để trống nếu giữ nguyên)"
                hint="Tối thiểu 8 ký tự, gồm cả chữ và số"
                className="sm:col-span-2"
              >
                {(p) => (
                  <div className="flex gap-2">
                    <Input
                      {...p}
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới nếu muốn cấp lại cho tài xế…"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      leftIcon={<KeyRound className="size-4" />}
                      onClick={() =>
                        setNewPassword(
                          `Nova${Math.floor(1000 + Math.random() * 9000)}a`,
                        )
                      }
                    >
                      Sinh ngẫu nhiên
                    </Button>
                  </div>
                )}
              </Field>
            </FormSection>

            <FormSection title="Bằng lái & Phân công phương tiện">
              <Field label="Số GPLX">
                {(p) => (
                  <Input
                    {...p}
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                  />
                )}
              </Field>

              <Field label="Hạng GPLX">
                {() => (
                  <Select
                    className="w-full"
                    value={licenseClass}
                    onChange={(v) => setLicenseClass(v)}
                    options={[
                      { value: 'B2', label: 'Hạng B2' },
                      { value: 'C', label: 'Hạng C' },
                      { value: 'D', label: 'Hạng D' },
                      { value: 'E', label: 'Hạng E' },
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

              <Field label="Xe mặc định">
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

              <Field label="Ngày nhận việc">
                {(p) => (
                  <Input
                    {...p}
                    type="date"
                    value={hiredOn}
                    onChange={(e) => setHiredOn(e.target.value)}
                  />
                )}
              </Field>

              <Field label="Địa chỉ">
                {(p) => (
                  <Input
                    {...p}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                )}
              </Field>

              <Field label="Liên hệ khẩn cấp">
                {(p) => (
                  <Input
                    {...p}
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
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
              <Link href={`/vehicles/drivers/${driverId}`}>
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
