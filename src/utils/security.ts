// ================================================================
// ADMIN SECURITY & CRYPTOGRAPHIC SESSION ENGINE
// Bảo vệ chống xâm nhập, chống giả mạo DevTools và bảo mật dữ liệu Admin
// ================================================================

export const PIN_SALT = 'solar_system_3d_secret_salt_2026_prod';
export const SESSION_SECRET = 'ss3d_adm_secret_token_hmac_prod_987654';
export const STORAGE_PIN_HASH = 'ss3d_admin_pin_hash_v2';
export const STORAGE_LOCKOUT_UNTIL = 'ss3d_admin_lockout_v2';
export const STORAGE_FAILED_ATTEMPTS = 'ss3d_admin_failed_v2';
export const SESSION_TOKEN_KEY = 'ss3d_adm_sess_v2';

// 2 hours session expiry
export const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000;

/** SHA-256 Web Crypto Implementation */
export async function sha256(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Tạo phiên đăng nhập có chữ ký bảo mật HMAC SHA-256 */
export async function createAdminSession(pinHash: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const signature = await sha256(`${pinHash}:${now}:${SESSION_SECRET}:${navigator.userAgent}`);
  const payload = JSON.stringify({
    timestamp: now,
    sig: signature,
  });
  sessionStorage.setItem(SESSION_TOKEN_KEY, payload);
}

/** Xác minh phiên đăng nhập - chống giả lập biến trong DevTools Console */
export async function validateAdminSession(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const raw = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (!raw) return false;

    const { timestamp, sig } = JSON.parse(raw);
    const now = Date.now();

    // Kiểm tra hết hạn phiên (tối đa 2 giờ không thao tác)
    if (now - timestamp > SESSION_MAX_AGE_MS || timestamp > now) {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      return false;
    }

    // Lấy mã PIN hash hiện tại
    const storedHash = localStorage.getItem(STORAGE_PIN_HASH) || (await sha256(PIN_SALT + '888888'));
    const expectedSig = await sha256(`${storedHash}:${timestamp}:${SESSION_SECRET}:${navigator.userAgent}`);

    if (sig === expectedSig) {
      return true;
    } else {
      // Giả mạo chữ ký -> hủy phiên lập tức
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      return false;
    }
  } catch {
    return false;
  }
}

/** Hủy phiên làm việc Admin */
export function destroyAdminSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
  sessionStorage.removeItem('ss3d_admin_authenticated');
}

/** Kiểm tra xem admin đã đổi mã PIN mặc định chưa */
export async function isDefaultPinInUse(): Promise<boolean> {
  if (typeof window === 'undefined') return true;
  const storedHash = localStorage.getItem(STORAGE_PIN_HASH);
  if (!storedHash) return true;
  const defaultHash = await sha256(PIN_SALT + '888888');
  return storedHash === defaultHash;
}
