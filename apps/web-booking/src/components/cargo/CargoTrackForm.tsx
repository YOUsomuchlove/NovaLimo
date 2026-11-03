'use client';

import { Button, Card, Field, Input } from '@limousine-workspace/shared-ui';
import {
  isValidVnPhone,
  normalizeVnPhone,
} from '@limousine-workspace/utils-core';
import { Package, Phone, Search } from 'lucide-react';
import { useState } from 'react';
import { ticketPhones } from '../../lib/session';
import { CargoStatusView } from './CargoStatusView';

export function CargoTrackForm({ initialCode }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode ?? '');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState<string | null>(null);

  if (shown) return <CargoStatusView key={shown} code={shown} />;

  return (
    <Card padding="lg" className="mx-auto max-w-md">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const c = code
            .trim()
            .toUpperCase()
            .replace(/^CG(?!-)/, 'CG-');
          if (!/^CG-[0-9A-Z]{6}$/.test(c))
            return setError('Mã vận đơn có dạng CG-XXXXXX');
          if (!isValidVnPhone(phone))
            return setError('Số điện thoại không hợp lệ');
          ticketPhones.set(c, normalizeVnPhone(phone));
          setShown(c);
        }}
      >
        <Field label="Mã vận đơn" required>
          {(p) => (
            <Input
              {...p}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="CG-4HX82N"
              leading={<Package className="size-4" />}
            />
          )}
        </Field>
        <Field label="Số điện thoại" required error={error ?? undefined}>
          {(p) => (
            <Input
              {...p}
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912 345 678"
              leading={<Phone className="size-4" />}
            />
          )}
        </Field>
        <Button
          type="submit"
          size="lg"
          leftIcon={<Search className="size-4" />}
        >
          Tra cứu
        </Button>
      </form>
    </Card>
  );
}
