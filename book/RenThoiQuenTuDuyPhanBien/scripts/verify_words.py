import fitz
import re
import unicodedata
import difflib

doc = fitz.open('raw/RenThoiQuenTuDuyPhanBien.pdf')

def clean_for_compare(text):
    text = unicodedata.normalize('NFC', text)
    # Remove HTML tags like <sup>...</sup>
    text = re.sub(r'<[^>]+>', '', text)
    # Remove markdown image/link syntax: ![...](...) or [...](...)
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text)
    text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', text)
    # Remove markdown headers and formatting markers
    text = re.sub(r'^[#>\-\*\+\|]+\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'[*_~`|]', ' ', text)
    text = text.replace('\xa0', ' ')
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def tokenize(text):
    clean = clean_for_compare(text)
    clean = clean.replace('“', '"').replace('”', '"').replace('‘', "'").replace('’', "'")
    clean = clean.replace('…', '...')
    # Extract words (word characters including Vietnamese unicode)
    words = re.findall(r'\w+', clean.lower())
    return words

chapters = [
    ('00_gioi_thieu.md', list(range(0, 6))),
    ('01_mo_dau.md', list(range(6, 9))),
    ('02_chuong_1.md', list(range(9, 30))),
    ('03_chuong_2.md', list(range(30, 56))),
    ('04_chuong_3.md', list(range(56, 75))),
    ('05_chuong_4.md', list(range(75, 88))),
    ('06_chuong_5.md', list(range(88, 102))),
    ('07_chuong_6.md', list(range(102, 112))),
    ('08_loi_bat.md', list(range(112, 115))),
    ('09_doi_ngu_thinknetic.md', list(range(115, 120))),
]

for fname, pages in chapters:
    with open(fname, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    pdf_content = ''
    for p in pages:
        pdf_content += doc[p].get_text() + '\n'
        
    pdf_words = tokenize(pdf_content)
    md_words = tokenize(md_content)
    
    print(f'=== {fname} ===')
    print(f'PDF word count: {len(pdf_words)} | MD word count: {len(md_words)}')
    
    sm = difflib.SequenceMatcher(None, pdf_words, md_words)
    diffs = []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag != 'equal':
            diffs.append((tag, pdf_words[i1:i2], md_words[j1:j2]))
            
    if not diffs:
        print('  PERFECT MATCH! (100% identical words)')
    else:
        print(f'  Found {len(diffs)} difference region(s):')
        for d in diffs:
            tag, w1, w2 = d
            print(f'    [{tag}] PDF: {" ".join(w1[:15])} <---> MD: {" ".join(w2[:15])}')
