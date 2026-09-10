import { useState, useEffect, useRef } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Heart,
  Share2,
  Download,
  Upload,
  LogOut,
  X,
  Settings,
  Activity,
  Telescope,
  BookOpen,
  GraduationCap,
  Save,
  Smartphone,
  Tablet,
  Monitor,
  Key,
  Info,
  Check,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  QrCode,
  Wallet,
  Globe,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  FileSpreadsheet,
  FileJson,
  RefreshCw,
} from 'lucide-react';
import { analyticsTracker, RealDonation } from '../../services/analyticsTracker';
import { MONETIZATION_CONFIG, BANKING_CONFIG } from '../../config/monetization';
import {
  PIN_SALT,
  STORAGE_PIN_HASH,
  sha256,
  isDefaultPinInUse,
} from '../../utils/security';

interface AdminDashboardProps {
  onClose: () => void;
  onLogout: () => void;
}

type TabType = 'overview' | 'ledger' | 'settings';

export function AdminDashboard({ onClose, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [summary, setSummary] = useState(analyticsTracker.getSummary());
  const [bankSettings, setBankSettings] = useState(analyticsTracker.getBankSettings());
  const [bankSaved, setBankSaved] = useState(false);
  const [hasDefaultPin, setHasDefaultPin] = useState(false);

  // Add Manual Donation Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [manualDonorName, setManualDonorName] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualMethod, setManualMethod] = useState<'vietqr' | 'momo' | 'kofi' | 'manual'>('vietqr');
  const [manualStatus, setManualStatus] = useState<'confirmed' | 'pending'>('confirmed');
  const [manualIsPublic, setManualIsPublic] = useState(true);
  const [manualMessage, setManualMessage] = useState('');
  const [manualRef, setManualRef] = useState('');

  // PIN change
  const [newPin, setNewPin] = useState('');
  const [pinChangeMessage, setPinChangeMessage] = useState<string | null>(null);

  // Filter in Ledger
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending'>('all');

  // SePay Auto-Sync State
  const [sepayApiKey, setSepayApiKey] = useState(analyticsTracker.getSepayApiKey());
  const [isSyncingSepay, setIsSyncingSepay] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [sepayKeySaved, setSepayKeySaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check default PIN status and subscribe to updates
  useEffect(() => {
    isDefaultPinInUse().then(setHasDefaultPin);

    const unsubscribe = analyticsTracker.subscribe(() => {
      setSummary(analyticsTracker.getSummary());
      setBankSettings(analyticsTracker.getBankSettings());
    });
    return () => unsubscribe();
  }, []);

  // Tự động đồng bộ từ SePay khi Admin vào xem tab sao kê nếu đã có Token
  useEffect(() => {
    if (activeTab === 'ledger' && analyticsTracker.getSepayApiKey()) {
      handleSyncSepay();
    }
  }, [activeTab]);

  const handleSyncSepay = async (customKey?: string) => {
    if (isSyncingSepay) return;
    setIsSyncingSepay(true);
    setSyncFeedback(null);
    const keyToUse = (typeof customKey === 'string' ? customKey : sepayApiKey).trim();
    if (keyToUse) {
      analyticsTracker.setSepayApiKey(keyToUse);
    }
    try {
      const res = await analyticsTracker.syncFromSepay(keyToUse);
      setSyncFeedback({ success: res.success, message: res.message });
      setTimeout(() => setSyncFeedback(null), 6000);
    } catch {
      setSyncFeedback({ success: false, message: 'Đồng bộ thất bại, vui lòng kiểm tra kết nối mạng.' });
      setTimeout(() => setSyncFeedback(null), 6000);
    } finally {
      setIsSyncingSepay(false);
    }
  };

  const handleSaveSepayKey = (e: React.FormEvent) => {
    e.preventDefault();
    analyticsTracker.setSepayApiKey(sepayApiKey);
    setSepayKeySaved(true);
    setTimeout(() => setSepayKeySaved(false), 2500);
    if (sepayApiKey.trim()) {
      handleSyncSepay();
    }
  };

  const handleExportCSV = () => {
    const csvData = analyticsTracker.exportDonationsCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sao_ke_ung_ho_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportBackupJSON = () => {
    const data = analyticsTracker.exportBackupJSON();
    const blob = new Blob([data], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `backup_ss3d_quy_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportBackupJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = analyticsTracker.importBackupJSON(content);
      if (res.success) {
        alert(`✅ Đã khôi phục thành công ${res.count} giao dịch từ file sao lưu!`);
      } else {
        alert(`❌ Lỗi khôi phục: ${res.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveBankSettings = (e: React.FormEvent) => {
    e.preventDefault();
    analyticsTracker.updateBankSettings(bankSettings);
    setBankSaved(true);
    setTimeout(() => setBankSaved(false), 2500);
  };

  const handleAddManualDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(manualAmount.replace(/\D/g, ''), 10);
    if (!parsedAmount || parsedAmount < 1000) {
      alert('Vui lòng nhập số tiền hợp lệ (tối thiểu 1.000đ)!');
      return;
    }

    analyticsTracker.addManualDonation({
      donorName: manualDonorName.trim() || 'Nhà hảo tâm',
      amount: parsedAmount,
      method: manualMethod,
      status: manualStatus,
      isPublic: manualIsPublic,
      message: manualMessage.trim(),
      transactionRef: manualRef.trim() || undefined,
    });

    setManualDonorName('');
    setManualAmount('');
    setManualMessage('');
    setManualRef('');
    setIsAddModalOpen(false);
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim() || newPin.trim().length < 4) {
      setPinChangeMessage('Mã PIN phải có ít nhất 4 ký tự!');
      return;
    }

    const newHash = await sha256(PIN_SALT + newPin.trim());
    localStorage.setItem(STORAGE_PIN_HASH, newHash);
    setNewPin('');
    setHasDefaultPin(false);
    setPinChangeMessage('✅ Đã đổi mã PIN thành công! Hãy ghi nhớ mã mới này.');
    setTimeout(() => setPinChangeMessage(null), 4000);
  };

  const getMethodBadge = (method: RealDonation['method']) => {
    switch (method) {
      case 'vietqr':
        return (
          <span className="admin-method-badge vietqr">
            <QrCode size={12} />
            <span>VietQR</span>
          </span>
        );
      case 'momo':
        return (
          <span className="admin-method-badge momo">
            <Wallet size={12} />
            <span>MoMo</span>
          </span>
        );
      case 'kofi':
        return (
          <span className="admin-method-badge kofi">
            <Globe size={12} />
            <span>Ko-fi</span>
          </span>
        );
      default:
        return (
          <span className="admin-method-badge manual">
            <DollarSign size={12} />
            <span>Thủ công</span>
          </span>
        );
    }
  };

  const getItemIcon = (id: string) => {
    switch (id) {
      case 'telescope':
        return <Telescope size={16} className="text-amber-400" />;
      case 'book':
        return <BookOpen size={16} className="text-sky-400" />;
      default:
        return <GraduationCap size={16} className="text-emerald-400" />;
    }
  };

  // Filtered donations for ledger tab
  const filteredDonations = summary.donations.filter((d) => {
    const matchesSearch =
      d.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.transactionRef && d.transactionRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-dashboard-backdrop animate-fade-in">
      <div className="admin-dashboard-container">
        {/* Top Header Bar */}
        <div className="admin-dashboard-header">
          <div className="admin-header-title-block">
            <div className="admin-header-badge prod-badge">
              <span className="admin-pulsar prod-pulsar" />
              <span>HỆ THỐNG QUẢN TRỊ THỰC TẾ (PRODUCTION LIVE)</span>
            </div>
            <h1 className="admin-dashboard-title">BẢNG ĐIỀU HÀNH DOANH THU & QUYÊN GÓP THỰC TẾ</h1>
            <p className="admin-dashboard-desc">
              Khu vực bảo mật riêng tư dành cho Quản trị viên theo dõi nguồn thu thực tế.
            </p>
          </div>

          <div className="admin-header-actions">
            <button
              className="admin-btn-add-donation"
              onClick={() => setIsAddModalOpen(true)}
              title="Ghi nhận khoản ủng hộ mới nhận được từ tài khoản ngân hàng"
            >
              <Plus size={15} />
              <span>Ghi nhận ủng hộ</span>
            </button>
            <button className="admin-btn-export" onClick={handleExportCSV} title="Xuất toàn bộ sao kê ra file CSV Excel">
              <FileSpreadsheet size={15} />
              <span>Xuất sao kê CSV</span>
            </button>
            <button className="admin-btn-logout" onClick={onLogout} title="Khóa bảng điều hành">
              <LogOut size={15} />
              <span>Khóa ngay</span>
            </button>
            <button className="admin-btn-close" onClick={onClose} title="Đóng">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-nav-tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <DollarSign size={16} />
            <span>Tổng quan Quỹ & Doanh thu</span>
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
            onClick={() => setActiveTab('ledger')}
          >
            <Activity size={16} />
            <span>Sao kê Quyên góp ({summary.totalDonationsCount})</span>
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={16} />
            <span>Cấu hình & Bảo mật</span>
            {hasDefaultPin && <span className="donation-tab-pill" style={{ background: '#ef4444', color: '#fff' }}>Đổi PIN</span>}
          </button>
        </div>

        {/* Tab Content */}
        <div className="admin-content-area">
          {activeTab === 'overview' && (
            <div className="admin-tab-overview animate-fade-in">
              {/* Default PIN Security Warning Banner */}
              {hasDefaultPin && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 18px',
                  marginBottom: '16px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '12px',
                  color: '#fca5a5',
                  fontSize: '0.85rem',
                  lineHeight: '1.45',
                }}>
                  <ShieldAlert size={22} style={{ flexShrink: 0, color: '#f87171' }} />
                  <div>
                    <strong style={{ color: '#ffffff' }}>KHUYẾN NGHỊ BẢO MẬT KHẨN CẤP:</strong> Bạn đang sử dụng mã PIN mặc định. Vui lòng mở tab <strong>"Cấu hình & Bảo mật"</strong> và đổi sang mã PIN bí mật của riêng bạn để ngăn chặn người ngoài truy cập!
                  </div>
                </div>
              )}

              {/* KPI 4-Card Row */}
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card highlight-gold">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-title">TỔNG TIỀN ỦNG HỘ THỰC TẾ</span>
                    <div className="admin-kpi-icon-wrap gold">
                      <DollarSign size={18} />
                    </div>
                  </div>
                  <div className="admin-kpi-value">{summary.totalConfirmedRevenueVnd.toLocaleString('vi-VN')}₫</div>
                  <div className="admin-kpi-sub">
                    ≈ ${(summary.totalConfirmedRevenueVnd / 25400).toFixed(2)} USD • {summary.confirmedCount} giao dịch đã nhận tiền
                  </div>
                  {summary.totalPendingRevenueVnd > 0 && (
                    <div className="admin-kpi-extra-pending">
                      ⏳ Chờ đối soát: +{summary.totalPendingRevenueVnd.toLocaleString('vi-VN')}₫ ({summary.pendingCount} lượt)
                    </div>
                  )}
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-title">LƯỢT CLICK SẢN PHẨM AFFILIATE</span>
                    <div className="admin-kpi-icon-wrap cyan">
                      <ShoppingCart size={18} />
                    </div>
                  </div>
                  <div className="admin-kpi-value">{summary.affiliateClicks}</div>
                  <div className="admin-kpi-sub">Lượt khách nhấp xem Kính, Sách, Khóa học</div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-title">LƯỢT MỞ CỔNG ỦNG HỘ</span>
                    <div className="admin-kpi-icon-wrap rose">
                      <Heart size={18} />
                    </div>
                  </div>
                  <div className="admin-kpi-value">{summary.donationGateOpens}</div>
                  <div className="admin-kpi-sub">Khách xem mã VietQR / MoMo / Ko-fi</div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-title">LƯỢT CHIA SẺ MẠNG XÃ HỘI</span>
                    <div className="admin-kpi-icon-wrap emerald">
                      <Share2 size={18} />
                    </div>
                  </div>
                  <div className="admin-kpi-value">{summary.shareClicks}</div>
                  <div className="admin-kpi-sub">Facebook, Twitter / X, Sao chép liên kết</div>
                </div>
              </div>

              {/* Recent Real Donations List */}
              <div className="admin-panel-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">CÁC KHOẢN ỦNG HỘ GẦN ĐÂY</h3>
                    <p className="admin-card-subtitle">
                      Danh sách giao dịch quyên góp thực tế nhận từ VietQR, MoMo và Ko-fi
                    </p>
                  </div>
                  <div className="admin-card-header-actions">
                    <button
                      className="admin-btn-mini-add"
                      onClick={() => setIsAddModalOpen(true)}
                    >
                      <Plus size={13} />
                      <span>Thêm giao dịch</span>
                    </button>
                    <button
                      className="admin-btn-mini-view-all"
                      onClick={() => setActiveTab('ledger')}
                    >
                      <span>Xem toàn bộ</span>
                    </button>
                  </div>
                </div>

                {summary.donations.length === 0 ? (
                  <div className="admin-empty-state">
                    <Heart size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                    <p>Chưa có khoản ủng hộ nào. Khi bạn nhận được tiền chuyển khoản trên app ngân hàng, hãy bấm nút <strong>"Ghi nhận ủng hộ"</strong> để lưu vào hệ thống!</p>
                  </div>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th>Thời gian</th>
                          <th>Người ủng hộ</th>
                          <th>Số tiền</th>
                          <th>Kênh</th>
                          <th>Lời nhắn</th>
                          <th>Trạng thái</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.donations.slice(0, 5).map((donation) => (
                          <tr key={donation.id}>
                            <td className="font-mono text-xs">{donation.formattedDate}</td>
                            <td>
                              <strong>{donation.donorName}</strong>
                            </td>
                            <td>
                              <span className="font-gold font-bold">
                                +{donation.amount.toLocaleString('vi-VN')}₫
                              </span>
                            </td>
                            <td>{getMethodBadge(donation.method)}</td>
                            <td>
                              <span className="admin-table-msg">
                                {donation.message ? `"${donation.message}"` : '—'}
                              </span>
                            </td>
                            <td>
                              <button
                                className={`admin-status-pill ${donation.status}`}
                                onClick={() => analyticsTracker.toggleDonationStatus(donation.id)}
                                title="Nhấp để đổi trạng thái Xác nhận / Chờ đối soát"
                              >
                                {donation.status === 'confirmed' ? (
                                  <>
                                    <CheckCircle2 size={12} />
                                    <span>Đã nhận tiền</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock size={12} />
                                    <span>Chờ đối soát</span>
                                  </>
                                )}
                              </button>
                            </td>
                            <td>
                              <button
                                className="admin-row-del-btn"
                                onClick={() => {
                                  if (confirm(`Bạn có chắc muốn xóa giao dịch của "${donation.donorName}"?`)) {
                                    analyticsTracker.deleteDonation(donation.id);
                                  }
                                }}
                                title="Xóa giao dịch"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Product Performance Table */}
              <div className="admin-panel-card" style={{ marginTop: '20px' }}>
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">HIỆU QUẢ TIẾP THỊ LIÊN KẾT (AFFILIATE)</h3>
                    <p className="admin-card-subtitle">Thống kê lưu lượng nhấp chuột thực tế vào các sản phẩm thiên văn</p>
                  </div>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Sản phẩm / Nguồn</th>
                        <th>Phân loại</th>
                        <th>Lượt nhấp (Clicks)</th>
                        <th>Trạng thái liên kết</th>
                        <th>Liên kết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="admin-table-item-cell">
                              <div className="admin-item-icon-box">{getItemIcon(item.id)}</div>
                              <span className="admin-item-name">{item.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="admin-tag-pill">{item.tag}</span>
                          </td>
                          <td>
                            <strong className="admin-table-clicks">{item.clicks}</strong>
                          </td>
                          <td>
                            <span className="admin-status-online">
                              <span className="status-dot prod-dot" /> Đang theo dõi
                            </span>
                          </td>
                          <td>
                            {item.url ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="admin-link-anchor"
                              >
                                <span>Mở link</span>
                                <ExternalLink size={11} />
                              </a>
                            ) : (
                              <span style={{ opacity: 0.4, fontSize: '0.8rem' }}>Chưa cấu hình URL</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className="admin-tab-ledger animate-fade-in">
              <div className="admin-panel-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">SỔ CÁI & SAO KÊ QUYÊN GÓP CHI TIẾT</h3>
                    <p className="admin-card-subtitle">Toàn bộ các khoản tiền ủng hộ được ghi nhận trong hệ thống</p>
                  </div>
                  <div className="admin-ledger-filter-row">
                    <input
                      type="text"
                      placeholder="Tìm theo tên người gửi, mã GD..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="admin-ledger-search"
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="admin-ledger-select"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="confirmed">Đã nhận tiền</option>
                      <option value="pending">Chờ đối soát</option>
                    </select>

                    <button
                      type="button"
                      className={`admin-btn-sync ${isSyncingSepay ? 'syncing' : ''}`}
                      onClick={() => handleSyncSepay(sepayApiKey)}
                      disabled={isSyncingSepay}
                      title="Tự động nạp các khoản chuyển tiền mới từ MB Bank qua SePay"
                    >
                      <RefreshCw size={13} className={isSyncingSepay ? 'animate-spin' : ''} />
                      <span>{isSyncingSepay ? 'Đang đồng bộ...' : 'Đồng bộ SePay'}</span>
                    </button>
                  </div>
                </div>

                {syncFeedback && (
                  <div className={`admin-sync-feedback-banner ${syncFeedback.success ? 'success' : 'warning'}`}>
                    <span>{syncFeedback.message}</span>
                  </div>
                )}

                {filteredDonations.length === 0 ? (
                  <div className="admin-empty-state-card">
                    <div className="empty-state-title">Chưa có giao dịch quyên góp nào</div>
                    {analyticsTracker.getSepayApiKey() ? (
                      <p className="empty-state-desc">
                        Hệ thống đã kết nối SePay. Nhấn <strong>"Đồng bộ SePay"</strong> ở trên hoặc đợi khi có người quét mã VietQR chuyển tiền vào tài khoản MB Bank <code>{bankSettings.accountNo}</code>, giao dịch sẽ tự động hiện tại đây.
                      </p>
                    ) : (
                      <div className="empty-state-sepay-guide">
                        <p className="empty-state-desc">
                          ⚡ <strong>Tự động hiện thông tin người chuyển khoản qua QR:</strong>
                          <br />
                          Để hệ thống tự động bắt biến động số dư tài khoản MB Bank ({bankSettings.accountNo}) mà không cần người dùng ghi danh, hãy kết nối <strong>SePay API Token</strong> (miễn phí).
                        </p>
                        <button
                          type="button"
                          className="admin-btn-goto-settings"
                          onClick={() => setActiveTab('settings')}
                        >
                          <Settings size={14} />
                          <span>Cấu hình SePay Auto-Sync ngay</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th>Mã GD</th>
                          <th>Thời gian</th>
                          <th>Người ủng hộ</th>
                          <th>Số tiền (VND)</th>
                          <th>Quy đổi USD</th>
                          <th>Kênh</th>
                          <th>Mã tham chiếu</th>
                          <th>Lời nhắn</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDonations.map((d) => (
                          <tr key={d.id}>
                            <td className="font-mono text-xs text-muted">{d.id}</td>
                            <td className="font-mono text-xs">{d.formattedDate}</td>
                            <td>
                              <strong>{d.donorName}</strong>
                            </td>
                            <td>
                              <span className="font-gold font-bold">
                                +{d.amount.toLocaleString('vi-VN')}₫
                              </span>
                            </td>
                            <td className="font-mono text-xs text-muted">
                              ≈ ${(d.amount / 25400).toFixed(2)}
                            </td>
                            <td>{getMethodBadge(d.method)}</td>
                            <td className="font-mono text-xs">{d.transactionRef || '—'}</td>
                            <td>
                              <span className="admin-table-msg" title={d.message}>
                                {d.message ? `"${d.message}"` : '—'}
                              </span>
                            </td>
                            <td>
                              <button
                                className={`admin-status-pill ${d.status}`}
                                onClick={() => analyticsTracker.toggleDonationStatus(d.id)}
                                title="Nhấp để đổi trạng thái"
                              >
                                {d.status === 'confirmed' ? (
                                  <>
                                    <CheckCircle2 size={12} />
                                    <span>Đã nhận tiền</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock size={12} />
                                    <span>Chờ đối soát</span>
                                  </>
                                )}
                              </button>
                            </td>
                            <td>
                              <button
                                className="admin-row-del-btn"
                                onClick={() => {
                                  if (confirm(`Bạn có chắc muốn xóa giao dịch của "${d.donorName}"?`)) {
                                    analyticsTracker.deleteDonation(d.id);
                                  }
                                }}
                                title="Xóa giao dịch"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="admin-tab-settings animate-fade-in">
              <div className="admin-settings-columns">
                {/* Bank Account Config Form */}
                <div className="admin-panel-card">
                  <div className="admin-card-header">
                    <div>
                      <h3 className="admin-card-title">CẤU HÌNH TÀI KHOẢN NGÂN HÀNG (VIETQR)</h3>
                      <p className="admin-card-subtitle">
                        Thông tin tài khoản nhận tiền thật hiển thị cho người dùng trên mã VietQR
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveBankSettings} className="admin-settings-form">
                    <div className="admin-form-group">
                      <label>Mã ngân hàng VietQR (MB, VCB, TCB, VPB, ACB, TPB, BIDV, CTG...)</label>
                      <input
                        type="text"
                        value={bankSettings.bankId}
                        onChange={(e) => setBankSettings({ ...bankSettings, bankId: e.target.value.toUpperCase() })}
                        className="admin-form-input font-mono uppercase"
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Tên hiển thị ngân hàng</label>
                      <input
                        type="text"
                        value={bankSettings.bankName}
                        onChange={(e) => setBankSettings({ ...bankSettings, bankName: e.target.value })}
                        className="admin-form-input"
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Số tài khoản thụ hưởng nhận tiền</label>
                      <input
                        type="text"
                        value={bankSettings.accountNo}
                        onChange={(e) => setBankSettings({ ...bankSettings, accountNo: e.target.value })}
                        className="admin-form-input font-mono"
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Tên chủ tài khoản (In hoa không dấu)</label>
                      <input
                        type="text"
                        value={bankSettings.accountName}
                        onChange={(e) => setBankSettings({ ...bankSettings, accountName: e.target.value.toUpperCase() })}
                        className="admin-form-input font-mono uppercase"
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Số điện thoại nhận tiền Ví MoMo</label>
                      <input
                        type="text"
                        value={bankSettings.momoPhone}
                        onChange={(e) => setBankSettings({ ...bankSettings, momoPhone: e.target.value })}
                        className="admin-form-input font-mono"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Cú pháp tiền tố chuyển khoản</label>
                      <input
                        type="text"
                        value={bankSettings.transferPrefix}
                        onChange={(e) => setBankSettings({ ...bankSettings, transferPrefix: e.target.value })}
                        className="admin-form-input font-mono"
                      />
                    </div>

                    <button type="submit" className="admin-btn-save">
                      {bankSaved ? <Check size={16} /> : <Save size={16} />}
                      <span>{bankSaved ? 'Đã lưu cấu hình!' : 'Lưu thông tin ngân hàng'}</span>
                    </button>
                  </form>
                </div>

                {/* SePay Auto-Sync Integration Card */}
                <div className="admin-panel-card">
                  <div className="admin-card-header">
                    <div>
                      <h3 className="admin-card-title">TỰ ĐỘNG ĐỒNG BỘ GIAO DỊCH VIETQR (SEPAY.VN API)</h3>
                      <p className="admin-card-subtitle">
                        Tự động ghi nhận khi người dùng quét mã VietQR MB Bank mà không cần ghi danh
                      </p>
                    </div>
                    <a
                      href="https://sepay.vn"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-link-anchor"
                      style={{ fontSize: '0.82rem' }}
                    >
                      <span>Mở SePay.vn</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  <div className="admin-sepay-guide-steps">
                    <div className="sepay-step-item">
                      <span className="step-badge">1</span>
                      <span>Đăng ký tài khoản miễn phí tại <a href="https://sepay.vn" target="_blank" rel="noopener noreferrer">sepay.vn</a>.</span>
                    </div>
                    <div className="sepay-step-item">
                      <span className="step-badge">2</span>
                      <span>Thêm tài khoản <strong>MB Bank ({bankSettings.accountNo} - {bankSettings.accountName})</strong> vào SePay.</span>
                    </div>
                    <div className="sepay-step-item">
                      <span className="step-badge">3</span>
                      <span>Vào <em>Tích hợp web &rarr; API Token</em>, sao chép API Token dán vào ô bên dưới:</span>
                    </div>
                  </div>

                  <form onSubmit={handleSaveSepayKey} className="admin-settings-form" style={{ marginTop: '14px' }}>
                    <div className="admin-form-group">
                      <label>SePay API Token</label>
                      <input
                        type="password"
                        value={sepayApiKey}
                        onChange={(e) => setSepayApiKey(e.target.value)}
                        placeholder="Dán mã API Token từ SePay.vn"
                        className="admin-form-input font-mono"
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button type="submit" className="admin-btn-save">
                        {sepayKeySaved ? <Check size={16} /> : <Save size={16} />}
                        <span>{sepayKeySaved ? 'Đã lưu Token!' : 'Lưu SePay API Token'}</span>
                      </button>

                      {sepayApiKey.trim() && (
                        <button
                          type="button"
                          className={`admin-btn-sync ${isSyncingSepay ? 'syncing' : ''}`}
                          onClick={() => handleSyncSepay(sepayApiKey)}
                          disabled={isSyncingSepay}
                        >
                          <RefreshCw size={13} className={isSyncingSepay ? 'animate-spin' : ''} />
                          <span>{isSyncingSepay ? 'Đang kiểm tra...' : 'Kiểm tra & Đồng bộ ngay'}</span>
                        </button>
                      )}
                    </div>

                    {syncFeedback && (
                      <div className={`admin-sync-feedback-banner ${syncFeedback.success ? 'success' : 'warning'}`} style={{ marginTop: '10px' }}>
                        <span>{syncFeedback.message}</span>
                      </div>
                    )}
                  </form>
                </div>

                {/* Security Settings & Change PIN & Backup */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Change PIN Card */}
                  <div className="admin-panel-card">
                    <div className="admin-card-header">
                      <div>
                        <h3 className="admin-card-title">BẢO MẬT & ĐỔI MÃ PIN QUẢN TRỊ</h3>
                        <p className="admin-card-subtitle">
                          Mã PIN chỉ riêng bạn biết để đăng nhập và bảo vệ dữ liệu doanh thu
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleChangePin} className="admin-settings-form">
                      <div className="admin-form-group">
                        <label>Mã PIN mới (Ít nhất 4 ký tự)</label>
                        <input
                          type="password"
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          placeholder="Nhập mã PIN riêng tư mới"
                          className="admin-form-input"
                          maxLength={16}
                        />
                      </div>

                      {pinChangeMessage && (
                        <div className="admin-auth-info-banner">{pinChangeMessage}</div>
                      )}

                      <button type="submit" className="admin-btn-pin" disabled={!newPin.trim()}>
                        <Key size={16} />
                        <span>Cập Nhật Mã PIN Bí Mật</span>
                      </button>
                    </form>
                  </div>

                  {/* Backup & Restore Data Card */}
                  <div className="admin-panel-card">
                    <div className="admin-card-header">
                      <div>
                        <h3 className="admin-card-title">SAO LƯU & KHÔI PHỤC DỮ LIỆU</h3>
                        <p className="admin-card-subtitle">
                          Tải dữ liệu quỹ về máy tính để tránh mất khi xóa cache trình duyệt
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                      <button
                        className="donation-btn-secondary"
                        onClick={handleExportBackupJSON}
                        title="Tải toàn bộ dữ liệu quỹ ra file JSON"
                      >
                        <FileJson size={16} />
                        <span>Tải file sao lưu (.JSON)</span>
                      </button>

                      <button
                        className="donation-btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                        title="Nhập dữ liệu từ file sao lưu JSON"
                      >
                        <Upload size={16} />
                        <span>Khôi phục từ JSON</span>
                      </button>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImportBackupJSON}
                        accept=".json"
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Security Checklist */}
                  <div className="admin-security-checklist-box">
                    <h4>CƠ CHẾ AN NINH BẢO VỆ:</h4>
                    <ul>
                      <li>✅ Mã hóa chữ ký HMAC-SHA256 phiên làm việc — chống hack qua DevTools</li>
                      <li>✅ Tự động khóa 15 phút nếu nhập sai mã PIN quá 5 lần</li>
                      <li>✅ Nút mở quản trị được ẩn khỏi giao diện công khai của người dùng</li>
                      <li>✅ Dữ liệu tài khoản nhận tiền chuyển thẳng vào ngân hàng của bạn</li>
                      <li>ℹ️ Link affiliate đọc từ file mã nguồn <code>src/config/monetization.ts</code></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Add Donation Modal */}
      {isAddModalOpen && (
        <div className="admin-submodal-overlay animate-fade-in" onClick={() => setIsAddModalOpen(false)}>
          <div className="admin-submodal-container" onClick={(e) => e.stopPropagation()}>
            <div className="admin-submodal-header">
              <h3>Ghi nhận khoản ủng hộ mới</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddManualDonation} className="admin-submodal-form">
              <div className="admin-form-group">
                <label>Tên người ủng hộ *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trần Văn B, hoặc Nhà hảo tâm"
                  value={manualDonorName}
                  onChange={(e) => setManualDonorName(e.target.value)}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Số tiền (VND) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 100.000"
                  value={manualAmount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setManualAmount(val ? parseInt(val, 10).toLocaleString('vi-VN') : '');
                  }}
                  className="admin-form-input font-mono font-gold"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Kênh thanh toán</label>
                  <select
                    value={manualMethod}
                    onChange={(e) => setManualMethod(e.target.value as any)}
                    className="admin-form-input"
                  >
                    <option value="vietqr">VietQR / Ngân hàng</option>
                    <option value="momo">Ví MoMo</option>
                    <option value="kofi">Ko-fi / Thẻ quốc tế</option>
                    <option value="manual">Khác / Tiền mặt</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Trạng thái</label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value as any)}
                    className="admin-form-input"
                  >
                    <option value="confirmed">Đã nhận tiền (Xác nhận)</option>
                    <option value="pending">Chờ đối soát</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Mã giao dịch / Ghi chú (tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: FT2409... hoặc MB-9821"
                  value={manualRef}
                  onChange={(e) => setManualRef(e.target.value)}
                  className="admin-form-input font-mono"
                />
              </div>

              <div className="admin-form-group">
                <label>Lời nhắn gửi gắm (tùy chọn)</label>
                <textarea
                  placeholder="Ví dụ: Ủng hộ tác giả cốc cà phê phát triển web..."
                  value={manualMessage}
                  onChange={(e) => setManualMessage(e.target.value)}
                  rows={2}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-submodal-actions">
                <button
                  type="button"
                  className="donation-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="donation-btn-primary">
                  <Plus size={16} />
                  <span>Lưu vào Quỹ Thực Tế</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
