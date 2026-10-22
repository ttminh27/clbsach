import fitz
import unicodedata
import re
import os

doc = fitz.open('raw/RenThoiQuenTuDuyPhanBien.pdf')

def clean_text(t):
    return unicodedata.normalize('NFC', t).replace('\xa0', ' ')

def format_spans(spans):
    merged = []
    for s in spans:
        t = unicodedata.normalize('NFC', s['text']).replace('\xa0', ' ')
        if not t:
            continue
        flg = s['flags']
        is_sup = bool(flg & 1)
        is_bold = bool(flg & 16)
        is_italic = bool(flg & 2)
        style = (is_sup, is_bold, is_italic)
        if merged and merged[-1][0] == style:
            merged[-1][1] += t
        else:
            merged.append([style, t])
    
    out = ''
    for (is_sup, is_bold, is_italic), t in merged:
        m_lead = re.match(r'^(\s+)', t)
        lead = m_lead.group(1) if m_lead else ''
        m_trail = re.search(r'(\s+)$', t)
        trail = m_trail.group(1) if m_trail else ''
        core = t.strip()
        if not core:
            out += t
            continue
        
        if is_sup:
            formatted = f'<sup>{core}</sup>'
        elif is_bold and is_italic:
            formatted = f'***{core}***'
        elif is_bold:
            formatted = f'**{core}**'
        elif is_italic:
            formatted = f'*{core}*'
        else:
            formatted = core
        out += lead + formatted + trail
    return out

def get_page_items(doc, pno):
    page = doc[pno]
    d = page.get_text('dict')
    items = []
    
    for b in d['blocks']:
        if b.get('type') == 0:
            lines = b['lines']
            idx = 0
            while idx < len(lines):
                l = lines[idx]
                spans = l['spans']
                raw = clean_text(''.join(s['text'] for s in spans).strip())
                if not raw:
                    idx += 1
                    continue
                bbox = l['bbox']
                line_md = format_spans(spans).strip()
                is_bi = all((s['flags'] & 18) == 18 for s in spans if s['text'].strip())
                is_b = all((s['flags'] & 16) and not (s['flags'] & 2) for s in spans if s['text'].strip())
                is_i = all((s['flags'] & 2) and not (s['flags'] & 16) for s in spans if s['text'].strip())
                max_sz = max(s['size'] for s in spans)
                
                # Check for wrapped heading within same block
                if 150 <= bbox[0] <= 160 and idx + 1 < len(lines):
                    next_l = lines[idx + 1]
                    next_raw = clean_text(''.join(s['text'] for s in next_l['spans']).strip())
                    if next_raw.endswith(')') or (len(next_raw) < 15 and not next_raw.endswith('.')):
                        raw += ' ' + next_raw
                        next_md = format_spans(next_l['spans']).strip()
                        line_md += ' ' + next_md
                        idx += 1
                
                items.append({
                    'type': 'text',
                    'bbox': bbox,
                    'x0': bbox[0],
                    'y0': bbox[1],
                    'x1': bbox[2],
                    'y1': bbox[3],
                    'raw': raw,
                    'md': line_md,
                    'is_bi': is_bi,
                    'is_b': is_b,
                    'is_i': is_i,
                    'size': max_sz,
                    'pno': pno + 1
                })
                idx += 1
        elif b.get('type') == 1:
            items.append({
                'type': 'image',
                'bbox': b['bbox'],
                'x0': b['bbox'][0],
                'y0': b['bbox'][1],
                'x1': b['bbox'][2],
                'y1': b['bbox'][3],
                'width': b['width'],
                'height': b['height'],
                'pno': pno + 1
            })
    items.sort(key=lambda x: (x['y0'], x['x0']))
    return items

