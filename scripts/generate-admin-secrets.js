#!/usr/bin/env node

// ================================================================
// TIỆN ÍCH TẠO MÃ BẢO MẬT ADMIN & ENVIRONMENT VARIABLES
// Dùng để tạo các giá trị bảo mật PBKDF2 + HMAC trước khi deploy Vercel
// Cách dùng:
//   node scripts/generate-admin-secrets.js [MÃ_PIN_TÙY_CHỌN]
// Ví dụ:
//   node scripts/generate-admin-secrets.js 987654
// ================================================================

import { pbkdf2Sync, randomBytes } from 'crypto';

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_LENGTH = 64;
const PBKDF2_DIGEST = 'sha256';

const chosenPin = (process.argv[2] || '888888').trim();

if (chosenPin.length < 4) {
  console.error('❌ Lỗi: Mã PIN phải có ít nhất 4 ký tự!');
  process.exit(1);
}

// 1. Sinh Salt ngẫu nhiên 32 bytes (64 hex characters)
const salt = randomBytes(32).toString('hex');

// 2. Hash PIN bằng PBKDF2 100,000 vòng
const hash = pbkdf2Sync(
  chosenPin,
  salt,
  PBKDF2_ITERATIONS,
  PBKDF2_KEY_LENGTH,
  PBKDF2_DIGEST
).toString('hex');

// 3. Sinh Session Secret ngẫu nhiên 32 bytes (64 hex characters)
const sessionSecret = randomBytes(32).toString('hex');

console.log('\n================================================================');
console.log('       KHỞI TẠO BẢO MẬT QUẢN TRỊ VIÊN — PRODUCTION READY');
console.log('================================================================\n');

console.log(`🔑 Mã PIN đã chọn:    ${chosenPin}`);
console.log(`🛡️  Thuật toán:        PBKDF2 (100,000 iterations, SHA-256, 512-bit key)`);
console.log(`🔒 Session Signing:   HMAC-SHA256 (2-hour auto-expiring tokens)\n`);

console.log('--- COPY CÁC DÒNG SAU VÀO VERCEL ENVIRONMENT VARIABLES ---');
console.log('(Vercel Dashboard → Project Settings → Environment Variables)\n');

console.log(`ADMIN_PIN_SALT=${salt}`);
console.log(`ADMIN_PIN_HASH=${hash}`);
console.log(`ADMIN_SESSION_SECRET=${sessionSecret}`);

console.log('\n----------------------------------------------------------');
console.log('💡 Lưu ý quan trọng:');
console.log('1. Hãy ghi nhớ mã PIN: "' + chosenPin + '" để đăng nhập vào Bảng Quản Trị.');
console.log('2. Không commit các giá trị trên vào git repository công khai.');
console.log('3. Thêm SEPAY_API_TOKEN từ my.sepay.vn để tự động đồng bộ tiền VietQR.\n');
