import fitz
import re
from convert_to_markdown import decode_avn, is_header_or_footer, parse_page_to_markdown

doc = fitz.open('raw/7ThoiQuenDeThanhDat.pdf')

print("=== DETAILED PAGE-BY-PAGE AUDIT ===")
divergent_pages = []

for pno in range(5, 482):
    page = doc[pno - 1]
    
    # Raw extracted lines
    raw_lines = []
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
                raw_lines.append(txt)
    
    raw_text = ' '.join(raw_lines)
    raw_words = raw_text.split()
    
    # Generated MD for this page
    md_text = parse_page_to_markdown(page, pno)
    clean_md = re.sub(r'!\[.*?\]\(.*?\)', ' ', md_text)
    clean_md = re.sub(r'#+\s*', ' ', clean_md)
    clean_md = re.sub(r'[*_`>~]', ' ', clean_md)
    clean_md = re.sub(r'\s+', ' ', clean_md).strip()
    md_words = clean_md.split()
    
    diff = len(md_words) - len(raw_words)
    if abs(diff) > 5:
        divergent_pages.append((pno, len(raw_words), len(md_words), diff, raw_lines[:3]))

print(f"Total divergent pages (> 5 words diff): {len(divergent_pages)}")
for pno, r_cnt, m_cnt, diff, sample in divergent_pages:
    print(f"Page {pno:3d}: PDF words={r_cnt:3d}, MD words={m_cnt:3d}, Diff={diff:3d} | Sample: {sample}")
