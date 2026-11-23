import { ChevronDown } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, PageHero } from '../../components/site/Section';
import { DEFAULT_SETTINGS, publicApi, safe } from '../../lib/api';

export const metadata: Metadata = {
  title: 'Câu hỏi thường gặp',
  description:
    'Giải đáp về đặt vé, thanh toán, đón trả, hủy đổi vé và ký gửi hàng tại NovaLimo.',
  alternates: { canonical: '/faq' },
};
export const revalidate = 300;

export default async function FaqPage() {
  const { booking: p, company } = await safe(
    publicApi.settings(),
    DEFAULT_SETTINGS,
  );
  const groups: { title: string; items: [string, string][] }[] = [
    {
      title: 'Đặt vé',
      items: [
        [
          'Tôi có thể đặt vé trước bao lâu?',
          'Bạn có thể đặt vé trước tối đa 60 ngày. Đặt online đóng 60 phút trước giờ khởi hành; sau đó vui lòng gọi hotline.',
        ],
        [
          'Ghế được giữ trong bao lâu khi tôi đang đặt?',
          `Sau khi chọn ghế, hệ thống giữ ghế cho bạn ${p.seat_hold_minutes} phút để nhập thông tin và thanh toán.`,
        ],
        [
          'Tôi đặt hộ người thân được không?',
          'Được. Bạn là người liên hệ, còn tên từng hành khách nhập theo ghế. Có thể thêm số điện thoại hành khách để tài xế gọi trực tiếp.',
        ],
        [
          'Mỗi lần đặt tối đa bao nhiêu ghế?',
          `Tối đa ${p.max_seats_per_booking} ghế mỗi lần. Đặt cho đoàn đông hơn, vui lòng liên hệ ${company.hotline}.`,
        ],
      ],
    },
    {
      title: 'Thanh toán',
      items: [
        [
          'Có những hình thức thanh toán nào?',
          'Chuyển khoản qua VietQR (xác nhận tự động trong vài giây) hoặc tiền mặt cho tài xế khi lên xe.',
        ],
        [
          'Tôi đã chuyển khoản nhưng vé chưa xác nhận?',
          'Hãy kiểm tra bạn đã ghi đúng nội dung chuyển khoản (mã NL…). Nếu sau 5 phút vẫn chưa cập nhật, gọi hotline kèm ảnh giao dịch.',
        ],
        [
          'Vé chưa thanh toán có bị hủy không?',
          `Có. Vé chuyển khoản chưa thanh toán sẽ tự hủy sau ${p.payment_due_minutes} phút để nhả ghế cho khách khác.`,
        ],
      ],
    },
    {
      title: 'Đón trả & hành trình',
      items: [
        [
          'Xe đón tôi lúc mấy giờ?',
          'Giờ đón cụ thể phụ thuộc vị trí của bạn trong lộ trình. Tài xế sẽ gọi trước khi đến; bạn cũng nhận SMS khi xe xuất phát.',
        ],
        [
          'Tôi có thể đón ở bất kỳ đâu không?',
          'Trong khu vực nội thành của tuyến, bạn có thể nhập địa chỉ bất kỳ hoặc chọn các điểm đón cố định để đi nhanh hơn.',
        ],
        [
          'Hành lý được mang bao nhiêu?',
          'Mỗi khách 1 vali xách tay và 1 vali cỡ trung. Hành lý cồng kềnh vui lòng ghi chú khi đặt vé.',
        ],
      ],
    },
    {
      title: 'Hủy & đổi vé',
      items: [
        [
          'Chính sách hủy vé thế nào?',
          `Hủy trước giờ khởi hành từ ${p.free_cancel_hours} giờ: hoàn 100%. Muộn hơn: hoàn ${p.late_cancel_refund_pct}%. Hủy tại trang Tra cứu vé.`,
        ],
        [
          'Tôi muốn đổi giờ đi?',
          'Vui lòng gọi hotline hoặc gửi yêu cầu ở trang Liên hệ, CSKH sẽ đổi sang chuyến còn chỗ.',
        ],
      ],
    },
    {
      title: 'Ký gửi hàng',
      items: [
        [
          'Những hàng nào không được gửi?',
          'Hàng cấm theo quy định pháp luật, chất dễ cháy nổ, động vật sống, hàng có mùi hoặc chất lỏng không đóng kín.',
        ],
        [
          'Thu hộ COD hoạt động ra sao?',
          'Tài xế thu tiền của người nhận khi giao hàng; NovaLimo đối soát và chuyển trả cho người gửi theo chính sách COD.',
        ],
      ],
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: groups.flatMap((g) =>
      g.items.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    ),
  };

  return (
    <>
      <PageHero
        tone="sky"
        eyebrow="Hỗ trợ"
        title="Câu hỏi thường gặp"
        lead="Không tìm thấy câu trả lời? Gọi hotline hoặc gửi lời nhắn ở trang Liên hệ."
      />
      <Container className="max-w-3xl py-10 sm:py-14">
        <div className="flex flex-col gap-10">
          {groups.map((g) => (
            <section key={g.title}>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-brand-fg">
                {g.title}
              </h2>
              <div className="flex flex-col gap-2">
                {g.items.map(([q, a]) => (
                  <details
                    key={q}
                    className="group rounded-card border border-border-subtle bg-surface-1 transition-colors open:border-brand/40 open:shadow-e1"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-fg [&::-webkit-details-marker]:hidden">
                      {q}
                      <ChevronDown className="size-4 shrink-0 text-fg-muted transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="px-5 pb-5 text-sm leading-relaxed text-fg-secondary">
                      {a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-12 text-center text-sm text-fg-muted">
          Vẫn cần trợ giúp?{' '}
          <Link
            href="/contact"
            className="text-brand-fg underline underline-offset-4"
          >
            Liên hệ chúng tôi
          </Link>
        </p>
      </Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
