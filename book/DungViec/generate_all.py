import os
import re
from generate_books import merge_range, clean_ocr_typos

# -------------------------------------------------------------
# 00-doi-loi-chia-se.md
# -------------------------------------------------------------
p6_lines = [
    "> *Dành tặng những ai đã, đang và sẽ dấn thân trên hành trình trở thành con người tự do!*"
]
intro_paras = merge_range(7, 15)
doc_00 = ["# Đôi lời chia sẻ từ tác giả\n"]
doc_00.append(p6_lines[0] + "\n\n---\n")

for p in intro_paras:
    if "You must be the change" in p or "England expects" in p:
        doc_00.append(f"> *{p}*\n")
    else:
        doc_00.append(f"{p}\n")

with open('00-doi-loi-chia-se.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(doc_00))
print('Written 00-doi-loi-chia-se.md')

# -------------------------------------------------------------
# 01-phan-1-lam-nguoi.md
# -------------------------------------------------------------
p1_paras = merge_range(19, 110)

doc_01 = ["# Phần 1: Làm người\n"]

for p in p1_paras:
    # Remove diagram OCR noise
    if "Khai phóng Vu Hà" in p or "TL của chính mình!" in p or "Ki I LÊ chính mình" in p:
        continue
    if re.match(r'^1\.\s+Thế nào là con người', p):
        doc_01.append("## 1. Thế nào là con người? Làm người là... làm gì?\n")
        remainder = re.sub(r'^1\.\s+Thế nào là con người\?\s*Làm người là\.\.\.\s*làm gì\?\s*', '', p).strip()
        if remainder:
            doc_01.append(f"{remainder}\n")
    elif re.match(r'^2\.\s+Để làm được', p):
        doc_01.append("## 2. Để làm được “người”, cần có những năng lực nào?\n")
        remainder = re.sub(r'^2\.\s+Để làm được\s*[“\"][a-zA-ZÀ-ỹ\s]+[”\"]\s*,\s*cần có những năng lực nào\?\s*', '', p).strip()
        if remainder:
            doc_01.append(f"{remainder}\n")
    elif re.match(r'^3\.\s+Làm thế nào để', p):
        doc_01.append("## 3. Làm thế nào để có được “năng lực làm người”?\n")
        remainder = re.sub(r'^3\.\s+Làm thế nào để có được\s*[“\"][a-zA-ZÀ-ỹ\s]+[”\"]\s*\?\s*', '', p).strip()
        if remainder:
            doc_01.append(f"{remainder}\n")
    elif re.match(r'^(?:4\.\s+)?(?:“Ta|Ta)\s+là\s+sản\s+phẩm\s+của\s+chính\s+mình', p):
        doc_01.append("## 4. “Ta là sản phẩm của chính mình”\n")
        remainder = re.sub(r'^(?:4\.\s+)?(?:“Ta|Ta)\s+là\s+sản\s+phẩm\s+của\s+chính\s+mình[”\"]?\s*', '', p).strip()
        if remainder:
            doc_01.append(f"{remainder}\n")
    elif re.match(r'^5\.\s+Thay lời kết', p):
        doc_01.append("## 5. Thay lời kết về câu chuyện “Làm người”\n")
        remainder = re.sub(r'^5\.\s+Thay lời kết về câu chuyện\s*[“\"][a-zA-ZÀ-ỹ\s]+[”\"]\s*', '', p).strip()
        if remainder:
            doc_01.append(f"{remainder}\n")
    elif re.match(r'^\(?[i|v|x]+\)?\s+Khai phóng bản thân', p, re.IGNORECASE):
        doc_01.append("### (i) Khai phóng bản thân\n")
        remainder = re.sub(r'^\(?[i|v|x]+\)?\s+Khai phóng bản thân\s*', '', p, flags=re.IGNORECASE).strip()
        if remainder:
            doc_01.append(f"{remainder}\n")
    elif re.match(r'^\(?[i|v|x]+\)?\s+Tìm ra chính mình', p, re.IGNORECASE):
        doc_01.append("### (ii) Tìm ra chính mình\n")
        remainder = re.sub(r'^\(?[i|v|x]+\)?\s+Tìm ra chính mình\s*', '', p, flags=re.IGNORECASE).strip()
        if remainder:
            doc_01.append(f"{remainder}\n")
    elif re.match(r'^\(?[i|v|x]+\)?\s+Làm ra chính mình', p, re.IGNORECASE):
        doc_01.append("### (iii) Làm ra chính mình\n")
        remainder = re.sub(r'^\(?[i|v|x]+\)?\s+Làm ra chính mình\s*', '', p, flags=re.IGNORECASE).strip()
        if remainder:
            doc_01.append(f"{remainder}\n")
    elif re.match(r'^\(?[i|v|x]+\)?\s+Sống với chính mình', p, re.IGNORECASE):
        doc_01.append("### (iv) Sống với chính mình\n")
        remainder = re.sub(r'^\(?[i|v|x]+\)?\s+Sống với chính mình\s*', '', p, flags=re.IGNORECASE).strip()
        if remainder:
            doc_01.append(f"{remainder}\n")
    elif re.match(r'^\(?[i|v|x]+\)?\s+Giữ được chính mình', p, re.IGNORECASE):
        doc_01.append("### (v) Giữ được chính mình\n")
        remainder = re.sub(r'^\(?[i|v|x]+\)?\s+Giữ được chính mình\s*', '', p, flags=re.IGNORECASE).strip()
        if remainder:
            doc_01.append(f"{remainder}\n")
    else:
        doc_01.append(f"{p}\n")
        # Check if we should insert the diagram
        if "gồm năm cấu phần như sau:" in p:
            doc_01.append('\n![Mô hình "Ta là sản phẩm của chính mình"](images/mo-hinh-ta-la-san-pham-cua-chinh-minh.png)\n*Hình: Mô hình "Ta là sản phẩm của chính mình" (Mô hình quản trị cuộc đời)*\n')

with open('01-phan-1-lam-nguoi.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(doc_01))
print('Written 01-phan-1-lam-nguoi.md')

# -------------------------------------------------------------
# 02-phan-2-lam-dan.md
# -------------------------------------------------------------
p2_paras = merge_range(113, 166)

doc_02 = ["# Phần 2: Làm dân\n"]

p2_headings = [
    (r'^Tại sao phải bàn về “làm dân”\?', '## Tại sao phải bàn về “làm dân”?'),
    (r'^Làm chủ công ty và làm chủ quốc gia', '## Làm chủ công ty và làm chủ quốc gia'),
    (r'^[“\"]Vua chủ[”\"],?\s*[“\"]dân chủ[”\"]', '## “Vua chủ”, “dân chủ” và “nhóm chủ”'),
    (r'^Lập pháp,?\s*hành pháp và tư pháp', '## Lập pháp, hành pháp và tư pháp'),
    (r'^Mặc định,?\s*hiến định và luật định', '## Mặc định, hiến định và luật định'),
    (r'^[“\"]Pháp quyền[”\"],?\s*[“\"]pháp trị[”\"]', '## “Pháp quyền”, “pháp trị” và “nhân trị”'),
    (r'^[“\"]Nô dân[”\"],?\s*[“\"]thần dân[”\"]', '## “Nô dân”, “thần dân” và “công dân”'),
    (r'^[“\"]Dân trí[”\"],?\s*[“\"]dân quyền[”\"]', '## “Dân trí”, “dân quyền” và “dân sinh”'),
    (r'^Làm sao để có được “năng lực làm dân”\?', '## Làm sao để có được “năng lực làm dân”?'),
]

for p in p2_paras:
    matched = False
    for pat, h_md in p2_headings:
        if re.search(pat, p, re.IGNORECASE):
            doc_02.append(f"{h_md}\n")
            remainder = re.sub(pat, '', p, flags=re.IGNORECASE).strip()
            if remainder:
                doc_02.append(f"{remainder}\n")
            matched = True
            break
    if not matched:
        if "Hiến pháp là cái gì và để làm gì?" in p:
            doc_02.append(f"> ### Hiến pháp là cái gì và để làm gì?\n>\n> " + p.replace("Hiến pháp là cái gì và để làm gì?", "").strip().replace("\n", "\n> ") + "\n")
        elif "Quyền của nhân dân và quyền của nhà nước" in p:
            doc_02.append(f"> ### Quyền của nhân dân và quyền của nhà nước\n>\n> " + p.replace("Quyền của nhân dân và quyền của nhà nước", "").strip().replace("\n", "\n> ") + "\n")
        else:
            doc_02.append(f"{p}\n")

with open('02-phan-2-lam-dan.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(doc_02))
print('Written 02-phan-2-lam-dan.md')

# -------------------------------------------------------------
# 03-phan-3-lam-viec.md
# -------------------------------------------------------------
p3_paras = merge_range(169, 258)

# Clean specific italics OCR misreadings in Sukiyabashi Jiro section
JIRO_FIXES = [
    (r'\buàng\b', 'vàng'),
    (r'\buà\b', 'và'),
    (r'\buẫn\b', 'vẫn'),
    (r'\bbồ mặt bằng\b', 'về mặt bằng'),
    (r'\bSukiunbashi\s*\]iro\b', 'Sukiyabashi Jiro'),
    (r'\bSukiuabashi\s*Jiro\b', 'Sukiyabashi Jiro'),
    (r'\bSukiuabashi\s*\]iro\b', 'Sukiyabashi Jiro'),
    (r'\bHuyền thống\b', 'truyền thống'),
    (r'\buới\b', 'với'),
    (r'\buởn uẹn\b', 'vỏn vẹn'),
    (r'\bTokuo\b', 'Tokyo'),
    (r'\bít ni ngờ\b', 'ít ai ngờ'),
    (r'\bđâu lại là nơi\b', 'đây lại là nơi'),
    (r'\bthối lên\b', 'thốt lên'),
    (r'\bRabuchon\b', 'Robuchon'),
    (r'\bnày đã tồn tại hàng chục năm lâu dài\b', 'này đã tồn tại hàng chục năm, trước'),
    (r'\bMVóà hàng hạng nhất\b', 'Nhà hàng hạng nhất'),
    (r'\bngười tn\b', 'người ta'),
    (r'\btiêu một lát cá sống\b', 'yêu một lát cá sống'),
    (r'\bấu của người\b', 'ấy của người'),
    (r'\buồ ông chủ\b', 'về ông chủ'),
    (r'\bgâu ấn tượng\b', 'gây ấn tượng'),
    (r'\bthát độ\b', 'thái độ'),
    (r'\bphỏng uấn\b', 'phỏng vấn'),
    (r'\bđóng uat trò\b', 'đóng vai trò'),
    (r'\bJitro\b', 'Jiro'),
]

doc_03 = ["# Phần 3: Làm việc\n"]

p3_headings = [
    (r'^[“\"]Làm việc[”\"]\s+cũng là\s+[“\"]làm người[”\"]!?', '## “Làm việc” cũng là “làm người”!'),
    (r'^Quản trị hay cai trị\?', '## Quản trị hay cai trị?'),
    (r'^Đầy tớ hay phụ mẫu\?', '## Đầy tớ hay phụ mẫu?'),
    (r'^Doanh nhân,?\s*trọc phú hay con buôn\?', '## Doanh nhân, trọc phú hay con buôn?'),
    (r'^Trí thức hay trí nô\?', '## Trí thức hay trí nô?'),
    (r'^Sử gia hay sử nô\?', '## Sử gia hay sử nô?'),
    (r'^Nhà báo hay bồi bút\?\s*/?\s*Nhà văn hay văn nô\?', '## Nhà báo hay bồi bút? / Nhà văn hay văn nô?'),
    (r'^Ca sĩ hay thợ hát\?', '## Ca sĩ hay thợ hát? Diễn viên hay thợ diễn?...'),
    (r'^Và một số nghề khác', '## Và một số nghề khác'),
]

for p in p3_paras:
    for pat, rep in JIRO_FIXES:
        p = re.sub(pat, rep, p)
        
    matched = False
    for pat, h_md in p3_headings:
        if re.search(pat, p, re.IGNORECASE):
            doc_03.append(f"{h_md}\n")
            remainder = re.sub(pat, '', p, flags=re.IGNORECASE).strip()
            if remainder:
                doc_03.append(f"{remainder}\n")
            matched = True
            break
    if not matched:
        if "Sukiyabashi Jiro — viên ngọc trong đá" in p:
            doc_03.append("### Sukiyabashi Jiro — viên ngọc trong đá\n")
            remainder = p.replace("Sukiyabashi Jiro — viên ngọc trong đá", "").strip()
            if remainder:
                doc_03.append(f"{remainder}\n")
        elif "Nhà hàng hạng nhất của đầu bếp hàng đầu" in p:
            doc_03.append("### Nhà hàng hạng nhất của đầu bếp hàng đầu\n")
            remainder = p.replace("Nhà hàng hạng nhất của đầu bếp hàng đầu", "").strip()
            if remainder:
                doc_03.append(f"{remainder}\n")
        elif "Giữ nguyên thiết kế cổ điển của nhà hàng sushi" in p:
            # Place Jiro Ono image before this paragraph!
            doc_03.append('![Nghệ nhân sushi Jiro Ono](images/jiro-ono.jpg)\n*Hình: Nghệ nhân Jiro Ono 90 tuổi đang chăm chút từng món sushi*\n')
            doc_03.append(f"{p}\n")
        else:
            doc_03.append(f"{p}\n")
            # If paragraph describes Michelin sushi, place sushi image right after it
            if "nhà hàng vẫn khá khiêm tốn về mặt bằng lẫn phong cách" in p or "trao tặng tới ba sao Michelin" in p:
                doc_03.append('\n![Các món sushi quán Sukiyabashi Jiro](images/sushi-sukiyabashi-jiro.jpg)\n*Hình: Các món sushi tinh hoa của quán Sukiyabashi Jiro 3 sao Michelin*\n')

with open('03-phan-3-lam-viec.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(doc_03))
print('Written 03-phan-3-lam-viec.md')

# -------------------------------------------------------------
# 04-phan-4-lam-giao-duc.md
# -------------------------------------------------------------
p4_paras = merge_range(261, 316)

doc_04 = ["# Phần 4: Làm giáo dục\n"]

p4_headings = [
    (r'^Triết lý và Định chế|^Triết học và Định chế', '## Triết lý và Định chế'),
    (r'^1\.\s+Nhà trường', '## 1. Nhà trường'),
    (r'^2\.\s+Nhà giáo', '## 2. Nhà giáo'),
    (r'^3\.\s+[“\"]Nhà mẹ[”\"]\s*/?\s*Gia đình', '## 3. "Nhà mẹ" / Gia đình'),
    (r'^4\.\s+Người học', '## 4. Người học'),
    (r'^5\.\s+Nhà nước', '## 5. Nhà nước'),
]

for p in p4_paras:
    # Skip diagram OCR noise
    if "Nhà 14116 lun" in p or "TRIẾT LÝ GIÁO DỤC" in p:
        continue
    matched = False
    for pat, h_md in p4_headings:
        if re.search(pat, p, re.IGNORECASE):
            # If entering section 1. Nhà trường, place diagram before it!
            if "Nhà trường" in h_md:
                doc_04.append('![Mô hình Triết lý giáo dục](images/mo-hinh-triet-ly-giao-duc.png)\n*Hình: Sơ đồ tương tác 5 chủ thể trong Triết lý giáo dục*\n')
            doc_04.append(f"{h_md}\n")
            remainder = re.sub(pat, '', p, flags=re.IGNORECASE).strip()
            if remainder:
                doc_04.append(f"{remainder}\n")
            matched = True
            break
    if not matched:
        doc_04.append(f"{p}\n")

with open('04-phan-4-lam-giao-duc.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(doc_04))
print('Written 04-phan-4-lam-giao-duc.md')

# -------------------------------------------------------------
# 05-thay-loi-ket.md
# -------------------------------------------------------------
p5_paras = merge_range(317, 324)
doc_05 = ["# Thay lời kết\n"]

for p in p5_paras:
    if "hiểu được một cách thấu đáo" in p or "con người tự do, con người tự trị" in p:
        doc_05.append(f"> *{p}*\n")
    else:
        doc_05.append(f"{p}\n")

with open('05-thay-loi-ket.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(doc_05))
print('Written 05-thay-loi-ket.md')
print('Finished all!')
