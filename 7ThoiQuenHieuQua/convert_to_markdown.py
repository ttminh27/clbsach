import os
import re
import fitz
import unicodedata

# 1. Full AVn Mapping
avn_pairs = {
    # 2-char sequences
    'aá': 'á', 'aâ': 'à', 'aã': 'ả', 'aä': 'ã', 'aå': 'ạ',
    'ùæ': 'ắ', 'ùç': 'ằ', 'ùè': 'ẳ', 'ùé': 'ẵ', 'ùå': 'ặ',
    'êë': 'ấ', 'êì': 'ầ', 'êí': 'ẩ', 'êî': 'ẫ', 'êå': 'ậ',
    'eá': 'é', 'eâ': 'è', 'eã': 'ẻ', 'eä': 'ẽ', 'eå': 'ẹ',
    'ïë': 'ế', 'ïì': 'ề', 'ïí': 'ể', 'ïî': 'ễ', 'ïå': 'ệ',
    'oá': 'ó', 'oâ': 'ò', 'oã': 'ỏ', 'oä': 'õ', 'oå': 'ọ',
    'öë': 'ố', 'öì': 'ồ', 'öí': 'ổ', 'öî': 'ỗ', 'öå': 'ộ',
    'úá': 'ớ', 'úâ': 'ờ', 'úã': 'ở', 'úä': 'ỡ', 'úå': 'ợ',
    'uá': 'ú', 'uâ': 'ù', 'uã': 'ủ', 'uä': 'ũ', 'uå': 'ụ',
    'ûá': 'ứ', 'ûâ': 'ừ', 'ûã': 'ử', 'ûä': 'ữ', 'ûå': 'ự',
    'yá': 'ý', 'yâ': 'ỳ', 'yã': 'ỷ', 'yä': 'ỹ', 'yå': 'ỵ',

    # Uppercase pairs
    'AÁ': 'Á', 'AÂ': 'À', 'AÃ': 'Ả', 'AÄ': 'Ã', 'AÅ': 'Ạ',
    'ÙÆ': 'Ắ', 'ÙÇ': 'Ằ', 'ÙÈ': 'Ẳ', 'ÙÉ': 'Ẵ', 'ÙÅ': 'Ặ',
    'ÊË': 'Ấ', 'ÊÌ': 'Ầ', 'ÊÍ': 'Ẩ', 'ÊÎ': 'Ẫ', 'ÊÅ': 'Ậ',
    'EÁ': 'É', 'EÂ': 'È', 'EÃ': 'Ẻ', 'EÄ': 'Ẽ', 'EÅ': 'Ẹ',
    'ÏË': 'Ế', 'ÏÌ': 'Ề', 'ÏÍ': 'Ể', 'ÏÎ': 'Ễ', 'ÏÅ': 'Ệ',
    'OÁ': 'Ó', 'OÂ': 'Ò', 'OÃ': 'Ỏ', 'OÄ': 'Õ', 'OÅ': 'Ọ',
    'ÖË': 'Ố', 'ÖÌ': 'Ồ', 'ÖÍ': 'Ổ', 'ÖÎ': 'Ỗ', 'ÖÅ': 'Ộ',
    'ÚÁ': 'Ớ', 'ÚÂ': 'Ờ', 'ÚÃ': 'Ở', 'ÚÄ': 'Ỡ', 'ÚÅ': 'Ợ',
    'UÁ': 'Ú', 'UÂ': 'Ù', 'UÃ': 'Ủ', 'UÄ': 'Ũ', 'UÅ': 'Ụ',
    'ÛÁ': 'Ứ', 'ÛÂ': 'Ừ', 'ÛÃ': 'Ử', 'ÛÄ': 'Ữ', 'ÛÅ': 'Ự',
    'YÁ': 'Ý', 'YÂ': 'Ỳ', 'YÃ': 'Ỷ', 'YÄ': 'Ỹ', 'YÅ': 'Ỵ',

    # Mixed case pairs
    'Êå': 'Ệ', 'Ïå': 'Ệ', 'Öå': 'Ộ', 'Úå': 'Ợ', 'Ûå': 'Ự', 'Aå': 'Ạ',

    # Standalone lowercase
    'ù': 'ă', 'ê': 'â', 'ï': 'ê', 'ö': 'ô', 'ú': 'ơ', 'û': 'ư',
    'ñ': 'í', 'ò': 'ì', 'ó': 'ỉ', 'ô': 'ĩ', 'õ': 'ị',
    'à': 'đ',

    # Standalone uppercase
    'Ù': 'Ă', 'Ê': 'Â', 'Ï': 'Ê', 'Ö': 'Ô', 'Ú': 'Ơ', 'Û': 'Ư',
    'Ñ': 'Í', 'Ò': 'Ì', 'Ó': 'Ỉ', 'Ô': 'Ĩ', 'Õ': 'Ị',
    'À': 'Đ',
}

