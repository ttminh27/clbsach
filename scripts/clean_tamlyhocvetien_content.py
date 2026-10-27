#!/usr/bin/env python3
"""
scripts/clean_tamlyhocvetien_content.py

Hiệu đính toàn bộ các lỗi OCR trong tác phẩm "Tâm Lý Học Về Tiền" (The Psychology of Money).
Sử dụng các model flash-lite có quota dồi dào.
"""

import os
import re
import json
import glob
import time
import urllib.request
import urllib.error

API_KEY = os.environ.get('GEMINI_API_KEY')
if not API_KEY:
    raise ValueError("Missing GEMINI_API_KEY environment variable")

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK_DIR = os.path.join(ROOT_DIR, 'book', 'TamLyHocVeTien')

SUSPICIOUS_REGEX = re.compile(
    r'\b(uề|uào|uới|uài|uiệc|uiên|uì|uiết|uiễn|uực|uẻ|ué|uã|uồ|uội|uừa|uị|uờng|uời|uùng|uú|uụ|suu nghĩ|Hết kiệm|Hền|xa ười|kỹ ní|Haroard|Broadtuay|Germannsku|VWVal|Catch -— 22|dé la|tý đô)\b|'
    r'\[\s*nhíưng người\s*\]|\bñt\b|\bñ\b',
    re.IGNORECASE
)

MODELS = [
    "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite"
]

def fix_batch_gemini(items):
    input_list = []
    for idx, text in items:
        input_list.append({"id": idx, "text": text})

    prompt = f"""Dưới đây là danh sách các đoạn văn trích từ sách 'Tâm Lý Học Về Tiền' (The Psychology of Money - Morgan Housel, bản dịch tiếng Việt của Hoàng Thị Minh Phúc).
Do quét OCR từ trang in chữ nghiêng / trích dẫn nên dính lỗi ký tự (như uề -> về, uào -> vào, uới -> với, uài -> vài, uiệc -> việc, uì -> vì, bà -> và, Hết kiệm -> tiết kiệm, Haroard -> Harvard, Broadtuay -> Broadway, ...).

HÃY HIỆU ĐÍNH LẠI CHÍNH XÁC TẤT CẢ CÁC LỖI OCR NÀY.
Yêu cầu:
- Trả về DUY NHẤT một mảng JSON các đối tượng có dạng: [{{"id": 0, "fixed_text": "..."}}]
- Không làm thay đổi ý nghĩa, không lược bỏ thông tin, giữ nguyên định dạng Markdown (như >, gạch đầu dòng, liên kết nếu có).
- Không thêm bất kỳ văn bản giải thích nào ngoài khối JSON.

Dữ liệu đầu vào:
{json.dumps(input_list, ensure_ascii=False, indent=2)}"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json"
        }
    }

    for attempt in range(6):
        model_name = MODELS[attempt % len(MODELS)]
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={API_KEY}"
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        try:
            with urllib.request.urlopen(req, timeout=45) as resp:
                res = json.loads(resp.read().decode('utf-8'))
                raw_json = res['candidates'][0]['content']['parts'][0]['text'].strip()
                parsed = json.loads(raw_json)
                if isinstance(parsed, dict):
                    for v in parsed.values():
                        if isinstance(v, list):
                            parsed = v
                            break
                res_dict = {}
                if isinstance(parsed, list):
                    for entry in parsed:
                        if isinstance(entry, dict):
                            _id = entry.get('id')
                            txt = entry.get('fixed_text') or entry.get('fixedText') or entry.get('text') or entry.get('corrected_text')
                            if _id is not None and txt:
                                res_dict[int(_id)] = txt
                if res_dict:
                    return res_dict
                print(f"[{model_name}] Warning: parsed JSON empty, retrying...")
        except urllib.error.HTTPError as e:
            wait_time = (attempt + 1) * 5
            print(f"[{model_name} HTTP {e.code}] Retrying in {wait_time}s...")
            time.sleep(wait_time)
        except Exception as e:
            wait_time = (attempt + 1) * 3
            print(f"[{model_name} ERR {e}] Retrying in {wait_time}s...")
            time.sleep(wait_time)

    return {idx: text for idx, text in items}

def process_all_files():
    files = sorted(glob.glob(os.path.join(BOOK_DIR, '*.md')))
    
    all_suspicious_items = []
    file_paragraphs = {}
    for fpath in files:
        if fpath.endswith('README.md'): continue
        with open(fpath, 'r', encoding='utf-8') as fp:
            paras = fp.read().split('\n\n')
        file_paragraphs[fpath] = paras
        for p_idx, p in enumerate(paras):
            if SUSPICIOUS_REGEX.search(p):
                all_suspicious_items.append((fpath, p_idx, p))

    print(f"Total suspicious paragraphs found across all files: {len(all_suspicious_items)}")
    if not all_suspicious_items:
        print("No suspicious paragraphs found!")
        return

    BATCH_SIZE = 6
    fixed_results = {}

    for i in range(0, len(all_suspicious_items), BATCH_SIZE):
        batch = all_suspicious_items[i:i + BATCH_SIZE]
        batch_input = [(idx, item[2]) for idx, item in enumerate(batch)]
        print(f"Processing batch {i // BATCH_SIZE + 1}/{(len(all_suspicious_items) + BATCH_SIZE - 1) // BATCH_SIZE} ({len(batch)} items)...")
        
        batch_fixed = fix_batch_gemini(batch_input)
        for idx, fixed_text in batch_fixed.items():
            if idx < len(batch):
                fpath, p_idx, orig = batch[idx]
                fixed_results[(fpath, p_idx)] = fixed_text
                print(f"  [OK] {os.path.basename(fpath)} p#{p_idx}: {orig[:40]}... -> {fixed_text[:40]}...")

        time.sleep(2)

    updated_files = 0
    for fpath, paras in file_paragraphs.items():
        file_changed = False
        new_paras = []
        for p_idx, p in enumerate(paras):
            if (fpath, p_idx) in fixed_results:
                fixed_text = fixed_results[(fpath, p_idx)]
                new_paras.append(fixed_text)
                file_changed = True
            else:
                new_paras.append(p)
        
        if file_changed:
            content = '\n\n'.join(new_paras)
            content = content.replace(' ,', ',').replace(' .', '.').replace(', .', ',')
            with open(fpath, 'w', encoding='utf-8') as fp:
                fp.write(content)
            updated_files += 1

    print(f"\n Finished! Updated {updated_files} files.")

if __name__ == '__main__':
    process_all_files()
