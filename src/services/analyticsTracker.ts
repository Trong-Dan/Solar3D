// ================================================================
// ANALYTICS & CONVERSION TRACKER SERVICE
// Tracks affiliate clicks, donation clicks, and social shares
// Lưu ý: Dữ liệu tracking chỉ lưu trên localStorage của MÁY HIỆN TẠI
// và chỉ mang tính chất demo/ước tính. Không phải số liệu thật.
// ================================================================

import { MONETIZATION_CONFIG } from '../config/monetization';

export interface TrackingEvent {
  id: string;
  type: 'affiliate_click' | 'donation_click' | 'share_click' | 'page_view';
  itemId?: string;
  itemName?: string;
  price?: string;
  estimatedRevenueVnd: number;
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
  estimatedRevenueVnd: number;
  lastClickedAt?: number;
}

/**
 * AdminSettings giờ chỉ chứa các thông số ước tính demo cục bộ.
 * URL affiliate/donate đã chuyển sang src/config/monetization.ts
 */
export interface AdminSettings {
  commissionRateTelescope: number; // in percentage, e.g. 5%
  commissionRateBook: number;      // in percentage, e.g. 7%
  avgDonationVnd: number;          // e.g. 50,000 VND
}

const STORAGE_KEY_EVENTS = 'ss3d_analytics_events_v1';
const STORAGE_KEY_SETTINGS = 'ss3d_admin_settings_v1';

const DEFAULT_SETTINGS: AdminSettings = {
  commissionRateTelescope: MONETIZATION_CONFIG.commissionRateTelescope,
  commissionRateBook: MONETIZATION_CONFIG.commissionRateBook,
  avgDonationVnd: MONETIZATION_CONFIG.avgDonationVnd,
};

type Listener = () => void;

