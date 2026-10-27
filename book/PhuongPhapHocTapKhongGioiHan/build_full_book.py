import os
import re
import fitz

doc = fitz.open('raw/PhuongPhapHocTapKhongGioiHan_JimKwik.pdf')

# 1. Extract all 28 endnotes from pages 472-475
notes_text = []
for pno in range(471, 475):
    t = doc[pno].get_text()
    notes_text.append(t)
full_notes = '\n'.join(notes_text)
if 'Chú Thích' in full_notes:
    full_notes = full_notes.split('Chú Thích', 1)[1]
parts = full_notes.split('[*]')
ALL_ENDNOTES = [p.strip().replace('\n', ' ') for p in parts if p.strip()]

# 2. Footnote occurrence mapping (page -> list of note numbers, 1-indexed)
PAGE_TO_FNS = {
    27: [1],
    63: [2],
    64: [3],
    66: [4],
    96: [5],
    131: [6],
    132: [7],
    197: [8],
    207: [9],
    228: [10],
    235: [11],
    237: [12],
    284: [13],
    286: [14, 15],
    304: [16],
    343: [17],
    350: [18],
    371: [19],
    372: [20, 21, 22, 23],
    375: [24],
    377: [25],
    413: [26, 27, 28],
}

# Image mapping
IMAGE_INFO = {
    1: {"path": "images/page_001_img_10.jpeg", "caption": "Bìa sách Phương Pháp Học Tập Không Giới Hạn"},
    2: {"path": "images/page_002_img_7.jpeg", "caption": "Mã QR truy cập"},
    31: {"path": "images/page_031_img_643.jpeg", "caption": "Phần 1: Tâm trí thông suốt"},
    36: {"path": "images/page_036_img_694.jpeg", "caption": "Thằng bé bị hỏng não"},
    38: {"path": "images/page_038_img_697.jpeg", "caption": "Chiếc mũ siêu anh hùng"},
    46: {"path": "images/page_046_img_706.jpeg", "caption": "Chiếc cốc Albert Einstein"},
    55: {"path": "images/page_055_img_717.jpeg", "caption": "Mô Hình Khai Phóng"},
    89: {"path": "images/page_089_img_895.jpeg", "caption": "Bộ não thứ hai - Trục não ruột"},
    97: {"path": "images/page_097_img_964.jpeg", "caption": "Khởi động sức mạnh"},
    103: {"path": "images/page_103_img_1016.jpeg", "caption": "Biểu đồ khoảng thời gian tập trung"},
    105: {"path": "images/page_105_img_1019.jpeg", "caption": "Hiệu ứng Primacy và Recency"},
    128: {"path": "images/page_128_img_1225.jpeg", "caption": "Phần 2: Tâm thế khai phóng"},
    146: {"path": "images/page_146_img_1312.jpeg", "caption": "Mô hình niềm tin và hành vi"},
    195: {"path": "images/page_195_img_1498.jpeg", "caption": "Phần 3: Động lực khai phóng"},
    263: {"path": "images/page_263_img_1834.jpeg", "caption": "Vòng lặp thói quen"},
    299: {"path": "images/page_299_img_1225.jpeg", "caption": "Phần 4: Phương pháp khai phóng"},
    326: {"path": "images/page_326_img_2184.jpeg", "caption": "Phương pháp lặp lại ngắt quãng"},
    426: {"path": "images/page_426_img_2576.jpeg", "caption": "Tư duy cấp số nhân và tư duy tuyến tính"},
}