def convert_chapter(pages):
    all_items = []
    for p in pages:
        all_items.extend(get_page_items(doc, p))
        
    blocks = []
    current_p = []
    table_p40_done = False
    
    def flush():
        nonlocal current_p
        if current_p:
            p_text = ' '.join(current_p)
            blocks.append(p_text)
            current_p = []

    i = 0
    n = len(all_items)
    
    while i < n:
        item = all_items[i]
        
        if item['type'] == 'image':
            w, h = item['width'], item['height']
            pno = item['pno']
            if w == 800 and h == 1170:
                flush()
                blocks.append("![Bìa sách](images/cover.jpeg)")
            elif w == 468 and h == 165:
                flush()
                blocks.append("![Sự hoán đổi thói quen](images/page_37_hoan_doi_thoi_quen.png)")
            elif w == 400 and h == 417:
                flush()
                blocks.append("![Sơ đồ phát triển thói quen](images/page_74_so_do_thoi_quen.png)")
            elif w == 500 and h == 645:
                flush()
                blocks.append("![Bảng theo dõi Eisenhower Matrix](images/page_107_bang_theo_doi.png)")
            i += 1
            continue
            
        raw = item['raw']
        md = item['md']
        x0 = item['x0']
        sz = item['size']
        is_bi = item['is_bi']
        is_b = item['is_b']
        pno = item['pno']
        
        # 1. Chapter Title: size > 17
        if sz > 17:
            flush()
            if re.match(r'^-\s*\d+\s*-$', raw):
                ch_num = re.sub(r'[^0-9]', '', raw)
                title_lines = []
                j = i + 1
                while j < n and all_items[j]['type'] == 'text' and all_items[j]['size'] > 17:
                    title_lines.append(all_items[j]['raw'])
                    j += 1
                full_title = ' '.join(title_lines)
                blocks.append(f"# CHƯƠNG {ch_num}: {full_title}")
                i = j
                continue
            else:
                blocks.append(f"# {raw}")
                i += 1
                continue
                
        # 2. Epigraph / Quote (is_bi)
        if is_bi:
            flush()
            quote_lines = [md.replace('***', '').replace('**', '').replace('*', '')]
            author = None
            j = i + 1
            while j < n and all_items[j]['type'] == 'text' and all_items[j]['is_bi']:
                line_raw = all_items[j]['raw']
                if line_raw.startswith('-') or line_raw.startswith('–'):
                    author = line_raw.lstrip('-– ').strip()
                    j += 1
                    break
                else:
                    quote_lines.append(all_items[j]['md'].replace('***', '').replace('**', '').replace('*', ''))
                    j += 1
            
            quote_text = ' '.join(quote_lines).strip()
            if not quote_text.startswith(('“', '"')):
                quote_text = f'"{quote_text}'
            if not quote_text.endswith(('”', '"')):
                quote_text = f'{quote_text}"'
            
            if author:
                blocks.append(f'> {quote_text}\n>\n> *— {author}*')
            else:
                blocks.append(f'> {quote_text}')
            i = j
            continue
            
        # 3. Subsection heading with icon (x0 around 155.3)
        if 150 <= x0 <= 160 and is_b:
            flush()
            clean_title = md.strip().replace('***', '').replace('**', '').strip()
            if 'CÁC BƯỚC HÀNH ĐỘNG' in raw:
                blocks.append(f"### CÁC BƯỚC HÀNH ĐỘNG")
            else:
                blocks.append(f"### {clean_title}")
            i += 1
            continue
            
        # 4. Major section headings (uppercase, bold, size 15, x0 < 150)
        if is_b and (raw.isupper() or 'TÓM TẮT' in raw or 'TÓM TẮT' in raw) and len(raw) > 3 and x0 < 150:
            flush()
            sec_lines = [raw]
            j = i + 1
            while j < n and all_items[j]['type'] == 'text' and all_items[j]['is_b'] and all_items[j]['raw'].isupper() and all_items[j]['x0'] < 150:
                sec_lines.append(all_items[j]['raw'])
                j += 1
            sec_title = ' '.join(sec_lines)
            if 'TÓM TẮT' in sec_title or 'TÓM TẮT' in sec_title:
                blocks.append(f"## TÓM TẮT")
            else:
                blocks.append(f"## {sec_title}")
            i = j
            continue

        # 5. Star separator & Slogan
        if '★' in raw:
            flush()
            blocks.append("\n---\n")
            i += 1
            continue
            
        if 'Chúng tôi không bán sách, chúng tôi bán kiến thức' in raw:
            flush()
            slogan_lines = [raw]
            j = i + 1
            while j < n and all_items[j]['type'] == 'text' and 'tập đoàn hàng đầu' in all_items[j]['raw']:
                slogan_lines.append(all_items[j]['raw'])
                j += 1
            blocks.append(f"> *{' '.join(slogan_lines)}*")
            i = j
            continue

        # 6. Table on page 40
        if pno == 40 and ('Lề thói hằng' in raw or 'Lề thói hằng ngày' in raw):
            flush()
            if not table_p40_done:
                blocks.append("| Lề thói hằng ngày | Lề thói hằng ngày mới – gắn liền với lề thói có sẵn |\n|---|---|\n| | |\n| | |\n| | |\n| | |\n| | |")
                table_p40_done = True
            j = i + 1
            while j < n and all_items[j]['pno'] == 40 and (all_items[j]['x0'] < 100 or 'sẵn' in all_items[j]['raw'] or all_items[j]['raw'] == ''):
                j += 1
            i = j
            continue

        # 7. Footnotes
        if raw == 'Chú thích:':
            flush()
            fn_lines = ["> **Chú thích:**\n>"]
            j = i + 1
            fn_pno = item['pno']
            while j < n and all_items[j]['type'] == 'text' and all_items[j]['pno'] == fn_pno:
                if 150 <= all_items[j]['x0'] <= 160 or (all_items[j]['is_b'] and all_items[j]['raw'].isupper()):
                    break
                fn_lines.append(f"> {all_items[j]['md']}")
                j += 1
            blocks.append('\n'.join(fn_lines))
            i = j
            continue

        # 8. Lists (bullet points • or numbered items 1. 2. or +)
        is_list_start = bool(re.match(r'^(•|\+|\d+\.)\s+', raw))
        if is_list_start:
            flush()
            list_md = md
            if raw.startswith('•'):
                list_md = re.sub(r'^•\s*', '- ', md)
            elif raw.startswith('+'):
                list_md = re.sub(r'^\+\s*', '+ ', md)
            
            item_parts = [list_md]
            j = i + 1
            while j < n and all_items[j]['type'] == 'text':
                next_item = all_items[j]
                if bool(re.match(r'^(•|\+|\d+\.)\s+', next_item['raw'])) or 150 <= next_item['x0'] <= 160 or (next_item['is_b'] and next_item['raw'].isupper()) or next_item['x0'] >= 100 or next_item['is_bi'] or next_item['raw'] == 'Chú thích:' or '★' in next_item['raw'] or 'Chúng tôi không bán sách' in next_item['raw']:
                    break
                item_parts.append(next_item['md'])
                j += 1
            blocks.append(' '.join(item_parts))
            i = j
            continue

        # 9. Regular text paragraphs
        if x0 >= 100:
            flush()
            current_p.append(md)
        else:
            current_p.append(md)
        i += 1

    flush()
    return '\n\n'.join(blocks)

