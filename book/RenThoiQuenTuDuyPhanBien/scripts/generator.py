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

def get_page_elements(page, pno):
    d = page.get_text('dict')
    elements = []
    for b in d['blocks']:
        if b.get('type') == 0:
            for l in b['lines']:
                spans = l['spans']
                raw = clean_text(''.join(s['text'] for s in spans).strip())
                if not raw:
                    continue
                bbox = l['bbox']
                line_md = format_spans(spans).strip()
                is_bi = all((s['flags'] & 18) == 18 for s in spans if s['text'].strip())
                is_b = all((s['flags'] & 16) and not (s['flags'] & 2) for s in spans if s['text'].strip())
                is_i = all((s['flags'] & 2) and not (s['flags'] & 16) for s in spans if s['text'].strip())
                max_sz = max(s['size'] for s in spans)
                
                elements.append({
                    'type': 'line',
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
                    'pno': pno
                })
        elif b.get('type') == 1:
            elements.append({
                'type': 'image',
                'bbox': b['bbox'],
                'x0': b['bbox'][0],
                'y0': b['bbox'][1],
                'x1': b['bbox'][2],
                'y1': b['bbox'][3],
                'width': b['width'],
                'height': b['height'],
                'pno': pno
            })
    elements.sort(key=lambda x: (x['y0'], x['x0']))
    return elements

print("Generator helper defined successfully")
