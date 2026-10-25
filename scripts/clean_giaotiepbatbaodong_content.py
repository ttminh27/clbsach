#!/usr/bin/env python3
"""
scripts/clean_giaotiepbatbaodong_content.py

Chuyển đổi toàn bộ các lát cắt ảnh tiêu đề (Text-as-Image / Rasterized Text Artifacts)
thành văn bản Markdown ngữ nghĩa chuẩn (Semantic Markdown) cho 16 tập tin của tác phẩm
'Giao Tiếp Bất Bạo Động' (Nonviolent Communication - NVC).

Chỉ giữ lại các hình ảnh thực thụ:
- images/img_p001_4.jpg (Bìa sách)
- images/img_p035_317.jpg (Sơ đồ Quy trình NVC)
- images/img_p066_501.jpg (Hộp NVC trong thực tế: Giảng viên kiêu căng nhất...)
- images/img_p108_737.jpg (Hộp NVC trong thực tế: Lên án và phạt nặng...)
- images/img_p140_912.jpg (Hộp NVC trong thực tế: Bày tỏ nỗi lo sợ...)
- images/img_p163_1052.jpg (Hộp NVC trong thực tế: Người vợ kết nối...)
- images/img_p227_1411.jpg (Hộp NVC trong thực tế: Hai cha con)
- images/img_p292_1753.jpg (Hộp NVC trong thực tế: Chuyển hóa tức giận...)
- Các bảng biểu danh sách từ vựng cảm xúc chuẩn hóa
"""

import os
import re

BOOK_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'book', 'GiaoTiepBatBaoDong')

def clean_ch00():
    path = os.path.join(BOOK_DIR, '00_loi_khen_tang_va_loi_cam_on.md')
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. Bìa và Trang tiêu đề
    text = re.sub(
        r'!\[Nonviolent Communication - Giao Tiếp Bất Bạo Động \(Bìa sách\)\]\(images/img_p001_4\.jpg\)\s*!\[MARSHALL B\. ROSENBERG - Giao Tiếp Bất Bạo Động: Ngôn ngữ của lòng trắc ẩn\]\(images/img_p002_8\.jpg\)\s*\*\*\*Lời khen tặng dành cho Giao tiếp bất bạo\*\*\* \*\*\*động\*\*\*',
        '![Nonviolent Communication - Giao Tiếp Bất Bạo Động (Bìa sách)](images/img_p001_4.jpg)\n\n# Giao Tiếp Bất Bạo Động\n### Ngôn ngữ của lòng trắc ẩn\n**Marshall B. Rosenberg, Ph.D.**  \n*Lê Nguyễn Trần Huỳnh dịch*\n\n---\n\n# Lời khen tặng dành cho Giao tiếp bất bạo động',
        text
    )

    # 2. Các danh mục khen tặng
    cat_map = {
        r'!\[Môi trường công việc:\]\(images/img_p003_12\.jpg\)': '### Môi trường công việc',
        r'!\[Giao tiếp:\]\(images/img_p005_36\.png\)': '### Giao tiếp',
        r'!\[Giải quyết mâu thuẫn:\]\(images/img_p007_69\.jpg\)': '### Giải quyết mâu thuẫn',
        r'!\[Giáo dục:\]\(images/img_p009_103\.png\)': '### Giáo dục',
        r'!\[Sức khỏe / Chữa lành / Mối quan hệ với bản thân:\]\(images/img_p010_120\.jpg\)': '### Sức khỏe / Chữa lành / Mối quan hệ với bản thân',
        r'!\[Mối quan hệ trong gia đình:\]\(images/img_p011_141\.jpg\)': '### Mối quan hệ trong gia đình',
        r'!\[Phát triển bản thân:\]\(images/img_p013_169\.jpg\)': '### Phát triển bản thân',
        r'!\[Môi trường trại giam:\]\(images/img_p014_184\.jpg\)': '### Môi trường trại giam',
        r'!\[Hòa bình trên thế giới:\]\(images/img_p014_185\.jpg\)': '### Hòa bình trên thế giới',
        r'!\[Trị liệu tâm lý:\]\(images/img_p014_186\.png\)': '### Trị liệu tâm lý',
    }
    for pat, rep in cat_map.items():
        text = re.sub(pat, rep, text)

    # 3. Các tác giả lời khen tặng
    author_map = {
        r'!\[—BEN PETERSON\]\(images/img_p003_13\.jpg\)': '—**Ben Peterson**',
        r'!\[—SATYA NADELLA\]\(images/img_p003_14\.jpg\)': '—**Satya Nadella**',
        r'!\[—JACK CANFIELD\]\(images/img_p005_37\.jpg\)': '—**Jack Canfield**',
        r'!\[—VICKI ROBIN\]\(images/img_p005_38\.png\)': '—**Vicki Robin**',
        r'!\[—TONY ROBBINS\]\(images/img_p006_54\.jpg\)': '—**Tony Robbins**',
        r'!\[—WILLIAM URY\]\(images/img_p007_71\.jpg\)': '—**William Ury**',
        r'!\[—JOHN GRAY\]\(images/img_p007_72\.png\)': '—**John Gray**',
        r'!\[—Phóng viên D\. KILLIAN\]\(images/img_p008_90\.jpg\)': '—**Phóng viên D. Killian**',
        r'!\[—MIDWEST BOOK REVIEW\]\(images/img_p008_91\.jpg\)': '—**Midwest Book Review**',
        r'!\[—DIANA LION\]\(images/img_p009_104\.png\)': '—**Diana Lion**',
        r'!\[—RACHELLE LAMB\]\(images/img_p009_105\.jpg\)': '—**Rachelle Lamb**',
        r'!\[—DEEPAK CHOPRA\]\(images/img_p010_123\.jpg\)': '—**Deepak Chopra**',
        r'!\[—Một độc giả ở Arizona\]\(images/img_p011_142\.jpg\)': '—*Một độc giả ở Arizona*',
        r'!\[—Một y tá ở California\]\(images/img_p012_157\.jpg\)': '—*Một y tá ở California*',
        r'!\[—JOE VITALE\]\(images/img_p013_170\.png\)': '—**Joe Vitale**',
        r'!\[—WES TAYLOR\]\(images/img_p013_171\.png\)': '—**Wes Taylor**',
        r'!\[—DOW GORDON\]\(images/img_p014_187\.jpg\)': '—**Dow Gordon**',
        r'!\[—MARIANNE WILLIAMSON\]\(images/img_p014_188\.jpg\)': '—**Marianne Williamson**',
        r'!\[—Một độc giả trên Internet\]\(images/[^)]+\)': '—*Một độc giả trên Internet*',
        r'!\[Bác sĩ Deepak Chopra\]\(images/img_p016_213\.jpg\)': '—**Bác sĩ Deepak Chopra**',
        r'!\[—Deepak Chopra\]\(images/img_p021_234\.jpg\)': '—**Deepak Chopra**',
    }
    for pat, rep in author_map.items():
        text = re.sub(pat, rep, text)

    # 4. Lời giới thiệu & Lời cảm ơn
    text = re.sub(r'\*\*\*Lời giới thiệu\*\*\*', '## Lời giới thiệu', text)
    text = re.sub(r'\*\*Lời cảm ơn\*\*', '## Lời cảm ơn\n\n', text)

    # 5. Xóa watermark & chuẩn hóa bài thơ cuối
    text = re.sub(r'!\[Thư viện Ebook SachMoi\.Net\]\(images/img_p024_255\.jpg\)\s*', '', text)
    text = re.sub(
        r'!\[NGON TU LA CUJA SO\]\(images/img_p025_260\.jpg\)\s*!\[\(HOẶC CHÚNG LÀ BỨC TƯỜNG\)\]\(images/img_p025_259\.jpg\)',
        '### Ngôn từ là cửa sổ (hoặc chúng là bức tường)',
        text
    )
    # Xóa dấu chấm trơ trọi
    text = re.sub(r'\n\.\s*\n', '\n\n', text)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Cleaned 00_loi_khen_tang_va_loi_cam_on.md")

