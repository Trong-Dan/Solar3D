// ================================================================
// VERCEL SERVERLESS FUNCTION — SEPAY API PROXY
// Giải quyết triệt để lỗi CORS khi trình duyệt gọi sang SePay.vn
// ================================================================

export default async function handler(req, res) {
  // Cấu hình CORS Header cho phép Web Client gọi an toàn
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Xử lý Preflight OPTIONS request từ trình duyệt
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Thiếu Authorization Token' });
  }

  const { account_number, limit = '50' } = req.query;
  const targetUrl = `https://my.sepay.vn/userapi/transactions/list?limit=${encodeURIComponent(limit)}${
    account_number ? `&account_number=${encodeURIComponent(account_number)}` : ''
  }`;

  try {
    const upstream = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (error) {
    return res.status(502).json({
      error: 'Không thể kết nối máy chủ SePay',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