SECTIONS = [
    (0, "00_Thong_tin_xuat_ban.md", 1, 2, "Thông tin xuất bản"),
    (1, "01_Loi_khen_tang.md", 3, 16, "Lời khen tặng dành cho Phương pháp học tập không giới hạn"),
    (2, "02_Loi_tua.md", 17, 24, "Lời tựa"),
    (3, "03_Loi_gioi_thieu.md", 25, 30, "Lời giới thiệu"),
    (4, "04_Phan_1_Tam_tri_thong_suot.md", 31, 32, "Phần 1: Tâm trí thông suốt"),
    (5, "05_Chuong_01_Tro_thanh_con_nguoi_khai_phong.md", 33, 60, "Chương 1: Trở thành con người khai phóng"),
    (6, "06_Chuong_02_Bay_gio_chinh_la_thoi_diem_quan_trong_nhat.md", 61, 78, "Chương 2: Bây giờ chính là thời điểm quan trọng nhất"),
    (7, "07_Chuong_03_Bo_nao_khong_gioi_han_cua_ban.md", 79, 101, "Chương 3: Bộ não không giới hạn của bạn"),
    (8, "08_Chuong_04_Phuong_phap_de_doc_va_ghi_nho_quyen_sach_nay_va_bat_cu_quyen_nao_khac.md", 102, 127, "Chương 4: Phương pháp để đọc và ghi nhớ quyển sách này và bất cứ quyển nào khác"),
    (9, "09_Phan_2_Tam_the_khai_phong.md", 128, 133, "Phần 2: Tâm thế khai phóng"),
    (10, "10_Chuong_05_Phep_thuat_cua_he_thong_niem_tin.md", 134, 163, "Chương 5: Phép thuật của hệ thống niềm tin"),
    (11, "11_Chuong_06_7_loi_noi_doi_ve_viec_hoc_hoi.md", 164, 194, "Chương 6: 7 lời nói dối về việc học hỏi"),
    (12, "12_Phan_3_Dong_luc_khai_phong.md", 195, 199, "Phần 3: Động lực khai phóng"),
    (13, "13_Chuong_07_Muc_dich.md", 200, 222, "Chương 7: Mục đích"),
    (14, "14_Chuong_08_Nang_luong.md", 223, 250, "Chương 8: Năng lượng"),
    (15, "15_Chuong_09_Nhung_buoc_nho_don_gian.md", 251, 283, "Chương 9: Những bước nhỏ đơn giản"),
    (16, "16_Chuong_10_Tuon_chay.md", 284, 298, "Chương 10: Tuôn chảy"),
    (17, "17_Phan_4_Phuong_phap_khai_phong_the_nao.md", 299, 302, "Phần 4: Phương pháp khai phóng “Thế nào”"),
    (18, "18_Chuong_11_Tap_trung.md", 303, 314, "Chương 11: Tập trung"),
    (19, "19_Chuong_12_Hoc_tap.md", 315, 340, "Chương 12: Học tập"),
    (20, "20_Chuong_13_Ghi_nho.md", 341, 376, "Chương 13: Ghi nhớ"),
    (21, "21_Chuong_14_Doc_nhanh.md", 377, 402, "Chương 14: Đọc nhanh"),
    (22, "22_Chuong_15_Tu_duy.md", 403, 432, "Chương 15: Tư duy"),
    (23, "23_Loi_ket_Quay_lai_giup_do_nguoi_khac.md", 433, 437, "Lời kết: Quay lại giúp đỡ người khác"),
    (24, "24_Ke_hoach_hanh_dong_10_ngay_khoi_dong_cung_Kwik.md", 438, 448, "Kế hoạch hành động 10 ngày khởi động cùng Kwik"),
    (25, "25_Nhung_quyen_sach_ban_nen_doc.md", 449, 452, "Những quyển sách bạn nên đọc"),
    (26, "26_Loi_cam_on.md", 453, 461, "Lời cảm ơn"),
    (27, "27_Ve_tac_gia.md", 462, 463, "Về tác giả"),
    (28, "28_Ve_Nguyen_Phuc_Quang_Ngoc.md", 464, 466, "Về Nguyễn Phúc Quang Ngọc"),
    (29, "29_Ve_Le_Thanh_Hoang_Bao.md", 467, 468, "Về Lê Thanh Hoàng Bảo"),
    (30, "30_Thu_ngo_gui_doc_gia_va_chu_thich.md", 469, 475, "Thư ngỏ gửi độc giả của Thiên Minh Book & Chú thích"),
]

def clean_inline_spacing(text):
    text = re.sub(r' +', ' ', text)
    text = text.replace(' .', '.').replace(' ,', ',').replace(' !', '!').replace(' ?', '?').replace(' :', ':')
    text = text.replace('“ ', '“').replace(' ”', '”')
    text = text.replace('‘ ', '‘').replace(' ’', '’')
    text = text.replace('** **', ' ')
    text = text.replace('cộng đồngMindshare', 'cộng đồng Mindshare')
    text = re.sub(r'\*\*\s+', ' **', text)
    text = re.sub(r'\s+\*\*', '** ', text)
    return text.strip()

