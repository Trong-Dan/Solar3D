import { useState, useRef, useEffect } from 'react';
import { Share2, Link2, Check, X } from 'lucide-react';

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TwitterIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface ShareButtonProps {
  planetName?: string;
  planetEnglish?: string;
  variant?: 'pill' | 'icon' | 'compact';
  className?: string;
}

export function ShareButton({ planetName, planetEnglish, variant = 'pill', className = '' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = planetName
    ? `${planetName} (${planetEnglish}) — Hệ Mặt Trời 3D`
    : 'Hệ Mặt Trời 3D — Celestial Showcase';
  const shareText = planetName
    ? `Khám phá ${planetName} trong mô hình 3D tương tác! 🪐✨`
    : 'Khám phá Hệ Mặt Trời 3D tương tác — 9 thiên thể với dữ liệu NASA! 🌍🚀';

  const handleNativeShare = async () => {
    const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0));

    if (isMobile && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
      }
    }

    // On desktop or when native share is unavailable/failed, toggle custom dropdown
    setIsOpen((prev) => !prev);
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer,width=600,height=450');
    setIsOpen(false);
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer,width=600,height=450');
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="share-btn-wrapper" ref={menuRef} style={{ position: 'relative', display: 'inline-flex' }}>
      {variant === 'icon' ? (
        <button
          className="share-icon-btn"
          onClick={handleNativeShare}
          title="Chia sẻ"
          aria-label="Chia sẻ"
        >
          <Share2 size={16} />
        </button>
      ) : variant === 'compact' ? (
        <button
          className="share-compact-btn"
          onClick={handleNativeShare}
          title="Chia sẻ"
        >
          <Share2 size={14} />
          <span>Chia sẻ</span>
        </button>
      ) : (
        <button
          className={`share-pill-btn ${className}`}
          onClick={handleNativeShare}
        >
          <Share2 size={16} />
          <span>Chia sẻ</span>
        </button>
      )}

      {isOpen && (
        <div className="share-dropdown animate-fade-in">
          <div className="share-dropdown-header">
            <span className="share-dropdown-title">Chia sẻ</span>
            <button className="share-close-btn" onClick={() => setIsOpen(false)}>
              <X size={14} />
            </button>
          </div>
          <button className="share-option" onClick={handleFacebook}>
            <FacebookIcon size={16} />
            <span>Facebook</span>
          </button>
          <button className="share-option" onClick={handleTwitter}>
            <TwitterIcon size={16} />
            <span>Twitter / X</span>
          </button>
          <button className="share-option" onClick={handleCopyLink}>
            {copied ? <Check size={16} /> : <Link2 size={16} />}
            <span>{copied ? 'Đã sao chép!' : 'Sao chép liên kết'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
