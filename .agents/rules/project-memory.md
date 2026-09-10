---
description: Bộ nhớ và quy tắc cốt lõi của dự án Solar System 3D (Kiếm tiền, Bảo mật, Quản trị Admin)
globs: **/*
---

# PROJECT MEMORY & ARCHITECTURE RULES

## Thông tin Xác thực & Quản trị
- **Mã PIN Admin mặc định:** `888888` (Mã hóa SHA-256 Web Crypto API).
- **Phím tắt mở Admin Dashboard:** `Ctrl + Shift + A` (Mac: `Cmd + Shift + A`) hoặc URL `?admin=portal` hoặc nút ổ khóa mờ góc dưới cùng bên phải.
- **Service quản lý chuyển đổi:** `src/services/analyticsTracker.ts` ghi nhận lượt click mua hàng affiliate, ủng hộ và doanh thu.

## An Ninh & Chống Rò Rỉ Dữ Liệu
- Tuyệt đối không commit file `.env`, credential, hay token vào Git.
- `vite.config.ts` luôn bật `sourcemap: false` trong `build` để chống lộ mã nguồn.
- Mọi liên kết ra ngoài (`window.open` hoặc `<a target="_blank">`) phải có `noopener,noreferrer`.

## Trải nghiệm Showcase vs Free Explore
- Trong `ShowcaseView`, sân khấu 3D quay cận cảnh chiếm nửa phải màn hình.
- Component `InfoPanel` khi ở trạng thái đóng (`!isInfoPanelOpen`) và đang ở chế độ Showcase (`viewMode === 'showcase'`) BẮT BUỘC trả về `null` để không có nút capsule đè lên quả cầu 3D.
- Chỉ hiển thị nút "Kéo ra" trong chế độ Khám phá 3D tự do (`freeExplore`).

## Quy Tắc Phản Xạ Bắt Buộc (Reflex Rule)
- **Tự động Double-Check 100%:** Sau bất kỳ tác vụ nào, Antigravity BẮT BUỘC tự giác kiểm tra lại:
  1. Vòng lặp render React (`useEffect`, `useCallback`, dependency array).
  2. Race conditions, cờ khóa `useRef` và timeout mạng (`AbortController`).
  3. Xử lý lỗi API (401, 403, 404, 429 Rate Limit, 502) và bảo vệ CORS.
  4. Biên dịch sạch sẽ: Chạy `npx tsc --noEmit` (0 lỗi) và `npm run build` (exit code 0).
  5. Đẩy commit lên Git an toàn.
