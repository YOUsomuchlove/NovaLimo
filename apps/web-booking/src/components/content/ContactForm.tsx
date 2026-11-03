'use client';

import { Button, Field, Input, Textarea } from '@limousine-workspace/shared-ui';
import {
  isValidVnPhone,
  normalizeVnPhone,
} from '@limousine-workspace/utils-core';
import { CheckCircle2, Send } from 'lucide-react';
import { useState } from 'react';
import { ApiError, publicApi } from '../../lib/api';

export function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'Nhập họ tên';
    if (!isValidVnPhone(form.phone)) e.phone = 'Số điện thoại không hợp lệ';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      e.email = 'Email không hợp lệ';
    if (form.subject.trim().length < 3) e.subject = 'Nhập tiêu đề';
    if (form.message.trim().length < 10)
      e.message = 'Nội dung tối thiểu 10 ký tự';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setFailure(null);
    try {
      const r = await publicApi.contact({
        name: form.name.trim(),
        phone: normalizeVnPhone(form.phone),
        email: form.email.trim() || undefined,
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSent(r.code);
    } catch (err) {
      setFailure(
        err instanceof ApiError
          ? err.message
          : 'Không gửi được, vui lòng thử lại',
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div
        className="flex flex-col items-center gap-3 py-10 text-center"
        role="status"
      >
        <CheckCircle2 className="size-12 text-success-fg" />
        <p className="text-lg font-semibold text-fg">Đã nhận yêu cầu {sent}</p>
        <p className="max-w-sm text-sm text-fg-muted">
          Bộ phận CSKH sẽ liên hệ lại trong giờ làm việc. Cần gấp, vui lòng gọi
          hotline.
        </p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-5 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <Field label="Họ và tên" required error={errors.name}>
        {(p) => (
          <Input
            {...p}
            autoComplete="name"
            value={form.name}
            onChange={set('name')}
          />
        )}
      </Field>
      <Field label="Số điện thoại" required error={errors.phone}>
        {(p) => (
          <Input
            {...p}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={set('phone')}
          />
        )}
      </Field>
      <Field label="Email" error={errors.email} className="sm:col-span-2">
        {(p) => (
          <Input
            {...p}
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
          />
        )}
      </Field>
      <Field
        label="Tiêu đề"
        required
        error={errors.subject}
        className="sm:col-span-2"
      >
        {(p) => (
          <Input
            {...p}
            value={form.subject}
            onChange={set('subject')}
            placeholder="Ví dụ: Đặt xe cho đoàn 20 người"
          />
        )}
      </Field>
      <Field
        label="Nội dung"
        required
        error={errors.message}
        className="sm:col-span-2"
      >
        {(p) => (
          <Textarea
            {...p}
            rows={5}
            value={form.message}
            onChange={set('message')}
            maxLength={4000}
          />
        )}
      </Field>
      {failure && (
        <p className="text-sm text-danger-fg sm:col-span-2">{failure}</p>
      )}
      <Button
        type="submit"
        size="lg"
        loading={loading}
        leftIcon={<Send className="size-4" />}
        className="sm:col-span-2 sm:justify-self-start"
      >
        Gửi yêu cầu
      </Button>
    </form>
  );
}
