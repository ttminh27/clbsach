#!/usr/bin/env python3
"""
scripts/generate_sachhuongdansudungcothenguoi_quizzes.py

Tạo bộ câu hỏi trắc nghiệm (quiz) chất lượng cao gồm 15 câu suy luận và tình huống thực tế
cho các chương trong tác phẩm kinh điển "Sách Hướng Dẫn Sử Dụng Cơ Thể Người" (人体使用手册)
của tác giả Ngô Thanh Trung (dịch giả: Trần Nghĩa Phương):
- Bắt buộc phân bố đều vị trí đáp án đúng (A, B, C, D): 4, 4, 4, 3.
- Độ dài các phương án A, B, C, D cân bằng, không chênh lệch quá 20%.
- Câu hỏi đòi hỏi tư duy, suy luận sâu sắc về:
  * Quan điểm khoa học hệ thống: cơ thể người như siêu máy tính hoàn mỹ có phần cứng, phần mềm và hệ thống tự phục hồi.
  * 5 mức năng lượng khí huyết (Khỏe mạnh, Dương hư, Âm hư, Âm dương lưỡng hư, Khí huyết khô kiệt).
  * Bản chất của Hàn khí, phản ứng thải độc và sai lầm khi dùng thuốc ức chế triệu chứng.
  * Phân biệt giữa "Bệnh" (gốc rễ suy giảm năng lượng) và "Chứng" (nỗ lực tự sửa chữa của cơ thể).
  * Bộ 3 bài thuốc dưỡng sinh vàng ("Nhất thức tam chiêu"): Vỗ Đảm Kinh, Ngủ sớm dậy sớm tạo máu, Massage Tâm Bao Kinh.
  * Bản chất của béo phì (rác thải và dịch ứ trệ do thiếu năng lượng đào thải, không phải thừa dinh dưỡng).
  * Cơ chế tự chữa lành và điều dưỡng các bệnh mạn tính: tiểu đường, cao huyết áp, dạ dày, dị ứng, viêm gan, thoái hóa.
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
BOOK_DIR = os.path.join(ROOT_DIR, 'book', 'SachHuongDanSuDungCoTheNguoi')
QUIZZES_DIR = os.path.join(BOOK_DIR, 'quizzes')
os.makedirs(QUIZZES_DIR, exist_ok=True)

MANIFEST_PATH = os.path.join(ROOT_DIR, 'src', 'data', 'books-manifest.json')
with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
    manifest = json.load(f)

book_meta = next(b for b in manifest if b['id'] == 'SachHuongDanSuDungCoTheNguoi')
chapters = book_meta['chapters']

# Danh sách các chương cần tạo Quiz
TARGET_CHAPTER_IDS = {
    "00-loi-noi-dau",
    "chuong-01-chat-van-doi-voi-y-hoc-hien-dai",
    "chuong-02-he-thong-co-the-nguoi",
    "chuong-03-he-thong-nang-luong-khi-huyet-cua-co-the-nguoi",
    "chuong-04-han-khi",
    "chuong-05-benh-va-chung",
    "chuong-06-duong-sinh-hang-ngay",
    "chuong-07-giam-beo",
    "chuong-08-dieu-duong-benh-man-tinh",
    "chuong-09-tong-ket",
    "phu-luc-phong-van-va-trao-doi-cung-tac-gia",
    "loi-cuoi-sach"
}

print(f"Loaded {len(chapters)} chapters for SachHuongDanSuDungCoTheNguoi. Target quiz chapters: {len(TARGET_CHAPTER_IDS)}.")

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

    if chap_id not in TARGET_CHAPTER_IDS:
        print(f"[{chap_num}/{total_chaps}] [SKIP_NON_TARGET] {chap_id} ({chap_title}) is not in target list.")
        return chap_id, True

    if is_quiz_valid(target_file):
        print(f"[{chap_num}/{total_chaps}] [SKIP] {chap_id} already has a valid balanced quiz.")
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

    prompt = f"""Bạn là một chuyên gia nghiên cứu Trung y học cổ truyền, hệ thống học sinh học hiện đại và dưỡng sinh tự chữa lành theo tư tưởng của tác giả Ngô Thanh Trung (tác phẩm 'Sách Hướng Dẫn Sử Dụng Cơ Thể Người' - 人体使用手册).
Hãy đọc kỹ nội dung chương sách sau đây:

Tiêu đề chương: {chap_title}
Nội dung chương:
\"\"\"
{content_sample}
\"\"\"

