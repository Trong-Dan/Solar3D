import { useState, useEffect, useId } from 'react';
import {
  QrCode,
  Heart,
  Coffee,
  Copy,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Smartphone,
  Wallet,
  Globe,
  Award,
  ShieldCheck,
  Send,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { useSolarStore } from '../../store/solarStore';
import { analyticsTracker, RealDonation } from '../../services/analyticsTracker';
import { BANKING_CONFIG, MONETIZATION_CONFIG } from '../../config/monetization';

type DonationTab = 'vietqr' | 'momo' | 'kofi' | 'supporters';

export function DonationModal() {
  const isDonationModalOpen = useSolarStore((s) => s.isDonationModalOpen);
  const closeDonationModal = useSolarStore((s) => s.closeDonationModal);

  const [activeTab, setActiveTab] = useState<DonationTab>('vietqr');
  const [amount, setAmount] = useState<number>(50000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<'vietqr' | 'momo' | 'kofi'>('vietqr');
  const [showRegisterForm, setShowRegisterForm] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedDonation, setSubmittedDonation] = useState<RealDonation | null>(null);
  const [supporters, setSupporters] = useState<RealDonation[]>(analyticsTracker.getPublicSupporters());

  const bankSettings = analyticsTracker.getBankSettings();
  const formId = useId();

  // Load supporters and track gate open
  useEffect(() => {
    if (isDonationModalOpen) {
      analyticsTracker.trackDonationGateOpen();
      setSupporters(analyticsTracker.getPublicSupporters());
      setIsSuccess(false);
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

  const currentAmount = customAmount ? Math.max(1000, parseInt(customAmount.replace(/\D/g, ''), 10) || 0) : amount;
  const cleanName = donorName.trim() || 'An danh';
  const transferContent = `${bankSettings.transferPrefix} ${cleanName}`.substring(0, 50);

  // Official VietQR API url
  const vietQrUrl = `https://img.vietqr.io/image/${bankSettings.bankId}-${bankSettings.accountNo}-compact2.png?amount=${currentAmount}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(bankSettings.accountName)}`;

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

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setCustomAmount(raw ? parseInt(raw, 10).toLocaleString('vi-VN') : '');
  };

  const handleSubmitConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAmount < 1000) return;

    const donation = analyticsTracker.recordDonation({
      donorName: donorName.trim() || 'Nhà du hành ẩn danh',
      amount: currentAmount,
      message: message.trim() || 'Ủng hộ dự án Hệ Mặt Trời 3D',
      method: selectedMethod,
      transactionRef: transferContent,
      status: 'pending',
      isPublic: true,
    });

    setSubmittedDonation(donation);
    setIsSuccess(true);
    setShowRegisterForm(false);
    setSupporters(analyticsTracker.getPublicSupporters());
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
            onClick={() => {
              setActiveTab('vietqr');
              setIsSuccess(false);
            }}
          >
            <QrCode size={16} />
            <span>Chuyển khoản VietQR</span>
            <span className="donation-tab-pill">24/7</span>
          </button>
          <button
            className={`donation-tab-btn ${activeTab === 'momo' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('momo');
              setIsSuccess(false);
            }}
          >
            <Wallet size={16} />
            <span>Ví MoMo</span>
          </button>
          <button
            className={`donation-tab-btn ${activeTab === 'kofi' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('kofi');
              setIsSuccess(false);
            }}
          >
            <Globe size={16} />
            <span>Quốc tế (Ko-fi)</span>
          </button>
          <button
            className={`donation-tab-btn ${activeTab === 'supporters' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('supporters');
              setIsSuccess(false);
            }}
          >
            <Award size={16} />
            <span>Bảng Vàng Tri Ân ({supporters.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="donation-modal-body">
          {isSuccess ? (
            <div className="donation-success-screen animate-fade-in">
              <div className="donation-success-icon-wrap">
                <Sparkles size={36} className="text-amber-400" />
              </div>
              <h3 className="donation-success-title">CẢM ƠN BẠN RẤT NHIỀU! 🪐✨</h3>
              <p className="donation-success-desc">
                Thông tin ủng hộ của bạn đã được ghi nhận vào hệ thống. Sau khi tiền vào tài khoản ngân hàng, tên và lời chúc của bạn sẽ được vinh danh trên Bảng Vàng Thiên Hà!
              </p>

              {submittedDonation && (
                <div className="donation-receipt-card">
                  <div className="receipt-row">
                    <span>Mã giao dịch:</span>
                    <strong>{submittedDonation.id}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Người ủng hộ:</span>
                    <strong>{submittedDonation.donorName}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Số tiền:</span>
                    <strong className="receipt-amount">{submittedDonation.amount.toLocaleString('vi-VN')}₫</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Nội dung:</span>
                    <span>{submittedDonation.transactionRef}</span>
                  </div>
                  {submittedDonation.message && (
                    <div className="receipt-message">
                      <em>"{submittedDonation.message}"</em>
                    </div>
                  )}
                </div>
              )}

              <div className="donation-success-actions">
                <button
                  className="donation-btn-secondary"
                  onClick={() => {
                    setIsSuccess(false);
                    setActiveTab('supporters');
                  }}
                >
                  <Award size={16} />
                  <span>Xem Bảng Vàng Tri Ân</span>
                </button>
                <button className="donation-btn-primary" onClick={closeDonationModal}>
                  <Check size={16} />
                  <span>Hoàn tất & Quay lại Khám phá</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'vietqr' ? (
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

              {/* Callout to Bảng Vàng */}
              <div className="donation-to-supporters-callout">
                <div className="callout-text">
                  <Sparkles size={16} className="text-amber-400" />
                  <span>Bạn đã chuyển khoản thành công? Hãy báo tin để được vinh danh!</span>
                </div>
                <button
                  type="button"
                  className="btn-go-to-supporters"
                  onClick={() => {
                    setSelectedMethod('vietqr');
                    setActiveTab('supporters');
                    setShowRegisterForm(true);
                  }}
                >
                  <Award size={15} />
                  <span>Ghi Danh Lên Bảng Vàng</span>
                  <ArrowRight size={14} />
                </button>
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

              {/* Callout to Bảng Vàng */}
              <div className="donation-to-supporters-callout">
                <div className="callout-text">
                  <Sparkles size={16} className="text-pink-400" />
                  <span>Bạn đã chuyển tiền MoMo thành công? Hãy báo tin để được vinh danh!</span>
                </div>
                <button
                  type="button"
                  className="btn-go-to-supporters momo-accent"
                  onClick={() => {
                    setSelectedMethod('momo');
                    setActiveTab('supporters');
                    setShowRegisterForm(true);
                  }}
                >
                  <Award size={15} />
                  <span>Ghi Danh Lên Bảng Vàng</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : activeTab === 'kofi' ? (
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
          ) : (
            <div className="donation-supporters-container animate-fade-in">
              <div className="supporters-header-banner">
                <div className="supporters-badge">
                  <Award size={16} className="text-amber-400" />
                  <span>BẢNG VÀNG THIÊN HÀ — DANH SÁCH NHÀ DU HÀNH TRI ÂN</span>
                </div>
                <p className="supporters-subtitle">
                  Chân thành cảm ơn những người bạn tuyệt vời đã đồng hành và tiếp sức cho dự án Hệ Mặt Trời 3D!
                </p>
                <div className="supporters-header-actions">
                  <button
                    type="button"
                    className={`btn-toggle-register-form ${showRegisterForm ? 'is-active' : ''}`}
                    onClick={() => setShowRegisterForm((prev) => !prev)}
                  >
                    <Send size={14} />
                    <span>{showRegisterForm ? '✕ Thu Gọn Biểu Mẫu' : '✍️ Báo Tin Chuyển Khoản & Ghi Danh'}</span>
                  </button>
                </div>
              </div>

              {/* Form thông tin người chuyển khoản đặt tại Bảng Vàng */}
              {showRegisterForm && (
                <div className="supporters-register-card animate-fade-in">
                  <div className="register-card-header">
                    <div className="register-title">
                      <Sparkles size={16} className="text-amber-400" />
                      <span>THÔNG TIN NGƯỜI CHUYỂN KHOẢN (GHI DANH TRI ÂN)</span>
                    </div>
                    <p className="register-subtitle">
                      Nhập thông tin giao dịch bạn vừa thực hiện để tác giả xác nhận và vinh danh bạn lên Bảng Vàng Thiên Hà!
                    </p>
                  </div>

                  <form onSubmit={handleSubmitConfirmation} className="donation-step-form">
                    {/* Method Selector */}
                    <div className="register-method-row">
                      <span className="register-method-label">Kênh bạn đã chuyển:</span>
                      <div className="register-method-chips">
                        <button
                          type="button"
                          className={`register-method-chip ${selectedMethod === 'vietqr' ? 'active' : ''}`}
                          onClick={() => setSelectedMethod('vietqr')}
                        >
                          <QrCode size={13} />
                          <span>VietQR (MB Bank)</span>
                        </button>
                        <button
                          type="button"
                          className={`register-method-chip ${selectedMethod === 'momo' ? 'active' : ''}`}
                          onClick={() => setSelectedMethod('momo')}
                        >
                          <Wallet size={13} />
                          <span>Ví MoMo</span>
                        </button>
                      </div>
                    </div>

                    {/* Step 1: Mức tiền đã ủng hộ */}
                    <div className="donation-step-title">
                      <span className="step-num">1</span>
                      <span>Số tiền bạn đã ủng hộ</span>
                    </div>

                    <div className="donation-preset-grid">
                      {BANKING_CONFIG.presetAmounts.map((preset) => {
                        const isSelected = !customAmount && amount === preset;
                        const label =
                          preset === 20000
                            ? '20.000₫ ☕'
                            : preset === 50000
                            ? '50.000₫ 🪐'
                            : preset === 100000
                            ? '100.000₫ 🚀'
                            : '200.000₫ 🌟';
                        return (
                          <button
                            key={preset}
                            type="button"
                            className={`donation-preset-btn ${isSelected ? 'active' : ''}`}
                            onClick={() => handleSelectPreset(preset)}
                          >
                            <span className="preset-amount">{label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="donation-custom-input-box">
                      <label htmlFor={`${formId}-custom`}>Hoặc nhập số tiền tùy chọn (VND):</label>
                      <div className="custom-input-wrap">
                        <input
                          id={`${formId}-custom`}
                          type="text"
                          inputMode="numeric"
                          placeholder="Ví dụ: 300.000"
                          value={customAmount}
                          onChange={handleCustomAmountChange}
                          className="custom-amount-input"
                        />
                        <span className="currency-suffix">VNĐ</span>
                      </div>
                    </div>

                    {/* Step 2: Tên & Lời nhắn */}
                    <div className="donation-step-title" style={{ marginTop: '16px' }}>
                      <span className="step-num">2</span>
                      <span>Thông tin người gửi & Lời nhắn</span>
                    </div>

                    <div className="donation-input-group">
                      <label htmlFor={`${formId}-name`}>Tên hiển thị trên Bảng Vàng (để trống nếu muốn ẩn danh):</label>
                      <input
                        id={`${formId}-name`}
                        type="text"
                        placeholder="Ví dụ: Trần Hoàng Nam, Vũ Trụ Fan..."
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        maxLength={30}
                        className="donation-text-input"
                      />
                    </div>

                    <div className="donation-input-group">
                      <label htmlFor={`${formId}-msg`}>Lời nhắn gửi gắm đến tác giả:</label>
                      <textarea
                        id={`${formId}-msg`}
                        placeholder="Cảm ơn bạn vì một trang web 3D vũ trụ tuyệt vời..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={160}
                        rows={2}
                        className="donation-textarea"
                      />
                    </div>

                    <button type="submit" className="donation-submit-cta">
                      <Send size={16} />
                      <span>Gửi Thông Tin Ghi Danh Lên Bảng Vàng</span>
                    </button>
                  </form>
                </div>
              )}

              {supporters.length === 0 ? (
                <div className="supporters-empty">
                  <Sparkles size={28} className="text-amber-400" />
                  <p>Chưa có giao dịch vinh danh nào. Hãy là người đầu tiên ghi danh trên Bảng Vàng!</p>
                  <button className="donation-btn-primary" onClick={() => setActiveTab('vietqr')}>
                    Ủng Hộ Ngay
                  </button>
                </div>
              ) : (
                <div className="supporters-grid">
                  {supporters.map((item, idx) => (
                    <div key={item.id} className="supporter-card">
                      <div className="supporter-rank">#{idx + 1}</div>
                      <div className="supporter-avatar">
                        <Heart size={16} className="text-rose-400" />
                      </div>
                      <div className="supporter-content">
                        <div className="supporter-top">
                          <span className="supporter-name">{item.donorName}</span>
                          <span className="supporter-amount font-gold">
                            +{item.amount.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                        <div className="supporter-date">{item.formattedDate}</div>
                        {item.message && (
                          <div className="supporter-msg">
                            "{item.message}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
