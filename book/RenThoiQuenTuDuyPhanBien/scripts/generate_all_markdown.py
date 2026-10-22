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

def get_page_items(doc, pno):
    page = doc[pno]
    d = page.get_text('dict')
    items = []
    
    for b in d['blocks']:
        if b.get('type') == 0:
            lines = b['lines']
            idx = 0
            while idx < len(lines):
                l = lines[idx]
                spans = l['spans']
                raw = clean_text(''.join(s['text'] for s in spans).strip())
                if not raw:
                    idx += 1
                    continue
                bbox = l['bbox']
                line_md = format_spans(spans).strip()
                is_bi = all((s['flags'] & 18) == 18 for s in spans if s['text'].strip())
                is_b = all((s['flags'] & 16) and not (s['flags'] & 2) for s in spans if s['text'].strip())
                is_i = all((s['flags'] & 2) and not (s['flags'] & 16) for s in spans if s['text'].strip())
                max_sz = max(s['size'] for s in spans)
                
                # Check if this is a wrapped heading within the same block
                if 150 <= bbox[0] <= 160 and idx + 1 < len(lines):
                    next_l = lines[idx + 1]
                    next_raw = clean_text(''.join(s['text'] for s in next_l['spans']).strip())
                    # Check if next line is the rest of the heading, e.g. "tiêu)"
                    if next_raw.endswith(')') or (len(next_raw) < 15 and not next_raw.endswith('.')):
                        raw += ' ' + next_raw
                        next_md = format_spans(next_l['spans']).strip()
                        line_md += ' ' + next_md
                        idx += 1 # advance past the continuation line
                
                items.append({
                    'type': 'text',
                    'bbox': bbox,
                    'x0': bbox[0],
                    'y0': bbox[1],
                    'x1': bbox[2],
                    'y1': bbox[3],
                    'raw': raw,
                    'md': line_md,
                    'is_bi': is_bi,
                    'is_b': is_b,
                    'is_i': is_i,
                    'size': max_sz,
                    'pno': pno + 1
                })
                idx += 1
        elif b.get('type') == 1:
            items.append({
                'type': 'image',
                'bbox': b['bbox'],
                'x0': b['bbox'][0],
                'y0': b['bbox'][1],
                'x1': b['bbox'][2],
                'y1': b['bbox'][3],
                'width': b['width'],
                'height': b['height'],
                'pno': pno + 1
            })
    items.sort(key=lambda x: (x['y0'], x['x0']))
    return items

