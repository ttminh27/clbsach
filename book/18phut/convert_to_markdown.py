"""
Script to convert raw/18Phut.pdf into Markdown chapters with full formatting preservation.
"""
import pymupdf
import re
import os

doc = pymupdf.open('raw/18Phut.pdf')
os.makedirs('images', exist_ok=True)

# 1. Extract cover image
page1 = doc[0]
for img in page1.get_images():
    xref = img[0]
    base_img = doc.extract_image(xref)
    ext = base_img['ext']
    cover_path = f'images/cover.{ext}'
    if not os.path.exists(cover_path):
        with open(cover_path, 'wb') as f:
            f.write(base_img['image'])
        print(f"Extracted {cover_path}")
    break

def join_lines_to_paragraph(lines):
    para = ""
    for l in lines:
        l = l.strip()
        if not l: continue
        if not para:
            para = l
        else:
            if para.endswith('-'):
                para = para + l
            else:
                para = para + " " + l
    return para

def parse_section_lines(start_page, end_page):
    raw_lines = []
    for p in range(start_page - 1, end_page):
        page = doc[p]
        d = page.get_text('dict')
        for b in d['blocks']:
            if 'lines' not in b: continue
            for l in b['lines']:
                txt = ''.join(s['text'] for s in l['spans']).strip()
                if not txt: continue
                is_bold = any(('Bold' in s['font']) or (s['flags'] & 16) for s in l['spans'])
                max_sz = max(s['size'] for s in l['spans'])
                x0 = round(l['bbox'][0], 1)
                raw_lines.append({
                    'page': p + 1,
                    'x0': x0,
                    'size': max_sz,
                    'bold': is_bold,
                    'text': txt
                })
    return raw_lines

def parse_body_paragraphs(raw_lines, is_chapter=True):
    idx = 0
    title_lines = []
    subtitle_lines = []
    
    if is_chapter:
        while idx < len(raw_lines) and raw_lines[idx]['size'] >= 25:
            title_lines.append(raw_lines[idx]['text'])
            idx += 1
        while idx < len(raw_lines) and raw_lines[idx]['bold']:
            subtitle_lines.append(raw_lines[idx]['text'])
            idx += 1

    paragraphs = []
    cur_para = []
    
    for line in raw_lines[idx:]:
        txt = line['text']
        x0 = line['x0']
        
        if x0 >= 88.0:
            if cur_para:
                paragraphs.append(join_lines_to_paragraph(cur_para))
                cur_para = []
            cur_para.append(txt)
        else:
            cur_para.append(txt)
            
    if cur_para:
        paragraphs.append(join_lines_to_paragraph(cur_para))
        
    return title_lines, subtitle_lines, paragraphs