def build_section_00():
    return """# PHƯƠNG PHÁP HỌC TẬP KHÔNG GIỚI HẠN

![Bìa sách Phương Pháp Học Tập Không Giới Hạn](images/page_001_img_10.jpeg)

**Tác giả:** Jim Kwik  
**Phát hành:** Thiên Minh Book  
**Nhà xuất bản Thế Giới 11/2021**  

—★—

**Mọt Truyện Group**  
*Vui lòng quét mã QR để truy cập*  

![Mã QR truy cập](images/page_002_img_7.jpeg)
"""

def build_section_01():
    out = ["# LỜI KHEN TẶNG DÀNH CHO PHƯƠNG PHÁP HỌC TẬP KHÔNG GIỚI HẠN\n"]
    current_quote = []
    current_attr = []
    
    for pno in range(3, 17):
        p = doc[pno - 1]
        blocks = p.get_text('blocks')
        for b in blocks:
            t = b[4].strip()
            if not t: continue
            if pno == 3 and ('Lời khen tặng' in t or 'PHƯƠNG PHÁP' in t or t == 'HẠN'):
                continue
            if pno == 16 and any(k in t for k in ['Dành tặng', 'khai phóng trong các bạn', 'Quyển sách này là dành cho bạn']):
                continue
                
            if t.startswith('“') or (current_quote and not current_attr and not t.startswith(('-', '—'))):
                if current_attr:
                    q_text = clean_inline_spacing(' '.join(current_quote).replace('\n', ' '))
                    a_text = clean_inline_spacing(' '.join(current_attr).replace('\n', ' '))
                    out.append(f"> {q_text}\n>\n> {a_text}\n")
                    current_quote = [t]
                    current_attr = []
                else:
                    current_quote.append(t)
            elif t.startswith(('-', '—')) or current_attr:
                if t.startswith('“'):
                    q_text = clean_inline_spacing(' '.join(current_quote).replace('\n', ' '))
                    a_text = clean_inline_spacing(' '.join(current_attr).replace('\n', ' '))
                    out.append(f"> {q_text}\n>\n> {a_text}\n")
                    current_quote = [t]
                    current_attr = []
                else:
                    current_attr.append(t)
            else:
                current_quote.append(t)
                
    if current_quote:
        q_text = clean_inline_spacing(' '.join(current_quote).replace('\n', ' '))
        a_text = clean_inline_spacing(' '.join(current_attr).replace('\n', ' '))
        out.append(f"> {q_text}\n>\n> {a_text}\n")
        
    out.append("---\n\n*Dành tặng những độc giả và học viên của tôi, cùng với người hùng được khai phóng trong các bạn. Cảm ơn bạn đã dành thời gian và tin tưởng tôi. Quyển sách này là dành cho bạn.*\n")
    return '\n'.join(out)

