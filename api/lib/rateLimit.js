// ================================================================
// IN-MEMORY RATE LIMITER — IP-BASED
// Giới hạn số lần gọi API theo IP để chống brute-force & spam
// Lưu ý: In-memory = reset khi cold start. Đủ tốt cho Vercel Serverless.
// ================================================================

/**
 * @typedef {Object} RateLimitEntry
 * @property {number} count
 * @property {number} resetAt
 * @property {number} [lockoutUntil]
 */

/** @type {Map<string, Map<string, RateLimitEntry>>} */
const stores = new Map();

/**
 * Tạo rate limiter instance cho một endpoint cụ thể
 *
 * @param {Object} options
 * @param {string} options.name - Tên endpoint (dùng làm key cho store)
 * @param {number} options.maxAttempts - Số lần tối đa trong window
 * @param {number} options.windowMs - Thời gian cửa sổ (ms)
 * @param {number} [options.lockoutMs] - Thời gian khóa khi vượt quá (ms). Nếu không set = chỉ reject cho đến hết window
 */
export function createRateLimiter({ name, maxAttempts, windowMs, lockoutMs = 0 }) {
  if (!stores.has(name)) {
    stores.set(name, new Map());
  }

  const store = stores.get(name);

  /**
   * Lấy IP thực từ request (xử lý Vercel/Cloudflare proxy headers)
   */
  function getClientIP(req) {
    return (
      req.headers['x-real-ip'] ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Kiểm tra rate limit cho request
   * @returns {{ allowed: boolean, remaining: number, retryAfter?: number }}
   */
  function check(req) {
    const ip = getClientIP(req);
    const now = Date.now();

    let entry = store.get(ip);

    // Dọn dẹp entry hết hạn
    if (entry && entry.resetAt <= now && (!entry.lockoutUntil || entry.lockoutUntil <= now)) {
      store.delete(ip);
      entry = undefined;
    }

    // Kiểm tra lockout
    if (entry?.lockoutUntil && entry.lockoutUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        retryAfter: Math.ceil((entry.lockoutUntil - now) / 1000),
      };
    }

    if (!entry) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(ip, entry);
    }

    // Reset window nếu đã hết thời gian
    if (entry.resetAt <= now) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
      delete entry.lockoutUntil;
    }

    entry.count++;

    if (entry.count > maxAttempts) {
      // Kích hoạt lockout nếu có cấu hình
      if (lockoutMs > 0) {
        entry.lockoutUntil = now + lockoutMs;
        return {
          allowed: false,
          remaining: 0,
          retryAfter: Math.ceil(lockoutMs / 1000),
        };
      }

      return {
        allowed: false,
        remaining: 0,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      };
    }

    return {
      allowed: true,
      remaining: maxAttempts - entry.count,
    };
  }

  /**
   * Dọn dẹp entries hết hạn (gọi định kỳ nếu cần)
   */
  function cleanup() {
    const now = Date.now();
    for (const [ip, entry] of store.entries()) {
      if (entry.resetAt <= now && (!entry.lockoutUntil || entry.lockoutUntil <= now)) {
        store.delete(ip);
      }
    }
  }

  return { check, cleanup, getClientIP };
}

// ── Pre-configured rate limiters ──

/** Rate limiter cho admin login: 5 lần thử / 15 phút lockout */
export const adminLoginLimiter = createRateLimiter({
  name: 'admin_login',
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 phút
  lockoutMs: 15 * 60 * 1000, // Khóa 15 phút khi quá 5 lần
});

/** Rate limiter cho SePay proxy: 10 request / phút */
export const sepayProxyLimiter = createRateLimiter({
  name: 'sepay_proxy',
  maxAttempts: 10,
  windowMs: 60 * 1000, // 1 phút
});

/** Rate limiter cho admin change-pin: 3 lần thử / 30 phút */
export const adminChangePinLimiter = createRateLimiter({
  name: 'admin_change_pin',
  maxAttempts: 3,
  windowMs: 30 * 60 * 1000,
  lockoutMs: 30 * 60 * 1000,
});
