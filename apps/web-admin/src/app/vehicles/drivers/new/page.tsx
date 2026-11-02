'use client';

import React from 'react';
import Link from 'next/link';
import {
  BellOutlined,
  DeleteOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { App, Button, Form, Input, Select, Upload } from 'antd';
import type { UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import { AdminShell } from '@limousine-workspace/shared-ui/legacy';
import { AdminDarkPanel } from '@limousine-workspace/shared-ui/legacy';
import { AdminPenMeta } from '../../../../components/AdminPenMeta';
import { authFetch, getApiBaseUrl } from '../../../../lib/api';

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

const TW = {
  surface: cx(
    'rounded-2xl border border-white/10 bg-[#070b18]',
    'shadow-[0_20px_60px_rgba(0,0,0,0.35)]',
  ),
  sectionTitle: cx('text-[16px] font-extrabold tracking-tight text-white'),
  sectionSub: cx('mt-1 text-[12px] font-medium text-white/45'),
  label: cx('text-[11px] font-semibold text-white/55'),
  input: cx(
    'h-10! rounded-xl! border-white/10! bg-white/5! text-white!',
    '[&.ant-input-affix-wrapper]:bg-white/5!',
    '[&.ant-input-affix-wrapper]:border-white/10!',
    '[&.ant-input-affix-wrapper]:shadow-none!',
    '[&.ant-input-affix-wrapper:hover]:border-white/20!',
    '[&_.ant-input]:bg-transparent! [&_.ant-input]:text-white/85!',
    '[&_.ant-input::placeholder]:text-white/30',
  ),
  textarea: cx(
    'rounded-xl! border-white/10! bg-white/5! text-white!',
    'shadow-none! hover:border-white/20!',
    '[&_.ant-input]:bg-transparent! [&_.ant-input]:text-white/85!',
    '[&_.ant-input::placeholder]:text-white/30',
  ),
  select: cx(
    'w-full!',
    '[&_.ant-select-selector]:rounded-xl!',
    '[&_.ant-select-selector]:border-white/10!',
    '[&_.ant-select-selector]:bg-white/5!',
    '[&_.ant-select-selector]:text-white/85!',
    '[&_.ant-select-selector]:h-10!',
    '[&_.ant-select-selection-item]:leading-[38px]!',
    '[&_.ant-select-selection-placeholder]:text-white/30!',
    '[&_.ant-select-arrow]:text-white/55!',
  ),
  selectPopup: cx(
    'rounded-xl border border-white/10 bg-[#0b1020]',
    '[&_.ant-select-item]:text-white/80',
    '[&_.ant-select-item-option-active]:bg-white/5',
    '[&_.ant-select-item-option-selected]:bg-white/8',
    '[&_.ant-select-item-option-selected]:text-nova-gold',
  ),
  ghostBtn: cx(
    'h-10! rounded-xl!',
    'border border-white/10!',
    'bg-white/5! text-white/80!',
    'shadow-none!',
    'hover:bg-white/10! hover:border-white/20! hover:text-white!',
  ),
  primaryBtn: cx(
    'h-10! rounded-xl!',
    'border-0!',
    'bg-nova-gold! text-black!',
    'hover:bg-[#c9a85c]!',
    'font-bold!',
  ),
  iconBtn: cx(
    'inline-flex! size-10! items-center justify-center rounded-xl',
    'border border-white/10 bg-white/5 text-white/75!',
    'hover:bg-white/10! hover:border-white/20! hover:text-white!',
  ),
} as const;

function HeaderRight() {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <Button
        type="text"
        aria-label="Thông báo"
        className={TW.iconBtn}
        icon={<BellOutlined className="text-[18px]" />}
      />
      <div
        className={[
          'inline-flex items-center gap-2 rounded-full',
          'border border-white/10 bg-[#111827]/90 py-1.5 pl-2 pr-4',
          'text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur',
        ].join(' ')}
      >
        <span className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600 ring-1 ring-white/10">
          <UserOutlined className="text-[16px] text-white" />
          <span className="absolute bottom-0.5 right-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-[#111827]" />
        </span>
        <span className="text-[12px] font-bold text-white">Admin</span>
      </div>
    </div>
  );
}

export default function DriverCreatePage() {
  const { message } = App.useApp();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = React.useState(false);

  const uploadAvatarProps: UploadProps = React.useMemo(
    () => ({
      accept: 'image/jpeg,image/png,image/webp',
      showUploadList: false,
      beforeUpload: (file) => {
        const isAllowed = ['image/jpeg', 'image/png', 'image/webp'].includes(
          file.type,
        );
        if (!isAllowed) {
          message.error('Chỉ hỗ trợ JPG/PNG/WEBP');
          return Upload.LIST_IGNORE;
        }
        const maxBytes = 5 * 1024 * 1024;
        if (file.size > maxBytes) {
          message.error('Dung lượng tối đa 5MB');
          return Upload.LIST_IGNORE;
        }
        return true;
      },
      customRequest: async (options) => {
        const { file, onError, onSuccess } = options;
        try {
          setAvatarUploading(true);
          const fd = new FormData();
          fd.append('file', file as Blob);
          const res = await authFetch(
            `${getApiBaseUrl()}/admin/uploads/avatar`,
            {
              method: 'POST',
              body: fd,
            },
          );
          if (!res.ok) {
            let msg = `Upload thất bại (${res.status})`;
            try {
              const j = (await res.json()) as { message?: string | string[] };
              const m = j.message;
              if (typeof m === 'string') msg = m;
              else if (Array.isArray(m)) msg = m.join(', ');
            } catch {
              /* keep default */
            }
            throw new Error(msg);
          }
          const j = (await res.json()) as { url: string };
          const abs = new URL(j.url, getApiBaseUrl()).toString();
          setAvatarUrl(abs);
          message.success('Đã tải ảnh');
          onSuccess?.(j, res as unknown as XMLHttpRequest);
        } catch (e) {
          const err = e instanceof Error ? e : new Error('Upload thất bại');
          message.error(err.message);
          onError?.(err);
        } finally {
          setAvatarUploading(false);
        }
      },
    }),
    [message],
  );

  return (
    <AdminShell
      title="Tạo tài xế mới"
      subtitle="Tạo hồ sơ và tài khoản đăng nhập ứng dụng cho tài xế"
      consoleChrome
      headerExtra={<HeaderRight />}
    >
      <AdminPenMeta id="vnCreDrv" name="NovaLimo Admin · Tạo tài xế mới" />

      <div className="mx-auto w-full max-w-[1120px]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3">
            <div className="text-[12px] font-semibold text-white/55">
              Ảnh đại diện
            </div>
            <div className={cx(TW.surface, 'p-6')}>
              <div className="flex flex-col items-center">
                <div className="relative flex size-[168px] items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <UserOutlined className="text-[44px] text-white/35" />
                  )}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <ImgCrop
                    rotationSlider
                    aspect={1}
                    quality={1}
                    modalTitle="Cắt ảnh đại diện"
                    modalOk="Dùng ảnh"
                    modalCancel="Hủy"
                  >
                    <Upload {...uploadAvatarProps}>
                      <Button
                        className={TW.ghostBtn}
                        icon={<UploadOutlined />}
                        loading={avatarUploading}
                      >
                        Tải ảnh
                      </Button>
                    </Upload>
                  </ImgCrop>
                  <Button
                    className={TW.ghostBtn}
                    icon={<DeleteOutlined />}
                    disabled={!avatarUrl || avatarUploading}
                    onClick={() => setAvatarUrl(null)}
                  >
                    Xóa ảnh
                  </Button>
                </div>
                <p className="mt-4 text-center text-[11px] font-medium leading-relaxed text-white/35">
                  Ảnh sẽ hiển thị trong danh sách tài xế và trên ứng dụng di
                  động (nếu cấp).
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className={TW.sectionTitle}>
                  Hồ sơ &amp; tài khoản tài xế
                </div>
                <div className={TW.sectionSub}>
                  Mật khẩu được đặt dạng ẩn ký tự khi nhập. Admin có thể cấp lại
                  khi cần.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/vehicles/drivers" className="inline-flex">
                  <Button className={TW.ghostBtn}>Hủy</Button>
                </Link>
                <Button
                  type="primary"
                  className={TW.primaryBtn}
                  htmlType="button"
                >
                  Tạo tài xế
                </Button>
              </div>
            </div>

            <AdminDarkPanel className={cx(TW.surface, 'p-6')}>
              <Form
                layout="vertical"
                requiredMark={false}
                className="driver-create-form"
              >
                <div className="space-y-6">
                  <section className="space-y-3">
                    <div className="text-[12px] font-bold text-white/80">
                      Thông tin liên hệ
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Form.Item
                        label={<span className={TW.label}>Họ và tên</span>}
                        name="fullName"
                      >
                        <Input
                          className={TW.input}
                          placeholder="Nguyễn Văn..."
                        />
                      </Form.Item>
                      <Form.Item
                        label={<span className={TW.label}>Số điện thoại</span>}
                        name="phone"
                      >
                        <Input className={TW.input} placeholder="09xxxxxxxx" />
                      </Form.Item>
                      <Form.Item
                        label={<span className={TW.label}>Email</span>}
                        name="email"
                        className="md:col-span-2"
                      >
                        <Input
                          className={TW.input}
                          placeholder="ten.tx@novalimo.vn"
                        />
                      </Form.Item>
                    </div>
                  </section>

                  <div className="h-px w-full bg-white/6" />

                  <section className="space-y-3">
                    <div className="text-[12px] font-bold text-white/80">
                      Tài khoản ứng dụng
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Form.Item
                        label={<span className={TW.label}>Tên đăng nhập</span>}
                        name="username"
                      >
                        <Input
                          className={TW.input}
                          placeholder="ten.tx.driver"
                        />
                      </Form.Item>
                      <Form.Item
                        label={
                          <span className={TW.label}>
                            Mật khẩu (ký tự hiển thị đầy đủ)
                          </span>
                        }
                        name="password"
                      >
                        <Input.Password
                          className={TW.input}
                          placeholder="••••••••••"
                        />
                      </Form.Item>
                    </div>
                  </section>

                  <div className="h-px w-full bg-white/6" />

                  <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Form.Item
                      label={
                        <span className={TW.label}>Trạng thái tài khoản</span>
                      }
                      name="accountStatus"
                    >
                      <Select
                        className={TW.select}
                        classNames={{ popup: { root: TW.selectPopup } }}
                        placeholder="Chọn trạng thái"
                        options={[
                          {
                            value: 'active',
                            label: 'Hoạt động (có thể khóa sau khi tạo)',
                          },
                          { value: 'locked', label: 'Đã khóa' },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item
                      label={<span className={TW.label}>App Mobile</span>}
                      name="mobileApp"
                    >
                      <Select
                        className={TW.select}
                        classNames={{ popup: { root: TW.selectPopup } }}
                        placeholder="Chọn trạng thái"
                        options={[
                          { value: 'none', label: 'Chưa cấp' },
                          { value: 'issued', label: 'Đã cấp' },
                          { value: 'pending', label: 'Chờ duyệt' },
                        ]}
                      />
                    </Form.Item>
                  </section>

                  <section className="space-y-3">
                    <div className="text-[12px] font-bold text-white/80">
                      Ghi chú
                    </div>
                    <Form.Item
                      name="note"
                      label={<span className={TW.label}>Ghi chú</span>}
                    >
                      <Input.TextArea
                        rows={3}
                        className={TW.textarea}
                        placeholder="Ghi chú nội bộ về tài xế vận hành..."
                      />
                    </Form.Item>
                  </section>
                </div>
              </Form>
            </AdminDarkPanel>

            <div className="pt-8">
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/6 pt-4 text-[11px] font-medium text-white/35">
                <span>© 2026 NovaLimo · Quản trị vận hành</span>
                <span>Hotline · 096x xxx xxx</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