def build_front_matter():
    lines = [
        "# RÈN THÓI QUEN TƯ DUY PHẢN BIỆN",
        "",
        "![Bìa sách](images/cover.jpeg)",
        "",
        "---",
        "",
        "## THÔNG TIN PHÁT HÀNH",
        "",
        "**HỘI MÊ SÁCH**  ",
        "Tải eBooks miễn phí tại: [https://hoimesach.com](https://hoimesach.com)  ",
        "Nhận eBooks miễn phí qua Zalo: [https://zalo.hoimesach.com](https://zalo.hoimesach.com)  ",
        "Group: [https://facebook.com/groups/mesachhoi](https://facebook.com/groups/mesachhoi)",
        "",
        "---",
        "",
        "## THÔNG TIN XUẤT BẢN",
        "",
        "### RÈN THÓI QUEN TƯ DUY PHẢN BIỆN",
        "",
        "**NHÀ XUẤT BẢN CÔNG THƯƠNG**  ",
        "Trụ sở: Số 655 Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội  ",
        "Điện thoại: 024-3 934 1562 | Fax: 024-3 938 7164  ",
        "Website: [http://nhaxuatbancongthuong.com](http://nhaxuatbancongthuong.com)  ",
        "E-mail: nxbct@moit.gov.vn",
        "",
        "**Chịu trách nhiệm xuất bản:**  ",
        "Giám đốc - Tổng Biên tập: **NGUYỄN MINH HUỆ**  ",
        "Biên tập: Lương Thị Ngọc Bích  ",
        "Sửa bản in: Trung Trịnh  ",
        "Trình bày: Vũ Lê Thư  ",
        "Thiết kế bìa: Trang Fu",
        "",
        "**CÔNG TY CỔ PHẦN SÁCH ALPHA**  ",
        "[www.alphabooks.vn](http://www.alphabooks.vn)  ",
        "VP HN: Tầng 3, Dream Center Home, số 11A, ngõ 282 Nguyễn Huy Tưởng, Phường Thanh Xuân Trung, Quận Thanh Xuân, TP. Hà Nội  ",
        "Tel: (84-24) 3 722 62 34 | Fax: (84-24) 3 722 62 37  ",
        "Chi nhánh TP. HCM: 138C Nguyễn Đình Chiểu, Phường 6, Quận 3, TP. Hồ Chí Minh  ",
        "Tel: (84-28) 38220 334 | 35",
        "",
        "In 3000 cuốn, khổ 12 x 18 cm tại Công ty Cổ phần In và Thương mại Prima.  ",
        "Địa chỉ: số 35, ngõ 93 Hoàng Quốc Việt, Cầu Giấy, Hà Nội.  ",
        "Số xác nhận đăng kí xuất bản: 4436-2022/CXBIPH/03-251/CT  ",
        "Số Quyết định xuất bản: 455/QĐ - NXBCT ngày 08 tháng 12 năm 2022  ",
        "In xong và nộp lưu chiểu Quý I năm 2023  ",
        "**Mã số ISBN: 978-604-362-509-7**",
        "",
        "---",
        "",
        "> **BẰNG CÁCH DÀNH RA MỘT CHÚT**  \n> thời gian để xây dựng các thói quen tư duy phản biện tốt, bạn sẽ giải phóng được thời gian để làm những điều mà bạn mong muốn trong cuộc sống.",
        "",
        "## LỜI GIỚI THIỆU: TƯ DUY QUAN TRỌNG NHẤT TRONG THẾ GIỚI HIỆN ĐẠI",
        "",
        "Kỹ năng nào trong cuộc sống có thể còn quan trọng hơn bằng đại học? Đó là tư duy phản biện (Critical Thinking), một kỹ năng cơ bản đang ngày càng trở nên quan trọng trong thế giới hiện đại.",
        "",
        "Một trong những lý do khiến hầu hết chúng ta đưa ra các quyết định sai lầm, nhiều khi đi theo đám đông, đầu tư theo xu hướng và hành động theo phong trào dẫn đến thất bại mà thiếu những quyết định đúng đắn là vì hệ thống giáo dục không dạy tư duy phản biện. Đó là lý do khiến hầu hết chúng ta không bao giờ phát huy hết tiềm năng của mình, không có tư duy phản biện dẫn đến suy luận kém, không có khả năng phân biệt sự thật từ hư cấu, từ những lừa dối và ngụy biện.",
        "",
        "Trong một xã hội tràn ngập thông tin và đầy cạm bẫy như ngày nay, nhận thấy tư duy phản biện ngày càng trở nên quan trọng và cần thiết đối với mọi người, từ các em học sinh đến sinh viên, người lao động, quản lý, điều hành và cả những nhà lãnh đạo, nên Alpha Books tìm kiếm và lựa chọn những cuốn sách hữu ích nhất về chủ đề này để giới thiệu tư duy phản biện là gì, cách xây dựng thói quen tư duy phản biện và phân biệt sự thật với hư cấu, qua đó, giúp các bạn vững chắc hơn trong hành trình của mình.",
        "",
        "### Bộ sách này bao gồm:",
        "",
        "- ![](images/book_bullet_1.png) **Tư duy phản biện từ làm quen đến thói quen:** 9 tiêu chuẩn, 8 yếu tố, 7 đặc điểm đối với nhà tư duy phản biện",
        "- ![](images/book_bullet_2.png) **Rèn thói quen tư duy phản biện:** Công cụ và ứng dụng kiến tạo tư duy ưu việt",
        "- ![](images/book_bullet_3.png) **Bẫy ngụy biện trong tư duy phản biện:** Bốn quy luật logic và các lỗi thường gặp",
        "- ![](images/book_bullet_4.png) **Giải phóng sức mạnh tư duy phản biện:** Giải mã 10 kiểu ngụy biện, triệt tiêu chiêu trò lừa đảo và hiểu chính xác về ngụy khoa học",
        "",
        "### Chúng tôi tin rằng, bộ sách này sẽ cung cấp cho các bạn:",
        "",
        "- Khung tư duy phản biện được phát triển bởi hai trong số những nhà khoa học về tư duy phản biện giàu kinh nghiệm nhất mọi thời đại và cách biến nó thành của riêng bạn.",
        "- 8 đặc điểm tư duy phản biện bạn đã có, nhưng không biết cách tối ưu hóa chúng.",
        "- Cách xác định tin giả và thông tin sai lệch – tìm hiểu điều này và bạn sẽ có lợi thế LỚN hơn hầu hết mọi người xung quanh mình ngay bây giờ.",
        "- Lý do bạn nên nghi ngờ bất cứ ai trích dẫn một nhân vật có thẩm quyền.",
        "- 6 quy tắc biến thói quen hiện tại của bạn thành thói quen lành mạnh.",
        "- Các bài tập dễ áp dụng, dễ thực hiện để bạn luyện tập mọi điểm đã đề cập. Bạn sẽ không “đọc và quên” bộ sách này.",
        "- … và nhiều, nhiều hơn thế nữa!",
        "",
        "Chúng tôi tin rằng, những người không ngừng học tập sẽ tiếp tục phát triển và thành công. Vì thế, cách thức trở thành một người có tư duy độc lập và đưa ra các quyết định thông minh là mục đích của chúng tôi. Chúng tôi mong rằng bộ sách thực tế, dễ đọc này sẽ giúp bạn xây dựng những lập luận vững chắc hơn, đưa ra các quyết định tự tin hơn và phát hiện ra những lỗi logic trong cuộc sống.",
        "",
        "Tư duy phản biện sẽ giúp bạn có các quyết định đúng đắn hơn, thông minh hơn trong cuộc sống cá nhân và nghề nghiệp của bạn.",
        "",
        "**NGUYỄN CẢNH BÌNH**  \n*Chủ tịch Alpha Books - Viện trưởng Viện lãnh đạo ABG*"
    ]
    return '\n'.join(lines)

