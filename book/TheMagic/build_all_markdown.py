import pymupdf
import re
import os

# Ensure images directory exists
os.makedirs('images', exist_ok=True)
doc = pymupdf.open('raw/The-Magic.pdf')

# 1. Extract images
for pno, page in enumerate(doc):
    imgs = page.get_images()
    for idx, img in enumerate(imgs):
        xref = img[0]
        base = doc.extract_image(xref)
        fname1 = f"images/page_{pno+1}_img_{idx+1}.{base['ext']}"
        with open(fname1, 'wb') as f:
            f.write(base['image'])
        if pno + 1 == 89:
            with open("images/tam-sec-ma-thuat.jpeg", 'wb') as f:
                f.write(base['image'])
        elif pno + 1 == 134:
            with open("images/rhonda-byrne.jpeg", 'wb') as f:
                f.write(base['image'])

print("Extracted images successfully.")

# 2. Formatting helper functions
def is_bold(span):
    font = span['font'].lower()
    flags = span['flags']
    return 'bold' in font or bool(flags & 16) or (flags & 20) == 20

def is_italic(span):
    font = span['font'].lower()
    flags = span['flags']
    return 'italic' in font or 'ita' in font or bool(flags & 2)

def spans_to_markdown(spans):
    merged = []
    for s in spans:
        txt = s['text']
        if not txt:
            continue
        txt = txt.replace('\uf0b7', '- ')
        b = is_bold(s)
        i = is_italic(s)
        if merged and merged[-1]['b'] == b and merged[-1]['i'] == i:
            merged[-1]['text'] += txt
        else:
            merged.append({'text': txt, 'b': b, 'i': i})

    out = []
    for m in merged:
        t = m['text']
        b = m['b']
        i = m['i']
        
        m_lead = re.match(r'^\s*', t)
        lead = m_lead.group(0) if m_lead else ''
        m_trail = re.search(r'\s*$', t)
        trail = m_trail.group(0) if m_trail else ''
        core = t[len(lead):len(t)-len(trail)] if len(t) > len(lead) + len(trail) else t.strip()
        
        if not core:
            out.append(t)
            continue
            
        # Punctuation alone should not be styled
        if core in ('.', ',', ';', ':', '!', '?', '”', '\"'):
            out.append(lead + core + trail)
            continue
            
        if b and i:
            formatted = f'***{core}***'
        elif b:
            formatted = f'**{core}**'
        elif i:
            formatted = f'*{core}*'
        else:
            formatted = core
            
        # Prevent markdown boundary clash (e.g. `***` followed immediately by `*`)
        if out and out[-1].endswith('*') and formatted.startswith('*'):
            if not lead:
                lead = ' '
                
        out.append(lead + formatted + trail)
        
    res = ''.join(out)
    # clean any residual 4+ asterisks
    res = re.sub(r'\*{4,}', '*** *', res)
    # clean punctuation attached to asterisks
    res = re.sub(r'(\*\*|\*)\s*\*\.\*', r'\1.', res)
    res = re.sub(r'(\*\*|\*)\s*\*,', r'\1,', res)
    res = re.sub(r'(\*\*|\*)\s+\.', r'\1.', res)
    res = re.sub(r'(\*\*|\*)\s+,', r'\1,', res)
    return res

def clean_quote(quote_md):
    q = quote_md.strip()
    q = re.sub(r'^“\*+', '*“', q)
    if not q.startswith('*“'):
        q = '*“' + q.lstrip('“*')
    q = re.sub(r'\*+”$', '”*', q)
    if not q.endswith('”*') and not q.endswith('\"*'):
        q = q.rstrip('”\"*') + '”*'
    q = re.sub(r'^\*+“', '*“', q)
    q = re.sub(r'”\*+$', '”*', q)
    return q

def format_lines(lines):
    all_spans = []
    for l_idx, l in enumerate(lines):
        line_spans = [s for s in l['spans'] if s['text'].strip() or s['text'] == ' ']
        for s in line_spans:
            all_spans.append(s)
        if line_spans and not line_spans[-1]['text'].endswith((' ', '\n')):
            all_spans.append({'text': ' ', 'font': 'PalatinoLinotype-Roman', 'flags': 4, 'size': 12.0})
    return spans_to_markdown(all_spans).strip()

def get_raw_text(lines):
    return ' '.join(''.join(s['text'] for s in l['spans']).strip() for l in lines).strip()

