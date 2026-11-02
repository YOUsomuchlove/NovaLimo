import { randomBytes } from 'node:crypto';

/** Crockford base32 without ambiguous characters (no I, L, O, U). */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function randomCode(length: number): string {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/** NL-7K3M9Q — booking code customers read over the phone */
export const bookingCode = () => `NL-${randomCode(6)}`;
/** CG-4HX82N — cargo waybill */
export const waybillCode = () => `CG-${randomCode(6)}`;
/** TK-P3R8 — support ticket */
export const ticketCode = () => `TK-${randomCode(5)}`;
/** Bank transfer content: "NL7K3M9Q" (letters+digits only so banks don't strip it) */
export const transferReference = (code: string) =>
  code.replace(/[^A-Z0-9]/g, '');
