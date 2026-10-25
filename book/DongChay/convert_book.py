import pymupdf
import os
import re

doc = pymupdf.open('raw/FlowDongChay.pdf')

chapters = [
    {
        'id': '01_loi_noi_dau.md',
        'title': 'Lời nói đầu',
        'start_page': 2,
        'end_page': 4,
        'prev': '00_muc_luc.md',
        'next': '02_chuong_01.md'
    },
    {
        'id': '02_chuong_01.md',
        'title': 'Chương 1: Hạnh phúc được xem xét lại',
        'start_page': 5,
        'end_page': 41,
        'prev': '01_loi_noi_dau.md',
        'next': '03_chuong_02.md'
    },
    {
        'id': '03_chuong_02.md',
        'title': 'Chương 2: Giải phẫu học về ý thức',
        'start_page': 42,
        'end_page': 72,
        'prev': '02_chuong_01.md',
        'next': '04_chuong_03.md'
    },
    {
        'id': '04_chuong_03.md',
        'title': 'Chương 3: Sự thưởng thức và chất lượng cuộc sống',
        'start_page': 73,
        'end_page': 117,
        'prev': '03_chuong_02.md',
        'next': '05_chuong_04.md'
    },
    {
        'id': '05_chuong_04.md',
        'title': 'Chương 4: Những điều kiện của trạng thái dòng chảy',
        'start_page': 118,
        'end_page': 153,
        'prev': '04_chuong_03.md',
        'next': '06_chuong_05.md'
    },
    {
        'id': '06_chuong_05.md',
        'title': 'Chương 5: Cơ thể trong dòng chảy',
        'start_page': 154,
        'end_page': 190,
        'prev': '05_chuong_04.md',
        'next': '07_chuong_06.md'
    },
    {
        'id': '07_chuong_06.md',
        'title': 'Chương 6: Dòng chảy của suy nghĩ',
        'start_page': 191,
        'end_page': 230,
        'prev': '06_chuong_05.md',
        'next': '08_chuong_07.md'
    },
    {
        'id': '08_chuong_07.md',
        'title': 'Chương 7: Làm việc như dòng chảy',
        'start_page': 231,
        'end_page': 264,
        'prev': '07_chuong_06.md',
        'next': '09_chuong_08.md'
    },
    {
        'id': '09_chuong_08.md',
        'title': 'Chương 8: Thưởng thức sự cô độc và mối quan hệ với người khác',
        'start_page': 265,
        'end_page': 309,
        'prev': '08_chuong_07.md',
        'next': '10_chuong_09.md'
    },
    {
        'id': '10_chuong_09.md',
        'title': 'Chương 9: Đánh lừa sự hỗn loạn',
        'start_page': 310,
        'end_page': 345,
        'prev': '09_chuong_08.md',
        'next': '11_chuong_10.md'
    },
    {
        'id': '11_chuong_10.md',
        'title': 'Chương 10: Tạo ra ý nghĩa',
        'start_page': 346,
        'end_page': 388,
        'prev': '10_chuong_09.md',
        'next': '12_nhung_bo_sung.md'
    },
    {
        'id': '12_nhung_bo_sung.md',
        'title': 'Những bổ sung',
        'start_page': 389,
        'end_page': 463,
        'prev': '11_chuong_10.md',
        'next': '13_nguon_tham_khao.md'
    },
    {
        'id': '13_nguon_tham_khao.md',
        'title': 'Nguồn tham khảo',
        'start_page': 464,
        'end_page': 504,
        'prev': '12_nhung_bo_sung.md',
        'next': '14_chu_thich.md'
    },
    {
        'id': '14_chu_thich.md',
        'title': 'Chú thích',
        'start_page': 505,
        'end_page': 516,
        'prev': '13_nguon_tham_khao.md',
        'next': None
    }
]

def is_all_caps(text):
    letters = [c for c in text if c.isalpha()]
    return len(letters) > 0 and all(c.isupper() for c in letters)