chapters_config = [
    {"file": "chuong_01_chuyen_dong_cham_lai.md", "start": 12, "end": 14, "title": "1. Chuyển Động Chậm Lại", "subtitle": "Giảm tốc quá trình tiến về phía trước"},
    {"file": "chuong_02_co_be_khien_nguoi_ca_sau_dung_lai.md", "start": 15, "end": 17, "title": "2. Cô Bé Khiến Người Cá Sấu Dừng Lại", "subtitle": "Sức mạnh to lớn của phút tạm dừng"},
    {"file": "chuong_03_ngay_andy_roi_so_lam_som.md", "start": 18, "end": 20, "title": "3. Ngày Andy Rời Sở Làm Sớm", "subtitle": "Dừng lại để tăng tốc"},
    {"file": "chuong_04_lanh_cong_giua_mua_xuan.md", "start": 21, "end": 23, "title": "4. Lạnh Cóng Giữa Mùa Xuân", "subtitle": "Nhìn nhận thế giới như nó vốn có, chứ không phải như những gì bạn mong đợi"},
    {"file": "chuong_05_da_tinh_cach_khong_phai_la_mot_chung_roi_loan.md", "start": 24, "end": 26, "title": "5. Đa Tính Cách Không Phải Là Một Chứng Rối Loạn", "subtitle": "Mở rộng cách nhìn nhận về bản thân"},
    {"file": "chuong_06_tai_sao_chung_ta_thich_susan_boyle.md", "start": 27, "end": 28, "title": "6. Tại Sao Chúng Ta Thích Susan Boyle", "subtitle": "Nhận ra tiềm năng của bạn"},
    {"file": "chuong_07_ban_khong_can_phai_thich_anh_ta.md", "start": 29, "end": 31, "title": "7. Bạn Không Cần Phải Thích Anh Ta", "subtitle": "Bạn muốn đáp xuống đâu?"},
    {"file": "chuong_08_lam_gi_khi_ban_khong_biet_phai_lam_gi.md", "start": 34, "end": 36, "title": "8. Làm Gì Khi Bạn Không Biết Phải Làm Gì", "subtitle": "Lựa chọn bước kế tiếp khi bạn ở điểm giao nhau của bốn yếu tố"},
    {"file": "chuong_09_tai_lap_tro_choi.md", "start": 37, "end": 38, "title": "9. Tái Lập Trò Chơi", "subtitle": "Yếu tố thứ nhất: Phát huy điểm mạnh của bạn"},
    {"file": "chuong_10_toi_se_lay_con_tom.md", "start": 39, "end": 40, "title": "10. Tôi Sẽ Lấy Con Tôm", "subtitle": "Yếu tố thứ hai: Chấp nhận điểm yếu của bạn"},
    {"file": "chuong_11_nhung_cho_ngoi_am_ap.md", "start": 41, "end": 43, "title": "11. Những Chỗ Ngồi Ấm Áp", "subtitle": "Yếu tố thứ ba: Khẳng định sự khác biệt của bạn"},
    {"file": "chuong_12_vi_co_truong_cuu_mang_155_hanh_khach.md", "start": 44, "end": 45, "title": "12. Vị Cơ Trưởng Cứu Mạng 155 Hành Khách", "subtitle": "Yếu tố thứ tư: Theo đuổi đam mê (khát vọng) của bạn"},
    {"file": "chuong_13_ai_cung_co_the_hoc_cach_trong_cay_chuoi.md", "start": 46, "end": 48, "title": "13. Ai Cũng Có Thể Học Cách Trồng Cây Chuối", "subtitle": "Yếu tố thứ tư: Theo đuổi đam mê của bạn (sự kiên trì)"},
    {"file": "chuong_14_cong_thuc_de_tim_thay_cong_viec_thich_hop.md", "start": 49, "end": 51, "title": "14. Công Thức Để Tìm Thấy Công Việc Thích Hợp", "subtitle": "Yếu tố thứ tư: Theo đuổi đam mê của bạn (sự thoải mái)"},
    {"file": "chuong_15_dieu_gi_quan_trong_doi_voi_ban.md", "start": 52, "end": 54, "title": "15. Điều Gì Quan Trọng Đối Với Bạn?", "subtitle": "Yếu tố thứ tư: Theo đuổi đam mê của bạn (ý nghĩa)"},
    {"file": "chuong_16_toi_la_bac_cha_me_ma_toi_buoc_phai_tro_thanh.md", "start": 55, "end": 57, "title": "16. Tôi Là Bậc Cha Mẹ Mà Tôi Buộc Phải Trở Thành", "subtitle": "Tránh tầm nhìn hẹp"},
    {"file": "chuong_17_toi_da_hut_hon_chin_ngan_luot.md", "start": 58, "end": 59, "title": "17. Tôi Đã Hụt Hơn Chín Ngàn Lượt", "subtitle": "Đừng đầu hàng sau thất bại"},
    {"file": "chuong_18_khi_tuong_lai_khong_ro_rang.md", "start": 60, "end": 62, "title": "18. Khi Tương Lai Không Rõ Ràng", "subtitle": "Đừng để bị tê liệt"},
    {"file": "chuong_19_co_the_vay.md", "start": 63, "end": 65, "title": "19. Có Thể Vậy", "subtitle": "Đừng vội phán xét"},
    {"file": "chuong_20_lam_gi_trong_nam_nay.md", "start": 66, "end": 68, "title": "20. Làm Gì Trong Năm Nay?", "subtitle": "Xây dựng trọng tâm của năm"},
    {"file": "chuong_21_nay_anh_ban_da_xay_ra_chuyen_gi.md", "start": 71, "end": 72, "title": "21. Này Anh Bạn, Đã Xảy Ra Chuyện Gì?", "subtitle": "Lên kế hoạch trước"},
    {"file": "chuong_22_tung_chu_chim_mot.md", "start": 73, "end": 76, "title": "22. Từng Chú Chim Một", "subtitle": "Quyết định việc cần làm"},
    {"file": "chuong_23_den_nham_tang.md", "start": 77, "end": 78, "title": "23. Đến Nhầm Tầng", "subtitle": "Quyết định những việc không làm"},
    {"file": "chuong_24_ngay_mai_la_khi_nao.md", "start": 79, "end": 81, "title": "24. Ngày Mai Là Khi Nào?", "subtitle": "Sử dụng thời gian biểu"},
    {"file": "chuong_25_quy_luat_3_ngay.md", "start": 82, "end": 83, "title": "25. Quy Luật 3 Ngày", "subtitle": "Gạch từng việc ra khỏi danh sách việc cần làm"},
    {"file": "chuong_26_ban_la_ai.md", "start": 84, "end": 86, "title": "26. Bạn Là Ai?", "subtitle": "Sức mạnh của tiếng bíp"},
    {"file": "chuong_27_ban_se_ngac_nhien_ve_nhung_gi_ban_phat_hien_mot_khi_ban_chu_y_den.md", "start": 87, "end": 89, "title": "27. Bạn Sẽ Ngạc Nhiên Về Những Gì Bạn Phát Hiện Một Khi Bạn Chú Ý Đến", "subtitle": "Suy ngẫm khi chiều về"},
    {"file": "chuong_28_18_phut_de_quan_ly_mot_ngay_cua_ban.md", "start": 90, "end": 92, "title": "28. 18 Phút Để Quản Lý Một Ngày Của Bạn", "subtitle": "Xây dựng thói quen mỗi ngày"},
    {"file": "chuong_29_di_chuyen_cai_ban.md", "start": 96, "end": 98, "title": "29. Di Chuyển Cái Bàn", "subtitle": "Ngăn ngừa nhu cầu cần đến động lực"},
    {"file": "chuong_30_dung_bao_gio_tu_bo_viec_an_kieng_khi_dang_doc_thuc_don_trang_mieng.md", "start": 99, "end": 100, "title": "30. Đừng Bao Giờ Từ Bỏ Việc Ăn Kiêng Khi Đang Đọc Thực Đơn Tráng Miệng", "subtitle": "Chúng ta cần ít động lực hơn chúng ta nghĩ"},
    {"file": "chuong_31_giai_phap_nintendo_wii.md", "start": 101, "end": 103, "title": "31. Giải Pháp Nintendo Wii", "subtitle": "Quan trọng là vui"},
    {"file": "chuong_31_cu_dam_ket_hop.md", "start": 104, "end": 107, "title": "31. Cú Đấm Kết Hợp", "subtitle": "Bắt đầu và duy trì"},
    {"file": "chuong_32_toi_la_kieu_nguoi.md", "start": 108, "end": 110, "title": "32. Tôi Là Kiểu Người…", "subtitle": "Câu chuyện về bản thân bạn"},
    {"file": "chuong_33_ong_bap_cay_dot_sung_tam_tri_toi.md", "start": 111, "end": 114, "title": "33. Ong bắp cày đốt sưng tâm trí tôi", "subtitle": "Rời khỏi con đường của chính bạn"},
    {"file": "chuong_34_moi_quan_he_hop_tac_mat_thoi_gian.md", "start": 115, "end": 116, "title": "34. Mối Quan Hệ Hợp Tác Mất Thời Gian", "subtitle": "Lúc nào thì nên đồng ý"},
    {"file": "chuong_35_nhung_bo_oi.md", "start": 117, "end": 119, "title": "35. Nhưng Bố Ơi…", "subtitle": "Từ chối một cách thuyết phục"},
    {"file": "chuong_36_lan_thu_ba.md", "start": 120, "end": 121, "title": "36. Lần Thứ Ba", "subtitle": "Biết khi nào nên mở lời"},
    {"file": "chuong_37_chung_ta_van_chua_muon.md", "start": 122, "end": 124, "title": "37. Chúng Ta Vẫn Chưa Muộn", "subtitle": "Tăng thời gian trung chuyển"},
    {"file": "chuong_38_con_khong_muon_den_lop_hoc_truot_tuyet.md", "start": 125, "end": 127, "title": "38. Con Không Muốn Đến Lớp Học Trượt Tuyết", "subtitle": "Giảm thời gian trung chuyển"},
    {"file": "chuong_39_chung_toi_se_be_tre_chung_toi_se_quen_anh_chung_toi_se_thay_the_anh.md", "start": 128, "end": 130, "title": "39. Chúng Tôi Sẽ Bê Trễ. Chúng Tôi Sẽ Quên Anh. Chúng Tôi Sẽ Thay Thế Anh.", "subtitle": "Làm chủ sự căng thẳng của việc thư giãn"},
    {"file": "chuong_41_obama_co_deo_day_chuyen_ngoc_trai_khong.md", "start": 131, "end": 133, "title": "41. Obama Có Đeo Dây Chuyền Ngọc Trai Không?", "subtitle": "Tạo ra những thứ gây phân tâm hiệu quả"},
    {"file": "chuong_42_ban_co_phe_thuoc_khi_dang_lam_viec_khong.md", "start": 134, "end": 136, "title": "42. Bạn Có Phê Thuốc Khi Đang Làm Việc Không?", "subtitle": "Tránh làm nhiều việc cùng một lúc"},
    {"file": "chuong_43_van_de_khong_phai_la_nhung_ky_nang_ta_that_su_co.md", "start": 137, "end": 139, "title": "43. Vấn Đề Không Phải Là Những Kỹ Năng Ta Thật Sự Có", "subtitle": "Vượt qua chủ nghĩa cầu toàn"},
    {"file": "chuong_44_vi_sao_dieu_nay_khong_hieu_qua_voi_ban.md", "start": 140, "end": 143, "title": "44. Vì Sao Điều Này Không Hiệu Quả Với Bạn?", "subtitle": "Giá trị của việc làm đúng một nửa"},
    {"file": "chuong_45_dung_dung_bong_ro_trong_san_bong_da.md", "start": 144, "end": 146, "title": "45. Đừng Dùng Bóng Rổ Trong Sân Bóng Đá", "subtitle": "Hãy linh hoạt"}
]