def build_thinknetic_team():
    lines = [
        "# ĐỘI NGŨ TẠI THINKNETIC",
        "",
        "## MICHAEL MEISNER, NGƯỜI SÁNG LẬP KIÊM CEO",
        "",
        "Khi Michael bắt đầu phát hành sách trên Amazon, ông nhận ra chủ đề ưa thích của mình – quá trình suy nghĩ và kết quả của nó – đang được thảo luận theo cách quá phức tạp và thiếu cuốn hút. Vì thế, ông quyết định biến mơ ước của mình trở thành hiện thực: những cuốn sách vừa giàu thông tin, vừa thú vị, và có thể giúp mọi người đạt được thành công nhờ lối tư duy thông suốt.",
        "",
        "Mơ ước này trở thành niềm đam mê và sự nghiệp của ông. Ông xây dựng một đội ngũ gồm những người có tư tưởng giống như mình, đồng thời phụ trách mảng chiến lược và định hướng thương hiệu, trong khi tiếp tục cải thiện và mở rộng doanh nghiệp của mình.",
        "",
        "## DIANA SPOIALA, GIÁM ĐỐC XUẤT BẢN",
        "",
        "Từ ý tưởng tới một cuốn sách hoàn chỉnh là cả một quá trình nghiên cứu và thiết kế, viết và biên tập, sau đó bọc cuốn sách trong một chiếc bìa phù hợp. Diana quản lý quy trình này và đảm bảo chất lượng của mỗi cuốn sách. Bên cạnh công việc, bà dành phần lớn thời gian cho đam mê đọc sách, viết văn, thơ ca và triết học.",
        "",
        "## THERESA DATINGUINOO, CHUYÊN GIA NGHIÊN CỨU VÀ SOẠN KẾT CẤU",
        "",
        "Theresa luôn cảm thấy “vô cùng thỏa mãn khi kết hợp các ý tưởng với nhau để tạo ra một cơ sở vững chắc cho một câu chuyện thu hút và nhìn thấy sản phẩm cuối cùng ra đời”. Bà vốn có kinh nghiệm trong lĩnh vực quản lý nhân lực và tâm lý học, nhưng bà luôn ưa thích viết các bài báo và blog về gần như mọi chủ đề.",
        "",
        "## DORIS LAM, BIÊN TẬP VIÊN NỘI DUNG CẤP CAO",
        "",
        "Doris đã làm công việc biên tập các ấn phẩm truyền thông từ năm 2005 với vai trò Tổng biên tập và Điều phối chương trình cho một vài cơ quan môi trường. Bà luôn cố gắng giúp đỡ các cây viết diễn tả rõ ràng những gì mình muốn, biến tác phẩm của mỗi cây viết trở thành một tuyệt tác. Để tìm hiểu thêm về những tác phẩm xuất sắc của Doris, hãy ghé thăm trang [www.dorissiu.com](http://www.dorissiu.com).",
        "",
        "## NERINA BADALIC, BIÊN TẬP VIÊN NỘI DUNG CẤP CAO",
        "",
        "Suốt nhiều năm qua, Nerina đã viết nhiều bài báo, truyện ngắn và các bài hát. Với vai trò là một biên tập viên, cô giúp các tác giả dốc hết tâm huyết viết ra những cuốn cẩm nang, luận văn, bài báo cùng các cuốn sách có giá trị và hữu ích cho người đọc. Nerina vẫn đang tiếp tục khám phá những môn nghệ thuật trong thế giới ngôn từ như giao tiếp, tiếp thị, thiết kế, âm nhạc và nhiếp ảnh.",
        "",
        "## FRANCESCA SCOTTI-GOETZ, CÂY VIẾT BẢN TIN VÀ GIÁM ĐỐC CỘNG ĐỒNG MẠNG XÃ HỘI",
        "",
        "Francesca trước hết là một nhà quan sát, sau mới là một người viết nội dung quảng cáo (copywriter). Cô đam mê sự giao thoa giữa nghệ thuật với con người; giữa những vấn đề xã hội với giới truyền thông; và giữa tư duy với sự sáng tạo. Trong những dịp nghỉ cuối tuần, cô thường đến Amsterdam với một chiếc máy ảnh và một cuốn sổ, trong khi dành những ngày còn lại trong tuần vận dụng những khám phá của mình nhằm tương tác hiệu quả với cộng đồng toàn cầu của Thinknetic.",
        "",
        "## NHỮNG NGƯỜI ĐÓNG GÓP",
        "",
        "### David Brant Yu",
        "",
        "David chịu trách nhiệm rà soát cẩn thận hồ sơ của những ứng viên muốn trở thành cây viết của Thinknetic, đảm bảo cung cấp cho đội ngũ những những con người khéo léo, tài năng nhất. Thói quen đọc sách ngấu nghiến, niềm đam mê với triết học và thời sự giúp anh hoàn thành công việc một cách kỹ lưỡng. David thích dành thời gian rảnh cho việc biên tập tự do và dạy tiếng Anh.",
        "",
        "### Evangeline Obiedo",
        "",
        "Evangeline thực hiện những bước cuối cùng để những cuốn sách của chúng tôi được xuất bản. Cô chú ý tới từng chi tiết nhỏ, đảm bảo mọi cuốn sách đều được định dạng chuẩn xác. Đam mê học hành của cô cũng mở rộng sang thế giới thực – cô thích đi du lịch, trải nghiệm những địa điểm và văn hóa mới.",
        "",
        "---",
        "",
        "## TẢI THÊM SÁCH",
        "",
        "[**Tư duy phản biện – Từ Làm Quen Đến Thói Quen**](https://hoimesach.com/tim-hieu-sach/tu-duy-phan-bien-tu-lam-quen-den-thoi-quen/)",
        "",
        "Cuốn sách cung cấp những nội dung sau: • Khung tư duy phản biện được phát triển bởi hai trong những chuyên gia hàng đầu...",
        "",
        "---",
        "",
        "## HỘI MÊ SÁCH",
        "",
        "Tải eBooks miễn phí tại: [https://hoimesach.com](https://hoimesach.com)  ",
        "Nhận eBooks miễn phí qua Zalo: [https://zalo.hoimesach.com](https://zalo.hoimesach.com)  ",
        "Group: [https://facebook.com/groups/mesachhoi](https://facebook.com/groups/mesachhoi)"
    ]
    return '\n'.join(lines)

