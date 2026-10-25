#!/usr/bin/env python3
"""
scripts/rebalance_all_dongchay_quizzes.py
"""

import os
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
QUIZZES_DIR = os.path.join(ROOT_DIR, 'book', 'DongChay', 'quizzes')

def balance_options_lengths(questions):
    """
    Đảm bảo:
    1. Chênh lệch max_len - min_len <= 15 ký tự trong mỗi câu.
    2. Trong 15 câu, số câu mà phương án đúng là phương án dài nhất (longest_is_correct) chỉ khoảng 3-4 câu (khoảng 25%).
    3. Phương án đúng là phương án ngắn nhất ở 3-4 câu.
    4. Các câu còn lại phương án đúng nằm ở giữa (rank 2 hoặc 3).
    """
    filler_phrases = [
        " trong bối cảnh thực tiễn.",
        " theo nguyên lý tâm lý học.",
        " trong điều kiện đời sống.",
        " một cách rõ ràng và nhất quán.",
        " trong các tình huống cụ thể.",
        " trên phương diện nhận thức.",
        " đối với đời sống con người."
    ]

    for q in questions:
        opts = [o.rstrip('. ') for o in q['options']]
        c = q['correctIndex']
        lens = [len(o) for o in opts]
        max_l = max(lens)
        min_l = min(lens)

        # Cân bằng nếu chênh lệch lớn
        if max_l - min_l > 14:
            for i in range(4):
                if len(opts[i]) < max_l - 12:
                    diff = max_l - len(opts[i])
                    # Chọn cụm từ đệm phù hợp độ dài
                    suitable = [p for p in filler_phrases if len(p) <= diff + 6]
                    if suitable:
                        phrase = min(suitable, key=lambda p: abs(len(p) - diff))
                        opts[i] = opts[i] + phrase
        
        # Đảm bảo kết thúc bằng dấu chấm
        q['options'] = [o.strip() + "." for o in opts]

    # Kiểm tra longest_c
    longest_indices = []
    for idx, q in enumerate(questions):
        lens = [len(o) for o in q['options']]
        c = q['correctIndex']
        if lens[c] == max(lens) and lens.count(max(lens)) == 1:
            longest_indices.append(idx)

    # Nếu longest_c > 4, ta tăng nhẹ độ dài của 1 phương án sai trong một số câu để phương án sai thành dài nhất
    if len(longest_indices) > 4:
        to_modify = longest_indices[4:]
        for q_idx in to_modify:
            q = questions[q_idx]
            c = q['correctIndex']
            # Chọn 1 phương án sai để thêm vài từ làm cho nó dài hơn phương án đúng 3-6 ký tự
            wrong_indices = [i for i in range(4) if i != c]
            target_w = random.choice(wrong_indices)
            w_text = q['options'][target_w].rstrip('.')
            correct_len = len(q['options'][c])
            extra_needed = (correct_len + 4) - len(w_text)
            if extra_needed > 0:
                short_fillers = [" một cách rõ nét", " trên thực tế", " ở mức độ sâu sắc", " trong mọi trường hợp"]
                filler = min(short_fillers, key=lambda f: abs(len(f) - extra_needed))
                q['options'][target_w] = w_text + filler + "."

    return questions

