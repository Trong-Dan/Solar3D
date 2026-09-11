// ================================================================
// CRYPTOGRAPHIC UTILITIES — PBKDF2 + HMAC-SHA256
// Dùng chung cho tất cả API admin endpoints
// ================================================================

import { pbkdf2Sync, createHmac, randomBytes } from 'crypto';

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_LENGTH = 64; // 64 bytes = 512 bits
const PBKDF2_DIGEST = 'sha256';

/**
 * Hash PIN bằng PBKDF2 (100,000 iterations)
 * Chống brute-force offline — mỗi lần thử mất ~100ms trên server
 */
export function hashPinPBKDF2(pin, salt) {
  return pbkdf2Sync(pin, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, PBKDF2_DIGEST).toString('hex');
}

/**
 * So sánh PIN nhập vào với hash đã lưu
 * Sử dụng timing-safe comparison để chống timing attack
 */
export function verifyPin(pin, salt, storedHash) {
  const inputHash = hashPinPBKDF2(pin, salt);
  if (inputHash.length !== storedHash.length) return false;

  // Timing-safe comparison
  let result = 0;
  for (let i = 0; i < inputHash.length; i++) {
    result |= inputHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Tạo session token có chữ ký HMAC-SHA256
 * Format: base64(json_payload).hmac_signature
 */
export function createSessionToken(secret, extraData = {}) {
  const payload = {
    iat: Date.now(),
    exp: Date.now() + 2 * 60 * 60 * 1000, // 2 giờ
    jti: randomBytes(16).toString('hex'), // Unique token ID
    ...extraData,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(payloadB64).digest('hex');

  return `${payloadB64}.${signature}`;
}

/**
 * Xác minh session token hợp lệ (chữ ký đúng + chưa hết hạn)
 */
export function verifySessionToken(token, secret) {
  try {
    if (!token || typeof token !== 'string') return { valid: false, reason: 'missing_token' };

    const parts = token.split('.');
    if (parts.length !== 2) return { valid: false, reason: 'invalid_format' };

    const [payloadB64, signature] = parts;

    // Verify HMAC signature
    const expectedSig = createHmac('sha256', secret).update(payloadB64).digest('hex');

    // Timing-safe comparison
    if (expectedSig.length !== signature.length) return { valid: false, reason: 'invalid_signature' };
    let sigMatch = 0;
    for (let i = 0; i < expectedSig.length; i++) {
      sigMatch |= expectedSig.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    if (sigMatch !== 0) return { valid: false, reason: 'invalid_signature' };

    // Parse payload
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());

    // Check expiry
    if (Date.now() > payload.exp) return { valid: false, reason: 'expired' };

    // Check issued-at not in future (clock skew tolerance: 60s)
    if (payload.iat > Date.now() + 60_000) return { valid: false, reason: 'future_token' };

    return { valid: true, payload };
  } catch {
    return { valid: false, reason: 'parse_error' };
  }
}

/**
 * Generate random hex string cho salt/secret
 */
export function generateRandomHex(bytes = 32) {
  return randomBytes(bytes).toString('hex');
}

// ── Default fallbacks cho giai đoạn khởi tạo ban đầu trước khi đặt env var trên Vercel ──
export const DEFAULT_PIN_SALT = 'ss3d_solar_salt_pbkdf2_prod_2026';
export const DEFAULT_SESSION_SECRET = 'ss3d_session_secret_hmac_prod_2026_default_key_replace_me';
export const DEFAULT_PIN_HASH = '280bd00595b898bcf71110719df3fb1d1274b5e7ca8c03ac278491b50176aa935e0ed7a5795728e3ba58d389aed913c169cc3e1bb99ba6991de5c5fce7d99897';

/**
 * Lấy cấu hình bảo mật hiện hành từ environment variables hoặc fallback
 */
export function getSecurityConfig() {
  const isCustomConfigured = Boolean(
    process.env.ADMIN_PIN_SALT &&
    process.env.ADMIN_PIN_HASH &&
    process.env.ADMIN_SESSION_SECRET
  );

  return {
    pinSalt: process.env.ADMIN_PIN_SALT || DEFAULT_PIN_SALT,
    pinHash: process.env.ADMIN_PIN_HASH || DEFAULT_PIN_HASH,
    sessionSecret: process.env.ADMIN_SESSION_SECRET || DEFAULT_SESSION_SECRET,
    isDefaultConfig: !isCustomConfigured,
  };
}
