#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Full converter for raw/DanhThucConNguoiPhiThuongBenTrongBan.pdf into Markdown files.
- Each chapter in a separate markdown file.
- Preserves 100% of the original content and formatting (bold, italic, bold-italic, lists, quotes, subheadings).
- Extracts and references images.
- Generates README.md with table of contents.
"""

import os
import re
import fitz

PDF_PATH = "raw/DanhThucConNguoiPhiThuongBenTrongBan.pdf"
IMAGES_DIR = "images"

os.makedirs(IMAGES_DIR, exist_ok=True)
doc = fitz.open(PDF_PATH)

# 1. Extract images
def extract_images():
    img1 = doc.extract_image(3)
    cover_jpg = os.path.join(IMAGES_DIR, "cover.jpg")
    cover_png = os.path.join(IMAGES_DIR, "cover.png")
    with open(cover_jpg, "wb") as f:
        f.write(img1["image"])
    pix1 = fitz.Pixmap(doc, 3)
    pix1.save(cover_png)
    
    pix2 = fitz.Pixmap(doc, 23)
    pix_mask = fitz.Pixmap(doc, 22)
    pix_combined = fitz.Pixmap(pix2, pix_mask)
    logo_path = os.path.join(IMAGES_DIR, "sachvui_logo.png")
    pix_combined.save(logo_path)
    print("Images extracted successfully to images/.")

extract_images()

# 2. Text styling helper
def clean_and_format_spans(spans):
    """Formats a list of spans, merging identical styles and properly wrapping bold/italic."""
    # Fix word splits across spans (e.g. 'l' + 'àm' -> 'làm')
    i = 0
    while i < len(spans) - 1:
        s1 = spans[i]
        s2 = spans[i+1]
        t1 = s1.get('text', '')
        t2 = s2.get('text', '')
        if t1.endswith('l') and t2.startswith('àm'):
            s1['text'] = t1 + 'àm'
            s2['text'] = t2[2:]
        i += 1

    clean = []
    for s in spans:
        t = s.get('text', '')
        if not t:
            continue
        font = s.get('font', '')
        flags = s.get('flags', 0)
        is_bold = 'Bold' in font or bool(flags & 16)
        is_italic = 'Ital' in font or bool(flags & 2)
        clean.append({
            'text': t,
            'bold': is_bold,
            'italic': is_italic,
            'size': s.get('size', 16.0)
        })

    if not clean:
        return ""

    # Merge consecutive identical styles
    merged = []
    for s in clean:
        if merged and merged[-1]['bold'] == s['bold'] and merged[-1]['italic'] == s['italic']:
            merged[-1]['text'] += s['text']
        else:
            merged.append(dict(s))

    # Merge pure punctuation into preceding span if both are styled or s2 was styled
    i = 0
    while i < len(merged) - 1:
        s1 = merged[i]
        s2 = merged[i+1]
        if s2['text'].strip() in {'.', ',', '!', '?', ';', ':'} and s1['text']:
            if (s1['italic'] and s2['italic']) or (s1['bold'] and s2['bold']):
                s1['text'] += s2['text']
                s2['text'] = ''
        i += 1
    merged = [s for s in merged if s['text']]

    # Add space between spans if missing between words or between two adjacent styled spans
    for i in range(len(merged) - 1):
        s1 = merged[i]
        s2 = merged[i+1]
        t1 = s1['text']
        t2 = s2['text']
        s1_styled = s1['bold'] or s1['italic']
        s2_styled = s2['bold'] or s2['italic']
        if t1 and t2:
            if t1[-1].isalnum() and t2[0].isalnum():
                s1['text'] += ' '
            elif (s1_styled and s2_styled) and not t1.endswith(' ') and not t2.startswith(' '):
                s1['text'] += ' '

    out = ""
    for s in merged:
        t = s['text']
        lspace = len(t) - len(t.lstrip(' '))
        rspace = len(t) - len(t.rstrip(' '))
        mid = t.strip(' ')
        if not mid:
            out += t
            continue

        lead = ' ' * lspace
        trail = ' ' * rspace

        if s['bold'] and s['italic']:
            piece = f"***{mid}***"
        elif s['bold']:
            piece = f"**{mid}**"
        elif s['italic']:
            piece = f"*{mid}*"
        else:
            piece = mid

        out += lead + piece + trail

    return out

def block_to_spans(b):
    spans = []
    lines = b.get('lines', [])
    for li, l in enumerate(lines):
        line_spans = [dict(s) for s in l['spans']]
        if not line_spans:
            continue
        if li > 0 and spans:
            prev_text = spans[-1]['text']
            # If line ended with hyphen (like pit-tông), check if it was word-break
            if prev_text.endswith('-') and not prev_text.endswith(' -') and not prev_text.endswith(' –'):
                pass
            else:
                if not spans[-1]['text'].endswith(' ') and not line_spans[0]['text'].startswith(' '):
                    spans[-1]['text'] += ' '
        spans.extend(line_spans)
    return spans

def is_sentence_terminator(text):
    t = text.strip()
    if not t:
        return True
    return t[-1] in '.!?:"”' or t.endswith('."') or t.endswith('!"') or t.endswith('?"')

def get_raw_text(spans):
    return ' '.join(s.get('text', '').strip() for s in spans if s.get('text', '').strip())

def is_all_bold(spans):
    return all(('Bold' in s.get('font', '') or bool(s.get('flags', 0) & 16)) for s in spans if s.get('text', '').strip())

def is_all_italic(spans):
    return all(('Ital' in s.get('font', '') or bool(s.get('flags', 0) & 2)) for s in spans if s.get('text', '').strip())

def is_subheading_text(raw_text, spans):
    t = raw_text.strip()
    if not t:
        return False
    if any(s.get('size', 16) > 20 for s in spans):
        return False
    if re.match(r'^[-–—]\s*[A-ZÀ-Ỹ]', t):
        return False
    if t.startswith('"') or t.startswith('“'):
        return False
    if re.match(r'^(Bước\s+\w+|Ngày\s+\w+)', t, re.IGNORECASE) and len(t) < 40:
        return True
    if re.match(r'^\*\s*Mục tiêu của bạn', t, re.IGNORECASE):
        return True
    if is_all_bold(spans) and len(t) < 100 and not t.endswith('.'):
        return True
    return False

# 3. Chapters metadata
chapters_meta = [
    {
        "num": 1,
        "slug": "01_Chuong_01_Nhung_uoc_mo_cho_doi_minh.md",
        "title": "NHỮNG ƯỚC MƠ CHO ĐỜI MÌNH",
        "part": "PHẦN MỘT: GIẢI PHÓNG NGUỒN TIỀM NĂNG CỦA BẠN",
        "start_page": 4,
        "end_page": 15
    },
    {
        "num": 2,
        "slug": "02_Chuong_02_Nhung_quyet_dinh_tao_suc_manh.md",
        "title": "NHỮNG QUYẾT ĐỊNH TẠO SỨC MẠNH",
        "part": "PHẦN MỘT: GIẢI PHÓNG NGUỒN TIỀM NĂNG CỦA BẠN",
        "start_page": 16,
        "end_page": 36
    },
    {
        "num": 3,
        "slug": "03_Chuong_03_Nhung_suc_manh_det_nen_cuoc_doi.md",
        "title": "NHỮNG SỨC MẠNH DỆT NÊN CUỘC ĐỜI",
        "part": "PHẦN MỘT: GIẢI PHÓNG NGUỒN TIỀM NĂNG CỦA BẠN",
        "start_page": 37,
        "end_page": 51
    },
    {
        "num": 4,
        "slug": "04_Chuong_04_Nhung_niem_tin_cua_ta.md",
        "title": "NHỮNG NIỀM TIN CỦA TA: SỨC MẠNH XÂY DỰNG VÀ SỨC MẠNH HỦY HOẠI",
        "part": "PHẦN MỘT: GIẢI PHÓNG NGUỒN TIỀM NĂNG CỦA BẠN",
        "start_page": 52,
        "end_page": 65
    },
    {
        "num": 5,
        "slug": "05_Chuong_05_Thay_doi_co_the_xay_ra_trong_nhay_mat_khong.md",
        "title": "THAY ĐỔI CÓ THỂ XẢY RA TRONG NHÁY MẮT KHÔNG?",
        "part": "PHẦN MỘT: GIẢI PHÓNG NGUỒN TIỀM NĂNG CỦA BẠN",
        "start_page": 66,
        "end_page": 75
    },
    {
        "num": 6,
        "slug": "06_Chuong_06_Thay_doi_mot_thoi_quen.md",
        "title": "THAY ĐỔI MỘT THÓI QUEN: KHOA ĐIỀU KHIỂN BẰNG LIÊN TƯỞNG",
        "part": "PHẦN MỘT: GIẢI PHÓNG NGUỒN TIỀM NĂNG CỦA BẠN",
        "start_page": 76,
        "end_page": 90
    },
    {
        "num": 7,
        "slug": "07_Chuong_07_Lam_the_nao_dat_dieu_ban_thuc_su_mong_muon.md",
        "title": "LÀM THẾ NÀO ĐẠT ĐIỀU BẠN THỰC SỰ MONG MUỐN",
        "part": "PHẦN MỘT: GIẢI PHÓNG NGUỒN TIỀM NĂNG CỦA BẠN",
        "start_page": 91,
        "end_page": 101
    },
    {
        "num": 8,
        "slug": "08_Chuong_08_Hoi_tuc_la_tra_loi.md",
        "title": "HỎI TỨC LÀ TRẢ LỜI",
        "part": "PHẦN MỘT: GIẢI PHÓNG NGUỒN TIỀM NĂNG CỦA BẠN",
        "start_page": 102,
        "end_page": 115
    },
    {
        "num": 9,
        "slug": "09_Chuong_09_Gioi_van_dung_ngon_tu_se_dem_den_thanh_cong.md",
        "title": "GIỎI VẬN DỤNG NGÔN TỪ SẼ ĐEM ĐẾN THÀNH CÔNG",
        "part": "PHẦN MỘT: GIẢI PHÓNG NGUỒN TIỀM NĂNG CỦA BẠN",
        "start_page": 116,
        "end_page": 123
    },
    {
        "num": 10,
        "slug": "10_Chuong_10_Suc_manh_cua_nhung_an_du_trong_doi_song.md",
        "title": "SỨC MẠNH CỦA NHỮNG ẨN DỤ TRONG ĐỜI SỐNG",
        "part": "PHẦN MỘT: GIẢI PHÓNG NGUỒN TIỀM NĂNG CỦA BẠN",
        "start_page": 124,
        "end_page": 129
    },
    {
        "num": 11,
        "slug": "11_Chuong_11_Muoi_cam_xuc_tao_suc_manh.md",
        "title": "MƯỜI CẢM XÚC TẠO SỨC MẠNH",
        "part": "PHẦN MỘT: GIẢI PHÓNG NGUỒN TIỀM NĂNG CỦA BẠN",
        "start_page": 130,
        "end_page": 149
    },
    {
        "num": 12,
        "slug": "12_Chuong_12_Dam_me_dieu_ky_xay_dung_tuong_lai_thoi_thuc.md",
        "title": "ĐAM MÊ DIỆU KỲ: XÂY DỰNG TƯƠNG LAI THÔI THÚC",
        "part": "PHẦN MỘT: GIẢI PHÓNG NGUỒN TIỀM NĂNG CỦA BẠN",
        "start_page": 150,
        "end_page": 161
    },
    {
        "num": 13,
        "slug": "13_Chuong_13_Muoi_ngay_thu_thach_tam_tri.md",
        "title": "MƯỜI NGÀY THỬ THÁCH TÂM TRÍ",
        "part": "PHẦN MỘT: GIẢI PHÓNG NGUỒN TIỀM NĂNG CỦA BẠN",
        "start_page": 162,
        "end_page": 167
    },
    {
        "num": 14,
        "slug": "14_Chuong_14_Anh_huong_tuyet_voi_he_thong_chu_dao_cua_ban.md",
        "title": "ẢNH HƯỞNG TUYỆT VỜI: HỆ THỐNG CHỦ ĐẠO CỦA BẠN",
        "part": "PHẦN HAI: HỆ THỐNG CHỦ ĐẠO GIÚP LÀM CHỦ ĐỜI MÌNH",
        "start_page": 168,
        "end_page": 174
    },
    {
        "num": 15,
        "slug": "15_Chuong_15_Cac_gia_tri_cua_cuoc_doi_la_ban_dinh_huong_cho_ban.md",
        "title": "CÁC GIÁ TRỊ CỦA CUỘC ĐỜI: LA BÀN ĐỊNH HƯỚNG CHO BẠN",
        "part": "PHẦN HAI: HỆ THỐNG CHỦ ĐẠO GIÚP LÀM CHỦ ĐỜI MÌNH",
        "start_page": 175,
        "end_page": 183
    },
    {
        "num": 16,
        "slug": "16_Chuong_16_Cac_nguyen_tac_ly_do_ban_khong_hanh_phuc.md",
        "title": "CÁC NGUYÊN TẮC: LÝ DO BẠN KHÔNG HẠNH PHÚC",
        "part": "PHẦN HAI: HỆ THỐNG CHỦ ĐẠO GIÚP LÀM CHỦ ĐỜI MÌNH",
        "start_page": 184,
        "end_page": 190
    },
    {
        "num": 17,
        "slug": "17_Chuong_17_Nhung_bai_hoc_cua_kinh_nghiem.md",
        "title": "NHỮNG BÀI HỌC CỦA KINH NGHIỆM: SỢI CHỈ DỆT NÊN CUỘC ĐỜI",
        "part": "PHẦN HAI: HỆ THỐNG CHỦ ĐẠO GIÚP LÀM CHỦ ĐỜI MÌNH",
        "start_page": 191,
        "end_page": 196
    },
    {
        "num": 18,
        "slug": "18_Chuong_18_Ca_tinh_bi_quyet_de_phat_trien.md",
        "title": "CÁ TÍNH: BÍ QUYẾT ĐỂ PHÁT TRIỂN",
        "part": "PHẦN HAI: HỆ THỐNG CHỦ ĐẠO GIÚP LÀM CHỦ ĐỜI MÌNH",
        "start_page": 197,
        "end_page": 203
    },
    {
        "num": 19,
        "slug": "19_Chuong_19_Van_menh_cam_xuc.md",
        "title": "VẬN MỆNH CẢM XÚC: THÀNH CÔNG ĐÍCH THỰC DUY NHẤT",
        "part": "PHẦN BA: BẢY NGÀY ĐỂ ĐỊNH HƯỚNG VẬN MỆNH CỦA BẠN",
        "start_page": 204,
        "end_page": 206
    },
    {
        "num": 20,
        "slug": "20_Chuong_20_Van_menh_than_xac.md",
        "title": "VẬN MỆNH THÂN XÁC: NGỤC TÙ ĐAU KHỔ HAY CUNG ĐIỆN HẠNH PHÚC",
        "part": "PHẦN BA: BẢY NGÀY ĐỂ ĐỊNH HƯỚNG VẬN MỆNH CỦA BẠN",
        "start_page": 207,
        "end_page": 213
    },
    {
        "num": 21,
        "slug": "21_Chuong_21_Van_menh_cac_moi_quan_he.md",
        "title": "VẬN MỆNH CÁC MỐI QUAN HỆ: NƠI ĐỂ CHIA SẺ VÀ QUAN TÂM",
        "part": "PHẦN BA: BẢY NGÀY ĐỂ ĐỊNH HƯỚNG VẬN MỆNH CỦA BẠN",
        "start_page": 214,
        "end_page": 218
    },
    {
        "num": 22,
        "slug": "22_Chuong_22_So_menh_tai_chanh.md",
        "title": "SỐ MỆNH TÀI CHÁNH: PHƯƠNG PHÁP ĐƠN GIẢN ĐỂ LÀM RA CỦA CẢI",
        "part": "PHẦN BA: BẢY NGÀY ĐỂ ĐỊNH HƯỚNG VẬN MỆNH CỦA BẠN",
        "start_page": 219,
        "end_page": 229
    },
    {
        "num": 23,
        "slug": "23_Chuong_23_Song_trung_thuc_qui_luat_cu_xu_cua_ban.md",
        "title": "SỐNG TRUNG THỰC: QUI LUẬT CƯ XỬ CỦA BẠN",
        "part": "PHẦN BA: BẢY NGÀY ĐỂ ĐỊNH HƯỚNG VẬN MỆNH CỦA BẠN",
        "start_page": 230,
        "end_page": 234
    },
    {
        "num": 24,
        "slug": "24_Chuong_24_Lam_chu_thoi_gio_va_doi_song_cua_ban.md",
        "title": "LÀM CHỦ THỜI GIỜ VÀ ĐỜI SỐNG CỦA BẠN",
        "part": "PHẦN BA: BẢY NGÀY ĐỂ ĐỊNH HƯỚNG VẬN MỆNH CỦA BẠN",
        "start_page": 235,
        "end_page": 238
    },
    {
        "num": 25,
        "slug": "25_Chuong_25_Nghi_ngoi_va_giai_tri.md",
        "title": "NGHỈ NGƠI VÀ GIẢI TRÍ: NGAY CẢ THƯỢNG ĐẾ CŨNG NGHĨ MỘT NGÀY!",
        "part": "PHẦN BA: BẢY NGÀY ĐỂ ĐỊNH HƯỚNG VẬN MỆNH CỦA BẠN",
        "start_page": 239,
        "end_page": 239
    },
    {
        "num": 26,
        "slug": "26_Chuong_26_Thach_do_tot_dinh.md",
        "title": "THÁCH ĐỐ TỘT ĐỈNH: SỨC LỰC CON NGƯỜI CÓ THỂ ĐI ĐẾN ĐÂU",
        "part": "PHẦN BỐN: BÀI HỌC VỀ VẬN MỆNH",
        "start_page": 240,
        "end_page": 251
    }
]

# 4. Front matter
def generate_front_matter():
    content = """# ĐÁNH THỨC CON NGƯỜI PHI THƯỜNG TRONG BẠN

