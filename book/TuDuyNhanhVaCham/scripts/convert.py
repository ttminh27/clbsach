#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Full, refined conversion of TuDuyNhanhVaCham.pdf into Markdown files by chapter.
Extracts images into images/ and creates markdown references.
Preserves original content and formatting (bold, italic, lists, quotes, tables).
"""

import os
import re
import fitz

IMAGE_MAP = {
    1: {"name": "cover.jpg", "caption": "Bìa sách Tư duy nhanh và chậm"},
    33: {"name": "chuong_01_mau_thuan.jpg", "caption": "Hình minh họa mâu thuẫn nhận thức (Hiệu ứng Stroop)"},
    35: {"name": "chuong_01_ao_giac.jpg", "caption": "Ảo giác Müller-Lyer"},
    70: {"name": "chuong_04_hinh_4.jpg", "caption": "Hình 4: Hiệu ứng mồi"},
    73: {"name": "chuong_05_hinh_5.jpg", "caption": "Hình 5: Các yếu tố tạo nên nhận thức cảm tính và hệ quả"},
    95: {"name": "chuong_07_hinh_6.jpg", "caption": "Hình 6: Phớt lờ sự mơ hồ và loại trừ sự hoài nghi"},
    109: {"name": "chuong_08_hinh_7.jpg", "caption": "Hình 7: Chiều dài trung bình của các đoạn thẳng"},
    110: {"name": "chuong_08_hinh_8.jpg", "caption": "Hình 8: So sánh các đoạn thẳng"},
    119: {"name": "chuong_09_hinh_9.jpg", "caption": "Hình 9: Ảo giác kích thước theo luật xa gần"},
    321: {"name": "chuong_26_hinh_10.jpg", "caption": "Hình 10: Hàm giá trị trong lý thuyết viễn cảnh"},
    329: {"name": "chuong_27_hinh_11.jpg", "caption": "Hình 11: Biểu đồ đường bàng quan (Hiệu ứng sở hữu)"},
    341: {"name": "chuong_28_hinh_12.jpg", "caption": "Hình 12: Biểu cảm khuôn mặt và từ ngữ cảm xúc"},
    416: {"name": "chuong_34_hinh_14.jpg", "caption": "Hình 14: Hoạt động não bộ và hiệu ứng đóng khung"},
    429: {"name": "chuong_35_hinh_15.jpg", "caption": "Hình 15: Mức độ đau đớn qua thời gian của bệnh nhân A và bệnh nhân B"},
    450: {"name": "chuong_38_hinh_16.jpg", "caption": "Hình 16: Mức độ hài lòng cuộc sống quanh thời điểm kết hôn"}
}

KNOWN_SUBHEADINGS = {
    "NGUỒN GỐC", "CHÚNG TA ĐANG Ở ĐÂU?", "Chuyện gì tiếp theo", "Hai hệ thống",
    "Tóm tắt dàn ý:", "MÂU THUẪN", "ẢO GIÁC", "HƯ CẤU HỮU ÍCH",
    "PHÁT NGÔN CỦA HAI NHÂN VẬT: HỆ THỐNG 1 VÀ HỆ THỐNG 2", "NỖ LỰC TINH THẦN",
    "CHÚ Ý VÀ NỖ LỰC LÊN TIẾNG", "Hệ thống 2 – Bận rộn và suy yếu",
    "HỆ THỐNG 2 LƯỜI BIẾNG", "TRÍ TUỆ, KIỂM SOÁT, LÝ TRÍ", "KIỂM SOÁT LÊN TIẾNG",
    "Sự kỳ diệu của hiệu ứng mồi", "Hiệu ứng mồi dẫn dắt", "HIỆU ỨNG MỒI LÊN TIẾNG",
    "ẢO GIÁC VỀ TRÍ NHỚ", "ẢO TƯỞNG VỀ SỰ THẬT", "THÔNG ĐIỆP THUYẾT PHỤC",
    "LÝ TRÍ VÀ NỖ LỰC", "SỰ THÍCH THÚ CỦA NHẬN THỨC CẢM TÍNH",
    "CẢM TÍNH, TÂM TRẠNG VÀ BẢN NĂNG", "NHẬN THỨC CẢM TÍNH LÊN TIẾNG",
    "ĐÁNH GIÁ TIÊU CHUẨN", "NHÌN RA NGUYÊN NHÂN VÀ MỤC ĐÍCH",
    "SỰ CHUẨN MỰC VÀ NGUYÊN NHÂN LÊN TIẾNG",
    "PHỚT LỜ SỰ MƠ HỒ VÀ LOẠI TRỪ SỰ HOÀI NGHI",
    "SAI LỆCH VỀ NIỀM TIN VÀ KHẲNG ĐỊNH",
    "SỰ GẮN KẾT TÌNH CẢM THÁI QUÁ (HIỆU ỨNG HÀO QUANG)",
    "CÁI GÌ TA THẤY LÀ CÁI TA BIẾT", "BỘ MÁY ĐI TẮT ĐÓN ĐẦU LÊN TIẾNG",
    "NHỮNG ĐÁNH GIÁ CƠ BẢN", "SẮP ĐẶT VÀ NGUYÊN MẪU", "CƯỜNG ĐỘ PHÙ HỢP",
    "Súng săn trí não", "DỰ ĐOÁN LÊN TIẾNG", "CÁC CÂU HỎI THAY THẾ",
    "MÔ HÌNH suy NGHIỆM 3D", "MÔ HÌNH SUY NGHIỆM 3D",
    "TÂM TRẠNG SUY NGHIỆM VỚI HẠNH PHÚC", "HIỆU ỨNG SUY NGHIỆM",
    "SỰ THAY THẾ VÀ SUY NGHIỆM LÊN TIẾNG", "Tính cách của Hệ thống 1",
    "QUY LUẬT SỐ NHỎ", "NGUỒN GỐC CỦA SỰ THIÊN LỆCH", "NGUYÊN NHÂN VÀ THỜI CƠ",
    "BÀN VỀ QUY LUẬT SỐ NHỎ", "NEO ĐẬU GIỐNG NHƯ SỰ ĐIỀU CHỈNH",
    "SỰ NEO ĐẬU LÀ HIỆU ỨNG MỒI", "CHỈ SỐ NEO ĐẬU", "SỬ DỤNG VÀ LẠM DỤNG CÁC NEO ĐẬU",
    "HOẠT ĐỘNG NEO ĐẬU VÀ HAI CƠ CHẾ", "BÀN VỀ CÁC NEO ĐẬU",
    "TÂM LÝ HỌC CỦA TÍNH SẴN CÓ", "BÀN VỀ TÍNH SẴN CÓ", "TÍNH SẴN CÓ VÀ TÁC ĐỘNG",
    "CÔNG CHÚNG VÀ GIỚI CHUYÊN GIA", "BÀN VỀ TẦNG (THÁC) GIÁ TRỊ SẴN CÓ",
    "HOẠT ĐỘNG DỰ ĐOÁN THÔNG QUA MÔ THỨC", "NHỮNG SAI PHẠM CỦA MÔ THỨC",
    "RÈN LUYỆN KHẢ NĂNG TRỰC GIÁC NHƯ THẾ NÀO", "BÀN VỀ MÔ THỨC",
    "BÀN VỀ CÁI ÍT HƠN LÀ CÁI GIÁ TRỊ HƠN", "CÁC KHUÔN MẪU NHÂN QUẢ",
    "CÁC TÌNH HUỐNG MANG MỐI QUAN HỆ NHÂN QUẢ", "TÂM LÝ CÓ THỂ UỐN NẮN ĐƯỢC?",
    "BÀN VỀ CÁC PHÉP NHÂN QUẢ VÀ THỐNG KÊ", "TÀI NĂNG VÀ MAY MẮN",
    "HIỂU VỀ SỰ HỒI QUY", "BÀN VỀ SỰ HỒI QUY VỀ MỨC TRUNG BÌNH",
    "TRỰC GIÁC KHÔNG MANG TÍNH HỒI QUY",
    "MỘT SỰ HIỆU CHỈNH DÀNH CHO NHỮNG DỰ ĐOÁN TRỰC GIÁC",
    "SỰ PHÒNG VỆ CỦA CÁC DỰ ĐOÁN CỰC ĐOAN?", "CÁI NHÌN HAI CƠ CHẾ VỀ SỰ HỒI QUY",
    "BÀN VỀ CÁC DỰ ĐOÁN TRỰC GIÁC", "NHỮNG CHI PHÍ XÃ HỘI CỦA NHẬN THỨC MUỘN",
    "CÔNG THỨC CHO SỰ THÀNH CÔNG", "BÀN VỀ NHẬN THỨC MUỘN",
    "ẢO TƯỞNG VỀ SỰ VỮNG CHẮC", "ẢO TƯỞNG VỀ KỸ NĂNG ĐẦU TƯ CHỨNG KHOÁN",
    "ẢO TƯỞNG CỦA CÁC HỌC GIẢ", "BÀN VỀ KỸ NĂNG MƠ HỒ",
    "SỰ THÙ ĐỊCH VỚI CÁC THUẬT TOÁN", "HỌC HỎI TỪ MEEHL",
    "ÁP DỤNG CÔNG THỨC NÀY CHO CHÍNH BẠN", "BÀN VỀ NHỮNG PHÁN ĐOÁN VÀ CÔNG THỨC",
    "NHỮNG ĐIỀU KHÁC THƯỜNG VÀ NHỮNG SAI PHẠM", "TRỰC GIÁC GIỐNG NHƯ SỰ THỪA NHẬN",
    "THU THẬP KỸ NĂNG", "MÔI TRƯỜNG KỸ NĂNG", "SỰ PHẢN HỒI VÀ THỰC TIỄN",
    "KIỂM ĐỊNH GIÁ TRỊ", "BÀN VỀ KHẢ NĂNG TRỰC GIÁC CỦA CHUYÊN GIA",
    "CHÌM ĐẮM TRONG CÁI NHÌN CHỦ QUAN", "SAI LẦM DỰ KIẾN",
    "GIẢM THIỂU SAI LẦM DỰ KIẾN", "CÁC QUYẾT ĐỊNH VÀ NHỮNG SAI LẦM",
    "MỘT THỬ NGHIỆM THẤT BẠI", "BÀN VỀ CÁI NHÌN KHÁCH QUAN", "NHỮNG KẺ LẠC QUAN",
    "NHỮNG ẢO TƯỞNG CỦA DOANH NGHIỆP", "SỰ CẠNH TRANH THỜI Ơ", "SỰ CẠNH TRANH THỜ Ơ",
    "QUYẾT TÂM LIỀU LĨNH", "QUÁ LIỀU LĨNH", "MÔ PHỎNG BIẾN CỐ: BIỆN PHÁP KHẮC PHỤC MỘT PHẦN",
    "BÀN VỀ SỰ LẠC QUAN", "SAI LẦM CỦA BERNOULLI",
    "PHÁT NGÔN VỀ NHỮNG SAI LẦM CỦA BERNOULLI", "ÁC CẢM VỚI MẤT MÁT",
    "NHỮNG ĐIỂM MÙ CỦA LÝ THUYẾT VIỄN CẢNH", "PHÁT NGÔN VỀ LÝ THUYẾT VIỄN CẢNH",
    "HIỆU ỨNG SỞ HỮU", "SUY NGHĨ NHƯ MỘT THƯƠNG NHÂN",
    "PHÁT NGÔN VỀ HIỆU ỨNG SỞ HỮU", "TIÊU CỰC VƯỢT TRỘI",
    "CÁC MỤC TIÊU LÀ NHỮNG ĐIỂM THAM CHIẾU", "HOẠT ĐỘNG BẢO VỆ NGUYÊN TRẠNG",
    "SỰ ÁC CẢM MẤT MÁT TRONG LUẬT PHÁP", "PHÁT NGÔN VỀ NHỮNG TỔN THẤT",
    "THAY ĐỔI NHỮNG CƠ MAY", "NGHỊCH LÝ CỦA ALLAIS", "CÁC TRỌNG SỐ QUYẾT ĐỊNH",
    "MÔ HÌNH BỐN PHẦN", "ĐÁNH BẠC DƯỚI SỰ BẢO TRỢ CỦA LUẬT PHÁP",
    "NHỮNG PHÁT NGÔN VỀ MÔ HÌNH BỐN PHẦN", "SỰ ĐÁNH GIÁ QUÁ CAO VÀ TRỌNG SỐ VƯỢT MỨC",
    "CÁC KẾT QUẢ SINH ĐỘNG", "CÁC XÁC SUẤT MẠNH MẼ",
    "CÁC QUYẾT ĐỊNH ĐẾN TỪ NHỮNG ẤN TƯỢNG CHUNG", "PHÁT NGÔN VỀ NHỮNG BIẾN CỐ HIẾM",
    "PHỔ QUÁT HAY CHI TIẾT?", "VẤN ĐỀ CỦA SAMUELSON", "CÁC CHÍNH SÁCH RỦI RO",
    "PHÁT NGÔN VỀ NHỮNG CHÍNH SÁCH/ CÁCH GIẢI QUYẾT RỦI RO",
    "NHỮNG GIÁ TRỊ VỀ TINH THẦN", "HỐI TIẾC", "TRÁCH NHIỆM",
    "PHÁT NGÔN VỀ VIỆC GIỮ VỮNG MỤC TIÊU", "THÁCH THỨC KINH TẾ", "CÁC PHẠM TRÙ",
    "NHỮNG SỰ ĐẢO CHIỀU PHI LÝ", "PHÁT NGÔN VỀ NHỮNG SỰ ĐẢO LỘN",
    "CẤU TRÚC CẢM XÚC", "NHỮNG TRỰC GIÁC RỖNG", "NHỮNG CẤU TRÚC CÓ LỢI",
    "PHÁT NGÔN VỀ CẤU TRÚC VÀ THỰC TẾ", "ĐỘ THỎA DỤNG TRẢI NGHIỆM",
    "SỰ TRẢI NGHIỆM VÀ KÝ ỨC", "BẢN THỂ NÀO ĐÁNG ĐƯỢC QUAN TÂM?",
    "SINH VẬT HỌC ĐỐI CHỌI VỚI SỰ HỢP LÝ", "NHỮNG KỲ NGHỈ QUÊN LÃNG",
    "TRẢI NGHIỆM HẠNH PHÚC", "ẢO TƯỞNG TẬP TRUNG", "THỜI GIAN VÀ LẠI THỜI GIAN",
    "HAI BẢN THỂ", "KINH TẾ VÀ CON NGƯỜI"
}

SECTIONS = [
    {
        "filename": "00_Thong_tin_sach.md",
        "title": "Thông tin sách & Bìa",
        "start_page": 1,
        "end_page": 2,
    },
    {
        "filename": "00_Nhung_loi_tan_duong_cuon_sach.md",
        "title": "Những lời tán dương cuốn sách",
        "start_page": 3,
        "end_page": 5,
    },
    {
        "filename": "00_Loi_gioi_thieu.md",
        "title": "Lời giới thiệu",
        "start_page": 6,
        "end_page": 10,
    },
    {
        "filename": "00_Mo_dau.md",
        "title": "Mở đầu",
        "start_page": 11,
        "end_page": 25,
    },
    {
        "filename": "Chuong_01_Nhung_net_tinh_cach.md",
        "title": "Chương 1. Những nét tính cách",
        "start_page": 26,
        "end_page": 38,
    },
    {
        "filename": "Chuong_02_Chu_y_va_no_luc.md",
        "title": "Chương 2. Chú ý và nỗ lực",
        "start_page": 39,
        "end_page": 47,
    },
    {
        "filename": "Chuong_03_Ga_kiem_soat_luoi_bieng.md",
        "title": "Chương 3. Gã kiểm soát lười biếng",
        "start_page": 48,
        "end_page": 60,
    },
    {
        "filename": "Chuong_04_Bo_may_lien_tuong.md",
        "title": "Chương 4. Bộ máy liên tưởng",
        "start_page": 61,
        "end_page": 71,
    },
    {
        "filename": "Chuong_05_Nhan_thuc_cam_tinh.md",
        "title": "Chương 5. Nhận thức cảm tính",
        "start_page": 72,
        "end_page": 85,
    },
    {
        "filename": "Chuong_06_Quy_chuan_kinh_ngac_va_dong_co.md",
        "title": "Chương 6. Quy chuẩn, kinh ngạc và động cơ",
        "start_page": 86,
        "end_page": 94,
    },
    {
        "filename": "Chuong_07_Bo_may_di_tat_don_dau.md",
        "title": "Chương 7. Bộ máy đi tắt đón đầu",
        "start_page": 95,
        "end_page": 105,
    },
    {
        "filename": "Chuong_08_Du_doan_dien_ra_the_nao.md",
        "title": "Chương 8. Dự đoán diễn ra thế nào?",
        "start_page": 106,
        "end_page": 114,
    },
    {
        "filename": "Chuong_09_Tra_loi_mot_cau_hoi_de.md",
        "title": "Chương 9. Trả lời một câu hỏi dễ",
        "start_page": 115,
        "end_page": 124,
    },
    {
        "filename": "Chuong_10_Quy_luat_so_nho.md",
        "title": "Chương 10. Quy luật số nhỏ",
        "start_page": 125,
        "end_page": 137,
    },
    {
        "filename": "Chuong_11_Cac_neo_dau.md",
        "title": "Chương 11. Các neo đậu",
        "start_page": 138,
        "end_page": 149,
    },
    {
        "filename": "Chuong_12_Khoa_hoc_cua_tinh_san_co.md",
        "title": "Chương 12. Khoa học của tính sẵn có",
        "start_page": 150,
        "end_page": 158,
    },
    {
        "filename": "Chuong_13_Tinh_san_co_cam_xuc_va_rui_ro.md",
        "title": "Chương 13. Tính sẵn có, cảm xúc và rủi ro",
        "start_page": 159,
        "end_page": 168,
    },
    {
        "filename": "Chuong_14_Luan_de_ve_Tom_W.md",
        "title": "Chương 14. Luận đề về Tom W",
        "start_page": 169,
        "end_page": 179,
    },
    {
        "filename": "Chuong_15_Luan_de_Linda_Cai_it_hon_la_cai_gia_tri_hon.md",
        "title": "Chương 15. Luận đề Linda: Cái ít hơn là cái giá trị hơn",
        "start_page": 180,
        "end_page": 192,
    },
    {
        "filename": "Chuong_16_Nhung_moi_quan_he_nhan_qua_lan_at_cac_phep_thong_ke.md",
        "title": "Chương 16. Những mối quan hệ nhân quả lấn át các phép thống kê",
        "start_page": 193,
        "end_page": 202,
    },
    {
        "filename": "Chuong_17_Su_hoi_quy_ve_muc_trung_binh.md",
        "title": "Chương 17. Sự hồi quy về mức trung bình",
        "start_page": 203,
        "end_page": 215,
    },
    {
        "filename": "Chuong_18_Thuan_phuc_cac_du_doan_truc_giac.md",
        "title": "Chương 18. Thuần phục các dự đoán trực giác",
        "start_page": 216,
        "end_page": 227,
    },
    {
        "filename": "Chuong_19_Ao_vong_ve_tri_thuc.md",
        "title": "Chương 19. Ảo vọng về tri thức",
        "start_page": 228,
        "end_page": 239,
    },
    {
        "filename": "Chuong_20_Ao_tuong_ve_su_vung_chac.md",
        "title": "Chương 20. Ảo tưởng về sự vững chắc",
        "start_page": 240,
        "end_page": 254,
    },
    {
        "filename": "Chuong_21_Truc_giac_do_suc_voi_cong_thuc.md",
        "title": "Chương 21. Trực giác đọ sức với công thức",
        "start_page": 255,
        "end_page": 268,
    },
    {
        "filename": "Chuong_22_Truc_giac_cua_chuyen_gia_Khi_nao_chung_ta_co_the_tin.md",
        "title": "Chương 22. Trực giác của chuyên gia: Khi nào chúng ta có thể tin?",
        "start_page": 269,
        "end_page": 281,
    },
    {
        "filename": "Chuong_23_Cai_nhin_khach_quan.md",
        "title": "Chương 23. Cái nhìn khách quan",
        "start_page": 282,
        "end_page": 292,
    },
    {
        "filename": "Chuong_24_Dong_co_cua_chu_nghia_tu_ban.md",
        "title": "Chương 24. Động cơ của chủ nghĩa tư bản",
        "start_page": 293,
        "end_page": 304,
    },
    {
        "filename": "Chuong_25_Sai_lam_cua_Bernoulli.md",
        "title": "Chương 25. Sai lầm của Bernoulli",
        "start_page": 305,
        "end_page": 315,
    },
    {
        "filename": "Chuong_26_Ly_thuyet_vien_canh.md",
        "title": "Chương 26. Lý thuyết viễn cảnh",
        "start_page": 316,
        "end_page": 328,
    },
    {
        "filename": "Chuong_27_Hieu_ung_so_huu.md",
        "title": "Chương 27. Hiệu ứng sở hữu",
        "start_page": 329,
        "end_page": 340,
    },
    {
        "filename": "Chuong_28_Nhung_bien_co_tieu_cuc.md",
        "title": "Chương 28. Những biến cố tiêu cực",
        "start_page": 341,
        "end_page": 352,
    },
    {
        "filename": "Chuong_29_Mo_hinh_bon_phan.md",
        "title": "Chương 29. Mô hình bốn phần",
        "start_page": 353,
        "end_page": 366,
    },
    {
        "filename": "Chuong_30_Cac_bien_co_hiem.md",
        "title": "Chương 30: Các biến cố hiếm",
        "start_page": 367,
        "end_page": 380,
    },
    {
        "filename": "Chuong_31_Cac_chinh_sach_cach_giai_quyet_rui_ro.md",
        "title": "Chương 31. Các chính sách/cách giải quyết rủi ro",
        "start_page": 381,
        "end_page": 389,
    },
    {
        "filename": "Chuong_32_Giu_vung_muc_tieu.md",
        "title": "Chương 32. Giữ vững mục tiêu",
        "start_page": 390,
        "end_page": 402,
    },
    {
        "filename": "Chuong_33_Nhung_su_dao_lon.md",
        "title": "Chương 33. Những sự đảo lộn",
        "start_page": 403,
        "end_page": 413,
    },
    {
        "filename": "Chuong_34_Cac_cau_truc_va_thuc_te.md",
        "title": "Chương 34. Các cấu trúc và thực tế",
        "start_page": 414,
        "end_page": 426,
    },
    {
        "filename": "Chuong_35_Hai_ban_chat.md",
        "title": "Chương 35. Hai bản chất",
        "start_page": 427,
        "end_page": 436,
    },
    {
        "filename": "Chuong_36_Cuoc_doi_nhu_mot_cau_chuyen.md",
        "title": "Chương 36. Cuộc đời như một câu chuyện",
        "start_page": 437,
        "end_page": 441,
    },
    {
        "filename": "Chuong_37_Trai_nghiem_hanh_phuc.md",
        "title": "Chương 37. Trải nghiệm hạnh phúc",
        "start_page": 442,
        "end_page": 449,
    },
    {
        "filename": "Chuong_38_Nghi_ve_cuoc_song.md",
        "title": "Chương 38. Nghĩ về cuộc sống",
        "start_page": 450,
        "end_page": 461,
    },
    {
        "filename": "Hoi_ket.md",
        "title": "Hồi Kết",
        "start_page": 462,
        "end_page": 474,
    }
]

def is_watermark(b):
    if b.get('type') == 0:
        for l in b['lines']:
            for s in l['spans']:
                if 'thuviensach.vn' in s['text'] or 'Arial' in s['font']:
                    return True
    return False

def extract_images(doc, output_dir="images"):
    os.makedirs(output_dir, exist_ok=True)
    for pno, info in IMAGE_MAP.items():
        page = doc[pno - 1]
        for b in page.get_text('dict')['blocks']:
            if b.get('type') == 1 and 'image' in b:
                filepath = os.path.join(output_dir, info['name'])
                with open(filepath, 'wb') as f:
                    f.write(b['image'])
                break
    print(f"Extracted {len(IMAGE_MAP)} images to {output_dir}/")

def convert_all():
    doc = fitz.open('raw/TuDuyNhanhVaCham.pdf')
    extract_images(doc)

    for sec in SECTIONS:
        filename = sec['filename']
        start_p = sec['start_page']
        end_p = sec['end_page']
        
        md_content = generate_section_markdown(doc, sec)
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(md_content)
        print(f"Generated {filename} (p.{start_p:03d} - p.{end_p:03d})")
        
    generate_readme()

def generate_section_markdown(doc, sec):
    start_p = sec['start_page']
    end_p = sec['end_page']
    filename = sec['filename']
    
    if filename == "00_Thong_tin_sach.md":
        return render_title_page(doc)
    
    parts = []
    cur_p = start_p
    while cur_p <= end_p:
        # Check special multi-page tables
        if cur_p == 116 and end_p >= 117:
            p116_text, p117_text = render_bang_1(doc)
            parts.append(p116_text)
            parts.append(p117_text)
            cur_p += 2
            continue
        elif cur_p == 188:
            parts.append(render_page_188(doc))
            cur_p += 1
            continue
        elif cur_p == 310:
            parts.append(render_page_310(doc))
            cur_p += 1
            continue
        elif cur_p == 358:
            parts.append(render_page_358(doc))
            cur_p += 1
            continue
        elif cur_p == 360 and end_p >= 361:
            parts.append(render_hinh_13(doc))
            cur_p += 2
            continue
        elif cur_p == 384 and end_p >= 385:
            parts.append(render_samuelson(doc))
            cur_p += 2
            continue
        elif cur_p == 410:
            parts.append(render_page_410(doc))
            cur_p += 1
            continue
            
        page_md = render_standard_page(doc, cur_p)
        if page_md.strip():
            parts.append(page_md)
        cur_p += 1
        
    raw_content = "\n\n".join(parts)
    return cleanup_markdown(raw_content)

def render_title_page(doc):
    return """# DANIEL KAHNEMAN

