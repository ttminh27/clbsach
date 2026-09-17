import os
import json
import random
import urllib.request
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

API_KEY = os.environ.get('GEMINI_API_KEY')
if not API_KEY:
    raise ValueError("Missing GEMINI_API_KEY")

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK_DIR = os.path.join(ROOT_DIR, 'book', '18phut')
QUIZZES_DIR = os.path.join(BOOK_DIR, 'quizzes')
os.makedirs(QUIZZES_DIR, exist_ok=True)

MANIFEST_PATH = os.path.join(ROOT_DIR, 'src', 'data', 'books-manifest.json')
with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
    manifest = json.load(f)

book_meta = next(b for b in manifest if b['id'] == '18phut')
chapters = book_meta['chapters']

print(f"Loaded {len(chapters)} chapters for 18phut.")

def generate_quiz_for_chapter(chapter):
    chap_id = chapter['id']
    chap_title = chapter['title']
    target_file = os.path.join(QUIZZES_DIR, f"{chap_id}.json")

    # Check if already exists and valid
    if os.path.exists(target_file):
        try:
            with open(target_file, 'r', encoding='utf-8') as f:
                existing = json.load(f)
            if existing.get('totalQuestions', 0) >= 15 and len(existing.get('questions', [])) >= 15:
                print(f"[SKIP] {chap_id} already has complete quiz.")
                return chap_id, True
        except Exception:
            pass

    md_path = os.path.join(BOOK_DIR, f"{chap_id}.md")
    if not os.path.exists(md_path):
        print(f"[ERR] File not found: {md_path}")
        return chap_id, False

    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    prompt = f"""Bạn là chuyên gia thẩm định sư phạm và thiết kế câu hỏi trắc nghiệm phát triển tư duy.
Hãy đọc kỹ nội dung chương sách sau đây từ tác phẩm '18 Phút' của Peter Bregman:

Tiêu đề chương: {chap_title}
Nội dung:
\"\"\"
{content}
\"\"\"

YÊU CẦU THIẾT KẾ BỘ QUIZ (ĐÚNG 15 CÂU HỎI TRẮC NGHIỆM ĐÒI HỎI SUY LUẬN):
1. ĐÒI HỎI SUY LUẬN: Câu hỏi phải đi sâu vào bản chất tư duy, nghịch lý tâm lý, giải pháp thực chiến, tình huống ứng dụng thực tế hoặc phân tích nguyên nhân - kết quả mà tác giả gửi gắm. TUYỆT ĐỐI KHÔNG hỏi nhớ vẹt các chi tiết máy móc (như số trang, ngày tháng vu vơ).
2. ĐỘ DÀI CÁC PHƯƠNG ÁN PHẢI TƯƠNG ĐỒNG: Mỗi câu hỏi gồm đúng 4 lựa chọn (A, B, C, D) trong mảng 'options'. Cả 4 phương án PHẢI CÓ ĐỘ DÀI VÀ CẤU TRÚC NGỮ PHÁP TƯƠNG ĐƯƠNG NHAU (chênh lệch số từ hoặc ký tự giữa phương án ngắn nhất và dài nhất không quá 20%). Các phương án nhiễu phải hợp lý, thông minh và có tính thuyết phục cao để người đọc không thể đoán mò bằng độ dài.
3. 'correctIndex': Chỉ số số nguyên (0, 1, 2, hoặc 3) trỏ tới phương án đúng.
4. 'explanation': Giải thích khúc chiết, phân tích rõ vì sao phương án đúng là chính xác nhất theo thông điệp của tác giả và chỉ ra góc nhìn chưa chuẩn của các phương án sai.

Trả về DUY NHẤT một đối tượng JSON hợp lệ theo cấu trúc:
{{
  "bookId": "18phut",
  "chapterId": "{chap_id}",
  "chapterTitle": "{chap_title}",
  "totalQuestions": 15,
  "questions": [
    {{
      "id": "q1",
      "question": "Nội dung câu hỏi...",
      "options": ["Lựa chọn A...", "Lựa chọn B...", "Lựa chọn C...", "Lựa chọn D..."],
      "correctIndex": 0,
      "explanation": "Giải thích chi tiết..."
    }}
  ]
}}
"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"
    payload = {
        'contents': [{'parts': [{'text': prompt}]}],
        'generationConfig': {
            'responseMimeType': 'application/json',
            'temperature': 0.3
        }
    }

    max_retries = 6
    for attempt in range(max_retries):
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

            # Evenly distribute correct answers across A (0), B (1), C (2), D (3)
            # For 15 questions: [4, 4, 4, 3] shuffled
            target_indices = [0]*4 + [1]*4 + [2]*4 + [3]*3
            random.seed(int(time.time() * 1000) % 100000 + hash(chap_id) % 10000)
            random.shuffle(target_indices)

            for i, q in enumerate(questions):
                q['id'] = f"q{i+1}"
                options = q.get('options', [])
                correct_idx = q.get('correctIndex', 0)
                if not (0 <= correct_idx < len(options)):
                    correct_idx = 0

                correct_option_text = options[correct_idx]
                target_idx = target_indices[i]

                # Swap correct option into target_idx
                if target_idx != correct_idx:
                    options[correct_idx], options[target_idx] = options[target_idx], options[correct_idx]

                q['options'] = options
                q['correctIndex'] = target_idx

            output_data = {
                "bookId": "18phut",
                "chapterId": chap_id,
                "chapterTitle": chap_title,
                "totalQuestions": 15,
                "questions": questions
            }

            with open(target_file, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, ensure_ascii=False, indent=2)

            print(f"[OK] {chap_id} ({len(questions)} questions) generated successfully.")
            return chap_id, True
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait_time = 15 + attempt * 10
                print(f"[RATE_LIMIT 429] {chap_id}, waiting {wait_time}s before retry (attempt {attempt+1}/{max_retries})...")
                time.sleep(wait_time)
            else:
                print(f"[WARN] HTTP {e.code} for {chap_id}: {e}")
                time.sleep(3 * (attempt + 1))
        except Exception as e:
            print(f"[WARN] Attempt {attempt+1} failed for {chap_id}: {e}")
            time.sleep(3 * (attempt + 1))

    print(f"[FAIL] Could not generate quiz for {chap_id}")
    return chap_id, False

def main():
    print(f"Starting quiz generation for {len(chapters)} chapters...")
    
    # Process with rate pacing (2 workers with sleep between requests)
    while True:
        remaining = []
        for c in chapters:
            target_file = os.path.join(QUIZZES_DIR, f"{c['id']}.json")
            if not os.path.exists(target_file):
                remaining.append(c)
            else:
                try:
                    with open(target_file, 'r', encoding='utf-8') as f:
                        d = json.load(f)
                    if len(d.get('questions', [])) < 15:
                        remaining.append(c)
                except Exception:
                    remaining.append(c)

        if not remaining:
            print("[SUCCESS] All chapters have complete quizzes!")
            break

        print(f"--- Remaining chapters to process: {len(remaining)} ---")
        for c in remaining:
            generate_quiz_for_chapter(c)
            # Sleep 4.5 seconds to stay under 15 RPM limit safely
            time.sleep(4.5)

    print("=" * 50)
    print("Done! Validating all generated quizzes...")

if __name__ == '__main__':
    main()