def get_max_size(lines):
    sizes = [s['size'] for l in lines for s in l['spans'] if s['text'].strip()]
    return max(sizes) if sizes else 12.0

# 3. Collect paragraph blocks
all_blocks = []
for pno in range(len(doc)):
    page = doc[pno]
    d = page.get_text('dict')
    for b_idx, b in enumerate(d['blocks']):
        if 'lines' not in b:
            continue
        
        paras = []
        curr_para = []
        for l in b['lines']:
            lt = ''.join(s['text'] for s in l['spans']).strip()
            if not lt:
                if curr_para:
                    paras.append(curr_para)
                    curr_para = []
            else:
                if 'pg.' in lt and l['bbox'][1] > 740:
                    continue
                curr_para.append(l)
        if curr_para:
            paras.append(curr_para)
            
        for para in paras:
            first_txt = ''.join(s['text'] for s in para[0]['spans']).strip()
            all_blocks.append({
                'page': pno,
                'b_idx': b_idx,
                'lines': para,
                'first_text': first_txt
            })

# Merge any isolated punctuation blocks into previous block
cleaned_blocks = []
for b in all_blocks:
    raw = get_raw_text(b['lines']).strip()
    if raw in ('.', ',', ':', ';', '!', '?', '…”', '”', '\"', '.*', '*.*') and cleaned_blocks:
        cleaned_blocks[-1]['lines'].extend(b['lines'])
    else:
        cleaned_blocks.append(b)
all_blocks = cleaned_blocks

# Merge intra-page broken link on page 135
for i in range(len(all_blocks) - 1):
    b1 = all_blocks[i]
    b2 = all_blocks[i+1]
    t1 = get_raw_text(b1['lines'])
    t2 = get_raw_text(b2['lines'])
    if 'hoặc fanpage' in t1 and t2.startswith('https://'):
        b1['lines'].extend(b2['lines'])
        b2['lines'] = []

all_blocks = [b for b in all_blocks if b['lines']]
print(f"Collected {len(all_blocks)} blocks after cleaning.")

# 4. Map chapter starts
CHAPTER_DEFS = [
    ('00-the-magic', 'THE MAGIC', 'The Magic'),
    ('01-loi-dich-gia', 'LỜI DỊCH GIẢ', 'Lời dịch giả'),
    ('02-loi-cam-on', 'LỜI CẢM ƠN', 'Lời cảm ơn'),
    ('03-ban-co-tin-vao-phep-thuat', 'BẠN CÓ TIN VÀO PHÉP THUẬT?', 'Bạn có tin vào phép thuật?'),
    ('04-mot-phep-thuat-vi-dai-duoc-tiet-lo', 'MỘT PHÉP THUẬT VĨ ĐẠI ĐƯỢC TIẾT LỘ', 'Một phép thuật vĩ đại được tiết lộ'),
    ('05-mang-phep-thuat-vao-cuoc-song-cua-ban', 'MANG PHÉP THUẬT VÀO CUỘC SỐNG CỦA BẠN', 'Mang phép thuật vào cuộc sống của bạn'),
    ('06-mot-quyen-sach-ma-thuat', 'MỘT QUYỂN SÁCH MA THUẬT', 'Một quyển sách ma thuật'),
]

DAY_TITLES = [
    "ĐẾM NHỮNG PHÚC LÀNH CỦA BẠN",
    "HÒN ĐÁ MA THUẬT",
    "NHỮNG MỐI QUAN HỆ MA THUẬT",
    "SỨC KHỎE MA THUẬT",
    "TIỀN BẠC MA THUẬT",
    "LÀM VIỆC NHƯ MA THUẬT",
    "LOẠI BỎ TIÊU CỰC MA THUẬT",
    "NGUYÊN LIỆU MA THUẬT",
    "MA THUẬT TIỀN BẠC",
    "BỤI MA THUẬT CHO MỌI NGƯỜI",
    "MỘT BUỔI SÁNG MA THUẬT",
    "CON NGƯỜI MA THUẬT TẠO RA SỰ THAY ĐỔI",
    "LÀM CHO TẤT CẢ NHỮNG ƯỚC MƠ CỦA BẠN TRỞ THÀNH SỰ THẬT",
    "HƯỞNG MỘT NGÀY MA THUẬT",
    "CHỮA LÀNH NHỮNG MỐI QUAN HỆ MỘT CÁCH MA THUẬT",
    "MA THUẬT VÀ PHÉP MÀU TRONG SỨC KHỎE",
    "TẤM SÉC MA THUẬT",
    "DANH SÁCH VIỆC CẦN LÀM MA THUẬT",
    "NHỮNG BƯỚC ĐI MA THUẬT",
    "MA THUẬT TRÁI TIM",
    "NHỮNG KẾT QUẢ TUYỆT VỜI",
    "NGAY TRƯỚC MẮT BẠN",
    "KHÔNG KHÍ MA THUẬT MÀ BẠN THỞ",
    "CHIẾC ĐŨA THẦN",
    "GỢI Ý MA THUẬT",
    "CHUYỂN ĐỔI LỖI LẦM THÀNH PHÚC LÀNH MỘT CÁCH MA THUẬT",
    "TẤM GƯƠNG MA THUẬT",
    "GHI NHỚ MA THUẬT",
]

