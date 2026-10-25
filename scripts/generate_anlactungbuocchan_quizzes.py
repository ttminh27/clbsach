#!/usr/bin/env python3
"""
scripts/generate_anlactungbuocchan_quizzes.py

Tạo bộ câu hỏi trắc nghiệm (quiz) gồm 15 câu suy luận chuyên sâu cho mỗi chương
trong tác phẩm "An Lạc Từng Bước Chân" của Thiền sư Thích Nhất Hạnh.
- Bắt buộc phân bố đều vị trí đáp án đúng (A, B, C, D) ~ 25% mỗi vị trí.
- Độ dài các phương án A, B, C, D cân bằng, không chênh lệch quá 20%.
- Câu hỏi đòi hỏi tư duy, suy luận, thấu hiểu triết lý chánh niệm & tương tức.
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
    raise ValueError("Missing GEMINI_API_KEY")

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK_DIR = os.path.join(ROOT_DIR, 'book', 'AnLacTungBuocChan')
QUIZZES_DIR = os.path.join(BOOK_DIR, 'quizzes')
os.makedirs(QUIZZES_DIR, exist_ok=True)

MANIFEST_PATH = os.path.join(ROOT_DIR, 'src', 'data', 'books-manifest.json')
with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
    manifest = json.load(f)

book_meta = next(b for b in manifest if b['id'] == 'AnLacTungBuocChan')
chapters = book_meta['chapters']

print(f"Loaded {len(chapters)} chapters for AnLacTungBuocChan.")

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

    # Trang bìa & mục lục không cần quiz
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

    prompt = f"""Bạn là một học giả Phật học ứng dụng và chuyên gia sư phạm thiết kế bài tập tư duy chánh niệm sâu sắc.
Hãy đọc kỹ nội dung chương sách sau đây từ tác phẩm kinh điển 'An Lạc Từng Bước Chân' (Peace Is Every Step) của Thiền sư Thích Nhất Hạnh:

Tiêu đề chương: {chap_title}
Nội dung chương:
\"\"\"
{content}
\"\"\"

HÃY THIẾT KẾ ĐÚNG 15 CÂU HỎI TRẮC NGHIỆM ĐÒI HỎI SUY LUẬN & THẤU HIỂU CHIỀU SÂU TUỆ GIÁC:
1. YÊU CẦU NỘI DUNG (SUY LUẬN & ỨNG DỤNG THỰC TẾ):
   - Câu hỏi phải đi sâu vào bản chất tâm lý học Phật giáo ứng dụng, tinh thần Chánh niệm (Mindfulness), Tuệ giác Tương tức (Interbeing), Tinh thần Bất nhị, Chuyển hóa cảm thọ tiêu cực (như sân hận, đau khổ), và phương pháp sống an trú trong hiện tại mà Thầy Thích Nhất Hạnh truyền dạy.
   - Tập trung vào tình huống thực chứng: Người đọc cần hiểu được cơ chế vận hành của tâm thức, cách thực hành chánh niệm qua các hành động đời thường (thở, bước chân, rửa chén, lái xe, lắng nghe tiếng chuông, quan sát cơn giận...).
   - TUYỆT ĐỐI KHÔNG hỏi các chi tiết cơ học, số trang, thứ tự chương hay câu chữ học vẹt đơn giản.
   - Các câu hỏi phải bao quát trọn vẹn toàn bộ ý nghĩa cốt lõi của chương từ đầu đến cuối.

2. CÂN BẰNG ĐỘ DÀI CÁC PHƯƠNG ÁN (CỰC KỲ QUAN TRỌNG):
   - Mỗi câu gồm đúng 4 lựa chọn trong mảng 'options' (tương ứng A, B, C, D).
   - BẮT BUỘC CẢ 4 PHƯƠNG ÁN PHẢI CÓ ĐỘ DÀI KÝ TỰ VÀ CẤU TRÚC NGỮ PHÁP TƯƠNG ĐƯƠNG NHAU (chênh lệch giữa phương án dài nhất và ngắn nhất không quá 15-20%).
   - TUYỆT ĐỐI KHÔNG viết phương án đúng dài lòng thòng, chi tiết vượt trội so với các phương án gây nhiễu, khiến người đọc có thể đoán mò mà không cần đọc.
   - Các phương án sai/nhiễu phải nghe rất hợp lý, tinh tế, đại diện cho những ngộ nhận phổ biến về thiền định, đạo đức hoặc tâm lý học.

