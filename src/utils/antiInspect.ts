// ================================================================
// ANTI-DEVTOOLS & CODE TAMPERING PROTECTION ENGINE
// Ngăn chặn mở DevTools (F12), Inspect Element, xem mã nguồn,
// và kích hoạt bẫy debugger chống dịch ngược mã (Reverse Engineering)
// ================================================================

import { destroyAdminSession } from './security';

let isNoticeShowing = false;
let lastNoticeTime = 0;

/** Hiển thị thông báo bảo vệ an ninh khi người dùng cố gắng mở DevTools / Inspect */
export function showSecurityWarningToast(message = 'Phím tắt DevTools và kiểm tra phần tử đã bị vô hiệu hóa nhằm bảo vệ an ninh hệ thống.') {
  if (typeof document === 'undefined') return;
  const now = Date.now();
  if (isNoticeShowing || now - lastNoticeTime < 2500) return;

  isNoticeShowing = true;
  lastNoticeTime = now;

  let toast = document.getElementById('ss3d-security-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ss3d-security-toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div class="security-toast-content">
      <div class="security-toast-icon">🛡️</div>
      <div class="security-toast-text">
        <strong class="security-toast-title">BẢO VỆ AN NINH HỆ THỐNG</strong>
        <span class="security-toast-desc">${message}</span>
      </div>
    </div>
  `;
  toast.className = 'security-toast-enter';

  setTimeout(() => {
    if (toast) {
      toast.className = 'security-toast-leave';
      setTimeout(() => {
        toast?.remove();
        isNoticeShowing = false;
      }, 300);
    }
  }, 2200);
}

/** Vô hiệu hóa và khóa toàn bộ các hàm console của trình duyệt */
function neutralizeConsole() {
  if (typeof window === 'undefined') return;

  // In thông báo cảnh báo bản quyền trong Console nếu ai đó cố gắng mở
  try {
    const origLog = console.log;
    origLog(
      '%c⚠️ CẢNH BÁO AN NINH & BẢN QUYỀN HỆ MẶT TRỜ 3D ⚠️\n%cToàn bộ mã nguồn, cơ chế tính toán quỹ đạo 3D và các cổng thanh toán đều được bảo vệ nghiêm ngặt.\nMọi hành vi can thiệp DevTools, sửa đổi biến runtime hoặc dịch ngược mã đều bị ngăn chặn tự động.',
      'color: #f59e0b; font-size: 16px; font-weight: bold; text-shadow: 0 0 10px rgba(245,158,11,0.5);',
      'color: #e2e8f0; font-size: 13px; line-height: 1.6;'
    );
  } catch {}

  // Khi ở môi trường Production: Vô hiệu hóa các phương thức console tránh rò rỉ dữ liệu
  if (import.meta.env.PROD) {
    const noop = () => {};
    const methods = ['log', 'debug', 'info', 'warn', 'error', 'dir', 'table', 'trace', 'group', 'groupEnd'];
    methods.forEach((method) => {
      try {
        (window.console as any)[method] = noop;
      } catch {}
    });
  }
}

/** Khởi tạo toàn bộ các lớp phòng vệ chống F12, chuột phải và can thiệp mã */
export function initAntiInspect() {
  if (typeof window === 'undefined') return;

  // 1. Chặn phím tắt mở DevTools & Xem nguồn (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S)
  window.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      const key = e.key;
      const code = e.keyCode || e.which;
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // Phím F12
      if (key === 'F12' || code === 123) {
        e.preventDefault();
        e.stopPropagation();
        showSecurityWarningToast('Phím F12 (DevTools) đã bị vô hiệu hóa.');
        return false;
      }

      // Windows/Linux: Ctrl+Shift+I, J, C, K, E | macOS: Cmd+Option+I, J, C, U
      const isDevToolsCombo =
        (ctrlOrMeta && shift && ['I', 'i', 'J', 'j', 'C', 'c', 'K', 'k', 'E', 'e'].includes(key)) ||
        (e.metaKey && e.altKey && ['I', 'i', 'J', 'j', 'C', 'c', 'U', 'u', 'K', 'k'].includes(key));

      if (isDevToolsCombo) {
        e.preventDefault();
        e.stopPropagation();
        showSecurityWarningToast('Tổ hợp phím kiểm tra mã nguồn (DevTools) đã bị khóa.');
        return false;
      }

      // Ctrl+U / Cmd+U (View Page Source)
      if (ctrlOrMeta && (key === 'U' || key === 'u' || code === 85)) {
        e.preventDefault();
        e.stopPropagation();
        showSecurityWarningToast('Chức năng xem mã nguồn trang (View Source) đã bị khóa.');
        return false;
      }

      // Ctrl+S / Cmd+S (Save Web Page)
      if (ctrlOrMeta && (key === 'S' || key === 's' || code === 83)) {
        e.preventDefault();
        e.stopPropagation();
        showSecurityWarningToast('Chức năng lưu trang web đã bị khóa.');
        return false;
      }
    },
    { capture: true }
  );

  // 2. Chặn chuột phải (Context Menu) trên toàn bộ trang (cho phép trên input/textarea để người dùng paste)
  window.addEventListener(
    'contextmenu',
    (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return; // Cho phép chuột phải trong ô nhập liệu
      }
      e.preventDefault();
      showSecurityWarningToast('Menu chuột phải đã bị vô hiệu hóa để bảo vệ tài nguyên.');
      return false;
    },
    { capture: true }
  );

  // 3. Khóa hành vi kéo thả lưu ảnh hoặc trích xuất canvas
  window.addEventListener(
    'dragstart',
    (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'IMG' || target.tagName === 'CANVAS')) {
        e.preventDefault();
        return false;
      }
    },
    { capture: true }
  );

  // 4. Clickjacking Protection: Ngăn chặn website bị nhúng vào iframe độc hại của trang khác
  try {
    if (window.top && window.top !== window.self) {
      window.top.location.href = window.self.location.href;
    }
  } catch {
    // Cross-origin iframe
  }

  // 5. Khóa console trong production
  neutralizeConsole();

  // 6. Cơ chế phát hiện DevTools chủ động và kích hoạt bẫy Debugger
  if (import.meta.env.PROD) {
    let isDevToolsActive = false;
    let consecutiveSuspiciousTicks = 0;

    const onDevToolsDetected = () => {
      if (isDevToolsActive) return;
      isDevToolsActive = true;

      // Hủy phiên làm việc Admin ngay lập tức để bảo vệ dữ liệu nhạy cảm
      destroyAdminSession();

      try {
        console.clear();
      } catch {}

      showSecurityWarningToast('Phát hiện công cụ nhà phát triển. Phiên làm việc đã tự động khóa để bảo mật.');

      // Kích hoạt bẫy debugger liên tục để ngăn chặn việc debug/sửa đổi code
      setInterval(() => {
        try {
          const trap = new Function('debugger');
          trap();
        } catch {}
      }, 500);
    };

    // Kiểm tra kích thước cửa sổ trên Desktop (bỏ qua touch/mobile để tránh false positive khi cuộn thanh URL)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window);
    
    if (!isMobile) {
      const checkWindowDelta = () => {
        const threshold = 200;
        const widthDelta = window.outerWidth - window.innerWidth > threshold;
        const heightDelta = window.outerHeight - window.innerHeight > threshold;
        if (widthDelta || heightDelta) {
          onDevToolsDetected();
        }
      };
      window.addEventListener('resize', checkWindowDelta);
    }

    // Đợi 5 giây sau khi tải trang (tránh lag giật do biên dịch shader 3D ban đầu) rồi mới kích hoạt bẫy timing
    setTimeout(() => {
      setInterval(() => {
        const start = performance.now();
        try {
          const checkFn = new Function('debugger');
          checkFn();
        } catch {}
        const diff = performance.now() - start;

        // Điểm dừng debugger thật sự làm khựng luồng thực thi > 250ms
        if (diff > 250) {
          consecutiveSuspiciousTicks++;
          if (consecutiveSuspiciousTicks >= 2 || diff > 1000) {
            onDevToolsDetected();
          }
        } else {
          consecutiveSuspiciousTicks = 0;
        }
      }, 2500);
    }, 5000);
  }
}
