# AGENTS.MD — BỘ NHỚ DỰ ÁN & HƯỚNG DẪN KỸ THUẬT (PROJECT MEMORY & RULES)

Dự án: **Hệ Mặt Trời 3D — Celestial Showcase** (Website Mô phỏng 3D & Kiếm tiền từ Mạng Xã Hội)  
Công nghệ chính: **React 18 + TypeScript + Vite 6 + Three.js / React Three Fiber + TailwindCSS 4 + Zustand**

---

## 1. TỔNG QUAN TRẠNG THÁI DỰ ÁN ĐẾN HIỆN TẠI (LATEST STATE)

Dự án đã được nâng cấp từ một trang mô phỏng 3D đơn thuần thành một **nền tảng web thương mại điện tử & giáo dục có khả năng kiếm tiền thực tế từ lưu lượng mạng xã hội (TikTok, Facebook, X, Zalo)** và đã được kiểm định chất lượng, bảo mật toàn diện:

### Các tính năng cốt lõi:
1. **Chia sẻ Mạng Xã hội (`ShareButton.tsx`):**
   - Tích hợp Web Share API native trên Mobile (iOS/Android).
   - Tự động nhận diện Desktop để mở Glassmorphic Dropdown Menu: Facebook, Twitter / X, Sao chép link (kèm trạng thái "Đã sao chép!" 2s).
   - Sử dụng icon SVG nội bộ (zero-dependency, không phụ thuộc `lucide-react` cho brand icons).
2. **Cổng Quyên Góp Thực Tế (`DonationModal.tsx` & `SupportButton.tsx`):**
   - Cổng quyên góp đa kênh trực tiếp: Quét mã **VietQR** chuẩn NAPAS 24/7 (sinh mã tự động với số tài khoản, tên chủ TK, số tiền và nội dung chuyển khoản), **Ví MoMo**, và **Ko-fi quốc tế**.
   - Bộ chọn mức ủng hộ nhanh (20k ☕, 50k 🪐, 100k 🚀, 200k 🌟 hoặc số tiền tùy ý).
   - Cho phép người ủng hộ để lại họ tên và lời nhắn chúc mừng dự án.
   - **Bảng Vàng Thiên Hà (Supporters Wall):** Vinh danh các nhà du hành đã quyên góp thật.
3. **Tiếp thị Liên kết (`AffiliateSection.tsx`):**
   - Danh mục 3 sản phẩm: Kính thiên văn Celestron 127EQ (Amazon), Sách Cosmos (Carl Sagan), Khóa học Thiên văn Coursera.
   - Hỗ trợ 2 variant: `cards` (dạng thẻ lưới) và `compact` (dạng dòng tối giản).
   - URL đọc trực tiếp từ `src/config/monetization.ts`.
4. **Cấu hình Kiếm tiền & Tài khoản Ngân hàng (`src/config/monetization.ts`):**
   - Nguồn sự thật duy nhất cho cấu hình ngân hàng thụ hưởng `BANKING_CONFIG` (Mã ngân hàng VietQR, số tài khoản, tên chủ tài khoản, MoMo) và `MONETIZATION_CONFIG`.
5. **Dịch vụ Quản lý Doanh thu & Quyên góp Thật (`src/services/analyticsTracker.ts`):**
   - Quản lý các giao dịch quyên góp thực tế `RealDonation` (ID, tên người gửi, số tiền, phương thức, trạng thái, ngày giờ, lời nhắn).
   - Tính toán tổng số tiền thật nhận được (`totalConfirmedRevenueVnd`) và tiền chờ đối soát.
   - Hỗ trợ Admin thêm giao dịch thủ công khi kiểm tra thấy tiền về app ngân hàng.
   - Hỗ trợ duyệt trạng thái và xuất sổ cái sao kê CSV chuẩn.
6. **Bảng Điều Hành Doanh thu & Quyên góp Thực tế (`AdminDashboard.tsx` & `AdminAuthGate.tsx`):**
   - **Mã PIN mặc định:** `888888`.
   - **Cách truy cập:** Nhấn `Ctrl + Shift + A` (hoặc `Cmd + Shift + A`), hoặc vào URL `?admin=portal`, hoặc nhấp biểu tượng ổ khóa góc dưới cùng bên phải màn hình.
   - **Chức năng:** Giám sát 4 thẻ KPI thực tế (Tổng tiền ủng hộ thật, Lượt click affiliate thật, Lượt mở cổng ủng hộ, Lượt chia sẻ), xem sổ cái sao kê, thêm giao dịch mới, duyệt giao dịch, đổi mã PIN, cấu hình ngân hàng VietQR và xuất file sao kê CSV.

---

## 2. KIẾN TRÚC BẢO MẬT & DỮ LIỆU (SECURITY ARCHITECTURE)