# TƯ DUY NHANH VÀ CHẬM

![Bìa sách Tư duy nhanh và chậm](images/cover.jpg)

---

**TƯ DUY NHANH VÀ CHẬM**  
*Tác giả: Daniel Kahneman*  
*Bản quyền tiếng Việt © 2013 Công ty Cổ phần Sách Alpha (Alpha Books)*  
*Ebook miễn phí tại: www.Sachvui.Com*
"""

def render_bang_1(doc):
    p116_before = """chính xác đó là những khả năng nào. Chúng tôi đi đến kết luận là con người có thể bằng cách nào đó để đơn giản hóa những nhiệm vụ bất khả thi và làm thế nào họ thực hiện được điều đó. Câu trả lời thu được khi nhắc đến một nhận định về điều có thể xảy ra, con người thường đánh giá một thứ khác và họ tin rằng mình đã đánh giá đúng đối tượng cần đánh giá. Hệ thống 1 thường thực hiện hành động này khi phải đối mặt với những vấn đề mục tiêu phức tạp, trong trường hợp câu trả lời cho câu hỏi có liên quan và câu hỏi cảm tính dễ hơn đã sẵn có trong đầu.

Thay thế một câu hỏi bằng một câu hỏi khác có thể là một chiến lược hợp lý để giải quyết những vấn đề phức tạp đã được Goerge Pólya đưa vào cuốn sách kinh điển của mình *Làm sao để xử lý vấn đề này*: “Nếu bạn không thể xử lý một vấn đề, vậy thì sẽ có một vấn đề dễ hơn mà bạn có thể xử lý: Hãy tìm nó”. “Lý thuyết suy nghiệm” của Pólya chính là tiến trình mang tính chiến lược đã được tích hợp trong Hệ thống 2. Nhưng những suy nghiệm mà tôi bàn đến trong chương này không phải được lựa chọn, chúng là hệ quả của “khẩu súng săn trí óc”, sự kiểm soát mà chúng ta thực hiện bao trùm lên những câu trả lời đối với một câu hỏi mục tiêu.

