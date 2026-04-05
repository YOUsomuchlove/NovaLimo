/**
 * Ảnh nền & overlay theo web-bôking.pen (Pencil frame IDs trong comment).
 * Dùng với BookingPageScaffold + next/image.
 */
export const PEN_BG = {
  /** Kl9cQ — Trang Kết quả tìm kiếm */
  searchResults:
    'https://images.unsplash.com/photo-1767023025057-9f4033342df2?auto=format&fit=max&w=1920&q=80',
  /** eWbxX — Sơ đồ ghế */
  seatMap:
    'https://images.unsplash.com/photo-1767023025057-9f4033342df2?auto=format&fit=max&w=1920&q=80',
  /** dQZgk — Trang Thông tin (Booking) */
  bookingInfo:
    'https://images.unsplash.com/photo-1768767132391-13032fe86715?auto=format&fit=max&w=1920&q=80',
  /** cFLNQ — Checkout */
  checkout:
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=max&w=1920&q=80',
  /** wbBkSuccess */
  bookingSuccess:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=max&w=1920&q=80',
  /** sMJzD Hero — cùng họ ảnh tuyến/limousine */
  homeHero:
    'https://images.unsplash.com/photo-1767023025057-9f4033342df2?auto=format&fit=max&w=1920&q=80',
  /** 43Hd5, 43TrKq2 — Tra cứu vé */
  myTickets:
    'https://images.unsplash.com/photo-1767023025057-9f4033342df2?auto=format&fit=max&w=1920&q=80',
  /** wbCargoLanding */
  cargoLanding:
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=max&w=1920&q=80',
  /** wbCargoBook */
  cargoBook:
    'https://images.unsplash.com/photo-1767023025057-9f4033342df2?auto=format&fit=max&w=1920&q=80',
  /** wbCargoResults */
  cargoResults:
    'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=max&w=1920&q=80',
  /** wbCargoSuccess */
  cargoSuccess:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=max&w=1920&q=80',
  /** lPQio — About hero banner */
  aboutHero:
    'https://images.unsplash.com/photo-1771775751121-3091d79073d4?auto=format&fit=max&w=1920&q=80',
  /** SPHoT — Pricing */
  pricing:
    'https://images.unsplash.com/photo-1767023025057-9f4033342df2?auto=format&fit=max&w=1920&q=80',
  /** wbLegalTerms */
  legalTerms:
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=max&w=1920&q=80',
  /** wbLegalPrivacy */
  legalPrivacy:
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=max&w=1920&q=80',
  /** wbFaq */
  faq: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=max&w=1920&q=80',
  /** wbPg404 */
  notFound:
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=max&w=1920&q=80',
} as const;

/** Độ che phủ rgba theo pen (tên node: Page Dark Overlay, Info Overlay, …) */
export const PEN_OVERLAY = {
  search: 'bg-[#0B1020]/80',
  seat: 'bg-[#0B1020]/80',
  info: 'bg-[#0B1020]/80',
  checkout: 'bg-[#0B1020]/80',
  success: 'bg-[#0B1020]/90',
  homeHero: 'bg-[#0B1020]/78',
  cargoLanding: 'bg-[#0B1020]/91',
  cargoBook: 'bg-[#0B1020]/91',
  cargoResults: 'bg-[#0B1020]/91',
  cargoSuccess: 'bg-[#0B1020]/91',
  myTickets: 'bg-[#0B1020]/90',
  about: 'bg-[#0B1020]',
  pricing: 'bg-[#0B1020]/90',
  legal: 'bg-[#0B1020]/91',
  faq: 'bg-[#0B1020]/91',
  notFound: 'bg-[#0B1020]/91',
} as const;
