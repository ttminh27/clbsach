import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicBooksDir = path.resolve(rootDir, 'public', 'books');
const manifestPath = path.resolve(rootDir, 'src', 'data', 'books-manifest.json');

const placeholderMetadata = {
  "7ThoiQuenHieuQua": {
    title: "7 Thói Quen Để Thành Đạt",
    originalTitle: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    authorBio: "Chuyên gia hàng đầu thế giới về đào tạo kỹ năng lãnh đạo và quản trị bản thân, tác giả có tầm ảnh hưởng sâu rộng.",
    quote: "Gieo suy nghĩ, gặt hành động; gieo hành động, gặt thói quen; gieo thói quen, gặt tính cách; gieo tính cách, gặt số phận.",
    translator: "Vũ Tiến Phúc - PACE",
    category: "Kỹ năng lãnh đạo & Phát triển bản thân",
    tags: ["Thói quen", "Lãnh đạo", "Hiệu suất", "Tư duy", "Phát triển bản thân"],
    description: "Một trong những cuốn sách kinh điển nhất mọi thời đại về kỹ năng quản trị bản thân, xây dựng mối quan hệ tin cậy và đạt được thành công bền vững.",
    gradient: "from-amber-600 to-orange-700",
    themeColor: "#ea580c",
    status: "available"
  },
  "DoiNganDungNguDai": {
    title: "Đời Ngắn Đừng Ngủ Dài",
    originalTitle: "The Greatness Guide",
    author: "Robin Sharma",
    authorBio: "Chuyên gia phát triển tiềm năng con người và kỹ năng lãnh đạo hàng đầu thế giới.",
    quote: "Cuộc đời quá ngắn ngủi để sống một cuộc đời nhỏ bé. Hãy sống sao cho khi nhắm mắt xuôi tay, bạn mỉm cười và cả thế giới tiếc thương bạn.",
    translator: "Phạm Anh Tuấn",
    category: "Truyền cảm hứng & Lối sống",
    tags: ["Sống tích cực", "Động lực", "Lối sống", "Hành động"],
    description: "Những bài học ngắn gọn, súc tích và sâu sắc đánh thức tiềm năng to lớn bên trong bạn, giúp bạn sống một cuộc đời phi thường và đầy ý nghĩa.",
    gradient: "from-blue-600 to-indigo-800",
    themeColor: "#4f46e5",
    status: "available"
  },
  "DungBaoGioDiAnMotMinh": {
    title: "Đừng Bao Giờ Đi Ăn Một Mình",
    originalTitle: "Never Eat Alone",
    author: "Keith Ferrazzi & Tahl Raz",
    authorBio: "Doanh nhân, diễn giả và bậc thầy về nghệ thuật kết nối mạng lưới quan hệ.",
    quote: "Số phận của bạn không do tài năng quyết định bằng những mối quan hệ mà bạn tạo dựng được dựa trên lòng chân thành và hào phóng.",
    translator: "Trần Thị Ngân Tuyến",
    category: "Giao tiếp & Mạng lưới quan hệ",
    tags: ["Networking", "Giao tiếp", "Quan hệ", "Hợp tác", "Thành công"],
    description: "Bí quyết kết nối mạng lưới quan hệ đỉnh cao, xây dựng sự gắn kết chân thành và cùng nhau phát triển dựa trên lòng hào phóng.",
    gradient: "from-emerald-600 to-teal-800",
    themeColor: "#0d9488",
    status: "available"
  },
  "SucManhCuaThoiQuen": {
    title: "Sức Mạnh Của Thói Quen",
    originalTitle: "The Power of Habit",
    author: "Charles Duhigg",
    authorBio: "Nhà báo điều tra từng đoạt giải Pulitzer của The New York Times.",
    quote: "Sự thay đổi có thể không nhanh chóng và không phải lúc nào cũng dễ dàng. Nhưng với thời gian và nỗ lực, hầu như bất kỳ thói quen nào cũng có thể được định hình lại.",
    translator: "Lê Thảo",
    category: "Tâm lý học hành vi",
    tags: ["Thói quen", "Tâm lý học", "Kỷ luật", "Bộ não"],
    description: "Khám phá khoa học đằng sau cách hình thành thói quen và chìa khóa để thay đổi hành vi cá nhân, tổ chức cũng như toàn xã hội.",
    gradient: "from-purple-600 to-fuchsia-800",
    themeColor: "#9333ea",
    status: "available"
  },
  "DamNghiLai": {
    title: "Dám Nghĩ Lại",
    originalTitle: "Think Again - The Power of Knowing What You Don’t Know",
    author: "Adam Grant",
    authorBio: "Giáo sư tâm lý học tổ chức hàng đầu tại Wharton và tác giả nhiều cuốn sách bán chạy thế giới.",
    quote: "Nếu kiến thức là sức mạnh, thì việc biết những gì ta không biết chính là sự thông thái.",
    translator: "Vũ Hoàng Linh",
    category: "Tư duy phản biện & Đổi mới nhận thức",
    tags: ["Tư duy", "Tái tư duy", "Tâm lý học", "Phát triển bản thân", "Đổi mới"],
    description: "Nghệ thuật của việc biết những gì bạn chưa biết và sức mạnh của việc sẵn sàng thay đổi suy nghĩ để không ngừng tiến bộ trong một thế giới liên tục biến đổi.",
    gradient: "from-cyan-600 to-blue-700",
    themeColor: "#0284c7",
    status: "available"
  },
  "ThinkAgain": {
    title: "Dám Nghĩ Lại",
    originalTitle: "Think Again",
    author: "Adam Grant",
    authorBio: "Giáo sư tâm lý học tổ chức hàng đầu tại Wharton và tác giả nhiều cuốn sách bán chạy thế giới.",
    quote: "Nếu kiến thức là sức mạnh, thì việc biết những gì ta không biết chính là sự thông thái.",
    translator: "Vũ Hoàng Linh",
    category: "Tư duy phản biện",
    tags: ["Tư duy", "Đổi mới", "Tâm lý", "Học hỏi"],
    description: "Nghệ thuật của việc biết những gì bạn chưa biết và sức mạnh của việc sẵn sàng thay đổi suy nghĩ để không ngừng tiến bộ trong thế giới biến đổi.",
    gradient: "from-cyan-600 to-blue-700",
    themeColor: "#0284c7",
    status: "available"
  },
  "ViTuSiBanChiecFerrari": {
    title: "Vị Tu Sĩ Bán Chiếc Ferrari",
    originalTitle: "The Monk Who Sold His Ferrari",
    author: "Robin Sharma",
    authorBio: "Luật sư và chuyên gia đào tạo lãnh đạo, tác giả của bộ sách truyền cảm hứng nổi tiếng thế giới.",
    quote: "Ranh giới duy nhất cho tương lai của bạn là những hoài nghi mà bạn đặt ra hôm nay. Đầu tư vào bản thân là khoản đầu tư tốt nhất.",
    translator: "Thanh Thảo",
    category: "Triết lý sống & Tỉnh thức",
    tags: ["Bình an", "Tâm hồn", "Tỉnh thức", "Lý tưởng sống", "7 nguyên tắc"],
    description: "Câu chuyện ngụ ngôn sâu sắc về hành trình tìm kiếm hạnh phúc đích thực, bình an nội tâm và 7 nguyên tắc vàng để làm chủ cuộc sống của một luật sư triệu phú.",
    gradient: "from-rose-600 to-red-800",
    themeColor: "#e11d48",
    status: "available"
  },
  "SearchInsideYourSelf": {
    title: "Search Inside Yourself (Tìm Kiếm Bên Trong Bạn)",
    originalTitle: "Search Inside Yourself: The Unexpected Path to Achieving Success, Happiness (and World Peace)",
    author: "Chade-Meng Tan",
    authorBio: "Kỹ sư Jolly Good Fellow kỳ cựu của Google và là người sáng lập phong trào Search Inside Yourself.",
    quote: "Cuốn sách này và khóa học tại Google đại diện cho một trong những khía cạnh tuyệt vời nhất của văn hóa doanh nghiệp hiện đại: sự kết hợp hoàn hảo giữa khoa học não bộ, tâm lý học và thiền chánh niệm.",
    translator: "Kiều Anh Tú",
    category: "Trí tuệ cảm xúc & Thiền chánh niệm",
    tags: ["Trí tuệ cảm xúc", "Thiền & Tỉnh thức", "Google", "Phát triển bản thân", "Khoa học"],
    description: "Chương trình đào tạo Trí thông minh cảm xúc (EQ) và Thiền chánh niệm nổi tiếng tại Google, giúp tăng cường hiệu suất làm việc, khả năng lãnh đạo và nuôi dưỡng hạnh phúc nội tâm.",
    gradient: "from-teal-500 to-emerald-700",
    themeColor: "#059669",
    status: "available"
  },
  "ThinhVuongTaiChinhTuoi30_T1": {
    title: "Thịnh Vượng Tài Chính Tuổi 30 - Tập 1",
    originalTitle: "30대 재테크, 상식사전 (Rich 30s - Vol 1)",
    author: "Choi Pyong Hee, Go Deuk Seong, Jeong Seong Jin",
    authorBio: "Các chuyên gia hoạch định tài chính và quản lý tài sản hàng đầu Hàn Quốc.",
    quote: "Tuổi 30 là thời điểm mang tính bước ngoặt. Những quyết định tài chính hôm nay sẽ quyết định sự thịnh vượng hay bấp bênh của bạn trong 30 năm tuổi già.",
    translator: "Nguyễn Mạnh Hùng & Thái Hà Books",
    category: "Tài chính cá nhân & Quản lý dòng tiền",
    tags: ["Tài chính cá nhân", "Quản lý tài chính", "Hưu trí", "Đầu tư", "Kế hoạch tuổi 30"],
    description: "Cẩm nang tài chính thiết thực giúp người trẻ tuổi 30 thức tỉnh tư duy tiền bạc, lập kế hoạch chi tiêu, tích lũy và chủ động xây dựng nền tảng vững chắc cho 30 năm tuổi già thịnh vượng.",
    gradient: "from-emerald-700 to-teal-900",
    themeColor: "#0f766e",
    status: "available"
  },
  "ThinhVuongTaiChinhTuoi30_T2": {
    title: "Thịnh Vượng Tài Chính Tuổi 30 - Tập 2",
    originalTitle: "30대 재테크, 상식사전 (Rich 30s - Vol 2)",
    author: "Choi Pyong Hee, Go Deuk Seong, Jeong Seong Jin",
    authorBio: "Các chuyên gia hoạch định tài chính và quản lý tài sản hàng đầu Hàn Quốc.",
    quote: "Đầu tư thông minh không phải là tìm kiếm lợi nhuận viển vông trong ngắn hạn, mà là xây dựng danh mục tài sản vững chắc và quản trị rủi ro bền vững.",
    translator: "Thái Hà Books",
    category: "Tài chính cá nhân & Đầu tư",
    tags: ["Tài chính cá nhân", "Đầu tư", "Quản lý dòng tiền", "Tài sản", "Bảo hiểm"],
    description: "Phần tiếp theo chuyên sâu về các chiến lược gia tăng tài sản, phân bổ danh mục đầu tư thông minh và phòng ngừa rủi ro tài chính hiệu quả.",
    gradient: "from-blue-700 to-teal-900",
    themeColor: "#0369a1",
    status: "available"
  },
  "DacNhanTam": {
    title: "Đắc Nhân Tâm",
    originalTitle: "How to Win Friends and Influence People",
    author: "Dale Carnegie",
    authorBio: "Bậc thầy về nghệ thuật giao tiếp, thuyết phục và người sáng lập tổ chức Dale Carnegie Training.",
    quote: "Bạn có thể kết bạn nhiều hơn trong hai tháng bằng cách thực sự quan tâm đến người khác, hơn là trong hai năm cố gắng làm cho người khác quan tâm đến bạn.",
    translator: "First News - Trí Việt",
    category: "Nghệ thuật giao tiếp & Phát triển bản thân",
    tags: ["Đắc nhân tâm", "Giao tiếp", "Thu phục lòng người", "Ứng xử", "Lãnh đạo", "Thành công", "Tâm lý học"],
    description: "Tác phẩm kinh điển nhất mọi thời đại về nghệ thuật đối nhân xử thế, thu phục lòng người và xây dựng các mối quan hệ bền vững, chân thành của Dale Carnegie.",
    gradient: "from-amber-600 to-red-700",
    themeColor: "#c2410c",
    status: "available"
  },
  "LamRaLamChoiRaChoi": {
    title: "Làm Ra Làm, Chơi Ra Chơi",
    originalTitle: "Deep Work: Rules for Focused Success in a Distracted World",
    author: "Cal Newport",
    authorBio: "Giáo sư khoa học máy tính tại Đại học Georgetown và tác giả của phương pháp Deep Work nổi tiếng.",
    quote: "Nếu bạn không tạo ra những giá trị hiếm có và hữu ích, bạn sẽ khó thành công; và để tạo ra giá trị đó, bạn bắt buộc phải có khả năng làm việc sâu không xao nhãng.",
    translator: "Mai Anh",
    category: "Kỹ năng làm việc & Năng suất cá nhân",
    tags: ["Deep Work", "Tập trung", "Năng suất", "Kỷ luật", "Phát triển bản thân", "Quản lý thời gian"],
    description: "Tác phẩm kinh điển của Cal Newport về nghệ thuật 'Làm việc sâu' (Deep Work) – khả năng tập trung tột độ không xao nhãng trong một thế giới đầy phân tâm, giúp bạn làm chủ các kỹ năng phức tạp và tạo ra kết quả đột phá.",
    gradient: "from-amber-600 to-stone-900",
    themeColor: "#d97706",
    status: "available"
  },
  "DieuYNghiaNhat": {
    title: "The ONE Thing – Điều Ý Nghĩa Nhất Trong Từng Khoảnh Khắc Cuộc Đời",
    originalTitle: "The ONE Thing: The Surprisingly Simple Truth Behind Extraordinary Results",
    author: "Gary Keller & Jay Papasan",
    authorBio: "Gary Keller là nhà đồng sáng lập và Chủ tịch HĐQT của Keller Williams Realty - một trong những công ty bất động sản lớn nhất thế giới. Jay Papasan là Phó chủ tịch điều hành tại KellerINK và cựu biên tập viên cấp cao tại HarperCollins.",
    quote: "Nếu săn hai con thỏ cùng lúc, bạn sẽ chẳng bắt được con nào.",
    translator: "Tuấn Trương",
    category: "Hiệu suất & Phát triển bản thân",
    tags: ["The One Thing", "Tập trung", "Năng suất", "Hiệu suất", "Phát triển bản thân", "Quản lý thời gian"],
    description: "Khám phá chân lý đơn giản đến bất ngờ đằng sau những kết quả phi thường: bí quyết loại bỏ xao nhãng, giải phóng tiềm năng và làm chủ điều quan trọng nhất trong từng khoảnh khắc cuộc đời.",
    gradient: "from-blue-600 via-indigo-700 to-slate-900",
    themeColor: "#2563eb",
    status: "available"
  },
  "ThayDoiTiHonHieuQuaBatNgo": {
    title: "Thay Đổi Tí Hon, Hiệu Quả Bất Ngờ",
    originalTitle: "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    author: "James Clear",
    authorBio: "Chuyên gia hàng đầu thế giới về thói quen và sự cải thiện bản thân liên tục, diễn giả danh tiếng và tác giả cuốn sách bán chạy số 1 theo New York Times.",
    quote: "Thành công là sản phẩm của các thói quen hằng ngày – không phải của một cuộc biến hình một-lần-trong-đời.",
    translator: "Vũ Phi Yên - Trần Quỳnh Như",
    category: "Tâm lý học hành vi & Phát triển bản thân",
    tags: ["Atomic Habits", "Thói quen", "Kỷ luật", "Năng suất", "Phát triển bản thân", "Tâm lý học"],
    description: "Cuốn sách kinh điển và thực tế bậc nhất về nghệ thuật xây dựng thói quen tốt và loại bỏ thói quen xấu thông qua 4 nguyên tắc cốt lõi: Rõ ràng, Hấp dẫn, Dễ dàng và Tạo cảm giác thỏa mãn.",
    gradient: "from-amber-500 via-orange-600 to-red-700",
    themeColor: "#ea580c",
    status: "available"
  },
  "ChienThangConQuyTrongBan": {
    title: "Chiến Thắng Con Quỷ Trong Bạn",
    originalTitle: "Outwitting the Devil: The Secret to Freedom and Success",
    author: "Napoleon Hill",
    authorBio: "Tác giả của cuốn sách kinh điển 'Think and Grow Rich' (13 nguyên tắc nghĩ giàu, làm giàu), nhà triết học về thành công cá nhân hàng đầu nước Mỹ và thế giới.",
    quote: "Nỗi sợ hãi là công cụ của quỷ dữ do con người tạo ra. Tự tin vào chính bản thân mình vừa là vũ khí giúp con người đánh bại quỷ dữ vừa là công cụ để con người tạo dựng nên một cuộc sống huy hoàng.",
    translator: "Thanh Minh",
    category: "Tâm lý học thành công & Khai phóng tiềm năng",
    tags: ["Napoleon Hill", "Tư duy tích cực", "Vượt qua nỗi sợ", "Nhịp điệu thôi miên", "Kỷ luật tự giác", "Thành công"],
    description: "Kiệt tác bị giấu kín suốt 72 năm của Napoleon Hill, vén màn cuộc đối thoại kỳ lạ với Con Quỷ để bóc trần cách nỗi sợ hãi, sự buông thả và nhịp điệu thôi miên giam cầm 98% nhân loại, trao cho bạn chiếc chìa khóa để giành lại quyền làm chủ tâm trí.",
    gradient: "from-rose-900 via-stone-900 to-amber-950",
    themeColor: "#991b1b",
    status: "available"
  },
  "NgheThuatSong": {
    title: "Nghệ Thuật Sống",
    originalTitle: "The Art of Living: Vipassana Meditation as taught by S. N. Goenka",
    author: "William Hart & S. N. Goenka",
    authorBio: "William Hart là thiền sư phụ tá lâu năm của Thiền sư S. N. Goenka. Thiền sư S. N. Goenka (1924–2013) là bậc thầy thiền định Vipassana lỗi lạc người Ấn Độ, người đã có công truyền bá phương pháp thiền Vipassana thực nghiệm không giáo điều ra khắp thế giới.",
    quote: "Sống trong hiện tại, hòa hợp với chính mình và hòa hợp với vạn vật xung quanh – đó chính là Nghệ Thuật Sống.",
    translator: "United Buddhist Publisher",
    category: "Tâm lý học & Thiền chánh niệm",
    tags: ["Vipassana", "Thiền định", "Chánh niệm", "Tâm thức", "Bình an nội tâm", "Nghệ thuật sống", "Phật giáo"],
    description: "Tác phẩm kinh điển trình bày toàn diện, hệ thống và chuẩn xác về phương pháp hành thiền Vipassana theo sự giảng dạy của Thiền sư S. N. Goenka, giúp con người thanh lọc tâm, giải thoát khổ đau và tìm thấy sự bình an, hòa hợp đích thực ngay trong đời sống hiện tại.",
    gradient: "from-emerald-800 via-teal-900 to-stone-900",
    themeColor: "#15803d",
    status: "available"
  }
};