viet_slugs = [
    "dem-nhung-phuc-lanh-cua-ban",
    "hon-da-ma-thuat",
    "nhung-moi-quan-he-ma-thuat",
    "suc-khoe-ma-thuat",
    "tien-bac-ma-thuat",
    "lam-viec-nhu-ma-thuat",
    "loai-bo-tieu-cuc-ma-thuat",
    "nguyen-lieu-ma-thuat",
    "ma-thuat-tien-bac",
    "bui-ma-thuat-cho-moi-nguoi",
    "mot-buoi-sang-ma-thuat",
    "con-nguoi-ma-thuat-tao-ra-su-thay-doi",
    "lam-cho-tat-ca-nhung-uoc-mo-cua-ban-tro-thanh-su-that",
    "huong-mot-ngay-ma-thuat",
    "chua-lanh-nhung-moi-quan-he-mot-cach-ma-thuat",
    "ma-thuat-va-phep-mau-trong-suc-khoe",
    "tam-sec-ma-thuat",
    "danh-sach-viec-can-lam-ma-thuat",
    "nhung-buoc-di-ma-thuat",
    "ma-thuat-trai-tim",
    "nhung-ket-qua-tuyet-voi",
    "ngay-truoc-mat-ban",
    "khong-khi-ma-thuat-ma-ban-tho",
    "chiec-dua-than",
    "goi-y-ma-thuat",
    "chuyen-doi-loi-lam-thanh-phuc-lanh-mot-cach-ma-thuat",
    "tam-guong-ma-thuat",
    "ghi-nho-ma-thuat"
]

for d in range(1, 29):
    cid = f"{d+6:02d}-ngay-{d:02d}-{viet_slugs[d-1]}"
    CHAPTER_DEFS.append((cid, f"Ngày {d}", f"Ngày {d}: {DAY_TITLES[d-1].title()}"))

CHAPTER_DEFS.extend([
    ('35-tuong-lai-ma-thuat-cua-ban', 'TƯƠNG LAI MA THUẬT CỦA BẠN', 'Tương lai ma thuật của bạn'),
    ('36-ma-thuat-khong-bao-gio-ket-thuc', 'MA THUẬT KHÔNG BAO GIỜ KẾT THÚC', 'Ma thuật không bao giờ kết thúc'),
    ('37-ve-rhonda-byrne', 'Về Rhonda Byrne', 'Về Rhonda Byrne'),
    ('38-loi-cuoi-sach', 'Lời cuối sách', 'Lời cuối sách')
])

# Locate chapter indices
chap_ranges = []
t_idx = 0
for idx, b in enumerate(all_blocks):
    if t_idx < len(CHAPTER_DEFS):
        cid, target_txt, cname = CHAPTER_DEFS[t_idx]
        if b['first_text'] == target_txt:
            chap_ranges.append((t_idx, cid, idx, target_txt, cname))
            t_idx += 1

assert len(chap_ranges) == 39, f"Expected 39 chapters, got {len(chap_ranges)}"

# Process each chapter into markdown
chapters_markdown = {}

