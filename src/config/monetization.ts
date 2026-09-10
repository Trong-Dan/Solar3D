// ================================================================
// MONETIZATION CONFIG — NGUỒN SỰ THẬT DUY NHẤT (SINGLE SOURCE OF TRUTH)
// ================================================================
// Mọi URL affiliate/donate hiển thị cho khách truy cập đều đọc từ file này.
// Khi có link thật, dán vào đây → git commit → Vercel tự deploy lại.
// KHÔNG dùng localStorage hay Admin Dashboard để chỉnh URL production.
// ================================================================

export const MONETIZATION_CONFIG = {
  /** Link Amazon Associates cho Kính thiên văn Celestron 127EQ */
  telescopeUrl: '', // dán link Amazon Associates thật sau khi được duyệt

  /** Link Amazon Associates cho Sách Cosmos — Carl Sagan */
  bookUrl: '', // dán link Amazon Affiliate thật

  /** Link affiliate Coursera qua Impact/CJ (không phải link thường) */
  courseUrl: '', // dán link affiliate Coursera thật

  /** Link Ko-fi hoặc Buy Me a Coffee */
  supportUrl: '', // vd: https://ko-fi.com/<username>

  /** Tỷ lệ hoa hồng mặc định (%) — chỉ dùng để ước tính demo */
  commissionRateTelescope: 5,
  commissionRateBook: 7,

  /** Mức donate trung bình ước tính (VND) — chỉ dùng để ước tính demo */
  avgDonationVnd: 50000,
} as const;
