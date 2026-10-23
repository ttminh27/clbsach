import fitz
import re
import os

doc = fitz.open('raw/ParentBookKyLuatTichCuc.pdf')

SECTIONS = [
    {
        'filename': '00_loi_noi_dau.md',
        'title': 'Lời nói đầu & Mục lục',
        'pages': range(1, 11) # 1-10
    },
    {
        'filename': '00_loi_gioi_thieu.md',
        'title': 'Lời giới thiệu',
        'pages': range(11, 21) # 11-20
    },
    {
        'filename': '01_chuong_1.md',
        'title': 'Chương 1: Xác định mục tiêu lâu dài của bạn',
        'pages': range(21, 35) # 21-34
    },
    {
        'filename': '02_chuong_2.md',
        'title': 'Chương 2: Tạo sự ấm áp và cấu trúc',
        'pages': range(35, 55) # 35-54
    },
    {
        'filename': '03_chuong_3.md',
        'title': 'Chương 3: Hiểu cách trẻ nghĩ và cảm nhận',
        'pages': range(55, 139) # 55-138
    },
    {
        'filename': '04_chuong_4.md',
        'title': 'Chương 4: Giải quyết vấn đề',
        'pages': range(139, 183) # 139-182
    },
    {
        'filename': '05_chuong_5.md',
        'title': 'Chương 5: Phản ứng bằng kỷ luật tích cực',
        'pages': range(183, 351) # 183-350
    },
    {
        'filename': '06_ket_luan.md',
        'title': 'Kết luận & Vài nét về tác giả',
        'pages': range(351, 357) # 351-356
    }
]

def clean_inline_md(text):
    text = re.sub(r'\*\*\s*\*\*', '', text)
    # clean trailing/leading space inside bold/italic
    text = re.sub(r'\*\*([ \t]+)(.*?)\*\*', r'\1**\2**', text)
    text = re.sub(r'\*\*(.*?)([ \t]+)\*\*', r'**\1**\2', text)
    text = re.sub(r'\*([ \t]+)(.*?)\*', r'\1*\2*', text)
    text = re.sub(r'\*(.*?)([ \t]+)\*', r'*\1*\2', text)
    text = re.sub(r'\*\*\*\*+', '***', text)
    return text

def format_line_spans(spans):
    norm_spans = []
    for s in spans:
        font = s['font']
        flags = s['flags']
        text = s['text']
        size = s['size']
        
        if 'Wingdings' in font:
            text = text.replace('\uf06f', '☐')
            text = text.replace('\uf0a8', '☐')
            text = text.replace('\uf081', '①')
            text = text.replace('\uf082', '②')
            text = text.replace('\uf083', '③')
            text = text.replace('\uf084', '④')
            text = re.sub(r'y+', '- ', text)
            text = text.replace('{', '  - ')
            is_bold = False
            is_italic = False
        else:
            is_bold = 'Bold' in font or 'Semibold' in font or bool(flags & 16)
            is_italic = 'It' in font or bool(flags & 2)
            
        norm_spans.append({
            'text': text,
            'is_bold': is_bold,
            'is_italic': is_italic,
            'size': size,
            'font': font
        })
        
    # Whitespace span between two identically styled spans gets that style
    for i in range(1, len(norm_spans) - 1):
        if norm_spans[i]['text'].strip() == '':
            p = norm_spans[i-1]
            n = norm_spans[i+1]
            if p['is_bold'] == n['is_bold'] and p['is_italic'] == n['is_italic']:
                norm_spans[i]['is_bold'] = p['is_bold']
                norm_spans[i]['is_italic'] = p['is_italic']
                
    # Merge consecutive spans with identical style
    merged = []
    for s in norm_spans:
        if not s['text']:
            continue
        if merged and merged[-1]['is_bold'] == s['is_bold'] and merged[-1]['is_italic'] == s['is_italic']:
            merged[-1]['text'] += s['text']
        else:
            merged.append(s)
            
    # Format with markdown tags
    line_out = ''
    for s in merged:
        text = s['text']
        is_bold = s['is_bold']
        is_italic = s['is_italic']
        
        if not is_bold and not is_italic:
            line_out += text
            continue
            
        lspace = len(text) - len(text.lstrip())
        rspace = len(text) - len(text.rstrip())
        lead = text[:lspace]
        trail = text[len(text)-rspace:] if rspace > 0 else ''
        core = text.strip()
        
        if not core:
            line_out += text
        elif is_bold and is_italic:
            line_out += f'{lead}***{core}***{trail}'
        elif is_bold:
            line_out += f'{lead}**{core}**{trail}'
        elif is_italic:
            line_out += f'{lead}*{core}*{trail}'
            
    return line_out

