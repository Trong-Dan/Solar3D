import { useState, useEffect } from 'react';
import { Lock, ShieldAlert, KeyRound, ArrowRight, X } from 'lucide-react';
import {
  loginAdminWithPin,
  STORAGE_LOCKOUT_UNTIL,
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
      const res = await loginAdminWithPin(pin.trim());
      if (res.success) {
        onSuccess();
      } else {
        if (res.retryAfter) {
          setIsLocked(true);
          setLockoutRemaining(res.retryAfter);
        }
        setError(res.error || 'Mã PIN bảo mật không chính xác.');
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
                maxLength={32}
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
              🔒 Xác thực Server-Side PBKDF2 (100k rounds) • Phiên làm việc HMAC-SHA256
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
