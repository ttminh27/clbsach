import fitz
import re
import unicodedata
from convert_to_markdown import decode_avn, is_header_or_footer

doc = fitz.open('raw/7ThoiQuenDeThanhDat.pdf')

sections = [
    ('00_loi_gioi_thieu_va_loi_tac_gia.md', 5, 13),
    ('01_chuong_1_nhung_khai_niem_tong_quan.md', 14, 95),
    ('02_chuong_2_thanh_tich_ca_nhan.md', 96, 269),
    ('03_chuong_3_thanh_tich_tap_the.md', 270, 415),
    ('04_chuong_4_doi_moi.md', 416, 455),
    ('05_thay_loi_ket_va_phu_luc.md', 456, 481),
]

def clean_for_comparison(text):
    text = re.sub(r'!\[.*?\]\(.*?\)', ' ', text)
    text = re.sub(r'#+\s*', ' ', text)
    text = re.sub(r'[*_`>~]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

total_pdf_words = 0
total_md_words = 0
total_pdf_chars = 0
total_md_chars = 0

print(f"{'File Name':<45} | {'PDF Words':<10} | {'MD Words':<10} | {'Word Diff':<10} | {'PDF Chars':<10} | {'MD Chars':<10}")
print("-" * 105)

for fname, start_p, end_p in sections:
    pdf_text_list = []
    for pno in range(start_p, end_p + 1):
        page = doc[pno - 1]
        blocks = page.get_text('dict')['blocks']
        for b in blocks:
            if 'lines' not in b:
                continue
            for l in b['lines']:
                line_raw = ''.join(s['text'] for s in l['spans'])
                font0 = l['spans'][0]['font'] if l['spans'] else ''
                if is_header_or_footer(l['bbox'], page.rect.height, line_raw, font0):
                    continue
                txt = decode_avn(line_raw).strip()
                if txt:
                    pdf_text_list.append(txt)
    
    pdf_full = ' '.join(pdf_text_list)
    pdf_words = pdf_full.split()
    pdf_chars = len(pdf_full)
    
    with open(fname, 'r', encoding='utf-8') as f:
        md_content = f.read()
    md_clean = clean_for_comparison(md_content)
    md_words = md_clean.split()
    md_chars = len(md_clean)
    
    total_pdf_words += len(pdf_words)
    total_md_words += len(md_words)
    total_pdf_chars += pdf_chars
    total_md_chars += md_chars
    
    w_diff = len(md_words) - len(pdf_words)
    print(f"{fname:<45} | {len(pdf_words):<10,d} | {len(md_words):<10,d} | {w_diff:<10,d} | {pdf_chars:<10,d} | {md_chars:<10,d}")

print("-" * 105)
print(f"{'TOTAL':<45} | {total_pdf_words:<10,d} | {total_md_words:<10,d} | {total_md_words - total_pdf_words:<10,d} | {total_pdf_chars:<10,d} | {total_md_chars:<10,d}")
