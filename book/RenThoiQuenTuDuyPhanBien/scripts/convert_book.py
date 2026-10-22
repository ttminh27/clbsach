import fitz
import unicodedata
import re
import os

doc = fitz.open('raw/RenThoiQuenTuDuyPhanBien.pdf')

def clean_text(t):
    return unicodedata.normalize('NFC', t).replace('\xa0', ' ')

def format_spans(spans):
    merged = []
    for s in spans:
        t = unicodedata.normalize('NFC', s['text']).replace('\xa0', ' ')
        if not t:
            continue
        flg = s['flags']
        is_sup = bool(flg & 1)
        is_bold = bool(flg & 16)
        is_italic = bool(flg & 2)
        style = (is_sup, is_bold, is_italic)
        if merged and merged[-1][0] == style:
            merged[-1][1] += t
        else:
            merged.append([style, t])
    
    out = ''
    for (is_sup, is_bold, is_italic), t in merged:
        m_lead = re.match(r'^(\s+)', t)
        lead = m_lead.group(1) if m_lead else ''
        m_trail = re.search(r'(\s+)$', t)
        trail = m_trail.group(1) if m_trail else ''
        core = t.strip()
        if not core:
            out += t
            continue
        
        if is_sup:
            formatted = f'<sup>{core}</sup>'
        elif is_bold and is_italic:
            formatted = f'***{core}***'
        elif is_bold:
            formatted = f'**{core}**'
        elif is_italic:
            formatted = f'*{core}*'
        else:
            formatted = core
        out += lead + formatted + trail
    return out

def get_page_lines_and_images(doc, pno):
    page = doc[pno]
    d = page.get_text('dict')
    items = []
    
    for b in d['blocks']:
        if b.get('type') == 0:
            for l in b['lines']:
                spans = l['spans']
                raw_text = clean_text(''.join(s['text'] for s in spans).strip())
                if not raw_text:
                    continue
                line_md = format_spans(spans).strip()
                bbox = l['bbox']
                
                is_bold_italic = all((s['flags'] & 18) == 18 for s in spans if s['text'].strip())
                is_bold_only = all((s['flags'] & 16) and not (s['flags'] & 2) for s in spans if s['text'].strip())
                is_italic_only = all((s['flags'] & 2) and not (s['flags'] & 16) for s in spans if s['text'].strip())
                max_size = max(s['size'] for s in spans)
                
                items.append({
                    'type': 'text',
                    'bbox': bbox,
                    'y0': bbox[1],
                    'y1': bbox[3],
                    'x0': bbox[0],
                    'x1': bbox[2],
                    'line_md': line_md,
                    'raw_text': raw_text,
                    'is_bold_italic': is_bold_italic,
                    'is_bold_only': is_bold_only,
                    'is_italic_only': is_italic_only,
                    'max_size': max_size,
                    'pno': pno + 1
                })
        elif b.get('type') == 1:
            items.append({
                'type': 'image',
                'bbox': b['bbox'],
                'y0': b['bbox'][1],
                'y1': b['bbox'][3],
                'x0': b['bbox'][0],
                'x1': b['bbox'][2],
                'width': b['width'],
                'height': b['height'],
                'pno': pno + 1
            })
            
    items.sort(key=lambda it: (it['y0'], it['x0']))
    return items