def build_section_25():
    intro = """# NHỮNG QUYỂN SÁCH BẠN NÊN ĐỌC

Cộng đồng của chúng tôi rất thích đọc sách. Nếu một người đã tích lũy kinh nghiệm qua nhiều thập kỷ rồi họ dùng chúng để viết ra một quyển sách, và bạn có thể đọc nó trong một vài ngày thì có nghĩa là bạn đã hấp thụ được nhiều thập kỷ kiến thức chỉ trong vài ngày.

Những người lãnh đạo đọc rất nhiều sách. Nhiều người trong cộng đồng Kwik Readers đã cam kết đọc #1bookaweek (mỗi tuần một quyển sách), nghĩa là 52 quyển mỗi năm.

Và một món quà tặng thêm nữa cùng với quyển sách này, đó là bạn có thể tham gia lớp học chuyên gia đọc nhanh dài một tiếng đồng hồ của tôi. Hãy truy cập miễn phí tại đây:

[JimKwik.com/Reading](https://JimKwik.com/Reading)

Dưới đây là ‘danh sách Kwik’, bao gồm những quyển sách nói về tâm thế, động lực và phương pháp mà tôi rất yêu thích. Chúng không được xếp theo một thứ tự bất kỳ nào cả. Để có được danh sách đầy đủ hơn, hãy truy cập vào [LimitlessBook.com/resources](https://LimitlessBook.com/resources):
"""
    books = [
        ("The Magic of Thinking Big", "David J. Schwartz"),
        ("Man's Search for Meaning", "Viktor Frankl"),
        ("Understanding Understanding", "Richard Saul Wurman"),
        ("The Tapping Solution for Manifesting Your Greatest Self", "Nick Ortner"),
        ("Start With Why", "Simon Sinek"),
        ("The 7 Habits of Highly Effective People", "Stephen R. Covey"),
        ("Change Your Brain, Change Your Life", "Dr. Daniel Amen"),
        ("The Motivation Manifesto", "Brendon Burchard"),
        ("Tiny Habits", "Dr. BJ Fogg"),
        ("Brain Food", "Lisa Mosconi"),
        ("Me to We", "Marc Kielburger & Craig Kielburger"),
        ("The Promise of a Pencil", "Adam Braun"),
        ("Miracle Mindset", "JJ Virgin"),
        ("The TB12 Method", "Tom Brady"),
        ("Super Human", "Dave Asprey"),
        ("The Infiite Game", "Simon Sinek"),
        ("The Future Is Faster Than You Think", "Steven Kotler & Peter Diamandis"),
        ("The Code of the Extraordinary Mind", "Vishen Lakhiani"),
        ("The School of Greatness", "Lewis Howes"),
        ("Stress Less, Accomplish More", "Emily Fletcher"),
        ("The Power of When", "Dr. Michael Breus"),
        ("Becoming Super Woman", "Nicole Lapin"),
        ("Chineasy Everyday", "Shaolan"),
        ("#AskGaryVee", "Gary Vaynerchuk"),
        ("Becoming Supernatural", "Dr. Joe Dispenza"),
        ("Moonwalking with Einstein", "Joshua Foer"),
        ("The Brain that Changes Itself", "Dr. Norman Doidge"),
        ("Mindset", "Carol Dweck"),
        ("The Align Method", "Aaron Alexander"),
        ("Super Brain", "Deepak Chopra and Rudolph Tanzi"),
        ("Genius Foods", "Max Lugavere"),
        ("Sleep Smarter", "Shawn Stevenson"),
        ("The UltraMind Solution", "Dr. Mark Hyman"),
        ("Spark", "Dr. John Ratey"),
        ("The 4-Hour Chef", "Tim Ferriss"),
        ("Math Doesn't Suck", "Danica Mckellar"),
        ("Boundless", "Ben Greenfild"),
        ("Six Thinking Hats", "Edward de Bono"),
        ("Thrive", "Arianna Huffigton"),
        ("The Element", "Sir Ken Robinson with Lou Aronica"),
        ("TED Talks", "Chris Anderson"),
        ("Atomic Habits", "James Clear"),
        ("Imagine It Forward", "Beth Comstock & Tahl Raz"),
        ("Belong", "Radha Agrawal"),
        ("Disrupt-Her", "Miki Agrawal"),
        ("The Ripple Effect", "Dr. Greg Wells"),
        ("Exponential Transformation", "Salim Ismail, Francisco Palao & Michelle Lapierre"),
        ("Think Like a Monk", "Jay Shetty"),
        ("The Alter Ego Effect", "Todd Herman"),
        ("How to Live a Good Life", "Jonathan Fields"),
        ("The Mind Map Book", "Barry Buzan & Tony Buzan"),
        ("The Principles", "Ray Dalio"),
        ("Re-Create Your Life", "Morty Lefkoe"),
        ("Emotional First Aid", "Dr. Guy Winch"),
        ("A Higher Branch", "Sam Makhoul"),
        ("Cancer-Free with Food", "Liana Werner-Gray"),
        ("Food Can Fix It", "Dr. Mehmet Oz"),
    ]
    lines = [intro]
    for title, author in books:
        lines.append(f"- *{title}* của {author}\n")
    return ''.join(lines)

