import { useState, useEffect } from 'react';
import {
  QrCode,
  Copy,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Wallet,
  Globe,
  ShieldCheck,
  Coffee,
} from 'lucide-react';
import { useSolarStore } from '../../store/solarStore';
import { analyticsTracker } from '../../services/analyticsTracker';
import { BANKING_CONFIG, MONETIZATION_CONFIG } from '../../config/monetization';

type DonationTab = 'vietqr' | 'momo' | 'kofi';

export function DonationModal() {
  const isDonationModalOpen = useSolarStore((s) => s.isDonationModalOpen);
  const closeDonationModal = useSolarStore((s) => s.closeDonationModal);

  const [activeTab, setActiveTab] = useState<DonationTab>('vietqr');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankSettings = analyticsTracker.getBankSettings();

  // Track gate open when modal opens
  useEffect(() => {
    if (isDonationModalOpen) {
      analyticsTracker.trackDonationGateOpen();
    }
  }, [isDonationModalOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isDonationModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDonationModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDonationModalOpen, closeDonationModal]);

  if (!isDonationModalOpen) return null;

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <div className="donation-modal-backdrop animate-fade-in" onClick={closeDonationModal}>
      <div className="donation-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="donation-modal-header">
          <div className="donation-header-glow" />
          <div className="donation-header-title-box">
            <div className="donation-header-badge">
              <Sparkles size={13} className="text-amber-400" />
              <span>DỰ ÁN PHI LỢI NHUẬN CỘNG ĐỒNG</span>
            </div>
            <h2 className="donation-modal-title">TIẾP LỬA ĐAM MÊ VŨ TRỤ</h2>
            <p className="donation-modal-desc">
              Ủng hộ tác giả duy trì máy chủ tốc độ cao và tiếp tục xây dựng các tính năng không gian 3D mới!
            </p>
          </div>
          <button className="donation-close-btn" onClick={closeDonationModal} title="Đóng (Esc)">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="donation-nav-tabs">
          <button
            className={`donation-tab-btn ${activeTab === 'vietqr' ? 'active' : ''}`}
            onClick={() => setActiveTab('vietqr')}
          >
            <QrCode size={16} />
            <span>Chuyển khoản VietQR</span>
            <span className="donation-tab-pill">24/7</span>
          </button>
          <button
            className={`donation-tab-btn ${activeTab === 'momo' ? 'active' : ''}`}
            onClick={() => setActiveTab('momo')}
          >
            <Wallet size={16} />
            <span>Ví MoMo</span>
          </button>
          <button
            className={`donation-tab-btn ${activeTab === 'kofi' ? 'active' : ''}`}
            onClick={() => setActiveTab('kofi')}
          >
            <Globe size={16} />
            <span>Quốc tế (Ko-fi)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="donation-modal-body">
          {activeTab === 'vietqr' ? (
            <div className="donation-single-qr-view animate-fade-in">
              <div className="donation-qr-card-wrap">
                <div className="donation-qr-header-tag">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>QUÉT MÃ VIETQR (MB BANK)</span>
                </div>
                <div className="donation-real-qr-container">
                  <img
                    src={BANKING_CONFIG.realMbQrImage}
                    alt="Mã QR MB Bank Thật - Vũ Trọng Dân"
                    className="donation-real-qr-img"
                    loading="eager"
                  />
                </div>
                <div className="donation-qr-caption">
                  Mở bất kỳ app ngân hàng nào (MB, Vietcombank, Techcombank, VPBank...) để quét mã chuyển nhanh 24/7!
                </div>

                {/* Single-line quick copy bar for STK */}
                <div className="donation-quick-stk-bar">
                  <div className="stk-info">
                    <span className="stk-label">STK MB Bank</span>
                    <span className="stk-val font-mono">{bankSettings.accountNo}</span>
                  </div>
                  <button
                    type="button"
                    className={`quick-copy-stk-btn ${copiedField === 'accountNo' ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(bankSettings.accountNo, 'accountNo')}
                    title="Sao chép số tài khoản MB"
                  >
                    {copiedField === 'accountNo' ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedField === 'accountNo' ? 'Đã chép' : 'Sao chép STK'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'momo' ? (
            <div className="donation-single-qr-view animate-fade-in">
              <div className="donation-qr-card-wrap momo-glow">
                <div className="donation-qr-header-tag momo-tag">
                  <Wallet size={14} className="text-pink-400" />
                  <span>QUÉT MÃ VÍ MOMO (24/7)</span>
                </div>
                <div className="donation-real-qr-container">
                  <img
                    src={BANKING_CONFIG.realMomoQrImage}
                    alt="Mã QR Ví MoMo Thật - Vũ Trọng Dân"
                    className="donation-real-qr-img momo-qr-img"
                    loading="eager"
                  />
                </div>
                <div className="donation-qr-caption">
                  Mở ứng dụng MoMo hoặc bất kỳ app ngân hàng nào để quét mã thanh toán 24/7!
                </div>

                {/* Single-line quick copy bar for MoMo phone */}
                <div className="donation-quick-stk-bar">
                  <div className="stk-info">
                    <span className="stk-label">SĐT Ví MoMo</span>
                    <span className="stk-val font-mono">{bankSettings.momoPhone}</span>
                  </div>
                  <button
                    type="button"
                    className={`quick-copy-stk-btn momo-copy-btn ${copiedField === 'momoPhone' ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(bankSettings.momoPhone, 'momoPhone')}
                    title="Sao chép số điện thoại MoMo"
                  >
                    {copiedField === 'momoPhone' ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedField === 'momoPhone' ? 'Đã chép' : 'Sao chép SĐT'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="donation-kofi-container animate-fade-in">
              <div className="kofi-card">
                <div className="kofi-badge">
                  <Coffee size={18} />
                  <span>BUY ME A COFFEE / KO-FI</span>
                </div>
                <h3 className="kofi-title">Ủng Hộ Quốc Tế Qua Thẻ Visa / Mastercard / PayPal</h3>
                <p className="kofi-desc">
                  Nếu bạn ở nước ngoài hoặc muốn thanh toán qua thẻ quốc tế hay PayPal, bạn có thể ủng hộ dự án thông qua trang Ko-fi chính thức:
                </p>

                <div className="kofi-action-box">
                  <a
                    href={MONETIZATION_CONFIG.supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="kofi-external-link-btn"
                    onClick={() => {
                      analyticsTracker.trackDonationGateOpen();
                    }}
                  >
                    <Coffee size={18} />
                    <span>Mở Trang Ko-fi.com/trongdan</span>
                    <ExternalLink size={14} />
                  </a>
                </div>

                <div className="kofi-note">
                  🔒 Cổng thanh toán bảo mật quốc tế Stripe & PayPal hỗ trợ tiền tệ USD / EUR.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
