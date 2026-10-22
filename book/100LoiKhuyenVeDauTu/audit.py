#!/usr/bin/env python3
"""
Audit script: Compare content between raw PDF and generated Markdown files.
Performs word count comparison and sequential word matching for all chapters.
"""

import os
import re
import fitz
from convert import chapter_ranges, make_slug

doc = fitz.open("raw/100LoiKhuyenVeDauTu_DTrump.pdf")

def clean_markdown_to_text(md):
    # remove images
    t = re.sub(r'!\[.*?\]\(.*?\)', '', md)
    # convert links [text](url) -> text
    t = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', t)
    # remove headers '# '
    t = re.sub(r'^#+\s*', '', t, flags=re.M)
    # remove list markers
    t = re.sub(r'^\s*[-*+]\s*', '', t, flags=re.M)
    # remove markdown formatting * _ `
    t = re.sub(r'[*_`]', '', t)
    return t

def get_words(text):
    return re.findall(r'\b\w+\b', text.lower())

results = []
perfect_matches = 0
all_match = True

for num, title, start_p, end_p in chapter_ranges:
    if num == 0:
        filename = "000_Loi_gioi_thieu.md"
    else:
        slug = make_slug(title)
        filename = f"{num:03d}_{slug}.md"
        
    with open(filename, "r", encoding="utf-8") as f:
        md_content = f.read()
        
    md_text = clean_markdown_to_text(md_content)
    md_words = get_words(md_text)
    
    # PDF text
    pdf_text = ""
    for p in range(start_p, end_p + 1):
        pdf_text += " " + doc[p].get_text()
        
    pdf_words = get_words(pdf_text)
    
    # Compare
    diff = len(md_words) - len(pdf_words)
    words_match = (md_words == pdf_words)
    
    if words_match:
        perfect_matches += 1
        status = "MATCH (100%)"
    else:
        status = f"DIFF: {diff:+d}"
        all_match = False
        
    results.append({
        "num": num,
        "title": title,
        "file": filename,
        "pdf_words": len(pdf_words),
        "md_words": len(md_words),
        "diff": diff,
        "words_match": words_match,
        "status": status
    })

print(f"\nAUDIT SUMMARY: {perfect_matches} / {len(chapter_ranges)} chapters match 100% perfectly.\n")

if not all_match:
    print("Mismatched chapters:")
    for r in results:
        if not r["words_match"]:
            print(f"Chap {r['num']:3d}: PDF words={r['pdf_words']}, MD words={r['md_words']} | {r['status']} | {r['file']}")
else:
    print("ALL 101 CHAPTERS MATCH 100% PERFECTLY WITH ZERO WORD DIFFERENCES!")