def format_spans(spans, is_heading=False):
    res = []
    for s in spans:
        t = s['text']
        if not t:
            continue
        sz = s['size']
        f = s['font']
        
        # superscript
        if sz < 13 and t.strip().isdigit():
            prefix = ' ' if t.startswith(' ') else ''
            suffix = ' ' if t.endswith(' ') else ''
            res.append(f'{prefix}<sup>{t.strip()}</sup>{suffix}')
            continue
            
        if is_heading:
            res.append(t)
            continue
            
        is_bold = 'Bold' in f
        is_italic = 'Italic' in f
        
        if is_bold and is_italic:
            body = t.strip()
            if not body:
                res.append(t)
            else:
                prefix = ' ' if t.startswith(' ') else ''
                suffix = ' ' if t.endswith(' ') else ''
                res.append(f'{prefix}***{body}***{suffix}')
        elif is_bold:
            body = t.strip()
            if not body:
                res.append(t)
            else:
                prefix = ' ' if t.startswith(' ') else ''
                suffix = ' ' if t.endswith(' ') else ''
                res.append(f'{prefix}**{body}**{suffix}')
        elif is_italic:
            body = t.strip()
            if not body:
                res.append(t)
            else:
                prefix = ' ' if t.startswith(' ') else ''
                suffix = ' ' if t.endswith(' ') else ''
                res.append(f'{prefix}*{body}*{suffix}')
        else:
            res.append(t)
    return ''.join(res)

def extract_items(start_pno, end_pno):
    items = []
    for pno in range(start_pno, end_pno + 1):
        page = doc[pno]
        d = page.get_text('dict')
        drop_cap = None
        for b in d['blocks']:
            if 'lines' in b:
                for l in b['lines']:
                    for s in l['spans']:
                        if s['size'] > 25 and len(s['text'].strip()) == 1 and s['text'].strip().isalpha():
                            drop_cap = (s['text'].strip(), l['bbox'])
                            break
                    if drop_cap:
                        break
            if drop_cap:
                break
                
        page_items = []
        for b in d['blocks']:
            if 'lines' in b:
                for l in b['lines']:
                    if len(l['spans']) == 1 and l['spans'][0]['size'] > 25 and len(l['spans'][0]['text'].strip()) == 1:
                        continue
                    page_items.append({
                        'type': 'line',
                        'bbox': l['bbox'],
                        'spans': l['spans'],
                        'page': pno + 1
                    })
            elif 'image' in b:
                page_items.append({
                    'type': 'image',
                    'bbox': b['bbox'],
                    'page': pno + 1,
                    'width': b.get('width'),
                    'height': b.get('height')
                })
        page_items.sort(key=lambda x: x['bbox'][1])
        
        if drop_cap:
            dc_char, dc_bbox = drop_cap
            companion = None
            for pi in page_items:
                if pi['type'] == 'line':
                    if dc_bbox[1] - 10 <= pi['bbox'][1] <= dc_bbox[3] + 10:
                        companion = pi
                        break
            if companion:
                first_span = companion['spans'][0]
                first_span['text'] = dc_char + first_span['text']
                companion['bbox'] = (dc_bbox[0], companion['bbox'][1], companion['bbox'][2], companion['bbox'][3])
                companion['has_drop_cap'] = True
                
        items.extend(page_items)
    return items

