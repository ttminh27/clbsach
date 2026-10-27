#!/usr/bin/env python3
"""
scripts/generate_phuongphaphoctapkhonggioihan_quizzes.py

Tạo bộ câu hỏi trắc nghiệm (quiz) chất lượng cao gồm 15 câu suy luận và tình huống thực tế
cho các chương trong tác phẩm "Phương Pháp Học Tập Không Giới Hạn" (Limitless) của Jim Kwik:
- Bắt buộc phân bố đều vị trí đáp án đúng (A, B, C, D): 4, 4, 4, 3.
- Độ dài các phương án A, B, C, D cân bằng, không chênh lệch quá 20%.
- Câu hỏi đòi hỏi tư duy, suy luận sâu sắc về Mô hình Khai phóng 3M (Tâm thế - Động lực - Phương pháp),
  phương pháp FASTER, 4 kẻ phản diện kỹ thuật số, 7 lời nói dối về học tập, 10 siêu thực phẩm bổ não,
  công thức tạo động lực S3, trạng thái tuôn chảy (Flow), 5 siêu kỹ năng học tập (Tập trung, Học tập,
  Ghi nhớ, Đọc nhanh, Tư duy 6 chiếc mũ), và Kế hoạch 10 ngày khởi động.
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
BOOK_DIR = os.path.join(ROOT_DIR, 'book', 'PhuongPhapHocTapKhongGioiHan')
QUIZZES_DIR = os.path.join(BOOK_DIR, 'quizzes')
os.makedirs(QUIZZES_DIR, exist_ok=True)

MANIFEST_PATH = os.path.join(ROOT_DIR, 'src', 'data', 'books-manifest.json')
with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
    manifest = json.load(f)

book_meta = next(b for b in manifest if b['id'] == 'PhuongPhapHocTapKhongGioiHan')
chapters = book_meta['chapters']

# Danh sách các chương cần tạo Quiz (chương nội dung thực chất)
TARGET_CHAPTER_IDS = {
    "02_Loi_tua",
    "03_Loi_gioi_thieu",
    "05_Chuong_01_Tro_thanh_con_nguoi_khai_phong",
    "06_Chuong_02_Bay_gio_chinh_la_thoi_diem_quan_trong_nhat",
    "07_Chuong_03_Bo_nao_khong_gioi_han_cua_ban",
    "08_Chuong_04_Phuong_phap_de_doc_va_ghi_nho_quyen_sach_nay_va_bat_cu_quyen_nao_khac",
    "09_Phan_2_Tam_the_khai_phong",
    "10_Chuong_05_Phep_thuat_cua_he_thong_niem_tin",
    "11_Chuong_06_7_loi_noi_doi_ve_viec_hoc_hoi",
    "12_Phan_3_Dong_luc_khai_phong",
    "13_Chuong_07_Muc_dich",
    "14_Chuong_08_Nang_luong",
    "15_Chuong_09_Nhung_buoc_nho_don_gian",
    "16_Chuong_10_Tuon_chay",
    "17_Phan_4_Phuong_phap_khai_phong_the_nao",
    "18_Chuong_11_Tap_trung",
    "19_Chuong_12_Hoc_tap",
    "20_Chuong_13_Ghi_nho",
    "21_Chuong_14_Doc_nhanh",
    "22_Chuong_15_Tu_duy",
    "23_Loi_ket_Quay_lai_giup_do_nguoi_khac",
    "24_Ke_hoach_hanh_dong_10_ngay_khoi_dong_cung_Kwik"
}

print(f"Loaded {len(chapters)} chapters for PhuongPhapHocTapKhongGioiHan. Target quiz chapters: {len(TARGET_CHAPTER_IDS)}.")

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
        " theo nguyên lý của Jim Kwik.",
        " trong cuộc sống hàng ngày.",
        " một cách bền vững và hiệu quả.",
        " đối với tiềm năng não bộ.",
        " nhằm nâng cao năng suất trí óc.",
        " để đạt trạng thái tối ưu."
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

    if chap_id not in TARGET_CHAPTER_IDS:
        print(f"[{chap_num}/{total_chaps}] [SKIP_NON_TARGET] {chap_id} does not require a quiz.")
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

    prompt = f"""Bạn là một chuyên gia hàng đầu về khoa học thần kinh nhận thức, phương pháp học tăng tốc (Accelerated Learning) và huấn luyện não bộ đỉnh cao, am tường sâu sắc triết lý của Jim Kwik trong kiệt tác 'Phương Pháp Học Tập Không Giới Hạn' (Limitless).
Hãy đọc kỹ nội dung chương sách sau đây:

Tiêu đề chương: {chap_title}
Nội dung chương:
\"\"\"
{content_sample}
\"\"\"