def build_section_30():
    out = ["# THƯ NGỎ GỬI ĐỘC GIẢ CỦA THIÊN MINH BOOK\n\n### TỪ: NGUYỄN PHÚC QUANG NGỌC\n"]
    p_texts = []
    curr_para = []
    
    for pno in range(469, 472):
        p = doc[pno - 1]
        blocks = p.get_text('blocks')
        for b in blocks:
            t = b[4].strip()
            if not t: continue
            if 'THƯ NGỎ GỬI ĐỘC GIẢ' in t or 'MINH BOOK' in t or 'TỪ: NGUYỄN PHÚC QUANG NGỌC' in t:
                continue
            x0 = b[0]
            if x0 > 95:
                if curr_para:
                    p_texts.append(clean_inline_spacing(' '.join(curr_para).replace('\n', ' ')))
                curr_para = [t]
            else:
                if curr_para:
                    curr_para.append(t)
                else:
                    curr_para = [t]
    if curr_para:
        p_texts.append(clean_inline_spacing(' '.join(curr_para).replace('\n', ' ')))
        
    out.extend(['\n\n' + p for p in p_texts])
    
    # Append complete Chú Thích
    out.append("\n\n---\n\n## CHÚ THÍCH\n")
    for idx, note in enumerate(ALL_ENDNOTES):
        out.append(f"\n[^{idx+1}]: {note}\n")
        
    return ''.join(out)

def extract_merged_page_lines(p):
    d = p.get_text('dict')
    raw_lines = []
    for b in d['blocks']:
        if 'lines' in b:
            for l in b['lines']:
                spans = l['spans']
                if not spans: continue
                txt = ''.join([s['text'] for s in spans]).strip()
                if not txt: continue
                raw_lines.append({
                    'y0': round(l['bbox'][1], 1),
                    'x0': round(l['bbox'][0], 1),
                    'x1': round(l['bbox'][2], 1),
                    'y1': round(l['bbox'][3], 1),
                    'spans': spans,
                    'txt': txt
                })
    raw_lines.sort(key=lambda l: (l['y0'], l['x0']))
    merged = []
    i = 0
    while i < len(raw_lines):
        curr = raw_lines[i]
        same_y = [curr]
        j = i + 1
        while j < len(raw_lines) and abs(raw_lines[j]['y0'] - curr['y0']) < 3.5:
            if raw_lines[j]['x0'] - raw_lines[j-1]['x1'] > 80:
                break
            same_y.append(raw_lines[j])
            j += 1
        i = j
        if len(same_y) == 1:
            merged.append(curr)
        else:
            same_y.sort(key=lambda l: l['x0'])
            all_spans = []
            for item in same_y:
                all_spans.extend(item['spans'])
            merged.append({
                'y0': same_y[0]['y0'],
                'x0': same_y[0]['x0'],
                'x1': same_y[-1]['x1'],
                'y1': max(item['y1'] for item in same_y),
                'spans': all_spans,
                'txt': ' '.join([item['txt'] for item in same_y])
            })
    return merged

def format_spans(spans, pno, page_fns, chapter_fns, all_endnotes, is_heading=False):
    out = []
    is_bullet = False
    for s in spans:
        t = s['text']
        if not t: continue
        font = s['font']
        sz = round(s['size'], 1)
        alpha = s.get('alpha', 255)
        
        # footnote check
        if ('[*]' in t or t == '[*]') and (sz in (11.3, 18.7) or (alpha == 0 and sz == 11.3)):
            if page_fns:
                fn_idx = page_fns.pop(0)
                chapter_fns.append((fn_idx, all_endnotes[fn_idx - 1]))
                t = t.replace('[*]', f'[^{fn_idx}]')
            else:
                t = t.replace('[*]', '')
            out.append(t)
            continue
            
        if is_heading:
            out.append(t)
            continue
            
        if alpha == 0 and font != 'Quicksand-Regular':
            t_strip = t.strip()
            if t_strip.startswith('• '):
                is_bullet = True
                content = t_strip[2:].strip()
                out.append(f'- **{content}** ')
            elif t_strip.startswith('•'):
                is_bullet = True
                content = t_strip[1:].strip()
                out.append(f'- **{content}** ')
            else:
                out.append(f'**{t_strip}** ')
        else:
            if t.strip() in ('•', '• '):
                is_bullet = True
                out.append('- ')
            else:
                out.append(t)
    line_str = ''.join(out)
    return line_str, is_bullet