_compiled_pattern = re.compile('|'.join(re.escape(k) for k in sorted(avn_pairs.keys(), key=len, reverse=True)))

def decode_avn(text):
    if not text:
        return ''
    decoded = _compiled_pattern.sub(lambda m: avn_pairs[m.group(0)], text)
    return unicodedata.normalize('NFC', decoded)

# Image map for specific pages
page_images = {
    45: '\n![Hình 1: Bức tranh cô gái trẻ](images/hinh_1_co_gai_tre.png)\n',
    48: '\n![Hình 2: Bức tranh bà lão](images/hinh_2_ba_lao.png)\n',
    73: '\n![Hình 3: Bức tranh kết hợp](images/hinh_3_ket_hop.png)\n',
    83: '\n![Mô hình 7 Thói quen - Quá trình trưởng thành liên tục](images/so_do_7_thoi_quen.png)\n',
    96: '\n![Chương 2: Thành tích cá nhân](images/so_do_chuong_2_thanh_tich_ca_nhan.png)\n',
    98: '\n![Thói quen thứ nhất: Luôn chủ động](images/so_do_thoi_quen_1.png)\n',
    108: '\n![Mô hình tính chủ động: Kích thích - Tự do lựa chọn - Phản ứng](images/so_do_mo_hinh_tinh_chu_dong.png)\n',
    123: '\n![Tiêu điểm chủ động: Vòng tròn Quan tâm và Vòng tròn Ảnh hưởng](images/so_do_tieu_diem_chu_dong.png)\n',
    124: '\n![Tiêu điểm bị động: Năng lượng tiêu cực thu hẹp Vòng tròn Ảnh hưởng](images/so_do_tieu_diem_bi_dong.png)\n',
    140: '\n![Thói quen thứ hai: Bắt đầu từ mục tiêu đã được xác định](images/so_do_thoi_quen_2.png)\n',
    178: '\n![Bảng ma trận các trọng tâm trong cuộc sống](images/so_do_cac_trong_tam_cuoc_song.png)\n',
    216: '\n![Thói quen thứ ba: Ưu tiên cho điều quan trọng nhất](images/so_do_thoi_quen_3.png)\n',
    228: '\n![Ma trận quản trị thời gian (4 Góc phần tư)](images/so_do_ma_tran_quan_ly_thoi_gian.png)\n',
    256: '\n![Sơ đồ giao phó: Giao phó mệnh lệnh vs Giao phó ủy quyền](images/so_do_giao_pho_menh_lenh_va_uy_quyen.png)\n',
    270: '\n![Chương 3: Thành tích tập thể](images/so_do_chuong_3_thanh_tich_tap_the.png)\n',
    300: '\n![Thói quen thứ tư: Tư duy cùng thắng](images/so_do_thoi_quen_4.png)\n',
    320: '\n![Năm phương diện của mô thức cùng thắng](images/so_do_5_phuong_dien_cung_thang.png)\n',
    322: '\n![Sơ đồ mối quan hệ giữa Can đảm và Thấu hiểu](images/so_do_can_dam_va_thau_hieu.png)\n',
    346: '\n![Thói quen thứ năm: Lắng nghe và thấu hiểu](images/so_do_thoi_quen_5.png)\n',
    384: '\n![Thói quen thứ sáu: Đồng tâm hiệp lực](images/so_do_thoi_quen_6.png)\n',
    408: '\n![Sơ đồ phân tích trường lực: Động lực thúc đẩy vs Áp lực kìm hãm](images/so_do_phan_tich_truong_luc.png)\n',
    418: '\n![Thói quen thứ bảy: Rèn giũa bản thân](images/so_do_thoi_quen_7.png)\n',
    470: '\n![Tiến sĩ Stephen R. Covey](images/tac_gia_stephen_covey.png)\n',
}