// Ensure public/books exists
if (!fs.existsSync(publicBooksDir)) {
  fs.mkdirSync(publicBooksDir, { recursive: true });
} else {
  // Clean up broken or stale symlinks in public/books
  const existingPublicEntries = fs.readdirSync(publicBooksDir);
  for (const entry of existingPublicEntries) {
    const entryPath = path.resolve(publicBooksDir, entry);
    try {
      const stat = fs.statSync(entryPath);
    } catch (err) {
      // Broken symlink
      try {
        fs.unlinkSync(entryPath);
        console.log(`Removed broken symlink: public/books/${entry}`);
      } catch {}
    }
  }
}

// Find all book directories
const bookSourceDir = fs.existsSync(path.resolve(rootDir, 'book'))
  ? path.resolve(rootDir, 'book')
  : rootDir;

const entries = fs.readdirSync(bookSourceDir, { withFileTypes: true });
const bookDirs = entries
  .filter(e => e.isDirectory() && !e.name.startsWith('.') && !['node_modules', 'public', 'src', 'scripts', 'dist', 'functions', 'book'].includes(e.name))
  .map(e => e.name);

console.log(`Found ${bookDirs.length} potential book folders:`, bookDirs);

const books = [];

for (const bookId of bookDirs) {
  const bookPath = path.resolve(bookSourceDir, bookId);
  const targetPublicPath = path.resolve(publicBooksDir, bookId);

  // Create symlink in public/books/ if not exists
  if (!fs.existsSync(targetPublicPath)) {
    try {
      const relTarget = path.relative(publicBooksDir, bookPath);
      fs.symlinkSync(relTarget, targetPublicPath, 'junction');
      console.log(`Linked ${bookId} to public/books/${bookId}`);
    } catch (err) {
      console.warn(`Could not create symlink for ${bookId}:`, err.message);
    }
  }

  const meta = placeholderMetadata[bookId] || {
    title: bookId,
    author: "Tác giả đang cập nhật",
    description: "Nội dung cuốn sách đang được chuẩn bị và sẽ sớm ra mắt.",
    category: "Sách hay",
    tags: ["Sách"],
    gradient: "from-slate-600 to-gray-800",
    themeColor: "#475569",
    status: "coming_soon"
  };

  const files = fs.readdirSync(bookPath);
  let mdFiles = files.filter(f => f.endsWith('.md') && !['readme.md', 'muc_luc.md'].includes(f.toLowerCase()));
  let coverUrl = null;
  const explicitCovers = [
    'cover.jpg', 'cover.png', 'cover.jpeg', 'cover.webp',
    'cover.PNG', 'cover.JPG',
    'bia_truoc.png', 'bia_truoc.jpg', 'cover_front.png', 'cover_front.jpg',
    'bia.png', 'bia.jpg'
  ];
  for (const c of explicitCovers) {
    if (fs.existsSync(path.resolve(bookPath, 'images', c))) {
      coverUrl = `/books/${bookId}/images/${c}`;
      break;
    }
    if (fs.existsSync(path.resolve(bookPath, c))) {
      coverUrl = `/books/${bookId}/${c}`;
      break;
    }
  }

  const readmePath = path.resolve(bookPath, 'README.md');
  if (!coverUrl && fs.existsSync(readmePath)) {
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    const coverMatch = readmeContent.match(/!\[.*?\]\((images\/[^)]+)\)/i) || readmeContent.match(/!\[.*?\]\(([^)]+\.(?:jpe?g|png|webp))\)/i);
    if (coverMatch && fs.existsSync(path.resolve(bookPath, coverMatch[1]))) {
      coverUrl = `/books/${bookId}/${coverMatch[1]}`;
    }
  }

  if (!coverUrl) {
    const fallbackCandidates = [
      'img_p001_xref7.jpeg', 'p1_Im0.jpg', 'img_p001_01.jpeg', 'img-000.png',
      'image_001_4.jpeg', 'page_001_1.jpeg', 'page_1_img_1.jpeg'
    ];
    for (const c of fallbackCandidates) {
      if (fs.existsSync(path.resolve(bookPath, 'images', c))) {
        coverUrl = `/books/${bookId}/images/${c}`;
        break;
      }
    }
  }

  const audioDir = path.resolve(bookPath, 'audio');
  const audioFiles = fs.existsSync(audioDir) ? fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3') || f.endsWith('.m4a') || f.endsWith('.wav')) : [];

  // Check if README.md has TOC ordering
  let orderedMdFiles = [];
  const tocTitles = {};
  if (fs.existsSync(readmePath)) {
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    const tocMatches = [...readmeContent.matchAll(/\[([^\]]+)\]\(([^)]+\.md)\)/g)];
    if (tocMatches.length > 0) {
      const parsed = [];
      for (const m of tocMatches) {
        const titleText = m[1].trim();
        const file = m[2].trim();
        if (mdFiles.includes(file) && !parsed.includes(file)) {
          parsed.push(file);
          if (titleText && !titleText.endsWith('.md')) {
            tocTitles[file] = titleText;
          }
        }
      }
      orderedMdFiles = parsed;
    }
  }

  // Include any remaining md files not in README
  for (const f of mdFiles) {
    if (!orderedMdFiles.includes(f)) {
      orderedMdFiles.push(f);
    }
  }
  if (orderedMdFiles.length === 0) {
    orderedMdFiles = mdFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }

  // Parse Chapters
  const chapters = [];
  for (let i = 0; i < orderedMdFiles.length; i++) {
    const fileName = orderedMdFiles[i];
    const filePath = path.resolve(bookPath, fileName);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract all H1 matches
    const h1Matches = [...content.matchAll(/^#\s+(.+)$/gm)].map(m => m[1].trim());
    let title = tocTitles[fileName] || fileName.replace('.md', '').replace(/^[0-9]+_/, '').replace(/_/g, ' ');
    
    if (!tocTitles[fileName] && h1Matches.length > 0) {
      // If there are multiple H1s (e.g. # Phần một and # 1. Vòng lặp), prefer the chapter one
      const chapterH1 = h1Matches.find(h => !/^phần\s+(một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười|[0-9ivx]+)\b/i.test(h));
      title = chapterH1 || h1Matches[0];
    }

    // Extract subtitle if exists in header area
    const headerLines = content.split('\n').slice(0, 15).join('\n');
    const matchH3 = headerLines.match(/^###\s+(.+)$/m);
    const rawSubtitle = matchH3 ? matchH3[1].replace(/^\*+|\*+$/g, '').trim() : undefined;
    const subtitle = (rawSubtitle && !/^(chú thích|ghi chú|tham khảo|footnotes?)$/i.test(rawSubtitle)) ? rawSubtitle : undefined;

    // Word count & reading time estimate (~200 words per min)
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

    // Check if Chapter has Quiz
    const chapterId = fileName.replace('.md', '');
    const quizFilePath = path.resolve(bookPath, 'quizzes', `${chapterId}.json`);
    let quizUrl = null;
    let totalQuestions = 0;
    let hasQuiz = false;

    if (fs.existsSync(quizFilePath)) {
      try {
        const quizData = JSON.parse(fs.readFileSync(quizFilePath, 'utf-8'));
        totalQuestions = Array.isArray(quizData.questions) ? quizData.questions.length : 0;
        quizUrl = `/books/${bookId}/quizzes/${chapterId}.json`;
        hasQuiz = totalQuestions > 0;
      } catch (err) {
        console.warn(`Error parsing quiz for ${bookId}/${chapterId}:`, err.message);
      }
    }

    chapters.push({
      id: chapterId,
      fileName: fileName,
      fileUrl: `/books/${bookId}/${fileName}`,
      quizUrl: quizUrl,
      totalQuestions: totalQuestions,
      hasQuiz: hasQuiz,
      order: i + 1,
      title: title,
      subtitle: subtitle,
      wordCount,
      readingTimeMin
    });
  }

  // Parse Audios
  const audios = [];
  audioFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  for (let i = 0; i < audioFiles.length; i++) {
    const fileName = audioFiles[i];
    const titleWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    
    // Parse nice title e.g. "Ngày 01 - Một hơi thở trọn vẹn"
    const parts = titleWithoutExt.split(/[-–—]/);
    const title = parts.length > 1 ? parts.slice(1).join(' - ').trim() : titleWithoutExt;
    const trackNumberStr = parts[0].replace(/[^0-9]/g, '');
    const trackNumber = trackNumberStr ? parseInt(trackNumberStr, 10) : i + 1;
    const prefix = parts.length > 1 ? parts[0].trim() : `Bài ${i + 1}`;

    audios.push({
      id: `${bookId}-audio-${i + 1}`,
      fileName,
      audioUrl: `/books/${bookId}/audio/${encodeURIComponent(fileName)}`,
      trackNumber,
      prefix,
      title: title || fileName,
      fullTitle: titleWithoutExt
    });
  }

  const isAvailable = chapters.length > 0 || audios.length > 0;
  const status = isAvailable ? "available" : meta.status;

  books.push({
    id: bookId,
    ...meta,
    status,
    coverUrl: coverUrl,
    totalChapters: chapters.length,
    totalAudios: audios.length,
    chapters,
    audios
  });
}

// Order: available books first, then by title
books.sort((a, b) => {
  if (a.status === 'available' && b.status !== 'available') return -1;
  if (a.status !== 'available' && b.status === 'available') return 1;
  return a.title.localeCompare(b.title, 'vi');
});

fs.writeFileSync(manifestPath, JSON.stringify(books, null, 2), 'utf-8');
console.log(`Generated books manifest successfully: ${books.length} books registered at ${manifestPath}`);

// ==============================================================================
// Generate sitemap.xml and robots.txt
// ==============================================================================
const siteUrl = process.env.SITE_URL || 'https://clbsach.pages.dev';
const currentDate = new Date().toISOString().split('T')[0];
const publicDir = path.resolve(rootDir, 'public');

const sitemapUrls = [
  { loc: `${siteUrl}/`, priority: '1.0', changefreq: 'daily' },
  { loc: `${siteUrl}/about`, priority: '0.8', changefreq: 'monthly' },
  { loc: `${siteUrl}/history`, priority: '0.6', changefreq: 'monthly' },
];

books.forEach((book) => {
  sitemapUrls.push({
    loc: `${siteUrl}/book/${book.id}`,
    priority: '0.9',
    changefreq: 'weekly',
  });

  book.chapters.forEach((chapter) => {
    sitemapUrls.push({
      loc: `${siteUrl}/reader/${book.id}/${chapter.id}`,
      priority: '0.8',
      changefreq: 'weekly',
    });

    if (chapter.hasQuiz || chapter.quizUrl) {
      sitemapUrls.push({
        loc: `${siteUrl}/quiz/${book.id}/${chapter.id}`,
        priority: '0.7',
        changefreq: 'monthly',
      });
    }
  });
});

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const sitemapPath = path.resolve(publicDir, 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemapXml, 'utf-8');
console.log(`Generated sitemap.xml successfully with ${sitemapUrls.length} URLs at ${sitemapPath}`);

const robotsTxt = `# ==============================================================================
# Robots.txt - CLB Đọc Sách
# ==============================================================================

User-agent: *
Allow: /

# Specific search engine crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Applebot
Allow: /

# Sitemap Reference
Sitemap: ${siteUrl}/sitemap.xml
Host: ${siteUrl}
`;
const robotsPath = path.resolve(publicDir, 'robots.txt');
fs.writeFileSync(robotsPath, robotsTxt, 'utf-8');
console.log(`Generated robots.txt successfully at ${robotsPath}`);


