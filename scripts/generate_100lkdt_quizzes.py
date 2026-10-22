#!/usr/bin/env python3
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
    raise ValueError("Missing GEMINI_API_KEY")

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK_DIR = os.path.join(ROOT_DIR, 'book', '100LoiKhuyenVeDauTu')
QUIZZES_DIR = os.path.join(BOOK_DIR, 'quizzes')
os.makedirs(QUIZZES_DIR, exist_ok=True)

MANIFEST_PATH = os.path.join(ROOT_DIR, 'src', 'data', 'books-manifest.json')
with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
    manifest = json.load(f)

book_meta = next(b for b in manifest if b['id'] == '100LoiKhuyenVeDauTu')
chapters = book_meta['chapters']

print(f"Loaded {len(chapters)} chapters for 100LoiKhuyenVeDauTu.")

def is_quiz_valid(file_path):
    if not os.path.exists(file_path):
        return False
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        qs = data.get('questions', [])
        if len(qs) < 15:
            return False
        for q in qs[:15]:
            if len(q.get('options', [])) != 4:
                return False
            if not ('correctIndex' in q and 0 <= q['correctIndex'] <= 3):
                return False
            if not q.get('explanation'):
                return False
        return True
    except Exception:
        return False

def generate_quiz_for_chapter(chapter, chap_num, total_chaps):
    chap_id = chapter['id']
    chap_title = chapter['title']
    target_file = os.path.join(QUIZZES_DIR, f"{chap_id}.json")

    if re.match(r'^00+_?trang_?bia', chap_id, re.I) or chap_title.strip().lower().startswith("trang bìa"):
        print(f"[{chap_num}/{total_chaps}] [SKIP_COVER] {chap_id} is cover page, skipping quiz.")
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

    prompt = f"""Bạn là chuyên gia thẩm định sư phạm và đầu tư bất động sản cao cấp.
Hãy đọc kỹ nội dung chương sách sau đây trích từ tác phẩm '100 Lời Khuyên Về Đầu Tư Bất Động Sản Khôn Ngoan Nhất' (tuyển chọn bởi Donald J. Trump):

Tiêu đề chương: {chap_title}
Nội dung:
\"\"\"
{content}
\"\"\"

YÊU CẦU THIẾT KẾ BỘ QUIZ (ĐÚNG 15 CÂU HỎI TRẮC NGHIỆM ĐÒI HỎI TƯ DUY & SUY LUẬN):
1. ĐÒI HỎI SUY LUẬN & THỰC CHIẾN:
   - Các câu hỏi phải đi sâu vào bản chất chiến lược kinh doanh, triết lý đầu tư, phân tích thị trường, quản trị rủi ro, tâm lý đàm phán và bài học thực tế mà chuyên gia truyền tải trong chương này.
   - TUYỆT ĐỐI KHÔNG hỏi các chi tiết vụn vặt cơ học (như số trang, thứ tự chương, tên địa danh không liên quan).
   - Nếu chương là Lời giới thiệu hoặc Trang bìa & Mục lục, hãy hỏi về triết lý tổng thể của Donald Trump, tiêu chí chọn lọc 100 lời khuyên và bức tranh toàn cảnh của thị trường bất động sản.
   - Đối với những chương ngắn, hãy khai thác tư duy cốt lõi, hoàn cảnh ứng dụng nguyên tắc và các cạm bẫy thường gặp nếu vi phạm nguyên tắc đó.
2. ĐỘ DÀI CÁC PHƯƠNG ÁN PHẢI TƯƠNG ĐỒNG (CỰC KỲ QUAN TRỌNG):
   - Mỗi câu gồm đúng 4 lựa chọn trong mảng 'options'.
   - Cả 4 phương án PHẢI CÓ ĐỘ DÀI TƯƠNG ĐƯƠNG NHAU (chênh lệch số từ hoặc độ dài ký tự giữa phương án ngắn nhất và dài nhất không quá 15-20%).
   - TUYỆT ĐỐI KHÔNG để phương án đúng dài hơn hẳn các phương án khác khiến người đọc dễ dàng đoán mò.
   - Các phương án gây nhiễu phải có tính thuyết phục và chuyên môn cao để người đọc buộc phải tư duy sâu sắc.
3. 'correctIndex': Số nguyên từ 0 đến 3 chỉ phương án đúng ban đầu.
4. 'explanation': Giải thích cô đọng, sắc bén vì sao phương án đúng là chính xác nhất theo quan điểm của chuyên gia, đồng thời phân tích ngắn gọn lý do các phương án còn lại chưa chính xác hoặc tiềm ẩn rủi ro.

Trả về DUY NHẤT một đối tượng JSON hợp lệ theo cấu trúc:
{{
  "bookId": "100LoiKhuyenVeDauTu",
  "chapterId": "{chap_id}",
  "chapterTitle": "{chap_title}",
  "totalQuestions": 15,
  "questions": [
    {{
      "id": "q1",
      "question": "Nội dung câu hỏi tình huống hoặc suy luận...",
      "options": ["Phương án A...", "Phương án B...", "Phương án C...", "Phương án D..."],
      "correctIndex": 0,
      "explanation": "Phân tích vì sao phương án được chọn là đúng..."
    }}
  ]
}}
"""

    models_to_try = [
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash"
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

            # BẢO ĐẢM PHÂN BỐ ĐỀU ĐÁP ÁN ĐÚNG CHO A, B, C, D:
            # 15 câu: 4 câu A (0), 4 câu B (1), 4 câu C (2), 3 câu D (3)
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
                if not (0 <= correct_idx < 4):
                    correct_idx = 0

                target_idx = target_indices[i]

                # Hoán đổi vị trí đáp án đúng vào target_idx để phân bố đều 100%
                if target_idx != correct_idx:
                    options[correct_idx], options[target_idx] = options[target_idx], options[correct_idx]

                q['options'] = options
                q['correctIndex'] = target_idx

            output_data = {
                "bookId": "100LoiKhuyenVeDauTu",
                "chapterId": chap_id,
                "chapterTitle": chap_title,
                "totalQuestions": 15,
                "questions": questions
            }

            with open(target_file, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, ensure_ascii=False, indent=2)

            print(f"[{chap_num}/{total_chaps}] [OK] {chap_id} ({len(questions)} questions) saved.")
            return chap_id, True

        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait_time = 12 + attempt * 5
                print(f"[{chap_num}/{total_chaps}] [429] {chap_id}, wait {wait_time}s...")
                time.sleep(wait_time)
            elif e.code in (500, 502, 503, 504):
                wait_time = 8 + attempt * 4
                print(f"[{chap_num}/{total_chaps}] [HTTP {e.code}] {chap_id}, wait {wait_time}s...")
                time.sleep(wait_time)
            else:
                print(f"[{chap_num}/{total_chaps}] [HTTP {e.code}] {chap_id}: {e}")
                time.sleep(3)
        except Exception as e:
            print(f"[{chap_num}/{total_chaps}] [ERR] Attempt {attempt+1} failed for {chap_id}: {e}")
            time.sleep(3)

    print(f"[{chap_num}/{total_chaps}] [FAIL] Could not generate quiz for {chap_id}")
    return chap_id, False

def main():
    print(f"Starting quiz generation for {len(chapters)} chapters...")
    total_chaps = len(chapters)

    round_num = 0
    while round_num < 5:
        round_num += 1
        remaining = [(idx + 1, c) for idx, c in enumerate(chapters) if not is_quiz_valid(os.path.join(QUIZZES_DIR, f"{c['id']}.json"))]

        if not remaining:
            print("[SUCCESS] All 102 chapters have complete quizzes!")
            break

        print(f"\n=== Round {round_num}: Remaining: {len(remaining)} chapters ===")

        # Run with 2 workers
        with ThreadPoolExecutor(max_workers=2) as executor:
            futures = {executor.submit(generate_quiz_for_chapter, c, num, total_chaps): (num, c) for num, c in remaining}
            for fut in as_completed(futures):
                num, c = futures[fut]
                try:
                    fut.result()
                except Exception as e:
                    print(f"Exception on {c['id']}: {e}")
                time.sleep(1.0)

        time.sleep(2)

    total_valid = sum(1 for c in chapters if is_quiz_valid(os.path.join(QUIZZES_DIR, f"{c['id']}.json")))
    print(f"\nFinal Summary: {total_valid} / {len(chapters)} chapters have valid quizzes.")

if __name__ == '__main__':
    main()