HÃY THIẾT KẾ ĐÚNG 15 CÂU HỎI TRẮC NGHIỆM ĐÒI HỎI SUY LUẬN, THẤU HIỂU NGUYÊN LÝ Y HỌC HỆ THỐNG VÀ TÌNH HUỐNG THỰC TẾ:
1. YÊU CẦU NỘI DUNG (SUY LUẬN & ỨNG DỤNG THỰC TẾ):
   - Câu hỏi phải bám sát tinh thần cốt lõi của cuốn sách:
     * Góc nhìn hệ thống học: cơ thể con người là một hệ sinh học thông minh vượt bậc với đầy đủ phần cứng, phần mềm, hệ thống chẩn đoán và tự sửa chữa; nhiều triệu chứng bệnh tật thực chất là nỗ lực tự vệ hoặc đào thải độc tố của cơ thể.
     * Năng lượng khí huyết: 5 mức khí huyết, cơ chế tạo máu của tủy xương vào ban đêm (22h - 1h sáng), hấp thu chất béo và protein nhờ dịch mật (Đảm kinh).
     * Phân biệt rõ giữa "Bệnh" và "Chứng": không nên vội vã dùng thuốc hóa dược dập tắt các phản ứng thải độc (sốt, ho, sổ mũi, nôn trớ, xuất huyết đào thải).
     * Các phương pháp thực hành: Vỗ Đảm Kinh, Ngủ sớm dậy sớm, Xoa bóp Tâm Bao Kinh, ngâm chân thải hàn khí.
     * Lý giải cơ chế các bệnh mạn tính: tiểu đường (thiếu máu nuôi tế bào, cơ thể bù trừ glucose), cao huyết áp (mạch máu hẹp hoặc thiếu máu lên não khiến tim phải tăng áp lực bơm), béo phì (ứ trệ chất thải do không đủ năng lượng bài tiết).
   - Ưu tiên các câu hỏi tình huống thực tế đời sống để người đọc nhận diện ngộ nhận sai lầm và áp dụng thói quen sinh hoạt đúng đắn.
   - TUYỆT ĐỐI KHÔNG hỏi các chi tiết nhớ vẹt cơ học (như số trang, thứ tự dòng).
   - Câu hỏi cần bao quát toàn bộ nội dung của chương từ đầu đến cuối.

2. CÂN BẰNG ĐỘ DÀI CÁC PHƯƠNG ÁN (CỰC KỲ QUAN TRỌNG):
   - Mỗi câu gồm đúng 4 lựa chọn trong mảng 'options' (tương ứng A, B, C, D).
   - BẮT BUỘC CẢ 4 PHƯƠNG ÁN PHẢI CÓ ĐỘ DÀI KÝ TỰ VÀ CẤU TRÚC NGỮ PHÁP TƯƠNG ĐƯƠNG NHAU (chênh lệch giữa phương án dài nhất và ngắn nhất không quá 15-20%).
   - TUYỆT ĐỐI KHÔNG viết phương án đúng dài hơn hẳn các phương án gây nhiễu.
   - Các phương án nhiễu phải rất tinh tế, hợp lý và phản ánh đúng những định kiến sai lầm phổ biến của đa số mọi người về y học và điều trị.

3. 'correctIndex': Số nguyên từ 0 đến 3 (chỉ phương án đúng ban đầu).
4. 'explanation': Lời giải thích khúc chiết, phân tích sâu sắc theo quan điểm Đông y hệ thống học của Ngô Thanh Trung vì sao phương án đó đúng và chỉ rõ điểm ngộ nhận của các phương án sai.

Trả về DUY NHẤT một đối tượng JSON hợp lệ theo cấu trúc mẫu sau (không kèm markdown ngoài khối JSON):
{{
  "bookId": "SachHuongDanSuDungCoTheNguoi",
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
      "explanation": "Giải thích chi tiết theo lý luận của tác giả Ngô Thanh Trung..."
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
                "bookId": "SachHuongDanSuDungCoTheNguoi",
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
                wait_time = 10 + attempt * 4
                print(f"[{chap_num}/{total_chaps}] [429 Quota] {chap_id}, waiting {wait_time}s...")
                time.sleep(wait_time)
            elif e.code in (500, 502, 503, 504):
                wait_time = 6 + attempt * 3
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
    print(f"Bắt đầu quy trình tạo Quiz cho 'Sách Hướng Dẫn Sử Dụng Cơ Thể Người' ({len(chapters)} chương/mục)...")
    total_chaps = len(chapters)

    max_rounds = 5
    for round_num in range(1, max_rounds + 1):
        remaining = [
            (idx + 1, c) for idx, c in enumerate(chapters)
            if not is_quiz_valid(os.path.join(QUIZZES_DIR, f"{c['id']}.json"))
            and c['id'] in TARGET_CHAPTER_IDS
        ]

        if not remaining:
            print("\n>>> TẤT CẢ CÁC CHƯƠNG ĐÃ CÓ QUIZ HỢP LỆ VÀ CÂN BẰNG ĐÁP ÁN! <<<")
            break

        print(f"\n--- [Vòng {round_num}/{max_rounds}] Cần tạo Quiz cho {len(remaining)} chương còn lại ---")

        # Dùng ThreadPoolExecutor với tối đa 3 workers để tránh chạm quota 429
        with ThreadPoolExecutor(max_workers=3) as executor:
            future_to_chap = {
                executor.submit(generate_quiz_for_chapter, chap, num, total_chaps): (num, chap['id'])
                for num, chap in remaining
            }

            for future in as_completed(future_to_chap):
                num, chap_id = future_to_chap[future]
                try:
                    future.result()
                except Exception as exc:
                    print(f"Exception generating quiz for {chap_id}: {exc}")

        time.sleep(4)

    # Tổng kết lại
    valid_count = 0
    for c in chapters:
        target_file = os.path.join(QUIZZES_DIR, f"{c['id']}.json")
        if is_quiz_valid(target_file):
            valid_count += 1
            print(f"✓ {c['id']}: 15 câu chuẩn")
        elif c['id'] in TARGET_CHAPTER_IDS:
            print(f"✗ {c['id']}: THIẾU HOẶC KHÔNG HỢP LỆ")

    print(f"\nHoàn tất: {valid_count}/{len(TARGET_CHAPTER_IDS)} chương mục tiêu đã có Quiz chuẩn.")

if __name__ == '__main__':
    main()