for ch in chapters_config:
    lines = parse_section_lines(ch['start'], ch['end'])
    _, _, paras = parse_body_paragraphs(lines, is_chapter=True)
    
    formatted_paras = []
    
    if ch['file'] == "chuong_08_lam_gi_khi_ban_khong_biet_phai_lam_gi.md":
        for p in paras:
            if "1. Tận dụng điểm mạnh 2. Chấp nhận điểm yếu" in p:
                parts = p.split("4. Theo đuổi đam mê ")
                list_str = "1. Tận dụng điểm mạnh\n2. Chấp nhận điểm yếu\n3. Khẳng định sự khác biệt\n4. Theo đuổi đam mê"
                formatted_paras.append(list_str)
                if len(parts) > 1:
                    formatted_paras.append(parts[1].strip())
            elif p.startswith("Vị trí hiện tại của chúng ta"):
                rest = p[len("Vị trí hiện tại của chúng ta"):].strip()
                formatted_paras.append("### Vị trí hiện tại của chúng ta\n\n" + rest if rest else "### Vị trí hiện tại của chúng ta")
            else:
                formatted_paras.append(p)
                
    elif ch['file'] == "chuong_18_khi_tuong_lai_khong_ro_rang.md":
        for p in paras:
            if "1. Thành tựu (khao khát" in p and "2. Hòa nhập" in p:
                formatted_paras.append("1. Thành tựu (khao khát được đối đầu với những mục tiêu ngày càng thử thách hơn)\n2. Hòa nhập (mong muốn được yêu mến/thương yêu)\n3. Quyền lực, được thể hiện bằng một trong hai cách:\n   * Cá nhân hóa (mong muốn tạo sức ảnh hưởng và được người khác tôn trọng)\n   * Xã hội hóa (mong muốn trao quyền cho người khác; giúp họ tạo sự ảnh hưởng và được tôn trọng)")
            elif "• Cá nhân hóa" in p:
                m = re.search(r'Nếu con người có cơ hội.*', p)
                if m:
                    formatted_paras.append(m.group(0))
            elif p.startswith("Vị trí hiện tại của chúng ta"):
                rest = p[len("Vị trí hiện tại của chúng ta"):].strip()
                formatted_paras.append("### Vị trí hiện tại của chúng ta\n\n" + rest if rest else "### Vị trí hiện tại của chúng ta")
            else:
                formatted_paras.append(p)
                
    elif ch['file'] == "chuong_22_tung_chu_chim_mot.md":
        skip_to_after_list = False
        for p in paras:
            if p.startswith("Hợp tác tốt với khách hàng hiện tại •"):
                table_md = """* **Hợp tác tốt với khách hàng hiện tại**
  * Gọi cho John hẹn phỏng vấn.
  * Viết báo cáo phản hồi cho Lily.
  * Lên chiến lược cho tập đoàn X.
  * Chuẩn bị cho chuyến du lịch Portland.
  * Lập kế hoạch huấn luyện với Larry.

* **Viết và thuyết trình ý tưởng**
  * Viết blog cho tuần này.
  * Viết chương sách về danh sách việc cần làm.
  * Lên lịch họp với đại lý.
  * Gọi cho Sally v/v: hội nghị Hawaii.

* **Sống vui vẻ và chăm sóc bản thân**
  * Tham gia lớp học yoga.

* **Thu hút khách hàng mới**
  * Gọi cho Paul v/v: giữ liên hệ

* **Gắn bó với gia đình và bạn bè**
  * Sắp xếp buổi hẹn với Eleanor.
  * Mời Stacy và Howie sang ăn tối.
  * Gọi cho Jessica.
  * Về đến nhà lúc 6 giờ để dỗ tụi nhỏ ngủ.

* **5% còn lại**
  * Thay nhớt cho xe.
  * Mua máy in mới.
  * Thanh toán hóa đơn.
  * Tìm mua túi cho MacBook Air.
  * Gọi Aly v/v: bài thuyết trình về kỹ năng lãnh đạo của cô ấy."""
                formatted_paras.append(table_md)
                skip_to_after_list = True
                continue
            if skip_to_after_list:
                if p.startswith("Cấu trúc này giúp tôi"):
                    skip_to_after_list = False
                    formatted_paras.append(p)
                continue
            if p.startswith("Vị trí hiện tại của chúng ta"):
                rest = p[len("Vị trí hiện tại của chúng ta"):].strip()
                formatted_paras.append("### Vị trí hiện tại của chúng ta\n\n" + rest if rest else "### Vị trí hiện tại của chúng ta")
            else:
                formatted_paras.append(p)
                
    elif ch['file'] == "chuong_28_18_phut_de_quan_ly_mot_ngay_cua_ban.md":
        for p in paras:
            if p.startswith("BƯỚC 1 (5 phút): Buổi sáng của bạn."):
                formatted_paras.append("**BƯỚC 1 (5 phút): Buổi sáng của bạn.** " + p[len("BƯỚC 1 (5 phút): Buổi sáng của bạn."):].strip())
            elif p.startswith("BƯỚC 2 (Một phút mỗi giờ): Tái tập trung."):
                formatted_paras.append("**BƯỚC 2 (Một phút mỗi giờ): Tái tập trung.** " + p[len("BƯỚC 2 (Một phút mỗi giờ): Tái tập trung."):].strip())
            elif p.startswith("BƯỚC 3 (5 phút): Buổi chiều của bạn."):
                formatted_paras.append("**BƯỚC 3 (5 phút): Buổi chiều của bạn.** " + p[len("BƯỚC 3 (5 phút): Buổi chiều của bạn."):].strip())
            elif p.startswith("Vị trí hiện tại của chúng ta"):
                rest = p[len("Vị trí hiện tại của chúng ta"):].strip()
                formatted_paras.append("### Vị trí hiện tại của chúng ta\n\n" + rest if rest else "### Vị trí hiện tại của chúng ta")
            else:
                formatted_paras.append(p)
    else:
        for p in paras:
            if p.startswith("Vị trí hiện tại của chúng ta"):
                rest = p[len("Vị trí hiện tại của chúng ta"):].strip()
                formatted_paras.append("### Vị trí hiện tại của chúng ta\n\n" + rest if rest else "### Vị trí hiện tại của chúng ta")
            else:
                formatted_paras.append(p)
                
    file_content = f"# {ch['title']}\n\n**{ch['subtitle']}**\n\n" + "\n\n".join(formatted_paras) + "\n"
    with open(ch['file'], 'w', encoding='utf-8') as f:
        f.write(file_content)

