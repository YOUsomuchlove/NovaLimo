export const NAV_LINKS = [
  { href: '/', label: 'Trang chủ' },
  { href: '/about', label: 'Giới thiệu' },
  { href: '/pricing', label: 'Bảng giá' },
  { href: '/cargo', label: 'Ký gửi hàng' },
  { href: '/contact', label: 'Liên hệ' },
] as const;

export const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname.startsWith(href);
