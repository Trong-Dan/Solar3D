import { useState, useEffect } from 'react';
import { Lock, ShieldAlert, KeyRound, ArrowRight, X } from 'lucide-react';
import {
  sha256,
  createAdminSession,
  PIN_SALT,
  STORAGE_PIN_HASH,
  STORAGE_LOCKOUT_UNTIL,
  STORAGE_FAILED_ATTEMPTS,
} from '../../utils/security';

interface AdminAuthGateProps {
  onSuccess: () => void;
  onClose: () => void;
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

      // Default fallback PIN is 888888 if admin hasn't set one yet
      const defaultHash = await sha256(PIN_SALT + '888888');
      const targetHash = storedHash || defaultHash;

      if (inputHash === targetHash) {
        // Success: Clear failed attempts, generate cryptographically signed session
        localStorage.removeItem(STORAGE_FAILED_ATTEMPTS);
        await createAdminSession(targetHash);
        onSuccess();
      } else {
        // Failed attempt: Rate limiting
        const failedCount = parseInt(localStorage.getItem(STORAGE_FAILED_ATTEMPTS) || '0', 10) + 1;
        localStorage.setItem(STORAGE_FAILED_ATTEMPTS, failedCount.toString());

        if (failedCount >= 5) {
          const lockoutTime = Date.now() + 15 * 60 * 1000; // 15 minutes lockout
          localStorage.setItem(STORAGE_LOCKOUT_UNTIL, lockoutTime.toString());
          setIsLocked(true);
          setError('Quá 5 lần nhập sai! Hệ thống đã khóa tạm thời 15 phút để bảo vệ an toàn.');
        } else {
          setError(`Mã PIN bảo mật không chính xác! Bạn còn ${5 - failedCount} lần thử.`);
        }
        setPin('');
      }
    } catch {
      setError('Lỗi xác thực hệ thống. Vui lòng thử lại.');
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
          <h2 className="admin-auth-title">XÁC THỰC QUẢN TRỊ VIÊN</h2>
          <p className="admin-auth-subtitle">
            Khu vực bảo mật riêng tư dành cho Quản trị viên hệ thống.
          </p>
        </div>

        {isLocked ? (
          <div className="admin-auth-lockout-notice">
            <ShieldAlert size={20} />
            <div>
              <strong>Hệ thống đang bị khóa tạm thời để bảo vệ</strong>
              <p>Vui lòng thử lại sau {lockoutRemaining} giây.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-auth-form">
            <div className="admin-pin-input-wrap">
              <KeyRound size={18} className="admin-input-icon" />
              <input
                type="password"
                maxLength={16}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Nhập mã PIN bảo mật quản trị"
                autoFocus
                className="admin-pin-input"
                disabled={isLoading}
              />
            </div>

            {error && <div className="admin-auth-error">{error}</div>}

            <button type="submit" className="admin-auth-submit-btn" disabled={isLoading || !pin.trim()}>
              <span>{isLoading ? 'Đang kiểm tra...' : 'Mở Khóa Quản Trị'}</span>
              <ArrowRight size={16} />
            </button>

            <div className="admin-auth-hint">
              🔒 Phiên làm việc bảo mật HMAC-SHA256 • Tự hủy khi đóng tab
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
