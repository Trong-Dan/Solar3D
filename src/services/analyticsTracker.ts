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
  private sepayConfigured: boolean = false;
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

  /** Kiểm tra SePay đã được cấu hình trên server chưa */
  public isSepayConfigured(): boolean {
    return this.sepayConfigured;
  }

  /** Tự động đồng bộ giao dịch chuyển khoản từ ngân hàng MB Bank qua SePay
   *  SePay API Token được quản lý an toàn trên server (Vercel Environment Variable).
   *  Client KHÔNG gửi và KHÔNG biết token — chỉ gọi proxy /api/sepay.
   */
  public async syncFromSepay(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      const params = 'per_page=50';
      const proxyUrl = `/api/sepay?${params}`;

      // Giới hạn thời gian kết nối tối đa 8 giây để tránh treo giao diện
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.sepayConfigured = false;
          return {
            success: false,
            count: 0,
            message: 'API Token SePay trên server không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra biến SEPAY_API_TOKEN trên Vercel Dashboard.',
          };
        }
        if (response.status === 429) {
          return {
            success: false,
            count: 0,
            message: 'Thao tác quá nhanh! SePay giới hạn tối đa 3 yêu cầu/giây. Vui lòng chờ 10 giây rồi thử lại.',
          };
        }
        if (response.status === 404) {
          this.sepayConfigured = false;
          return {
            success: false,
            count: 0,
            message: 'Không tìm thấy máy chủ đồng bộ /api/sepay. Hãy đảm bảo dự án đang chạy với lệnh "npm run dev".',
          };
        }
        if (response.status === 500) {
          this.sepayConfigured = false;
          const errData = await response.json().catch(() => null);
          return {
            success: false,
            count: 0,
            message: errData?.hint || 'Chưa cấu hình SEPAY_API_TOKEN trên server. Vào Vercel Dashboard → Settings → Environment Variables để thêm.',
          };
        }
        return { success: false, count: 0, message: `Lỗi kết nối máy chủ SePay (Mã HTTP: ${response.status})` };
      }

      const data = await response.json();

      // Đánh dấu SePay đã được cấu hình thành công trên server
      this.sepayConfigured = true;

      // Kiểm tra phản hồi lỗi từ SePay (nếu có)
      if (data && (data.status === 'error' || data.error)) {
        return {
          success: false,
          count: 0,
          message: `SePay thông báo: ${data.message || data.error || 'Yêu cầu không được chấp thuận'}`,
        };
      }

      // Hỗ trợ cả SePay API V2 (data.data), V1 (data.transactions), hoặc mảng trực tiếp
      const transactions: any[] = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.transactions)
        ? data.transactions
        : Array.isArray(data.messages)
        ? data.messages
        : Array.isArray(data)
        ? data
        : [];

      if (!Array.isArray(transactions)) {
        return { success: false, count: 0, message: 'Phản hồi từ SePay không chứa danh sách giao dịch hợp lệ.' };
      }

      const targetAcc = this.bankSettings.accountNo.replace(/\D/g, '');
      let addedCount = 0;

      for (const tx of transactions) {
        // Lấy số tiền vào tài khoản (ủng hộ/chuyển khoản)
        const rawAmount = tx.amount_in !== undefined && tx.amount_in !== null ? tx.amount_in : tx.amount;
        const amountIn =
          typeof rawAmount === 'number'
            ? rawAmount
            : parseFloat(String(rawAmount || '0').replace(/[^\d.-]/g, '')) || 0;

        if (amountIn <= 0 || tx.transfer_type === 'out') continue;

        // Nếu có số tài khoản và không trùng khớp với số tài khoản cấu hình thì bỏ qua
        if (tx.account_number && targetAcc) {
          const txAcc = String(tx.account_number).replace(/\D/g, '');
          if (txAcc && targetAcc && !targetAcc.includes(txAcc) && !txAcc.includes(targetAcc)) {
            continue;
          }
        }

        const rawId = String(tx.id || tx.reference_number || Date.now());
        const uniqueId = rawId.startsWith('sepay_') ? rawId : `sepay_${rawId}`;
        const refNumber = String(tx.reference_number || tx.code || tx.id || '').trim();

        // Tránh trùng lặp với giao dịch đã có trong sổ cái
        const exists = this.donations.some(
          (d) => d.id === uniqueId || (refNumber && d.transactionRef && d.transactionRef === refNumber)
        );
        if (exists) continue;

        // Chuẩn hóa thời gian giao dịch (mặc định múi giờ GMT+7 Việt Nam nếu thiếu)
        let txTimestamp = Date.now();
        if (tx.transaction_date) {
          let dateStr = String(tx.transaction_date).trim();
          if (!dateStr.includes('T') && dateStr.includes(' ')) {
            dateStr = dateStr.replace(' ', 'T') + '+07:00';
          }
          const parsed = new Date(dateStr).getTime();
          if (!isNaN(parsed)) txTimestamp = parsed;
        }

        const formattedDate = new Date(txTimestamp).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const content = (tx.transaction_content || '').trim();
        const bankBrand = tx.bank_brand_name || this.bankSettings.bankName || 'MB Bank';
        const donorName = content ? content : `Chuyển khoản ${bankBrand}`;

        const newDonation: RealDonation = {
          id: uniqueId,
          donorName,
          amount: Math.round(amountIn),
          message: content || `Chuyển khoản ủng hộ qua mã QR ${bankBrand}`,
          method: 'vietqr',
          status: 'confirmed',
          timestamp: txTimestamp,
          formattedDate,
          transactionRef: refNumber,
          isPublic: true,
        };

        this.donations.unshift(newDonation);
        addedCount++;
      }

      if (addedCount > 0) {
        this.donations.sort((a, b) => b.timestamp - a.timestamp);
        this.saveDonations();
        this.notifyListeners();
        return {
          success: true,
          count: addedCount,
          message: `Đồng bộ thành công! Đã ghi nhận thêm ${addedCount} giao dịch mới từ MB Bank.`,
        };
      }

      const totalAvailable = transactions.length;
      return {
        success: true,
        count: 0,
        message:
          totalAvailable > 0
            ? `Đã kết nối SePay: Toàn bộ ${totalAvailable} giao dịch MB Bank gần nhất đã được đồng bộ từ trước.`
            : 'Đã kết nối SePay thành công: Hiện chưa có giao dịch mới nào trên tài khoản SePay.',
      };
    } catch (err: any) {
      const isAbort = err?.name === 'AbortError' || String(err).includes('aborted');
      return {
        success: false,
        count: 0,
        message: isAbort
          ? 'Quá thời gian kết nối (8 giây). Máy chủ SePay hoặc mạng bị chậm, vui lòng thử lại.'
          : 'Lỗi mạng khi kết nối SePay. Vui lòng kiểm tra lại đường truyền.',
      };
    }
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

  /** Nhập khôi phục dữ liệu từ file JSON sao lưu với cơ chế kiểm duyệt chặt chẽ (Strict Validation & Anti-XSS) */
  public importBackupJSON(jsonString: string): { success: boolean; count: number; error?: string } {
    if (!jsonString || typeof jsonString !== 'string') {
      return { success: false, count: 0, error: 'Dữ liệu file không hợp lệ' };
    }

    // Giới hạn kích thước tối đa 5MB chống DoS bộ nhớ
    if (jsonString.length > 5 * 1024 * 1024) {
      return { success: false, count: 0, error: 'File sao lưu vượt quá dung lượng cho phép (tối đa 5MB)' };
    }

    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, count: 0, error: 'Cấu trúc file JSON không hợp lệ' };
      }

      if (!Array.isArray(parsed.donations)) {
        return { success: false, count: 0, error: 'File sao lưu không đúng cấu trúc (thiếu danh sách donations)' };
      }

      // Giới hạn tối đa 10,000 giao dịch chống tràn bộ nhớ localStorage
      if (parsed.donations.length > 10000) {
        return { success: false, count: 0, error: 'Số lượng giao dịch vượt quá giới hạn an toàn (tối đa 10,000)' };
      }

      const sanitize = (val: unknown, maxLen = 200): string => {
        if (typeof val !== 'string') return '';
        return val
          .replace(/<[^>]*>/g, '') // Loại bỏ thẻ HTML chống XSS
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Loại bỏ control characters
          .trim()
          .slice(0, maxLen);
      };

      const VALID_METHODS = new Set(['vietqr', 'momo', 'kofi', 'manual']);
      const VALID_STATUSES = new Set(['confirmed', 'pending']);
      const validatedDonations: RealDonation[] = [];

      for (let i = 0; i < parsed.donations.length; i++) {
        const item = parsed.donations[i];
        if (!item || typeof item !== 'object') continue;

        const amount = Number(item.amount);
        if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) {
          continue; // Bỏ qua số tiền không hợp lệ
        }

        const id = sanitize(item.id || `rec_${Date.now()}_${i}`, 64);
        const donorName = sanitize(item.donorName || 'Nhà hảo tâm', 100);
        const message = sanitize(item.message || '', 500);
        const method = VALID_METHODS.has(item.method) ? (item.method as RealDonation['method']) : 'manual';
        const status = VALID_STATUSES.has(item.status) ? (item.status as RealDonation['status']) : 'confirmed';

        let timestamp = Number(item.timestamp);
        if (!Number.isFinite(timestamp) || timestamp < 1577836800000 || timestamp > Date.now() + 86400000) {
          timestamp = Date.now();
        }

        const formattedDate = sanitize(
          item.formattedDate || new Date(timestamp).toLocaleDateString('vi-VN'),
          50
        );

        const transactionRef = item.transactionRef ? sanitize(item.transactionRef, 100) : undefined;
        const isPublic = typeof item.isPublic === 'boolean' ? item.isPublic : true;

        validatedDonations.push({
          id,
          donorName,
          amount: Math.round(amount),
          message,
          method,
          status,
          timestamp,
          formattedDate,
          transactionRef,
          isPublic,
        });
      }

      this.donations = validatedDonations;
      this.saveDonations();

      // Kiểm duyệt cấu hình ngân hàng nếu có
      if (parsed.bankSettings && typeof parsed.bankSettings === 'object') {
        const bs = parsed.bankSettings;
        this.bankSettings = {
          bankId: sanitize(bs.bankId || this.bankSettings.bankId, 20).toUpperCase(),
          bankName: sanitize(bs.bankName || this.bankSettings.bankName, 100),
          accountNo: sanitize(bs.accountNo || this.bankSettings.accountNo, 50).replace(/[^\w-]/g, ''),
          accountName: sanitize(bs.accountName || this.bankSettings.accountName, 100).toUpperCase(),
          momoPhone: sanitize(bs.momoPhone || this.bankSettings.momoPhone, 20).replace(/[^\d+]/g, ''),
          transferPrefix: sanitize(bs.transferPrefix || this.bankSettings.transferPrefix, 30),
        };
        this.saveBankSettings();
      }

      this.notifyListeners();
      return { success: true, count: this.donations.length };
    } catch (err) {
      return { success: false, count: 0, error: 'Không thể đọc nội dung file JSON (lỗi cú pháp)' };
    }
  }
}

export const analyticsTracker = new AnalyticsTracker();