def build_markdown(items, ch_meta):
    output_parts = []
    
    # Navigation header
    nav_links = []
    if ch_meta.get('prev'):
        nav_links.append(f"[<< {ch_meta['prev_title'] if 'prev_title' in ch_meta else 'Chương trước'}]({ch_meta['prev']})")
    nav_links.append("[Mục lục](00_muc_luc.md)")
    if ch_meta.get('next'):
        nav_links.append(f"[{ch_meta['next_title'] if 'next_title' in ch_meta else 'Chương tiếp theo'} >>]({ch_meta['next']})")
    
    nav_str = " | ".join(nav_links)
    output_parts.append(f"{nav_str}\n\n---\n\n")
    
    i = 0
    n = len(items)
    current_para = []
    
    def flush_para():
        nonlocal current_para
        if not current_para:
            return
        p_text = ""
        for line_txt in current_para:
            if not p_text:
                p_text = line_txt.strip()
            else:
                if p_text.endswith(' –') or p_text.endswith(' -'):
                    p_text = p_text + " " + line_txt.strip()
                elif p_text.endswith('–') or p_text.endswith('-'):
                    p_text = p_text + line_txt.strip()
                else:
                    p_text = p_text + " " + line_txt.strip()
        output_parts.append(p_text + "\n\n")
        current_para = []

    while i < n:
        item = items[i]
        
        # Image
        if item['type'] == 'image':
            flush_para()
            output_parts.append("![Biểu đồ dòng chảy](images/bieu-do-dong-chay.png)\n\n")
            i += 1
            # Check if next line(s) are caption (italic)
            caption_lines = []
            while i < n and items[i]['type'] == 'line':
                spans = [s for s in items[i]['spans'] if s['text'].strip()]
                if spans and all('Italic' in s['font'] for s in spans):
                    caption_lines.append(''.join(s['text'] for s in spans).strip())
                    i += 1
                else:
                    break
            if caption_lines:
                output_parts.append(f"*{' '.join(caption_lines)}*\n\n")
            continue
            
        spans = [s for s in item['spans'] if s['text'].strip()]
        if not spans:
            i += 1
            continue
            
        raw_text = ''.join(s['text'] for s in spans).strip()
        max_size = max(s['size'] for s in spans)
        all_bold = all('Bold' in s['font'] for s in spans)
        all_italic = all('Italic' in s['font'] for s in spans)
        
        # 1. H1 Heading (Chapter title / Book section)
        if max_size >= 19:
            flush_para()
            h1_lines = [raw_text]
            while i + 1 < n and items[i+1]['type'] == 'line':
                next_spans = [s for s in items[i+1]['spans'] if s['text'].strip()]
                if next_spans and max(s['size'] for s in next_spans) >= 19:
                    h1_lines.append(''.join(s['text'] for s in next_spans).strip())
                    i += 1
                else:
                    break
            if len(h1_lines) >= 2 and h1_lines[0].startswith('Chương'):
                title_rest = ' '.join(h1_lines[1:])
                output_parts.append(f"# {h1_lines[0]}: {title_rest}\n\n")
            else:
                output_parts.append(f"# {' '.join(h1_lines)}\n\n")
            i += 1
            continue
            
        # 2. H2 Heading (Section header)
        is_h2 = False
        if all_bold and max_size >= 14:
            clean_raw = re.sub(r'<sup>.*?</sup>|\d+', '', raw_text).strip()
            if is_all_caps(clean_raw) or 'CHƯƠNG' in clean_raw.upper() or 'CÁC GHI CHÚ' in clean_raw.upper():
                is_h2 = True
                
        if is_h2:
            flush_para()
            h2_lines = [format_spans(item['spans'], is_heading=True).strip()]
            while i + 1 < n and items[i+1]['type'] == 'line':
                next_spans = [s for s in items[i+1]['spans'] if s['text'].strip()]
                if next_spans and all('Bold' in s['font'] for s in next_spans) and max(s['size'] for s in next_spans) >= 14:
                    next_raw = ''.join(s['text'] for s in next_spans).strip()
                    next_clean = re.sub(r'<sup>.*?</sup>|\d+', '', next_raw).strip()
                    if is_all_caps(next_clean):
                        h2_lines.append(format_spans(items[i+1]['spans'], is_heading=True).strip())
                        i += 1
                    else:
                        break
                else:
                    break
            output_parts.append(f"## {' '.join(h2_lines)}\n\n")
            i += 1
            continue
            
        # 3. Preface date: Chicago, tháng Ba, năm 1990
        if 'Chicago, tháng Ba, năm 1990' in raw_text:
            flush_para()
            output_parts.append(f"**{raw_text}**\n\n")
            i += 1
            continue
            
        # 4. Verse / Poem (P199-200)
        if all_italic and item['bbox'][0] >= 95.0 and len(raw_text) < 65 and item['page'] in [199, 200]:
            flush_para()
            output_parts.append(f"*{raw_text}*  \n")
            i += 1
            continue
            
        # 5. Regular body line
        formatted_line = format_spans(item['spans'])
        is_indent = item['bbox'][0] >= 95.0 or item.get('has_drop_cap', False)
        
        # Check Chú Thích numbered list: e.g. "1  . " or "1."
        is_note_item = bool(re.match(r'^\d+\s*\.', raw_text))
        
        if is_indent or is_note_item:
            flush_para()
            current_para.append(formatted_line)
        else:
            current_para.append(formatted_line)
            
        i += 1
        
    flush_para()
    output_parts.append(f"---\n\n{nav_str}\n")
    return "".join(output_parts)

