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
            
    raw_lines.sort(key=lambda x: (x[0], x[1]))
    
    for y0, x0, l, txt in raw_lines:
        if y0 > 628:
            continue
        if txt == '“Sách hướng dẫn sử dụng cơ thể người”' or txt == 'Sách hướng dẫn sử dụng cơ thể người':
            continue
        if re.match(r'^\d+$', txt):
            continue
            
        if y0 < 135:
            top_quote_lines.append(txt)
        else:
            font0 = l['spans'][0]['font']
            size0 = l['spans'][0]['size']
            fn_lower = font0.lower()
            
            is_bold = 'bold' in fn_lower
            is_italic = 'italic' in fn_lower or 'it' in fn_lower
            
            formatted_text = clean_spans(l['spans']).strip()
            
            line_type = 'body'
            if re.match(r'^(Chương\s+\d+|Lời\s+cảm\s+tạ|Lời\s+giới\s+thiệu|Lời\s+nói\s+đầu|Lời\s+cuối\s+sách|Mục\s+lục|Phụ\s+lục|DANH\s+MỤC)', txt, re.IGNORECASE) or (size0 >= 15.5 and is_bold):
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

def build_chapter_markdown(start_p, end_p, default_title=None, figure_embeds=None):
    pages_data = []
    for p in range(start_p - 1, end_p):
        top_img, top_quote, items = parse_page(doc[p], p + 1)
        pages_data.append((p + 1, top_img, top_quote, items))
        
    output = []
    ch_h1_parts = []
    h1_emitted = False
    
    for pno, top_img, top_quote, items in pages_data:
        callout_str = None
        if top_img and top_quote:
            callout_str = f"> ![{top_quote}](images/{top_img})\n>\n> *“{top_quote}”*"
            
        callout_pending = callout_str
        
        curr_bullet = []
        curr_para = []
        
        for item in items:
            itype = item['type']
            text = item['formatted']
            
            # Clean double bold/italic markers if any
            text = re.sub(r'\*\*\s+\*\*', ' ', text)
            text = re.sub(r'\*\*\*\*', '', text)
            
            if itype == 'h1':
                if curr_bullet:
                    output.append('- ' + ' '.join(curr_bullet))
                    curr_bullet = []
                if curr_para:
                    output.append(' '.join(curr_para))
                    curr_para = []
                clean_t = text.replace('**', '').strip()
                ch_h1_parts.append(clean_t)
            elif itype == 'h2':
                if curr_bullet:
                    output.append('- ' + ' '.join(curr_bullet))
                    curr_bullet = []
                if curr_para:
                    output.append(' '.join(curr_para))
                    curr_para = []
                    
                if ch_h1_parts and not h1_emitted:
                    output.append('# ' + ': '.join(ch_h1_parts))
                    h1_emitted = True
                    
                if callout_pending:
                    output.append(callout_pending)
                    callout_pending = None
                    
                clean_t = text.replace('**', '').strip()
                output.append(f"## {clean_t}")
            elif itype == 'h3':
                if curr_bullet:
                    output.append('- ' + ' '.join(curr_bullet))
                    curr_bullet = []
                if curr_para:
                    output.append(' '.join(curr_para))
                    curr_para = []
                    
                if ch_h1_parts and not h1_emitted:
                    output.append('# ' + ': '.join(ch_h1_parts))
                    h1_emitted = True
                    
                if callout_pending:
                    output.append(callout_pending)
                    callout_pending = None
                    
                clean_t = text.replace('***', '').replace('**', '').replace('*', '').strip()
                output.append(f"### {clean_t}")
            elif itype == 'bullet':
                if curr_bullet:
                    output.append('- ' + ' '.join(curr_bullet))
                    curr_bullet = []
                if curr_para:
                    output.append(' '.join(curr_para))
                    curr_para = []
                    
                if ch_h1_parts and not h1_emitted:
                    output.append('# ' + ': '.join(ch_h1_parts))
                    h1_emitted = True
                    
                if callout_pending:
                    output.append(callout_pending)
                    callout_pending = None
                    
                clean_t = re.sub(r'^[•\-\*]\s*', '', text)
                curr_bullet.append(clean_t)
            else: # body
                if curr_bullet:
                    if not item['is_indented']:
                        curr_bullet.append(text)
                        continue
                    else:
                        output.append('- ' + ' '.join(curr_bullet))
                        curr_bullet = []
                        
                if ch_h1_parts and not h1_emitted:
                    output.append('# ' + ': '.join(ch_h1_parts))
                    h1_emitted = True
                    
                if item['is_indented']:
                    if curr_para:
                        output.append(' '.join(curr_para))
                        curr_para = []
                    if callout_pending:
                        output.append(callout_pending)
                        callout_pending = None
                    curr_para.append(text)
                else:
                    curr_para.append(text)
                    
        if curr_bullet:
            output.append('- ' + ' '.join(curr_bullet))
            curr_bullet = []
        if curr_para:
            output.append(' '.join(curr_para))
            curr_para = []
        if callout_pending:
            output.append(callout_pending)
            callout_pending = None
            
    if ch_h1_parts and not h1_emitted:
        output.insert(0, '# ' + ': '.join(ch_h1_parts))
        h1_emitted = True
    elif not h1_emitted and default_title:
        output.insert(0, f'# {default_title}')
        
    full_text = '\n\n'.join(output)
    
    # Check if we should insert figures
    if figure_embeds:
        for pattern, fig_md in figure_embeds:
            if re.search(pattern, full_text):
                full_text = re.sub(pattern, f'\\g<0>\n\n{fig_md}\n\n', full_text, count=1)
                
    full_text = re.sub(r'\n{3,}', '\n\n', full_text).strip() + '\n'
    return full_text

