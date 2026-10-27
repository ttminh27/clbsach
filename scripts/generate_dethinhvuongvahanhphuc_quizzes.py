#!/usr/bin/env python3
"""
scripts/generate_dethinhvuongvahanhphuc_quizzes.py

Tạo bộ 15 câu hỏi trắc nghiệm (quiz) chất lượng cao, cân bằng độ dài và phân bố đáp án chuẩn (4, 4, 4, 3)
cho từng chương trong tác phẩm "Naval Ravikant – Để Thịnh Vượng Và Hạnh Phúc"
(The Almanack of Naval Ravikant: A Guide to Wealth and Happiness) do Eric Jorgenson biên soạn.
"""

import os
import re
import json
import random
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

API_KEY = os.environ.get('GEMINI_API_KEY')
if not API_KEY:
    raise ValueError("Missing GEMINI_API_KEY environment variable")

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK_DIR = os.path.join(ROOT_DIR, 'book', 'DeThinhVuongVaHanhPhuc')
QUIZZES_DIR = os.path.join(BOOK_DIR, 'quizzes')
os.makedirs(QUIZZES_DIR, exist_ok=True)

MANIFEST_PATH = os.path.join(ROOT_DIR, 'src', 'data', 'books-manifest.json')
with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
    manifest = json.load(f)

book_meta = next(b for b in manifest if b['id'] == 'DeThinhVuongVaHanhPhuc')
chapters = book_meta['chapters']

print(f"Loaded {len(chapters)} chapters for DeThinhVuongVaHanhPhuc.")

def is_quiz_valid(file_path):
    if not os.path.exists(file_path):
        return False
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        qs = data.get('questions', [])
        if len(qs) != 15:
            return False
        counts = {0: 0, 1: 0, 2: 0, 3: 0}
        for q in qs:
            opts = q.get('options', [])
            if len(opts) != 4:
                return False
            c = q.get('correctIndex')
            if not (isinstance(c, int) and 0 <= c <= 3):
                return False
            counts[c] += 1
            if not q.get('explanation'):
                return False
        if sorted(counts.values()) != [3, 4, 4, 4]:
            return False
        return True
    except Exception:
        return False

def balance_options_lengths(questions):
    filler_phrases = [
        " trong bối cảnh thực tế.",
        " theo nguyên lý cốt lõi.",
        " trong cuộc sống hàng ngày.",
        " một cách rõ ràng và bền vững.",
        " trên phương diện dài hạn.",
        " đối với bản thân và sự nghiệp.",
        " theo tư duy của Naval."
    ]

    for q in questions:
        opts = [o.rstrip('. ') for o in q['options']]
        lens = [len(o) for o in opts]
        max_l = max(lens)
        min_l = min(lens)

        if max_l - min_l > 16:
            for i in range(4):
                if len(opts[i]) < max_l - 12:
                    diff = max_l - len(opts[i])
                    suitable = [p for p in filler_phrases if len(p) <= diff + 6]
                    if suitable:
                        phrase = min(suitable, key=lambda p: abs(len(p) - diff))
                        opts[i] = opts[i] + phrase
        q['options'] = [o.strip() + "." for o in opts]

    # Cân bằng trường hợp phương án đúng luôn là dài nhất
    longest_indices = []
    for idx, q in enumerate(questions):
        lens = [len(o) for o in q['options']]
        c = q['correctIndex']
        if lens[c] == max(lens) and lens.count(max(lens)) == 1:
            longest_indices.append(idx)

    if len(longest_indices) > 4:
        to_modify = longest_indices[4:]
        for q_idx in to_modify:
            q = questions[q_idx]
            c = q['correctIndex']
            wrong_indices = [i for i in range(4) if i != c]
            target_w = random.choice(wrong_indices)
            w_text = q['options'][target_w].rstrip('.')
            correct_len = len(q['options'][c])
            extra_needed = (correct_len + 4) - len(w_text)
            if extra_needed > 0:
                short_fillers = [" một cách rõ ràng", " trên thực tế", " ở mức độ sâu sắc", " trong mọi hoàn cảnh"]
                filler = min(short_fillers, key=lambda f: abs(len(f) - extra_needed))
                q['options'][target_w] = w_text + filler + "."

    return questions

