// ================================================================
// VERCEL SERVERLESS FUNCTION — SEPAY API V2 PROXY
// Kết nối trực tiếp tới SePay User API V2 chính thức
// ================================================================

export default async function handler(req, res) {
  // Cấu hình CORS an toàn theo chuẩn W3C
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  if (origin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Xử lý Preflight OPTIONS request từ trình duyệt
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Chỉ chấp nhận phương thức GET' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Thiếu Authorization Token' });
  }

  const { account_number, limit = '50', per_page, bank_account_id } = req.query || {};
  const safeLimit = Math.min(Math.max(1, parseInt(per_page || limit, 10) || 50), 100);

  // Gọi tới SePay API V2 chính thức
  let targetUrl = `https://userapi.sepay.vn/v2/transactions?per_page=${safeLimit}`;
  if (account_number) {
    targetUrl += `&account_number=${encodeURIComponent(account_number)}`;
  }
  if (bank_account_id) {
    targetUrl += `&bank_account_id=${encodeURIComponent(bank_account_id)}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const upstream = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const text = await upstream.text();
    try {
      const data = JSON.parse(text);
      return res.status(upstream.status).json(data);
    } catch {
      return res.status(upstream.status).send(text);
    }
  } catch (error) {
    return res.status(502).json({
      error: 'Không thể kết nối máy chủ SePay',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