Hãy xem Bảng 1 những câu hỏi mà tôi liệt kê trong cột bên trái ở bảng 1. Đó là những câu hỏi khó. Trước khi nghĩ câu trả lời hợp lý cho từng câu hỏi trong cột trái, bạn đều phải thử sức với những câu hỏi khó khác: Đâu là ý nghĩa của hạnh phúc? Hệ thống chính trị trong sáu tháng tới sẽ phát triển theo hướng nào? Đâu là những tiêu chuẩn cơ bản cho những tội ác tài chính? Đối thủ cạnh tranh của các ứng viên có những điểm mạnh nào? Những vấn đề môi trường hoặc các nguyên nhân nào khác cần phải tính tới? Những câu trả lời toàn diện hoàn toàn không khả thi. Nhưng bạn có thể bớt cầu toàn mà trả lời các câu hỏi dễ hơn đối với từng trường hợp. Đó là những phương án thay thế cảm tính một cách có lý, đôi khi mang lại những câu trả lời hợp lý, nhưng đôi khi dẫn đến những lỗi sai nghiêm trọng.

| Câu hỏi mục tiêu | Câu hỏi cảm tính |
| :--- | :--- |
| Bạn sẵn sàng đóng góp bao nhiêu tiền để cứu những loài động vật đang gặp nguy hiểm? | Tôi cảm thấy thế nào khi nghĩ đến những chú cá heo bị giết hại? |
| Những ngày gần đây bạn cảm thấy hạnh phúc thế nào? | Tâm trạng hiện thời của tôi thế nào? |
| Tổng thống sẽ được ngưỡng mộ hơn ra sao sau sáu tháng nữa? | Ngài Tổng thống được hâm mộ ra sao? |
| Những nhà tư vấn tài chính bóc lột những người già cần phải bị trừng phạt như thế nào? | Tôi tức giận thế nào khi nghĩ đến những kẻ lợi dụng tài chính của người khác? |
| Người phụ nữ này đang tranh cử trong vòng bỏ phiếu phổ thông. Liệu bà ta có thể tiến tới đâu trên vũ đài chính trị? | Người phụ nữ này có khả năng thắng cử chính trị không? |