def clean_ch01():
    path = os.path.join(BOOK_DIR, '01_chuong_01.md')
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    text = re.sub(
        r'# \*\*CHƯƠNG 1\*\*\s*!\[Cho đi từ trái tim\]\(images/img_p027_271\.jpg\)\s*!\[Tinh thần cốt lõi của Giao tiếp bất bạo động\]\(images/img_p027_272\.jpg\)',
        '# Chương 1: Cho đi từ trái tim\n### Tinh thần cốt lõi của Giao tiếp bất bạo động',
        text
    )
    text = re.sub(r'!\[Giới thiệu\]\(images/img_p027_273\.png\)', '## Giới thiệu', text)
    text = re.sub(r'!\[Hướng sự chú tâm vào nơi giúp khơi dậy lòng trắc ẩn\]\(images/img_p029_293\.jpg\)', '## Hướng sự chú tâm vào nơi giúp khơi dậy lòng trắc ẩn', text)
    text = re.sub(r'!\[Quy trình NVC\]\(images/img_p033_308\.jpg\)', '## Quy trình NVC', text)

    # Thay thế khung ảnh rỗng Quy trình NVC bằng Callout Box chuẩn Markdown
    nvc_process_box = """> ### 📋 Quy trình NVC (Giao Tiếp Bất Bạo Động)
>
> **Bốn yếu tố cốt lõi:**
> 1. **Quan sát (Observation):** Những hành động cụ thể mà chúng ta quan sát, cái tác động đến cuộc đời chúng ta.
> 2. **Cảm xúc (Feeling):** Những cảm xúc của chúng ta liên quan đến điều ta quan sát.
> 3. **Nhu cầu (Need):** Những nhu cầu, giá trị, ham muốn tạo ra những cảm xúc đó.
> 4. **Đề nghị (Request):** Hành động cụ thể mà chúng ta đề nghị để giúp cải thiện chất lượng cuộc đời mình.
>
> ---
>
> **Hai phần của NVC:**
> 1. **Bày tỏ chân thật:** Bày tỏ bốn yếu tố của bản thân một cách chân thật.
> 2. **Lắng nghe đồng cảm:** Lắng nghe bốn yếu tố của người khác với sự đồng cảm."""

    text = re.sub(
        r'!\[Quy trình NVC: Bốn yếu tố và Hai phần của NVC\]\(images/img_p035_317\.jpg\)\s*Những hành động cụ thể mà chúng ta quan sát, cái tác động đến cuộc đời chúng ta Những cảm xúc của chúng ta liên quan đến điều ta quan sát Những nhu cầu, giá trị, ham muốn tạo ra những cảm xúc đó Hành động cụ thể mà chúng ta đề nghị để giúp cải thiện chất lượng cuộc đời mình',
        nvc_process_box,
        text
    )

    text = re.sub(r'!\[Áp dụng NVC trong cuộc sống\]\(images/img_p036_323\.jpg\)', '## Áp dụng NVC trong cuộc sống', text)

    # Định dạng danh sách áp dụng thành bullet points đẹp
    text = re.sub(
        r'Mối quan hệ tình cảm Gia đình Trường học Cơ quan và tổ chức Mối quan hệ tư vấn và trị liệu Đàm phán trong kinh doanh và ngoại giao Các cuộc xung đột và tranh chấp',
        '- Mối quan hệ tình cảm\n- Gia đình\n- Trường học\n- Cơ quan và tổ chức\n- Mối quan hệ tư vấn và trị liệu\n- Đàm phán trong kinh doanh và ngoại giao\n- Các cuộc xung đột và tranh chấp',
        text
    )

    text = re.sub(r'!\[“Quân giết người! Bọn ám sát! Lũ sát hại trẻ con!”\]\(images/img_p040_360\.jpg\)', '### NVC trong thực tế: “Quân giết người! Bọn ám sát! Lũ sát hại trẻ con!”', text)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Cleaned 01_chuong_01.md")

