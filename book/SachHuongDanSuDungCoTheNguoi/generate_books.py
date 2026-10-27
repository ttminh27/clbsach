import pymupdf
import re
import os

doc = pymupdf.open('repaired.pdf')

# 1. Map early xrefs to illustration names
early_xrefs = []
for p in range(0, 251):
    for img in doc[p].get_image_info(xrefs=True):
        if img['xref'] not in early_xrefs:
            early_xrefs.append(img['xref'])

xref_to_illust = {xref: f'illustration_{i:02d}.png' for i, xref in enumerate(early_xrefs, 1)}

def clean_spans(spans):
    res = []
    for s in spans:
        txt = s['text']
        if not txt:
            continue
        fn = s['font'].lower()
        is_bold = 'bold' in fn or (s['flags'] & 2 != 0)
        is_italic = 'italic' in fn or 'it' in fn or (s['flags'] & 1 != 0)
        
        m = re.match(r'^(\s*)(.*?)(\s*)$', txt, re.DOTALL)
        if not m:
            res.append(txt)
            continue
        l_sp, core, r_sp = m.groups()
        if not core:
            res.append(txt)
            continue
            
        if is_bold and is_italic:
            formatted = f'***{core}***'
        elif is_bold:
            formatted = f'**{core}**'
        elif is_italic:
            formatted = f'*{core}*'
        else:
            formatted = core
        res.append(l_sp + formatted + r_sp)
    return ''.join(res)

def parse_page(page, pno):
    d = page.get_text('dict')
    imgs = page.get_image_info(xrefs=True)
    
    top_img = None
    for img in imgs:
        if img['bbox'][1] < 140:
            top_img = xref_to_illust.get(img['xref'])
            break
            
    top_quote_lines = []
    body_items = []
    
    # Collect all lines
    raw_lines = []
    for b in d['blocks']:
        if 'lines' not in b:
            continue
        for l in b['lines']:
            txt = ''.join(s['text'] for s in l['spans']).strip()
            if not txt:
                continue
            y0 = l['bbox'][1]
            x0 = l['bbox'][0]
            raw_lines.append((y0, x0, l, txt))
            
    # Sort lines vertically, then horizontally
    raw_lines.sort(key=lambda x: (x[0], x[1]))
    
    for y0, x0, l, txt in raw_lines:
        # Ignore footer / running header
        if y0 > 628:
            continue
        if txt == '“Sách hướng dẫn sử dụng cơ thể người”' or txt == 'Sách hướng dẫn sử dụng cơ thể người':
            continue
        if re.match(r'^\d+$', txt):
            continue
            
        if y0 < 135:
            top_quote_lines.append(txt)
        else:
            # Check line type: heading, bullet, body
            font0 = l['spans'][0]['font']
            size0 = l['spans'][0]['size']
            fn_lower = font0.lower()
            
            is_bold = 'bold' in fn_lower
            is_italic = 'italic' in fn_lower or 'it' in fn_lower
            
            formatted_text = clean_spans(l['spans']).strip()
            
            line_type = 'body'
            if re.match(r'^Chương\s+\d+', txt, re.IGNORECASE) or (size0 >= 15.5 and is_bold):
                line_type = 'h1'
            elif size0 >= 13.8 and is_bold and not is_italic and x0 > 60:
                line_type = 'h2'
            elif size0 >= 13.8 and (is_italic or (is_bold and is_italic)) and x0 > 60:
                line_type = 'h3'
            elif txt.startswith('•') or txt.startswith('- '):
                line_type = 'bullet'
            else:
                line_type = 'body'
                
            body_items.append({
                'y0': y0,
                'x0': x0,
                'type': line_type,
                'raw': txt,
                'formatted': formatted_text,
                'is_indented': x0 > 60
            })
            
    top_quote = ' '.join(top_quote_lines).strip()
    return top_img, top_quote, body_items

print('parse_page function ready')