# Define files to generate
chapters_config = [
    {
        'file': '00-loi-cam-ta.md',
        'start': 5, 'end': 6,
        'title': 'Lời cảm tạ',
        'figures': []
    },
    {
        'file': '00-loi-gioi-thieu.md',
        'start': 7, 'end': 8,
        'title': 'Lời giới thiệu',
        'figures': []
    },
    {
        'file': '00-loi-noi-dau.md',
        'start': 9, 'end': 12,
        'title': 'Lời nói đầu: Từ quan điểm khoa học thông tin lý giải về Trung y',
        'figures': []
    },
    {
        'file': 'chuong-01-chat-van-doi-voi-y-hoc-hien-dai.md',
        'start': 17, 'end': 28,
        'title': 'Chương 1: CHẤT VẤN ĐỐI VỚI Y HỌC HIỆN ĐẠI',
        'figures': []
    },
    {
        'file': 'chuong-02-he-thong-co-the-nguoi.md',
        'start': 29, 'end': 74,
        'title': 'Chương 2: HỆ THỐNG CƠ THỂ NGƯỜI',
        'figures': [
            (r'\(hình 1\)', '![Hình 1: Hình vuông hệ thống cơ thể người](images/hinh_01.png)'),
            (r'công bố trên tạp chí “Thông báo khoa học” ở Trung Quốc.*?1998\.\)', 
             '![Hình 2.1: Biểu đồ phân bố Ca trên kinh lạc](images/hinh_02_1.png)\n\n![Hình 2.2: Biểu đồ phân bố Ca trên Đảm Kinh](images/hinh_02_2.png)\n\n![Hình 2.3: Biểu đồ phân bố Ca trên Vị Kinh](images/hinh_02_3.png)'),
        ]
    },
    {
        'file': 'chuong-03-he-thong-nang-luong-khi-huyet-cua-co-the-nguoi.md',
        'start': 75, 'end': 94,
        'title': 'Chương 3: HỆ THỐNG NĂNG LƯỢNG KHÍ HUYẾT CỦA CƠ THỂ NGƯỜI',
        'figures': [
            (r'\(hình 4\)', '![Hình 4: Sơ đồ biểu thị năng lượng khí huyết](images/hinh_04.png)')
        ]
    },
    {
        'file': 'chuong-04-han-khi.md',
        'start': 95, 'end': 111,
        'title': 'Chương 4: HÀN KHÍ',
        'figures': [
            (r'Bàng Quang Kinh \(hình 5\)', '![Hình 5: Bàng Quang Kinh](images/hinh_05.png)'),
            (r'Phế Kinh \(hình 6\)', '![Hình 6: Phế Kinh](images/hinh_06.png)'),
            (r'Vị Kinh \(hình 7\)', '![Hình 7: Vị Kinh](images/hinh_07.png)'),
            (r'Đảm Kinh \(hình 8\)', '![Hình 8: Đảm Kinh](images/hinh_08.png)')
        ]
    },
    {
        'file': 'chuong-05-benh-va-chung.md',
        'start': 112, 'end': 117,
        'title': 'Chương 5: BỆNH VÀ CHỨNG',
        'figures': [
            (r'\(hình 10\)', '![Hình 10: Huyệt Đại Bao](images/hinh_10.png)')
        ]
    },
    {
        'file': 'chuong-06-duong-sinh-hang-ngay.md',
        'start': 118, 'end': 145,
        'title': 'Chương 6: DƯỠNG SINH HÀNG NGÀY',
        'figures': [
            (r'vỗ Đảm Kinh \(hình 11\)', '![Hình 11: Vỗ Đảm Kinh](images/hinh_11.png)'),
            (r'Tâm Bao Kinh \(hình 12\)', '![Hình 12: Tâm Bao Kinh](images/hinh_12.png)'),
            (r'huyệt Đản Trung \(hình 13\)', '![Hình 13: Huyệt Đản Trung](images/hinh_13.png)'),
            (r'huyệt Côn Luân \(hình 14\)', '![Hình 14: Huyệt Côn Luân](images/hinh_14.png)'),
            (r'\(hình 15\)', '![Hình 15: Vị trí nghe tiếng nước khi day ấn Tâm Bao Kinh](images/hinh_15.png)'),
            (r'huyệt Thái Xung \(hình 16\)', '![Hình 16: Huyệt Thái Xung](images/hinh_16.png)'),
            (r'huyệt Nội Quan \(hình 17\)', '![Hình 17: Huyệt Nội Quan](images/hinh_17.png)')
        ]
    },
    {
        'file': 'chuong-07-giam-beo.md',
        'start': 146, 'end': 165,
        'title': 'Chương 7: GIẢM BÉO',
        'figures': []
    },
    {
        'file': 'chuong-08-dieu-duong-benh-man-tinh.md',
        'start': 166, 'end': 223,
        'title': 'Chương 8: ĐIỀU DƯỠNG BỆNH MẠN TÍNH',
        'figures': [
            (r'\(hình 3\)', '![Hình 3: Huyệt Xích Trạch](images/hinh_03.png)'),
            (r'Thận Kinh \(hình 18\)', '![Hình 18: Thận Kinh](images/hinh_18.png)'),
            (r'Can Kinh \(hình 19\)', '![Hình 19: Can Kinh](images/hinh_19.png)')
        ]
    },
    {
        'file': 'chuong-09-tong-ket.md',
        'start': 224, 'end': 231,
        'title': 'Chương 9: TỔNG KẾT',
        'figures': []
    },
    {
        'file': 'phu-luc-phong-van-va-trao-doi-cung-tac-gia.md',
        'start': 232, 'end': 247,
        'title': 'Phụ lục: PHỎNG VẤN VÀ TRAO ĐỔI CÙNG TÁC GIẢ',
        'figures': []
    },
    {
        'file': 'loi-cuoi-sach.md',
        'start': 248, 'end': 251,
        'title': 'Lời cuối sách: Mong muốn mọi người đều có thể tự tin về sức khỏe',
        'figures': []
    }
]

for cfg in chapters_config:
    fn = cfg['file']
    s = cfg["start"]
    e = cfg["end"]
    print(f"Generating {fn} (pages {s}-{e})...")
    md = build_chapter_markdown(cfg['start'], cfg['end'], default_title=cfg['title'], figure_embeds=cfg['figures'])
    with open(fn, 'w', encoding='utf-8') as f:
        f.write(md)

print('Chapters generated successfully!')