def clean_ch02():
    path = os.path.join(BOOK_DIR, '02_chuong_02.md')
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    text = re.sub(
        r'# \*\*CHƯƠNG 2\*\*\s*!\[Các loại giao tiếp gây cản trở lòng trắc ẩn\]\(images/img_p043_372\.jpg\)',
        '# Chương 2: Các loại giao tiếp gây cản trở lòng trắc ẩn',
        text
    )
    text = re.sub(r'!\[Phán xét đạo đức\]\(images/img_p043_373\.jpg\)', '## Phán xét đạo đức', text)
    text = re.sub(r'!\[So sánh\]\(images/img_p048_399\.png\)', '## So sánh', text)
    text = re.sub(r'!\[Chối bỏ trách nhiệm\]\(images/img_p049_405\.jpg\)', '## Chối bỏ trách nhiệm', text)
    text = re.sub(r'!\[Các loại “Giao tiếp xa rời sự sống” khác\]\(images/img_p052_417\.jpg\)', '## Các loại “Giao tiếp xa rời sự sống” khác', text)
    text = re.sub(r'!\[Tổng kết\]\(images/img_p055_436\.png\)', '## Tổng kết', text)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Cleaned 02_chuong_02.md")

def clean_ch03():
    path = os.path.join(BOOK_DIR, '03_chuong_03.md')
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    text = re.sub(
        r'# \*\*CHƯƠNG 3\*\*\s*!\[Quan sát mà không đánh giá\]\(images/img_p056_442\.jpg\)',
        '# Chương 3: Quan sát mà không đánh giá',
        text
    )
    text = re.sub(r'!\[Loại hình thông minh cao nhất của con người\]\(images/img_p060_460\.jpg\)', '## Loại hình thông minh cao nhất của con người', text)
    text = re.sub(r'!\[Tách biệt Quan sát với Đánh giá\]\(images/img_p063_472\.jpg\)', '## Tách biệt Quan sát với Đánh giá', text)
    text = re.sub(
        r'!\[NVC trong thực tế: “Giảng viên kiêu căng nhất từng đến đây!”\]\(images/img_p066_501\.jpg\)',
        '## NVC trong thực tế: “Giảng viên kiêu căng nhất từng đến đây!”',
        text
    )
    text = re.sub(
        r'!\[Bài tập 1\]\(images/img_p068_521\.png\)\s*!\[QUAN SÁT HAY ĐÁNH GIÁ\?\]\(images/img_p068_522\.jpg\)',
        '## Bài tập 1: Quan sát hay Đánh giá?',
        text
    )
    text = re.sub(r'!\[MÁT NẠ\]\(images/img_p071_536\.png\)', '### Bài thơ: Mặt nạ (Ruth Bebermeyer)', text)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Cleaned 03_chuong_03.md")

def clean_ch04():
    path = os.path.join(BOOK_DIR, '04_chuong_04.md')
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    text = re.sub(
        r'# \*\*CHƯƠNG 4\*\*\s*!\[Xác định và bày tỏ cảm xúc\]\(images/img_p073_545\.jpg\)',
        '# Chương 4: Xác định và bày tỏ cảm xúc',
        text
    )
    text = re.sub(
        r'!\[Cái giá đắt của những cảm xúc bị kìm nén\]\(images/img_p073_546\.jpg\)',
        '## Cái giá đắt của những cảm xúc bị kìm nén',
        text
    )
    text = re.sub(
        r'!\[Phân biệt những từ miêu tả cảm xúc và những từ không miêu tả cảm xúc\]\(images/img_p078_569\.jpg\)\s*!\[Tniêu t4 cảm XÚC\]\(images/img_p078_570\.jpg\)',
        '## Phân biệt những từ miêu tả cảm xúc và những từ không miêu tả cảm xúc',
        text
    )
    text = re.sub(
        r'!\[Từ ngữ miêu tả sự suy diễn / đánh giá thay vì cảm xúc thực sự\]\(images/img_p082_588\.jpg\)\s*!\[Phát triển vốn từ vựng cảm xúc\]\(images/img_p082_587\.jpg\)',
        '## Phát triển vốn từ vựng cảm xúc',
        text
    )

    # Dọn dẹp các lát cắt ảnh từ vựng bị ngắt dòng và trùng lặp
    text = re.sub(
        r'!\[Khi nhu cầu của bản thân được đáp ứng, chúng ta có khuynh\]\(images/img_p083_596\.jpg\)\s*!\[hướng cẩm thấy\.\.\.\]\(images/img_p083_594\.jpg\)',
        '### 1. Khi nhu cầu của bản thân được đáp ứng, chúng ta có khuynh hướng cảm thấy:',
        text
    )

    # Thay thế các khối ảnh từ vựng bằng danh sách cảm xúc chuẩn đẹp
    positive_feelings_block = """
| | | | |
| :--- | :--- | :--- | :--- |
| an toàn | đầy cảm hứng | hoan hỉ | nhẹ nhõm |
| an vui | đầy động lực | hồ hởi | thanh thản |
| ấm áp | đầy năng lượng | hứng khởi | tự hào |
| bằng lòng | tràn đầy sức sống | hy vọng | nhiệt huyết |
| bất ngờ | dễ chịu | khoái chí | thích thú |
| biết ơn | điềm tĩnh | kinh ngạc | tự tin |
| bình an | hả hê | lạc quan | phấn chấn |
| bình thản | hài lòng | mãn nguyện | thỏa mãn |
| bình tĩnh | hạnh phúc | minh mẫn | tươi tỉnh |
| can đảm | hân hoan | mong đợi | phấn khích |
| cảm động | hăng hái | mừng rỡ | thoải mái |
| choáng ngợp | hào hứng | ngạc nhiên | tuyệt vời |
| đắc chí | háo hức | ngây ngất | phấn khởi |
| thư thái | tin tưởng | quyết tâm | tỉnh táo |
| sáng suốt | toại nguyện | vui mừng | say mê |
| tò mò | vui sướng | sôi nổi | trân trọng |
| vui vẻ | sung sướng | trìu mến | xúc động |

### 2. Khi nhu cầu của bản thân KHÔNG được đáp ứng, chúng ta có khuynh hướng cảm thấy:

| | | | |
| :--- | :--- | :--- | :--- |
| ấm ức | bất ổn | bực dọc | ân hận |
| bi quan | bực mình | ăn năn | bối rối |
| bực tức | âu sầu | bơ phờ | buồn ngủ |
| băn khoăn | bồn chồn | bứt rứt | bất an |
| buồn bã | căng thẳng | bất bình | buồn phiền |
| cáu giận | bất hạnh | buồn tẻ | cay đắng |
| bất mãn | buồn rầu | chán chường | bực bội |
| chán nản | hoài nghi | nản lòng | chán ngán |
| hối hận | nặng nề | chua cay | hối tiếc |
| ngần ngại | chua xót | hồi hộp | ngấm ngầm |
| cô đơn | khó chịu | nghi ngờ | cực khổ |
| khổ sở | nghi hoặc | dao động | khó ở |
| ngại ngần | đắn đo | kích động | nhàm chán |
| đau buồn | kiệt sức | ngạc nhiên | đau đớn |
| ngờ vực | đau khổ | kinh hãi | nhục nhã |
| day dứt | kinh tởm | phân vân | điên tiết |
| lãnh đạm | phấp phỏng | do dự | lo âu |
| phiền lòng | e dè | lo lắng | phiền muộn |
| e ngại | lo ngại | phờ phạc | e sợ |
| lúng túng | quá tải | ghê tởm | lờ phờ |
| rã rời | ghen tị | sợ hãi | giận dữ |
| mệt lử | hoang mang | mệt mỏi | hoảng hốt |
| miễn cưỡng | sôi sục | hoảng loạn | sốt ruột |
| hoảng sợ | thất vọng | thấp thỏm | tổn thương |
| uất ức | thiếu kiên nhẫn | trầm cảm | uể oải |
| thờ ơ | tức giận | thoái chí | tức tối |
| xấu hổ | tiếc nuối | tủi nhục | xót xa |
| tội lỗi | tuyệt vọng | | |
"""

    text = re.sub(
        r'!\[an toàn đây cảm hứng.*?images/img_p083_595\.jpg\)\s*!\[nhẹ nhôm.*?images/img_p084_607\.jpg\)\s*(!\[Bài tập 2\]\(images/img_p084_604\.jpg\)\s*!\[BÀY TỎ CẢM XÚC\]\(images/img_p084_605\.jpg\)\s*)?!\[ấm ức bất ồn.*?images/img_p084_606\.jpg\)\s*!\[chán nản hoài nghỉ.*?images/img_p085_615\.jpg\)\s*!\[thấp thom tồn thương.*?images/img_p086_622\.jpg\)',
        positive_feelings_block.strip(),
        text,
        flags=re.DOTALL
    )

    text = re.sub(r'!\[Tổng kết\]\(images/img_p086_619\.png\)', '## Tổng kết', text)
    text = re.sub(
        r'!\[Chịu trách nhiệm cho cảm xúc của mình\]\(images/img_p086_620\.png\)\s*!\[BÀY TỎ CẢM XÚC\]\(images/img_p086_621\.jpg\)',
        '## Bài tập 2: Bày tỏ cảm xúc',
        text
    )
    text = re.sub(
        r'!\[Bài tập 2\]\(images/img_p084_604\.jpg\)\s*!\[BÀY TỎ CẢM XÚC\]\(images/img_p084_605\.jpg\)',
        '',
        text
    )
    text = re.sub(r'!\[Dưới đây là câu trả lời của tôi cho Bài tập 2:\]\(images/img_p087_632\.jpg\)', '### Lời giải đáp cho Bài tập 2', text)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Cleaned 04_chuong_04.md")

