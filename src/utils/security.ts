// ================================================================
// ADMIN SECURITY & CRYPTOGRAPHIC SESSION ENGINE
// Xác thực server-side (PBKDF2 100k rounds + HMAC-SHA256 Sessions)
// Bảo vệ chống xâm nhập, chống giả mạo DevTools, và bảo mật dữ liệu Admin
// ================================================================

export const STORAGE_LOCKOUT_UNTIL = 'ss3d_admin_lockout_v2';
export const STORAGE_FAILED_ATTEMPTS = 'ss3d_admin_failed_v2';
export const STORAGE_IS_DEFAULT_PIN = 'ss3d_admin_is_default_pin_v2';
export const SESSION_TOKEN_KEY = 'ss3d_adm_sess_v2';
export const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

// Legacy stubs for backwards compatibility
export const STORAGE_PIN_HASH = 'ss3d_admin_pin_hash_v2';
export const PIN_SALT = 'solar_system_3d_secret_salt_2026_prod';
export const SESSION_SECRET = 'ss3d_adm_secret_token_hmac_prod_987654';

export interface LoginResponse {
  success: boolean;
  token?: string;
  error?: string;
  remainingAttempts?: number;
  retryAfter?: number;
  isDefaultPin?: boolean;
}

export interface ChangePinResponse {
  success: boolean;
  message?: string;
  newPinHash?: string;
  instructions?: string[];
  error?: string;
}

/** SHA-256 Web Crypto Client-side Helper */
export async function sha256(str: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) return '';
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Đăng nhập Quản trị viên qua Server-Side API (PBKDF2 100,000 iterations + IP rate limit) */
export async function loginAdminWithPin(pin: string): Promise<LoginResponse> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pin }),
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = { error: `Máy chủ trả về lỗi HTTP ${res.status}` };
    }

    if (res.ok && data.success && data.token) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_TOKEN_KEY, data.token);
        if (typeof data.isDefaultPin === 'boolean') {
          localStorage.setItem(STORAGE_IS_DEFAULT_PIN, String(data.isDefaultPin));
        }
        localStorage.removeItem(STORAGE_FAILED_ATTEMPTS);
        localStorage.removeItem(STORAGE_LOCKOUT_UNTIL);
      }
      return {
        success: true,
        token: data.token,
        isDefaultPin: data.isDefaultPin,
      };
    }

    // Xử lý khi bị khóa do rate limiting
    if (res.status === 429 && typeof window !== 'undefined') {
      const lockoutMs = (data.retryAfter || 900) * 1000;
      localStorage.setItem(STORAGE_LOCKOUT_UNTIL, String(Date.now() + lockoutMs));
    }

    return {
      success: false,
      error: data.error || 'Đăng nhập thất bại',
      remainingAttempts: data.remainingAttempts,
      retryAfter: data.retryAfter,
    };
  } catch (err) {
    return {
      success: false,
      error: 'Không thể kết nối tới máy chủ xác thực. Vui lòng kiểm tra đường truyền mạng.',
    };
  }
}

/** Xác minh token phiên làm việc hiện tại với Server */
export async function validateAdminSession(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) return false;

  try {
    // Quick client-side check on token format & expiration
    const parts = token.split('.');
    if (parts.length === 2) {
      try {
        const payloadStr = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadStr);
        if (payload.exp && Date.now() > payload.exp) {
          destroyAdminSession();
          return false;
        }
      } catch {
        // Fall through to server verify
      }
    }

    const res = await fetch('/api/admin/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.valid) {
        return true;
      }
    }

    // Token không hợp lệ hoặc đã hết hạn trên server
    destroyAdminSession();
    return false;
  } catch {
    // Trường hợp mạng chập chờn tạm thời: nếu token chưa quá hạn thì tạm duy trì
    const parts = token.split('.');
    if (parts.length === 2) {
      try {
        const payloadStr = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadStr);
        if (payload.exp && Date.now() < payload.exp) {
          return true;
        }
      } catch {
        // ignore
      }
    }
    return false;
  }
}

/** Đổi mã PIN quản trị viên trên server (PBKDF2) */
export async function changeAdminPinOnServer(
  currentPin: string,
  newPin: string
): Promise<ChangePinResponse> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Không thể thực hiện ngoài trình duyệt' };
  }

  const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) {
    return { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    const res = await fetch('/api/admin/change-pin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPin, newPin }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem(STORAGE_IS_DEFAULT_PIN, 'false');
      return {
        success: true,
        message: data.message,
        newPinHash: data.newPinHash,
        instructions: data.instructions,
      };
    }

    return {
      success: false,
      error: data.error || 'Đổi mã PIN không thành công',
    };
  } catch {
    return {
      success: false,
      error: 'Không thể kết nối máy chủ để đổi mã PIN. Vui lòng thử lại.',
    };
  }
}

/** Hủy phiên làm việc Admin */
export function destroyAdminSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
  sessionStorage.removeItem('ss3d_admin_authenticated');
}

/** Kiểm tra xem admin đang dùng mã PIN mặc định hay không */
export async function isDefaultPinInUse(): Promise<boolean> {
  if (typeof window === 'undefined') return true;
  const val = localStorage.getItem(STORAGE_IS_DEFAULT_PIN);
  if (val === null) {
    return true;
  }
  return val === 'true';
}

/** Lưu token phiên (legacy/helper) */
export async function createAdminSession(tokenOrHash: string): Promise<void> {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_TOKEN_KEY, tokenOrHash);
}
