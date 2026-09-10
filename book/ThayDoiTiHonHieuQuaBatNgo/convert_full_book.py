import fitz
import re
import os

doc = fitz.open('raw/ThayDoiTiHonHieuQuaBatNgo.pdf')
os.makedirs('images', exist_ok=True)

# 1. Extract all images to images/
image_map = {}
for pno in range(len(doc)):
    page = doc[pno]
    for img in page.get_images():
        xref = img[0]
        if xref not in image_map:
            img_dict = doc.extract_image(xref)
            ext = img_dict['ext']
            filename = f"img_p{pno+1:03d}_xref{xref}.{ext}"
            filepath = os.path.join('images', filename)
            if not os.path.exists(filepath):
                with open(filepath, 'wb') as f:
                    f.write(img_dict['image'])
            image_map[xref] = {
                'filename': filename,
                'path': filepath,
                'first_page': pno + 1,
                'width': img_dict['width'],
                'height': img_dict['height']
            }

print(f"Extracted {len(image_map)} images.")

# 2. Extract footnotes (1) to (95) from pages 366-377
full_fn_text = ''
for p in range(365, 377):
    full_fn_text += doc[p].get_text() + '\n'

pattern = re.compile(r'(?:^|\n)\s*\((\d+)\)\s*')
parts = pattern.split(full_fn_text)
footnotes = {}
for i in range(1, len(parts), 2):
    fn_num = int(parts[i])
    fn_text = parts[i+1].strip()
    fn_text = re.sub(r'[ \t]*\n[ \t]*', ' ', fn_text)
    footnotes[fn_num] = fn_text

print(f"Parsed {len(footnotes)} footnotes.")

def clean_spans(spans):
    txt_parts = []
    for s in spans:
        stxt = s['text']
        if s['size'] < 12 and stxt.isdigit() and s['font'] == 'Bokerlam':
            stxt = f'[^{stxt}]'
        txt_parts.append(stxt)
    res = ''.join(txt_parts)
    # Fix spacing around footnotes
    res = re.sub(r'\s+(\[\^\d+\])', r'\1', res)
    res = re.sub(r'(\[\^\d+\])\s+([,\.:;!?”])', r'\1\2', res)
    return res

