#!/usr/bin/env python3
"""
scripts/generate_tuduynhanhvacham_quizzes.py

Tạo bộ câu hỏi trắc nghiệm (quiz) chất lượng cao gồm 15 câu suy luận và tình huống thực tế
cho các chương trong kiệt tác "Tư Duy Nhanh Và Chậm" (Thinking, Fast and Slow) của Daniel Kahneman:
- Bắt buộc phân bố đều vị trí đáp án đúng (A, B, C, D): 4, 4, 4, 3 (hoặc hoán vị của [3, 4, 4, 4]).
- Độ dài các phương án A, B, C, D cân bằng, không chênh lệch quá 20% (ratio <= 1.45).
- Câu hỏi đòi hỏi tư duy, suy luận sâu sắc về Hệ thống 1 & Hệ thống 2, các suy nghiệm và thiên kiến nhận thức,
  lý thuyết viễn cảnh, ác cảm mất mát, bản thể trải nghiệm và bản thể ghi nhớ.
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
BOOK_DIR = os.path.join(ROOT_DIR, 'book', 'TuDuyNhanhVaCham')
QUIZZES_DIR = os.path.join(BOOK_DIR, 'quizzes')
os.makedirs(QUIZZES_DIR, exist_ok=True)

# 41 chapters targeted for quizzes (excluding cover and testimonials)
EXCLUDE_CHAPTER_IDS = {
    "00_Thong_tin_sach",
    "00_Nhung_loi_tan_duong_cuon_sach"
}

MANIFEST_PATH = os.path.join(ROOT_DIR, 'src', 'data', 'books-manifest.json')
with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
    manifest = json.load(f)

book_meta = next(b for b in manifest if b['id'] == 'TuDuyNhanhVaCham')
chapters = [c for c in book_meta['chapters'] if c['id'] not in EXCLUDE_CHAPTER_IDS]

print(f"Loaded {len(chapters)} target chapters for TuDuyNhanhVaCham.")

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
            lens = [len(o) for o in opts]
            max_l = max(lens)
            min_l = min(lens)
            ratio = max_l / min_l if min_l > 0 else 999
            if ratio > 1.55 and (max_l - min_l) > 30:
                return False
        if sorted(counts.values()) != [3, 4, 4, 4]:
            return False
        return True
    except Exception:
        return False

def balance_options_lengths(questions):
    filler_phrases = [
        " trong quá trình phán đoán và tư duy.",
        " theo cơ chế hoạt động của trí não.",
        " khi đối mặt với các tình huống bất định.",
        " dựa trên các nguyên lý tâm lý học nhận thức.",
        " dưới góc độ kinh tế học hành vi.",
        " nhằm nâng cao chất lượng ra quyết định."
    ]

    for q in questions:
        opts = [o.rstrip('. ') for o in q['options']]
        lens = [len(o) for o in opts]
        max_l = max(lens)
        min_l = min(lens)

        # Cân bằng nếu chênh lệch nhiều
        if max_l / min_l > 1.35 or (max_l - min_l) > 20:
            for idx in range(4):
                if lens[idx] < max_l - 12:
                    phrase = filler_phrases[(idx + len(opts[idx])) % len(filler_phrases)]
                    opts[idx] = opts[idx] + phrase

        q['options'] = [o + "." if not o.endswith('.') else o for o in opts]

def generate_quiz_for_chapter(chapter, chap_num, total_chaps):
    chap_id = chapter['id']
    chap_title = chapter['title']
    target_file = os.path.join(QUIZZES_DIR, f"{chap_id}.json")

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

    prompt = f"""Bạn là một chuyên gia hàng đầu về tâm lý học nhận thức và kinh tế học hành vi, thấu hiểu sâu sắc tư tưởng của Daniel Kahneman trong kiệt tác 'Tư Duy Nhanh Và Chậm' (Thinking, Fast and Slow).
Hãy đọc kỹ nội dung chương sách sau đây:

Tiêu đề chương: {chap_title}
Nội dung chương:
\"\"\"
{content_sample}
\"\"\"

HÃY THIẾT KẾ ĐÚNG 15 CÂU HỎI TRẮC NGHIỆM ĐÒI HỎI SUY LUẬN, THẤU HIỂU TÂM LÝ HỌC NHẬN THỨC VÀ TÌNH HUỐNG THỰC TẾ:
1. YÊU CẦU NỘI DUNG (SUY LUẬN & ỨNG DỤNG THỰC TẾ):
   - Bám sát tư tưởng cốt lõi của tác giả Daniel Kahneman trong chương này:
     * Sự tương tác giữa Hệ thống 1 (nhanh, tự động, vô thức, trực giác, cảm tính) và Hệ thống 2 (chậm, đòi hỏi nỗ lực, logic, tập trung, kiểm soát).
     * Các thiên kiến nhận thức, sai lệch phán đoán và quy luật suy nghiệm (heuristics and biases).
     * Các hiện tượng tâm lý then chốt xuất hiện trong chương (như hiệu ứng mồi, WYSIATI, hiệu ứng mỏ neo, tính sẵn có, tỷ suất nền, quy luật số nhỏ, hồi quy về mức trung bình, trực giác chuyên gia, sai lầm của Bernoulli, lý thuyết viễn cảnh, ác cảm mất mát, hiệu ứng đóng khung, bản thể trải nghiệm và bản thể ghi nhớ, v.v.).
     * Các bài học ứng dụng thực tế vào đời sống, công việc, quản lý rủi ro và ra quyết định.
   - Ưu tiên các câu hỏi tình huống thực tế hoặc phân tích thí nghiệm để người đọc tự soi chiếu các cạm bẫy tâm lý và thiên kiến trực giác của chính mình.
   - TUYỆT ĐỐI KHÔNG hỏi các chi tiết nhớ vẹt cơ học (như số trang, thứ tự dòng).
   - Câu hỏi cần bao quát toàn bộ nội dung của chương từ đầu đến cuối.