def is_header_or_footer(line_bbox, page_height, text, font):
    y0, y1 = line_bbox[1], line_bbox[3]
    text_clean = text.strip()
    
    # Running header at top
    if y0 < 56:
        if text_clean.isdigit():
            return True
        if 'THÓI QUEN' in text_clean.upper() or 'THOÁI QUEN' in text_clean.upper():
            return True
        if 'CHƯƠNG' in text_clean.upper() or 'CHÛÚNG' in text_clean.upper():
            return True
        if 'AVnStoneInformal' in font:
            return True

    # Running footer at bottom
    if y1 > 545:
        if text_clean.isdigit() or 'THÓI QUEN' in text_clean.upper() or 'AVnStoneInformal' in font:
            return True

    return False

def clean_markdown_formatting(text):
    # Fix Vietnamese OCR/encoding artifacts
    text = re.sub(r'thái đô(?:\*\*\*|å|\s+å|\*\*\*å)+', 'thái độ', text)
    text = re.sub(r'thái đôå', 'thái độ', text)
    text = re.sub(r'thái đô(?=\s|$|\*|,|\.)', 'thái độ', text)
    text = re.sub(r'\bầu như\b', 'Hầu như', text)

    # Merge consecutive identical tags: ***A*** ***B*** -> ***A B***
    for _ in range(6):
        text = re.sub(r'\*\*\*([^*]+?)\*\*\*\s+\*\*\*([^*]+?)\*\*\*', r'***\1 \2***', text)
        text = re.sub(r'\*\*([^*]+?)\*\*\s+\*\*([^*]+?)\*\*', r'**\1 \2**', text)
        text = re.sub(r'(?<!\*)\*([^*]+?)\*\s+\*([^*]+?)\*(?!\*)', r'*\1 \2*', text)
    
    # Fix spaces inside tags: '** text **' -> '**text**'
    text = re.sub(r'\*\*\*([^*]+?)\s+\*\*\*', r'***\1*** ', text)
    text = re.sub(r'\*\*\*\s+([^*]+?)\*\*\*', r' ***\1***', text)
    text = re.sub(r'\*\*([^*]+?)\s+\*\*', r'**\1** ', text)
    text = re.sub(r'\*\*\s+([^*]+?)\*\*', r' **\1**', text)
    text = re.sub(r'(?<!\*)\*([^*]+?)\s+\*(?!\*)', r'*\1* ', text)
    text = re.sub(r'(?<!\*)\*\s+([^*]+?)\*(?!\*)', r' *\1*', text)

    # Fix spaces between words and tags
    text = re.sub(r'(?<!\*)\s+([,.:;?!])', r'\1', text)
    text = re.sub(r'(?<!\*)([a-zA-Z0-9À-ỹ])(\*{1,3}[a-zA-Z0-9À-ỹ])', r'\1 \2', text)
    text = re.sub(r'([a-zA-Z0-9À-ỹ]\*{1,3})([a-zA-Z0-9À-ỹ])(?!\*)', r'\1 \2', text)

    # Re-merge any broken combinations
    text = re.sub(r'\*\*\s*\*', '***', text)
    text = re.sub(r'\*\s*\*\*', '***', text)
    text = re.sub(r'\*{4,}', '***', text)
    for _ in range(3):
        text = re.sub(r'\*\*\*([^*]+?)\*\*\*\s+\*\*\*([^*]+?)\*\*\*', r'***\1 \2***', text)
        text = re.sub(r'\*\*([^*]+?)\*\*\s+\*\*([^*]+?)\*\*', r'**\1 \2**', text)

    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

