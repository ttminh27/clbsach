import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Headphones,
  Sliders,
  Clock,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Search,
  Moon,
  Volume2,
  Award,
  Zap,
  BookmarkCheck,
  Timer,
  ArrowRight,
  ListOrdered,
} from 'lucide-react';

export const GuidePage: React.FC = () => {
  useEffect(() => {
    document.title = 'Hướng Dẫn Sử Dụng | CLB đọc sách';
  }, []);

  const guideSections = [
    {
      id: 'reader',
      title: '1. Đọc Sách & Tùy Chỉnh E-Reader',
      icon: BookOpen,
      color: 'emerald',
      bgLight: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      items: [
        {
          title: 'Chọn & Bắt đầu đọc sách',
          desc: 'Tại Trang Chủ hoặc menu bên trái, chọn bất kỳ cuốn sách nào bạn muốn đọc và nhấn "Bắt Đầu Đọc" để mở giao diện đọc toàn màn hình không xao nhãng.',
        },
        {
          title: 'Tùy chỉnh giao diện đọc (Cỡ chữ, Phông chữ, Màu nền)',
          desc: 'Khi đang trong giao diện đọc sách, thanh công cụ trên cùng cho phép bạn tăng/giảm cỡ chữ, chuyển đổi phông chữ (Serif / Sans-serif) và chọn 4 chủ đề màu sắc: Sáng (Light), Sepia (Giấy cổ điển dịu mắt), Tối (Dark), hoặc OLED (Đen sâu tiết kiệm pin).',
        },
        {
          title: 'Mục lục chương & Chuyển chương',
          desc: 'Sử dụng nút Mục lục ở góc trên hoặc thanh sidebar bên trái để xem toàn bộ các chương sách, thời gian đọc ước tính và số từ của từng chương. Ở cuối mỗi chương, bạn có thể nhấn nút "Chương tiếp theo" hoặc "Chương trước" để chuyển nhanh.',
        },
      ],
    },
    {
      id: 'audio',
      title: '2. Nghe Audio Sách & Bài Học Thực Hành',
      icon: Headphones,
      color: 'teal',
      bgLight: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
      items: [
        {
          title: 'Phát audio toàn cục (Floating Player)',
          desc: 'Bạn có thể chọn nghe các file audio đính kèm từng cuốn sách (ví dụ 28 bài tập thiền chánh niệm của sách Search Inside Yourself). Trình phát chạy ngầm liên tục ngay cả khi bạn chuyển trang hoặc duyệt nội dung khác.',
        },
        {
          title: 'Điều khiển trình phát & Tốc độ',
          desc: 'Hỗ trợ tua nhanh/lùi 10 giây, điều chỉnh tốc độ đọc (0.75x, 1x, 1.25x, 1.5x, 2x) và thanh trượt tiến độ phát chính xác.',
        },
        {
          title: 'Hẹn giờ tắt (Sleep Timer)',
          desc: 'Nhấn vào biểu tượng đồng hồ trên trình phát để hẹn giờ tắt sau 5, 10, 15, 30 hoặc 60 phút - rất lý tưởng khi nghe đọc sách hoặc thiền trước khi ngủ.',
        },
        {
          title: 'Giọng đọc tự động (Text-to-Speech)',
          desc: 'Khi đọc một chương sách, bạn có thể bật tính năng Đọc to (TTS) để hệ thống tự động đọc văn bản tiếng Việt cho bạn nghe với tùy chọn điều chỉnh tốc độ linh hoạt.',
        },
      ],
    },
    {
      id: 'quiz',
      title: '3. Ôn Tập Kiến Thức & Trắc Nghiệm (Quiz)',
      icon: Award,
      color: 'indigo',
      bgLight: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
      items: [
        {
          title: 'Làm bài kiểm tra sau mỗi chương',
          desc: 'Sau khi đọc xong chương sách, bạn có thể làm nhanh bài trắc nghiệm ngắn (3–5 câu) để củng cố các ý chính và bài học thực tiễn.',
        },
        {
          title: 'Nhận giải thích chi tiết',
          desc: 'Mỗi câu hỏi đều có phần giải thích đáp án rõ ràng và trích xuất điểm cốt lõi từ sách giúp bạn ghi nhớ kiến thức sâu sắc hơn.',
        },
      ],
    },
    {
      id: 'history',
      title: '4. Theo Dõi Tiến Độ & Lịch Sử Đọc',
      icon: Clock,
      color: 'amber',
      bgLight: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
      items: [
        {
          title: 'Tự động lưu vị trí đọc',
          desc: 'Ứng dụng tự động ghi nhớ chương sách bạn đang đọc dở và tỷ lệ hoàn thành cuốn sách trên thiết bị của bạn mà không cần phải đăng nhập tài khoản phức tạp.',
        },
        {
          title: 'Tiếp tục đọc với 1 chạm',
          desc: 'Ngay tại Trang Chủ và trang Lịch Sử, bạn có thể nhấn "Đọc tiếp" để quay lại chính xác chương bạn vừa dừng lại.',
        },
      ],
    },
  ];

  const shortcuts = [
    { key: 'Ctrl + K / ⌘ + K', action: 'Mở thanh tìm kiếm nhanh sách' },
    { key: 'Mũi tên Trái (←)', action: 'Chuyển về chương trước (khi đang đọc)' },
    { key: 'Mũi tên Phải (→)', action: 'Chuyển sang chương kế tiếp (khi đang đọc)' },
    { key: 'Phím Space (Cách)', action: 'Tạm dừng / Tiếp tục phát Audio' },
    { key: 'Shift + M', action: 'Đổi chế độ Sáng / Tối' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 p-8 sm:p-12 text-white shadow-xl shadow-emerald-950/10 mb-10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3">
            <HelpCircle className="h-3.5 w-3.5" />
            Cẩm Nang Hướng Dẫn
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Hướng Dẫn Sử Dụng CLB Đọc Sách
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed">
            Khám phá đầy đủ các tính năng hữu ích giúp tối ưu trải nghiệm đọc sách, luyện tập chánh niệm và lưu giữ kiến thức hiệu quả.
          </p>
        </div>
      </div>

      {/* Main Guide Sections */}
      <div className="space-y-8">
        {guideSections.map((section) => {
          const IconComp = section.icon;
          return (
            <section
              key={section.id}
              className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${section.bgLight}`}>
                  <IconComp className="h-5 w-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {section.title}
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-1">
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-xs font-bold mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Shortcuts Table */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                5. Phím Tắt Tiện Lợi (Keyboard Shortcuts)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Thao tác nhanh trên máy tính để đọc và nghe thuận tiện hơn
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-bold">Phím bấm</th>
                  <th className="py-3 px-4 font-bold">Chức năng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {shortcuts.map((sc, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                      <kbd className="rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-[11px] dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {sc.key}
                      </kbd>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {sc.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* CTA Box */}
      <div className="mt-12 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-6 sm:p-8 text-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Bạn đã sẵn sàng bước vào hành trình đọc sách?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-6">
          Khám phá trọn bộ sách tinh hoa phát triển bản thân, trí tuệ cảm xúc và chánh niệm ngay hôm nay.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all"
        >
          <BookOpen className="h-4 w-4" />
          Xem Danh Sách Sách Ngay
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