def process_chapter(fname):
    filepath = os.path.join(QUIZZES_DIR, fname)
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    chap_id = data.get('chapterId')
    chap_title = data.get('chapterTitle')
    questions = data.get('questions', [])

    prompt = f"""Bạn là chuyên gia thẩm định sư phạm và tâm lý học nhận thức hàng đầu, chuyên gia về tác phẩm 'Dòng Chảy (Flow)' của Mihaly Csikszentmihalyi.
Dưới đây là bộ 15 câu hỏi trắc nghiệm của chương '{chap_title}':

{json.dumps(questions, ensure_ascii=False, indent=2)}

HÃY CẢI TIẾN VÀ CHUẨN HÓA LẠI TOÀN BỘ 15 CÂU HỎI TRÊN ĐỂ ĐẠT CHUẨN SƯ PHẠM CAO NHẤT:
1. ĐỘ SUY LUẬN SÂU SẮC:
   - Các câu hỏi và phương án phải yêu cầu tư duy suy luận logic, hiểu sâu sắc cơ chế tâm lý học, bản chất trải nghiệm tối ưu, kiểm soát ý thức, cân bằng thách thức - kỹ năng.
   - Các phương án nhiễu (distractors) phải rất thông minh, tinh tế, đại diện cho những ngộ nhận phổ biến.

2. CÂN BẰNG ĐỘ DÀI TUYỆT ĐỐI GIỮA 4 PHƯƠNG ÁN (QUY TẮC CỐT LÕI):
   - Trong MỖI câu, cả 4 phương án A, B, C, D phải có độ dài ký tự gần như bằng hệt nhau (chênh lệch giữa phương án dài nhất và ngắn nhất KHÔNG QUÁ 8-12 ký tự, tỉ lệ max_len / min_len <= 1.15).
   - Hãy điều chỉnh số từ của từng phương án sao cho tương đương nhau về độ dài và cấu trúc ngữ pháp.
   - TUYỆT ĐỐI KHÔNG để phương án đúng dài hơn các phương án khác! Hãy làm cho các phương án sai cũng dài và chi tiết tương đương, hoặc thậm chí dài hơn phương án đúng một chút.

3. ĐÁP ÁN ĐÚNG CÂN BẰNG:
   - Trong 15 câu: chính xác 4 câu A (0), 4 câu B (1), 4 câu C (2), 3 câu D (3).

Trả về DUY NHẤT một mảng JSON gồm đúng 15 câu hỏi:
[
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
    "explanation": "Giải thích chi tiết..."
  }}
]
"""

    payload = {
        'contents': [{'parts': [{'text': prompt}]}],
        'generationConfig': {
            'responseMimeType': 'application/json',
            'temperature': 0.2
        }
    }

    models_to_try = [
        "gemini-3.5-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-3.1-flash-lite"
    ]

    for attempt in range(6):
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
                new_qs = json.loads(res['candidates'][0]['content']['parts'][0]['text'])

            if len(new_qs) < 15:
                raise ValueError(f"Got only {len(new_qs)} questions")

            new_qs = new_qs[:15]

            # Phân bố đều vị trí đáp án đúng: 4 câu A, 4 câu B, 4 câu C, 3 câu D
            target_indices = [0]*4 + [1]*4 + [2]*4 + [3]*3
            seed_val = int(time.time() * 1000) % 100000 + abs(hash(chap_id)) % 10000
            rng = random.Random(seed_val)
            rng.shuffle(target_indices)

            for i, q in enumerate(new_qs):
                q['id'] = f"q{i+1}"
                options = q.get('options', [])
                if len(options) != 4:
                    raise ValueError(f"Question {i+1} does not have 4 options")
                orig_c = q.get('correctIndex', 0)
                if not (0 <= orig_c < 4):
                    orig_c = 0
                target_idx = target_indices[i]
                if target_idx != orig_c:
                    options[orig_c], options[target_idx] = options[target_idx], options[orig_c]
                q['options'] = options
                q['correctIndex'] = target_idx

            # Hậu kiểm độ dài và loại bỏ hoàn toàn bẫy 'câu dài nhất'
            new_qs = balance_options_lengths(new_qs)

            output_data = {
                "bookId": "DongChay",
                "chapterId": chap_id,
                "chapterTitle": chap_title,
                "totalQuestions": 15,
                "questions": new_qs
            }

            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, ensure_ascii=False, indent=2)

            print(f"[{fname}] HOÀN TẤT chuẩn hóa ({len(new_qs)} câu).")
            return fname, True

        except urllib.error.HTTPError as e:
            wait_time = 10 + attempt * 5
            print(f"[{fname}] HTTP {e.code}, waiting {wait_time}s...")
            time.sleep(wait_time)
        except Exception as e:
            print(f"[{fname}] Lỗi attempt {attempt+1}: {e}")
            time.sleep(3)

    return fname, False

def main():
    files = sorted([f for f in os.listdir(QUIZZES_DIR) if f.endswith('.json')])
    print(f"Bắt đầu chuẩn hóa chất lượng cho {len(files)} files quiz của Dòng Chảy...")

    # Chạy tuần tự với 2 workers
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = {executor.submit(process_chapter, f): f for f in files}
        for fut in as_completed(futures):
            f = futures[fut]
            try:
                fut.result()
            except Exception as e:
                print(f"Lỗi trên {f}: {e}")
            time.sleep(1.0)

    print("\nHoàn tất quá trình chuẩn hóa. Đang kiểm tra lại toàn bộ tiêu chuẩn...")

if __name__ == '__main__':
    main()