def parse_page_to_markdown(page, pno):
    blocks = page.get_text('dict')['blocks']
    md_elements = []
    
    # Pure image pages with just a label (Hình 1, Hình 2, Hình 3)
    pure_diagram_pages = [45, 48, 73]
    if pno in pure_diagram_pages:
        top_titles = []
        for b in blocks:
            if 'lines' in b:
                for l in b['lines']:
                    txt = decode_avn(''.join(s['text'] for s in l['spans'])).strip()
                    if txt and not is_header_or_footer(l['bbox'], page.rect.height, txt, l['spans'][0]['font']):
                        top_titles.append(txt)
        res = []
        if top_titles:
            title_text = ' - '.join(top_titles)
            res.append(f'### {title_text}\n')
        res.append(page_images[pno])
        return '\n'.join(res) + '\n'

    # Habit/Chapter Cover pages (with diagram + habit title): 96, 98, 140, 216, 270, 300, 346, 384, 418
    cover_diagram_pages = [96, 98, 140, 216, 270, 300, 346, 384, 418]
    if pno in cover_diagram_pages:
        top_titles = []
        for b in blocks:
            if 'lines' in b:
                for l in b['lines']:
                    if l['bbox'][1] < 130:
                        txt = decode_avn(''.join(s['text'] for s in l['spans'])).strip()
                        if txt and not is_header_or_footer(l['bbox'], page.rect.height, txt, l['spans'][0]['font']):
                            top_titles.append(txt)
        res = []
        if top_titles:
            title_text = ' - '.join(top_titles)
            res.append(f'# {title_text}\n')
        res.append(page_images[pno])
        return '\n'.join(res) + '\n'

    # Collect valid text blocks and handle drop caps in separate blocks
    valid_blocks = []
    pending_dropcap = ''
    
    for b in blocks:
        if 'lines' not in b:
            continue
        valid_lines = []
        for l in b['lines']:
            line_raw = ''.join(s['text'] for s in l['spans'])
            font0 = l['spans'][0]['font'] if l['spans'] else ''
            if not is_header_or_footer(l['bbox'], page.rect.height, line_raw, font0):
                valid_lines.append(l)
        if not valid_lines:
            continue
            
        if len(valid_lines) == 1 and len(valid_lines[0]['spans']) == 1:
            span = valid_lines[0]['spans'][0]
            txt = decode_avn(span['text']).strip()
            if span['size'] > 20 and len(txt) == 1:
                pending_dropcap = txt
                continue
                
        valid_blocks.append((valid_lines, pending_dropcap))
        pending_dropcap = ''

    for b_lines, dropcap in valid_blocks:
        first_span = b_lines[0]['spans'][0]
        first_font = first_span['font']
        first_size = first_span['size']
        is_quote = 'PertusT' in first_font or ('Italic' in first_font and first_size > 11.5 and b_lines[0]['bbox'][0] > 65)
        
        is_h1 = ('CorpoA' in first_font and first_size > 20) or ('Georgia' in first_font and first_size > 22)
        is_h2 = ('Georgia' in first_font and first_size > 15) or ('CorpoA' in first_font and first_size > 15)
        is_h3 = ('Giovanni-Bold' in first_font and first_size > 11) or ('Frutiger-Bold' in first_font and first_size > 11) or ('Vendome-Bold' in first_font and first_size > 11)
        
        formatted_tokens = []
        
        start_span_idx = 0
        if not dropcap and len(b_lines[0]['spans']) > 0:
            sp0 = b_lines[0]['spans'][0]
            t0 = decode_avn(sp0['text']).strip()
            if sp0['size'] > 25 and len(t0) == 1:
                dropcap = t0
                start_span_idx = 1

        for l_idx, l in enumerate(b_lines):
            spans = l['spans']
            s_start = start_span_idx if l_idx == 0 else 0
            for s_i in range(s_start, len(spans)):
                s = spans[s_i]
                txt = decode_avn(s['text'])
                if not txt:
                    continue
                font = s['font']
                flags = s['flags']
                is_bold = bool(flags & 2) or ('Bold' in font and 'Semi' not in font)
                is_italic = bool(flags & 1) or 'Italic' in font
                
                if is_h1 or is_h2 or is_h3 or is_quote:
                    fmt = 'none'
                elif is_bold and is_italic:
                    fmt = 'bold_italic'
                elif is_bold:
                    fmt = 'bold'
                elif is_italic:
                    fmt = 'italic'
                else:
                    fmt = 'none'
                
                formatted_tokens.append((txt, fmt))

        if not formatted_tokens:
            continue

        # Group adjacent spans having same format
        grouped = []
        for txt, fmt in formatted_tokens:
            if grouped and grouped[-1][1] == fmt:
                grouped[-1] = (grouped[-1][0] + ' ' + txt, fmt)
            else:
                grouped.append((txt, fmt))

        rendered_parts = []
        for txt, fmt in grouped:
            clean_t = ' '.join(txt.split())
            if not clean_t:
                continue
            if fmt == 'bold_italic':
                rendered_parts.append(f'***{clean_t}***')
            elif fmt == 'bold':
                rendered_parts.append(f'**{clean_t}**')
            elif fmt == 'italic':
                rendered_parts.append(f'*{clean_t}*')
            else:
                rendered_parts.append(clean_t)

        full_block_text = ' '.join(rendered_parts)
        if dropcap:
            full_block_text = dropcap + full_block_text

        clean_text = clean_markdown_formatting(full_block_text)
        if not clean_text:
            continue
        
        # Don't duplicate diagram text on page 83
        if pno == 83 and any(k in clean_text for k in ['Tương thuộc', 'THÀNH TÍCH TẬP THỂ', 'Rèn giũa bản thân', 'MÔ THỨC 7 THÓI QUEN']):
            continue
        
        if re.match(r'^(CHƯƠNG\s+(MỘT|HAI|BA|BỐN|NĂM|[A-Z0-9]+))', clean_text.upper()):
            md_elements.append(f'# {clean_text}\n')
        elif is_h1:
            md_elements.append(f'# {clean_text}\n')
        elif is_h2 or re.match(r'^(Thói quen thứ\s+[a-zA-Z0-9]+|CÁNH CỬA CỦA|MÔ THỨC VÀ|TỔNG QUAN VỀ|BẮT ĐẦU TỪ|THÀNH TÍCH|ĐỔI MỚI|LỜI GIỚI THIỆU|LỜI TÁC GIẢ|VỀ TÁC GIẢ|THAY LỜI KẾT)', clean_text):
            md_elements.append(f'## {clean_text}\n')
        elif is_h3 or re.match(r'^([0-9]+\.\s+[A-ZĐÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ])', clean_text):
            md_elements.append(f'### {clean_text}\n')
        elif clean_text.isupper() and len(clean_text) < 60 and not clean_text.startswith('HTTP') and not clean_text.startswith('WWW'):
            md_elements.append(f'#### {clean_text}\n')
        elif is_quote:
            lines = clean_text.split('\n')
            quote_str = '\n'.join(f'> {l}' for l in lines)
            md_elements.append(f'{quote_str}\n')
        elif clean_text.startswith('- ') or clean_text.startswith('• ') or clean_text.startswith('* '):
            md_elements.append(f'{clean_text}\n')
        else:
            md_elements.append(f'{clean_text}\n')

    if pno in page_images and pno not in pure_diagram_pages and pno not in cover_diagram_pages:
        md_elements.append(page_images[pno])

    return '\n'.join(md_elements)

