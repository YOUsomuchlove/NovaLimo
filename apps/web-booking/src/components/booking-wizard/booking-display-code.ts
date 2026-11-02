import dayjs from 'dayjs';

/** Mã đơn hiển thị NL-YYYYMMDD-XXXX */
export function bookingDisplayCode(id: string) {
  const tail = id.replace(/-/g, '').slice(0, 4).toUpperCase();
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `NL-${y}${m}${day}-${tail}`;
}

/** Mã vận đơn demo CG-YYYYMMDD-XXXX (luồng ký gửi chưa gắn API). */
export function cargoDemoWaybillCode() {
  return `CG-${dayjs().format('YYYYMMDD')}-91BD`;
}
