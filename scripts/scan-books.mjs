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
    title: "7 Thói Quen Của Người Thành Đạt",
    originalTitle: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    translator: "Nhiều dịch giả",
    category: "Kỹ năng lãnh đạo & Phát triển bản thân",
    tags: ["Thói quen", "Lãnh đạo", "Hiệu suất", "Tư duy"],
    description: "Một trong những cuốn sách kinh điển nhất mọi thời đại về kỹ năng quản trị bản thân, xây dựng mối quan hệ tin cậy và đạt được thành công bền vững.",
    gradient: "from-amber-600 to-orange-700",
    themeColor: "#ea580c",
    status: "coming_soon"
  },
  "DoiNganDungNguDai": {
    title: "Đời Ngắn Đừng Ngủ Dài",
    originalTitle: "The Greatness Guide",
    author: "Robin Sharma",
    translator: "Phạm Anh Tuấn",
    category: "Truyền cảm hứng & Lối sống",
    tags: ["Sống tích cực", "Động lực", "Lối sống", "Hành động"],
    description: "Những bài học ngắn gọn, súc tích và sâu sắc đánh thức tiềm năng to lớn bên trong bạn, giúp bạn sống một cuộc đời phi thường và đầy ý nghĩa.",
    gradient: "from-blue-600 to-indigo-800",
    themeColor: "#4f46e5",
    status: "coming_soon"
  },
  "DungBaoGioDiAnMotMinh": {
    title: "Đừng Bao Giờ Đi Ăn Một Mình",
    originalTitle: "Never Eat Alone",
    author: "Keith Ferrazzi",
    translator: "Trần Thị Ngân Xuyên",
    category: "Giao tiếp & Mạng lưới quan hệ",
    tags: ["Networking", "Giao tiếp", "Quan hệ", "Hợp tác"],
    description: "Bí quyết kết nối mạng lưới quan hệ đỉnh cao, xây dựng sự gắn kết chân thành và cùng nhau phát triển dựa trên lòng hào phóng.",
    gradient: "from-emerald-600 to-teal-800",
    themeColor: "#0d9488",
    status: "coming_soon"
  },
  "SucManhCuaThoiQuen": {
    title: "Sức Mạnh Của Thói Quen",
    originalTitle: "The Power of Habit",
    author: "Charles Duhigg",
    translator: "Lê Thảo",
    category: "Tâm lý học hành vi",
    tags: ["Thói quen", "Tâm lý học", "Kỷ luật", "Bộ não"],
    description: "Khám phá khoa học đằng sau cách hình thành thói quen và chìa khóa để thay đổi hành vi cá nhân, tổ chức cũng như toàn xã hội.",
    gradient: "from-purple-600 to-fuchsia-800",
    themeColor: "#9333ea",
    status: "coming_soon"
  },
  "ThinkAgain": {
    title: "Dám Nghĩ Lại",
    originalTitle: "Think Again",
    author: "Adam Grant",
    translator: "Vũ Hoàng Linh",
    category: "Tư duy phản biện",
    tags: ["Tư duy", "Đổi mới", "Tâm lý", "Học hỏi"],
    description: "Nghệ thuật của việc biết những gì bạn chưa biết và sức mạnh của việc sẵn sàng thay đổi suy nghĩ để không ngừng tiến bộ trong thế giới biến đổi.",
    gradient: "from-cyan-600 to-blue-700",
    themeColor: "#0284c7",
    status: "coming_soon"
  },
  "ViTuSiBanChiecFerrari": {
    title: "Vị Tu Sĩ Bán Chiếc Ferrari",
    originalTitle: "The Monk Who Sold His Ferrari",
    author: "Robin Sharma",
    translator: "Nguyễn Hải Vân",
    category: "Triết lý sống & Tỉnh thức",
    tags: ["Bình an", "Tâm hồn", "Tỉnh thức", "Lý tưởng"],
    description: "Câu chuyện ngụ ngôn sâu sắc về hành trình tìm kiếm hạnh phúc đích thực, bình an nội tâm và lý tưởng sống cao đẹp của một luật sư triệu phú.",
    gradient: "from-rose-600 to-red-800",
    themeColor: "#e11d48",
    status: "coming_soon"
  },
  "SearchInsideYourSelf": {
    title: "Search Inside Yourself (Tìm Kiếm Bên Trong Bạn)",
    originalTitle: "Search Inside Yourself: The Unexpected Path to Achieving Success, Happiness (and World Peace)",
    author: "Chade-Meng Tan",
    translator: "Kiều Anh Tú",
    category: "Trí tuệ cảm xúc & Thiền chánh niệm",
    tags: ["Trí tuệ cảm xúc", "Thiền & Tỉnh thức", "Google", "Phát triển bản thân", "Khoa học"],
    description: "Chương trình đào tạo Trí thông minh cảm xúc (EQ) và Thiền chánh niệm nổi tiếng tại Google, giúp tăng cường hiệu suất làm việc, khả năng lãnh đạo và nuôi dưỡng hạnh phúc nội tâm.",
    gradient: "from-teal-500 to-emerald-700",
    themeColor: "#059669",
    status: "available"
  }
};

