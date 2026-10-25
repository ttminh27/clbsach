import pymupdf
import re
import os
import unicodedata

def slugify(text):
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.replace("đ", "d").replace("Đ", "D")
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text)
    tokens = text.strip().split()
    return "_".join(tokens)

# Ensure images directory and cover image
os.makedirs("images", exist_ok=True)
pdf_path = "raw/AnLacTungBuocChan.pdf"
doc = pymupdf.open(pdf_path)

cover_bytes = doc.extract_image(9)["image"]
with open("images/cover.jpg", "wb") as f:
    f.write(cover_bytes)

# Parse chapters
chapters = []
current_part = "Phần I: Hơi thở ý thức, hơi thở mầu nhiệm"
current_part_num = 1
current_ch = None

for pno in range(4, len(doc)):
    page = doc[pno]
    blocks = [b for b in page.get_text("dict")["blocks"] if b.get("type") == 0 and b["bbox"][1] < 800]
    lines = []
    for b in blocks:
        for l in b["lines"]:
            lines.append(l)
    lines.sort(key=lambda l: (l["bbox"][1], l["bbox"][0]))
    
    for l in lines:
        s0 = l["spans"][0]
        full_line_text = "".join([s["text"] for s in l["spans"]]).strip()
        font = s0["font"]
        size = round(s0["size"], 1)
        
        if font == "Calibri,Bold" and size == 24.0:
            current_part = full_line_text
            if "Phần I:" in current_part:
                current_part_num = 1
            elif "Phần II:" in current_part:
                current_part_num = 2
            elif "Phần III:" in current_part:
                current_part_num = 3
            continue
        elif font == "Calibri,Bold" and size == 18.6:
            if current_ch:
                chapters.append(current_ch)
            current_ch = {
                "part": current_part,
                "part_num": current_part_num,
                "title": full_line_text,
                "start_page": pno + 1,
                "lines": []
            }
            continue
            
        if current_ch:
            current_ch["lines"].append({
                "page": pno + 1,
                "y0": l["bbox"][1],
                "y1": l["bbox"][3],
                "spans": l["spans"],
                "text": full_line_text
            })

if current_ch:
    chapters.append(current_ch)

print(f"Loaded {len(chapters)} chapters.")

# Helper formatting functions
def clean_spans_to_md(spans):
    raw_spans = []
    for s in spans:
        t = s["text"]
        if not t:
            continue
        f = s["font"]
        flags = s["flags"]
        bld = "Bold" in f or bool(flags & 16)
        it = "Ital" in f or bool(flags & 2)
        raw_spans.append({"text": t, "bold": bld, "italic": it})
        
    if not raw_spans:
        return ""
        
    merged = []
    for s in raw_spans:
        if merged and merged[-1]["bold"] == s["bold"] and merged[-1]["italic"] == s["italic"]:
            merged[-1]["text"] += s["text"]
        else:
            merged.append(dict(s))
            
    res = ""
    for s in merged:
        t = s["text"]
        b = s["bold"]
        i = s["italic"]
        if not b and not i:
            res += t
        else:
            match = re.match(r"^(\s*)(.*?)(\s*)$", t, re.DOTALL)
            if match:
                prefix, content, suffix = match.groups()
                if not content:
                    res += t
                else:
                    if b and i:
                        formatted = f"***{content}***"
                    elif b:
                        formatted = f"**{content}**"
                    elif i:
                        formatted = f"*{content}*"
                    res += prefix + formatted + suffix
            else:
                res += t
    return res

def clean_typography(text):
    text = re.sub(r'\*\*\s+\*\*', ' ', text)
    text = re.sub(r'(?<!\*)\*([^*]+)\*\s+\*([^*]+)\*(?!\*)', r'*\1 \2*', text)
    text = re.sub(r'\s+([,.:;!?\)\]%])', r'\1', text)
    text = re.sub(r'([(\[])\s+', r'\1', text)
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

# Assign filenames to chapters
for idx, ch in enumerate(chapters, 1):
    ch_num_str = f"{idx:02d}"
    slug = slugify(ch["title"])
    filename = f"Phan_{ch['part_num']}_Chuong_{ch_num_str}_{slug}.md"
    ch["idx"] = idx
    ch["num_str"] = ch_num_str
    ch["filename"] = filename

