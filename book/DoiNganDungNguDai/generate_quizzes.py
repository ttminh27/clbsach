import os
import sys
import glob
import json
import time
import re
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    print("Error: GEMINI_API_KEY environment variable not set.")
    sys.exit(1)

MODELS = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-3-flash-preview"]

QUIZ_DIR = "/home/mark/working/clbsach/book/DoiNganDungNguDai/quizzes"
BOOK_DIR = "/home/mark/working/clbsach/book/DoiNganDungNguDai"

OLD_TEMPLATE_PHRASE = "luận điểm cốt lõi nào sau đây phản ánh chính xác nhất triết lý của Robin Sharma"

def is_old_mock(file_path):
    if not os.path.exists(file_path):
        return True
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            d = json.load(f)
        qs = d.get("questions", [])
        if len(qs) != 15:
            return True
        for q in qs:
            if OLD_TEMPLATE_PHRASE in q.get("question", ""):
                return True
        return False
    except Exception:
        return True

def extract_chapter_title(md_path, default_title):
    try:
        with open(md_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("# "):
                    return line[2:].strip()
    except Exception:
        pass
    return default_title

def generate_quiz_for_chapter(chapter_id, md_path, target_json_path, max_retries=6):
    with open(md_path, "r", encoding="utf-8") as f:
        md_content = f.read()

    chapter_title = extract_chapter_title(md_path, chapter_id.replace("_", " "))

    prompt = f"""Bạn là một chuyên gia khảo thí và huấn luyện tư duy sâu sắc về phát triển bản thân và nghệ thuật lãnh đạo. Dưới đây là nội dung một chương/mục trong tác phẩm "Đời ngắn đừng ngủ dài" của Robin Sharma:
===
Tên chương: {chapter_title}
Nội dung:
{md_content}
===

Hãy thiết kế bộ quiz gồm ĐÚNG 15 câu hỏi trắc nghiệm (mỗi câu 4 phương án A, B, C, D, 1 đáp án đúng) theo chuẩn JSON sau:
{{
  "bookId": "DoiNganDungNguDai",
  "chapterId": "{chapter_id}",
  "chapterTitle": "{chapter_title}",
  "totalQuestions": 15,
  "questions": [
    {{
      "id": "q1",
      "question": "Nội dung câu hỏi đòi hỏi suy luận...",
      "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
      "correctIndex": 0,
      "explanation": "Giải thích chi tiết vì sao phương án này đúng và phân tích bẫy tư duy của các phương án sai..."
    }}
  ]
}}

TIÊU CHUẨN NỘI DUNG BẮT BUỘC:
1. ĐÒI HỎI SUY LUẬN & TƯ DUY PHẢN BIỆN (Critical Thinking & Deep Reasoning):
   - Tuyệt đối KHÔNG hỏi vẹt nhớ chi tiết cơ học, không hỏi mẹo trích dẫn câu từ thuần túy.
   - Câu hỏi cần tập trung:
     * Phân tích bản chất triết lý và logic sâu xa của tác giả.
     * Liên hệ và giải quyết các tình huống thực tế (case study công sở, quản trị cá nhân, giao tiếp, kỷ luật bản thân).
     * Nhận diện các bẫy tâm lý thường gặp (vùng an toàn, ngụy biện trì hoãn, sợ phán xét, đổ lỗi ngoại cảnh).
     * Phân biệt giữa tư duy người vượt trội (vĩ đại / lãnh đạo không chức danh) và lối mòn tầm thường của số đông.
     * Nghịch lý và sự đánh đổi: tại sao những lựa chọn khó khăn ngắn hạn lại mang lại sự tự do và viên mãn dài hạn.
2. PHƯƠNG ÁN GÂY NHIỄU CHẤT LƯỢNG CAO (High-quality distractors):
   - Các phương án sai phải tinh tế, phản ánh những hiểu lầm hoặc lối tư duy sai lệch phổ biến ngoài đời thực, không tạo phương án vô lý hay lộ liễu.
3. PHÂN BỐ ĐÁP ÁN: correctIndex phải phân bố ngẫu nhiên và tương đối đồng đều giữa 0, 1, 2, 3 trong 15 câu.
4. GIẢI THÍCH (explanation): Đầy đủ, sâu sắc, chỉ rõ giá trị cốt lõi và tư duy phản biện.
5. CHỈ TRẢ VỀ ĐÚNG 1 OBJECT JSON HỢP LỆ, KHÔNG KÈM TEXT HAY MARKDOWN NÀO KHÁC."""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "thinkingConfig": {"thinkingBudget": 0}
        }
    }

    for attempt in range(max_retries):
        model = MODELS[attempt % len(MODELS)]
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"
        try:
            resp = requests.post(url, json=payload, timeout=60)
            if resp.status_code == 200:
                res_data = resp.json()
                raw_text = res_data["candidates"][0]["content"]["parts"][0]["text"]
                quiz_json = json.loads(raw_text)
                
                # Validation
                qs = quiz_json.get("questions", [])
                if len(qs) != 15:
                    raise ValueError(f"Expected 15 questions, got {len(qs)}")
                
                for idx, q in enumerate(qs):
                    q["id"] = f"q{idx+1}"
                    if len(q.get("options", [])) != 4:
                        raise ValueError(f"Question {idx+1} does not have 4 options")
                    if q.get("correctIndex") not in [0, 1, 2, 3]:
                        raise ValueError(f"Question {idx+1} has invalid correctIndex: {q.get('correctIndex')}")
                    if not q.get("explanation"):
                        raise ValueError(f"Question {idx+1} missing explanation")
                
                quiz_json["bookId"] = "DoiNganDungNguDai"
                quiz_json["chapterId"] = chapter_id
                quiz_json["chapterTitle"] = chapter_title
                quiz_json["totalQuestions"] = 15

                # Write atomically
                temp_path = target_json_path + ".tmp"
                with open(temp_path, "w", encoding="utf-8") as out_fp:
                    json.dump(quiz_json, out_fp, ensure_ascii=False, indent=2)
                os.replace(temp_path, target_json_path)
                return True, f"Successfully generated {chapter_id} via {model}"
            
            elif resp.status_code in (429, 503):
                wait_time = 4 * (attempt + 1)
                time.sleep(wait_time)
            else:
                time.sleep(2)
        except Exception as e:
            time.sleep(2 * (attempt + 1))
            if attempt == max_retries - 1:
                return False, f"Error {chapter_id}: {str(e)}"
    return False, f"Failed after {max_retries} attempts: {chapter_id}"

