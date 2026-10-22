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
    
    # Text lines
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

print("build_markdown module ready")
