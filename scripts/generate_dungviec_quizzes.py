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
BOOK_DIR = os.path.join(ROOT_DIR, 'book', 'DungViec')
QUIZZES_DIR = os.path.join(BOOK_DIR, 'quizzes')
os.makedirs(QUIZZES_DIR, exist_ok=True)

MANIFEST_PATH = os.path.join(ROOT_DIR, 'src', 'data', 'books-manifest.json')
with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
    manifest = json.load(f)

book_meta = next(b for b in manifest if b['id'] == 'DungViec')
chapters = book_meta['chapters']

print(f"Loaded {len(chapters)} chapters for DungViec.")

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

    # Trang bìa thì không cần quiz
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

    prompt = f"""Bạn là chuyên gia thẩm định sư phạm, triết học và giáo dục khai minh hàng đầu.
Hãy đọc kỹ nội dung chương sách sau đây trích từ tác phẩm 'Đúng Việc - Một Góc Nhìn Về Câu Chuyện Khai Minh' của nhà giáo dục Giản Tư Trung:

Tiêu đề chương: {chap_title}
Nội dung:
\"\"\"
{content}
\"\"\"

YÊU CẦU THIẾT KẾ BỘ QUIZ (ĐÚNG 15 CÂU HỎI TRẮC NGHIỆM ĐÒI HỎI TƯ DUY & SUY LUẬN SÂU SẮC):
1. ĐÒI HỎI SUY LUẬN & THẤU HIỂU BẢN CHẤT:
   - Các câu hỏi phải đi sâu vào cốt lõi tư tưởng của Giản Tư Trung về 4 công việc lớn: Làm người, Làm dân, Làm việc và Làm giáo dục; tinh thần khai minh, tự lực khai hóa, tự do và phẩm giá con người.
   - Phân biệt rõ các cặp phạm trù sâu sắc mà tác giả đưa ra (ví dụ: con người tự do vs con người công cụ/nô lệ; công dân vs thần dân/nô dân; làm việc vì lương vụ vs làm việc vì sứ mệnh; doanh nhân vs trọc phú/con buôn; nhà giáo vs thợ dạy; trí thức vs trí nô).
   - TUYỆT ĐỐI KHÔNG hỏi các chi tiết vụn vặt cơ học (như số trang, thứ tự mục).
   - Câu hỏi cần bao quát toàn bộ nội dung của chương từ đầu đến cuối, kiểm tra khả năng vận dụng triết lý sống vào các tình huống thực tiễn.
2. ĐỘ DÀI CÁC PHƯƠNG ÁN PHẢI TƯƠNG ĐỒNG (CỰC KỲ QUAN TRỌNG):
   - Mỗi câu gồm đúng 4 lựa chọn trong mảng 'options'.
   - Cả 4 phương án PHẢI CÓ ĐỘ DÀI TƯƠNG ĐƯƠNG NHAU (chênh lệch số từ hoặc độ dài ký tự giữa phương án ngắn nhất và dài nhất không quá 15-20%).
   - TUYỆT ĐỐI KHÔNG để phương án đúng dài hơn hẳn các phương án khác khiến người đọc dễ dàng đoán mò.
   - Các phương án gây nhiễu phải có tính thuyết phục và triết lý cao để người đọc buộc phải suy ngẫm sâu sắc.
3. 'correctIndex': Số nguyên từ 0 đến 3 chỉ phương án đúng ban đầu.
4. 'explanation': Giải thích cô đọng, sắc bén vì sao phương án đúng là chính xác nhất theo tư tưởng khai minh của tác giả, đồng thời phân tích ngắn gọn lý do các phương án còn lại chưa chuẩn xác hoặc còn phiến diện.

Trả về DUY NHẤT một đối tượng JSON hợp lệ theo cấu trúc:
{{
  "bookId": "DungViec",
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
                "bookId": "DungViec",
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
            print("[SUCCESS] All 6 chapters have complete quizzes!")
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