def convert_chapter(start_page, end_page, prefix_header="", is_notes=False):
    elements = []
    
    for pno in range(start_page - 1, end_page):
        page = doc[pno]
        d = page.get_text('dict')
        
        # Images on page
        page_imgs = []
        for img in page.get_images():
            xref = img[0]
            rect = page.get_image_rects(xref)[0]
            page_imgs.append({
                'type': 'image',
                'y0': rect.y0,
                'y1': rect.y1,
                'xref': xref,
                'pno': pno + 1
            })
            
        # Drop cap
        drop_cap = None
        for b in d['blocks']:
            if 'lines' in b:
                for l in b['lines']:
                    for s in l['spans']:
                        if s['size'] > 35:
                            drop_cap = s['text'].strip()
                            
        # Lines
        page_lines = []
        for b in d['blocks']:
            if 'lines' in b:
                for l in b['lines']:
                    # filter bleed lines
                    if l['bbox'][1] >= 719.4 and len(''.join(s['text'] for s in l['spans']).strip()) <= 2:
                        continue
                    spans = [s for s in l['spans'] if s['size'] <= 35]
                    if not spans:
                        continue
                    txt = clean_spans(spans).strip()
                    if not txt:
                        continue
                    
                    is_bold = any('bold' in s['font'].lower() for s in spans)
                    is_caption = any(s['font'] == 'Tahoma' and round(s['size'], 1) == 11.2 for s in spans)
                    size = spans[0]['size']
                    
                    page_lines.append({
                        'type': 'line',
                        'y0': l['bbox'][1],
                        'y1': l['bbox'][3],
                        'x0': l['bbox'][0],
                        'text': txt,
                        'is_bold': is_bold,
                        'is_caption': is_caption,
                        'size': size,
                        'pno': pno + 1
                    })
                    
        # Interleave images and lines by y0
        items = page_imgs + page_lines
        items.sort(key=lambda x: x['y0'])
        
        # Apply drop cap to the first body text line
        drop_cap_applied = False
        for it in items:
            if it['type'] == 'image':
                img_info = image_map.get(it['xref'])
                img_file = f"images/{img_info['filename']}" if img_info else f"images/img_p{it['pno']:03d}_xref{it['xref']}.jpeg"
                elements.append(('img', f"![Hình ảnh minh họa]({img_file})"))
            else:
                l = it
                txt = l['text']
                if drop_cap and not drop_cap_applied and round(l['size'], 1) == 15.0 and l['x0'] > 105 and l['x0'] < 135:
                    txt = drop_cap + txt
                    drop_cap_applied = True
                elements.append(('line', l, txt))

    # Assemble into markdown blocks
    md_blocks = []
    if prefix_header:
        md_blocks.append(prefix_header)
        
    curr_h = []
    curr_p = []
    curr_cap = []
    in_summary = False
    has_seen_first_body = False
    prev_line_y0 = None
    
    def flush_p():
        nonlocal curr_p
        if curr_p:
            p_text = ' '.join(curr_p)
            p_text = re.sub(r'(\w+)-\s+(\w+)', r'\1-\2', p_text)
            if in_summary:
                md_blocks.append(f"- {p_text}")
            else:
                md_blocks.append(p_text)
            curr_p = []

    def flush_h():
        nonlocal curr_h
        if curr_h:
            h_text = ' '.join(curr_h)
            h_text = re.sub(r'\s+', ' ', h_text).strip()
            # If this heading is before first body text, and it's just the chapter number/title already in prefix, skip
            if not has_seen_first_body:
                # Check if it duplicates prefix
                curr_h = []
                return
            if 'tóm tắt chương' in h_text.lower():
                md_blocks.append("## Tóm tắt chương")
            else:
                md_blocks.append(f"## {h_text}")
            curr_h = []

    def flush_cap():
        nonlocal curr_cap
        if curr_cap:
            c_text = ' '.join(curr_cap)
            c_text = re.sub(r'\s+', ' ', c_text).strip()
            md_blocks.append(f"*{c_text}*")
            curr_cap = []

    for el in elements:
        el_type = el[0]
        if el_type == 'img':
            flush_p()
            flush_h()
            flush_cap()
            md_blocks.append(el[1])
            prev_line_y0 = None
            continue
            
        l, txt = el[1], el[2]
        
        # Summary header
        if 'tóm tắt chương' in txt.lower():
            flush_p()
            flush_h()
            flush_cap()
            in_summary = True
            md_blocks.append("## Tóm tắt chương")
            prev_line_y0 = None
            continue
            
        # Section heading (Tahoma-Bold or large text)
        if not is_notes and ((l['size'] > 17 and l['is_bold']) or (l['size'] > 18 and l['x0'] > 85)):
            flush_p()
            flush_cap()
            curr_h.append(txt)
            prev_line_y0 = None
            continue
        else:
            flush_h()
            
        # Caption
        if not is_notes and (l['is_caption'] or txt.startswith('Hình ') or txt.startswith('Bảng ')):
            flush_p()
            curr_cap.append(txt)
            prev_line_y0 = None
            continue
        else:
            flush_cap()
            
        # Mark that we have seen body text
        has_seen_first_body = True
            
        # Summary bullet point separation
        if in_summary:
            if prev_line_y0 is not None and (l['y0'] - prev_line_y0) > 21.0:
                flush_p()
                curr_p = [txt]
            else:
                curr_p.append(txt)
            prev_line_y0 = l['y0']
            continue

        # In notes mode (Ghi chú pages 309-363)
        if is_notes:
            if txt.startswith('CHƯƠNG ') or txt in ('GIỚI THIỆU', 'KẾT LUẬN', 'PHỤ LỤC'):
                flush_p()
                md_blocks.append(f"### {txt}")
                prev_line_y0 = l['y0']
                continue
            elif re.match(r'^\d+\s*\|', txt):
                flush_p()
                curr_p = [txt]
                prev_line_y0 = l['y0']
                continue
            else:
                curr_p.append(txt)
                prev_line_y0 = l['y0']
                continue

        # Habit Scorecard list item
        if (len(txt) < 40 and re.search(r'\s+[\+\-\=]$', txt)) or \
           (l['x0'] > 102 and len(txt) < 35 and any(txt.startswith(x) for x in ['Thức dậy', 'Tắt báo', 'Kiểm tra', 'Vào nhà', 'Leo lên', 'Tắm ', 'Đánh ', 'Xỉa ', 'Lăn ', 'Phơi ', 'Thay ', 'Pha '])):
            flush_p()
            md_blocks.append(f"- {txt}")
            prev_line_y0 = l['y0']
            continue

        # Normal paragraph start vs continuation
        is_new_p = (abs(l['x0'] - 98.0) <= 3.0) or (not curr_p)
        if is_new_p:
            flush_p()
            curr_p = [txt]
        else:
            curr_p.append(txt)
        prev_line_y0 = l['y0']

    flush_p()
    flush_h()
    flush_cap()
    
    # Collect all footnotes referenced in md_blocks
    full_content = '\n\n'.join(md_blocks)
    fn_refs = [int(x) for x in re.findall(r'\[\^(\d+)\]', full_content)]
    seen_fns = sorted(list(set(fn_refs)))
    
    if seen_fns and not is_notes:
        md_blocks.append("---\n\n## Chú thích")
        for fn in seen_fns:
            if fn in footnotes:
                md_blocks.append(f"[^{fn}]: {footnotes[fn]}")
                
    return '\n\n'.join(md_blocks)

