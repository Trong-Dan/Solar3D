import { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Heart,
  Share2,
  Download,
  LogOut,
  X,
  Settings,
  Activity,
  Telescope,
  BookOpen,
  GraduationCap,
  Coffee,
  Save,
  RotateCcw,
  Smartphone,
  Monitor,
  Tablet,
  Key,
  AlertTriangle,
  Info,
  Check,
} from 'lucide-react';
import { analyticsTracker, AdminSettings } from '../../services/analyticsTracker';
import { MONETIZATION_CONFIG } from '../../config/monetization';

interface AdminDashboardProps {
  onClose: () => void;
  onLogout: () => void;
}

type TabType = 'overview' | 'events' | 'settings';

export function AdminDashboard({ onClose, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [summary, setSummary] = useState(analyticsTracker.getSummary());
  const [localSettings, setLocalSettings] = useState<AdminSettings>(analyticsTracker.getSettings());
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinChangeMessage, setPinChangeMessage] = useState<string | null>(null);

  // Subscribe to real-time analytics updates
  useEffect(() => {
    const unsubscribe = analyticsTracker.subscribe(() => {
      setSummary(analyticsTracker.getSummary());
      setLocalSettings(analyticsTracker.getSettings());
    });
    return () => unsubscribe();
  }, []);

  const handleExportCSV = () => {
    const csvData = analyticsTracker.exportCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `solar_system_3d_demo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveLocalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    analyticsTracker.updateSettings(localSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim() || newPin.trim().length < 4) {
      setPinChangeMessage('Mã PIN phải có ít nhất 4 ký tự!');
      return;
    }

    const PIN_SALT = 'solar_system_3d_secret_salt_2026';
    const buffer = new TextEncoder().encode(PIN_SALT + newPin.trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const newHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    localStorage.setItem('ss3d_admin_pin_hash_v1', newHash);
    setNewPin('');
    setPinChangeMessage('✅ Đã đổi mã PIN thành công!');
    setTimeout(() => setPinChangeMessage(null), 3000);
  };

  const getItemIcon = (id: string) => {
    switch (id) {
      case 'telescope':
        return <Telescope size={16} className="text-amber-400" />;
      case 'book':
        return <BookOpen size={16} className="text-sky-400" />;
      case 'course':
        return <GraduationCap size={16} className="text-emerald-400" />;
      default:
        return <Coffee size={16} className="text-rose-400" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile':
        return <Smartphone size={13} />;
      case 'tablet':
        return <Tablet size={13} />;
      default:
        return <Monitor size={13} />;
    }
  };

  const configEntries = [
    { label: 'Kính thiên văn (Amazon)', value: MONETIZATION_CONFIG.telescopeUrl },
    { label: 'Sách Cosmos (Amazon)', value: MONETIZATION_CONFIG.bookUrl },
    { label: 'Khóa học Coursera', value: MONETIZATION_CONFIG.courseUrl },
    { label: 'Ủng hộ (Ko-fi)', value: MONETIZATION_CONFIG.supportUrl },
  ];

  return (
    <div className="admin-dashboard-backdrop animate-fade-in">
      <div className="admin-dashboard-container">
        {/* Top Header Bar */}
        <div className="admin-dashboard-header">
          <div className="admin-header-title-block">
            <div className="admin-header-badge">
              <span className="admin-pulsar" />
              <span>CHẾ ĐỘ XEM TRƯỚC (DEMO)</span>
            </div>
            <h1 className="admin-dashboard-title">BẢNG ƯỚC TÍNH DEMO — KHÔNG PHẢI SỐ LIỆU THẬT</h1>
            <p className="admin-dashboard-desc">
              Ước tính lượt click demo trên máy hiện tại. Dữ liệu lưu trong localStorage, không phải số liệu thật từ khách truy cập.
            </p>
          </div>

          <div className="admin-header-actions">
            <button className="admin-btn-export" onClick={handleExportCSV} title="Xuất dữ liệu demo ra file CSV">
              <Download size={15} />
              <span>Xuất CSV</span>
            </button>
            <button className="admin-btn-logout" onClick={onLogout} title="Đăng xuất">
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
            <span>Tổng quan Demo</span>
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <Activity size={16} />
            <span>Nhật ký Chuyển đổi ({summary.totalEvents})</span>
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={16} />
            <span>Cấu hình & Mã PIN</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="admin-content-area">
          {activeTab === 'overview' && (
            <div className="admin-tab-overview animate-fade-in">
              {/* Seed Data Warning Banner */}
              {summary.hasSeedData && (
                <div className="admin-seed-warning-banner" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '10px',
                  color: '#fbbf24',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <span>⚠️ <strong>Dữ liệu mẫu</strong> — Các con số bên dưới là dữ liệu seed minh họa, không phải doanh thu thật. Xóa bằng nút "Làm mới nhật ký" trong tab Nhật ký.</span>
                </div>
              )}

              {/* KPI 4-Card Row */}
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card highlight-gold">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-title">ƯỚC TÍNH DEMO</span>
                    <div className="admin-kpi-icon-wrap gold">
                      <DollarSign size={18} />
                    </div>
                  </div>
                  <div className="admin-kpi-value">{summary.totalRevenueVnd.toLocaleString('vi-VN')}₫</div>
                  <div className="admin-kpi-sub">≈ ${(summary.totalRevenueVnd / 25400).toFixed(2)} USD (chỉ tính trên máy này)</div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-title">LƯỢT CLICK MUA HÀNG</span>
                    <div className="admin-kpi-icon-wrap cyan">
                      <ShoppingCart size={18} />
                    </div>
                  </div>
                  <div className="admin-kpi-value">{summary.affiliateClicks}</div>
                  <div className="admin-kpi-sub">Sản phẩm Affiliate (demo cục bộ)</div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-title">LƯỢT BẤM ỦNG HỘ</span>
                    <div className="admin-kpi-icon-wrap rose">
                      <Heart size={18} />
                    </div>
                  </div>
                  <div className="admin-kpi-value">{summary.donationClicks}</div>
                  <div className="admin-kpi-sub">Ko-fi / Coffee (demo cục bộ)</div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-title">LƯỢT CHIA SẺ MẠNG XÃ HỘI</span>
                    <div className="admin-kpi-icon-wrap emerald">
                      <Share2 size={18} />
                    </div>
                  </div>
                  <div className="admin-kpi-value">{summary.shareClicks}</div>
                  <div className="admin-kpi-sub">Facebook, Twitter / X, Sao chép link</div>
                </div>
              </div>

              {/* Asset & Product Performance Table */}
              <div className="admin-panel-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">HIỆU QUẢ DANH MỤC SẢN PHẨM (DEMO)</h3>
                    <p className="admin-card-subtitle">Ước tính lượt click trên máy hiện tại — không phải dữ liệu từ khách truy cập thật</p>
                  </div>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Sản phẩm / Nguồn</th>
                        <th>Phân loại</th>
                        <th>Lượt nhấp (Clicks)</th>
                        <th>Ước tính demo</th>
                        <th>Trạng thái liên kết</th>
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
                            <span className="admin-table-revenue">
                              {item.estimatedRevenueVnd.toLocaleString('vi-VN')}₫
                            </span>
                          </td>
                          <td>
                            <span className="admin-status-online">
                              <span className="status-dot" /> Demo
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="admin-tab-events animate-fade-in">
              <div className="admin-panel-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">NHẬT KÝ TƯƠNG TÁC (DEMO CỤC BỘ)</h3>
                    <p className="admin-card-subtitle">Sự kiện ghi nhận trên máy hiện tại — không phải dữ liệu khách truy cập thật</p>
                  </div>
                  <button
                    className="admin-btn-clear"
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn xóa sạch dữ liệu nhật ký demo?')) {
                        analyticsTracker.clearAllData();
                      }
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>Làm mới nhật ký</span>
                  </button>
                </div>

                <div className="admin-events-list">
                  {summary.recentEvents.length === 0 ? (
                    <div className="admin-empty-state">Chưa có sự kiện nào được ghi nhận.</div>
                  ) : (
                    summary.recentEvents.map((evt) => (
                      <div key={evt.id} className="admin-event-row">
                        <div className="admin-event-device" title={`Thiết bị: ${evt.device}`}>
                          {getDeviceIcon(evt.device)}
                        </div>
                        <div className="admin-event-info">
                          <span className="admin-event-name">{evt.itemName}</span>
                          <span className="admin-event-time">{evt.formattedTime}</span>
                        </div>
                        <div className="admin-event-tag">
                          {evt.type === 'affiliate_click'
                            ? 'MUA HÀNG'
                            : evt.type === 'donation_click'
                            ? 'ỦNG HỘ'
                            : 'CHIA SẺ'}
                        </div>
                        {evt.estimatedRevenueVnd > 0 && (
                          <div className="admin-event-revenue">
                            +{evt.estimatedRevenueVnd.toLocaleString('vi-VN')}₫
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="admin-tab-settings animate-fade-in">
              <div className="admin-settings-columns">
                {/* Read-only Config Display */}
                <div className="admin-panel-card">
                  <div className="admin-card-header">
                    <div>
                      <h3 className="admin-card-title">ĐƯỜNG DẪN TIẾP THỊ LIÊN KẾT (READ-ONLY)</h3>
                      <p className="admin-card-subtitle">
                        Giá trị được đọc từ source code. Muốn đổi link, sửa <code>src/config/monetization.ts</code> rồi deploy lại.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px 0' }}>
                    {configEntries.map((entry) => (
                      <div key={entry.label} className="admin-form-group">
                        <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>{entry.label}</label>
                        <div style={{
                          padding: '10px 14px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          color: entry.value ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                          fontFamily: 'monospace',
                          wordBreak: 'break-all',
                        }}>
                          {entry.value || '(chưa cấu hình — dán link thật vào src/config/monetization.ts)'}
                        </div>
                      </div>
                    ))}

                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '10px 14px',
                      background: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      color: 'rgba(147, 197, 253, 0.9)',
                      lineHeight: '1.5',
                    }}>
                      <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>
                        Đây là SPA tĩnh — link chỉ thay đổi khi sửa file config trong code rồi deploy lại qua Vercel.
                        Admin Dashboard không có quyền sửa link hiển thị cho khách.
                      </span>
                    </div>
                  </div>

                  {/* Local demo estimation settings */}
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <h4 style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Tỷ lệ ước tính demo (chỉ ảnh hưởng tính toán cục bộ)
                    </h4>
                    <form onSubmit={handleSaveLocalSettings} className="admin-settings-form">
                      <div className="admin-form-group">
                        <label>Hoa hồng Kính thiên văn (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={localSettings.commissionRateTelescope}
                          onChange={(e) => setLocalSettings({ ...localSettings, commissionRateTelescope: Number(e.target.value) })}
                          className="admin-form-input"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Hoa hồng Sách (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={localSettings.commissionRateBook}
                          onChange={(e) => setLocalSettings({ ...localSettings, commissionRateBook: Number(e.target.value) })}
                          className="admin-form-input"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Mức donate trung bình (VND)</label>
                        <input
                          type="number"
                          min={0}
                          value={localSettings.avgDonationVnd}
                          onChange={(e) => setLocalSettings({ ...localSettings, avgDonationVnd: Number(e.target.value) })}
                          className="admin-form-input"
                        />
                      </div>
                      <button type="submit" className="admin-btn-save">
                        {settingsSaved ? <Check size={16} /> : <Save size={16} />}
                        <span>{settingsSaved ? 'Đã lưu!' : 'Lưu tỷ lệ ước tính'}</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Security Settings & Change PIN */}
                <div className="admin-panel-card">
                  <div className="admin-card-header">
                    <div>
                      <h3 className="admin-card-title">ĐỔI MÃ PIN</h3>
                      <p className="admin-card-subtitle">
                        Mã PIN chỉ là UI gate chống bấm nhầm, không bảo vệ dữ liệu nhạy cảm
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
                        placeholder="Nhập mã PIN mới (ví dụ: 999888)"
                        className="admin-form-input"
                        maxLength={12}
                      />
                    </div>

                    {pinChangeMessage && (
                      <div className="admin-auth-info-banner">{pinChangeMessage}</div>
                    )}

                    <button type="submit" className="admin-btn-pin" disabled={!newPin.trim()}>
                      <Key size={16} />
                      <span>Cập Nhật Mã PIN</span>
                    </button>
                  </form>

                  <div className="admin-security-checklist-box">
                    <h4>TRẠNG THÁI HỆ THỐNG:</h4>
                    <ul>
                      <li>✅ File <code>.gitignore</code> đã chặn toàn bộ <code>.env</code> và <code>dist/</code></li>
                      <li>✅ Tắt hoàn toàn <code>sourcemap: false</code> trong file build Production</li>
                      <li>✅ Header <code>X-Frame-Options: DENY</code> chống nhúng lén iframe (Clickjacking)</li>
                      <li>ℹ️ Mã PIN UI gate chống bấm nhầm (không phải bảo mật thật)</li>
                      <li>✅ Phiên đăng nhập lưu trong SessionStorage (tự hủy khi tắt tab)</li>
                      <li>✅ Link affiliate đọc từ source code, không lưu trong localStorage</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
