// ================================================================
// CORS MANAGEMENT UTILITY — CENTRALIZED WHITELIST & PREFLIGHT
// Tự động chuẩn hóa trailing slash và bảo vệ tất cả API endpoints
// ================================================================

export const ALLOWED_ORIGINS = [
  'https://solar3-d-zuy6.vercel.app',
  'https://hemattroi3d.vercel.app',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4173',
];

/**
 * Kiểm tra xem một origin có được phép truy cập API hay không
 * Tự động loại bỏ trailing slash và hỗ trợ các preview domain trên Vercel của dự án
 */
export function isOriginAllowed(origin) {
  if (!origin) return true; // Server-to-server hoặc direct curl

  // Luôn chuẩn hóa bỏ dấu gạch chéo cuối nếu có
  const cleanOrigin = origin.trim().replace(/\/+$/, '').toLowerCase();

  // 1. Kiểm tra whitelist chính thức
  if (ALLOWED_ORIGINS.some((o) => o.toLowerCase().replace(/\/+$/, '') === cleanOrigin)) {
    return true;
  }

  // 2. Hỗ trợ các preview domain Vercel của dự án (ví dụ: solar3-d-xxx.vercel.app)
  if (
    /^https:\/\/solar3-d[a-z0-9-]*\.vercel\.app$/.test(cleanOrigin) ||
    /^https:\/\/[a-z0-9-]+-zuy6\.vercel\.app$/.test(cleanOrigin)
  ) {
    return true;
  }

  return false;
}

/**
 * Áp dụng CORS headers an toàn cho request
 * @returns {boolean} true nếu request đã được kết thúc (OPTIONS preflight hoặc 403 Forbidden)
 */
export function handleCors(
  req,
  res,
  {
    methods = 'POST,OPTIONS',
    allowedHeaders = 'Content-Type, Authorization, X-Requested-With, Accept',
  } = {}
) {
  const origin = req.headers.origin || '';
  const cleanOrigin = origin.trim().replace(/\/+$/, '');

  if (origin) {
    if (isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', cleanOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.status(403).json({ error: 'Origin không được phép truy cập API này.' });
      return true;
    }
  }

  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', allowedHeaders);

  // Xử lý preflight OPTIONS request từ trình duyệt
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
}
