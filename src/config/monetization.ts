// ================================================================
// MONETIZATION & BANKING CONFIG — NGUỒN SỰ THẬT DUY NHẤT (SINGLE SOURCE OF TRUTH)
// ================================================================
// Mọi URL affiliate/donate và thông tin nhận chuyển khoản thật đều đọc từ file này.
// Để đổi tài khoản ngân hàng nhận tiền thật: sửa thông tin bên dưới -> git commit -> Vercel deploy.
// ================================================================

export const BANKING_CONFIG = {
  /** Mã ngân hàng theo chuẩn Napas / VietQR (MB, VCB, TCB, VPB, ACB, TPB, BIDV, CTG...) */
  bankId: 'MB',
  /** Tên hiển thị của ngân hàng */
  bankName: 'MB Bank (Ngân hàng Quân Đội)',
  /** Số tài khoản ngân hàng thụ hưởng nhận tiền ủng hộ */
  accountNo: '0325636794',
  /** Tên chủ tài khoản thụ hưởng (In hoa không dấu) */
  accountName: 'VŨ TRỌNG DÂN',
  /** Số điện thoại nhận chuyển khoản Ví MoMo */
  momoPhone: '0325636794',
  /** Tên tài khoản MoMo */
  momoName: 'VŨ TRỌNG DÂN',
  /** Tiền tố nội dung chuyển khoản tự động */
  transferPrefix: 'UNGHO SS3D',
  /** Các mức ủng hộ đề xuất nhanh (VND) */
  presetAmounts: [20000, 50000, 100000, 200000],
  /** Đường dẫn ảnh mã QR MB Bank thật (chính chủ) */
  realMbQrImage: '/donations/mb_qr_real.png',
  /** Đường dẫn ảnh mã QR MoMo thật (chính chủ) */
  realMomoQrImage: '/donations/momo_qr_real.png',
} as const;

export const MONETIZATION_CONFIG = {
  /** Link Amazon Associates cho Kính thiên văn Celestron 127EQ */
  telescopeUrl: '',

  /** Link Amazon Associates cho Sách Cosmos — Carl Sagan */
  bookUrl: '',

  /** Link affiliate Coursera qua Impact/CJ */
  courseUrl: '',

  /** Link Ko-fi hoặc Buy Me a Coffee nhận ủng hộ quốc tế (Visa/Mastercard/PayPal) */
  supportUrl: 'https://ko-fi.com/trongdan',
} as const;
