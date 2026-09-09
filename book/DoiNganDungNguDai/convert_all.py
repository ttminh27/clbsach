import os
import sys
import re
import unicodedata
import pymupdf

def slugify(text):
    text = unicodedata.normalize('NFKD', text)
    text = ''.join(c for c in text if not unicodedata.combining(c))
    text = text.replace('đ', 'd').replace('Đ', 'D')
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    tokens = text.strip().split()
    return '_'.join(tokens)

def clean_markdown_typography(text):
    # Merge consecutive bold tags separated only by whitespace: **A** **B** -> **A B**
    text = re.sub(r'\*\*\s+\*\*', ' ', text)
    # Merge consecutive italic tags separated only by whitespace: *A* *B* -> *A B*
    # (Be careful with ***)
    text = re.sub(r'(?<!\*)\*([^*]+)\*\s+\*([^*]+)\*(?!\*)', r'*\1 \2*', text)
    
    # Remove space before punctuation marks
    text = re.sub(r'\s+([,.:;!?\)\"\'”’%])', r'\1', text)
    # Remove space after opening brackets / quotes
    text = re.sub(r'([(\"\'“‘])\s+', r'\1', text)
    # Clean up multiple spaces
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

def process_block(block):
    all_spans = []
    for line in block.get('lines', []):
        line_spans = []
        for s in line['spans']:
            t = s['text']
            if not t:
                continue
            font = s['font']
            flags = s['flags']
            is_bold = 'Bold' in font or bool(flags & (1 << 4))
            is_italic = 'Ital' in font or bool(flags & (1 << 1))
            line_spans.append({
                'text': t,
                'bold': is_bold,
                'italic': is_italic,
            })
        if line_spans:
            if all_spans:
                prev_text = all_spans[-1]['text']
                curr_text = line_spans[0]['text']
                # Don't add space if prev ends with space or curr starts with space
                # or curr starts with punctuation
                if not prev_text.endswith(' ') and not curr_text.startswith(' '):
                    if not re.match(r'^[,.:;!?\)\"\'”’%]', curr_text) and not re.search(r'[\"\'“‘(]$', prev_text):
                        same_b = all_spans[-1]['bold'] and line_spans[0]['bold']
                        same_i = all_spans[-1]['italic'] and line_spans[0]['italic']
                        all_spans.append({'text': ' ', 'bold': same_b, 'italic': same_i})
            all_spans.extend(line_spans)
            
    if not all_spans:
        return '', False

    # Check if this block is a bullet item
    is_bullet = False
    first_text = all_spans[0]['text']
    m = re.match(r'^[•\-\*]\s*(.*)$', first_text)
    if m:
        is_bullet = True
        all_spans[0]['text'] = m.group(1)
        if not all_spans[0]['text']:
            all_spans.pop(0)

    # Merge adjacent spans with identical styling
    merged = []
    for s in all_spans:
        t = s['text']
        b = s['bold']
        i = s['italic']
        if not t:
            continue
        if merged and merged[-1]['bold'] == b and merged[-1]['italic'] == i:
            merged[-1]['text'] += t
        else:
            merged.append({'text': t, 'bold': b, 'italic': i})

    # Render to Markdown
    res = ''
    for m in merged:
        t = m['text']
        b = m['bold']
        i = m['italic']
        if not b and not i:
            res += t
        else:
            match = re.match(r'^(\s*)(.*?)(\s*)$', t, re.DOTALL)
            if match:
                prefix, content, suffix = match.groups()
                if not content:
                    res += t
                else:
                    if b and i:
                        formatted = f'***{content}***'
                    elif b:
                        formatted = f'**{content}**'
                    elif i:
                        formatted = f'*{content}*'
                    res += prefix + formatted + suffix
            else:
                res += t
                
    md = clean_markdown_typography(res)
    if is_bullet:
        md = f'- {md}'
    return md, is_bullet

# Target directories
pdf_path = 'raw/DoiNganDungNguDai_RobinSharma.pdf'
doc = pymupdf.open(pdf_path)
os.makedirs('images', exist_ok=True)

# 1. Save extracted images
# Cover image on Page 1 (xref 4)
cover_bytes = doc.extract_image(4)['image']
with open('images/cover.jpeg', 'wb') as f:
    f.write(cover_bytes)
with open('images/cover.jpg', 'wb') as f:
    f.write(cover_bytes)

# Publisher logos on Page 3 (xref 17, 21)
with open('images/img_p003_01.jpeg', 'wb') as f:
    f.write(doc.extract_image(17)['image'])
with open('images/img_p003_02.jpeg', 'wb') as f:
    f.write(doc.extract_image(21)['image'])