for c_idx in range(len(chap_ranges)):
    entry = chap_ranges[c_idx]
    start_idx = entry[2]
    end_idx = chap_ranges[c_idx + 1][2] if c_idx + 1 < len(chap_ranges) else len(all_blocks)
    
    c_blocks = all_blocks[start_idx:end_idx]
    cid = entry[1]
    cname = entry[4]
    
    md_lines = []
    
    # Chapter 0 (Title & Dedication)
    if cid == '00-the-magic':
        md_lines.append("# THE MAGIC\n")
        md_lines.append('> *“Bằng phương thức này bạn sẽ đạt được sự huy hoàng của toàn thế giới”*\n>')
        md_lines.append('> THE EMERALD TABLET (KHOẢNG 5.000–3.000 BC)\n')
        md_lines.append("## Dành cho bạn\n")
        md_lines.append("Nguyện cho The Magic mở ra một thế giới mới cho bạn và mang đến cho bạn niềm vui trong cả cuộc đời bạn.\n")
        md_lines.append("Đó là mục đích của tôi cho bạn, và cho thế giới.\n")
        chapters_markdown[cid] = '\n'.join(md_lines)
        continue
        
    # Chapter 37 (Rhonda Byrne)
    if cid == '37-ve-rhonda-byrne':
        md_lines.append("![Rhonda Byrne](images/rhonda-byrne.jpeg)\n")
        md_lines.append("# Về Rhonda Byrne\n")
        blocks_to_process = c_blocks[1:]
    elif cid.startswith(('07-', '08-', '09-')) or '-ngay-' in cid:
        day_num_str = entry[3] # e.g. "Ngày 1"
        day_num = int(day_num_str.split()[1])
        day_title = DAY_TITLES[day_num - 1]
        md_lines.append(f"# {day_num_str}: {day_title.title()}\n")
        
        skip = 1
        if skip < len(c_blocks):
            next_txt = get_raw_text(c_blocks[skip]['lines'])
            if next_txt.upper().startswith(day_title[:15].upper()):
                skip += 1
            if skip < len(c_blocks):
                nnext_txt = get_raw_text(c_blocks[skip]['lines'])
                if nnext_txt in ("THÀNH SỰ THẬT", "THUẬT", "MA THUẬT"):
                    skip += 1
        blocks_to_process = c_blocks[skip:]
    else:
        title_txt = get_raw_text(c_blocks[0]['lines'])
        md_lines.append(f"# {title_txt.title() if not title_txt.isupper() else title_txt}\n")
        blocks_to_process = c_blocks[1:]
        
    # Paragraph merging across page breaks
    i = 0
    merged_blocks = []
    while i < len(blocks_to_process):
        curr = blocks_to_process[i]
        curr_lines = list(curr['lines'])
        curr_max_size = get_max_size(curr_lines)
        curr_raw = get_raw_text(curr_lines)
        
        while (i + 1 < len(blocks_to_process) and 
               curr['page'] != blocks_to_process[i+1]['page'] and
               curr_max_size < 13.5 and
               not curr_raw.endswith(('.', '!', '?', ':', '”', '\"', '…', '---')) and
               not curr_raw.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.', '\uf0b7', '- ', '“'))):
            
            next_b = blocks_to_process[i+1]
            next_lines = next_b['lines']
            next_max_size = get_max_size(next_lines)
            next_raw = get_raw_text(next_lines)
            
            if (next_max_size >= 13.5 or 
                next_raw.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.', '\uf0b7', '- ', '“', 'BÀI TẬP', 'Ngày'))):
                break
                
            curr_lines.extend(next_lines)
            curr_raw = get_raw_text(curr_lines)
            curr['page'] = next_b['page']
            i += 1
            
        merged_blocks.append(curr_lines)
        i += 1
        
    # Process each block into markdown formatting
    in_recommendations_section = False
    b_idx = 0
    while b_idx < len(merged_blocks):
        lines = merged_blocks[b_idx]
        raw_txt = get_raw_text(lines)
        max_size = get_max_size(lines)
        
        if cid == '35-tuong-lai-ma-thuat-cua-ban':
            if raw_txt.startswith('NHỮNG MỐI QUAN HỆ'):
                in_recommendations_section = True
            elif raw_txt.startswith('Hòn Đá Ma Thuật Của Bạn'):
                in_recommendations_section = False
        
        # Section heading: BÀI TẬP MA THUẬT SỐ X
        if raw_txt.startswith('BÀI TẬP MA THUẬT SỐ'):
            md_lines.append(f"\n## {raw_txt}\n")
            if b_idx + 1 < len(merged_blocks):
                next_raw = get_raw_text(merged_blocks[b_idx+1])
                next_size = get_max_size(merged_blocks[b_idx+1])
                if next_size >= 13.0 and not next_raw.startswith(('1.', '2.', '3.', '“')):
                    md_lines.append(f"### {next_raw}\n")
                    b_idx += 1
            b_idx += 1
            continue
            
        if max_size >= 13.5 and len(raw_txt) < 80 and not raw_txt.startswith(('1.', '2.', '3.', '“', '-')):
            if raw_txt.isupper():
                md_lines.append(f"\n### {raw_txt}\n")
            else:
                md_lines.append(f"\n## {raw_txt}\n")
            b_idx += 1
            continue
            
        # Epigraph Quote + Author
        if raw_txt.startswith('“') and (len(raw_txt) < 350 or is_italic(lines[0]['spans'][0])):
            quote_md = format_lines(lines)
            quote_md = clean_quote(quote_md)
            author_md = ""
            if b_idx + 1 < len(merged_blocks):
                next_raw = get_raw_text(merged_blocks[b_idx+1])
                if (next_raw.isupper() or 'BC' in next_raw or 'AD' in next_raw or re.search(r'\(\d{4}', next_raw)) and len(next_raw) < 80:
                    author_lines = [format_lines(merged_blocks[b_idx+1])]
                    b_idx += 1
                    if b_idx + 1 < len(merged_blocks):
                        nnext_raw = get_raw_text(merged_blocks[b_idx+1])
                        if nnext_raw.isupper() and len(nnext_raw) < 60:
                            author_lines.append(format_lines(merged_blocks[b_idx+1]))
                            b_idx += 1
                    author_md = '  \n> '.join(author_lines)
            
            if author_md:
                md_lines.append(f"\n> {quote_md}\n>\n> {author_md}\n")
            else:
                md_lines.append(f"\n> {quote_md}\n")
            b_idx += 1
            continue
            
        # Numbered list
        if re.match(r'^\d+\.\s', raw_txt):
            formatted_item = format_lines(lines)
            md_lines.append(f"\n{formatted_item}\n")
            b_idx += 1
            continue
            
        # Bullet list
        if raw_txt.startswith(('- ', '\uf0b7')):
            formatted_item = format_lines(lines)
            if not formatted_item.startswith('- '):
                formatted_item = '- ' + formatted_item.lstrip('- \uf0b7')
            md_lines.append(f"{formatted_item}")
            b_idx += 1
            continue
            
        # Exercise recommendation items in Chapter 35
        if in_recommendations_section and not max_size >= 13.5 and not raw_txt.startswith('('):
            formatted_item = format_lines(lines)
            # check if next block is parenthetical note or continuation of unclosed parenthesis
            while b_idx + 1 < len(merged_blocks):
                next_raw = get_raw_text(merged_blocks[b_idx+1])
                if next_raw.startswith('(') or formatted_item.count('(') > formatted_item.count(')'):
                    note_formatted = format_lines(merged_blocks[b_idx+1])
                    formatted_item += " " + note_formatted
                    b_idx += 1
                    if formatted_item.count('(') <= formatted_item.count(')'):
                        break
                else:
                    break
            md_lines.append(f"- {formatted_item}")
            b_idx += 1
            continue
            
        # Regular paragraph
        formatted_p = format_lines(lines)
        
        # Check if page 89 before check image
        if 'Photocopy hay scan tấm séc' in raw_txt:
            md_lines.append(f"\n{formatted_p}\n")
            md_lines.append("\n![Tấm Séc Ma Thuật](images/tam-sec-ma-thuat.jpeg)\n")
            b_idx += 1
            continue
            
        md_lines.append(f"\n{formatted_p}\n")
        b_idx += 1
        
    # Assemble content
    content = '\n'.join(md_lines)
    content = re.sub(r'\n{3,}', '\n\n', content).strip() + '\n'
    chapters_markdown[cid] = content

# Write all markdown files
for cid, content in chapters_markdown.items():
    fname = f"{cid}.md"
    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Wrote {fname} ({len(content)} chars)")

# Generate README.md
readme_lines = [
    "# The Magic (Phép Màu) - Rhonda Byrne",
    "",
    "> *Bản dịch tiếng Việt bởi Nguyễn Văn Thảo*",
    "",
    "## Mục Lục",
    "",
]

for cid, target_txt, cname in CHAPTER_DEFS:
    readme_lines.append(f"- [{cname}]({cid}.md)")

with open("README.md", 'w', encoding='utf-8') as f:
    f.write('\n'.join(readme_lines) + '\n')

print("Generated README.md successfully.")
