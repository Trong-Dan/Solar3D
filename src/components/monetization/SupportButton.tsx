import { Heart, Coffee, ExternalLink } from 'lucide-react';
import { analyticsTracker } from '../../services/analyticsTracker';
import { MONETIZATION_CONFIG } from '../../config/monetization';

interface SupportButtonProps {
  variant?: 'full' | 'compact' | 'inline';
  className?: string;
}

export function SupportButton({ variant = 'full', className = '' }: SupportButtonProps) {
  const supportUrl = MONETIZATION_CONFIG.supportUrl;

  const handleSupport = () => {
    analyticsTracker.trackDonationClick();
    if (supportUrl) {
      window.open(supportUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (variant === 'inline') {
    return (
      <button className={`support-inline-btn ${className}`} onClick={handleSupport}>
        <Coffee size={14} />
        <span>Ủng hộ ☕</span>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button className={`support-compact-btn ${className}`} onClick={handleSupport}>
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
        <div className="support-card-title">Ủng hộ dự án</div>
        <div className="support-card-desc">
          Dự án hoàn toàn miễn phí. Nếu bạn thích, hãy ủng hộ để chúng tôi tiếp tục phát triển!
        </div>
      </div>
      <button className="support-card-cta" onClick={handleSupport}>
        <Heart size={14} />
        <span>Ủng hộ</span>
        <ExternalLink size={12} />
      </button>
    </div>
  );
}