# Convert and save each chapter
for idx, ch in enumerate(chapters):
    lines = ch["lines"]
    paragraphs = []
    curr_p = []
    curr_type = "text"
    
    for l in lines:
        line_text = l["text"]
        if not line_text:
            continue
            
        non_space_spans = [s for s in l["spans"] if s["text"].strip()]
        is_poem_line = bool(non_space_spans and all(("Ital" in s["font"] or bool(s["flags"] & 2)) for s in non_space_spans))
        
        is_subhead = False
        if line_text in ["Hãy Gọi Đúng Tên Tôi", "Phần sau này dành cho quý vị cư sĩ:"]:
            is_subhead = True
            
        is_list_item = line_text.startswith("- ") or line_text.startswith("-Giới")
        
        if is_subhead:
            if curr_p:
                paragraphs.append((curr_type, curr_p))
                curr_p = []
            paragraphs.append(("subhead", [l]))
            curr_type = "text"
            continue
            
        if is_poem_line:
            if curr_type != "poem" and curr_p:
                paragraphs.append((curr_type, curr_p))
                curr_p = []
            elif curr_type == "poem" and curr_p:
                prev_l = curr_p[-1]
                if l["page"] == prev_l["page"] and (l["y0"] - prev_l["y0"] > 27.5):
                    paragraphs.append(("poem", curr_p))
                    curr_p = []
            curr_type = "poem"
            curr_p.append(l)
            continue
            
        if is_list_item:
            if curr_p:
                paragraphs.append((curr_type, curr_p))
                curr_p = []
            curr_type = "list"
            curr_p.append(l)
            continue
            
        if curr_type == "poem":
            if curr_p:
                paragraphs.append((curr_type, curr_p))
                curr_p = []
            curr_type = "text"
            curr_p.append(l)
            continue
            
        if curr_type == "list":
            prev_l = curr_p[-1]
            same_page = (l["page"] == prev_l["page"])
            if same_page and (l["y0"] - prev_l["y0"] > 27.5):
                paragraphs.append((curr_type, curr_p))
                curr_p = [l]
                curr_type = "text"
            else:
                curr_p.append(l)
            continue
            
        if not curr_p:
            curr_type = "text"
            curr_p.append(l)
        else:
            prev_l = curr_p[-1]
            same_page = (l["page"] == prev_l["page"])
            if same_page:
                dy = l["y0"] - prev_l["y0"]
                if dy > 27.5:
                    paragraphs.append(("text", curr_p))
                    curr_p = [l]
                else:
                    curr_p.append(l)
            else:
                prev_text = prev_l["text"]
                ends_sentence = bool(re.search(r'[.!?:"”’…]\s*$', prev_text))
                starts_lower = bool(line_text and line_text[0].islower())
                if ends_sentence and not starts_lower:
                    paragraphs.append(("text", curr_p))
                    curr_p = [l]
                else:
                    curr_p.append(l)
                    
    if curr_p:
        paragraphs.append((curr_type, curr_p))
        
    md_body = []
    for p_type, p_lines in paragraphs:
        if p_type == "subhead":
            t = p_lines[0]["text"]
            if t == "Hãy Gọi Đúng Tên Tôi":
                md_body.append(f"### {t}")
            else:
                md_body.append(f"**{t}**")
        elif p_type == "poem":
            poem_lines = []
            for pl in p_lines:
                v = "".join([s["text"] for s in pl["spans"]]).strip()
                v = clean_typography(v)
                poem_lines.append(f"*{v}*  ")
            md_body.append("\n".join(poem_lines))
        elif p_type == "list":
            all_spans = []
            for pl in p_lines:
                all_spans.extend(pl["spans"])
                all_spans.append({"text": " ", "font": pl["spans"][-1]["font"], "flags": pl["spans"][-1]["flags"]})
            raw_md = clean_spans_to_md(all_spans)
            md_clean = clean_typography(raw_md)
            # Clean up duplicate dash like - **- Giới...** or - **-** or - ****
            md_clean = re.sub(r'^\s*-\s*\*\*\s*-\s*', '- **', md_clean)
            md_clean = re.sub(r'^\s*\*\*\s*-\s*', '- **', md_clean)
            md_clean = re.sub(r'^\s*-\s*\*\*\s*-\s*\*\*\s*', '- ', md_clean)
            md_clean = re.sub(r'^\s*-\s*\*{2,}\s*', '- ', md_clean)
            if not md_clean.startswith("- "):
                md_clean = "- " + md_clean.lstrip("- ")
            md_body.append(md_clean)
        else:
            all_spans = []
            for pl in p_lines:
                all_spans.extend(pl["spans"])
                all_spans.append({"text": " ", "font": pl["spans"][-1]["font"], "flags": pl["spans"][-1]["flags"]})
            raw_md = clean_spans_to_md(all_spans)
            md_body.append(clean_typography(raw_md))
            
    # Build complete chapter markdown
    content_lines = [
        f"# {ch['part']}",
        "",
        f"## Chương {ch['num_str']}: {ch['title']}",
        ""
    ]
    
    for block in md_body:
        content_lines.append(block)
        content_lines.append("")
        
    # Navigation footer
    prev_ch = chapters[idx - 1] if idx > 0 else None
    next_ch = chapters[idx + 1] if idx < len(chapters) - 1 else None
    
    nav_links = []
    if prev_ch:
        nav_links.append(f"[<< Chương trước: {prev_ch['title']}]({prev_ch['filename']})")
    nav_links.append("[Mục lục](00_trang_bia_va_muc_luc.md)")
    if next_ch:
        nav_links.append(f"[Chương tiếp theo: {next_ch['title']} >>]({next_ch['filename']})")
        
    content_lines.append("---")
    content_lines.append("")
    content_lines.append(" | ".join(nav_links))
    content_lines.append("")
    
    file_content = "\n".join(content_lines).strip() + "\n"
    with open(ch["filename"], "w", encoding="utf-8") as f:
        f.write(file_content)

