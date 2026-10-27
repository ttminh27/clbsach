#!/usr/bin/env python3
"""
scripts/fix_all_blockquotes.py

Chuẩn hóa toàn diện các khối trích dẫn (Blockquote), hợp nhất các câu song hành,
sửa các dòng trích dẫn tác giả bị ngắt quãng, và loại bỏ hiện tượng 'hộp rỗng/hộp vụn vặt'
trên toàn bộ các chương của tác phẩm "Để Thịnh Vượng Và Hạnh Phúc".
"""

import os
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK_DIR = os.path.join(ROOT_DIR, 'book', 'DeThinhVuongVaHanhPhuc')

def patch_file(filename, replacements):
    filepath = os.path.join(BOOK_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    changed = False
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            changed = True
        else:
            print(f"[WARN] In {filename}, target not found:\n{old[:60]}...")

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[OK] Patched {filename}")
    else:
        print(f"[SKIP] No changes in {filename}")

def main():
    # 1. Chương 08: Xây dựng kỹ năng phán đoán
    patch_file('08_phan_1_xay_dung_ky_nang_phan_doan.md', [
        # Hai vế đối nhau về thời gian và tiền bạc
        (
            "> Bạn sẽ không trở nên giàu có bằng cách dùng thời gian để tiết kiệm tiền.\n\n> Bạn sẽ trở nên giàu có bằng cách tiết kiệm thời gian để kiếm tiền.",
            "> Bạn sẽ không trở nên giàu có bằng cách dùng thời gian để tiết kiệm tiền.  \n> Bạn sẽ trở nên giàu có bằng cách tiết kiệm thời gian để kiếm tiền."
        ),
        # Hai câu về đòn bẩy và cần cù
        (
            "> Trong thời đại đòn bẩy, một quyết định đúng đắn có thể giúp bạn thắng cả cuộc chơi.\n\n> Thiếu đi sự cần cù, bạn sẽ không phát triển được cả kỹ năng phán đoán lẫn đòn bẩy.",
            "> Trong thời đại đòn bẩy, một quyết định đúng đắn có thể giúp bạn thắng cả cuộc chơi.  \n> Thiếu đi sự cần cù, bạn sẽ không phát triển được cả kỹ năng phán đoán lẫn đòn bẩy."
        ),
        # 3 câu tweet về người đi ngược trào lưu trước biểu đồ
        (
            "> Những người rất thông minh thường trông kỳ lạ vì họ nhất quyết suy nghĩ mọi thứ theo cách riêng của mình.\n\n> Người đi ngược trào lưu không phải là người luôn luôn phản đối – đó chỉ là một người tuân thủ mọi thứ theo cách khác. Một người đi ngược trào lưu sẽ có suy nghĩ độc lập từ những điều cơ bản và chống lại sức ép phải đi theo đám đông.\n\n> Rất dễ để hoài nghi. Rất dễ để bắt chước. Những người luôn lạc quan và đối lập với quần chúng là giống loài hiếm hoi nhất.",
            "> Những người rất thông minh thường trông kỳ lạ vì họ nhất quyết suy nghĩ mọi thứ theo cách riêng của mình.  \n> Người đi ngược trào lưu không phải là người luôn luôn phản đối – đó chỉ là một người tuân thủ mọi thứ theo cách khác. Một người đi ngược trào lưu sẽ có suy nghĩ độc lập từ những điều cơ bản và chống lại sức ép phải đi theo đám đông.  \n> Rất dễ để hoài nghi. Rất dễ để bắt chước. Những người luôn lạc quan và đối lập với quần chúng là giống loài hiếm hoi nhất."
        ),
        # Trích dẫn Richard Feynman bị ngắt tên
        (
            "> Tôi chưa bao giờ hỏi liệu “Tôi có thích điều này” hoặc “Tôi không thích điều này”. Tôi sẽ nghĩ “Đây là bản chất của vấn đề” hoặc “Đây không phải là bản chất của vấn đề”.\n\n> – Richard Feynman",
            "> “Tôi chưa bao giờ hỏi liệu ‘Tôi có thích điều này’ hoặc ‘Tôi không thích điều này’. Tôi sẽ nghĩ ‘Đây là bản chất của vấn đề’ hoặc ‘Đây không phải là bản chất của vấn đề’.”  \n> *— Richard Feynman*"
        )
    ])

    # 2. Chương 09: Học về hạnh phúc
    patch_file('09_phan_2_hoc_ve_hanh_phuc.md', [
        # Định nghĩa người hạnh phúc
        (
            "> Một người hạnh phúc không phải là người lúc nào cũng vui vẻ.\n\n> Đó là người không cần phải cố gắng để diễn giải mọi vấn đề sao cho không đánh mất sự bình yên bẩm sinh bên trong mình.",
            "> Một người hạnh phúc không phải là người lúc nào cũng vui vẻ.  \n> Đó là người không cần phải cố gắng để diễn giải mọi vấn đề sao cho không đánh mất sự bình yên bẩm sinh bên trong mình."
        ),
        # Hạnh phúc vs Thành công
        (
            "> Hạnh phúc là cảm thấy hài lòng với những gì bạn có.\n\n> Thành công đến từ sự không hài lòng. Hãy lựa chọn.",
            "> Hạnh phúc là cảm thấy hài lòng với những gì bạn có.  \n> Thành công đến từ sự không hài lòng. Hãy lựa chọn."
        ),
        # Trò chơi và động lực sinh tồn
        (
            "> Vấn đề khi giỏi một trò chơi, đặc biệt với trò chơi có phần thưởng lớn, là bạn vẫn sẽ bị cuốn vào trò chơi đó trong một thời gian dài mà đáng lẽ ra bạn phải tiến lên một cấp độ cao hơn.\n\n> Động lực sinh tồn và nhân rộng đã đẩy chúng ta vào những guồng quay. Sự thích ứng khoái lạc giữ chân chúng ta ở đó. Bí quyết là hãy biết khi nào nên nhảy ra ngoài vui chơi thay vì làm việc.",
            "> Vấn đề khi giỏi một trò chơi, đặc biệt với trò chơi có phần thưởng lớn, là bạn vẫn sẽ bị cuốn vào trò chơi đó trong một thời gian dài mà đáng lẽ ra bạn phải tiến lên một cấp độ cao hơn.  \n> Động lực sinh tồn và nhân rộng đã đẩy chúng ta vào những guồng quay. Sự thích ứng khoái lạc giữ chân chúng ta ở đó. Bí quyết là hãy biết khi nào nên nhảy ra ngoài vui chơi thay vì làm việc."
        ),
        # Khi làm việc vs khi vui chơi
        (
            "> Khi làm việc, hãy ở xung quanh những người thành công hơn bạn.\n\n> Khi vui chơi, hãy ở xung quanh những người hạnh phúc hơn bạn.",
            "> Khi làm việc, hãy ở xung quanh những người thành công hơn bạn.  \n> Khi vui chơi, hãy ở xung quanh những người hạnh phúc hơn bạn."
        )
    ])

    # 3. Chương 10: Cứu rỗi bản thân
    patch_file('10_phan_2_cuu_roi_ban_than.md', [
        # Tuyên ngôn mở đầu
        (
            "> Bác sĩ sẽ không giúp bạn khỏe mạnh. Chuyên gia dinh dưỡng sẽ không giúp bạn thon gọn. Giáo viên sẽ không giúp bạn thông minh hơn. Quân sư sẽ không giúp bạn bình tĩnh. Cố vấn sẽ không giúp bạn giàu có. Huấn luyện viên sẽ không giúp bạn có thân hình cân đối.\n\n> Sau cùng, bạn phải tự mình gánh vác trách nhiệm.\n\n> Hãy tự cứu rỗi bản thân.",
            "> Bác sĩ sẽ không giúp bạn khỏe mạnh. Chuyên gia dinh dưỡng sẽ không giúp bạn thon gọn. Giáo viên sẽ không giúp bạn thông minh hơn. Quân sư sẽ không giúp bạn bình tĩnh. Cố vấn sẽ không giúp bạn giàu có. Huấn luyện viên sẽ không giúp bạn có thân hình cân đối.  \n> Sau cùng, bạn phải tự mình gánh vác trách nhiệm.  \n> **Hãy tự cứu rỗi bản thân.**"
        ),
        # Thiền là sự nhịn ăn gián đoạn
        (
            "> Thiền là sự nhịn ăn gián đoạn dành cho tâm trí.\n\n> Quá nhiều đường sẽ dẫn đến một cơ thể nặng nề, và quá nhiều sự phân tâm sẽ dẫn đến một tâm trí nặng nề.\n\n> Soi chiếu lại bản thân, viết nhật ký, thiền là những khoảng thời gian bạn được ở một mình và không bị phân tâm bởi bất kỳ điều gì. Lúc này, bạn sẽ từ từ giải quyết các vấn đề tồn đọng, được chuyển từ trạng thái béo phì về tinh thần sang trạng thái cân đối.",
            "> Thiền là sự nhịn ăn gián đoạn dành cho tâm trí.  \n> Quá nhiều đường sẽ dẫn đến một cơ thể nặng nề, và quá nhiều sự phân tâm sẽ dẫn đến một tâm trí nặng nề.  \n> Soi chiếu lại bản thân, viết nhật ký, thiền là những khoảng thời gian bạn được ở một mình và không bị phân tâm bởi bất kỳ điều gì. Lúc này, bạn sẽ từ từ giải quyết các vấn đề tồn đọng, được chuyển từ trạng thái béo phì về tinh thần sang trạng thái cân đối."
        ),
        # Mini-thread các hình thái thiền
        (
            "> Thiền là gạt đi tiếng nói của xã hội và lắng nghe bản thân mình.\n\n> Nó chỉ thực sự “hiệu quả” khi được thực hiện đúng bản chất.\n\n> Leo núi là thiền đi.\n\n> Viết nhật ký là thiền viết.\n\n> Cầu nguyện là thiền biết ơn.\n\n> Tắm là thiền ngẫu nhiên.\n\n> Ngồi tĩnh lặng là thiền trực tiếp.",
            "> **Thiền là gạt đi tiếng nói của xã hội và lắng nghe bản thân mình.**  \n> Nó chỉ thực sự “hiệu quả” khi được thực hiện đúng bản chất:  \n> • Leo núi là thiền đi.  \n> • Viết nhật ký là thiền viết.  \n> • Cầu nguyện là thiền biết ơn.  \n> • Tắm là thiền ngẫu nhiên.  \n> • Ngồi tĩnh lặng là thiền trực tiếp."
        ),
        # Lời khuyên khi còn trẻ
        (
            "> Lời khuyên dành cho tôi khi còn trẻ: “Hãy là chính mình.”\n\n> Cảm thấy bị kiềm hãm nghĩa là đang ở trong những mối quan hệ và công việc tồi tệ nhiều năm thay vì vài phút.",
            "> Lời khuyên dành cho tôi khi còn trẻ: “Hãy là chính mình.”  \n> Cảm thấy bị kiềm hãm nghĩa là đang ở trong những mối quan hệ và công việc tồi tệ nhiều năm thay vì vài phút."
        )
    ])

    # 4. Chương 11: Triết lý
    patch_file('11_phan_2_triet_ly.md', [
        (
            "> “Mọi thứ đều tươi đẹp hơn bởi vì chúng ta đều chắc chắn sẽ chết đi. Sẽ không có một phiên bản nào đáng yêu hơn bạn của bây giờ, và chúng ta cũng sẽ không bao giờ hiện diện ở đây thêm một lần nào nữa.”\n\n> – Homer, Sử thi Iliad",
            "> “Mọi thứ đều tươi đẹp hơn bởi vì chúng ta đều chắc chắn sẽ chết đi. Sẽ không có một phiên bản nào đáng yêu hơn bạn của bây giờ, và chúng ta cũng sẽ không bao giờ hiện diện ở đây thêm một lần nào nữa.”  \n> *— Homer, Sử thi Iliad*"
        ),
        (
            "CẢM HỨNG SẼ MẤT ĐI, H ÃY HÀNH ĐỘNG NGAY LẬP TỨC.",
            "CẢM HỨNG SẼ MẤT ĐI, HÃY HÀNH ĐỘNG NGAY LẬP TỨC."
        )
    ])

    # 5. Chương 12: Tài liệu khuyến đọc
    patch_file('12_phu_luc_tai_lieu_khuyen_doc.md', [
        (
            "> Sự phổ cập công nghệ cho phép bất kỳ ai cũng có thể trở thành nhà sáng tạo, doanh nhân, nhà khoa học. Tương lai sẽ trở nên tươi sáng hơn.\n\n> Theo thống kê, nhiều khả năng sẽ có vô số nền văn minh tiên tiến của người ngoài hành tinh ngoài kia.\n\n> Hy vọng rằng họ sẽ là những nhà môi trường học tốt bụng và cảm thấy chúng ta dễ thương.",
            "> Sự phổ cập công nghệ cho phép bất kỳ ai cũng có thể trở thành nhà sáng tạo, doanh nhân, nhà khoa học. Tương lai sẽ trở nên tươi sáng hơn.  \n> Theo thống kê, nhiều khả năng sẽ có vô số nền văn minh tiên tiến của người ngoài hành tinh ngoài kia. Hy vọng rằng họ sẽ là những nhà môi trường học tốt bụng và cảm thấy chúng ta dễ thương."
        ),
        (
            "> Có lần tôi hỏi một nhà sư rằng ông ấy đã tìm thấy sự bình yên chưa.\n\n> “Tôi sẽ nói ‘có’”, ông ấy trả lời. “Với tất cả những gì đã xảy ra, tôi sẽ trả lời là ‘có’.” [7]",
            "> Có lần tôi hỏi một nhà sư rằng ông ấy đã tìm thấy sự bình yên chưa.  \n> “Tôi sẽ nói ‘có’”, ông ấy trả lời. “Với tất cả những gì đã xảy ra, tôi sẽ trả lời là ‘có’.” [7]"
        )
    ])

if __name__ == '__main__':
    main()