Dự án tuân thủ nghiêm ngặt các nguyên tắc an ninh sau:
- **Git Protection:** `.gitignore` đã chặn triệt để `.env`, `.env.*`, `dist/`, `node_modules/`, `*.pem`, `*.key`. **TUYỆT ĐỐI KHÔNG commit file chứa secrets lên Git.**
- **dist/ đã được untrack:** `dist/` từng bị commit nhưng đã được `git rm -r --cached` (Vercel tự build lại từ source).
- **Chống trộm mã nguồn (Source Maps):** `vite.config.ts` bắt buộc giữ `build.sourcemap: false`.
- **HTTP Security Headers:** `vercel.json` chứa `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Admin Panel = UI gate, KHÔNG phải bảo mật thật:** PIN hash lưu trong localStorage client — bất kỳ ai mở Console đều đọc được dữ liệu. Không lưu thông tin nhạy cảm (API key, tài chính thật) trong client bundle.
- **Tabnabbing Protection:** Mọi liên kết `window.open` hoặc thẻ `<a target="_blank">` bắt buộc phải có `rel="noopener noreferrer"`.
- **LICENSE:** "All Rights Reserved" — cấm sao chép/phân phối lại mã nguồn.
- **Không có `VITE_*` env var chứa secret** (mọi biến `VITE_` bị inline thẳng vào bundle client).

---

## 3. SEO & CRAWLABILITY

- **`public/robots.txt`**: Cho phép tất cả crawler, trỏ sitemap.
- **`public/sitemap.xml`**: URL chính `/`, `lastmod` cập nhật.
- **`index.html`**: Có canonical link, JSON-LD structured data (`WebApplication` schema), Open Graph, Twitter Card.
- **`vercel.json`**: Dùng `rewrites` (không phải `routes`) để static files (`robots.txt`, `sitemap.xml`) được serve trước SPA catch-all.
- **SPA limitation:** Vì client-render, cần kiểm tra Google Search Console → URL Inspection để xác nhận Googlebot render đúng nội dung.

---

## 4. CÁC QUY TẮC PHÁT TRIỂN & KINH NGHIỆM ĐÃ ĐƯỢC GIẢI QUYẾT (CRITICAL GOTCHAS)

1. **InfoPanel Trigger Pill trong Showcase Mode:**
   - Trong `src/components/ui/InfoPanel.tsx`, khi `!isInfoPanelOpen` và `viewMode === 'showcase'`, **bắt buộc phải `return null`**. Nút capsule "Kéo ra" chỉ được hiển thị trong `freeExplore` mode để tránh nằm đè lên quả cầu 3D trong Showcase.
2. **Lucide React Brand Icons:**
   - `lucide-react` v1.x đã gỡ bỏ icon thương hiệu như `Facebook`, `Twitter`. Luôn dùng inline SVG hoặc `@iconify/react` cho icon mạng xã hội.
3. **Mobile Responsive & Safe Areas:**
   - Khi tạo nút điều hướng cố định ở mép màn hình, luôn kèm `env(safe-area-inset-bottom)` và `env(safe-area-inset-top)` để tránh bị che bởi tai thỏ (notch) hoặc thanh home indicator của iPhone/Android.
   - Action buttons ribbon luôn phải có `flex-wrap: wrap` để không tràn màn hình hẹp (≤375px).
4. **Tối ưu Web Fonts:**
   - File `index.html` chỉ load 2 font thiết yếu: `Be Vietnam Pro` (chữ tiếng Việt) và `JetBrains Mono` (thông số kỹ thuật) kèm `display=swap`. Không nhồi nhét quá nhiều font gây giật màn hình (FOIT).
5. **Config kiếm tiền — KHÔNG dùng localStorage cho URL production:**
   - `AffiliateSection.tsx` và `SupportButton.tsx` đọc URL từ `src/config/monetization.ts`, KHÔNG phải `analyticsTracker.getSettings()`.
   - `AdminDashboard.tsx` hiển thị link config dạng read-only. Tab Settings chỉ chỉnh được tỷ lệ hoa hồng ước tính (dùng cho tính toán demo cục bộ).

---

## 5. KẾ HOẠCH BƯỚC TIẾP THEO (NEXT STEPS ROADMAP)

- **Phase 3 — Viral Growth:**
  1. `src/components/viral/PlanetQuiz.tsx`: Trắc nghiệm "Hành tinh nào đại diện cho tính cách của bạn?" (kết quả có nút chia sẻ mạng xã hội tạo viral loop).
  2. `src/components/viral/ScreenshotExport.tsx`: Nút chụp ảnh không gian 3D chất lượng cao có watermark thương hiệu để người dùng đăng story Facebook/TikTok/Instagram.
  3. Deep link routing: `/earth`, `/mars`, `/jupiter` cuộn mượt đến từng hành tinh.
- **Tích hợp thực tế:** Khi có tài khoản Amazon Affiliate và Ko-fi thật, dán link vào `src/config/monetization.ts` → commit → Vercel tự deploy.
- **SEO follow-up:** Đăng ký Google Search Console, submit sitemap, kiểm tra URL Inspection xác nhận Googlebot render đúng.
