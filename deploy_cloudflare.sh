#!/usr/bin/env bash

# ==============================================================================
# Script: deploy_cloudflare.sh
# Description: Tự động dọn dẹp file dư thừa, build và deploy lên Cloudflare Pages
# ==============================================================================

set -e

# Chuyển vào thư mục gốc của dự án
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PROJECT_NAME="${CLOUDFLARE_PROJECT_NAME:-clbsach}"
DEPLOY_BRANCH="${CLOUDFLARE_BRANCH:-production}"
BUILD_DIR="dist"

echo "======================================================"
echo " ☁️  Deploy CLB Đọc Sách -> Cloudflare Pages"
echo "======================================================"
echo "📌 Tên dự án: $PROJECT_NAME"
echo "🌿 Nhánh triển khai: $DEPLOY_BRANCH (Production)"
echo ""

# 1. Kiểm tra node_modules
if [ ! -d "node_modules" ]; then
  echo "📦 Chưa tìm thấy node_modules, đang cài đặt dependencies..."
  npm install
fi

# 2. Dọn dẹp thư mục build cũ
echo "🧹 Dọn dẹp thư mục build cũ..."
rm -rf "$BUILD_DIR"

# 3. Quét metadata sách & Build production
echo "🔨 Đang build dự án (Vite + TypeScript)..."
npm run build

# 4. RÀ SOÁT VÀ LOẠI BỎ TOÀN BỘ FILE DƯ THỪA TRONG DIST
echo ""
echo "🔍 Đang rà soát và loại bỏ file dư thừa trong $BUILD_DIR..."

# 4.1 Xóa thư mục raw (chứa file PDF gốc, docx, tài liệu thô không dùng cho web)
rm -rf "$BUILD_DIR"/books/*/raw
rm -rf "$BUILD_DIR"/books/*/**/raw

# 4.2 Xóa các định dạng file không phục vụ web runtime
find "$BUILD_DIR" -type f \( -name "*.pdf" -o -name "*.docx" -o -name "*.doc" -o -name "*.zip" -o -name "*.rar" -o -name "*.tar.gz" \) -exec rm -f {} +

# 4.3 Xóa file hệ thống và file tạm
find "$BUILD_DIR" -type f \( -name ".DS_Store" -o -name "Thumbs.db" -o -name "*.tmp" -o -name "*.bak" -o -name "*.log" -o -name "*.orig" \) -exec rm -f {} +

# 4.4 Xóa các thư mục rỗng
find "$BUILD_DIR" -type d -empty -delete 2>/dev/null || true

# 5. Đảm bảo file cấu hình Cloudflare Pages tồn tại
if [ ! -f "$BUILD_DIR/_redirects" ]; then
  echo "/* /index.html 200" > "$BUILD_DIR/_redirects"
fi

# 6. Kiểm tra giới hạn dung lượng file của Cloudflare Pages (tối đa 25MB/file)
OVERSIZED_FILES=$(find "$BUILD_DIR" -type f -size +25M)
if [ -n "$OVERSIZED_FILES" ]; then
  echo "⚠️ CẢNH BÁO: Phát hiện file vượt quá giới hạn 25MB của Cloudflare Pages:"
  echo "$OVERSIZED_FILES"
  exit 1
fi

# 7. Báo cáo thống kê chi tiết gói deploy
TOTAL_FILES=$(find "$BUILD_DIR" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)

echo ""
echo "📊 THỐNG KÊ GÓI DEPLOY (ĐÃ TỐI ƯU & LOẠI BỎ RÁC):"
echo "------------------------------------------------------"
echo "  • Tổng số files: $TOTAL_FILES files"
echo "  • Tổng dung lượng: $TOTAL_SIZE"
echo "  • Phân loại tài nguyên:"
find "$BUILD_DIR" -type f | sed -n 's/..*\.//p' | sort | uniq -c | sort -nr | awk '{printf "    - .%-6s : %3d files\n", $2, $1}'
echo "------------------------------------------------------"
echo ""

# 8. Triển khai lên Cloudflare Pages qua Wrangler CLI
echo "🚀 Đang tải lên và triển khai lên Cloudflare Pages (Branch: $DEPLOY_BRANCH)..."

npx wrangler pages deploy "$BUILD_DIR" --project-name "$PROJECT_NAME" --branch "$DEPLOY_BRANCH" --commit-dirty=true "$@"

echo ""
echo "======================================================"
echo "🎉 Triển khai thành công lên Cloudflare Pages!"
echo "👉 Quản lý dự án tại: https://dash.cloudflare.com"
echo "======================================================"
