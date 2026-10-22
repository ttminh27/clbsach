import os
import re

HEADER_PATTERNS = [
    re.compile(r'^đ[úứ]ng\s+vi[ệe]c[\.\s]*$', re.IGNORECASE),
    re.compile(r'^đôi\s+lời\s+chia\s+sẻ\s+từ\s+tác\s+giả[\.\s]*$', re.IGNORECASE),
    re.compile(r'^làm\s+người[\.\s]*$', re.IGNORECASE),
    re.compile(r'^làm\s+dân[\.\s]*$', re.IGNORECASE),
    re.compile(r'^làm\s+việc[\.\s]*$', re.IGNORECASE),
    re.compile(r'^làm\s+giáo\s+dục[\.\s]*$', re.IGNORECASE),
    re.compile(r'^thay\s+lời\s+kết[\.\s]*$', re.IGNORECASE),
    re.compile(r'^tramsach\.com[\.\s]*$', re.IGNORECASE),
]

FOOTER_PATTERNS = [
    re.compile(r'^[\s\.\-_–—]*\d{1,3}[\s\.\-_–—]*$'),
    re.compile(r'.*tramsach\.com.*', re.IGNORECASE),
]

TYPO_REPLACEMENTS = [
    (r'\bđứng việc\b', 'đúng việc'),
    (r'\bĐứng việc\b', 'Đúng việc'),
    (r'\bĐỨNG VIỆC\b', 'ĐÚNG VIỆC'),
    (r'\bđứng niệc\b', 'đúng việc'),
    (r'\bĐứng niệc\b', 'Đúng việc'),
    (r'\bcông uiệc\b', 'công việc'),
    (r'\bcông niệc\b', 'công việc'),
    (r'\bbồn phận\b', 'bổn phận'),
    (r'\bnghỉ ngờ\b', 'nghi ngờ'),
    (r'\bđắt nước\b', 'đất nước'),
    (r'\blàm 6ì\b', 'làm gì'),
    (r'\bthầu đáo\b', 'thấu đáo'),
    (r'\bngàn lân\b', 'ngàn lần'),
    (r'\bbà sẽ dẫn thân\b', 'và sẽ dấn thân'),
    (r'\bbành trình\b', 'hành trình'),
    (r'“trái im”', '“trái tim”'),
    (r'1usk bé', 'must be'),
    (r'eoerg man tuill do', 'every man will do'),
    (r'dutu”\.', 'duty”.'),
    (r'quốc §ia\b', 'quốc gia'),
    (r'đắn thân\b', 'dấn thân'),
    (r'sắn phẩm\b', 'sản phẩm'),
    (r'đúng uiệt\b', 'đúng việc'),
    (r'cơn buôn\b', 'con buôn'),
    (r'thôn tính bọ\b', 'thôn tính họ'),
    (r'Hong hang\b', 'trong hang'),
    (r'anh tn\b', 'anh ta'),
    (r'bề tới\b', 'về tới'),
]

def clean_ocr_typos(text):
    for pattern, repl in TYPO_REPLACEMENTS:
        text = re.sub(pattern, repl, text)
    return text

def is_header(line):
    line = line.strip()
    for pat in HEADER_PATTERNS:
        if pat.match(line):
            return True
    return False

def is_footer(line):
    line = line.strip()
    for pat in FOOTER_PATTERNS:
        if pat.match(line):
            return True
    return False

def get_page_paragraphs(page_idx):
    path = f'.ocr_cache/page_{page_idx:03d}.txt'
    if not os.path.exists(path):
        return []
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read().replace('\x0c', '')
        
    raw_paras = [p.strip() for p in content.split('\n\n') if p.strip()]
    if not raw_paras:
        return []
        
    # Strip top header
    if raw_paras and is_header(raw_paras[0]):
        raw_paras = raw_paras[1:]
    elif raw_paras:
        lines = raw_paras[0].split('\n')
        if len(lines) > 1 and is_header(lines[0]):
            raw_paras[0] = '\n'.join(lines[1:]).strip()
            
    # Strip bottom footer
    if raw_paras and is_footer(raw_paras[-1]):
        raw_paras = raw_paras[:-1]
    elif raw_paras:
        lines = raw_paras[-1].split('\n')
        if len(lines) > 1 and is_footer(lines[-1]):
            raw_paras[-1] = '\n'.join(lines[:-1]).strip()
            
    cleaned_paras = []
    for p in raw_paras:
        lines = [l.strip() for l in p.split('\n') if l.strip()]
        if not lines:
            continue
        joined = lines[0]
        for next_line in lines[1:]:
            if joined.endswith('-'):
                joined = joined[:-1] + next_line
            else:
                joined += ' ' + next_line
        joined = clean_ocr_typos(joined.strip())
        if joined:
            cleaned_paras.append(joined)
            
    return cleaned_paras

def merge_range(start_idx, end_idx, image_map=None):
    if image_map is None:
        image_map = {}
        
    all_paras = []
    for p in range(start_idx, end_idx + 1):
        paras = get_page_paragraphs(p)
        if not paras:
            continue
            
        if all_paras and paras:
            first_p = paras[0]
            first_char = first_p[0]
            if first_char.islower() or first_char in (',', ';', ')', ']', '}', '.', '”', '"'):
                all_paras[-1] = all_paras[-1] + ' ' + first_p
                paras = paras[1:]
                
        all_paras.extend(paras)
        
        if p in image_map:
            for item in image_map[p]:
                all_paras.append(item)
                
    return all_paras

print('Base generator initialized')