# 01_loi_gioi_thieu.md
lines = parse_section_lines(6, 9)
_, _, paras = parse_body_paragraphs(lines, is_chapter=False)
paras = [p for p in paras if p != "LỜI GIỚI THIỆU"]
with open("01_loi_gioi_thieu.md", "w", encoding="utf-8") as f:
    f.write("# LỜI GIỚI THIỆU\n\n" + "\n\n".join(paras) + "\n")

# Parts
parts_config = [
    ("phan_01_tam_dung.md", 10, 11),
    ("phan_02_lam_gi_trong_nam_nay.md", 32, 33),
    ("phan_03_lam_gi_trong_hom_nay.md", 69, 70),
    ("phan_04_lam_gi_trong_thoi_diem_nay.md", 93, 95)
]
for pfile, start, end in parts_config:
    lines = parse_section_lines(start, end)
    title, subtitle, paras = parse_body_paragraphs(lines, is_chapter=True)
    with open(pfile, "w", encoding="utf-8") as f:
        f.write(f"# {' '.join(title)}\n\n**{' '.join(subtitle)}**\n\n" + "\n\n".join(paras) + "\n")

# Conclusion & Ch 46
lines = parse_section_lines(147, 151)
ch46_idx = 0
for i, l in enumerate(lines):
    if "46. Bạn Không Có" in l['text']:
        ch46_idx = i
        break
ch46_lines = lines[ch46_idx:]
title46, sub46, paras46 = parse_body_paragraphs(ch46_lines, is_chapter=True)
with open("phan_ket_luan_chuong_46_ban_khong_co_10_cach_hanh_xu_vang.md", "w", encoding="utf-8") as f:
    f.write("# KẾT LUẬN\n\n## Bây Giờ Thì Sao?\n\n---\n\n" + f"# {' '.join(title46)}\n\n**{' '.join(sub46)}**\n\n" + "\n\n".join(paras46) + "\n")

# loi_cam_on.md
lines = parse_section_lines(152, 153)
_, _, paras = parse_body_paragraphs(lines, is_chapter=False)
paras = [p for p in paras if p != "LỜI CẢM ƠN"]
with open("loi_cam_on.md", "w", encoding="utf-8") as f:
    f.write("# LỜI CẢM ƠN\n\n" + "\n\n".join(paras) + "\n")

print("All files successfully processed.")
