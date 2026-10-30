import fitz
import re
import os
import sys

sys.path.insert(0, 'scripts')
import convert

doc = fitz.open('raw/TuDuyNhanhVaCham.pdf')

def get_pdf_words(start_p, end_p):
    pdf_text = []
    for pno in range(start_p, end_p + 1):
        p = doc[pno - 1]
        blocks = [b for b in p.get_text('dict')['blocks'] if not convert.is_watermark(b)]
        blocks.sort(key=lambda b: b['bbox'][1])
        for b in blocks:
            if b.get('type') == 0:
                for l in b['lines']:
                    for s in l['spans']:
                        pdf_text.append(s['text'])
    full_text = ' '.join(pdf_text)
    # tokenize words: unicode alphanumeric sequences
    words = re.findall(r'[\w]+', full_text.lower())
    return words, full_text

def get_md_words(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # Remove markdown link/image syntax ![...](...) -> ...
    cleaned = re.sub(r'!\[(.*?)\]\(.*?\)', r'\1', text)
    cleaned = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', cleaned)
    # Remove formatting characters like *, #, >, |, -
    cleaned = re.sub(r'[*#>`|\-]', ' ', cleaned)
    words = re.findall(r'[\w]+', cleaned.lower())
    return words, cleaned

results = []
total_pdf = 0
total_md = 0

for sec in convert.SECTIONS:
    p_words, p_text = get_pdf_words(sec['start_page'], sec['end_page'])
    m_words, m_text = get_md_words(sec['filename'])
    total_pdf += len(p_words)
    total_md += len(m_words)
    diff = len(m_words) - len(p_words)
    pct = (len(m_words) / len(p_words) * 100) if len(p_words) > 0 else 0
    results.append((sec['filename'], len(p_words), len(m_words), diff, pct))

print(f"{'Filename':<45} | {'PDF words':<10} | {'MD words':<10} | {'Diff':<6} | {'Match %'}")
print('-' * 85)
for r in results:
    print(f"{r[0]:<45} | {r[1]:<10} | {r[2]:<10} | {r[3]:<+6} | {r[4]:.2f}%")

print('=' * 85)
print(f"{'TOTAL':<45} | {total_pdf:<10} | {total_md:<10} | {total_md - total_pdf:<+6} | {total_md/total_pdf*100:.2f}%")