def process_chapter(sec_idx, filename, start_p, end_p, sec_title):
    chapter_fns = []
    
    if sec_idx == 0:
        return build_section_00()
    elif sec_idx == 1:
        return build_section_01()
    elif sec_idx == 25:
        return build_section_25()
    elif sec_idx == 30:
        return build_section_30()
        
    if sec_idx == 16:
        out = [f"# {sec_title}[^13]\n\n"]
        chapter_fns.append((13, ALL_ENDNOTES[12]))
    else:
        out = [f"# {sec_title}\n\n"]
    
    page_fns_copy = {p: list(PAGE_TO_FNS.get(p, [])) for p in range(start_p, end_p + 1)}
    
    current_para = []
    prev_line_info = None
    
    for pno in range(start_p, end_p + 1):
        p = doc[pno - 1]
        p_items = []
        
        # Image check
        if pno in IMAGE_INFO:
            imgs = p.get_images()
            if imgs:
                xref = imgs[0][0]
                rects = p.get_image_rects(xref)
                y0 = rects[0].y0 if rects else 100.0
                p_items.append(('IMG', y0, IMAGE_INFO[pno]["path"], IMAGE_INFO[pno]["caption"]))
                
        # Special column handling for page 353
        if pno == 353:
            memory_items = [
                'Vòi chữa cháy', 'Kim cương', 'Bong bóng bay', 'Hiệp sĩ', 'Pin',
                'Con trâu', 'Thùng chứa', 'Ván gỗ', 'Kem đánh răng', 'Bảng chỉ đường'
            ]
            for idx, m_txt in enumerate(memory_items):
                p_items.append(('BULLET', 76.0 + idx * 0.1, f'- {m_txt}'))
                
        # Special column handling for page 443
        if pno == 443:
            food_items = [
                'Trái bơ', 'Rau lá xanh', 'Quả việt quất', 'Cá hồi', 'Bông cải xanh',
                'Củ nghệ', 'Sô-cô-la đen', 'Hạt óc chó', 'Trứng', 'Nước'
            ]
            for idx, f_txt in enumerate(food_items):
                p_items.append(('BULLET', 470.5 + idx * 0.1, f'- {f_txt}'))
                
        merged_lines = extract_merged_page_lines(p)
        
        i = 0
        while i < len(merged_lines):
            l = merged_lines[i]
            y0 = l['y0']
            x0 = l['x0']
            x1 = l['x1']
            y1 = l['y1']
            spans = l['spans']
            txt = l['txt']
            font = spans[0]['font']
            alpha = spans[0].get('alpha', 255)
            
            # Skip 2-column memory words on page 353 (handled above)
            if pno == 353 and y0 < 195:
                i += 1
                continue
                
            # Skip 2-column brain foods on page 443 (handled above)
            if pno == 443 and 465 < y0 < 585:
                i += 1
                continue
            
            # Skip UVNGioMayBold on first page (already title)
            if font == 'UVNGioMayBold' and pno == start_p:
                i += 1
                continue
                
            # Quicksand-Regular (quote)
            if font == 'Quicksand-Regular':
                quote_lines = [txt]
                author = None
                j = i + 1
                while j < len(merged_lines) and merged_lines[j]['spans'][0]['font'] == 'Quicksand-Regular':
                    q_t = merged_lines[j]['txt']
                    if q_t.startswith(('-', '—', '―')):
                        author = q_t
                        if j + 1 < len(merged_lines) and merged_lines[j+1]['spans'][0]['font'] == 'Quicksand-Regular':
                            j += 1
                            author += ' ' + merged_lines[j]['txt']
                        j += 1
                        break
                    else:
                        quote_lines.append(q_t)
                    j += 1
                i = j
                q_text = clean_inline_spacing(' '.join(quote_lines))
                p_items.append(('QUOTE_BLOCK', y0, q_text, author))
                continue
                
            # All-caps headings in Bokerlam alpha==0
            if alpha == 0 and font == 'Bokerlam' and txt.isupper() and len(txt) > 3 and not txt.startswith(('“', '”', '—', '-')):
                h_text = txt
                j = i + 1
                if j < len(merged_lines) and merged_lines[j]['spans'][0].get('alpha', 255) == 0 and merged_lines[j]['txt'].isupper() and (merged_lines[j]['y0'] - y0) < 35:
                    h_text += ' ' + merged_lines[j]['txt']
                    j += 1
                i = j
                
                if h_text in ('BẮT ĐẦU CÙNG KWIK',):
                    p_items.append(('H3_KWIK', y0, h_text))
                elif h_text in ('TRƯỚC KHI CHÚNG TA TIẾP TỤC',) or re.match(r'^\d+\.\s+[A-ZÀ-Ỹ]', h_text) or h_text.startswith('TOP 10') or h_text.startswith('CÔNG CỤ BỔ SUNG'):
                    p_items.append(('H3', y0, h_text))
                elif h_text in ('THỨC UỐNG BỔ NÃO BUỔI SÁNG', 'SINH TỐ KỲ DIỆU CHO BUỔI SÁNG', 'SALAD NĂNG LƯỢNG TRÍ NÃO', 'CÁ HỒI NƯỚNG BÔNG CẢI XANH DÙNG KÈM CẢI THỤY SĨ', '“SÔ-CÔ-LA NÓNG” VỚI CA CAO, QUẾ VÀ GỪNG'):
                    p_items.append(('H4', y0, h_text))
                else:
                    p_items.append(('H2', y0, h_text))
                continue
                
            # Subheading: Điều cốt lõi
            if txt.startswith('Điều cốt lõi') and alpha == 0:
                p_items.append(('H3', y0, txt))
                i += 1
                continue
                
            # Thought quotes
            if txt.startswith('“') and txt.endswith('”') and alpha == 0:
                p_items.append(('THOUGHT', y0, f"*{txt}*"))
                i += 1
                continue
                
            # Letter on page 53
            if pno == 53 and 'Jim, cảm ơn rất nhiều' in txt:
                letter_lines = [txt]
                j = i + 1
                while j < len(merged_lines) and merged_lines[j]['spans'][0].get('alpha', 255) == 0 and not merged_lines[j]['txt'].isupper():
                    letter_lines.append(merged_lines[j]['txt'])
                    j += 1
                i = j
                p_items.append(('LETTER', y0, clean_inline_spacing(' '.join(letter_lines))))
                continue
                
            # Definition: e.g. Tâm Thế / (danh từ)
            if txt in ('Tâm Thế', 'Động Lực', 'Phương Pháp', 'Sự phá vỡ giới hạn') and alpha == 0:
                def_title = txt
                j = i + 1
                pos = ''
                if j < len(merged_lines) and '(danh từ)' in merged_lines[j]['txt']:
                    pos = '*(danh từ)*'
                    j += 1
                i = j
                p_items.append(('DEF', y0, f"**{def_title}** {pos}".strip()))
                continue
                
            # Reflective question at chapter beginning
            if pno == start_p and alpha == 0 and len(current_para) == 0 and not txt.isupper():
                q_lines = [txt]
                j = i + 1
                while j < len(merged_lines) and merged_lines[j]['spans'][0].get('alpha', 255) == 0:
                    if merged_lines[j]['txt'].isupper() and len(merged_lines[j]['txt']) > 3:
                        break
                    q_lines.append(merged_lines[j]['txt'])
                    j += 1
                i = j
                full_q = ' '.join(q_lines)
                q_list = [q.strip() + '?' for q in full_q.split('?') if q.strip()]
                for q in q_list:
                    p_items.append(('QUESTION', y0, f"*{q}*"))
                continue
                
            # Regular line with span formatting
            formatted_line, is_bullet = format_spans(spans, pno, page_fns_copy[pno], chapter_fns, ALL_ENDNOTES)
            
            if is_bullet:
                p_items.append(('BULLET', y0, formatted_line))
            else:
                p_items.append(('LINE', y0, x0, x1, y1, formatted_line, txt))
            i += 1
            
        p_items.sort(key=lambda x: x[1])
        
        for item in p_items:
            itype = item[0]
            
            if itype == 'IMG':
                if current_para:
                    out.append(clean_inline_spacing(' '.join(current_para)) + "\n\n")
                    current_para = []
                out.append(f"![{item[3]}]({item[2]})\n\n")
                prev_line_info = None
                
            elif itype == 'QUOTE_BLOCK':
                if current_para:
                    out.append(clean_inline_spacing(' '.join(current_para)) + "\n\n")
                    current_para = []
                q_text = item[2]
                author = item[3]
                if author:
                    out.append(f"> *{q_text}*\n>\n> {author}\n\n")
                else:
                    out.append(f"> *{q_text}*\n\n")
                prev_line_info = None
                
            elif itype == 'H2':
                if current_para:
                    out.append(clean_inline_spacing(' '.join(current_para)) + "\n\n")
                    current_para = []
                out.append(f"## {item[2]}\n\n")
                prev_line_info = None
                
            elif itype == 'H3_KWIK':
                if current_para:
                    out.append(clean_inline_spacing(' '.join(current_para)) + "\n\n")
                    current_para = []
                out.append(f"### BẮT ĐẦU CÙNG KWIK\n\n")
                prev_line_info = None
                
            elif itype == 'H3':
                if current_para:
                    out.append(clean_inline_spacing(' '.join(current_para)) + "\n\n")
                    current_para = []
                out.append(f"### {item[2]}\n\n")
                prev_line_info = None
                
            elif itype == 'H4':
                if current_para:
                    out.append(clean_inline_spacing(' '.join(current_para)) + "\n\n")
                    current_para = []
                out.append(f"#### {item[2]}\n\n")
                prev_line_info = None
                
            elif itype == 'THOUGHT':
                if current_para:
                    out.append(clean_inline_spacing(' '.join(current_para)) + "\n\n")
                    current_para = []
                out.append(f"{item[2]}\n\n")
                prev_line_info = None
                
            elif itype == 'LETTER':
                if current_para:
                    out.append(clean_inline_spacing(' '.join(current_para)) + "\n\n")
                    current_para = []
                out.append(f"> *{item[2]}*\n\n")
                prev_line_info = None
                
            elif itype == 'DEF':
                if current_para:
                    out.append(clean_inline_spacing(' '.join(current_para)) + "\n\n")
                    current_para = []
                out.append(f"{item[2]}\n\n")
                prev_line_info = None
                
            elif itype == 'QUESTION':
                if current_para:
                    out.append(clean_inline_spacing(' '.join(current_para)) + "\n\n")
                    current_para = []
                out.append(f"> {item[2]}\n\n")
                prev_line_info = None
                
            elif itype == 'BULLET':
                if current_para:
                    out.append(clean_inline_spacing(' '.join(current_para)) + "\n\n")
                    current_para = []
                out.append(f"{item[2]}\n")
                prev_line_info = None
                
            elif itype == 'LINE':
                _, y0, x0, x1, y1, f_text, raw_txt = item
                
                is_new_para = False
                if prev_line_info is None:
                    is_new_para = True
                else:
                    p_x0 = prev_line_info['x0']
                    p_x1 = prev_line_info['x1']
                    p_y0 = prev_line_info['y0']
                    p_raw = prev_line_info['raw_txt']
                    
                    is_prev_short = (p_x1 < 515 and p_x0 < 90) or (p_x1 < 485 and p_x0 >= 95)
                    prev_ended = is_prev_short and p_raw[-1] in ('.', '”', '?', '!', ':')
                    has_indent = (x0 - p_x0 > 20) or (x0 > 95 and p_x0 < 85)
                    dy = y0 - p_y0
                    has_vgap = (dy > 25.5 and dy < 100)
                    
                    if prev_ended or has_indent or has_vgap:
                        is_new_para = True
                    else:
                        is_new_para = False
                        
                if is_new_para:
                    if current_para:
                        out.append(clean_inline_spacing(' '.join(current_para)) + "\n\n")
                    elif out and out[-1].endswith('\n') and not out[-1].endswith('\n\n'):
                        out[-1] += '\n'
                    current_para = [f_text]
                else:
                    current_para.append(f_text)
                    
                prev_line_info = {'x0': x0, 'x1': x1, 'y0': y0, 'raw_txt': raw_txt}
                
    if current_para:
        out.append(clean_inline_spacing(' '.join(current_para)) + "\n\n")
        
    if chapter_fns:
        out.append("---\n\n### Chú thích trong chương\n\n")
        for fn_idx, note_text in chapter_fns:
            out.append(f"[^{fn_idx}]: {note_text}\n\n")
            
    return ''.join(out)

# Main execution
print("Executing complete book conversion...")
for sec_idx, filename, start_p, end_p, sec_title in SECTIONS:
    print(f"Converting [{sec_idx:02d}] {filename} (p. {start_p}-{end_p})...")
    content = process_chapter(sec_idx, filename, start_p, end_p, sec_title)
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  -> Generated {filename}: {len(content)} chars, {len(content.splitlines())} lines")

print("Done generating all book chapters.")