class AnalyticsTracker {
  private events: TrackingEvent[] = [];
  private settings: AdminSettings = DEFAULT_SETTINGS;
  private listeners: Set<Listener> = new Set();
  private _hasSeedData = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const savedEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (savedEvents) {
        this.events = JSON.parse(savedEvents);
      } else {
        // Initialize with seed metrics for demonstration if empty
        this.seedInitialMetrics();
        this._hasSeedData = true;
      }

      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (savedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
      }
    } catch {
      this.events = [];
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(this.events.slice(0, 500)));
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(this.settings));
    } catch {
      // Storage full or private mode
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

  public trackAffiliateClick(itemId: string, itemName: string, priceStr: string, tag: string) {
    let revenue = 0;
    if (itemId === 'telescope') {
      // 5% of 3,500,000 VND = 175,000 VND
      revenue = Math.round((3500000 * this.settings.commissionRateTelescope) / 100);
    } else if (itemId === 'book') {
      // 7% of 280,000 VND = 19,600 VND
      revenue = Math.round((280000 * this.settings.commissionRateBook) / 100);
    } else if (itemId === 'course') {
      revenue = 25000; // Affiliate referral reward
    }

    const event: TrackingEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'affiliate_click',
      itemId,
      itemName,
      price: priceStr,
      estimatedRevenueVnd: revenue,
      device: this.detectDevice(),
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      metadata: { tag },
    };

    this.events.unshift(event);
    this._hasSeedData = false; // Real data has been added
    this.saveToStorage();
    this.notifyListeners();
  }

  public trackDonationClick() {
    const event: TrackingEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'donation_click',
      itemId: 'kofi_donation',
      itemName: 'Ủng hộ dự án (Ko-fi / Coffee)',
      price: `${this.settings.avgDonationVnd.toLocaleString('vi-VN')}₫`,
      estimatedRevenueVnd: this.settings.avgDonationVnd,
      device: this.detectDevice(),
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    this.events.unshift(event);
    this._hasSeedData = false;
    this.saveToStorage();
    this.notifyListeners();
  }

  public trackShareClick(platform: string, planetName?: string) {
    const event: TrackingEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'share_click',
      itemName: `Chia sẻ ${planetName || 'Trang chủ'} lên ${platform}`,
      estimatedRevenueVnd: 0,
      device: this.detectDevice(),
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      metadata: { platform, planetName },
    };

    this.events.unshift(event);
    this._hasSeedData = false;
    this.saveToStorage();
    this.notifyListeners();
  }

  public getSummary() {
    let totalRevenue = 0;
    let affiliateClicks = 0;
    let donationClicks = 0;
    let shareClicks = 0;

    const itemMap: Record<string, ItemStat> = {
      telescope: { id: 'telescope', name: 'Kính thiên văn Celestron 127EQ', tag: 'AMAZON', clicks: 0, estimatedRevenueVnd: 0 },
      book: { id: 'book', name: 'Sách Cosmos — Carl Sagan', tag: 'SÁCH', clicks: 0, estimatedRevenueVnd: 0 },
      course: { id: 'course', name: 'Khóa học Thiên văn Coursera', tag: 'KHÓA HỌC', clicks: 0, estimatedRevenueVnd: 0 },
      kofi_donation: { id: 'kofi_donation', name: 'Ủng hộ Dự án (Donation)', tag: 'DONATION', clicks: 0, estimatedRevenueVnd: 0 },
    };

    for (const evt of this.events) {
      totalRevenue += evt.estimatedRevenueVnd || 0;
      if (evt.type === 'affiliate_click') affiliateClicks++;
      if (evt.type === 'donation_click') donationClicks++;
      if (evt.type === 'share_click') shareClicks++;

      if (evt.itemId && itemMap[evt.itemId]) {
        itemMap[evt.itemId].clicks++;
        itemMap[evt.itemId].estimatedRevenueVnd += evt.estimatedRevenueVnd || 0;
        if (!itemMap[evt.itemId].lastClickedAt || evt.timestamp > itemMap[evt.itemId].lastClickedAt!) {
          itemMap[evt.itemId].lastClickedAt = evt.timestamp;
        }
      }
    }

    return {
      totalRevenueVnd: totalRevenue,
      affiliateClicks,
      donationClicks,
      shareClicks,
      totalEvents: this.events.length,
      items: Object.values(itemMap),
      recentEvents: this.events.slice(0, 30),
      hasSeedData: this._hasSeedData,
    };
  }

  public getSettings(): AdminSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<AdminSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveToStorage();
    this.notifyListeners();
  }

  public exportCSV(): string {
    const headers = ['ID', 'Type', 'Item', 'Price', 'Estimated Revenue (VND)', 'Device', 'Timestamp', 'Date Time'];
    const rows = this.events.map((e) => [
      e.id,
      e.type,
      `"${e.itemName || ''}"`,
      `"${e.price || ''}"`,
      e.estimatedRevenueVnd,
      e.device,
      e.timestamp,
      new Date(e.timestamp).toISOString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return csvContent;
  }

  public clearAllData() {
    this.events = [];
    this._hasSeedData = false;
    this.saveToStorage();
    this.notifyListeners();
  }

  private seedInitialMetrics() {
    const now = Date.now();
    const seedEvents: TrackingEvent[] = [
      {
        id: 'seed_1',
        type: 'affiliate_click',
        itemId: 'telescope',
        itemName: '[MẪU] Kính thiên văn Celestron 127EQ',
        price: '~3.500.000₫',
        estimatedRevenueVnd: 175000,
        device: 'mobile',
        timestamp: now - 1000 * 60 * 25,
        formattedTime: '23:35:10',
      },
      {
        id: 'seed_2',
        type: 'donation_click',
        itemId: 'kofi_donation',
        itemName: '[MẪU] Ủng hộ dự án (Ko-fi / Coffee)',
        price: '50.000₫',
        estimatedRevenueVnd: 50000,
        device: 'desktop',
        timestamp: now - 1000 * 60 * 55,
        formattedTime: '23:05:40',
      },
      {
        id: 'seed_3',
        type: 'affiliate_click',
        itemId: 'book',
        itemName: '[MẪU] Sách Cosmos — Carl Sagan',
        price: '~280.000₫',
        estimatedRevenueVnd: 19600,
        device: 'mobile',
        timestamp: now - 1000 * 60 * 120,
        formattedTime: '22:00:15',
      },
    ];
    this.events = seedEvents;
    this._hasSeedData = true;
  }
}

export const analyticsTracker = new AnalyticsTracker();