def build_files():
    doc = fitz.open('raw/7ThoiQuenDeThanhDat.pdf')
    
    sections = [
        ('00_loi_gioi_thieu_va_loi_tac_gia.md', 5, 13, 'Lời giới thiệu & Lời tác giả'),
        ('01_chuong_1_nhung_khai_niem_tong_quan.md', 14, 95, 'Chương 1: Những khái niệm tổng quan'),
        ('02_chuong_2_thanh_tich_ca_nhan.md', 96, 269, 'Chương 2: Thành tích cá nhân'),
        ('03_chuong_3_thanh_tich_tap_the.md', 270, 415, 'Chương 3: Thành tích tập thể'),
        ('04_chuong_4_doi_moi.md', 416, 455, 'Chương 4: Đổi mới'),
        ('05_thay_loi_ket_va_phu_luc.md', 456, 481, 'Thay lời kết & Phụ lục'),
    ]

    for fname, start_p, end_p, title in sections:
        content_parts = []
        for pno in range(start_p, end_p + 1):
            page = doc[pno - 1]
            page_md = parse_page_to_markdown(page, pno)
            if page_md.strip():
                content_parts.append(page_md)
        
        full_content = '\n'.join(content_parts)
        full_content = re.sub(r'\n{3,}', '\n\n', full_content).strip() + '\n'
        
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(full_content)
        print(f'Generated {fname} ({len(full_content)} chars, {start_p}-{end_p})')

    readme_content = """# 7 THÓI QUEN ĐỂ THÀNH ĐẠT (The 7 Habits of Highly Effective People)

**Tác giả:** Stephen R. Covey  
**Biên dịch:** Vũ Tiến Phúc - Ban Biên Dịch First News  
**Hiệu đính:** Tổ Hợp Giáo Dục PACE  
**Nhà xuất bản:** Nhà Xuất Bản Trẻ & First News  

---

![Bìa sách 7 Thói Quen Để Thành Đạt](images/cover.png)

## Mục lục

1. [Lời giới thiệu & Lời tác giả](00_loi_gioi_thieu_va_loi_tac_gia.md)
   - Lời giới thiệu (First News & PACE)
   - Lời tác giả (Stephen R. Covey)

2. [Chương 1: Những khái niệm tổng quan](01_chuong_1_nhung_khai_niem_tong_quan.md)
   - Cánh cửa của sự thay đổi
   - Những thách thức của kỷ nguyên mới
   - Mô thức và nguyên tắc (Bắt đầu từ bên trong)
   - Tổng quan về "7 Thói quen"

3. [Chương 2: Thành tích cá nhân](02_chuong_2_thanh_tich_ca_nhan.md)
   - **Thói quen thứ nhất:** Luôn chủ động (*Be Proactive*)
   - **Thói quen thứ hai:** Bắt đầu từ mục tiêu đã được xác định (*Begin with the End in Mind*)
   - **Thói quen thứ ba:** Ưu tiên cho điều quan trọng nhất (*Put First Things First*)

4. [Chương 3: Thành tích tập thể](03_chuong_3_thanh_tich_tap_the.md)
   - Những mô thức của sự tương thuộc
   - **Thói quen thứ tư:** Tư duy cùng thắng (*Think Win/Win*)
   - **Thói quen thứ năm:** Lắng nghe và thấu hiểu (*Seek First to Understand, Then to Be Understood*)
   - **Thói quen thứ sáu:** Đồng tâm hiệp lực (*Synergize*)

5. [Chương 4: Đổi mới](04_chuong_4_doi_moi.md)
   - **Thói quen thứ bảy:** Rèn giũa bản thân (*Sharpen the Saw*)
   - Trở lại nguyên tắc "Bắt đầu từ bên trong"

6. [Thay lời kết & Phụ lục](05_thay_loi_ket_va_phu_luc.md)
   - Thay lời kết: Một cuốn sách có thể thay đổi cuộc đời bạn
   - Về tác giả Stephen R. Covey
   - Giá trị của "7 Thói quen để thành đạt"
   - Mục lục sách chi tiết
"""
    with open('README.md', 'w', encoding='utf-8') as f:
        f.write(readme_content)
    print('Generated README.md')

if __name__ == '__main__':
    build_files()
