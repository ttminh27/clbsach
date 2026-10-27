import pymupdf
import re
import os

doc = pymupdf.open('repaired.pdf')

def normalize_text(text):
    # remove markdown formatting
    text = re.sub(r'#+\s*', '', text)
    text = re.sub(r'\!\[.*?\]\(.*?\)', '', text)
    text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', text)
    text = re.sub(r'[*_`>~-]', ' ', text)
    # normalize spaces and punctuation
    text = re.sub(r'[^\w\s]', ' ', text, flags=re.UNICODE)
    words = [w.lower() for w in text.split() if w.strip()]
    return words

chapters_config = [
    {
        'file': '00-loi-cam-ta.md',
        'start': 5, 'end': 6,
        'title': 'Lời cảm tạ'
    },
    {
        'file': '00-loi-gioi-thieu.md',
        'start': 7, 'end': 8,
        'title': 'Lời giới thiệu'
    },
    {
        'file': '00-loi-noi-dau.md',
        'start': 9, 'end': 12,
        'title': 'Lời nói đầu'
    },
    {
        'file': 'chuong-01-chat-van-doi-voi-y-hoc-hien-dai.md',
        'start': 17, 'end': 28,
        'title': 'Chương 1'
    },
    {
        'file': 'chuong-02-he-thong-co-the-nguoi.md',
        'start': 29, 'end': 74,
        'title': 'Chương 2'
    },
    {
        'file': 'chuong-03-he-thong-nang-luong-khi-huyet-cua-co-the-nguoi.md',
        'start': 75, 'end': 94,
        'title': 'Chương 3'
    },
    {
        'file': 'chuong-04-han-khi.md',
        'start': 95, 'end': 111,
        'title': 'Chương 4'
    },
    {
        'file': 'chuong-05-benh-va-chung.md',
        'start': 112, 'end': 117,
        'title': 'Chương 5'
    },
    {
        'file': 'chuong-06-duong-sinh-hang-ngay.md',
        'start': 118, 'end': 145,
        'title': 'Chương 6'
    },
    {
        'file': 'chuong-07-giam-beo.md',
        'start': 146, 'end': 165,
        'title': 'Chương 7'
    },
    {
        'file': 'chuong-08-dieu-duong-benh-man-tinh.md',
        'start': 166, 'end': 223,
        'title': 'Chương 8'
    },
    {
        'file': 'chuong-09-tong-ket.md',
        'start': 224, 'end': 231,
        'title': 'Chương 9'
    },
    {
        'file': 'phu-luc-phong-van-va-trao-doi-cung-tac-gia.md',
        'start': 232, 'end': 247,
        'title': 'Phụ lục'
    },
    {
        'file': 'loi-cuoi-sach.md',
        'start': 248, 'end': 251,
        'title': 'Lời cuối sách'
    }
]

print(f"{'Tệp Markdown':<45} | {'Từ PDF (gốc)':<15} | {'Từ MD':<10} | {'Tỷ lệ':<8}")
print("-" * 85)

total_pdf_words = 0
total_md_words = 0

for cfg in chapters_config:
    fn = cfg['file']
    s = cfg['start']
    e = cfg['end']
    
    # Extract text from PDF for pages s..e (excluding running headers/footers)
    pdf_text_parts = []
    for p in range(s - 1, e):
        page = doc[p]
        d = page.get_text('dict')
        for b in d['blocks']:
            if 'lines' not in b:
                continue
            for l in b['lines']:
                y0 = l['bbox'][1]
                txt = ''.join(sp['text'] for sp in l['spans']).strip()
                if not txt:
                    continue
                # Exclude footer / running header
                if y0 > 628:
                    continue
                if txt in ['“Sách hướng dẫn sử dụng cơ thể người”', 'Sách hướng dẫn sử dụng cơ thể người']:
                    continue
                if re.match(r'^\d+$', txt):
                    continue
                pdf_text_parts.append(txt)
                
    pdf_text = ' '.join(pdf_text_parts)
    pdf_words = normalize_text(pdf_text)
    
    with open(fn, 'r', encoding='utf-8') as f:
        md_text = f.read()
    md_words = normalize_text(md_text)
    
    ratio = len(md_words) / len(pdf_words) * 100 if pdf_words else 0
    print(f"{fn:<45} | {len(pdf_words):<15} | {len(md_words):<10} | {ratio:.1f}%")
    
    total_pdf_words += len(pdf_words)
    total_md_words += len(md_words)

print("-" * 85)
total_ratio = total_md_words / total_pdf_words * 100 if total_pdf_words else 0
print(f"{'TỔNG CỘNG':<45} | {total_pdf_words:<15} | {total_md_words:<10} | {total_ratio:.1f}%")
