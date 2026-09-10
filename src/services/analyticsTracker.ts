// ================================================================
// PRODUCTION REVENUE & REAL DONATION TRACKER SERVICE
// Quản lý doanh thu thực tế, số tiền ủng hộ thật (VietQR / MoMo / Ko-fi),
// và theo dõi chuyển đổi tiếp thị liên kết (Affiliate).
// ================================================================

import { BANKING_CONFIG, MONETIZATION_CONFIG } from '../config/monetization';

export interface RealDonation {
  id: string;
  donorName: string;
  amount: number;
  message: string;
  method: 'vietqr' | 'momo' | 'kofi' | 'manual';
  status: 'confirmed' | 'pending';
  timestamp: number;
  formattedDate: string;
  transactionRef?: string;
  isPublic?: boolean;
}

export interface TrackingEvent {
  id: string;
  type: 'affiliate_click' | 'donation_gate_open' | 'share_click';
  itemId?: string;
  itemName?: string;
  price?: string;
  device: 'mobile' | 'tablet' | 'desktop';
  timestamp: number;
  formattedTime: string;
  metadata?: Record<string, unknown>;
}

export interface ItemStat {
  id: string;
  name: string;
  tag: string;
  clicks: number;
  url: string;
  lastClickedAt?: number;
}

export interface BankAccountSettings {
  bankId: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  momoPhone: string;
  transferPrefix: string;
}

const STORAGE_KEY_DONATIONS = 'ss3d_real_donations_v2';
const STORAGE_KEY_EVENTS = 'ss3d_analytics_events_v2';
const STORAGE_KEY_BANK_SETTINGS = 'ss3d_bank_settings_v2';

type Listener = () => void;

class AnalyticsTracker {
  private donations: RealDonation[] = [];
  private events: TrackingEvent[] = [];
  private bankSettings: BankAccountSettings = {
    bankId: BANKING_CONFIG.bankId,
    bankName: BANKING_CONFIG.bankName,
    accountNo: BANKING_CONFIG.accountNo,
    accountName: BANKING_CONFIG.accountName,
    momoPhone: BANKING_CONFIG.momoPhone,
    transferPrefix: BANKING_CONFIG.transferPrefix,
  };
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const savedDonations = localStorage.getItem(STORAGE_KEY_DONATIONS);
      if (savedDonations) {
        this.donations = JSON.parse(savedDonations);
      } else {
        // Bắt đầu sạch với 0 giao dịch - chỉ ghi nhận tiền thật
        this.donations = [];
      }

      const savedEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (savedEvents) {
        this.events = JSON.parse(savedEvents);
      }