# Create 00_muc_luc.md and README.md
def generate_index():
    content = """# DÒNG CHẢY (FLOW)
### Tâm lý học về trải nghiệm tối ưu
**Tác giả:** Mihaly Csikszentmihalyi  
**Dịch giả:** Nhiều dịch giả  

![Bìa sách](images/cover.jpg)

---

## Mục lục

1. [Lời nói đầu](01_loi_noi_dau.md)
2. [Chương 1: Hạnh phúc được xem xét lại](02_chuong_01.md)
3. [Chương 2: Giải phẫu học về ý thức](03_chuong_02.md)
4. [Chương 3: Sự thưởng thức và chất lượng cuộc sống](04_chuong_03.md)
5. [Chương 4: Những điều kiện của trạng thái dòng chảy](05_chuong_04.md)
6. [Chương 5: Cơ thể trong dòng chảy](06_chuong_05.md)
7. [Chương 6: Dòng chảy của suy nghĩ](07_chuong_06.md)
8. [Chương 7: Làm việc như dòng chảy](08_chuong_07.md)
9. [Chương 8: Thưởng thức sự cô độc và mối quan hệ với người khác](09_chuong_08.md)
10. [Chương 9: Đánh lừa sự hỗn loạn](10_chuong_09.md)
11. [Chương 10: Tạo ra ý nghĩa](11_chuong_10.md)
12. [Những bổ sung](12_nhung_bo_sung.md)
13. [Nguồn tham khảo](13_nguon_tham_khao.md)
14. [Chú thích](14_chu_thich.md)

---
*Tài liệu được chuyển đổi từ file gốc `raw/FlowDongChay.pdf` sang Markdown đầy đủ nội dung, giữ nguyên cấu trúc, định dạng in đậm, in nghiêng, chú thích và hình ảnh minh họa.*
"""
    with open('00_muc_luc.md', 'w', encoding='utf-8') as f:
        f.write(content)
    with open('README.md', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Generated 00_muc_luc.md and README.md")

generate_index()

# Set navigation titles in metadata
for idx, ch in enumerate(chapters):
    if ch.get('prev'):
        if idx == 0:
            ch['prev_title'] = 'Mục lục'
        else:
            ch['prev_title'] = chapters[idx-1]['title'].split(':')[0]
    if ch.get('next'):
        ch['next_title'] = chapters[idx+1]['title'].split(':')[0]

for ch in chapters:
    print(f"Processing {ch['id']} ({ch['title']})...")
    items = extract_items(ch['start_page'], ch['end_page'])
    md_content = build_markdown(items, ch)
    with open(ch['id'], 'w', encoding='utf-8') as f:
        f.write(md_content)
    print(f"  -> Saved {ch['id']}: {len(md_content)} chars")

print("\nAll chapters successfully converted!")