def generate_quiz_for_chapter(chapter, chap_num, total_chaps):
    chap_id = chapter['id']
    chap_title = chapter['title']
    target_file = os.path.join(QUIZZES_DIR, f"{chap_id}.json")

    # Mục lục / bìa không cần quiz
    if chap_id == '00_muc_luc' or 'mục lục' in chap_title.lower():
        print(f"[{chap_num}/{total_chaps}] [SKIP_TOC] {chap_id} is table of contents, skipping quiz.")
        return chap_id, True

    if is_quiz_valid(target_file):
        print(f"[{chap_num}/{total_chaps}] [SKIP] {chap_id} already has a valid quiz.")
        return chap_id, True

    md_path = os.path.join(BOOK_DIR, f"{chap_id}.md")
    if not os.path.exists(md_path):
        print(f"[{chap_num}/{total_chaps}] [ERR] File not found: {md_path}")
        return chap_id, False

    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    words = content.split()
    if len(words) > 16000:
        content_sample = " ".join(words[:10000]) + "\n\n[... phần giữa ...] \n\n" + " ".join(words[-6000:])
    else:
        content_sample = content

    prompt = f"""Bạn là một chuyên gia hàng đầu về đầu tư mạo hiểm, cố vấn khởi nghiệp và triết học nhân sinh, am tường sâu sắc các tư tưởng của Naval Ravikant cũng như cuốn sách kinh điển 'Để Thịnh Vượng Và Hạnh Phúc' (The Almanack of Naval Ravikant) do Eric Jorgenson biên soạn.
Hãy đọc kỹ nội dung chương sách sau đây:

Tiêu đề chương: {chap_title}
Nội dung chương:
\"\"\"
{content_sample}
\"\"\"

HÃY THIẾT KẾ ĐÚNG 15 CÂU HỎI TRẮC NGHIỆM ĐÒI HỎI SUY LUẬN, THẤU HIỂU BẢN CHẤT VÀ ỨNG DỤNG THỰC TẾ:
1. YÊU CẦU NỘI DUNG (TƯ DUY & BẢN CHẤT):
   - Đào sâu các tư tưởng và bài học cốt lõi của Naval Ravikant được trình bày trong chương:
     + Xây dựng thịnh vượng không cần may mắn: Kiến thức chuyên biệt (Specific Knowledge) độc bản không thể dạy theo trường lớp; Gánh vác trách nhiệm cá nhân (Accountability); Các loại đòn bẩy (Leverage: Lao động, Vốn, và Sản phẩm không tốn chi phí biên như Code & Media); Nắm giữ tài sản/cổ phần (Equity).
     + Kỹ năng phán đoán (Judgment): Tư duy từ nguyên lý đầu tiên (First Principles), hiểu bản chất thực tại, loại bỏ bản ngã để nhìn thấy sự thật, thu thập các mô hình tư duy (Mental Models), nghệ thuật đọc sách và tự học.
     + Học về Hạnh phúc: Hạnh phúc là một kỹ năng có thể học và lựa chọn; mong cầu là khế ước đau khổ với bản thân; bình an nội tâm, chánh niệm, hiện diện trọn vẹn ở hiện tại; thói quen xây dựng hạnh phúc; loại bỏ sự đố kỵ và so sánh xã hội.
     + Cứu rỗi bản thân & Triết lý sống: Chăm sóc sức khỏe, thiền định, Phật giáo duy lý, ý nghĩa cuộc đời, tự do tài chính và làm chủ thời gian.
     + Đối với các chương mở đầu, tiểu sử, phụ lục: Bám sát các sự kiện cuộc đời Naval (AngelList, đầu tư vào Uber/Twitter), bối cảnh dự án sách phi lợi nhuận của Eric Jorgenson và Ninety Eight, cùng các tác phẩm kinh điển mà Naval khuyến đọc (Sapiens, Poor Charlie's Almanack, Meditations, Skin in the Game...).
   - TUYỆT ĐỐI KHÔNG hỏi các chi tiết cơ học nhớ vẹt (như số trang sách, vị trí mục lục).
   - Đảm bảo câu hỏi có tính thực chiến cao, tình huống thực tế giúp người đọc phân biệt được tư duy thông thường và tư duy đột phá của Naval.

2. CÂN BẰNG ĐỘ DÀI CÁC PHƯƠNG ÁN (CỰC KỲ QUAN TRỌNG):
   - Mỗi câu gồm đúng 4 lựa chọn trong mảng 'options' (A, B, C, D).
   - BẮT BUỘC CẢ 4 PHƯƠNG ÁN PHẢI CÓ ĐỘ DÀI KÝ TỰ VÀ CẤU TRÚC NGỮ PHÁP TƯƠNG ĐƯƠNG NHAU (chênh lệch giữa phương án dài nhất và ngắn nhất không quá 15-20%).
   - TUYỆT ĐỐI KHÔNG viết phương án đúng dài hơn hẳn các phương án gây nhiễu.
   - Các phương án nhiễu phải rất tinh tế, có lý, phản ánh đúng những lầm tưởng phổ biến về làm giàu, hạnh phúc và phát triển bản thân.

3. 'correctIndex': Số nguyên từ 0 đến 3 (chỉ phương án đúng ban đầu).
4. 'explanation': Lời giải thích sâu sắc, trích dẫn hoặc phân tích rõ triết lý của Naval Ravikant vì sao lựa chọn này là đúng, đồng thời chỉ ra điểm chưa chuẩn của các phương án còn lại.

Trả về DUY NHẤT một đối tượng JSON hợp lệ theo cấu trúc sau (không kèm markdown ngoài khối JSON):
{{
  "bookId": "DeThinhVuongVaHanhPhuc",
  "chapterId": "{chap_id}",
  "chapterTitle": "{chap_title}",
  "totalQuestions": 15,
  "questions": [
    {{
      "id": "q1",
      "question": "Nội dung câu hỏi tình huống hoặc suy luận triết lý...",
      "options": [
        "Phương án A...",
        "Phương án B...",
        "Phương án C...",
        "Phương án D..."
      ],
      "correctIndex": 0,
      "explanation": "Giải thích chi tiết theo tư tưởng của Naval Ravikant..."
    }}
  ]
}}
"""

    models_to_try = [
        "gemini-3.5-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-2.5-flash"
    ]

    payload = {
        'contents': [{'parts': [{'text': prompt}]}],
        'generationConfig': {
            'responseMimeType': 'application/json',
            'temperature': 0.3
        }
    }

    max_retries = 8
    for attempt in range(max_retries):
        model_name = models_to_try[attempt % len(models_to_try)]
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={API_KEY}"

        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req, timeout=90) as resp:
                res = json.loads(resp.read().decode('utf-8'))
                raw_text = res['candidates'][0]['content']['parts'][0]['text']
                data = json.loads(raw_text)

            questions = data.get('questions', [])
            if len(questions) < 15:
                raise ValueError(f"Only got {len(questions)} questions")

            questions = questions[:15]

            # BẢO ĐẢM PHÂN BỐ ĐỀU ĐÁP ÁN ĐÚNG CHO A, B, C, D (4, 4, 4, 3)
            target_indices = [0]*4 + [1]*4 + [2]*4 + [3]*3
            seed_val = int(time.time() * 1000) % 100000 + abs(hash(chap_id)) % 10000
            rng = random.Random(seed_val)
            rng.shuffle(target_indices)

            for i, q in enumerate(questions):
                q['id'] = f"q{i+1}"
                options = q.get('options', [])
                if len(options) != 4:
                    raise ValueError(f"Question {i+1} has {len(options)} options, expected 4")

                correct_idx = q.get('correctIndex', 0)
                if not (isinstance(correct_idx, int) and 0 <= correct_idx < 4):
                    correct_idx = 0

                target_idx = target_indices[i]

                # Hoán đổi vị trí đáp án đúng vào target_idx để phân bố đều 4, 4, 4, 3
                if target_idx != correct_idx:
                    options[correct_idx], options[target_idx] = options[target_idx], options[correct_idx]

                q['options'] = options
                q['correctIndex'] = target_idx

            questions = balance_options_lengths(questions)

            output_data = {
                "bookId": "DeThinhVuongVaHanhPhuc",
                "chapterId": chap_id,
                "chapterTitle": chap_title,
                "totalQuestions": 15,
                "questions": questions
            }

            with open(target_file, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, ensure_ascii=False, indent=2)

            print(f"[{chap_num}/{total_chaps}] [OK] {chap_id} (15 questions) generated successfully.")
            return chap_id, True

        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait_time = 12 + attempt * 5
                print(f"[{chap_num}/{total_chaps}] [429 Quota] {chap_id}, waiting {wait_time}s...")
                time.sleep(wait_time)
            elif e.code in (500, 502, 503, 504):
                wait_time = 8 + attempt * 4
                print(f"[{chap_num}/{total_chaps}] [HTTP {e.code}] {chap_id}, waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                print(f"[{chap_num}/{total_chaps}] [HTTP {e.code}] {chap_id}: {e}")
                time.sleep(3)
        except Exception as e:
            print(f"[{chap_num}/{total_chaps}] [ERR] Attempt {attempt+1} for {chap_id}: {e}")
            time.sleep(3)

    print(f"[{chap_num}/{total_chaps}] [FAIL] Could not generate quiz for {chap_id}")
    return chap_id, False

def main():
    print(f"Bắt đầu quy trình tạo Quiz cho 'Để Thịnh Vượng Và Hạnh Phúc' ({len(chapters)} mục)...")
    success_count = 0
    total_to_generate = len(chapters)

    for idx, chap in enumerate(chapters):
        cid, ok = generate_quiz_for_chapter(chap, idx + 1, total_to_generate)
        if ok:
            success_count += 1
        time.sleep(2)

    print(f"\nHoàn tất! Thành công: {success_count}/{total_to_generate} chương.")

if __name__ == '__main__':
    main()
