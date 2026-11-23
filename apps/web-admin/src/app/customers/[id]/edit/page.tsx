'use client';

import type { CustomerDto } from '@limousine-workspace/shared-types';
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
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { AdminShell } from '../../../../components/shell/AdminShell';
import { adminApi } from '../../../../lib/api';

export default function CustomerEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [customer, setCustomer] = useState<CustomerDto | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const c = await adminApi.customer(id);
      setCustomer(c);
      setFullName(c.full_name);
      setPhone(c.phone);
      setEmail(c.email ?? '');
      setTags(c.tags);
      setNote(c.note ?? '');
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: FormEvent, nextTags = tags) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await adminApi.updateCustomer(id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        tags: nextTags,
        note: note.trim() || undefined,
      });
      toast.success('Đã cập nhật hồ sơ khách hàng');
      router.push(`/customers/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const isBlacklisted = tags.some((t) => t.toUpperCase() === 'BLACKLIST');

  return (
    <AdminShell
      title="Sửa Khách hàng"
      subtitle="Cập nhật thông tin · Ghi chú · Nhãn VIP / Blacklist"
      breadcrumbs={[
        { label: 'Khách hàng', href: '/customers' },
        { label: customer?.full_name ?? 'Chi tiết', href: `/customers/${id}` },
        { label: 'Sửa' },
      ]}
      headerExtra={
        <Link href={`/customers/${id}`}>
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
      ) : loading || !customer ? (
        <Card>
          <Skeleton className="h-64 w-full" rounded="card" />
        </Card>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)}>
          <Card>
            <FormSection
              title="Cập nhật khách hàng (nvCustEd)"
              description="Quản lý thông tin liên hệ, nhãn phân loại và ghi chú phục vụ."
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
              <Field label="Số điện thoại" required>
                {(p) => (
                  <Input
                    {...p}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                )}
              </Field>
              <Field label="Email" className="sm:col-span-2">
                {(p) => (
                  <Input
                    {...p}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                )}
              </Field>
              <Field label="Nhãn phân loại" className="sm:col-span-2">
                {() => (
                  <div className="flex flex-wrap gap-2">
                    {['VIP', 'THÂN THIẾT', 'DOANH NGHIỆP', 'BLACKLIST'].map(
                      (tag) => {
                        const active = tags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() =>
                              setTags((prev) =>
                                prev.includes(tag)
                                  ? prev.filter((x) => x !== tag)
                                  : [...prev, tag],
                              )
                            }
                            className={`rounded-control border px-3 py-1.5 text-xs font-semibold ${
                              active
                                ? 'border-brand-border bg-brand-subtle text-brand-fg'
                                : 'border-border-subtle bg-surface-2 text-fg-muted'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      },
                    )}
                  </div>
                )}
              </Field>
              <Field label="Ghi chú nội bộ" className="sm:col-span-2">
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
              <Button
                type="button"
                variant="danger"
                leftIcon={<ShieldAlert className="size-4" />}
                onClick={(e) => {
                  const next = isBlacklisted
                    ? tags.filter((t) => t.toUpperCase() !== 'BLACKLIST')
                    : [...tags, 'BLACKLIST'];
                  setTags(next);
                  void handleSubmit(e as unknown as FormEvent, next);
                }}
              >
                {isBlacklisted ? 'Gỡ khỏi Blacklist' : 'Đưa vào Blacklist'}
              </Button>
              <Link href={`/customers/${id}`}>
                <Button type="button" variant="ghost">
                  Hủy
                </Button>
              </Link>
              <Button type="submit" loading={saving}>
                Lưu
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </AdminShell>
  );
}
