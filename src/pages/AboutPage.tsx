import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Headphones,
  Sparkles,
  Layers,
  Smartphone,
  Sliders,
  Clock,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 p-8 sm:p-12 text-white shadow-xl shadow-emerald-950/10 mb-12">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Về Dự Án CLB đọc sách VietinBank
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Nơi Nuôi Dưỡng Trí Tuệ & Bình An Nội Tâm
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed">
            Nền tảng đọc sách điện tử và luyện tập chánh niệm trực tuyến, mang lại trải nghiệm đọc tập trung, tinh gọn và hoàn toàn miễn phí cho mọi người.
          </p>
        </div>
      </div>

      {/* Sứ mệnh & Tầm nhìn */}
      <div className="space-y-10">
        <section className="rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Mục Tiêu & Triết Lý
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            <strong>CLB đọc sách VietinBank</strong> được xây dựng nhằm tạo ra một không gian số tĩnh lặng, không bị làm phiền bởi quảng cáo hay các yếu tố gây xao nhãng. Tại đây, việc tiếp thu tri thức từ sách được kết hợp hài hòa với các bài tập thực hành thiền và audio chánh niệm.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Tác phẩm mở đầu của dự án là cuốn sách kinh điển <em>"Search Inside Yourself" (Tìm Kiếm Bên Trong Bạn)</em> của kỹ sư Google Chade-Meng Tan, đi kèm trọn bộ 28 bài hướng dẫn thiền thực hành mỗi ngày.
          </p>
        </section>

        {/* Các Tính Năng Nổi Bật */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Các Tính Năng Trọng Tâm
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mb-3">
                <Sliders className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Tùy Biến Chế Độ Đọc E-Reader
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Hỗ trợ 4 giao diện màu (Sáng, Tối, Sepia giấy cổ điển, OLED), phông chữ Serif chuyên dụng và điều chỉnh cỡ chữ linh hoạt.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 mb-3">
                <Headphones className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Trình Phát Audio Toàn Cục
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Nghe audio liên tục không ngắt quãng khi đổi chương, hỗ trợ chỉnh tốc độ 0.75x–2x, tua 10s và hẹn giờ tắt tự động.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-3">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Lưu Tiến Độ Đọc Tự Động
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ghi nhớ vị trí chương đang đọc dở và phần trăm hoàn thành trong LocalStorage, khôi phục ngay với 1 chạm từ trang chủ.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 mb-3">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Responsive Desktop & Mobile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Thiết kế tối ưu cho điện thoại, máy tính bảng và desktop với menu bên trái tiện dụng và thanh điều khiển cảm ứng mượt mà.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* CTA Button */}
      <div className="mt-12 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all"
        >
          <BookOpen className="h-4 w-4" />
          Bắt Đầu Khám Phá Thư Viện Sách
        </Link>
      </div>
    </div>
  );
};