def clean_ch05():
    path = os.path.join(BOOK_DIR, '05_chuong_05.md')
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    text = re.sub(
        r'# \*\*CHƯƠNG 5\*\*\s*!\[Chịu trách nhiém cho cam xtc cua minh\]\(images/img_p089_641\.jpg\)',
        '# Chương 5: Chịu trách nhiệm cho cảm xúc của mình',
        text
    )
    text = re.sub(
        r'!\[Lắng nghe thông điệp ẩn giấu bên dưới cảm xúc của chính mình\]\(images/img_p089_642\.jpg\)',
        '## Lắng nghe thông điệp ẩn giấu bên dưới cảm xúc của chính mình',
        text
    )
    text = re.sub(r'!\[Nhu cầu là cội nguồn của cảm xúc\]\(images/img_p095_668\.jpg\)', '## Nhu cầu là cội nguồn của cảm xúc', text)
    text = re.sub(r'!\[Sư tư trị\]\(images/img_p097_677\.png\)', '### 1. Sự tự trị (Autonomy)', text)
    text = re.sub(r'!\[Sự toàn vẹn\]\(images/img_p097_678\.png\)', '### 2. Sự toàn vẹn (Integrity)', text)
    text = re.sub(r'!\[Sư kỷ niệm\]\(images/img_p098_686\.png\)', '### 3. Sự kỷ niệm / Ăn mừng (Celebration)', text)
    text = re.sub(r'!\[Sư vu1 chơi\]\(images/img_p098_687\.png\)', '### 4. Sự vui chơi (Play)', text)
    text = re.sub(r'!\[Nuôi đưỡng tỉnh thần\]\(images/img_p098_688\.jpg\)', '### 5. Nuôi dưỡng tinh thần (Spiritual Communion)', text)
    text = re.sub(r'!\[Nuôi dưỡng thể chất\]\(images/img_p098_689\.jpg\)', '### 6. Nuôi dưỡng thể chất (Physical Nurturance)', text)
    text = re.sub(r'!\[Mối quan hệ với người khác:\]\(images/img_p099_701\.jpg\)', '### 7. Mối quan hệ tương hỗ (Interdependence)', text)
    text = re.sub(r'!\[Nỗi đau của việc kìm nén nhu cầu\]\(images/img_p099_702\.jpg\)', '## Nỗi đau của việc kìm nén nhu cầu', text)
    text = re.sub(
        r'!\[NVC trong thực tế “Lên án và phạt nặng những đứa đề con hoang!”\]\(images/img_p108_737\.jpg\)',
        '## NVC trong thực tế: “Lên án và phạt nặng những đứa đẻ con hoang!”',
        text
    )
    text = re.sub(r'!\[Từ Nô lệ cẩm xúc đến Tự do cẩm xúc\]\(images/img_p102_716\.jpg\)', '## Từ Nô lệ cảm xúc đến Tự do cảm xúc', text)
    text = re.sub(r'!\[Tổng kết\]\(images/img_p086_619\.png\)', '## Tổng kết', text)
    text = re.sub(
        r'!\[Bài tập 3\]\(images/img_p112_753\.png\)\s*!\[BAY TO NHU CAU\]\(images/img_p112_752\.jpg\)',
        '## Bài tập 3: Bày tỏ nhu cầu',
        text
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Cleaned 05_chuong_05.md")

def clean_ch06():
    path = os.path.join(BOOK_DIR, '06_chuong_06.md')
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    text = re.sub(
        r'# \*\*CHƯƠNG 6\*\*\s*!\[Đưa ra đề nghị một cách rõ ràng và cụ thể\]\(images/img_p115_767\.jpg\)',
        '# Chương 6: Đưa ra đề nghị',
        text
    )
    text = re.sub(r'!\[Đầu tiên, chúng ta cần để nghị\]\(images/img_p115_770\.jpg\)', '', text)
    text = re.sub(
        r'!\[Sử dụng “ngôn ngữ hành động” rõ ràng, cụ thể\]\(images/img_p115_768\.jpg\)',
        '## Sử dụng “ngôn ngữ hành động” rõ ràng, cụ thể',
        text
    )
    text = re.sub(r'!\[Đề nghị một cách có ý thức\]\(images/img_p121_821\.jpg\)', '## Đề nghị một cách có ý thức', text)
    text = re.sub(r'!\[Đề nghị người kia diễn đạt lại\]\(images/img_p124_833\.jpg\)', '## Đề nghị người kia diễn đạt lại', text)
    text = re.sub(r'!\[Phân biệt Đề nghị và Yêu cầu áp đặt\]\(images/img_p126_842\.jpg\)', '## Phân biệt Đề nghị và Yêu cầu áp đặt', text)
    text = re.sub(r'!\[Dua ra dé nghị trong nhórn\]\(images/img_p128_851\.jpg\)', '## Đưa ra đề nghị trong nhóm', text)
    text = re.sub(r'!\[Phân biệt Đề nghị và Mệnh lệnh\]\(images/img_p130_860\.jpg\)', '## Phân biệt Đề nghị và Mệnh lệnh', text)

    # Khắc phục đoạn lặp và ảnh rác ở trang 134
    bad_repeat_pat = r'Lựa chọn đề nghị, thay vì mệnh lệnh, không có nghĩa là chúng ta từ bỏ khi người kia nói “Không” với đề nghị của chúng ta\. Điều đó chỉ có nghĩa là chúng ta bày tỏ sự đồng cảm với nhu cầu\s*!\[đằng sau sự từ chối.*?Việc đưa ra đề nghị chân thành đòi hỏi chúng ta ý thức về chủ đích của mình\.'
    good_replacement = """Lựa chọn đề nghị, thay vì mệnh lệnh, không có nghĩa là chúng ta từ bỏ khi người kia nói “Không” với đề nghị của chúng ta. Điều đó chỉ có nghĩa là chúng ta bày tỏ sự đồng cảm với nhu cầu đằng sau sự từ chối của họ trước, rồi sau đó mới nỗ lực tiếp tục cuộc đối thoại.

## Xác định chủ đích khi đưa ra đề nghị

Việc đưa ra đề nghị chân thành đòi hỏi chúng ta ý thức về chủ đích của mình."""

    text = re.sub(bad_repeat_pat, good_replacement, text, flags=re.DOTALL)

    # Loại bỏ các vết tích còn sót lại nếu có
    text = re.sub(r'!\[đằng sau sự từ chối của họ trước, rồi sau đó mới cổ gang\]\(images/img_p134_876\.jpg\)', '', text)
    text = re.sub(r'!\[NVC trong thực tế: Bày tỏ mong muốn một cách rõ ràng\]\(images/img_p134_877\.jpg\)', '', text)
    text = re.sub(r'!\[Xác định chủ đích khi đưa ra đề nghị\]\(images/img_p134_875\.jpg\)', '## Xác định chủ đích khi đưa ra đề nghị', text)

    text = re.sub(r'!\[Tổng kết\]\(images/img_p139_903\.png\)\s*Yếu tố thứ tư của NVC là đưa ra\s*–', '## Tổng kết\n\nYếu tố thứ tư của NVC là đưa ra lời đề nghị –', text)
    text = re.sub(r'!\[để nghị\]\(images/img_p139_904\.png\)', '', text)
    text = re.sub(
        r'!\[NVC trong thực tế Bày tỏ nỗi lo sợ về việc người bạn thân hút thuốc.*?\]\(images/img_p140_912\.jpg\)',
        '## NVC trong thực tế: Bày tỏ nỗi lo sợ về việc người bạn thân hút thuốc',
        text
    )
    text = re.sub(
        r'!\[Bài tập 4\]\(images/img_p143_941\.png\)\s*!\[ĐƯA RA ĐỀ NGHỊ\]\(images/img_p143_942\.jpg\)',
        '## Bài tập 4: Đưa ra đề nghị',
        text
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Cleaned 06_chuong_06.md")

def clean_ch07():
    path = os.path.join(BOOK_DIR, '07_chuong_07.md')
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    text = re.sub(
        r'# \*\*CHƯƠNG 7\*\*\s*!\[Lắng nghe đồng cẩm\]\(images/img_p146_956\.jpg\)',
        '# Chương 7: Lắng nghe với sự đồng cảm',
        text
    )
    text = re.sub(r'!\[Đừng làm gì cả, hãy có mặt thôi\]\(images/img_p146_957\.jpg\)', '## Đừng làm gì cả, hãy có mặt thôi', text)
    text = re.sub(r'!\[Lắng nghe những cẩm xúc và nhu cầu\]\(images/img_p150_974\.jpg\)', '## Lắng nghe những cảm xúc và nhu cầu', text)
    text = re.sub(r'!\[Diễn đạt lại\]\(images/img_p152_1001\.png\)', '## Diễn đạt lại', text)
    text = re.sub(r'!\[Duy trì sự đồng cắm\]\(images/img_p159_1031\.jpg\)', '## Duy trì sự đồng cảm', text)
    text = re.sub(r'!\[Khi nỗi đau cần trở khả năng đồng cẳm của chúng ta\]\(images/img_p161_1040\.jpg\)', '## Khi nỗi đau cản trở khả năng đồng cảm của chúng ta', text)
    text = re.sub(r'!\[Tổng kết\]\(images/img_p162_1046\.png\)', '## Tổng kết', text)
    text = re.sub(
        r'!\[NVC trong thực tế Một người vợ kết nối với người chồng sắp qua đời của mình\]\(images/img_p163_1052\.jpg\)',
        '## NVC trong thực tế: Một người vợ kết nối với người chồng sắp qua đời của mình',
        text
    )
    text = re.sub(
        r'!\[Bài tập 5\]\(images/img_p168_1073\.png\)\s*!\[Sức mạnh của sự đồng cảm\]\(images/img_p168_1074\.jpg\)',
        '## Bài tập 5: Lắng nghe với sự đồng cảm',
        text
    )
    text = re.sub(r'!\[Người A: Người B:\]\(images/img_p168_107[012]\.png\)', '', text)
    text = re.sub(r'!\[Đồng cảm để chữa lành\]\(images/img_p169_1103\.jpg\)', '### Lời giải đáp cho Bài tập 5', text)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Cleaned 07_chuong_07.md")

def clean_ch08():
    path = os.path.join(BOOK_DIR, '08_chuong_08.md')
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    text = re.sub(
        r'# \*\*CHƯƠNG 8\*\*\s*!\[Sức mạnh của sự đồng cẳm\]\(images/img_p171_1130\.jpg\)\s*!\[Đồng cảm giúp làm sống lại một cuộc trò chuyện\]\(images/img_p171_1131\.jpg\)',
        '# Chương 8: Sức mạnh của sự đồng cảm\n### Đồng cảm giúp làm sống lại một cuộc trò chuyện',
        text
    )
    text = re.sub(r'!\[Sự đồng cẳm giúp con người mmở lòng với nhau hơn\]\(images/img_p174_1148\.jpg\)', '## Sự đồng cảm giúp con người mở lòng với nhau hơn', text)
    text = re.sub(r'!\[Sự đồng cẳm giúp xoa dịu sự căng thẳng\]\(images/img_p176_1157\.jpg\)', '## Sự đồng cảm giúp xoa dịu sự căng thẳng', text)
    text = re.sub(r'!\[Đồng cẩm khi người khác nói “Không”\]\(images/img_p181_1179\.jpg\)', '## Đồng cảm khi người khác nói “Không”', text)
    text = re.sub(r'!\[Sự đồng cẳm giúp mang lại sức sống cho cuộc nói chuyện\]\(images/img_p183_1188\.jpg\)', '## Sự đồng cảm giúp mang lại sức sống cho cuộc nói chuyện', text)
    text = re.sub(r'!\[Đồng cẩm với sự im lặng\]\(images/img_p185_1197\.jpg\)', '## Đồng cảm với sự im lặng', text)
    text = re.sub(r'!\[Tổng kết\]\(images/img_p162_1046\.png\)', '## Tổng kết', text)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Cleaned 08_chuong_08.md")

def clean_ch09():
    path = os.path.join(BOOK_DIR, '09_chuong_09.md')
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    text = re.sub(
        r'# \*\*CHƯƠNG 9\*\*\s*!\[Long trac an voi ban than\]\(images/img_p190_1222\.jpg\)',
        '# Chương 9: Kết nối với chính mình bằng lòng trắc ẩn',
        text
    )
    text = re.sub(r'!\[Nhớ lại sự đặc biệt của con người minh\]\(images/img_p190_1223\.jpg\)', '## Nhớ lại sự đặc biệt của con người mình', text)
    text = re.sub(r'!\[Trắc ẩn với mình khi mắc lỗi\]\(images/img_p191_1231\.jpg\)', '## Trắc ẩn với mình khi mắc lỗi', text)
    text = re.sub(r'!\[Chuyền hóa những lời phán xét và ra lệnh cho bẳn thân\]\(images/img_p195_1246\.jpg\)', '## Chuyển hóa những lời phán xét và ra lệnh cho bản thân', text)
    text = re.sub(r'!\[Phân biệt nguyên nhân kích hoạt và cội nguồn của sự tức giận\]\(images/img_p196_1252\.jpg\)', '', text)
    text = re.sub(r'!\[Tha thi\? cho ban thân\]\(images/img_p197_1258\.jpg\)', '## Tha thứ cho bản thân', text)
    text = re.sub(r'!\[Bài học từ bộ com-lê chấm bỉ\]\(images/img_p198_1264\.jpg\)', '## Bài học từ bộ com-lê chấm bi', text)
    text = re.sub(r'!\[Bốn bước để bày tỏ sự tức giận\]\(images/img_p200_1274\.jpg\)', '', text)
    text = re.sub(r'!\[không mang tính vui chơi!\]\(images/img_p200_1273\.jpg\)', '', text)
    text = re.sub(r'!\[Chuyên từ “Tôi phải\.\.\.” sang “Tôi lựa chọn\.\.\.”\]\(images/img_p201_1282\.jpg\)', '## Chuyển từ “Tôi phải...” sang “Tôi lựa chọn...”', text)
    text = re.sub(r'!\[Chuyển từ “Tôi phải\.\.\.” sang “Tôi lựa chọn\.\.\.”\]\(images/img_p201_1282\.jpg\)', '## Chuyển từ “Tôi phải...” sang “Tôi lựa chọn...”', text)
    text = re.sub(
        r'!\[Phát triển sự ý thức về động lực đẳng sau những hành\]\(images/img_p203_1291\.jpg\)\s*!\[động của chúng ta\]\(images/img_p203_1292\.jpg\)',
        '## Phát triển sự ý thức về động lực đằng sau những hành động của chúng ta',
        text
    )
    text = re.sub(r'!\[A\. VÌ TIỀN\]\(images/img_p203_1293\.png\)', '### A. Vì tiền', text)
    text = re.sub(r'!\[B\. VÌ SỰ CHẤP NHÂN CỦA NGƯỜI KHÁC\]\(images/img_p204_1303\.jpg\)', '### B. Vì sự chấp nhận của người khác', text)
    text = re.sub(r'!\[C\. ĐỂ TRÁNH BỊ TRỪNG PHẠT\]\(images/img_p204_1304\.jpg\)', '### C. Để tránh bị trừng phạt', text)
    text = re.sub(r'!\[D\. ĐỂ TRÁNH CẢM GIÁC TỘI LỒI\]\(images/img_p205_1312\.jpg\)', '### D. Để tránh cảm giác tội lỗi', text)
    text = re.sub(r'!\[E\. DE TRANH CAM GIAC XAU HO\]\(images/img_p205_1313\.jpg\)', '### E. Để tránh cảm giác xấu hổ', text)
    text = re.sub(r'!\[F\. VI CAM GIAC VỀ NGHĨA VỤ\]\(images/img_p206_1321\.jpg\)', '### F. Vì cảm giác về nghĩa vụ', text)
    text = re.sub(r'!\[Tổng kết\]\(images/img_p162_1046\.png\)', '## Tổng kết', text)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Cleaned 09_chuong_09.md")

def clean_ch10():
    path = os.path.join(BOOK_DIR, '10_chuong_10.md')
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    text = re.sub(
        r'# \*\*CHƯƠNG 10\*\*\s*!\[Tổng kết\]\(images/img_p208_1330\.jpg\)',
        '# Chương 10: Bày tỏ sự tức giận một cách đầy đủ',
        text
    )
    text = re.sub(r'!\[Phân biệt tác nhân kích thích và nguyên nhân\]\(images/img_p209_1336\.jpg\)', '## Phân biệt tác nhân kích thích và nguyên nhân', text)
    text = re.sub(
        r'!\[Tai trung tâm của mọi sự tức giận là những nhu cầu\]\(images/img_p212_1348\.jpg\)\s*!\[không được đáp ứng\]\(images/img_p212_1349\.jpg\)',
        '## Tại trung tâm của mọi sự tức giận là những nhu cầu không được đáp ứng',
        text
    )
    text = re.sub(r'!\[Các bước giải quyết mâu thuẫn bằng NVC\]\(images/img_p214_1360\.jpg\)', '', text)
    text = re.sub(r'!\[Bốn bước để bày tổ sự tức giận một cách đây đủ\]\(images/img_p218_1375\.jpg\)', '## Bốn bước để bày tỏ sự tức giận một cách đầy đủ', text)
    text = re.sub(r'!\[Trước hết, hãy bày tô sự đồng cẳm\]\(images/img_p219_1381\.jpg\)', '## Trước hết, hãy bày tỏ sự đồng cảm', text)
    text = re.sub(r'!\[Khong voi va\]\(images/img_p224_1399\.png\)', '## Không vội vã', text)
    text = re.sub(r'!\[Tổng kết\]\(images/img_p162_1046\.png\)', '## Tổng kết', text)
    text = re.sub(
        r'!\[NVC trong thực tế Cuộc đối thoại giữa hai cha con\]\(images/img_p227_1411\.jpg\)',
        '## NVC trong thực tế: Cuộc đối thoại giữa hai cha con',
        text
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Cleaned 10_chuong_10.md")

def clean_ch11():
    path = os.path.join(BOOK_DIR, '11_chuong_11.md')
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    text = re.sub(
        r'# \*\*CHƯƠNG 11\*\*\s*!\[Giải quyết và hòa giải mâu thuẫn\]\(images/img_p234_1435\.jpg\)',
        '# Chương 11: Giải quyết và hòa giải mâu thuẫn',
        text
    )
    text = re.sub(r'!\[Thiết lập sự kết nổi giữa con người với nhau\]\(images/img_p235_1450\.jpg\)', '## Thiết lập sự kết nối giữa con người với nhau', text)
    text = re.sub(r'!\[Hòa giải bằng NVC và Hòa giải truyền thống\]\(images/img_p236_1456\.jpg\)', '## Hòa giải bằng NVC và Hòa giải truyền thống', text)
    text = re.sub(r'!\[Tổng quan các bước giải quyết mâu thuẫn bang NVC\]\(images/img_p237_1462\.jpg\)', '## Tổng quan các bước giải quyết mâu thuẫn bằng NVC', text)
    text = re.sub(r'!\[Phân biệt nhu cầu với cách thức và sự phân tích\]\(images/img_p238_1468\.jpg\)', '## Phân biệt nhu cầu với cách thức và sự phân tích', text)
    text = re.sub(r'!\[Lắng nghe nhu cầu của người kia bất kể họ nói gì\]\(images/img_p242_1483\.jpg\)', '## Lắng nghe nhu cầu của người kia bất kể họ nói gì', text)
    text = re.sub(r'!\[Nhu cầu đã được nghe thấy\?\]\(images/img_p245_1495\.jpg\)', '## Nhu cầu đã được nghe thấy?', text)
    text = re.sub(r'!\[Trao sự đồng cẩm để xoa diu nỗi đau\]\(images/img_p246_1501\.jpg\)', '## Trao sự đồng cảm để xoa dịu nỗi đau', text)
    text = re.sub(r'!\[Sử dụng “ngôn ngữ Ở thì hiện tại”\]\(images/img_p248_1510\.jpg\)', '## Sử dụng “ngôn ngữ ở thì hiện tại”', text)
    text = re.sub(r'!\[Sử dụng những động từ 1mnang tính hành động\]\(images/img_p249_1516\.jpg\)', '## Sử dụng những động từ mang tính hành động', text)
    text = re.sub(r'!\[Lắng nghe nhu cầu đằng sau từ “Không”\]\(images/img_p251_1525\.jpg\)', '## Lắng nghe nhu cầu đằng sau từ “Không”', text)
    text = re.sub(r'!\[NVC và vai trò của người hòa giải\]\(images/img_p252_1531\.jpg\)', '## NVC và vai trò của người hòa giải', text)
    text = re.sub(r'!\[Khi các bên từ chối gặp mặt nhau\]\(images/img_p259_1573\.jpg\)', '## Khi các bên từ chối gặp mặt nhau', text)
    text = re.sub(r'!\[Tổng kết\]\(images/img_p263_1588\.png\)', '## Tổng kết', text)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Cleaned 11_chuong_11.md")

def clean_ch12():
    path = os.path.join(BOOK_DIR, '12_chuong_12.md')
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    text = re.sub(
        r'# \*\*CHƯƠNG 12\*\*\s*!\[Dùng vũ lực với mục đích bảo vệ\]\(images/img_p265_1597\.jpg\)\s*!\[Khi việc dùng vũ lực là cần thiết\]\(images/img_p265_1598\.jpg\)',
        '# Chương 12: Dùng vũ lực với mục đích bảo vệ\n### Khi việc dùng vũ lực là cần thiết',
        text
    )
    text = re.sub(r'!\[Ý định đằng sau việc dùng vũ lực\]\(images/img_p265_1599\.jpg\)', '## Ý định đằng sau việc dùng vũ lực', text)
    text = re.sub(r'!\[Các loại “vũ lực với mục đích trừng phạt”\]\(images/img_p268_1615\.jpg\)', '## Các loại “vũ lực với mục đích trừng phạt”', text)
    text = re.sub(r'!\[Cái giá của sự trừng phạt\]\(images/img_p270_1624\.jpg\)', '## Cái giá của sự trừng phạt', text)
    text = re.sub(r'!\[Hai câu hỏi cho thấy những hạn chế của sự trừng phạt\]\(images/img_p271_1630\.jpg\)', '## Hai câu hỏi cho thấy những hạn chế của sự trừng phạt', text)
    text = re.sub(r'!\[Dùng “vũ lực với mục đích bảo vệ” trong trường học\]\(images/img_p272_1636\.jpg\)', '## Dùng “vũ lực với mục đích bảo vệ” trong trường học', text)
    text = re.sub(r'!\[Tổng kết\]\(images/img_p055_436\.png\)', '## Tổng kết', text)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Cleaned 12_chuong_12.md")

def clean_ch13():
    path = os.path.join(BOOK_DIR, '13_chuong_13.md')
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    text = re.sub(
        r'# \*\*CHƯƠNG 13\*\*\s*!\[Giải phóng bản thân và hỗ trợ người khác\]\(images/img_p280_1684\.jpg\)\s*!\[Giải phóng bản thân khỏi những niềm tin và khuôn mẫu thói quen cũ\]\(images/img_p280_1685\.jpg\)',
        '# Chương 13: Giải phóng bản thân và hỗ trợ người khác\n### Giải phóng bản thân khỏi những niềm tin và khuôn mẫu thói quen cũ',
        text
    )
    text = re.sub(r'!\[Giải quyết những xung đột bên trong\]\(images/img_p281_1711\.jpg\)', '## Giải quyết những xung đột bên trong', text)
    text = re.sub(r'!\[Nuôi dưỡng sự bình an trong tâm trí\]\(images/img_p283_1720\.jpg\)', '## Nuôi dưỡng sự bình an trong tâm trí', text)
    text = re.sub(r'!\[Thay thế sự chẩn đoán bằng NVC\]\(images/img_p286_1732\.jpg\)', '## Thay thế sự chẩn đoán bằng NVC', text)
    text = re.sub(r'!\[Tổng kết\]\(images/img_p292_1754\.png\)', '## Tổng kết', text)
    text = re.sub(
        r'!\[NVC trong thực tế: Chuyển hóa sự tức giận và những lời chỉ trích bản thân\]\(images/img_p292_1753\.jpg\)',
        '## NVC trong thực tế: Chuyển hóa sự tức giận và những lời chỉ trích bản thân',
        text
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Cleaned 13_chuong_13.md")

def clean_ch14():
    path = os.path.join(BOOK_DIR, '14_chuong_14.md')
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    text = re.sub(
        r'# \*\*CHƯƠNG 14\*\*\s*!\[Bày tỏ sự ghi nhận và lòng biết ơn\]\(images/img_p298_1777\.jpg\)\s*!\[Ý định đằng sau sự ghi nhận\]\(images/img_p298_1778\.jpg\)',
        '# Chương 14: Bày tỏ sự ghi nhận và lòng biết ơn\n### Ý định đằng sau sự ghi nhận',
        text
    )
    text = re.sub(r'!\[Ba yếu tố của lòng biết ơn\]\(images/img_p300_1792\.jpg\)', '## Ba yếu tố của lòng biết ơn', text)
    text = re.sub(r'!\[Đón nhận sự ghi nhận và lòng biết ơn\]\(images/img_p302_1801\.jpg\)', '## Đón nhận sự ghi nhận và lòng biết ơn', text)
    text = re.sub(r'!\[Sự khao khát được ghi nhận\]\(images/img_p304_1810\.jpg\)', '## Sự khao khát được ghi nhận', text)
    text = re.sub(r'!\[Vượt qua sự ngần ngại khi bày tỏ lòng biết ơn\]\(images/img_p307_1829\.jpg\)', '## Vượt qua sự ngần ngại khi bày tỏ lòng biết ơn', text)
    text = re.sub(r'!\[Tổng kết\]\(images/img_p055_436\.png\)', '## Tổng kết', text)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Cleaned 14_chuong_14.md")

def clean_ch15():
    path = os.path.join(BOOK_DIR, '15_loi_ket.md')
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    if not text.startswith('# '):
        text = re.sub(r'^\*\*Lời kết\*\*', '# Lời kết & Chú thích tham khảo\n\n', text)
    text = re.sub(r'!\[Thư viện Ebook SachMoi\.Net\]\(images/img_p024_255\.jpg\)\s*', '', text)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Cleaned 15_loi_ket.md")

def main():
    print("Bắt đầu chuẩn hóa 16 chương của sách Giao Tiếp Bất Bạo Động...")
    clean_ch00()
    clean_ch01()
    clean_ch02()
    clean_ch03()
    clean_ch04()
    clean_ch05()
    clean_ch06()
    clean_ch07()
    clean_ch08()
    clean_ch09()
    clean_ch10()
    clean_ch11()
    clean_ch12()
    clean_ch13()
    clean_ch14()
    clean_ch15()
    print("Hoàn tất chuẩn hóa toàn bộ sách!")

if __name__ == '__main__':
    main()
