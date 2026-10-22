#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import fitz

PDF_PATH = "raw/DanhThucConNguoiPhiThuongBenTrongBan.pdf"
doc = fitz.open(PDF_PATH)

# 1. Total words in PDF vs total words in generated markdown files
pdf_text = ""
for page in doc:
    pdf_text += page.get_text() + "\n"

pdf_words = re.findall(r'\b\w+\b', pdf_text)
print(f"Total words in original PDF: {len(pdf_words):,}")

md_files = sorted([f for f in os.listdir('.') if f.endswith('.md') and f != 'README.md'])
print(f"Total markdown chapter/front-matter files: {len(md_files)}")

total_md_words = 0
for f in md_files:
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
        words = re.findall(r'\b\w+\b', content)
        total_md_words += len(words)
        # Check image links
        img_links = re.findall(r'!\[.*?\]\((.*?)\)', content)
        for link in img_links:
            if not os.path.exists(link):
                print(f"ERROR: Broken image link {link} in {f}")

print(f"Total words across all generated Markdown files: {total_md_words:,}")
word_ratio = total_md_words / len(pdf_words) * 100
print(f"Word retention ratio: {word_ratio:.2f}%")

# 2. Check each file for basic sanity
for f in md_files:
    with open(f, 'r', encoding='utf-8') as fp:
        lines = fp.readlines()
        if len(lines) == 0:
            print(f"WARNING: File {f} is empty!")
        # check unclosed markdown bold/italic
        content = ''.join(lines)
        if content.count('***') % 2 != 0:
            print(f"NOTICE: Possible unbalanced '***' in {f} (count={content.count('***')})")
        # Check for triple/quadruple asterisks like ****
        if re.search(r'\*{4,}', content):
            print(f"WARNING: 4+ consecutive asterisks found in {f}")

# 3. Check README links
with open('README.md', 'r', encoding='utf-8') as fp:
    readme_content = fp.read()
    links = re.findall(r'\[.*?\]\((.*?)\)', readme_content)
    broken = [l for l in links if not os.path.exists(l)]
    if broken:
        print(f"ERROR: Broken links in README.md: {broken}")
    else:
        print(f"All {len(links)} links in README.md point to valid existing files.")

print("\nAudit completed.")