HÃY THIẾT KẾ ĐÚNG 15 CÂU HỎI TRẮC NGHIỆM ĐÒI HỎI SUY LUẬN, THẤU HIỂU BẢN CHẤT VÀ ỨNG DỤNG THỰC TẾ:
1. YÊU CẦU NỘI DUNG (TƯ DUY & BẢN CHẤT):
   - Đào sâu các tư tưởng và bài học cốt lõi của Jim Kwik được trình bày trong chương:
     + Mô hình Khai phóng 3M (Limitless Model): Tâm thế (Mindset - Điều gì), Động lực (Motivation - Vì sao), Phương pháp (Method - Thế nào). Sự giao thoa tạo nên: Cảm hứng (Tâm thế + Động lực), Ý niệm (Tâm thế + Phương pháp), Triển khai (Động lực + Phương pháp) và Khai phóng đỉnh cao (Giao thoa 3 vòng tròn).
     + 4 Kẻ phản diện thời đại kỹ thuật số: Ngập lụt kỹ thuật số (Digital Deluge), Xao nhãng kỹ thuật số (Digital Distraction), Mất trí nhớ kỹ thuật số (Digital Dementia), Thui chột suy nghĩ kỹ thuật số (Digital Deduction).
     + Tính khả biến thần kinh (Neuroplasticity) và sự phát triển tế bào thần kinh mới (Neurogenesis); Trục Não - Ruột (Brain-Gut Axis) và chất dẫn truyền thần kinh.
     + Phương pháp FASTER: Forget (Quên định kiến/xao nhãng), Act (Học chủ động), State (Kiểm soát trạng thái), Teach (Dạy lại cho người khác), Enter (Đưa vào lịch trình), Review (Ôn tập ngắt quãng).
     + Phá vỡ 7 LỜI NÓI DỐI (LIEs - Limited Ideas Entertained): IQ là cố định, Chỉ dùng 10% não, Sai lầm là thất bại, Kiến thức là sức mạnh, Học cái mới rất khó, Sự phê phán của người khác là quan trọng, Thiên bẩm sinh ra đã có.
     + Động lực = Mục đích x Năng lượng x Bước nhỏ đơn giản (S3).
     + 10 Yếu tố tối ưu hóa não bộ: Thực phẩm bổ não, Tiêu diệt ANTs (Suy nghĩ tiêu cực tự động), Tập thể dục, Dinh dưỡng bổ sung, Nhóm đồng hành tích cực, Môi trường sạch sẽ, Giấc ngủ sâu, Bảo vệ não bộ, Học kiến thức mới, Quản lý căng thẳng.
     + Trạng thái Tuôn chảy (Flow State): 4 giai đoạn (Đấu tranh, Thư giãn, Tuôn chảy, Phục hồi), 5 tác nhân kích hoạt flow, loại bỏ các yếu tố cản trở.
     + 5 Siêu kỹ năng: Tập trung (Focus/Dọn dẹp tâm trí), Học tập (Hiệu ứng Primacy & Recency, Ghi chú Capture & Create), Ghi nhớ (MOM: Motivation, Observation, Mechanics; Cung điện ký ức Loci; Phương pháp liên tưởng), Đọc nhanh (Giảm phát âm thầm, Dùng vật dẫn đường thị giác thị giác), Tư duy (6 chiếc mũ tư duy của Edward de Bono, Tư duy cấp số nhân).
     + Kế hoạch hành động 10 ngày Kwik Start và triết lý phụng sự, chia sẻ lại cho cộng đồng.
   - TUYỆT ĐỐI KHÔNG hỏi các chi tiết cơ học nhớ vẹt (như số trang, thứ tự dòng chữ).
   - Đảm bảo câu hỏi có tính thực chiến cao, tình huống giả định phân tích rõ sự khác biệt giữa thói quen thụ động và phương pháp học không giới hạn.

2. CÂN BẰNG ĐỘ DÀI CÁC PHƯƠNG ÁN (CỰC KỲ QUAN TRỌNG):
   - Mỗi câu gồm đúng 4 lựa chọn trong mảng 'options' (A, B, C, D).
   - BẮT BUỘC CẢ 4 PHƯƠNG ÁN PHẢI CÓ ĐỘ DÀI KÝ TỰ VÀ CẤU TRÚC NGỮ PHÁP TƯƠNG ĐƯƠNG NHAU (chênh lệch giữa phương án dài nhất và ngắn nhất không quá 15-20%).
   - TUYỆT ĐỐI KHÔNG viết phương án đúng dài hơn hẳn các phương án gây nhiễu.
   - Các phương án nhiễu phải rất tinh tế, hợp lý, bóc trần những lầm tưởng phổ biến trong phương pháp học tập và rèn luyện trí nhớ.

3. 'correctIndex': Số nguyên từ 0 đến 3 (chỉ phương án đúng ban đầu).
4. 'explanation': Lời giải thích sâu sắc, trích dẫn hoặc phân tích rõ triết lý của Jim Kwik vì sao lựa chọn này là đúng, đồng thời chỉ ra điểm chưa chuẩn của các phương án còn lại.

Trả về DUY NHẤT một đối tượng JSON hợp lệ theo cấu trúc sau (không kèm markdown ngoài khối JSON):
{{
  "bookId": "PhuongPhapHocTapKhongGioiHan",
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
      "explanation": "Giải thích chi tiết theo tư tưởng của Jim Kwik..."
    }}
  ]
}}
"""

    models_to_try = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
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
                "bookId": "PhuongPhapHocTapKhongGioiHan",
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
    target_chapters = [c for c in chapters if c['id'] in TARGET_CHAPTER_IDS]
    print(f"Bắt đầu quy trình tạo Quiz cho 'Phương Pháp Học Tập Không Giới Hạn' ({len(target_chapters)} chương)...")
    
    # Dùng đa luồng (3 workers) để tăng tốc độ xử lý mà vẫn kiểm soát rate limit
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(generate_quiz_for_chapter, chap, idx + 1, len(target_chapters)): chap
            for idx, chap in enumerate(target_chapters)
        }
        success_count = 0
        for future in as_completed(futures):
            chap = futures[future]
            try:
                cid, ok = future.result()
                if ok:
                    success_count += 1
            except Exception as exc:
                print(f"[EXC] Chương {chap['id']} generated an exception: {exc}")

    print(f"\n Hoàn tất tạo Quiz: {success_count}/{len(target_chapters)} chương thành công.")

if __name__ == '__main__':
    main()