# Robin Sharma photo on Page 6 (xref 31)
author_bytes = doc.extract_image(31)['image']
with open('images/robin_sharma.jpeg', 'wb') as f:
    f.write(author_bytes)
with open('images/robin_sharma.jpg', 'wb') as f:
    f.write(author_bytes)

# TOC banner on Page 8 (xref 36)
with open('images/toc_banner.jpeg', 'wb') as f:
    f.write(doc.extract_image(36)['image'])

# 2. Write Front Matter files
# 00_Thong_tin_xuat_ban.md
thong_tin_content = """# ĐỜI NGẮN ĐỪNG NGỦ DÀI

![Bìa sách](images/cover.jpeg)

**Tác giả:** Robin Sharma  
*Tác giả những cuốn sách nổi tiếng The Monk Who Sold His Ferrari, The Leader Who Had No Title, Who Will Cry When You Die?*

**Người dịch:** Phạm Anh Tuấn  
**Nhà xuất bản:** Nhà xuất bản Trẻ  
**Số trang:** 226  
**Ngày xuất bản:** 05-2014  
**Giá bìa:** 60.000 VND  

---

> *Hãy mua sách trong điều kiện có thể để ủng hộ tác giả, dịch giả, NXB và đơn vị phát hành!*

![NXB Trẻ](images/img_p003_01.jpeg) ![Logo](images/img_p003_02.jpeg)
"""
with open('00_Thong_tin_xuat_ban.md', 'w', encoding='utf-8') as f:
    f.write(thong_tin_content.strip() + '\n')

# 00_Ve_tac_gia.md
ve_tac_gia_content = """# ROBIN SHARMA

![Robin Sharma](images/robin_sharma.jpeg)

LL.B, LL.M là một trong những chuyên gia hàng đầu thế giới về huấn luyện nghệ thuật lãnh đạo và phát triển bản thân, với triết lý cốt lõi của ông là lãnh đạo không cần chức danh và thoải mái phát huy cao nhất năng lực của mình.

Ông là tác giả của 8 cuốn sách bestseller trên thế giới, trong đó có *The Monk Who Sold His Ferrari* (được dịch ra 55 thứ tiếng), *The Leader Who Had No Title* và *Who Will Cry When You Die?*. Robin đứng trong top 2 của cuộc khảo sát độc lập do trang leadergurus.net thực hiện để đánh giá ảnh hưởng của những nhà tư tưởng lãnh đạo trên toàn thế giới.

Ông là nhà sáng lập của Sharma Leadership International Inc., một công ty đào tạo với nhiều khách hàng nổi tiếng như FedEx, GE, IBM, Microsoft, Nike và Đại học Yale.

Bạn có thể tìm thêm thông tin về Robin Sharma và các bài huấn luyện của ông tại địa chỉ [robinsharma.com](https://robinsharma.com).
"""
with open('00_Ve_tac_gia.md', 'w', encoding='utf-8') as f:
    f.write(ve_tac_gia_content.strip() + '\n')

# 00_Loi_khen_tang.md
loi_khen_tang_content = """# Lời khen tặng dành cho Robin Sharma và tác phẩm của ông

> “Những điều tốt nhất trong đời đều đòi hỏi nỗ lực, cam kết và kỷ luật. Người bạn Nido Qubein của tôi từng nói: ‘Cái giá của kỷ luật bao giờ cũng rẻ hơn cái giá của nỗi đau hối tiếc.’ Hẳn rồi, ý tưởng này rất hiển nhiên. Thế nhưng điều hiển nhiên nhất lại hay bị lãng quên nhất.”
> 
> *— Trích Đời ngắn đừng ngủ dài*

> “Nếu đã cố làm mọi thứ nhưng sự việc vẫn không như kết quả bạn mong muốn, đừng cố quá sức. Nghỉ ngơi đi. Có thể mọi chuyện không hề sai. Có thể chưa đến lúc. Có thể cánh cửa này đóng lại nhưng cánh cửa khác đang mở ra. Và thông thường, một khi đã thực hiện điều bạn cho là tốt nhất, bạn đã tạo nên không gian cho điều tốt đẹp hơn sắp đến. Mọi điểm kết thúc đều mở ra một điểm khởi đầu mới.”
> 
> *— Trích Đời ngắn đừng ngủ dài*

> “Cuốn sách của Robin chứa đựng rất nhiều sự thông tuệ và lời khuyên sâu sắc, được trình bày ngắn gọn, đơn giản để ai cũng hiểu được, và nếu kiên nhẫn áp dụng thì hiệu quả sẽ rất to lớn.”
> 
> **— John Spence**, *nhà tư vấn, diễn giả, tác giả cuốn sách Letters to a C.E.O và Strategies for Success: The Keys to Success in College, Career and Life*

> “Robin Sharma sở hữu cái tài năng rất hiếm hoi là viết được những cuốn sách thật sự khiến người ta đột phá trong đời.”
> 
> **— Tiến sĩ Richard Calson**, *tác giả cuốn sách bestseller Don’t Sweat the Small Stuff của New York Times*
"""
with open('00_Loi_khen_tang.md', 'w', encoding='utf-8') as f:
    f.write(loi_khen_tang_content.strip() + '\n')