def run_pass():
    md_files = sorted(glob.glob(os.path.join(BOOK_DIR, "*.md")))
    tasks = []
    
    for md_path in md_files:
        base = os.path.basename(md_path)
        if base == "README.md":
            continue
        chapter_id = os.path.splitext(base)[0]
        json_path = os.path.join(QUIZ_DIR, f"{chapter_id}.json")
        if is_old_mock(json_path):
            tasks.append((chapter_id, md_path, json_path))
    
    if not tasks:
        return 0, 0

    print(f"\n--- Running pass for {len(tasks)} chapters ---")
    success_count = 0
    fail_count = 0
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        future_to_chapter = {
            executor.submit(generate_quiz_for_chapter, cid, md, jp): cid 
            for cid, md, jp in tasks
        }
        
        for future in as_completed(future_to_chapter):
            cid = future_to_chapter[future]
            try:
                success, msg = future.result()
                if success:
                    success_count += 1
                    print(f"[{success_count + fail_count}/{len(tasks)}] OK: {cid}")
                else:
                    fail_count += 1
                    print(f"[{success_count + fail_count}/{len(tasks)}] FAIL: {msg}")
            except Exception as exc:
                fail_count += 1
                print(f"[{success_count + fail_count}/{len(tasks)}] EXCEPTION {cid}: {exc}")
                
    return success_count, fail_count

def main():
    round_num = 1
    start_time = time.time()
    while True:
        print(f"=== ROUND {round_num} ===")
        success, failed = run_pass()
        if failed == 0:
            print("\nALL CHAPTERS COMPLETED SUCCESSFULLY!")
            break
        print(f"\nRound {round_num} finished: {success} succeeded, {failed} failed. Retrying in 5 seconds...")
        time.sleep(5)
        round_num += 1

    elapsed = time.time() - start_time
    print(f"\nCompleted in {elapsed:.1f}s")

if __name__ == "__main__":
    main()
