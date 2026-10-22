import os
import re
import unicodedata
import fitz
import difflib
from build_all_markdown import chapters_meta

PDF_PATH = "raw/DanhThucConNguoiPhiThuongBenTrongBan.pdf"
doc = fitz.open(PDF_PATH)

def normalize_text_for_words(text):
    text = unicodedata.normalize('NFC', text)
    # Strip markdown syntax
    text = re.sub(r'!\[.*?\]\(.*?\)', ' ', text)
    text = re.sub(r'[*_#>`~]', ' ', text)
    text = re.sub(r'---', ' ', text)
    # Replace punctuation with space to isolate words
    text = re.sub(r'[^\w\s]', ' ', text)
    words = text.lower().split()
    return words

def get_pdf_words(start_page, end_page):
    pdf_text = ""
    for pno in range(start_page, end_page + 1):
        pdf_text += doc[pno].get_text() + "\n"
    return normalize_text_for_words(pdf_text)

def get_md_words(md_file):
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    return normalize_text_for_words(content)

print(f"{'File':<55} | {'PDF Words':<10} | {'MD Words':<10} | {'Diff':<6}")
print("-" * 88)

# Check front matter
words_pdf_cover = normalize_text_for_words(doc[0].get_text() + "\n" + doc[1].get_text())
words_md_cover = get_md_words("00_Trang_bia.md")
print(f"{'00_Trang_bia.md':<55} | {len(words_pdf_cover):<10} | {len(words_md_cover):<10} | {len(words_md_cover)-len(words_pdf_cover):<6}")

words_pdf_foreword = normalize_text_for_words(doc[2].get_text() + "\n" + doc[3].get_text())
words_md_foreword = get_md_words("00_Loi_noi_dau.md")
print(f"{'00_Loi_noi_dau.md':<55} | {len(words_pdf_foreword):<10} | {len(words_md_foreword):<10} | {len(words_md_foreword)-len(words_pdf_foreword):<6}")

total_pdf = len(words_pdf_cover) + len(words_pdf_foreword)
total_md = len(words_md_cover) + len(words_md_foreword)

discrepancies = []

for ch in chapters_meta:
    pdf_w = get_pdf_words(ch['start_page'], ch['end_page'])
    md_w = get_md_words(ch['slug'])
    diff = len(md_w) - len(pdf_w)
    total_pdf += len(pdf_w)
    total_md += len(md_w)
    print(f"{ch['slug']:<55} | {len(pdf_w):<10} | {len(md_w):<10} | {diff:<6}")
    if abs(diff) > 0:
        discrepancies.append((ch, pdf_w, md_w, diff))

print("-" * 88)
print(f"{'TOTAL':<55} | {total_pdf:<10} | {total_md:<10} | {total_md - total_pdf:<6}")