3. 'correctIndex': Số nguyên từ 0 đến 3 (chỉ phương án đúng ban đầu).
4. 'explanation': Lời giải thích khúc chiết, chỉ rõ nguyên lý chánh niệm theo lời Thầy Thích Nhất Hạnh giải thích vì sao lựa chọn này là chân xác nhất, đồng thời vạch ra ngộ nhận hoặc giới hạn của các phương án còn lại.

Trả về DUY NHẤT một đối tượng JSON hợp lệ theo cấu trúc mẫu sau (không thêm bất kỳ văn bản nào ngoài JSON):
{{
  "bookId": "AnLacTungBuocChan",
  "chapterId": "{chap_id}",
  "chapterTitle": "{chap_title}",
  "totalQuestions": 15,
  "questions": [
    {{
      "id": "q1",
      "question": "Nội dung câu hỏi suy luận...",
      "options": [
        "Phương án A...",
        "Phương án B...",
        "Phương án C...",
        "Phương án D..."
      ],
      "correctIndex": 0,
      "explanation": "Giải thích chi tiết theo tư tưởng của Thiền sư Thích Nhất Hạnh..."
    }}
  ]
}}
"""

    models_to_try = [
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash",
        "gemini-flash-lite-latest"
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
                if not (isinstance(correct_idx, int) and 0 <= correct_idx < 4):
                    correct_idx = 0

                target_idx = target_indices[i]

                # Hoán đổi vị trí đáp án đúng vào target_idx để phân bố đều chính xác 100%
                if target_idx != correct_idx:
                    options[correct_idx], options[target_idx] = options[target_idx], options[correct_idx]

                q['options'] = options
                q['correctIndex'] = target_idx

            output_data = {
                "bookId": "AnLacTungBuocChan",
                "chapterId": chap_id,
                "chapterTitle": chap_title,
                "totalQuestions": 15,
                "questions": questions
            }

            with open(target_file, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, ensure_ascii=False, indent=2)

            print(f"[{chap_num}/{total_chaps}] [OK] {chap_id} ({len(questions)} questions) generated successfully.")
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
    print(f"Bắt đầu quy trình tạo Quiz cho 'An Lạc Từng Bước Chân' ({len(chapters)} mục)...")
    total_chaps = len(chapters)

    max_rounds = 6
    for round_num in range(1, max_rounds + 1):
        remaining = [
            (idx + 1, c) for idx, c in enumerate(chapters)
            if not is_quiz_valid(os.path.join(QUIZZES_DIR, f"{c['id']}.json"))
            and not (re.match(r'^00+_?trang_?bia', c['id'], re.I) or c['title'].strip().lower().startswith("trang bìa"))
        ]

        if not remaining:
            print("\n🎉 [HOÀN TẤT] Toàn bộ các chương của 'An Lạc Từng Bước Chân' đã có Quiz đầy đủ!")
            break

        print(f"\n=== Vòng {round_num}: Còn lại {len(remaining)} chương cần tạo ===")

        # Dùng 2 workers song song
        with ThreadPoolExecutor(max_workers=2) as executor:
            futures = {
                executor.submit(generate_quiz_for_chapter, c, num, total_chaps): (num, c)
                for num, c in remaining
            }
            for fut in as_completed(futures):
                num, c = futures[fut]
                try:
                    fut.result()
                except Exception as e:
                    print(f"Exception on {c['id']}: {e}")
                time.sleep(1.0)

        time.sleep(2)

    total_valid = sum(
        1 for c in chapters
        if is_quiz_valid(os.path.join(QUIZZES_DIR, f"{c['id']}.json"))
    )
    print(f"\nTổng kết: {total_valid} / {len(chapters) - 1} chương nội dung đã có Quiz đạt chuẩn.")

if __name__ == '__main__':
    main()
