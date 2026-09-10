import { useState, useEffect } from 'react';
import { Lock, ShieldAlert, KeyRound, ArrowRight, X } from 'lucide-react';

interface AdminAuthGateProps {
  onSuccess: () => void;
  onClose: () => void;
}

const STORAGE_PIN_HASH = 'ss3d_admin_pin_hash_v1';
const STORAGE_LOCKOUT_UNTIL = 'ss3d_admin_lockout_v1';
const STORAGE_FAILED_ATTEMPTS = 'ss3d_admin_failed_v1';
const PIN_SALT = 'solar_system_3d_secret_salt_2026';

// Helper to calculate SHA-256 hash using Web Crypto API
async function sha256(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function AdminAuthGate({ onSuccess, onClose }: AdminAuthGateProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Check lockout status on mount
  useEffect(() => {
    const checkLockout = () => {
      const lockoutUntil = parseInt(localStorage.getItem(STORAGE_LOCKOUT_UNTIL) || '0', 10);
      const now = Date.now();
      if (lockoutUntil > now) {
        setIsLocked(true);
        setLockoutRemaining(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setIsLocked(false);
        setLockoutRemaining(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || !pin.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const inputHash = await sha256(PIN_SALT + pin.trim());
      const storedHash = localStorage.getItem(STORAGE_PIN_HASH);

      // Default PIN is 888888 if not previously changed
      const defaultHash = await sha256(PIN_SALT + '888888');
      const targetHash = storedHash || defaultHash;

      if (inputHash === targetHash) {
        // Success
        localStorage.removeItem(STORAGE_FAILED_ATTEMPTS);
        sessionStorage.setItem('ss3d_admin_authenticated', 'true');
        onSuccess();
      } else {
        // Failed attempt
        const failedCount = parseInt(localStorage.getItem(STORAGE_FAILED_ATTEMPTS) || '0', 10) + 1;
        localStorage.setItem(STORAGE_FAILED_ATTEMPTS, failedCount.toString());

        if (failedCount >= 5) {
          const lockoutTime = Date.now() + 15 * 60 * 1000; // 15 minutes lockout
          localStorage.setItem(STORAGE_LOCKOUT_UNTIL, lockoutTime.toString());
          setIsLocked(true);
          setError('Quá 5 lần nhập sai! Hệ thống đã khóa tạm thời 15 phút để chống dò mật khẩu.');
        } else {
          setError(`Mã PIN không chính xác! Bạn còn ${5 - failedCount} lần thử.`);
        }
        setPin('');
      }
    } catch {
      setError('Lỗi xác thực. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-auth-overlay animate-fade-in">
      <div className="admin-auth-shell">
        <button className="admin-auth-close" onClick={onClose} title="Đóng">
          <X size={18} />
        </button>

        <div className="admin-auth-header">
          <div className="admin-auth-icon-badge">
            <Lock size={24} />
          </div>
          <h2 className="admin-auth-title">CHẾ ĐỘ XEM TRƯỚC</h2>
          <p className="admin-auth-subtitle">
            Xem thống kê demo cục bộ. Mã PIN chỉ chống bấm nhầm, không bảo vệ dữ liệu nhạy cảm.
          </p>
        </div>

        {isLocked ? (
          <div className="admin-auth-lockout-notice">
            <ShieldAlert size={20} />
            <div>
              <strong>Hệ thống đang bị khóa tạm thời</strong>
              <p>Thử lại sau {lockoutRemaining} giây.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-auth-form">
            <div className="admin-pin-input-wrap">
              <KeyRound size={18} className="admin-input-icon" />
              <input
                type="password"
                maxLength={12}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Nhập mã PIN (Mặc định: 888888)"
                autoFocus
                className="admin-pin-input"
                disabled={isLoading}
              />
            </div>

            {error && <div className="admin-auth-error">{error}</div>}

            <button type="submit" className="admin-auth-submit-btn" disabled={isLoading || !pin.trim()}>
              <span>{isLoading ? 'Đang xác thực...' : 'Mở Khóa Quản Trị'}</span>
              <ArrowRight size={16} />
            </button>

            <div className="admin-auth-hint">
              🔒 Mã PIN lưu cục bộ • Phiên tự hủy khi đóng tab
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