def build_readme():
    return """# RÈN THÓI QUEN TƯ DUY PHẢN BIỆN
*Nhóm tác giả Thinknetic*

Cuốn sách hướng dẫn phương pháp xây dựng, rèn luyện và duy trì các thói quen tư duy phản biện trong đời sống hằng ngày và công việc.

---

## MỤC LỤC

- [00. Giới thiệu & Thông tin xuất bản](00_gioi_thieu.md)
- [01. Mở đầu](01_mo_dau.md)
- [02. Chương 1: Cách tư duy như một nhà tư tưởng](02_chuong_1.md)
- [03. Chương 2: Mấu chốt của các thói quen](03_chuong_2.md)
- [04. Chương 3: Biến tư duy phản biện trở thành thói quen](04_chuong_3.md)
- [05. Chương 4: Để thói quen bền vững hôm nay, ngày mai, tới cả năm sau](05_chuong_4.md)
- [06. Chương 5: Kiến tạo một bộ não ưu việt hơn - Thúc đẩy những thói quen đó](06_chuong_5.md)
- [07. Chương 6: Những công cụ hỗ trợ thói quen tư duy phản biện](07_chuong_6.md)
- [08. Lời bạt](08_loi_bat.md)
- [09. Đội ngũ tại Thinknetic](09_doi_ngu_thinknetic.md)
"""

# Now write all files
files = {
    '00_gioi_thieu.md': build_front_matter(),
    '01_mo_dau.md': convert_chapter(list(range(6, 9))),
    '02_chuong_1.md': convert_chapter(list(range(9, 29))),
    '03_chuong_2.md': convert_chapter(list(range(30, 56))),
    '04_chuong_3.md': convert_chapter(list(range(56, 75))),
    '05_chuong_4.md': convert_chapter(list(range(75, 87))),
    '06_chuong_5.md': convert_chapter(list(range(88, 102))),
    '07_chuong_6.md': convert_chapter(list(range(102, 112))),
    '08_loi_bat.md': convert_chapter(list(range(112, 115))),
    '09_doi_ngu_thinknetic.md': build_thinknetic_team(),
    'README.md': build_readme(),
}

for fname, content in files.items():
    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content + '\n')
    print(f"Generated {fname} ({len(content)} chars)")

print("All markdown files generated successfully!")