// Ensure public/books exists
if (!fs.existsSync(publicBooksDir)) {
  fs.mkdirSync(publicBooksDir, { recursive: true });
}

// Find all book directories
const entries = fs.readdirSync(rootDir, { withFileTypes: true });
const bookDirs = entries
  .filter(e => e.isDirectory() && !e.name.startsWith('.') && !['node_modules', 'public', 'src', 'scripts', 'dist'].includes(e.name))
  .map(e => e.name);

console.log(`Found ${bookDirs.length} potential book folders:`, bookDirs);

const books = [];

for (const bookId of bookDirs) {
  const bookPath = path.resolve(rootDir, bookId);
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
  let mdFiles = files.filter(f => f.endsWith('.md') && f.toLowerCase() !== 'readme.md');
  let coverUrl = null;
  const coverCandidates = ['cover.jpg', 'cover.png', 'cover.jpeg', 'cover.webp', 'img_p001_01.jpeg', 'img-000.png'];
  for (const c of coverCandidates) {
    if (fs.existsSync(path.resolve(bookPath, 'images', c))) {
      coverUrl = `/books/${bookId}/images/${c}`;
      break;
    }
  }

  const audioDir = path.resolve(bookPath, 'audio');
  const audioFiles = fs.existsSync(audioDir) ? fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3') || f.endsWith('.m4a') || f.endsWith('.wav')) : [];

  // Check if README.md has TOC ordering
  const readmePath = path.resolve(bookPath, 'README.md');
  let orderedMdFiles = [];
  const tocTitles = {};
  if (fs.existsSync(readmePath)) {
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    const tocMatches = [...readmeContent.matchAll(/\[([^\]]+)\]\(([^)]+\.md)\)/g)];
    if (tocMatches.length > 0) {
      orderedMdFiles = tocMatches.map(m => {
        const titleText = m[1].trim();
        const file = m[2].trim();
        if (titleText && !titleText.endsWith('.md')) {
          tocTitles[file] = titleText;
        }
        return file;
      }).filter(f => mdFiles.includes(f));
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
    let title = fileName.replace('.md', '').replace(/^[0-9]+_/, '').replace(/_/g, ' ');
    
    if (h1Matches.length > 0) {
      // If there are multiple H1s (e.g. # Phần một and # 1. Vòng lặp), prefer the chapter one
      const chapterH1 = h1Matches.find(h => !/^phần\s+(một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười|[0-9ivx]+)\b/i.test(h));
      title = chapterH1 || h1Matches[0];
    }

    // Extract subtitle if exists
    const matchH3 = content.match(/^###\s+(.+)$/m);
    const subtitle = matchH3 ? matchH3[1].replace(/^\*+|\*+$/g, '').trim() : undefined;

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