def convert_chapter(pages):
    all_items = []
    for p in pages:
        all_items.extend(get_page_items(doc, p))
        
    blocks = []
    current_p = []
    table_p40_done = False
    
    def flush():
        nonlocal current_p
        if current_p:
            p_text = ' '.join(current_p)
            blocks.append(p_text)
            current_p = []

    i = 0
    n = len(all_items)
    
    while i < n:
        item = all_items[i]
        
        if item['type'] == 'image':
            w, h = item['width'], item['height']
            pno = item['pno']
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
            i += 1
            continue
            
        raw = item['raw']
        md = item['md']
        x0 = item['x0']
        sz = item['size']
        is_bi = item['is_bi']
        is_b = item['is_b']
        pno = item['pno']
        
        # 1. Chapter Title: size > 17
        if sz > 17:
            flush()
            if re.match(r'^-\s*\d+\s*-$', raw):
                ch_num = re.sub(r'[^0-9]', '', raw)
                title_lines = []
                j = i + 1
                while j < n and all_items[j]['type'] == 'text' and all_items[j]['size'] > 17:
                    title_lines.append(all_items[j]['raw'])
                    j += 1
                full_title = ' '.join(title_lines)
                blocks.append(f"# CHƯƠNG {ch_num}: {full_title}")
                i = j
                continue
            else:
                blocks.append(f"# {raw}")
                i += 1
                continue
                
        # 2. Epigraph / Quote (is_bi)
        if is_bi:
            flush()
            quote_lines = [md.replace('***', '').replace('**', '').replace('*', '')]
            author = None
            j = i + 1
            while j < n and all_items[j]['type'] == 'text' and all_items[j]['is_bi']:
                line_raw = all_items[j]['raw']
                if line_raw.startswith('-') or line_raw.startswith('–'):
                    author = line_raw.lstrip('-– ').strip()
                    j += 1
                    break
                else:
                    quote_lines.append(all_items[j]['md'].replace('***', '').replace('**', '').replace('*', ''))
                    j += 1
            
            quote_text = ' '.join(quote_lines).strip()
            if not quote_text.startswith(('“', '"')):
                quote_text = f'"{quote_text}'
            if not quote_text.endswith(('”', '"')):
                quote_text = f'{quote_text}"'
            
            if author:
                blocks.append(f'> {quote_text}\n>\n> *— {author}*')
            else:
                blocks.append(f'> {quote_text}')
            i = j
            continue
            
        # 3. Subsection heading with icon (x0 around 155.3)
        if 150 <= x0 <= 160 and is_b:
            flush()
            # Clean heading text
            clean_title = raw.strip('* ')
            if 'CÁC BƯỚC HÀNH ĐỘNG' in clean_title:
                blocks.append(f"### CÁC BƯỚC HÀNH ĐỘNG")
            else:
                blocks.append(f"### {clean_title}")
            i += 1
            continue
            
        # 4. Major section headings (uppercase, bold, size 15, x0 < 150)
        if is_b and (raw.isupper() or 'TÓM TẮT' in raw or 'TÓM TẮT' in raw) and len(raw) > 3 and x0 < 150:
            flush()
            sec_lines = [raw]
            j = i + 1
            while j < n and all_items[j]['type'] == 'text' and all_items[j]['is_b'] and all_items[j]['raw'].isupper() and all_items[j]['x0'] < 150:
                sec_lines.append(all_items[j]['raw'])
                j += 1
            sec_title = ' '.join(sec_lines)
            if 'TÓM TẮT' in sec_title or 'TÓM TẮT' in sec_title:
                blocks.append(f"## TÓM TẮT")
            else:
                blocks.append(f"## {sec_title}")
            i = j
            continue

        # 5. Star separator & Slogan
        if '★' in raw:
            flush()
            blocks.append("\n---\n")
            i += 1
            continue
            
        if 'Chúng tôi không bán sách, chúng tôi bán kiến thức' in raw:
            flush()
            slogan_lines = [raw]
            j = i + 1
            while j < n and all_items[j]['type'] == 'text' and 'tập đoàn hàng đầu' in all_items[j]['raw']:
                slogan_lines.append(all_items[j]['raw'])
                j += 1
            blocks.append(f"> *{' '.join(slogan_lines)}*")
            i = j
            continue

        # 6. Table on page 40
        if pno == 40 and ('Lề thói hằng' in raw or 'Lề thói hằng ngày' in raw):
            flush()
            if not table_p40_done:
                blocks.append("| Lề thói hằng ngày | Lề thói hằng ngày mới – gắn liền với lề thói có sẵn |\n|---|---|\n| | |\n| | |\n| | |\n| | |\n| | |")
                table_p40_done = True
            j = i + 1
            while j < n and all_items[j]['pno'] == 40 and (all_items[j]['x0'] < 100 or 'sẵn' in all_items[j]['raw'] or all_items[j]['raw'] == ''):
                j += 1
            i = j
            continue

        # 7. Footnotes
        if raw == 'Chú thích:':
            flush()
            fn_lines = ["> **Chú thích:**\n>"]
            j = i + 1
            fn_pno = item['pno']
            while j < n and all_items[j]['type'] == 'text' and all_items[j]['pno'] == fn_pno:
                # Stop if next heading or next image
                if 150 <= all_items[j]['x0'] <= 160 or (all_items[j]['is_b'] and all_items[j]['raw'].isupper()):
                    break
                # Footnote line
                fn_lines.append(f"> {all_items[j]['md']}")
                j += 1
            blocks.append('\n'.join(fn_lines))
            i = j
            continue

        # 8. Lists (bullet points • or numbered items 1. 2. or +)
        is_list_start = bool(re.match(r'^(•|\+|\d+\.)\s+', raw))
        if is_list_start:
            flush()
            list_md = md
            if raw.startswith('•'):
                list_md = re.sub(r'^•\s*', '- ', md)
            elif raw.startswith('+'):
                list_md = re.sub(r'^\+\s*', '+ ', md)
            
            item_parts = [list_md]
            j = i + 1
            while j < n and all_items[j]['type'] == 'text':
                next_item = all_items[j]
                if bool(re.match(r'^(•|\+|\d+\.)\s+', next_item['raw'])) or 150 <= next_item['x0'] <= 160 or (next_item['is_b'] and next_item['raw'].isupper()) or next_item['x0'] >= 100 or next_item['is_bi'] or next_item['raw'] == 'Chú thích:' or '★' in next_item['raw'] or 'Chúng tôi không bán sách' in next_item['raw']:
                    break
                item_parts.append(next_item['md'])
                j += 1
            blocks.append(' '.join(item_parts))
            i = j
            continue

        # 9. Regular text paragraphs
        if x0 >= 100:
            flush()
            current_p.append(md)
        else:
            current_p.append(md)
        i += 1

    flush()
    return '\n\n'.join(blocks)

print("convert_chapter function updated successfully")
