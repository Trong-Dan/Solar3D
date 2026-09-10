import { Heart, Coffee, QrCode } from 'lucide-react';
import { useSolarStore } from '../../store/solarStore';

interface SupportButtonProps {
  variant?: 'full' | 'compact' | 'inline';
  className?: string;
}

export function SupportButton({ variant = 'full', className = '' }: SupportButtonProps) {
  const openDonationModal = useSolarStore((s) => s.openDonationModal);

  const handleSupport = () => {
    openDonationModal();
  };

  if (variant === 'inline') {
    return (
      <button className={`support-inline-btn ${className}`} onClick={handleSupport} title="Ủng hộ dự án qua VietQR / MoMo / Ko-fi">
        <Coffee size={14} />
        <span>Ủng hộ ☕</span>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button className={`support-compact-btn ${className}`} onClick={handleSupport} title="Ủng hộ dự án qua VietQR / MoMo / Ko-fi">
        <Heart size={15} />
        <span>Ủng hộ dự án</span>
      </button>
    );
  }

  return (
    <div className={`support-card-full ${className}`}>
      <div className="support-card-icon">
        <Coffee size={20} />
      </div>
      <div className="support-card-text">
        <div className="support-card-title">Ủng hộ dự án Hệ Mặt Trời 3D</div>
        <div className="support-card-desc">
          Dự án phi lợi nhuận phục vụ cộng đồng thiên văn. Mọi sự ủng hộ (VietQR, MoMo, Ko-fi) đều được vinh danh trên Bảng Vàng Thiên Hà!
        </div>
      </div>
      <button className="support-card-cta" onClick={handleSupport}>
        <QrCode size={14} />
        <span>Ủng hộ ngay</span>
      </button>
    </div>
  );
}