*Bảng 1*"""

    p117_after = """“Súng săn trí óc” tạo nên những câu trả lời nhanh đối với những vấn đề khó mà không bắt Hệ thống 2 lười biếng của bạn phải làm việc quá căng thẳng. Những câu hỏi bên phải là bản sao gợi ra từ các câu hỏi bên trái nhưng dễ trả lời hơn. Cảm xúc của bạn về cá heo hay những kẻ lừa gạt tài chính, tâm trạng hiện thời của bạn, ấn tượng của bạn về kỹ năng chính trị của một ứng cử viên, hoặc vị thế hiện tại của Tổng thống sẽ sẵn sàng trong đầu óc của bạn hơn. Mỗi khi vấp phải những câu hỏi phức tạp, những câu hỏi suy nghiệm cung cấp những câu trả lời “ăn sẵn” cho bạn.

Vẫn thiếu một cái gì đó trong câu chuyện này: Các câu trả lời cần phải ăn khớp với câu hỏi gốc. Ví dụ, cảm xúc của tôi về những chú cá heo đang chết dần cần phải được thể hiện bằng tiền bạc. Một khả năng khác của Hệ thống 1, sự phù hợp chặt chẽ, cũng sẵn sàng để giải quyết vấn đề này. Hãy nhớ lại tất cả cảm xúc và mức độ sẵn sàng đóng góp tiền trong thang bậc cường độ. Tôi có thể có ít hay nhiều cảm xúc về cá heo và sẽ phải có một sự đóng góp nào đấy phù hợp với mức độ cảm xúc của tôi. Số tiền cụ thể xuất hiện trong đầu tôi chính là số tiền phù hợp. Có thể chỉ ra những sự phù hợp về cường độ tương tự trong tất cả các câu hỏi. Ví dụ, kỹ năng chính trị của một ứng cử viên có thể được xếp hạng từ thảm hại đến ấn tượng, và thang bậc dành cho sự thành công chính trị có thể xếp hạng từ thấp như: “Bà ta sẽ thất bại ở vòng bỏ phiếu phổ thông” đến cao như: “Một ngày kia, bà ta sẽ trở thành tổng thống Hoa Kỳ.”"""

    return p116_before, p117_after

def render_page_188(doc):
    return """1. ĐXĐĐĐ
2. XĐXĐĐĐ
3. XĐĐĐĐĐ

Bởi con xúc xắc có số mặt xanh nhiều gấp đôi số mặt đỏ, chuỗi đầu tiên hoàn toàn không tiêu biểu giống như việc Linda là một kế toán ngân hàng. Chuỗi thứ hai, gồm có sáu lần gieo xúc xắc, là một đợt tốt hơn so với điều chúng ta có thể trông đợi từ con xúc xắc này, bởi nó bao gồm hai mặt xanh. Tuy nhiên, chuỗi này đã được tạo ra bởi việc thêm vào một mặt xanh ở đầu chuỗi, bởi vậy nó ít khả năng xảy ra hơn chuỗi đầu tiên. Đây là một dạng không diễn đạt bằng lời tương đương với việc Linda là một kế toán ngân hàng hoạt động vì nữ quyền. Như trong thí nghiệm Linda, mô thức đã trội hơn. Hầu hết hai phần ba số người tham gia đã ưu tiên đặt cược vào chuỗi thứ hai thay vì chuỗi thứ nhất. Tuy nhiên, khi được giới thiệu với những lập luận đối với hai lựa chọn, đại đa số đã tìm ra lập luận chính xác (thiên về chuỗi thứ nhất) có sức thuyết phục hơn.

Luận đề tiếp theo là một bước đột phá, bởi sau cùng chúng tôi đã tìm ra một trạng thái mà ở đó phạm vi tác động của ngụy biện liên tưởng đã giảm thiểu rất nhiều. Hai nhóm đối tượng sau đã thấy được những biến thể hơi khác nhau của cùng một luận đề:

| Nhóm 1 (Tỷ lệ %) | Nhóm 2 (Số người) |
| :--- | :--- |
| Một cuộc khảo sát sức khỏe đã được tiến hành trong một mẫu gồm những người đàn ông trưởng thành tại British Columbia, ở mọi lứa tuổi và ngành nghề. Hãy đưa ra dự đoán chính xác nhất của bạn về các giá trị sau: | Một cuộc khảo sát sức khỏe đã được tiến hành trong một mẫu gồm 100 người đàn ông trưởng thành tại British Columbia, ở mọi lứa tuổi và ngành nghề. Hãy đưa ra dự đoán chính xác nhất của bạn về các giá trị sau: |
| Bao nhiêu phần trăm những người đàn ông được khảo sát đã có một hoặc nhiều hơn một lần đau tim? | Có bao nhiêu người trong số 100 người tham gia đã có một hoặc hơn một lần đau tim? |
| Bao nhiêu phần trăm những người đàn ông được khảo sát trên 55 tuổi và đã có một hoặc hơn một lần đau tim? | Có bao nhiêu người trong số 100 người tham gia trên 55 tuổi và đã có một hoặc hơn một lần đau tim? |"""

def render_page_310(doc):
    return """nhiều hơn 80 đô-la. Bernoulli đã chỉ ra rằng trong thực tế người ta không đánh giá những trò may rủi theo cách này.

Bernoulli đã quan sát thấy rằng: Hầu hết mọi người đều không thích mạo hiểm (khả năng nhận được kết quả tiềm năng thấp nhất), và nếu họ được cho một lựa chọn giữa một trò may rủi và một lượng bằng với giá trị dự tính của nó thì họ sẽ lựa chọn điều chắc chắn. Trong thực tế một người ra quyết định không thích mạo hiểm sẽ lựa chọn một điều chắc chắn có giá trị dự tính thấp hơn, suy nghĩ đó là phí họ trả để tránh gặp những điều không chắc chắn. Đi trước Fechner 100 năm, Bernoulli đã sáng tạo ra bộ môn Vật lý tâm thần học để giải thích sự ác cảm đối với sự mạo hiểm. Ý tưởng của ông rất rõ ràng: Những chọn lựa của mọi người không dựa trên trị giá đồng đô-la mà trên những giá trị tâm lý về các kết quả, những thỏa dụng của họ. Giá trị tâm lý của một trò may rủi do vậy không phải là trọng số trung bình của những kết quả đô-la khả dĩ của nó; mà là số trung bình của những lợi ích từ những kết quả này, mỗi kết quả được tăng trọng lượng bởi chính xác suất của nó.

| Tài sản (triệu đô-la) | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Đơn vị thỏa dụng** | 10 | 30 | 48 | 60 | 70 | 78 | 84 | 90 | 96 | 100 |

*Bảng số 3*

Bảng số 3 chỉ ra một kiểu hàm số thỏa dụng mà Bernoulli đã tính toán; nó đưa ra thỏa dụng của những cấp độ giàu có khác nhau, từ 1 triệu tới 10 triệu. Bạn có thể thấy rằng việc thêm vào 1 triệu cho một khối tài sản 1 triệu mang lại một số là 20 điểm thỏa dụng, nhưng thêm 1 triệu vào một khối tài sản 9 triệu chỉ thêm được 4 điểm. Bernoulli đã đưa ra rằng giá trị biên giảm dần của khối tài sản (theo thuật ngữ hiện đại) là những gì lý giải cho sự ác cảm đối với mạo hiểm – sự ưu tiên phổ biến mà nhiều người thường chỉ ra đối với một điều chắc chắn hơn là một trò mạo hiểm có triển vọng về giá trị dự tính bằng hoặc cao hơn một chút. Xem xét lựa chọn sau:

Những khả năng bằng nhau để có 1 triệu hoặc 7 triệu – Thỏa dụng: (10 + 84)/2 = 47

Hoặc:

Có 4 triệu với sự chắc chắn - Thỏa dụng: 60"""

def render_page_358(doc):
    return """qua ý niệm cho rằng con người là những người chọn lựa lý tưởng. Chúng tôi đã thực thi nhiệm vụ phát triển một lý thuyết tâm lý mà sẽ mô tả các chọn lựa do con người đưa ra, bất chấp việc liệu rằng chúng có hợp lý hay không. Trong lý thuyết viễn cảnh, các trọng số quyết định sẽ không bị đồng nhất với các xác suất.

### CÁC TRỌNG SỐ QUYẾT ĐỊNH

Rất nhiều năm sau khi công bố lý thuyết viễn cảnh, Amos và tôi đã tiến hành một nghiên cứu, trong đó chúng tôi đã đo lường các trọng số quyết định đã lý giải cho việc con người thường dành khoản tiền cược khiêm tốn cho các trò may rủi. Các ước tính cho những lợi ích được chỉ ra trong bảng 4.

| Xác suất (%) | 0 | 1 | 2 | 5 | 10 | 20 | 50 | 80 | 90 | 95 | 98 | 99 | 100 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Trọng số quyết định** | 0 | 5.5 | 8.1 | 13.2 | 18.6 | 26.1 | 42.1 | 60.1 | 71.2 | 79.3 | 87.1 | 91.2 | 100 |

*Bảng 4*

Bạn có thể thấy rằng các trọng số quyết định đồng nhất với các xác suất tương ứng ở các mức độ: Cả hai đều bằng 0 khi kết quả là bất khả thi và cả hai đều bằng 100 khi kết quả nắm chắc trong tay. Tuy nhiên, các trọng số quyết định ở gần những điểm này đã đột ngột chệch khỏi xác suất. Ở mức thấp cuối, chúng tôi tìm ra hiệu ứng xác suất: Các biến cố không chắc xảy ra được đặt trọng số quá mức. Ví dụ, trọng số quyết định tương ứng với 2% cơ may là 8.1. Nếu người ta tuân theo các tiên đề về sự chọn lựa lý trí, trọng số quyết định sẽ là 2, do đó biến cố hiếm hoi này được đặt trọng số cao hơn với thừa số 4. Hiệu ứng chắc chắn ở điểm cuối khác của tỷ lệ xác suất thậm chí còn đáng chú ý hơn. Một nguy cơ 2% không giành được phần thưởng giảm lợi ích của trò may rủi tới 13%, từ 100 xuống 87.1.

Để đánh giá đúng sự bất cân xứng giữa hiệu ứng xác suất và hiệu ứng chắc chắn, hãy hình dung trước hết bạn có 1% cơ hội chiến thắng 1 triệu đô-la. Bạn sẽ biết được kết quả vào ngày mai. Giờ hãy tưởng tượng rằng bạn gần như chắc chắn giành được 1 triệu đô-la nhưng có 1% nguy cơ bạn không giành được gì. Lại một lần nữa, bạn sẽ được biết kết quả vào ngày hôm sau. Nỗi băn khoăn về tình huống thứ hai tỏ ra nổi bật hơn niềm hy vọng trong"""

def render_hinh_13(doc):
    return """đến cho các bậc cha mẹ có con nhỏ.

Giả định rằng hiện tại bạn sử dụng một bình xịt côn trùng có giá 10 đô-la và cứ mỗi 10.000 bình xịt diệt côn trùng được sử dụng sẽ có 15 đứa trẻ nhiễm độc.

Bạn được biết tới một loại thuốc diệt côn trùng đắt hơn nhưng làm giảm rủi ro xuống còn 5 ca cho mỗi 10.000 bình xịt được sử dụng. Bạn sẽ sẵn sàng chi trả bao nhiêu cho nó?

Các bậc cha mẹ đã sẵn sàng chi trả một khoản bù thêm trung bình là 2.38 đô-la để giảm rủi ro xuống còn 2/3 từ 15 ca mỗi 10.000 bình xuống còn 5. Họ đã sẵn sàng chi trả 8.09 đô-la, nhiều hơn gấp ba lần, để loại trừ nó hoàn toàn. Các câu hỏi khác đã chỉ ra rằng các bậc cha mẹ đã xử lý hai rủi ro (hít phải khí và trẻ em nhiễm độc) như là những nỗi lo riêng biệt và đã sẵn lòng chi trả khoản tiền phụ trội chắc chắn cho sự loại trừ hoàn toàn một trong hai rủi ro. Khoản tiền trả thêm này tương hợp với tâm lý lo lắng nhưng không tương thích với hình mẫu lý trí.

### MÔ HÌNH BỐN PHẦN

Amos và tôi tiến hành công việc của mình với lý thuyết viễn cảnh và nhanh chóng đạt được hai kết luận: Con người gắn liền các giá trị với những lợi ích và tổn thất hơn là danh lợi, các trọng số quyết định mà họ áp đặt cho các kết quả khác biệt với các xác suất. Ý niệm đó cũng chẳng mới mẻ gì nhưng trong sự kết hợp với nhau chúng đã lý giải một mẫu hình đặc biệt về những ưu ái mà chúng tôi đã gọi là mô hình bốn phần. Cái tên hẳn đã gây ra sự lúng túng. Các kịch bản được minh họa dưới đây:

| | CÁC LỢI ÍCH | CÁC TỔN THẤT |
| :--- | :--- | :--- |
| **XÁC SUẤT CAO**<br>*(Hiệu ứng chắc chắn)* | 95% cơ may thắng 10.000 đô-la.<br>Lo sợ sự thất vọng<br>**ÁC CẢM RỦI RO**<br>Chấp nhận sự dàn xếp không có lợi. | 95% nguy cơ mất 10.000 đô-la.<br>Hy vọng tránh tổn thất<br>**TÌM KIẾM RỦI RO**<br>Loại bỏ sự dàn xếp có lợi. |
| **XÁC SUẤT THẤP**<br>*(Hiệu ứng xác suất)* | 5% cơ may thắng 10.000 đô-la.<br>Hy vọng về lợi ích lớn<br>**TÌM KIẾM RỦI RO**<br>Loại bỏ sự dàn xếp có lợi. | 5% nguy cơ mất 10.000 đô-la.<br>Lo sợ tổn thất lớn<br>**ÁC CẢM RỦI RO**<br>Chấp nhận sự dàn xếp không có lợi. |

*Hình 13*

Hàng trên cùng trong mỗi ô biểu diễn một triển vọng minh họa.  
Hàng thứ hai mô tả cảm xúc trọng tâm mà triển vọng gợi lên.  
Hàng thứ ba cho biết hầu hết mọi người hành xử như thế nào khi được đề nghị một chọn lựa giữa một trò may rủi với một lợi ích đảm bảo (hoặc tổn thất) tương ứng với giá trị dự tính của chúng (ví dụ, giữa “95% cơ may thắng 10.000 đô-la” và “chắc chắn có 9.500 đô-la”). Các chọn lựa bị gọi là ác cảm rủi ro nếu điều đảm bảo được ưu tiên, gọi là tìm kiếm rủi ro nếu trò may rủi được ưu tiên.  
Hàng thứ tư mô tả các thái độ dự tính về bên bị và bên nguyên khi họ tranh luận về sự dàn xếp một vụ kiện dân sự.

Mô hình bốn phần về những ưu tiên được xem như là một trong những thành tựu cốt lõi của lý thuyết triển vọng. Ba trong số bốn ô là tương tự như nhau; ô thứ tư (góc trên bên phải) rất mới mẻ và không dự tính được.

Góc trên bên trái là một trong những điều mà Bernoulli đã tranh luận: con người ác cảm với rủi ro khi họ nhìn nhận các viễn cảnh với một cơ may lớn đạt tới một lợi ích lớn. Họ sẵn lòng chấp nhận số ít hơn giá trị dự tính của một trò may rủi nhằm khóa chặt một lợi ích đảm bảo.

Hiệu ứng xác suất trong ô dưới cùng bên trái giải thích tại sao trò xổ số phổ biến. Khi giải nhất cực lớn, những người mua vé số tỏ vẻ thờ ơ với sự thực rằng cơ may thắng giải của họ là rất nhỏ. Một tấm vé số là ví dụ sau cùng về hiệu ứng xác suất. Nếu không có một tấm vé số bạn không thể thắng giải, với một tấm vé số bạn có một cơ may và cho dù cơ may đó rất nhỏ hay đơn thuần là những cơ hội nhỏ không đáng kể. Dĩ nhiên, những gì người ta thu được từ một tấm vé có ý nghĩa nhiều"""

def render_samuelson(doc):
    return """người tối đa hóa lợi ích từ bỏ một trò may rủi đơn giản có thể cũng sẽ từ bỏ lời đề nghị tham gia nhiều trò may rủi.

Đáng chú ý là Samuelson dường như không quan tâm tới thực tế là chứng minh của ông, dĩ nhiên là có căn cứ, đã dẫn tới một kết luận phạm vào chiều hướng phổ biến, nếu không hợp lý: Lời đề nghị tham gia hàng trăm trò may rủi quả thực quá lôi cuốn đến nỗi không một người ôn hòa nào có thể từ chối. Matthew Rabin và Richard Thaler đã chỉ ra rằng “trò may rủi được tổng hợp từ một trăm trò cá cược 50-50 thua 100 đô-la/ được 200 đô-la có một khoản lợi nhuận dự tính là 5.000 đô-la, chỉ với 1/2.300 khả năng bị thua bất cứ khoản tiền nào và chỉ 1/62.000 khả năng bị mất nhiều hơn 1.000 đô-la.” Dĩ nhiên, luận điểm của họ là như vậy nếu lý thuyết thỏa dụng có thể phù hợp với sự ưu tiên ngớ ngẩn như vậy với bất kể hoàn cảnh nào, vậy thì hẳn đã phải có vài sai sót xảy ra giống như kiểu chọn lựa dựa trên lý trí. Samuelson đã không thấy được sự kiểm chứng của Rabin đối với các kết quả vô lý của sự ác cảm mất mát gay gắt đối với những khoản tiền cược nhỏ, nhưng ông chắc chắn sẽ không bị làm cho ngạc nhiên bởi điều này. Thiện ý của ông còn nhằm xem xét xác suất hợp lý có thể để loại bỏ ảnh hưởng mạnh mẽ của mô hình dựa trên lý trí.

Cho phép chúng tôi được thừa nhận rằng một hàm giá trị rất đơn giản mô tả các ưu tiên của người bạn Samuelson (gọi ông ấy là Sam). Để diễn đạt sự ác cảm của ông ấy với những tổn thất, Sam chép lại vụ cá cược, sau khi nhân từng tổn thất với hệ số 2. Sau đó ông tính toán giá trị dự tính của trò cá cược đã được chép lại. Và đây là các kết quả, với một, hai, hoặc ba lần tung đồng xu. Chúng xứng đáng được dùng để cung cấp tài liệu cụ thể cho một số nỗ lực của những người thích sự chi tiết.

| Lần tung | Tình huống | Xác suất và kết quả | Giá trị dự tính |
| :--- | :--- | :--- | :---: |
| **Tung một lần** | | (50% thua 100; 50% thắng 200) | 50 |
| | Tổn thất nhân đôi | (50% thua 200; 50% thắng 200) | 0 |
| **Tung hai lần** | | (25% thua 200; 50% thắng 100; 25% thắng 400) | 100 |
| | Tổn thất nhân đôi | (25% thua 400; 50% thắng 100; 25% thắng 400) | 50 |
| **Tung ba lần** | | (12.5% thua 300; 37.5% thắng 0; 37.5% thắng 300; 12.5% thắng 600) | 150 |
| | Tổn thất nhân đôi | (12.5% thua 600; 37.5% thắng 0; 37.5% thắng 300; 12.5% thắng 600) | 112.5 |

Bạn có thể thấy trong sự trình bày này trò may rủi có một giá trị dự tính là 50. Tuy nhiên, một lần tung đồng xu chẳng có giá trị gì đối với Sam bởi ông cảm thấy nỗi đau của việc mất đi một đô-la nhức nhối gấp hai lần niềm vui giành được một đô-la. Sau khi chép lại trò may rủi nhằm phản ánh sự ác cảm mất mát của mình, Sam sẽ phát hiện ra rằng giá trị của trò may rủi là 0.

Giờ hãy xem xét trường hợp tung đồng xu hai lần. Những nguy cơ tổn thất đã giảm xuống 25%. Hai kết quả cực đoan (thua 200 hoặc thắng 400) triệt tiêu lẫn nhau về giá trị; chúng có khả năng xảy ra ngang nhau, và các tổn thất được đặt trọng số nhiều gấp hai lần so với lợi ích. Nhưng kết quả trung bình (một tổn thất, một lợi ích) lại tích cực, và do vậy là một canh bạc kép như là một chỉnh thể. Giờ đây bạn có thể thấy được cái giá của cấu trúc hẹp và sự thần kỳ của tổng hợp các trò may rủi. Đó là hai trò may rủi có triển vọng, nếu chúng đứng riêng lẻ thì chẳng có giá trị gì đối với Sam. Nếu ông gặp lời đề nghị vào hai dịp riêng biệt, ông sẽ từ bỏ ở cả hai lần. Tuy nhiên, nếu ông gộp cả hai lời đề nghị lại cùng nhau, chúng có tổng trị giá là 50 đô-la!

