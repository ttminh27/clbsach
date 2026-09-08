#!/usr/bin/env bash

# ==============================================================================
# Script: run.sh
# Description: Chạy ứng dụng CLB Đọc Sách trên môi trường cục bộ (Local)
# ==============================================================================

set -e

# Chuyển vào thư mục chứa script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo " 📚 CLB Đọc Sách - Local Server"
echo "=========================================="

# 1. Kiểm tra node_modules
if [ ! -d "node_modules" ]; then
  echo "📦 Chưa tìm thấy node_modules, đang cài đặt dependencies..."
  npm install
fi

# 2. Quét dữ liệu sách & cập nhật manifest
echo "🔍 Đang quét danh mục sách & audio..."
npm run scan

# 3. Khởi động server
if [ "$1" = "--remote" ]; then
  echo "🌐 Đang khởi chạy web server kết nối Database REMOTE (https://clbsach.pages.dev)..."
  echo "👉 Truy cập tại: http://localhost:3000"
  echo "👉 Nhấn Ctrl+C để dừng server."
  echo "------------------------------------------"
  npm run dev:remote
else
  # 2.5 Kiểm tra và khởi tạo database D1 local
  if [ ! -d ".wrangler/state/v3/d1" ]; then
    echo "🗄️ Đang khởi tạo database Cloudflare D1 cục bộ..."
    npm run db:init
  fi

  echo "🚀 Đang khởi chạy web server (Local Database)..."
  echo "👉 Truy cập tại: http://localhost:3000"
  echo "👉 Nhấn Ctrl+C để dừng server."
  echo "------------------------------------------"
  npm run dev
fi