def process_page(pno):
    page = doc[pno - 1]
    blocks = page.get_text('dict')['blocks']
    
    # 1. Images on page
    page_imgs = []
    for idx, img_info in enumerate(page.get_images(full=True)):
        xref = img_info[0]
        rects = page.get_image_rects(xref)
        if rects:
            rect = rects[0]
            base_img = doc.extract_image(xref)
            ext = 'png' if img_info[1] > 0 else ('jpeg' if base_img['ext'] in ['jpg', 'jpeg'] else base_img['ext'])
            img_file = None
            for c in [f'page_{pno}_img_{idx+1}.png', f'page_{pno}_img_{idx+1}.jpeg', f'page_{pno}_img_{idx+1}.jpg']:
                if os.path.exists(os.path.join('images', c)):
                    img_file = c
                    break
            if img_file:
                page_imgs.append({
                    'type': 'image',
                    'y0': rect.y0,
                    'file': img_file,
                    'bbox': rect
                })
                
    # Sort images by y0, then x0 (left-to-right)
    page_imgs.sort(key=lambda x: (round(x['y0'] / 15), x['bbox'].x0))

    # 2. Text blocks
    text_items = []
    for b in blocks:
        if b.get('type') != 0 or 'lines' not in b:
            continue
        bbox = b['bbox']
        # Running footer
        if bbox[1] > 545:
            continue
        full_text = ' '.join(''.join(s['text'] for s in l['spans']) for l in b['lines']).strip()
        if not full_text:
            continue
            
        # Running header check
        if bbox[3] < 50:
            if pno not in [23, 37, 57, 141, 185]:
                continue
                
        # Thumb tabs check
        if (bbox[0] > 380 or bbox[2] < 45) and (bbox[3] - bbox[1] > 120):
            if '0 đến 6 tháng' in full_text and '14 đến 18 tuổi' in full_text:
                continue
                
        # Filter divider page chapter number single digit (e.g. "1" or "2" on page 21, 35, 55, 139, 183)
        if pno in [21, 35, 55, 139, 183] and full_text.strip() in ['1', '2', '3', '4', '5']:
            continue
            
        text_items.append({
            'type': 'text',
            'y0': bbox[1],
            'bbox': bbox,
            'lines': b['lines'],
            'full_text': full_text
        })
        
    # Sort all elements on page by y0
    all_items = sorted(text_items + page_imgs, key=lambda x: x['y0'])
    
    # 3. Check for page-level tables (e.g., matrix with header '1 2 3' or '1 2')
    table_hdr_idx = -1
    for i, it in enumerate(all_items):
        if it['type'] == 'text':
            t = it['full_text'].strip()
            if re.match(r'^\s*1\s+2(\s+3)?\s*$', t):
                table_hdr_idx = i
                break
                
    if table_hdr_idx != -1:
        cols = all_items[table_hdr_idx]['full_text'].strip().split()
        table_rows = []
        table_rows.append(f"| Tiêu chí | " + " | ".join(cols) + " |")
        table_rows.append(f"| :--- | " + " | ".join([":---:"] * len(cols)) + " |")
        
        end_table_idx = table_hdr_idx + 1
        for j in range(table_hdr_idx + 1, len(all_items)):
            it = all_items[j]
            if it['type'] == 'text' and ('☐' in it['full_text'] or '\uf0a8' in it['full_text']):
                txt = it['full_text'].replace('\uf0a8', '☐').replace('\uf06f', '☐').strip()
                boxes = re.findall(r'☐', txt)
                crit = re.sub(r'☐', '', txt).strip()
                crit = re.sub(r'[\*_]+', '', crit)
                while len(boxes) < len(cols):
                    boxes.append('☐')
                table_rows.append(f"| {crit} | " + " | ".join(boxes[:len(cols)]) + " |")
                end_table_idx = j + 1
            else:
                break
                
        tbl_item = {
            'type': 'table_md',
            'y0': all_items[table_hdr_idx]['y0'],
            'md': '\n'.join(table_rows)
        }
        all_items = all_items[:table_hdr_idx] + [tbl_item] + all_items[end_table_idx:]

    # 4. Check for scale rating tables (Page 104, 105)
    has_circled = any(it['type'] == 'text' and ('①' in it['full_text'] or '\uf081' in it['full_text']) for it in all_items)
    if has_circled:
        scale_items = []
        non_scale_items = []
        for it in all_items:
            if it['type'] == 'text':
                txt = it['full_text'].replace('\uf081', '①').replace('\uf082', '②').replace('\uf083', '③').replace('\uf084', '④')
                if re.search(r'[①②③④]', txt):
                    scale_items.append((it, txt))
                else:
                    non_scale_items.append(it)
            else:
                non_scale_items.append(it)
                
        if len(scale_items) >= 4:
            t_rows = ['| Đặc điểm tính khí | Đánh giá |', '| :--- | :---: |']
            for _, txt in scale_items:
                crit = re.sub(r'[①②③④\s]+$', '', txt).strip()
                crit = re.sub(r'^[\*\s]+|[\*\s]+$', '', crit)
                t_rows.append(f"| **{crit}** | ① ② ③ ④ |")
            scale_tbl = {'type': 'table_md', 'y0': scale_items[0][0]['y0'], 'md': '\n'.join(t_rows)}
            all_items = sorted(non_scale_items + [scale_tbl], key=lambda x: x['y0'])

    # 5. Format each item
    rendered = []
    for item in all_items:
        if item['type'] == 'image':
            rendered.append(f"![Hình ảnh minh họa](images/{item['file']})")
        elif item['type'] == 'table_md':
            rendered.append(item['md'])
        else:
            lines = item['lines']
            max_size = max(s['size'] for l in lines for s in l['spans'])
            first_text = ''.join(s['text'] for s in lines[0]['spans']).strip()
            
            # Format lines
            formatted_lines = [clean_inline_md(format_line_spans(l['spans'])).strip() for l in lines]
            formatted_lines = [l for l in formatted_lines if l]
            
            if not formatted_lines:
                continue
                
            # Do not treat checkbox/scale lines as headings
            has_symbols = any(ch in first_text for ch in ['☐', '①', '②', '③', '④', '', '', ''])

            # Headings
            if not has_symbols and first_text.upper().startswith(('CHƯƠNG I', 'CHƯƠNG II', 'CHƯƠNG III', 'CHƯƠNG IV', 'CHƯƠNG 5', 'CHƯƠNG 1', 'CHƯƠNG 2', 'CHƯƠNG 3', 'CHƯƠNG 4')) and len(formatted_lines) <= 2:
                h_text = ' '.join(formatted_lines)
                h_text = re.sub(r'[\*_]+', '', h_text).strip()
                rendered.append(f"# {h_text}")
                continue
                
            if not has_symbols and max_size >= 18 and len(formatted_lines) <= 3:
                h_text = ' '.join(formatted_lines)
                h_text = re.sub(r'[\*_]+', '', h_text).strip()
                # On divider page, prefix with Chapter number
                if pno == 21 and 'CHƯƠNG' not in h_text:
                    h_text = f"CHƯƠNG 1: {h_text}"
                elif pno == 35 and 'CHƯƠNG' not in h_text:
                    h_text = f"CHƯƠNG 2: {h_text}"
                elif pno == 55 and 'CHƯƠNG' not in h_text:
                    h_text = f"CHƯƠNG 3: {h_text}"
                elif pno == 139 and 'CHƯƠNG' not in h_text:
                    h_text = f"CHƯƠNG 4: {h_text}"
                elif pno == 183 and 'CHƯƠNG' not in h_text:
                    h_text = f"CHƯƠNG 5: {h_text}"
                rendered.append(f"# {h_text}")
                continue
                
            if not has_symbols and max_size >= 14 and len(formatted_lines) <= 2 and not first_text.startswith(('•', '1.', '2.', '3.', '4.', '5.')):
                h_text = ' '.join(formatted_lines)
                h_text = re.sub(r'[\*_]+', '', h_text).strip()
                rendered.append(f"## {h_text}")
                continue
                
            if not has_symbols and (max_size >= 12 or first_text.startswith(('Bước ', 'Bài tập', 'Tình huống', 'Ghi nhớ', 'Một số điều', 'Một số điểm', 'Một số lưu ý'))) and len(formatted_lines) <= 2 and not first_text.startswith(('•', '1.', '2.', '3.', '4.', '5.')):
                h_text = ' '.join(formatted_lines)
                h_text = re.sub(r'[\*_]+', '', h_text).strip()
                rendered.append(f"### {h_text}")
                continue
                
            # UN CRC callout quote boxes
            if 'Điều 19:' in first_text or 'Điều 18' in first_text or 'Công ước Liên Hợp Quốc về Quyền' in first_text:
                q_text = ' '.join(formatted_lines)
                rendered.append(f"> *{q_text}*")
                continue
                
            # Lists and options (a. , b. )
            is_list = all(re.match(r'^\s*([•\-\*]|①|②|③|④|☐|\d+\.|\b[a-z]\.)', l) for l in formatted_lines) or \
                      any(l.startswith(('- ', '• ', '  - ')) for l in formatted_lines)
            is_dots = any(re.match(r'^\s*[\.]{5,}', l) for l in formatted_lines)
            
            if is_list or is_dots:
                cleaned_list = []
                for l in formatted_lines:
                    l_norm = re.sub(r'^[•\t\s]*•\t*', '- ', l)
                    if ' a.\t' in l_norm or ' a. ' in l_norm:
                        l_norm = re.sub(r'\s+a\.\t*', '\n   - a. ', l_norm)
                    if ' b.\t' in l_norm or ' b. ' in l_norm:
                        l_norm = re.sub(r'\s+b\.\t*', '\n   - b. ', l_norm)
                    cleaned_list.append(l_norm)
                rendered.append('\n'.join(cleaned_list))
            else:
                # Regular paragraph
                para_text = ''
                for l in formatted_lines:
                    if para_text.endswith('-'):
                        para_text = para_text[:-1] + l
                    elif para_text:
                        para_text += ' ' + l
                    else:
                        para_text = l
                if ' a.\t' in para_text or ' b.\t' in para_text:
                    para_text = re.sub(r'\s+a\.\t*', '\n   - a. ', para_text)
                    para_text = re.sub(r'\s+b\.\t*', '\n   - b. ', para_text)
                rendered.append(para_text)
                
    return rendered

def build_section(sec_info):
    fname = sec_info['filename']
    pages = sec_info['pages']
    
    print(f"Building {fname} (pages {min(pages)} - {max(pages)})...")
    content = []
    
    for pno in pages:
        p_blocks = process_page(pno)
        if not p_blocks:
            continue
        for b in p_blocks:
            content.append(b)
            
    raw_md = '\n\n'.join(content)
    # Deduplicate consecutive identical headings
    raw_md = re.sub(r'(#+ [^\n]+)\n\n\1', r'\1', raw_md)
    # Merge consecutive bold tags across line breaks
    raw_md = re.sub(r'\*\*\s*\n\s*\*\*', ' ', raw_md)
    # Remove multiple consecutive blank lines
    raw_md = re.sub(r'\n{3,}', '\n\n', raw_md).strip()
    
    with open(fname, 'w', encoding='utf-8') as f:
        f.write(raw_md + '\n')
    print(f"-> Generated {fname}: {len(raw_md)} characters.")

if __name__ == '__main__':
    for sec in SECTIONS:
        build_section(sec)
    print("\nALL 8 FILES BUILT SUCCESSFULLY!")
