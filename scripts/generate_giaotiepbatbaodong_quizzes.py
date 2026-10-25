#!/usr/bin/env python3
"""
scripts/generate_giaotiepbatbaodong_quizzes.py

Tạo bộ câu hỏi trắc nghiệm (quiz) gồm 15 câu suy luận và tình huống thực tế chuyên sâu
cho mỗi chương trong tác phẩm kinh điển "Giao Tiếp Bất Bạo Động" (Nonviolent Communication - NVC)
của Tiến sĩ Marshall B. Rosenberg.
- Bắt buộc phân bố đều vị trí đáp án đúng (A, B, C, D): 4, 4, 4, 3.
- Độ dài các phương án A, B, C, D cân bằng, không chênh lệch quá 20%.
- Câu hỏi đòi hỏi tư duy, suy luận sâu sắc về 4 thành tố NVC: Quan sát không phán xét,
  Nhận diện cảm xúc thật, Thấu hiểu nhu cầu cốt lõi, Đưa ra lời đề nghị cụ thể;
  nghệ thuật Lắng nghe đồng cảm, Chuyển hóa cơn giận, Trắc ẩn với bản thân, và Dùng vũ lực bảo vệ.
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
BOOK_DIR = os.path.join(ROOT_DIR, 'book', 'GiaoTiepBatBaoDong')
QUIZZES_DIR = os.path.join(BOOK_DIR, 'quizzes')
os.makedirs(QUIZZES_DIR, exist_ok=True)

MANIFEST_PATH = os.path.join(ROOT_DIR, 'src', 'data', 'books-manifest.json')
with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
    manifest = json.load(f)

book_meta = next(b for b in manifest if b['id'] == 'GiaoTiepBatBaoDong')
chapters = book_meta['chapters']

print(f"Loaded {len(chapters)} chapters for GiaoTiepBatBaoDong.")

def is_quiz_valid(file_path):
    if not os.path.exists(file_path):
        return False
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        qs = data.get('questions', [])
        if len(qs) < 15:
            return False
        counts = {0: 0, 1: 0, 2: 0, 3: 0}
        for q in qs[:15]:
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

def generate_quiz_for_chapter(chapter, chap_num, total_chaps):
    chap_id = chapter['id']
    chap_title = chapter['title']
    target_file = os.path.join(QUIZZES_DIR, f"{chap_id}.json")

    # Trang lời khen & cảm ơn không cần quiz
    if chap_id == '00_loi_khen_tang_va_loi_cam_on' or 'lời khen tặng' in chap_title.lower():
        print(f"[{chap_num}/{total_chaps}] [SKIP_INTRO] {chap_id} is introductory endorsements, skipping quiz.")
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

    prompt = f"""Bạn là một chuyên gia tâm lý học lâm sàng, hòa giải mâu thuẫn quốc tế và là giảng viên cao cấp về phương pháp Giao Tiếp Bất Bạo Động (Nonviolent Communication - NVC) của Tiến sĩ Marshall B. Rosenberg.
Hãy đọc kỹ nội dung chương sách sau đây từ tác phẩm kinh điển 'Giao Tiếp Bất Bạo Động':

Tiêu đề chương: {chap_title}
Nội dung chương:
\"\"\"
{content_sample}
\"\"\"

HÃY THIẾT KẾ ĐÚNG 15 CÂU HỎI TRẮC NGHIỆM ĐÒI HỎI SUY LUẬN, THẤU HIỂU BẢN CHẤT TÂM LÝ VÀ TÌNH HUỐNG THỰC TẾ:
1. YÊU CẦU NỘI DUNG (SUY LUẬN & ỨNG DỤNG THỰC TẾ NVC):
   - Câu hỏi phải bám sát tinh thần cốt lõi của NVC: 4 thành tố (Quan sát khách quan không phán xét, Nhận diện cảm xúc thật sự, Thấu hiểu nhu cầu phổ quát của con người, Đưa ra đề nghị hành động cụ thể khả thi); sự phân biệt giữa nhu cầu và chiến lược; ngôn ngữ hươu cao cổ (Giraffe - kết nối trắc ẩn) vs ngôn ngữ chó sói (Jackal - phán xét, chỉ trích, đổ lỗi); lắng nghe đồng cảm mà không khuyên nhủ hay phân tích; chuyển hóa cơn giận từ việc tìm ra nhu cầu chưa thỏa mãn; dùng vũ lực với mục đích bảo vệ chứ không trừng phạt; trắc ẩn với chính mình; và cách bày tỏ sự biết ơn chân thực.
   - Ưu tiên các câu hỏi tình huống thực tế (trong gia đình, nuôi dạy con cái, quan hệ vợ chồng, môi trường công sở, hòa giải xung đột) để người học phân biệt phản ứng giao tiếp thông thường (bạo động vô thức) và phản ứng NVC đúng đắn.
   - TUYỆT ĐỐI KHÔNG hỏi các chi tiết cơ học nhớ vẹt (như số trang, thứ tự danh mục cơ học).
   - Câu hỏi cần bao quát toàn bộ nội dung của chương từ đầu đến cuối.

