---
description: QUY TẮC BẮT BUỘC: Luôn tự động double-check toàn diện sau mỗi tác vụ mà không cần người dùng nhắc lại
globs: **/*
---

# MANDATORY AUTOMATIC DOUBLE-CHECK PROTOCOL (QUY TẮC PHẢN XẠ VÔ THỨC)

> [!IMPORTANT]
> **Đây là quy tắc phản xạ tự động và bắt buộc**: Sau BẤT KỲ thay đổi mã nguồn nào (dù lớn hay nhỏ), Antigravity PHẢI tự giác thực hiện quy trình Double-Check toàn diện trước khi thông báo hoàn thành cho người dùng. Không được đợi người dùng nhắc nhở.

---

## 1. BẢNG KIỂM TRA PHẢN XẠ (CHECKLIST BẮT BUỘC)

### A. Logic & Vòng lặp React Hooks (React Lifecycle & Render Safety)
* [ ] **Chống Infinite Loop:** Kiểm tra kỹ mọi `useEffect`, `useCallback`, `useMemo`. Tuyệt đối không đặt biến state được thay đổi bên trong callback vào dependency array của chính callback/effect đó.
* [ ] **Chống Double Trigger / Race Condition:** Với các tác vụ mạng/bất đồng bộ (API, timer), BẮT BUỘC dùng `useRef` (ví dụ `isSyncingRef.current`) làm cờ khóa để ngăn click liên tục hoặc race conditions.
* [ ] **Hủy request / Timeout:** Mọi `fetch` phải có `AbortController` (hoặc timeout thích hợp 5s-10s) để tránh treo vô tận ở trạng thái `loading` khi mạng gián đoạn.

### B. Mạng, API & CORS (Network & Rate Limit Safety)
* [ ] **Xử lý mã lỗi HTTP:** Luôn xử lý đủ các trường hợp `401/403` (sai Token), `404` (sai endpoint), `429` (bị Rate Limit), `500/502` (máy chủ lỗi).
* [ ] **Bảo vệ Rate Limit:** Tuyệt đối không gửi request API dồn dập trên mỗi render. Tuân thủ giới hạn của nhà cung cấp (ví dụ: SePay giới hạn 3 req/giây).
* [ ] **CORS & Proxy:** Đảm bảo request bên ngoài luôn đi qua proxy trung gian an toàn (`/api/sepay` trên Vercel Serverless Function và `vite.config.ts` cho local dev).

### C. An Ninh & Toàn Vẹn Mã Nguồn (Security & Anti-Inspection)
* [ ] Không làm lộ Token, mật khẩu, API Key hay thông tin nhạy cảm.
* [ ] Bảo toàn các lớp bảo vệ chống F12 / DevTools, phím tắt thanh tra mã nguồn (`antiInspect.ts`).
* [ ] Đảm bảo `sourcemap: false` và `drop: ['console', 'debugger']` trong bản build production.

### D. Kiểm tra Biên dịch & Type Checking
* [ ] Chạy `npx tsc --noEmit` và đảm bảo **0 lỗi TypeScript**.
* [ ] Chạy `npm run build` và xác nhận bản build production thành công hoàn toàn (`exit code 0`).
* [ ] Kiểm tra `git status` và `git diff` để đảm bảo không sót thay đổi thừa hoặc file rác.