def convert_chapter(pages, chapter_type='chapter'):
    # Collect items across pages
    all_items = []
    for p in pages:
        all_items.extend(get_page_lines_and_images(doc, p))
        
    blocks = []
    current_p = []
    current_type = None # 'p', 'quote', 'list', 'h2', 'h3'
    
    i = 0
    n = len(all_items)
    
    def flush():
        nonlocal current_p, current_type
        if current_p:
            if current_type == 'quote':
                # quote lines
                quote_text = ' '.join(current_p)
                # check if there is an author line
                blocks.append(f"> {quote_text}")
            elif current_type == 'list':
                blocks.append('\n'.join(current_p))
            elif current_type == 'footnote':
                blocks.append('\n'.join(current_p))
            else:
                p_text = ' '.join(current_p)
                blocks.append(p_text)
            current_p = []
            current_type = None

    while i < n:
        item = all_items[i]
        
        if item['type'] == 'image':
            w, h = item['width'], item['height']
            pno = item['pno']
            # Standalone images
            if w == 800 and h == 1170:
                flush()
                blocks.append("![Bìa sách](images/cover.jpeg)")
            elif w == 468 and h == 165:
                flush()
                blocks.append("![Sự hoán đổi thói quen](images/page_37_hoan_doi_thoi_quen.png)")
            elif w == 400 and h == 417:
                flush()
                blocks.append("![Sơ đồ phát triển thói quen](images/page_74_so_do_thoi_quen.png)")
            elif w == 500 and h == 645:
                flush()
                blocks.append("![Bảng theo dõi Eisenhower Matrix](images/page_107_bang_theo_doi.png)")
            elif w == 14 and h == 16:
                pass # inline download icon handled in text
            elif (w, h) in [(50, 49), (50, 56), (25, 25)]:
                pass # inline section / bullet icons handled with headings/lists
            i += 1
            continue
            
        raw = item['raw_text']
        md = item['line_md']
        x0 = item['x0']
        sz = item['max_size']
        is_bi = item['is_bold_italic']
        is_b = item['is_bold_only']
        pno = item['pno']
        
        # 1. Chapter Title: e.g. "- 1 -" or "CÁCH TƯ DUY..."
        if sz > 17:
            flush()
            # If line is "- X -", lookahead for title
            if re.match(r'^-\s*\d+\s*-$', raw):
                # Chapter number
                ch_num = re.sub(r'[^0-9]', '', raw)
                title_lines = []
                j = i + 1
                while j < n and all_items[j]['type'] == 'text' and all_items[j]['max_size'] > 17:
                    title_lines.append(all_items[j]['raw_text'])
                    j += 1
                full_title = ' '.join(title_lines)
                blocks.append(f"# CHƯƠNG {ch_num}: {full_title}")
                i = j
                continue
            else:
                # Chapter title without number, e.g. "MỞ ĐẦU", "LỜI BẠT", "ĐỘI NGŨ TẠI THINKNETIC"
                blocks.append(f"# {raw}")
                i += 1
                continue
                
        # 2. Epigraph / Quote (is_bi)
        if is_bi:
            # Check if this is quote or quote author
            if raw.startswith('-') or raw.startswith('–'):
                flush()
                # Author of quote
                author = raw.lstrip('-– ').strip()
                blocks.append(f">\n> *— {author}*")
            else:
                if current_type != 'quote':
                    flush()
                    current_type = 'quote'
                # Clean up quotes if needed
                text_clean = md.replace('***', '').replace('**', '').replace('*', '')
                current_p.append(text_clean)
            i += 1
            continue
            
        # 3. Subsection heading with icon (x0 around 155.3)
        if 150 <= x0 <= 160 and is_b:
            flush()
            if 'CÁC BƯỚC HÀNH ĐỘNG' in raw:
                blocks.append(f"### CÁC BƯỚC HÀNH ĐỘNG")
            else:
                title = raw.strip('* ')
                blocks.append(f"### {title}")
            i += 1
            continue
            
        # 4. Major section headings (uppercase, bold, size 15)
        # e.g. "NHỮNG KÌ NGHỈ CỦA BẠN...", "TÓM TẮT", "NHỮNG ĐẶC ĐIỂM CHIẾN THẮNG"
        if is_b and (raw.isupper() or 'TÓM TẮT' in raw or 'TÓM TẮT' in raw) and len(raw) > 3 and x0 < 150:
            flush()
            sec_lines = [raw]
            j = i + 1
            while j < n and all_items[j]['type'] == 'text' and all_items[j]['is_bold_only'] and all_items[j]['raw_text'].isupper() and all_items[j]['x0'] < 150:
                sec_lines.append(all_items[j]['raw_text'])
                j += 1
            sec_title = ' '.join(sec_lines)
            if 'TÓM TẮT' in sec_title or 'TÓM TẮT' in sec_title:
                blocks.append(f"## TÓM TẮT")
            else:
                blocks.append(f"## {sec_title}")
            i = j
            continue

        # 5. Slogan or star separator
        if '★' in raw:
            flush()
            blocks.append("\n---\n")
            i += 1
            continue
        if 'Chúng tôi không bán sách, chúng tôi bán kiến thức' in raw:
            flush()
            slogan_lines = [raw]
            j = i + 1
            while j < n and all_items[j]['type'] == 'text' and 'tập đoàn hàng đầu' in all_items[j]['raw_text']:
                slogan_lines.append(all_items[j]['raw_text'])
                j += 1
            blocks.append(f"> *{' '.join(slogan_lines)}*")
            i = j
            continue

        # 6. Table on page 40
        if pno == 40 and ('Lề thói hằng' in raw or 'Lề thói hằng ngày' in raw):
            flush()
            blocks.append("| Lề thói hằng ngày | Lề thói hằng ngày mới – gắn liền với lề thói có sẵn |\n|---|---|\n| | |\n| | |\n| | |\n| | |\n| | |")
            # Skip until after the table lines on page 40
            j = i + 1
            while j < n and all_items[j]['pno'] == 40 and (all_items[j]['x0'] < 100 or 'sẵn' in all_items[j]['raw_text'] or all_items[j]['raw_text'] == ''):
                j += 1
            i = j
            continue

        # 7. Footnotes
        if raw == 'Chú thích:':
            flush()
            fn_lines = ["> **Chú thích:**\n>"]
            j = i + 1
            while j < n and all_items[j]['type'] == 'text' and (all_items[j]['x0'] > 100 or all_items[j]['raw_text'].startswith(('i.', 'ii.', '1.', '2.')) or (j+1 < n and all_items[j]['x0'] == 77.0 and not all_items[j]['is_bold_only'] and all_items[j-1]['pno'] == all_items[j]['pno'])):
                # If we encounter a section header or next major section, stop footnote
                if 150 <= all_items[j]['x0'] <= 160 or (all_items[j]['is_bold_only'] and all_items[j]['raw_text'].isupper()):
                    break
                # If it's a new paragraph or section, break
                if all_items[j]['x0'] > 100 and not all_items[j]['raw_text'].startswith(('i.', 'ii.')):
                    # Check if previous line ended a sentence and this is standard text
                    if not fn_lines[-1].endswith(('-', ' ')):
                        break
                fn_lines.append(f"> {all_items[j]['line_md']}")
                j += 1
            blocks.append('\n'.join(fn_lines))
            i = j
            continue

        # 8. Lists (bullet points • or numbered items 1. 2. or +)
        is_list_start = bool(re.match(r'^(•|\+|\d+\.)\s+', raw))
        if is_list_start:
            flush()
            # Clean list marker to markdown standard
            list_md = md
            if raw.startswith('•'):
                list_md = re.sub(r'^•\s*', '- ', md)
            elif raw.startswith('+'):
                list_md = re.sub(r'^\+\s*', '+ ', md)
            
            # Collect continuation lines of this list item
            item_parts = [list_md]
            j = i + 1
            while j < n and all_items[j]['type'] == 'text':
                next_item = all_items[j]
                # If next item is a new list item, header, image, or indented paragraph, stop
                if bool(re.match(r'^(•|\+|\d+\.)\s+', next_item['raw_text'])) or 150 <= next_item['x0'] <= 160 or (next_item['is_bold_only'] and next_item['raw_text'].isupper()) or next_item['x0'] >= 100 or next_item['is_bold_italic']:
                    break
                # It is a continuation line (x0 == 77.0)
                item_parts.append(next_item['line_md'])
                j += 1
            blocks.append(' '.join(item_parts))
            i = j
            continue

        # 9. Regular text paragraphs
        # If line starts at x0 >= 100, it's a new paragraph!
        if x0 >= 100:
            flush()
            current_type = 'p'
            current_p.append(md)
        else:
            # Continuation line (x0 around 77.0)
            if current_type == 'p':
                current_p.append(md)
            else:
                # Started without an indent (e.g. after heading or page break)
                current_type = 'p'
                current_p.append(md)
        i += 1

    flush()
    return '\n\n'.join(blocks)

print("convert_chapter function compiled successfully")
