#!/usr/bin/env node

/**
 * Script: reset-password.mjs
 * Sử dụng:
 *   node scripts/reset-password.mjs <email> [mat_khau_moi] [--remote]
 *
 * Ví dụ:
 *   node scripts/reset-password.mjs admin@clbsach.ngontinh365.com "123456" --remote
 *   node scripts/reset-password.mjs user@example.com --remote
 */

import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const isRemote = args.includes('--remote');
const filteredArgs = args.filter((a) => a !== '--remote');

const email = filteredArgs[0];
let newPassword = filteredArgs[1];

if (!email) {
  console.log(`
👉 Cách dùng:
   node scripts/reset-password.mjs <email> [mat_khau_moi] [--remote]

Ví dụ:
   node scripts/reset-password.mjs admin@clbsach.ngontinh365.com "MatKhauMoi@123" --remote
   node scripts/reset-password.mjs reader@gmail.com --remote
  `);
  process.exit(1);
}

if (!newPassword) {
  const rand = Math.floor(100000 + Math.random() * 900000);
  newPassword = `Clb@${rand}`;
  console.log(`ℹ️ Không chỉ định mật khẩu mới, tự động sinh mật khẩu ngẫu nhiên: ${newPassword}`);
}

if (newPassword.length < 6) {
  console.error('❌ Mật khẩu phải có tối thiểu 6 ký tự.');
  process.exit(1);
}

// PBKDF2 hash using Node crypto (100,000 iterations, sha256)
const saltBytes = crypto.randomBytes(16);
const saltHex = saltBytes.toString('hex');
const derivedKey = crypto.pbkdf2Sync(newPassword, saltBytes, 100000, 32, 'sha256');
const hashHex = derivedKey.toString('hex');
const now = new Date().toISOString();

console.log(`🔐 Đang cập nhật mật khẩu cho [${email}] trên ${isRemote ? 'Cloudflare D1 (Remote)' : 'Local D1'}...`);

const remoteFlag = isRemote ? '--remote' : '';
const escapedEmail = email.replace(/'/g, "''");
const sql = `UPDATE users SET password_hash = '${hashHex}', salt = '${saltHex}', updated_at = '${now}' WHERE email = '${escapedEmail}';`;

try {
  const result = execSync(
    `npx wrangler d1 execute clbsach_db ${remoteFlag} --command="${sql}"`,
    { encoding: 'utf-8' }
  );
  console.log(result);
  console.log(`=======================================================`);
  console.log(`🎉 ĐẶT LẠI MẬT KHẨU THÀNH CÔNG!`);
  console.log(`📧 Email:    ${email}`);
  console.log(`🔑 Mật khẩu: ${newPassword}`);
  console.log(`=======================================================`);
} catch (err) {
  console.error('❌ Lỗi khi thực thi lệnh Wrangler:', err.message);
  process.exit(1);
}