2. CÂN BẰNG ĐỘ DÀI CÁC PHƯƠNG ÁN (CỰC KỲ QUAN TRỌNG):
   - Mỗi câu gồm đúng 4 lựa chọn trong mảng 'options' (tương ứng A, B, C, D).
   - BẮT BUỘC CẢ 4 PHƯƠNG ÁN PHẢI CÓ ĐỘ DÀI KÝ TỰ VÀ CẤU TRÚC NGỮ PHÁP TƯƠNG ĐƯƠNG NHAU (chênh lệch giữa phương án dài nhất và ngắn nhất không quá 15-20%).
   - TUYỆT ĐỐI KHÔNG viết phương án đúng dài hơn hẳn các phương án gây nhiễu.
   - Các phương án nhiễu phải rất tinh tế, hợp lý, phản ánh đúng những thói quen giao tiếp sai lầm phổ biến của con người khi chưa học NVC.

3. 'correctIndex': Số nguyên từ 0 đến 3 (chỉ phương án đúng ban đầu).
4. 'explanation': Lời giải thích khúc chiết, phân tích rõ nguyên lý NVC của Marshall Rosenberg vì sao lựa chọn này là đúng, đồng thời chỉ ra điểm chưa chuẩn của các phương án còn lại.

Trả về DUY NHẤT một đối tượng JSON hợp lệ theo cấu trúc mẫu sau (không kèm markdown ngoài khối JSON):
{{
  "bookId": "GiaoTiepBatBaoDong",
  "chapterId": "{chap_id}",
  "chapterTitle": "{chap_title}",
  "totalQuestions": 15,
  "questions": [
    {{
      "id": "q1",
      "question": "Nội dung câu hỏi tình huống hoặc suy luận bản chất...",
      "options": [
        "Phương án A...",
        "Phương án B...",
        "Phương án C...",
        "Phương án D..."
      ],
      "correctIndex": 0,
      "explanation": "Giải thích chi tiết theo nguyên lý Giao tiếp bất bạo động của Marshall Rosenberg..."
    }}
  ]
}}
"""

    models_to_try = [
        "gemini-2.5-flash",
        "gemini-flash-lite-latest",
        "gemini-3.5-flash-lite"
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

                # Hoán đổi vị trí đáp án đúng vào target_idx để phân bố đều 4, 4, 4, 3
                if target_idx != correct_idx:
                    options[correct_idx], options[target_idx] = options[target_idx], options[correct_idx]

                q['options'] = options
                q['correctIndex'] = target_idx

            output_data = {
                "bookId": "GiaoTiepBatBaoDong",
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
    print(f"Bắt đầu quy trình tạo Quiz cho 'Giao Tiếp Bất Bạo Động' ({len(chapters)} mục)...")
    total_chaps = len(chapters)

    max_rounds = 5
    for round_num in range(1, max_rounds + 1):
        remaining = [
            (idx + 1, c) for idx, c in enumerate(chapters)
            if not is_quiz_valid(os.path.join(QUIZZES_DIR, f"{c['id']}.json"))
            and c['id'] != '00_loi_khen_tang_va_loi_cam_on'
            and 'lời khen tặng' not in c['title'].lower()
        ]

        if not remaining:
            print("\n🎉 [HOÀN TẤT] Toàn bộ các chương của 'Giao Tiếp Bất Bạo Động' đã có Quiz đầy đủ!")
            break

        print(f"\n=== Vòng {round_num}: Còn lại {len(remaining)} chương cần tạo ===")

        # Dùng 3 workers song song
        with ThreadPoolExecutor(max_workers=3) as executor:
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
                time.sleep(0.5)

        time.sleep(2)

    total_valid = sum(
        1 for c in chapters
        if is_quiz_valid(os.path.join(QUIZZES_DIR, f"{c['id']}.json"))
    )
    print(f"\nTổng kết: {total_valid} / {len(chapters) - 1} chương nội dung đã có Quiz đạt chuẩn.")

if __name__ == '__main__':
    main()