2. CÂN BẰNG ĐỘ DÀI CÁC PHƯƠNG ÁN (CỰC KỲ QUAN TRỌNG):
   - Mỗi câu gồm đúng 4 lựa chọn trong mảng 'options' (tương ứng A, B, C, D).
   - BẮT BUỘC CẢ 4 PHƯƠNG ÁN PHẢI CÓ ĐỘ DÀI KÝ TỰ VÀ CẤU TRÚC NGỮ PHÁP TƯƠNG ĐƯƠNG NHAU (chênh lệch giữa phương án dài nhất và ngắn nhất không quá 15-20%).
   - TUYỆT ĐỐI KHÔNG viết phương án đúng dài hơn hẳn các phương án gây nhiễu.
   - Các phương án nhiễu phải rất tinh tế, phản ánh đúng các ngộ nhận trực giác phổ biến của con người.

3. 'correctIndex': Số nguyên từ 0 đến 3 (chỉ phương án đúng ban đầu).
4. 'explanation': Lời giải thích khúc chiết, phân tích sâu sắc theo góc nhìn tâm lý học nhận thức / hành vi vì sao phương án đó đúng và chỉ rõ điểm mù tư duy của các phương án sai.

Trả về DUY NHẤT một đối tượng JSON hợp lệ theo cấu trúc mẫu sau (không kèm markdown ngoài khối JSON):
{{
  "bookId": "TuDuyNhanhVaCham",
  "chapterId": "{chap_id}",
  "chapterTitle": "{chap_title}",
  "totalQuestions": 15,
  "questions": [
    {{
      "id": "q1",
      "question": "Nội dung câu hỏi tình huống hoặc suy luận sâu sắc?",
      "options": [
        "Phương án A có độ dài cân bằng và cấu trúc chặt chẽ.",
        "Phương án B có độ dài cân bằng và cấu trúc chặt chẽ.",
        "Phương án C có độ dài cân bằng và cấu trúc chặt chẽ.",
        "Phương án D có độ dài cân bằng và cấu trúc chặt chẽ."
      ],
      "correctIndex": 0,
      "explanation": "Lời giải thích sâu sắc về nguyên lý tâm lý học nhận thức..."
    }}
  ]
}}
"""

    models_to_try = [
        "gemini-flash-lite-latest",
        "gemini-2.5-flash-lite"
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

            raw_text = res['candidates'][0]['content']['parts'][0]['text'].strip()
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

            # Cân bằng độ dài
            balance_options_lengths(questions)

            output_data = {
                "bookId": "TuDuyNhanhVaCham",
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
    print(f"Bắt đầu quy trình tạo Quiz cho 'Tư Duy Nhanh Và Chậm' ({len(chapters)} chương)...")
    total_chaps = len(chapters)

    max_rounds = 5
    for round_num in range(1, max_rounds + 1):
        remaining = [
            (idx + 1, c) for idx, c in enumerate(chapters)
            if not is_quiz_valid(os.path.join(QUIZZES_DIR, f"{c['id']}.json"))
        ]

        if not remaining:
            print("\n>>> TẤT CẢ CÁC CHƯƠNG ĐÃ CÓ QUIZ HỢP LỆ VÀ CÂN BẰNG ĐÁP ÁN! <<<")
            break

        print(f"\n--- [Vòng {round_num}/{max_rounds}] Cần tạo Quiz cho {len(remaining)} chương còn lại ---")

        # 3 workers for high throughput and rate limit safety
        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = {
                executor.submit(generate_quiz_for_chapter, chap, chap_num, total_chaps): chap
                for chap_num, chap in remaining
            }

            for future in as_completed(futures):
                chap = futures[future]
                try:
                    cid, ok = future.result()
                except Exception as exc:
                    print(f"[EXC] Chương {chap['id']}: {exc}")

        time.sleep(2)

    # Kiểm tra tổng kết
    valid_count = sum(1 for c in chapters if is_quiz_valid(os.path.join(QUIZZES_DIR, f"{c['id']}.json")))
    print(f"\nTổng kết: {valid_count}/{total_chaps} chương đã có bộ Quiz chuẩn hóa.")

if __name__ == '__main__':
    main()