print(f"Generated all {len(chapters)} chapter files.")

# Generate 00_trang_bia_va_muc_luc.md
muc_luc_lines = [
    "# AN LẠC TỪNG BƯỚC CHÂN",
    "### *Peace Is Every Step: The Path of Mindfulness in Everyday Life*",
    "",
    "**Tác giả:** Thiền sư Thích Nhất Hạnh  ",
    "**Thể loại:** Phật giáo ứng dụng, Tâm linh, Rèn luyện tâm hồn  ",
    "",
    "---",
    "",
    "![Bìa sách An Lạc Từng Bước Chân](images/cover.jpg)",
    "",
    "---",
    "",
    "## MỤC LỤC CHI TIẾT",
    ""
]

current_p = None
for ch in chapters:
    if ch["part"] != current_p:
        current_p = ch["part"]
        muc_luc_lines.append(f"\n### {current_p}\n")
    muc_luc_lines.append(f"- [Chương {ch['num_str']}: {ch['title']}]({ch['filename']}) (Trang {ch['start_page']})")

muc_luc_content = "\n".join(muc_luc_lines).strip() + "\n"
with open("00_trang_bia_va_muc_luc.md", "w", encoding="utf-8") as f:
    f.write(muc_luc_content)

# Generate README.md
readme_lines = [
    "# An Lạc Từng Bước Chân",
    "",
    "![Bìa sách](images/cover.jpg)",
    "",
    "- **Tác giả:** Thích Nhất Hạnh",
    "- **Tên nguyên tác tiếng Anh:** *Peace Is Every Step: The Path of Mindfulness in Everyday Life*",
    "- **Thể loại:** Phật giáo ứng dụng, Tâm linh, Kỹ năng sống",
    "- **Số chương:** 69 chương (gồm 3 phần chính)",
    "",
    "---",
    "",
    "## Giới thiệu tác phẩm",
    "",
    "**\"An Lạc Từng Bước Chân\"** (*Peace Is Every Step*) là một trong những tác phẩm nổi tiếng và có sức ảnh hưởng sâu rộng nhất của Thiền sư **Thích Nhất Hạnh** trên toàn thế giới.",
    "",
    "Cuốn sách hướng dẫn cách thực hành chánh niệm nhẹ nhàng, tự nhiên trong chính cuộc sống thường nhật: từ hơi thở, nụ cười buổi sáng, rửa chén, lái xe, nghe tiếng chuông, đến cách đối diện và chuyển hóa cơn giận, hàn gắn những vết thương và xây dựng hòa bình trong tâm hồn cũng như ngoài xã hội.",
    "",
    "> *\"An lạc có mặt trong ta ngay tại đây trong giờ phút này, trong mỗi vật và mỗi việc ta làm hay ta thấy. Vấn đề là ta có biết tiếp xúc với nó không. Bầu trời xanh ở ngay trước mắt ta, ta đâu cần phải đi đâu xa để thưởng thức trời xanh.\"*",
    "",
    "---",
    "",
    "## Danh sách các phần và chương sách",
    ""
]

current_p = None
for ch in chapters:
    if ch["part"] != current_p:
        current_p = ch["part"]
        readme_lines.append(f"\n### {current_p}\n")
    readme_lines.append(f"- [Chương {ch['num_str']}: {ch['title']}]({ch['filename']})")

readme_content = "\n".join(readme_lines).strip() + "\n"
with open("README.md", "w", encoding="utf-8") as f:
    f.write(readme_content)

print("Generated 00_trang_bia_va_muc_luc.md and README.md successfully.")