      const savedBank = localStorage.getItem(STORAGE_KEY_BANK_SETTINGS);
      if (savedBank) {
        this.bankSettings = { ...this.bankSettings, ...JSON.parse(savedBank) };
      }
    } catch {
      this.donations = [];
      this.events = [];
    }
  }

  private saveDonations() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_DONATIONS, JSON.stringify(this.donations));
    } catch {
      // Storage full
    }
  }

  private saveEvents() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(this.events.slice(0, 500)));
    } catch {
      // Storage full
    }
  }

  private saveBankSettings() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_BANK_SETTINGS, JSON.stringify(this.bankSettings));
    } catch {
      // Storage full
    }
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => fn());
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private detectDevice(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width <= 640) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  // ==========================================
  // REAL DONATION MANAGEMENT METHODS
  // ==========================================

  /** Ghi nhận giao dịch khi người dùng xác nhận đã chuyển khoản */
  public recordDonation(data: {
    donorName?: string;
    amount: number;
    message?: string;
    method: 'vietqr' | 'momo' | 'kofi' | 'manual';
    transactionRef?: string;
    status?: 'confirmed' | 'pending';
    isPublic?: boolean;
  }): RealDonation {
    const now = Date.now();
    const newDonation: RealDonation = {
      id: `don_${now}_${Math.random().toString(36).substring(2, 7)}`,
      donorName: (data.donorName || '').trim() || 'Nhà du hành ẩn danh',
      amount: Math.max(1000, Math.round(data.amount)),
      message: (data.message || '').trim() || 'Ủng hộ dự án Vũ Trụ 3D',
      method: data.method,
      status: data.status || 'pending', // Khách báo chuyển khoản -> chờ admin kiểm tra tài khoản
      isPublic: data.isPublic !== false,
      timestamp: now,
      formattedDate: new Date(now).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      transactionRef: data.transactionRef || `${this.bankSettings.transferPrefix} ${Math.floor(1000 + Math.random() * 9000)}`,
    };

    this.donations.unshift(newDonation);
    this.saveDonations();
    this.notifyListeners();
    return newDonation;
  }

  /** Admin ghi nhận thủ công một khoản tiền thật khi app ngân hàng báo nhận tiền */
  public addManualDonation(data: {
    donorName: string;
    amount: number;
    message?: string;
    method?: 'vietqr' | 'momo' | 'kofi' | 'manual';
    status?: 'confirmed' | 'pending';
    isPublic?: boolean;
    transactionRef?: string;
  }): RealDonation {
    const now = Date.now();
    const newDonation: RealDonation = {
      id: `don_manual_${now}_${Math.random().toString(36).substring(2, 6)}`,
      donorName: data.donorName.trim() || 'Nhà hảo tâm',
      amount: Math.max(1000, Math.round(data.amount)),
      message: (data.message || '').trim() || 'Chuyển khoản trực tiếp ngân hàng',
      method: data.method || 'vietqr',
      status: data.status || 'confirmed', // Admin nhập thì mặc định là confirmed
      isPublic: data.isPublic !== false,
      timestamp: now,
      formattedDate: new Date(now).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      transactionRef: data.transactionRef || `GD-${now.toString().slice(-6)}`,
    };

    this.donations.unshift(newDonation);
    this.saveDonations();
    this.notifyListeners();
    return newDonation;
  }

  /** Duyệt hoặc thay đổi trạng thái xác nhận nhận tiền */
  public toggleDonationStatus(id: string) {
    const item = this.donations.find((d) => d.id === id);
    if (item) {
      item.status = item.status === 'confirmed' ? 'pending' : 'confirmed';
      this.saveDonations();
      this.notifyListeners();
    }
  }

  /** Xóa một giao dịch (dùng khi giao dịch trùng lặp hoặc spam) */
  public deleteDonation(id: string) {
    this.donations = this.donations.filter((d) => d.id !== id);
    this.saveDonations();
    this.notifyListeners();
  }

  /** Lấy danh sách vinh danh người ủng hộ đã xác nhận (hiển thị công khai trong Modal) */
  public getPublicSupporters(limit = 10): RealDonation[] {
    return this.donations
      .filter((d) => d.status === 'confirmed' && d.isPublic !== false)
      .slice(0, limit);
  }

  // ==========================================
  // TRAFFIC & INTERACTION TRACKING METHODS
  // ==========================================

  public trackAffiliateClick(itemId: string, itemName: string, priceStr: string, tag: string) {
    const event: TrackingEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'affiliate_click',
      itemId,
      itemName,
      price: priceStr,
      device: this.detectDevice(),
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      metadata: { tag },
    };

    this.events.unshift(event);
    this.saveEvents();
    this.notifyListeners();
  }

  public trackDonationGateOpen() {
    const event: TrackingEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'donation_gate_open',
      itemName: 'Mở Cổng Quyên Góp & Ủng Hộ',
      device: this.detectDevice(),
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    this.events.unshift(event);
    this.saveEvents();
    this.notifyListeners();
  }

  public trackShareClick(platform: string, planetName?: string) {
    const event: TrackingEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'share_click',
      itemName: `Chia sẻ ${planetName || 'Trang chủ'} lên ${platform}`,
      device: this.detectDevice(),
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      metadata: { platform, planetName },
    };

    this.events.unshift(event);
    this.saveEvents();
    this.notifyListeners();
  }

  // ==========================================
  // DASHBOARD SUMMARY & REPORTING
  // ==========================================

  public getSummary() {
    let totalConfirmedRevenueVnd = 0;
    let totalPendingRevenueVnd = 0;
    let confirmedCount = 0;
    let pendingCount = 0;

    for (const d of this.donations) {
      if (d.status === 'confirmed') {
        totalConfirmedRevenueVnd += d.amount;
        confirmedCount++;
      } else {
        totalPendingRevenueVnd += d.amount;
        pendingCount++;
      }
    }

    let affiliateClicks = 0;
    let donationGateOpens = 0;
    let shareClicks = 0;

    const itemMap: Record<string, ItemStat> = {
      telescope: {
        id: 'telescope',
        name: 'Kính thiên văn Celestron 127EQ',
        tag: 'AMAZON',
        clicks: 0,
        url: MONETIZATION_CONFIG.telescopeUrl,
      },
      book: {
        id: 'book',
        name: 'Sách Cosmos — Carl Sagan',
        tag: 'SÁCH',
        clicks: 0,
        url: MONETIZATION_CONFIG.bookUrl,
      },
      course: {
        id: 'course',
        name: 'Khóa học Thiên văn Coursera',
        tag: 'KHÓA HỌC',
        clicks: 0,
        url: MONETIZATION_CONFIG.courseUrl,
      },
    };

    for (const evt of this.events) {
      if (evt.type === 'affiliate_click') {
        affiliateClicks++;
        if (evt.itemId && itemMap[evt.itemId]) {
          itemMap[evt.itemId].clicks++;
          if (!itemMap[evt.itemId].lastClickedAt || evt.timestamp > itemMap[evt.itemId].lastClickedAt!) {
            itemMap[evt.itemId].lastClickedAt = evt.timestamp;
          }
        }
      } else if (evt.type === 'donation_gate_open') {
        donationGateOpens++;
      } else if (evt.type === 'share_click') {
        shareClicks++;
      }
    }

    return {
      totalConfirmedRevenueVnd,
      totalPendingRevenueVnd,
      confirmedCount,
      pendingCount,
      totalDonationsCount: this.donations.length,
      donations: this.donations,
      affiliateClicks,
      donationGateOpens,
      shareClicks,
      totalEvents: this.events.length,
      items: Object.values(itemMap),
      recentEvents: this.events.slice(0, 30),
    };
  }

  // ==========================================
  // BANKING & SETTINGS CONFIG
  // ==========================================

  public getBankSettings(): BankAccountSettings {
    return { ...this.bankSettings };
  }

  public updateBankSettings(newSettings: Partial<BankAccountSettings>) {
    this.bankSettings = { ...this.bankSettings, ...newSettings };
    this.saveBankSettings();
    this.notifyListeners();
  }

  // ==========================================
  // CSV EXPORT (SAO KÊ THẬT)
  // ==========================================

  public exportDonationsCSV(): string {
    const headers = [
      'Mã Giao Dịch',
      'Thời Gian',
      'Người Ủng Hộ',
      'Số Tiền (VND)',
      'Quy Đổi (USD)',
      'Phương Thức',
      'Trạng Thái',
      'Mã Tham Chiếu',
      'Lời Nhắn',
    ];

    const rows = this.donations.map((d) => [
      `"${d.id}"`,
      `"${d.formattedDate}"`,
      `"${d.donorName.replace(/"/g, '""')}"`,
      d.amount,
      (d.amount / 25400).toFixed(2),
      d.method.toUpperCase(),
      d.status === 'confirmed' ? 'ĐÃ NHẬN TIỀN' : 'CHỜ ĐỐI SOÁT',
      `"${d.transactionRef || ''}"`,
      `"${(d.message || '').replace(/"/g, '""')}"`,
    ]);

    return '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public clearAllEvents() {
    this.events = [];
    this.saveEvents();
    this.notifyListeners();
  }

  /** Xuất toàn bộ dữ liệu quỹ ra file JSON bảo mật để cất giữ */
  public exportBackupJSON(): string {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      donations: this.donations,
      bankSettings: this.bankSettings,
    };
    return JSON.stringify(backupData, null, 2);
  }

  /** Nhập khôi phục dữ liệu từ file JSON sao lưu */
  public importBackupJSON(jsonString: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed.donations)) {
        return { success: false, count: 0, error: 'File sao lưu không đúng cấu trúc (thiếu mảng donations)' };
      }

      this.donations = parsed.donations;
      this.saveDonations();

      if (parsed.bankSettings) {
        this.bankSettings = { ...this.bankSettings, ...parsed.bankSettings };
        this.saveBankSettings();
      }

      this.notifyListeners();
      return { success: true, count: this.donations.length };
    } catch (err) {
      return { success: false, count: 0, error: 'Không thể đọc nội dung file JSON' };
    }
  }
}

export const analyticsTracker = new AnalyticsTracker();