# 00_Loi_tua.md
loi_tua_content = """# Lời tựa

> “Cuộc đời chúng ta bắt đầu **kết thúc** vào cái ngày mà ta **thờ ơ với những điều quan trọng**.”
> 
> **— Martin Luther King, Jr.**
"""
with open('00_Loi_tua.md', 'w', encoding='utf-8') as f:
    f.write(loi_tua_content.strip() + '\n')

# 3. Convert all 101 chapters
chapter_list = []

for pno in range(10, 111):
    page = doc[pno]
    blocks = [b for b in page.get_text('dict')['blocks'] if b.get('type') == 0]
    processed = []
    for b in blocks:
        md, is_b = process_block(b)
        if md:
            processed.append((md, is_b))
            
    # Remove orphan running header artifact on page 100
    if pno == 99 and processed and processed[0][0] == 'Tôn trọng':
        processed.pop(0)

    title_md, _ = processed[0]
    clean_title = re.sub(r'[\*\_]', '', title_md).strip()
    m = re.match(r'^(\d+)\.\s*(.+)$', clean_title)
    if not m:
        print(f"Error parsing title on page {pno+1}: {title_md}")
        continue
        
    ch_num = int(m.group(1))
    ch_title = m.group(2).strip()
    
    slug = slugify(ch_title)
    filename = f'{ch_num:02d}_{slug}.md' if ch_num < 100 else f'{ch_num}_{slug}.md'
    
    # Format chapter markdown
    md_lines = [f'# {ch_num}. {ch_title}', '']
    
    for block_md, is_bullet in processed[1:]:
        md_lines.append(block_md)
        md_lines.append('')
        
    file_content = '\n'.join(md_lines).strip() + '\n'
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(file_content)
        
    chapter_list.append({
        'num': ch_num,
        'title': ch_title,
        'filename': filename,
        'page': pno + 1
    })

# 00_Muc_luc.md
muc_luc_content = """# Mục lục

![Mục lục](images/toc_banner.jpeg)

### Các phần mở đầu
- [Thông tin xuất bản](00_Thong_tin_xuat_ban.md)
- [Về tác giả Robin Sharma](00_Ve_tac_gia.md)
- [Lời khen tặng](00_Loi_khen_tang.md)
- [Lời tựa](00_Loi_tua.md)

### Danh sách 101 chương
"""
for ch in chapter_list:
    muc_luc_content += f"{ch['num']}. [{ch['num']}. {ch['title']}]({ch['filename']})\n"

with open('00_Muc_luc.md', 'w', encoding='utf-8') as f:
    f.write(muc_luc_content.strip() + '\n')

# 4. Write README.md
readme_content = f"""# Đời Ngắn Đừng Ngủ Dài (The Greatness Guide)

![Bìa sách](images/cover.jpeg)

- **Tác giả:** Robin Sharma
- **Người dịch:** Phạm Anh Tuấn
- **Nhà xuất bản:** NXB Trẻ
- **Số trang:** 226 trang (101 bài học / chương)

---

## Giới thiệu

Cuốn sách **"Đời ngắn đừng ngủ dài"** của Robin Sharma là tập hợp 101 bài học ngắn gọn, súc tích và thực tế về nghệ thuật lãnh đạo bản thân, nuôi dưỡng lòng đam mê, vượt qua nỗi sợ hãi và vươn tới một cuộc sống ngoại hạng.

---

## Mục lục

### Phần mở đầu
- [Thông tin xuất bản](00_Thong_tin_xuat_ban.md)
- [Về tác giả Robin Sharma](00_Ve_tac_gia.md)
- [Lời khen tặng](00_Loi_khen_tang.md)
- [Lời tựa](00_Loi_tua.md)
- [Mục lục chi tiết](00_Muc_luc.md)

### 101 Chương / Bài học

"""
for ch in chapter_list:
    readme_content += f"- [{ch['num']}. {ch['title']}]({ch['filename']})\n"

with open('README.md', 'w', encoding='utf-8') as f:
    f.write(readme_content.strip() + '\n')

print("All files updated successfully.")