tasks = [
    {
        'filename': '00_bat_dau.md',
        'start': 1,
        'end': 4,
        'prefix': "# BẮT ĐẦU\n\n![Bìa sách](images/img_p001_xref7.jpeg)\n\n![Trang tiêu đề](images/img_p002_xref4.jpeg)\n\n---\n"
    },
    {
        'filename': '00_gioi_thieu.md',
        'start': 5,
        'end': 17,
        'prefix': "# GIỚI THIỆU: CÂU CHUYỆN CỦA TÔI"
    },
    {
        'filename': 'chuong_01.md',
        'start': 18,
        'end': 39,
        'prefix': "# PHẦN 1: KIẾN THỨC NỀN TẢNG\n## Vì Sao Các Thay Đổi Nhỏ Có Thể Dẫn Đến Khác Biệt Lớn\n\n---\n\n# CHƯƠNG 1: SỨC MẠNH ĐÁNG KINH NGẠC CỦA THÓI QUEN NGUYÊN TỬ"
    },
    {
        'filename': 'chuong_02.md',
        'start': 40,
        'end': 56,
        'prefix': "# CHƯƠNG 2: THÓI QUEN ĐỊNH HÌNH CĂN TÍNH CON NGƯỜI BẠN NHƯ THẾ NÀO (VÀ NGƯỢC LẠI)"
    },
    {
        'filename': 'chuong_03.md',
        'start': 57,
        'end': 74,
        'prefix': "# CHƯƠNG 3: XÂY DỰNG THÓI QUEN TỐT HƠN TRONG BỐN BƯỚC ĐƠN GIẢN"
    },
    {
        'filename': 'chuong_04.md',
        'start': 75,
        'end': 86,
        'prefix': "# NGUYÊN TẮC SỐ 1: KHIẾN NÓ RÕ RÀNG\n\n---\n\n# CHƯƠNG 4: NGƯỜI ĐÀN ÔNG TRÔNG KHÔNG ỔN"
    },
    {
        'filename': 'chuong_05.md',
        'start': 87,
        'end': 100,
        'prefix': "# CHƯƠNG 5: CÁCH TỐT NHẤT BẮT ĐẦU MỘT THÓI QUEN"
    },
    {
        'filename': 'chuong_06.md',
        'start': 101,
        'end': 113,
        'prefix': "# CHƯƠNG 6: ĐỘNG LỰC ĐANG BỊ THỔI PHỒNG; MÔI TRƯỜNG CÓ Ý NGHĨA HƠN"
    },
    {
        'filename': 'chuong_07.md',
        'start': 114,
        'end': 121,
        'prefix': "# CHƯƠNG 7: BÍ MẬT ĐẰNG SAU KHẢ NĂNG TỰ CHỦ"
    },
    {
        'filename': 'chuong_08.md',
        'start': 122,
        'end': 136,
        'prefix': "# NGUYÊN TẮC SỐ 2: KHIẾN NÓ HẤP DẪN\n\n---\n\n# CHƯƠNG 8: BIẾN MỘT THÓI QUEN TRỞ NÊN KHÓ CƯỠNG"
    },
    {
        'filename': 'chuong_09.md',
        'start': 137,
        'end': 150,
        'prefix': "# CHƯƠNG 9: VAI TRÒ CỦA GIA ĐÌNH VÀ BẠN BÈ TRONG VIỆC ĐỊNH HÌNH THÓI QUEN"
    },
    {
        'filename': 'chuong_10.md',
        'start': 151,
        'end': 164,
        'prefix': "# CHƯƠNG 10: TRUY TÌM VÀ ĐIỀU CHỈNH CĂN NGUYÊN CỦA THÓI QUEN XẤU"
    },
    {
        'filename': 'chuong_11.md',
        'start': 165,
        'end': 173,
        'prefix': "# NGUYÊN TẮC SỐ 3: KHIẾN NÓ DỄ DÀNG\n\n---\n\n# CHƯƠNG 11: ĐI CHẬM, NHƯNG KHÔNG BAO GIỜ ĐI LÙI"
    },
    {
        'filename': 'chuong_12.md',
        'start': 174,
        'end': 185,
        'prefix': "# CHƯƠNG 12: QUY LUẬT NỖ LỰC ÍT NHẤT"
    },
    {
        'filename': 'chuong_13.md',
        'start': 186,
        'end': 197,
        'prefix': "# CHƯƠNG 13: PHÁ BỎ TRÌ HOÃN DÙNG NGAY QUY TẮC HAI PHÚT"
    },
    {
        'filename': 'chuong_14.md',
        'start': 198,
        'end': 209,
        'prefix': "# CHƯƠNG 14: BIẾN THÓI QUEN TỐT THÀNH TẤT YẾU VÀ THÓI QUEN XẤU THÀNH BẤT KHẢ"
    },
    {
        'filename': 'chuong_15.md',
        'start': 210,
        'end': 224,
        'prefix': "# NGUYÊN TẮC SỐ 4: KHIẾN NÓ TẠO CẢM GIÁC THỎA MÃN\n\n---\n\n# CHƯƠNG 15: THAY ĐỔI HÀNH VI: QUY TẮC CƠ BẢN"
    },
    {
        'filename': 'chuong_16.md',
        'start': 225,
        'end': 237,
        'prefix': "# CHƯƠNG 16: GẮN BÓ VỚI THÓI QUEN TỐT MỖI NGÀY"
    },
    {
        'filename': 'chuong_17.md',
        'start': 238,
        'end': 248,
        'prefix': "# CHƯƠNG 17: TRÁCH NHIỆM GIẢI TRÌNH CÓ THỂ THAY ĐỔI MỌI THỨ"
    },
    {
        'filename': 'chuong_18.md',
        'start': 249,
        'end': 264,
        'prefix': "# CHIẾN THUẬT NÂNG CAO: TỪ HƠI HƠI TỐT ĐẾN VĨ ĐẠI THỰC SỰ\n\n---\n\n# CHƯƠNG 18: SỰ THẬT VỀ NĂNG KHIẾU (Khi nào gien quan trọng và khi nào thì không)"
    },
    {
        'filename': 'chuong_19.md',
        'start': 265,
        'end': 275,
        'prefix': "# CHƯƠNG 19: QUY TẮC GOLDILOCKS: DUY TRÌ ĐỘNG LỰC TRONG ĐỜI SỐNG VÀ CÔNG VIỆC"
    },
    {
        'filename': 'chuong_20.md',
        'start': 276,
        'end': 289,
        'prefix': "# CHƯƠNG 20: MẶT TRÁI CỦA THÓI QUEN TỐT"
    },
    {
        'filename': '21_ket_luan.md',
        'start': 290,
        'end': 293,
        'prefix': "# KẾT LUẬN: BÍ QUYẾT TẠO RA KẾT QUẢ BỀN VỮNG"
    },
    {
        'filename': '22_phu_luc.md',
        'start': 294,
        'end': 305,
        'prefix': "# PHỤ LỤC"
    },
    {
        'filename': '23_loi_tri_an.md',
        'start': 306,
        'end': 308,
        'prefix': "# LỜI TRI ÂN"
    },
    {
        'filename': '24_ghi_chu.md',
        'start': 309,
        'end': 363,
        'prefix': "# GHI CHÚ VÀ TÀI LIỆU THAM KHẢO\n\n> Phần này chứa danh mục các tài liệu trích dẫn và tham khảo theo từng chương, cùng toàn bộ 95 chú thích dịch giả / tác giả.\n",
        'is_notes': True
    },
    {
        'filename': '25_thong_tin_xuat_ban.md',
        'start': 364,
        'end': 365,
        'prefix': "# THÔNG TIN XUẤT BẢN"
    }
]

for t in tasks:
    print(f"Converting {t['filename']} (pages {t['start']}-{t['end']})...")
    md = convert_chapter(t['start'], t['end'], prefix_header=t.get('prefix', ''), is_notes=t.get('is_notes', False))
    
    if t['filename'] == '24_ghi_chu.md':
        md += "\n\n---\n\n## CHÚ THÍCH CHÂN TRANG (TÁC GIẢ & DỊCH GIẢ)\n\n"
        for num in sorted(footnotes.keys()):
            md += f"**({num})** {footnotes[num]}\n\n"
            
    with open(t['filename'], 'w', encoding='utf-8') as f:
        f.write(md.strip() + '\n')
    print(f"  -> Saved {t['filename']} ({len(md)} chars)")

print("All chapters converted successfully.")