Mọi thứ thậm chí trở nên sáng sủa hơn khi cả ba trò may rủi được gộp lại. Các kết quả tiêu cực vẫn triệt tiêu lẫn nhau, nhưng chúng đã trở nên ít quan trọng hơn. Lần tung đồng xu thứ ba, mặc dù chẳng có giá trị gì nếu đánh giá riêng nó, nhưng đã cộng thêm 62.5 đô-la vào tổng giá trị của gói. Trong thời gian đó Sam được đề nghị năm trò may rủi, giá trị dự tính của lời đề nghị sẽ là 250 đô-la, xác suất của việc không mất gì cả của ông sẽ là 18.75% và khoản tương đương tiền của ông sẽ là 203.125 đô-la. Khía cạnh đáng chú ý của câu chuyện này đó là Sam không lưỡng lự trong mối ác cảm của mình trước những tổn thất. Tuy nhiên, tập hợp các trò may rủi có triển vọng làm giảm nhanh chóng xác suất của tổn thất và tác động của sự ác cảm mất mát đối với những ưu tiên của ông giảm bớt một cách phù hợp.

Giờ đây tôi đã có bài thuyết pháp cho Sam nếu ông từ chối lời đề nghị về"""

def render_page_410(doc):
    return """khi nhận thấy: Những người nông dân là con người, cá heo chỉ là loài vật. Dĩ nhiên, bạn đã biết điều đó nhưng nó không liên quan tới sự phán quyết mà bạn đưa ra trong sự đánh giá từng trường hợp. Sự thực những con cá heo không phải là con người đã không nảy sinh bởi tất cả các vấn đề được kích hoạt trong bộ nhớ của bạn đã chia tách đặc tính đó. Sự thực những người nông dân là con người đã không xuất hiện trong suy nghĩ bởi tất cả các vấn đề sức khỏe cộng đồng đều có liên quan tới con người. Cấu trúc hẹp của sự đánh giá đơn lẻ đã để cho những con cá heo có một căn cứ có cường độ cao hơn, dẫn tới tỷ lệ quyên góp cao bởi sự bù trừ cường độ. Sự đánh giá cùng lúc thay đổi sự hình dung đối với các vấn đề: Đặc tính “con người và động vật” trở nên nổi bật chỉ khi cả hai cùng được xem xét cùng lúc. Trong sự đánh giá cùng lúc người ta chỉ ra một sự ưu ái có cơ sở dành cho những người nông dân và một thiện ý đóng góp nhiều hơn về cơ bản cho phúc lợi của họ hơn là cho sự bảo vệ một loài không phải con người được yêu thích. Ở đây thêm một lần nữa, giống như trong các trường hợp bàn về các trò cược và vụ cướp nã súng, những phán quyết được đưa ra dưới sự đánh giá đơn lẻ và cùng lúc sẽ không nhất quán.

Christopher Hsee, đến từ Đại học Chicago, đã đóng góp ví dụ sau đây về sự đảo chiều ưu tiên, giữa nhiều thứ khác nhau của cùng một loại. Đối tượng được đánh giá là những quyển từ điển âm nhạc đã qua sử dụng.

| Đặc điểm | Từ điển A | Từ điển B |
| :--- | :--- | :--- |
| **Năm xuất bản** | 1993 | 1993 |
| **Số mục từ** | 10.000 | 20.000 |
| **Tình trạng** | Như mới | Bìa bị rách, còn lại như mới |

Khi những quyển từ điển được đánh giá đơn lẻ, cuốn từ điển A được định giá cao hơn nhưng dĩ nhiên sự ưu tiên thay đổi dưới sự đánh giá cùng lúc. Kết quả này minh chứng cho giả thuyết khả năng đánh giá của Hsee: Số lượng từ được cho không có trọng số trong sự đánh giá đơn lẻ, bởi các con số tự chúng không “thể định giá”. Ngược lại, trong sự đánh giá cùng lúc ngay lập tức có thể thấy rõ ràng rằng cuốn từ điển B vượt trội hơn với thuộc tính này"""

def parse_indented_lines(lines):
    items = []
    cur = ""
    for l in lines:
        t = ''.join(s['text'] for s in l['spans']).strip()
        if not cur:
            cur = t
        else:
            if cur.endswith('-'):
                cur = cur[:-1] + t
            elif cur[-1] in '.!?…"' + '\u201d\u2019':
                items.append(cur)
                cur = t
            else:
                cur = cur + ' ' + t
    if cur:
        items.append(cur)
    return items

def render_standard_page(doc, pno):
    p = doc[pno - 1]
    blocks = [b for b in p.get_text('dict')['blocks'] if not is_watermark(b)]
    blocks.sort(key=lambda b: b['bbox'][1])
    
    out = []
    
    # 1. Collect title blocks at the top of the page (font size > 25)
    title_texts = []
    regular_blocks = []
    for b in blocks:
        if b.get('type') == 0 and b['lines'][0]['spans'][0]['size'] > 25:
            t = ' '.join(''.join(s['text'] for s in l['spans']) for l in b['lines']).strip()
            title_texts.append(t)
        else:
            regular_blocks.append(b)
            
    if title_texts:
        i = 0
        while i < len(title_texts):
            t = title_texts[i]
            if t.startswith('PHẦN'):
                if i + 1 < len(title_texts) and not title_texts[i+1].startswith('Chương'):
                    t = f"{t} {title_texts[i+1]}"
                    i += 1
                out.append(f"# {t}")
            elif t.startswith('Chương'):
                if i + 1 < len(title_texts) and not title_texts[i+1].startswith('PHẦN') and not title_texts[i+1].startswith('Chương'):
                    t = f"{t} {title_texts[i+1]}"
                    i += 1
                out.append(f"# {t}")
            else:
                out.append(f"# {t}")
            i += 1

    # 2. Process regular blocks
    b_idx = 0
    while b_idx < len(regular_blocks):
        b = regular_blocks[b_idx]
        
        if b.get('type') == 1:
            if pno in IMAGE_MAP:
                info = IMAGE_MAP[pno]
                out.append(f"![{info['caption']}](images/{info['name']})\n\n*{info['caption']}*")
            b_idx += 1
            continue
            
        lines = b['lines']
        
        # Check if block is all italic
        is_all_italic = True
        for l in lines:
            for s in l['spans']:
                if 'Italic' not in s['font']:
                    is_all_italic = False
                    break
            if not is_all_italic:
                break
                
        # If all italic and NOT quote, see if next blocks are also all italic (e.g. p.33 instructions)
        first_line_text = ''.join(s['text'] for s in lines[0]['spans']).strip()
        if is_all_italic and not first_line_text.startswith('“'):
            italic_parts = []
            while b_idx < len(regular_blocks):
                cur_b = regular_blocks[b_idx]
                if cur_b.get('type') != 0:
                    break
                cur_is_all_italic = all('Italic' in s['font'] for cl in cur_b['lines'] for s in cl['spans'])
                cur_first_t = ''.join(s['text'] for s in cur_b['lines'][0]['spans']).strip()
                if cur_is_all_italic and not cur_first_t.startswith('“'):
                    part_str = ' '.join(''.join(s['text'] for s in cl['spans']) for cl in cur_b['lines'])
                    italic_parts.append(part_str.strip())
                    b_idx += 1
                else:
                    break
            combined_italic = ' '.join(italic_parts)
            combined_italic = re.sub(r' +', ' ', combined_italic)
            out.append(f"*{combined_italic}*")
            continue
            
        line_texts = []
        for l in lines:
            line_str = "".join(s['text'] for s in l['spans'])
            line_texts.append(line_str)
            
        raw_text = ' '.join(line_texts).strip()
        raw_text = re.sub(r' +', ' ', raw_text)
        
        # Check subheadings FIRST before bullets
        if (raw_text in KNOWN_SUBHEADINGS or (len(lines) == 1 and raw_text.isupper() and len(raw_text) < 70 and not raw_text.endswith('.'))):
            if not any(raw_text.startswith(x) for x in ['1.', '2.', '3.', 'TTT', 'GGG', 'XUZO', 'TAPC']):
                clean_heading = "MÔ HÌNH SUY NGHIỆM 3D" if "suy NGHIỆM" in raw_text else raw_text
                out.append(f"### {clean_heading}")
                b_idx += 1
                continue

        # Check Ebook publisher footer line
        if raw_text.startswith('Ebook miễn phí'):
            out.append(f"*{raw_text}*")
            b_idx += 1
            continue

        # Check indented bullet list
        if lines[0]['bbox'][0] >= 75 and not is_all_italic:
            items = parse_indented_lines(lines)
            for it in items:
                # Avoid double dashes
                it_clean = it.lstrip('- ').strip()
                out.append(f"- {it_clean}")
            b_idx += 1
            continue
            
        # Standalone equation/puzzle (e.g. 17 x 24)
        if raw_text == "17 x 24":
            out.append(f"**{raw_text}**")
            b_idx += 1
            continue
            
        # Check if quote: must start and end with quotes
        if raw_text.startswith('“') and raw_text.rstrip().endswith(('”', '"', '”*')):
            if is_all_italic:
                out.append(f"> *{raw_text}*")
            else:
                out.append(f"> {raw_text}")
            b_idx += 1
            continue
            
        # Check italic paragraph
        if is_all_italic:
            out.append(f"*{raw_text}*")
            b_idx += 1
            continue
            
        # Normal paragraph
        out.append(raw_text)
        b_idx += 1
        
    return "\n\n".join(out)

def cleanup_markdown(text):
    blocks = text.split('\n\n')
    merged = []
    
    for block in blocks:
        block = block.strip()
        if not block:
            continue
            
        if merged:
            prev = merged[-1]
            is_special_prev = prev.startswith(('#', '!', '- ', '>', '|', '*'))
            is_special_block = block.startswith(('#', '!', '- ', '>', '|', '*'))
            
            # Special case: continuation of a bullet item across page boundaries
            if prev.startswith('- ') and not is_special_block:
                if prev[-1] not in '.!?”"':
                    # Continuation of bullet
                    if prev.endswith('-'):
                        merged[-1] = prev[:-1] + block
                    else:
                        merged[-1] = prev + ' ' + block
                    continue

            # Special case: continuation that was mistakenly tagged as a bullet due to page boundary indent
            if block.startswith('- '):
                content_after_dash = block[2:].strip()
                if content_after_dash and (content_after_dash[0].islower() or (prev[-1] not in '.!?”":' and not is_special_prev)):
                    # Merge into prev
                    if prev.endswith('-'):
                        merged[-1] = prev[:-1] + content_after_dash
                    else:
                        merged[-1] = prev + ' ' + content_after_dash
                    continue

            # NEVER merge if either is a special markdown element
            if not is_special_prev and not is_special_block:
                # If prev ends with colon, NEVER merge (introduces next block)
                if prev.endswith(':'):
                    merged.append(block)
                    continue
                    
                # If prev ends with sentence-ending punctuation, NEVER merge
                if prev[-1] in '.!?”"':
                    merged.append(block)
                    continue
                    
                # If prev ends with hyphen (soft wrap hyphen)
                if prev.endswith('-'):
                    merged[-1] = prev[:-1] + block
                    continue
                # If prev ends with comma or unpunctuated word, merge
                elif prev[-1] in ',;':
                    merged[-1] = prev + ' ' + block
                    continue
                else:
                    merged[-1] = prev + ' ' + block
                    continue
                    
        merged.append(block)
        
    result = '\n\n'.join(merged)
    # Fix hyphenation inside words
    result = re.sub(r'([a-zA-ZÀ-ỹ])- ([a-zA-ZÀ-ỹ])', r'\1-\2', result)
    result = re.sub(r' +', ' ', result)
    return result

def generate_readme():
    content = """# Tư Duy Nhanh Và Chậm (Thinking, Fast and Slow)

