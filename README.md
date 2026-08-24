# 📚 CLB Đọc Sách VietinBank (VietinBank Book Club)

Một ứng dụng web hiện đại, tinh gọn và tối ưu dành cho Câu lạc bộ Đọc Sách, giúp lan tỏa văn hóa đọc, phát triển bản thân và rèn luyện kỹ năng thông qua sách điện tử (E-book Markdown) cùng các bài thực hành Thiền / Audio hướng dẫn.

---

## ✨ Tính Năng Nổi Bật

### 📖 Trải Nghiệm Đọc Sách Hiện Đại
- **Đọc sách chuẩn Markdown**: Trình bày nội dung trực quan, hỗ trợ đầy đủ heading, trích dẫn, bảng biểu, danh sách và hình ảnh minh họa chất lượng cao.
- **Tùy biến giao diện đọc (Reader Toolbar)**:
  - Chuyển đổi giao diện màu: Sáng (Light), Tối (Dark), Giấy cũ (Sepia), Bảo vệ mắt (Eye-care).
  - Tùy chỉnh phông chữ: Sans-serif (Mặc định), Serif (Cổ điển), Monospace.
  - Tăng/giảm kích thước phông chữ và khoảng cách dòng (Line height).
  - Thanh tiến độ đọc sách theo phần trăm cuộn trang trực quan.
- **Mục lục thông minh (Table of Contents)**: Điều hướng nhanh giữa các chương sách với thanh trượt bên cạnh.
- **Lưu lịch sử & Tiến độ**: Tự động lưu chương đang đọc và vị trí tiến độ đọc vào bộ nhớ trình duyệt (`LocalStorage`).

### 🎧 Trình Phát Sách Nói & Audio Thực Hành (Audio Player)
- **Floating Audio Bar**: Thanh phát âm thanh thu nhỏ cố định ở cạnh dưới màn hình, tiếp tục phát khi chuyển trang.
- **Audio Modal chuyên sâu**: Giao diện phát nhạc toàn màn hình với hiệu ứng trực quan, đầy đủ nút điều khiển (Play/Pause, tua 10s, chuyển bài, thanh timeline).
- **Hẹn giờ tắt (Sleep Timer)**: Tự động dừng phát sau 5, 10, 15, 30, 45, 60 phút hoặc kết thúc bài hiện tại.
- **Theo dõi tiến độ nghe**: Tự động ghi nhớ thời gian đã phát và đánh dấu các bài đã hoàn thành.

### ⚡ Hệ Thống Tự Động Quét Dữ Liệu (Auto Scanner)
- Tự động phát hiện các thư mục sách trong dự án.
- Tự động bóc tách tiêu đề chương mục từ file Markdown, ước tính số từ và thời lượng đọc.
- Tự động bóc tách danh sách bài audio và tạo manifest JSON (`src/data/books-manifest.json`).

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Markdown Rendering**: `react-markdown`, `remark-gfm`
- **Icons & Effects**: `lucide-react`, `canvas-confetti`
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/) / Wrangler CLI

---

## 📁 Cấu Trúc Thư Mục

```text
clbsach/
├── 7ThoiQuenHieuQua/         # Thư mục dữ liệu sách: 7 Thói Quen Của Người Thành Đạt
├── DoiNganDungNguDai/        # Thư mục dữ liệu sách: Đời Ngắn Đừng Ngủ Dài
├── DungBaoGioDiAnMotMinh/    # Thư mục dữ liệu sách: Đừng Bao Giờ Đi Ăn Một Mình
├── SearchInsideYourSelf/     # Dữ liệu sách & audio: Search Inside Yourself
│   ├── 00_Loi_gioi_thieu.md
│   ├── 01_Chuong_1.md
│   ├── ...
│   ├── audio/                # Các bài hướng dẫn audio thiền / thực hành (.mp3)
│   └── images/               # Hình ảnh minh họa & ảnh bìa
├── SucManhCuaThoiQuen/       # Thư mục dữ liệu sách: Sức Mạnh Của Thói Quen
├── ThinhVuongTaiChinhTuoi30_T1/ # Thư mục dữ liệu sách: Thịnh Vượng Tài Chính Tuổi 30 (Tập 1)
├── ThinhVuongTaiChinhTuoi30_T2/ # Thư mục dữ liệu sách: Thịnh Vượng Tài Chính Tuổi 30 (Tập 2)
├── ThinkAgain/               # Thư mục dữ liệu sách: Dám Nghĩ Lại
├── ViTuSiBanChiecFerrari/    # Thư mục dữ liệu sách: Vị Tu Sĩ Bán Chiếc Ferrari
├── public/                   # Tài nguyên tĩnh & Symlinks sách cho runtime
│   ├── _redirects            # Cấu hình định tuyến SPA cho Cloudflare Pages
│   └── favicon.svg
├── scripts/
│   └── scan-books.mjs        # Script Node.js quét sách & tạo manifest
├── src/
│   ├── components/           # Các component React (Audio, Reader, Layout, Home)
│   ├── context/              # React Contexts (Audio, ReaderSettings, History)
│   ├── data/                 # Manifest dữ liệu sách tự động sinh
│   ├── pages/                # Các trang chính (Home, BookDetail, Reader, History, About)
│   └── types/                # Định nghĩa TypeScript
├── deploy_cloudflare.sh      # Script tự động tối ưu & deploy lên Cloudflare Pages
├── run.sh                    # Script chạy nhanh ứng dụng ở chế độ dev
└── package.json
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Yêu cầu môi trường
- **Node.js**: Phiên bản 18+ hoặc mới hơn
- **npm** / **pnpm** / **yarn**

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Quét dữ liệu sách & Khởi chạy Dev Server
Chạy lệnh khởi động nhanh:
```bash
./run.sh
```
Hoặc qua npm scripts:
```bash
# Quét danh mục sách và tạo file manifest
npm run scan

# Chạy development server
npm run dev
```
Mở trình duyệt tại: `http://localhost:5173`

---

## 📦 Build & Triển Khai (Deployment)

### Triển khai tự động lên Cloudflare Pages
Dự án đã tích hợp sẵn script [deploy_cloudflare.sh](deploy_cloudflare.sh) giúp tự động dọn dẹp các tệp tin không dùng cho web runtime, build tối ưu và đẩy lên Cloudflare Pages:

```bash
chmod +x deploy_cloudflare.sh
./deploy_cloudflare.sh
```

Hoặc build thủ công:
```bash
npm run build
```
Thư mục xuất bản sẵn sàng triển khai nằm trong thư mục `dist/`.

---

## 📝 Thêm Sách Mới

Để thêm một cuốn sách mới vào hệ thống:
1. Tạo một thư mục mới tại thư mục gốc của dự án (ví dụ: `TenCuonSachMoi`).
2. Thêm các chương sách dưới dạng file Markdown (`01_Chuong_1.md`, `02_Chuong_2.md`, ...).
3. (Tùy chọn) Thêm ảnh bìa tại `TenCuonSachMoi/images/cover.jpg` và các file audio tại `TenCuonSachMoi/audio/`.
4. Khai báo thông tin mô tả sách trong file [scripts/scan-books.mjs](scripts/scan-books.mjs).
5. Chạy `npm run scan` để cập nhật danh mục.

---

## 📄 Bản Quyền & Giấy Phép

Dự án được xây dựng phục vụ mục đích phi thương mại, học tập, chia sẻ tri thức và thúc đẩy văn hóa đọc nội bộ.