**Tác giả: Anthony Robbins**

![Bìa sách Đánh Thức Con Người Phi Thường Trong Bạn](images/cover.jpg)

---

![Sachvui.Com](images/sachvui_logo.png)

Ebook miễn phí tại : www.Sachvui.Com  
Ebook thực hiện dành cho những bạn chưa có điều kiện mua sách.  
**Nếu bạn có khả năng hãy mua sách gốc để ủng hộ tác giả, người dịch và Nhà Xuất Bản**
"""
    with open("00_Trang_bia.md", "w", encoding="utf-8") as f:
        f.write(content)
    print("Generated 00_Trang_bia.md")

# 5. Foreword
def generate_foreword():
    lines = [
        "# LỜI NÓI ĐẦU\n",
        "Với tư cách là nhà tâm lý chính của bệnh viện Bellevue, thành phố New York, tôi chứng kiến nhiều mãnh đời khổ đau, không chỉ riêng những bệnh nhân tâm thần, mà cả ở những nhân viên \"bình thường\",\"khoẻ mạnh\" đang chữa trị cho bệnh nhân. Tôi còn thấy sự bất hạnh cả ở những người tương đối thành công và có địa vị cao đến gặp tôi ở phòng khám tư. Rất thường, sự đau đớn và sự khốn khổ là điều không mong muốn và cuối cùng cũng qua đi khi con người chịu để cho các niềm tin, tình cảm và hành động của họ làm thay đổi qui trình của đời sống. Khổ nỗi nhiều khi họ không làm thế. Họ nấn ná, rồi cố thay đổi kết quả xấu hay thường rơi vào sự lưỡng lự chỉ để than trách cuộc đời khủng khiếp của họ hay bằng cách nào đó được một ai \"sắp xếp cho\".\n",
        "Những người có khả năng để nhận ra rằng họ định đoạt kết quả của cuộc sống riêng không phải lúc nào cũng dễ. Thực tế là, nó thường là một công việc có tính chất áp đảo. Do đó, tôi luôn tìm kiếm một phương pháp và những kỹ thuật mới khi làm việc ở bệnh viện và đối với những bệnh nhân riêng của tôi. Năm năm về trước, lần đầu tiên tôi nghe biết về tác phẩm của Tony Robbins và theo một trong những khóa tập huấn của anh ở new York. Tối đó, tôi thấy là, Tony góp phần vào niềm tin của tôi khi cho rằng bất kỳ ai lành mạnh cơ bản đều có thể làm chủ và sống cuộc đời tràn đầy, ngay sau đó, tôi theo khóa học hai tuần có cấp giấy chứng nhận của Tony, cũng như cùng các đồng nghiệp và các bệnh nhân theo tiếp các khóa khác. Tôi gọi đó là khóa\"Huấn luyện cơ Bản cho cuộc sống\". Rồi tôi giới thiệu hàng loạt băng ghi âm và cuốn sách đầu tay của anh, *Năng Lực vô tận*.\n",
        "Mặc dầu một số đồng nghiệp của tôi khó chịu và ngạc nhiên khi tôi giới thiệu những tác phẩm của một thanh niên chẳng có bằng cấp, mà những ai đọc và nghe Tony là đi đến chổ tán thành. Thêm vào tài liệu đúng đắn và dễ lãnh hội, Tony có một tài năng và một phong thái lôi cuốn làm cho điều viết ra của anh dễ nắm bắt.\n",
        "Cuối cùng, vợ tôi và tôi tham dự khóa học\"Bảy Ngày Hình thành cuộc Sống\"chứa đựng những khái niệm cơ bản trong tác phẩm mới nhất của anh, ***Đánh Thức Con Người Phi Thường Trong Bạn***. Ngày nghĩ cuối tuần đó đã cho chúng tôi phương cách để tạo những thay đổi nơi những giá trị, nguyên tắc và những tiêu chuẩn so sánh, mà trên hai năm qua, đã giúp chúng tôi sống một đời sống hữu ích và tràn đầy hơn.\n",
        "Tôi nhận thấy nơi Tony một người thầy vĩ đại trong cuộc chơi đời sống. Cái nhìn thấu suốt, sự thông minh, niềm say mê và sự dấn thân xác đáng của anh ta luôn hiện diện và truyền cảm hứng. Đọc cuốn sách này như thể chúng ta ngồi đối diện với Tony và để hết tâm trí vào cuộc trò chuyện thú vị với anh. Cuốn sách này còn tiếp tục được chúng ta tham khảo như một loại sổ tay của người sử dụng cho bất kỳ lúc nào cuộc sống đặt ra những thử thách mới hay có những đòi hỏi đang diễn biến. Nó cung cấp một kho phương tiện cho sự thay đổi lâu dài, cũng như những bài học làm phong phú chất lượng cuộc sống. Thật vậy, nếu có nhiều người đọc cuốn sách này và thực tâm áp dụng những điều chỉ dẫn của nó, hẳn tôi và nhiều đồng nghiệp của tôi hết việc làm mất.\n",
        "**FREDERICK L. COVAN, Tiến sĩ triết.**"
    ]
    with open("00_Loi_noi_dau.md", "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print("Generated 00_Loi_noi_dau.md")

# 6. Parse and generate Chapter
def generate_chapter(ch):
    raw_blocks = []
    for pno in range(ch['start_page'], ch['end_page'] + 1):
        page = doc[pno]
        page_blocks = [b for b in page.get_text('dict')['blocks'] if 'lines' in b]
        for bi, b in enumerate(page_blocks):
            sp = block_to_spans(b)
            if not sp:
                continue
            
            # Check if this block should be merged with the last block of the previous page
            if bi == 0 and raw_blocks and pno > ch['start_page']:
                prev_spans = raw_blocks[-1]
                prev_text = get_raw_text(prev_spans)
                curr_text = get_raw_text(sp)
                
                is_sub = is_subheading_text(curr_text, sp)
                is_attr = bool(re.match(r'^[-–—]\s*[A-ZÀ-Ỹ]', curr_text))
                
                if not is_sub and not is_attr:
                    if not is_sentence_terminator(prev_text) or (curr_text and curr_text[0].islower()):
                        if not prev_spans[-1]['text'].endswith(' ') and not sp[0]['text'].startswith(' '):
                            prev_spans[-1]['text'] += ' '
                        raw_blocks[-1].extend(sp)
                        continue

            raw_blocks.append(sp)

    # 1. Find index of 'Chương {ch["num"]}' on first page
    first_page_blocks = [b for b in doc[ch['start_page']].get_text('dict')['blocks'] if 'lines' in b]
    chap_idx = -1
    for bi, b in enumerate(first_page_blocks[:6]):
        t = get_raw_text(block_to_spans(b)).strip()
        if re.match(r'^chương\s+' + str(ch['num']) + r'\b', t, re.IGNORECASE):
            chap_idx = bi
            break
            
    has_part_on_page = (chap_idx > 0)
    part_text_list = [get_raw_text(block_to_spans(first_page_blocks[bi])).strip() for bi in range(chap_idx)] if has_part_on_page else []
    
    # 2. Find body start index
    body_idx = chap_idx + 1
    for bi in range(chap_idx + 1, min(chap_idx + 6, len(first_page_blocks))):
        t = get_raw_text(block_to_spans(first_page_blocks[bi])).strip()
        if t.startswith('"') or t.startswith('“') or re.match(r'^ngày\s+\w+', t, re.IGNORECASE):
            body_idx = bi
            break
        if not t.isupper() and len(t) > 60:
            body_idx = bi
            break
        body_idx = bi + 1

    body_blocks = raw_blocks[body_idx:]

    # Format body blocks into markdown
    md_elements = []
    
    if has_part_on_page:
        part_heading = ': '.join(part_text_list).upper()
        # Clean up double colons if any
        part_heading = re.sub(r':\s*:', ':', part_heading)
        part_heading = re.sub(r'\s+', ' ', part_heading).strip()
        md_elements.append(f"# {part_heading}\n\n---\n")
    elif ch['num'] == 1:
        md_elements.append(f"# {ch['part']}\n\n---\n")
    
    md_elements.append(f"# CHƯƠNG {ch['num']}: {ch['title']}\n")

    i = 0
    while i < len(body_blocks):
        sp = body_blocks[i]
        raw_t = get_raw_text(sp).strip()
        
        # Check for Quote + Attribution using lookahead
        is_quote_start = raw_t.startswith('"') or raw_t.startswith('“') or (is_all_italic(sp) and len(raw_t) < 300)
        
        attr_idx = -1
        if is_quote_start:
            for k in range(i + 1, min(i + 9, len(body_blocks))):
                candidate_attr = get_raw_text(body_blocks[k]).strip()
                if re.match(r'^[-–—]\s*[A-ZÀ-Ỹ]', candidate_attr):
                    attr_idx = k
                    break
                if not (body_blocks[k][0].get('text', '').startswith('"') or is_all_italic(body_blocks[k])):
                    break
                    
        if attr_idx != -1:
            quote_lines = []
            for qk in range(i, attr_idx):
                q_text = clean_and_format_spans(body_blocks[qk]).strip()
                # strip enclosing markdown italics if present
                clean_q = re.sub(r'^\*+|\*+$', '', q_text).strip()
                quote_lines.append(f"> *{clean_q}*  ")
            
            attr_text = clean_and_format_spans(body_blocks[attr_idx]).strip()
            attr_clean = re.sub(r'^[-–—]\s*', '', attr_text).strip(' *#')
            quote_lines.append(">  ")
            quote_lines.append(f"> — **{attr_clean}**")
            
            md_elements.append('\n'.join(quote_lines) + '\n')
            i = attr_idx + 1
            continue

        # Check for standalone Attribution
        if re.match(r'^[-–—]\s*[A-ZÀ-Ỹ]', raw_t):
            attr_text = re.sub(r'^[-–—]\s*', '', raw_t).strip(' *#')
            md_elements.append(f"> — **{attr_text}**\n")
            i += 1
            continue

        # Check for special end-of-book footer in Chapter 26
        if ch['num'] == 26 and (raw_t == 'HẾT' or 'Ebook miễn phí tại' in raw_t):
            # Consume remaining blocks to produce clean ending footer
            md_elements.append("---\n\n**HẾT**\n\nEbook miễn phí tại : www.Sachvui.Com  \nEbook thực hiện dành cho những bạn chưa có điều kiện mua sách.  \n**Nếu bạn có khả năng hãy mua sách gốc để ủng hộ tác giả, người dịch và Nhà Xuất Bản**\n")
            break

        # Check for Subheadings
        if is_subheading_text(raw_t, sp):
            if i + 1 < len(body_blocks):
                next_sp = body_blocks[i+1]
                next_raw = get_raw_text(next_sp).strip()
                if is_subheading_text(next_raw, next_sp) and re.match(r'^(Bước\s+\w+|Ngày\s+\w+)', raw_t, re.IGNORECASE):
                    clean1 = clean_and_format_spans(sp).strip(' *#')
                    clean2 = clean_and_format_spans(next_sp).strip(' *#')
                    md_elements.append(f"### {clean1}: {clean2}\n")
                    i += 2
                    continue

            clean_head = clean_and_format_spans(sp).strip(' *#')
            if raw_t.startswith('Bước') or raw_t.startswith('Ngày') or raw_t.startswith('*'):
                md_elements.append(f"### {clean_head}\n")
            else:
                md_elements.append(f"## {clean_head}\n")
            i += 1
            continue

        # Normal paragraph or list item
        md_para = clean_and_format_spans(sp).strip()
        if md_para:
            md_elements.append(f"{md_para}\n")
        i += 1

    content = '\n'.join(md_elements)
    with open(ch['slug'], 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Generated {ch['slug']}")

# 7. Generate all chapters
for ch in chapters_meta:
    generate_chapter(ch)

# 8. Generate README.md
def generate_readme():
    lines = [
        "# ĐÁNH THỨC CON NGƯỜI PHI THƯỜNG TRONG BẠN",
        "",
        "**Tác giả:** Anthony Robbins  ",
        "**Thể loại:** Kỹ năng sống, Phát triển bản thân, Tư duy thành công  ",
        "**Nguyên tác:** *Awaken the Giant Within*",
        "",
        "![Đánh Thức Con Người Phi Thường Trong Bạn](images/cover.jpg)",
        "",
        "---",
        "",
        "## MỤC LỤC",
        "",
        "- [Trang bìa & Thông tin xuất bản](00_Trang_bia.md)",
        "- [Lời nói đầu (Dr. Frederick L. Covan)](00_Loi_noi_dau.md)",
        "",
        "### PHẦN MỘT: GIẢI PHÓNG NGUỒN TIỀM NĂNG CỦA BẠN",
        "",
        "- [Chương 1: Những ước mơ cho đời mình](01_Chuong_01_Nhung_uoc_mo_cho_doi_minh.md)",
        "- [Chương 2: Những quyết định tạo sức mạnh](02_Chuong_02_Nhung_quyet_dinh_tao_suc_manh.md)",
        "- [Chương 3: Những sức mạnh dệt nên cuộc đời](03_Chuong_03_Nhung_suc_manh_det_nen_cuoc_doi.md)",
        "- [Chương 4: Những niềm tin của ta: Sức mạnh xây dựng và sức mạnh hủy hoại](04_Chuong_04_Nhung_niem_tin_cua_ta.md)",
        "- [Chương 5: Thay đổi có thể xảy ra trong nháy mắt không?](05_Chuong_05_Thay_doi_co_the_xay_ra_trong_nhay_mat_khong.md)",
        "- [Chương 6: Thay đổi một thói quen: Khoa điều khiển bằng liên tưởng](06_Chuong_06_Thay_doi_mot_thoi_quen.md)",
        "- [Chương 7: Làm thế nào đạt điều bạn thực sự mong muốn](07_Chuong_07_Lam_the_nao_dat_dieu_ban_thuc_su_mong_muon.md)",
        "- [Chương 8: Hỏi tức là trả lời](08_Chuong_08_Hoi_tuc_la_tra_loi.md)",
        "- [Chương 9: Giỏi vận dụng ngôn từ sẽ đem đến thành công](09_Chuong_09_Gioi_van_dung_ngon_tu_se_dem_den_thanh_cong.md)",
        "- [Chương 10: Sức mạnh của những ẩn dụ trong đời sống](10_Chuong_10_Suc_manh_cua_nhung_an_du_trong_doi_song.md)",
        "- [Chương 11: Mười cảm xúc tạo sức mạnh](11_Chuong_11_Muoi_cam_xuc_tao_suc_manh.md)",
        "- [Chương 12: Đam mê diệu kỳ: Xây dựng tương lai thôi thúc](12_Chuong_12_Dam_me_dieu_ky_xay_dung_tuong_lai_thoi_thuc.md)",
        "- [Chương 13: Mười ngày thử thách tâm trí](13_Chuong_13_Muoi_ngay_thu_thach_tam_tri.md)",
        "",
        "### PHẦN HAI: HỆ THỐNG CHỦ ĐẠO GIÚP LÀM CHỦ ĐỜI MÌNH",
        "",
        "- [Chương 14: Ảnh hưởng tuyệt vời: Hệ thống chủ đạo của bạn](14_Chuong_14_Anh_huong_tuyet_voi_he_thong_chu_dao_cua_ban.md)",
        "- [Chương 15: Các giá trị của cuộc đời: La bàn định hướng cho bạn](15_Chuong_15_Cac_gia_tri_cua_cuoc_doi_la_ban_dinh_huong_cho_ban.md)",
        "- [Chương 16: Các nguyên tắc: Lý do bạn không hạnh phúc](16_Chuong_16_Cac_nguyen_tac_ly_do_ban_khong_hanh_phuc.md)",
        "- [Chương 17: Những bài học của kinh nghiệm: Sợi chỉ dệt nên cuộc đời](17_Chuong_17_Nhung_bai_hoc_cua_kinh_nghiem.md)",
        "- [Chương 18: Cá tính: Bí quyết để phát triển](18_Chuong_18_Ca_tinh_bi_quyet_de_phat_trien.md)",
        "",
        "### PHẦN BA: BẢY NGÀY ĐỂ ĐỊNH HƯỚNG VẬN MỆNH CỦA BẠN",
        "",
        "- [Chương 19: Vận mệnh cảm xúc: Thành công đích thực duy nhất](19_Chuong_19_Van_menh_cam_xuc.md)",
        "- [Chương 20: Vận mệnh thân xác: Ngục tù đau khổ hay cung điện hạnh phúc](20_Chuong_20_Van_menh_than_xac.md)",
        "- [Chương 21: Vận mệnh các mối quan hệ: Nơi để chia sẻ và quan tâm](21_Chuong_21_Van_menh_cac_moi_quan_he.md)",
        "- [Chương 22: Số mệnh tài chánh: Phương pháp đơn giản để làm ra của cải](22_Chuong_22_So_menh_tai_chanh.md)",
        "- [Chương 23: Sống trung thực: Qui luật cư xử của bạn](23_Chuong_23_Song_trung_thuc_qui_luat_cu_xu_cua_ban.md)",
        "- [Chương 24: Làm chủ thời giờ và đời sống của bạn](24_Chuong_24_Lam_chu_thoi_gio_va_doi_song_cua_ban.md)",
        "- [Chương 25: Nghỉ ngơi và giải trí: Ngay cả Thượng Đế cũng nghĩ một ngày!](25_Chuong_25_Nghi_ngoi_va_giai_tri.md)",
        "",
        "### PHẦN BỐN: BÀI HỌC VỀ VẬN MỆNH",
        "",
        "- [Chương 26: Thách đố tột đỉnh: Sức lực con người có thể đi đến đâu](26_Chuong_26_Thach_do_tot_dinh.md)",
        ""
    ]
    with open("README.md", "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print("Generated README.md")

generate_readme()
print("\nAll Markdown files generated successfully!")