**Tác giả:** Daniel Kahneman  
**Bản quyền tiếng Việt:** © 2013 Công ty Cổ phần Sách Alpha (Alpha Books)  

![Bìa sách Tư duy nhanh và chậm](images/cover.jpg)

---

## Mục Lục Chi Tiết

### Phần Mở Đầu & Giới Thiệu
* [Thông tin xuất bản & Bìa sách](00_Thong_tin_sach.md)
* [Những lời tán dương cuốn sách](00_Nhung_loi_tan_duong_cuon_sach.md)
* [Lời giới thiệu](00_Loi_gioi_thieu.md)
* [Mở đầu](00_Mo_dau.md)

---

### PHẦN I. HAI HỆ THỐNG
* [Chương 1. Những nét tính cách](Chuong_01_Nhung_net_tinh_cach.md)
* [Chương 2. Chú ý và nỗ lực](Chuong_02_Chu_y_va_no_luc.md)
* [Chương 3. Gã kiểm soát lười biếng](Chuong_03_Ga_kiem_soat_luoi_bieng.md)
* [Chương 4. Bộ máy liên tưởng](Chuong_04_Bo_may_lien_tuong.md)
* [Chương 5. Nhận thức cảm tính](Chuong_05_Nhan_thuc_cam_tinh.md)
* [Chương 6. Quy chuẩn, kinh ngạc và động cơ](Chuong_06_Quy_chuan_kinh_ngac_va_dong_co.md)
* [Chương 7. Bộ máy đi tắt đón đầu](Chuong_07_Bo_may_di_tat_don_dau.md)
* [Chương 8. Dự đoán diễn ra thế nào?](Chuong_08_Du_doan_dien_ra_the_nao.md)
* [Chương 9. Trả lời một câu hỏi dễ](Chuong_09_Tra_loi_mot_cau_hoi_de.md)

---

### PHẦN II. SUY NGHIỆM VÀ SAI LỆCH
* [Chương 10. Quy luật số nhỏ](Chuong_10_Quy_luat_so_nho.md)
* [Chương 11. Các neo đậu](Chuong_11_Cac_neo_dau.md)
* [Chương 12. Khoa học của tính sẵn có](Chuong_12_Khoa_hoc_cua_tinh_san_co.md)
* [Chương 13. Tính sẵn có, cảm xúc và rủi ro](Chuong_13_Tinh_san_co_cam_xuc_va_rui_ro.md)
* [Chương 14. Luận đề về Tom W](Chuong_14_Luan_de_ve_Tom_W.md)
* [Chương 15. Luận đề Linda: Cái ít hơn là cái giá trị hơn](Chuong_15_Luan_de_Linda_Cai_it_hon_la_cai_gia_tri_hon.md)
* [Chương 16. Những mối quan hệ nhân quả lấn át các phép thống kê](Chuong_16_Nhung_moi_quan_he_nhan_qua_lan_at_cac_phep_thong_ke.md)
* [Chương 17. Sự hồi quy về mức trung bình](Chuong_17_Su_hoi_quy_ve_muc_trung_binh.md)
* [Chương 18. Thuần phục các dự đoán trực giác](Chuong_18_Thuan_phuc_cac_du_doan_truc_giac.md)

---

### PHẦN III. NIỀM TIN THÁI QUÁ
* [Chương 19. Ảo vọng về tri thức](Chuong_19_Ao_vong_ve_tri_thuc.md)
* [Chương 20. Ảo tưởng về sự vững chắc](Chuong_20_Ao_tuong_ve_su_vung_chac.md)
* [Chương 21. Trực giác đọ sức với công thức](Chuong_21_Truc_giac_do_suc_voi_cong_thuc.md)
* [Chương 22. Trực giác của chuyên gia: Khi nào chúng ta có thể tin?](Chuong_22_Truc_giac_cua_chuyen_gia_Khi_nao_chung_ta_co_the_tin.md)
* [Chương 23. Cái nhìn khách quan](Chuong_23_Cai_nhin_khach_quan.md)
* [Chương 24. Động cơ của chủ nghĩa tư bản](Chuong_24_Dong_co_cua_chu_nghia_tu_ban.md)

---

### PHẦN IV. NHỮNG LỰA CHỌN
* [Chương 25. Sai lầm của Bernoulli](Chuong_25_Sai_lam_cua_Bernoulli.md)
* [Chương 26. Lý thuyết viễn cảnh](Chuong_26_Ly_thuyet_vien_canh.md)
* [Chương 27. Hiệu ứng sở hữu](Chuong_27_Hieu_ung_so_huu.md)
* [Chương 28. Những biến cố tiêu cực](Chuong_28_Nhung_bien_co_tieu_cuc.md)
* [Chương 29. Mô hình bốn phần](Chuong_29_Mo_hinh_bon_phan.md)
* [Chương 30: Các biến cố hiếm](Chuong_30_Cac_bien_co_hiem.md)
* [Chương 31. Các chính sách/cách giải quyết rủi ro](Chuong_31_Cac_chinh_sach_cach_giai_quyet_rui_ro.md)
* [Chương 32. Giữ vững mục tiêu](Chuong_32_Giu_vung_muc_tieu.md)
* [Chương 33. Những sự đảo lộn](Chuong_33_Nhung_su_dao_lon.md)
* [Chương 34. Các cấu trúc và thực tế](Chuong_34_Cac_cau_truc_va_thuc_te.md)

---

### PHẦN V. HAI BẢN THỂ
* [Chương 35. Hai bản chất](Chuong_35_Hai_ban_chat.md)
* [Chương 36. Cuộc đời như một câu chuyện](Chuong_36_Cuoc_doi_nhu_mot_cau_chuyen.md)
* [Chương 37. Trải nghiệm hạnh phúc](Chuong_37_Trai_nghiem_hanh_phuc.md)
* [Chương 38. Nghĩ về cuộc sống](Chuong_38_Nghi_ve_cuoc_song.md)

---

### Phần Kết Thúc
* [Hồi Kết](Hoi_ket.md)
"""
    with open("README.md", "w", encoding="utf-8") as f:
        f.write(content)
    print("Generated README.md")

if __name__ == "__main__":
    convert_all()
