'use client';

import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  useToast,
} from '@limousine-workspace/shared-ui';
import { Eye, EyeOff, Lock, Phone, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { useAdminAuth } from '../../components/shell/AdminAuthContext';
import { loginAdmin } from '../../lib/api';

export function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/dashboard';
  const toast = useToast();
  const { refreshUser } = useAdminAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanPhone = phone.trim();
    if (!cleanPhone || !password) {
      setError('Vui lòng nhập đầy đủ số điện thoại và mật khẩu.');
      return;
    }
    setLoading(true);
    try {
      await loginAdmin(cleanPhone, password);
      await refreshUser();
      toast.success('Đăng nhập thành công');
      router.push(nextPath.startsWith('/') ? nextPath : '/dashboard');
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Không thể đăng nhập. Vui lòng kiểm tra thông tin.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-dvh bg-canvas text-fg lg:grid-cols-[1.1fr_1fr]">
      {/* Left luxury brand showcase */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border-subtle bg-surface-1 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-control bg-brand font-bold text-on-brand shadow-brand">
            NL
          </span>
          <div>
            <p className="text-base font-bold tracking-tight text-fg">
              NovaLimo
            </p>
            <p className="text-xs text-fg-muted">
              Operations & Dispatch Console
            </p>
          </div>
        </div>

        <div className="my-auto max-w-lg space-y-6">
          <Badge tone="brand">Trung tâm điều hành v2</Badge>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-fg">
            Điều phối thông minh, giám sát thời gian thực và kiểm soát doanh thu
            tập trung.
          </h1>
          <p className="text-base leading-relaxed text-fg-secondary">
            Hệ thống quản trị vận hành xe Limousine cao cấp: gom cụm hành khách
            PostGIS, tối ưu lộ trình đón trả, đối soát VietQR & COD tự động.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="rounded-card border border-border-subtle bg-surface-2/70 p-4">
              <p className="text-xs text-fg-muted">Điều phối</p>
              <p className="mt-1 text-lg font-semibold text-brand-fg">
                PostGIS + CVRP
              </p>
            </div>
            <div className="rounded-card border border-border-subtle bg-surface-2/70 p-4">
              <p className="text-xs text-fg-muted">Giám sát GPS</p>
              <p className="mt-1 text-lg font-semibold text-fg">
                Realtime Socket
              </p>
            </div>
            <div className="rounded-card border border-border-subtle bg-surface-2/70 p-4">
              <p className="text-xs text-fg-muted">Phân quyền</p>
              <p className="mt-1 text-lg font-semibold text-fg">RBAC + Audit</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-fg-muted">
          <span>© 2026 NovaLimo · Hệ thống nội bộ có giám sát nhật ký</span>
          <span className="inline-flex items-center gap-1.5 text-fg-secondary">
            <ShieldCheck className="size-4 text-brand-fg" />
            Bảo mật JWT Rotation
          </span>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3 lg:hidden">
              <span className="flex size-10 items-center justify-center rounded-control bg-brand font-bold text-on-brand shadow-brand">
                NL
              </span>
              <span className="text-lg font-bold text-fg">NovaLimo Admin</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-fg">
              Đăng nhập quản trị
            </h2>
            <p className="mt-1.5 text-sm text-fg-muted">
              Sử dụng số điện thoại nhân viên đã được cấp quyền trong hệ thống.
            </p>
          </div>

          <Card className="p-6 sm:p-8">
            <form
              onSubmit={onSubmit}
              className="flex flex-col gap-5"
              noValidate
            >
              {error && (
                <div
                  role="alert"
                  className="rounded-control border border-danger-border bg-danger-bg px-3.5 py-2.5 text-ui text-danger-fg"
                >
                  {error}
                </div>
              )}

              <Field label="Số điện thoại" required>
                {(p) => (
                  <Input
                    {...p}
                    type="tel"
                    inputMode="tel"
                    autoComplete="username"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại nhân viên"
                    leftIcon={<Phone className="size-4" />}
                  />
                )}
              </Field>

              <Field label="Mật khẩu" required>
                {(p) => (
                  <Input
                    {...p}
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    leftIcon={<Lock className="size-4" />}
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        aria-label={showPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        className="text-fg-muted hover:text-fg"
                      >
                        {showPwd ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    }
                  />
                )}
              </Field>

              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="mt-1 w-full"
              >
                Đăng nhập hệ thống
              </Button>

              <div className="border-t border-border-subtle pt-4">
                <p className="mb-2.5 text-xs font-medium text-fg-muted">
                  Tài khoản mẫu (nhấn để điền nhanh):
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Super Admin', phone: '0900000001' },
                    { label: 'Điều hành', phone: '0900000002' },
                    { label: 'Kế toán', phone: '0900000003' },
                    { label: 'Tổng đài CSKH', phone: '0900000004' },
                  ].map((acc) => (
                    <button
                      key={acc.phone}
                      type="button"
                      onClick={() => {
                        setPhone(acc.phone);
                        setPassword('Admin@12345');
                        setError(null);
                      }}
                      className="flex flex-col items-start rounded-control border border-border-subtle bg-surface-2 px-3 py-2 text-left transition-colors hover:border-brand-border hover:bg-brand-subtle"
                    >
                      <span className="text-xs font-semibold text-fg">
                        {acc.label}
                      </span>
                      <span className="font-mono text-[11px] text-fg-muted">
                        {acc.phone} · Admin@12345
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </Card>

          <p className="mt-6 text-center text-xs text-fg-muted">
            Tài khoản sẽ tạm khóa 15 phút nếu nhập sai mật khẩu quá 5 lần liên
            tiếp. Liên hệ Quản trị viên RBAC nếu quên mật khẩu.
          </p>
        </div>
      </div>
    </div>
  );
}
