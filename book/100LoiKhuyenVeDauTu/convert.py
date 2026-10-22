#!/usr/bin/env python3
"""
Convert raw/100LoiKhuyenVeDauTu_DTrump.pdf to Markdown files.
- Each chapter is a separate markdown file.
- Preserves original content and formatting (bold, italic, headings, lists).
- Extracts cover image to images/ and references it.
"""

import os
import re
import unicodedata
import fitz

PDF_PATH = "raw/100LoiKhuyenVeDauTu_DTrump.pdf"
IMAGES_DIR = "images"

os.makedirs(IMAGES_DIR, exist_ok=True)
doc = fitz.open(PDF_PATH)

def extract_images():
    img_info = doc.extract_image(1257)
    raw_bytes = img_info["image"]
    with open(os.path.join(IMAGES_DIR, "cover.jpeg"), "wb") as f:
        f.write(raw_bytes)
    with open(os.path.join(IMAGES_DIR, "cover.jpg"), "wb") as f:
        f.write(raw_bytes)
    pix = fitz.Pixmap(doc, 1257)
    pix.save(os.path.join(IMAGES_DIR, "cover.png"))
    print("Images extracted successfully to images/.")

extract_images()

def remove_accents(text):
    text = unicodedata.normalize('NFD', text)
    text = re.sub(r'[\u0300-\u036f]', '', text)
    text = text.replace('đ', 'd').replace('Đ', 'D')
    return text

def make_slug(title, max_len=60):
    title = remove_accents(title)
    # remove leading chapter numbers like '1. ' or '58 . '
    title = re.sub(r'^\d+\s*\.\s*', '', title)
    title = re.sub(r'[^a-zA-Z0-9\s]', '', title)
    title = re.sub(r'\s+', '_', title.strip())
    if len(title) > max_len:
        parts = title[:max_len].rsplit('_', 1)
        title = parts[0]
    return title

def format_spans(spans):
    """Formats a list of spans, merging consecutive spans with the same style."""
    # Fix any accidental word-splitting across spans in PDF
    for i in range(len(spans) - 1):
        s1 = spans[i]
        s2 = spans[i+1]
        t1 = s1.get("text", "")
        t2 = s2.get("text", "")
        if t1 and t2 and t1[-1].isalnum() and t2[0].isalnum():
            m = re.match(r"^([^\s]+)", t2)
            if m:
                part = m.group(1)
                s1["text"] = t1 + part
                s2["text"] = t2[len(part):]

    clean_spans = []
    for s in spans:
        t = s["text"]
        if not t:
            continue
        font = s.get("font", "")
        is_bold = "Bold" in font
        is_italic = "Ital" in font
        clean_spans.append({
            "text": t,
            "bold": is_bold,
            "italic": is_italic
        })
    
    # Merge consecutive identical styles
    merged = []
    for s in clean_spans:
        if merged and merged[-1]["bold"] == s["bold"] and merged[-1]["italic"] == s["italic"]:
            merged[-1]["text"] += s["text"]
        else:
            merged.append(dict(s))
            
    out = ""
    for s in merged:
        t = s["text"]
        lspace = len(t) - len(t.lstrip())
        rspace = len(t) - len(t.rstrip())
        mid = t.strip()
        if not mid:
            out += t
            continue
            
        lead = t[:lspace]
        trail = t[len(t)-rspace:]
        
        if s["bold"] and s["italic"]:
            piece = f"***{mid}***"
        elif s["bold"]:
            piece = f"**{mid}**"
        elif s["italic"]:
            piece = f"*{mid}*"
        else:
            piece = mid
        out += lead + piece + trail
    return out

# Get exact chapter list from PDF TOC
def get_chapter_ranges():
    toc = doc.get_toc()
    chapters = []
    for lvl, title, page in toc:
        title_clean = title.strip()
        m = re.match(r"^(\d+)\s*\.\s*(.*)", title_clean)
        if m:
            num = int(m.group(1))
            chapters.append((num, title_clean, page - 1)) # 0-indexed page
        elif "GIỚI THIỆU" in title_clean:
            chapters.append((0, title_clean, page - 1))
            
    # Sort by chapter number
    chapters.sort(key=lambda x: x[0])
    
    # Calculate end pages
    ranges = []
    for i in range(len(chapters)):
        num, title, start_p = chapters[i]
        if i + 1 < len(chapters):
            end_p = chapters[i+1][2] - 1
        else:
            end_p = 207 # Page 208 (0-indexed 207)
        ranges.append((num, title, start_p, end_p))
    return ranges

chapter_ranges = get_chapter_ranges()
print(f"Found {len(chapter_ranges)} chapters in TOC.")

def parse_chapter(num, full_title, start_page, end_page):
    elements = [] # list of tuples: ('title', text), ('author', text), ('bio', text), ('heading', text), ('bullet', text), ('para', text)
    
    is_intro = (num == 0)
    
    current_para_spans = []
    current_bullet_spans = []
    
    def flush_para():
        nonlocal current_para_spans
        if current_para_spans:
            text = format_spans(current_para_spans).strip()
            text = re.sub(r"[ \t]+", " ", text)
            if text:
                elements.append(("para", text))
            current_para_spans = []
            
    def flush_bullet():
        nonlocal current_bullet_spans
        if current_bullet_spans:
            text = format_spans(current_bullet_spans).strip()
            text = re.sub(r"[ \t]+", " ", text)
            if text:
                elements.append(("bullet", text))
            current_bullet_spans = []

    # Title is always emitted first
    elements.append(("title", full_title))
    
    seen_author = False
    seen_bio = False
    bio_spans = []
    
    for pno in range(start_page, end_page + 1):
        page = doc[pno]
        drawings = page.get_drawings()
        bullet_drawings = [d["rect"] for d in drawings if d["rect"].width < 20 and d["rect"].height < 20 and d["rect"].x0 < 100]
        
        d = page.get_text("dict")
        for b in d["blocks"]:
            if b.get("type") != 0:
                continue
            
            for l in b["lines"]:
                spans = l["spans"]
                if not spans:
                    continue
                line_raw = "".join(s["text"] for s in spans).strip()
                if not line_raw:
                    continue
                    
                s0 = spans[0]
                size = s0["size"]
                font = s0["font"]
                x0 = l["bbox"][0]
                y0 = l["bbox"][1]
                
                # Check if this line is part of the initial chapter title on start page
                if pno == start_page and abs(size - 27.5) < 1.0 and y0 < 180 and not seen_author and not is_intro:
                    # Already emitted as title
                    continue
                if is_intro and abs(size - 27.5) < 1.0 and pno == start_page and y0 < 180:
                    continue
                    
                # Ebook Sachvui link in intro
                if is_intro and "Sachvui.Com" in line_raw:
                    flush_para()
                    elements.append(("para", f"*[Ebook miễn phí tại : www.Sachvui.Com](http://sachvui.com/)*"))
                    continue
                    
                # Author name on chapter start page (Bold 15pt, usually before body)
                if not is_intro and not seen_author and pno == start_page and abs(size - 15.0) < 1.0 and "Bold" in font and y0 < 220:
                    flush_para()
                    flush_bullet()
                    elements.append(("author", line_raw))
                    seen_author = True
                    continue
                    
                # Author bio lines on chapter start page
                if not is_intro and seen_author and not seen_bio and pno == start_page:
                    # Check if line belongs to bio
                    is_bio_font = ("Ital" in font)
                    is_bio_pos = (x0 > 100) or (" là " in line_raw and any(w in line_raw.lower() for w in ["chủ tịch", "ceo", "cổ đông", "người", "tác giả", "uỷ viên"]))
                    # Check if body has started: body starts at x0 around 92 with regular font and is not a bio statement
                    if (is_bio_font or is_bio_pos) and not (88 <= x0 <= 96 and font == "TimesNewRomanPSMT" and not " là " in line_raw and len(bio_spans) > 0):
                        if bio_spans:
                            bio_spans.append({"text": " ", "font": font, "size": size, "flags": s0.get("flags", 0)})
                        bio_spans.extend(spans)
                        continue
                    else:
                        # Bio is finished
                        if bio_spans:
                            bio_text = format_spans(bio_spans).strip()
                            bio_text = re.sub(r"[ \t]+", " ", bio_text)
                            if not bio_text.startswith("*") and not bio_text.endswith("*"):
                                bio_text = f"*{bio_text}*"
                            elements.append(("bio", bio_text))
                            bio_spans = []
                        seen_bio = True
                        # Fall through to process this line as body!

                # Check for bullet: bullet drawing at diff ~ 6.62 pt
                has_bullet = any(abs(br.y0 - y0 - 6.62) < 1.0 for br in bullet_drawings)
                
                # Section heading: size 21.2 or size 27.5 on later page/y0>=180
                is_heading = (abs(size - 21.2) < 1.0) or (abs(size - 27.5) < 1.0 and (pno > start_page or y0 >= 180))
                if is_heading:
                    flush_para()
                    flush_bullet()
                    elements.append(("heading", line_raw))
                    continue
                    
                # Bullet list item
                if has_bullet:
                    flush_para()
                    flush_bullet()
                    current_bullet_spans = list(spans)
                    continue
                    
                # Inside bullet continuation (indented at x0 >= 100 without bullet drawing)
                if current_bullet_spans and x0 >= 100 and not has_bullet:
                    current_bullet_spans.append({"text": " ", "font": font, "size": size, "flags": s0.get("flags", 0)})
                    current_bullet_spans.extend(spans)
                    continue
                else:
                    if current_bullet_spans:
                        flush_bullet()
                        
                # Paragraph line
                if 88 <= x0 <= 98:
                    # New paragraph start
                    flush_para()
                    current_para_spans = list(spans)
                else:
                    # Continuation line
                    if current_para_spans:
                        current_para_spans.append({"text": " ", "font": font, "size": size, "flags": s0.get("flags", 0)})
                        current_para_spans.extend(spans)
                    else:
                        current_para_spans = list(spans)
                        
    # Flush any remaining bio
    if bio_spans and not is_intro:
        bio_text = format_spans(bio_spans).strip()
        bio_text = re.sub(r"[ \t]+", " ", bio_text)
        if not bio_text.startswith("*") and not bio_text.endswith("*"):
            bio_text = f"*{bio_text}*"
        elements.append(("bio", bio_text))
        bio_spans = []
        
    flush_para()
    flush_bullet()
    
    # Render elements to Markdown text
    lines_md = []
    prev_type = None
    for el_type, val in elements:
        if el_type == "title":
            lines_md.append(f"# {val}\n")
        elif el_type == "author":
            lines_md.append(f"**{val}**\n")
        elif el_type == "bio":
            lines_md.append(f"{val}\n")
        elif el_type == "heading":
            lines_md.append(f"\n## {val}\n")
        elif el_type == "bullet":
            lines_md.append(f"- {val}")
        elif el_type == "para":
            if prev_type == "bullet":
                lines_md.append(f"\n{val}\n")
            else:
                lines_md.append(f"{val}\n")
        prev_type = el_type
            
    content = "\n".join(lines_md).strip() + "\n"
    content = re.sub(r"\n{3,}", "\n\n", content)
    return content

# Clean existing markdown files before re-generating
for f in os.listdir("."):
    if f.endswith(".md"):
        os.remove(f)

generated_files = []
for num, title, start_p, end_p in chapter_ranges:
    if num == 0:
        filename = "000_Loi_gioi_thieu.md"
    else:
        slug = make_slug(title)
        filename = f"{num:03d}_{slug}.md"
        
    md_content = parse_chapter(num, title, start_p, end_p)
    with open(filename, "w", encoding="utf-8") as f:
        f.write(md_content)
    generated_files.append((num, title, filename))

print(f"Generated {len(generated_files)} chapter markdown files.")

# Generate 000_Trang_bia_va_Muc_luc.md and README.md
def generate_index_files():
    toc_lines = []
    toc_lines.append("# 100 LỜI KHUYÊN VỀ ĐẦU TƯ BẤT ĐỘNG SẢN KHÔN NGOAN NHẤT\n")
    toc_lines.append("**Tác giả:** Donald J. Trump (tuyển chọn và giới thiệu)")
    toc_lines.append("**Thể loại:** Bất động sản, Đầu tư, Kinh doanh, Kinh tế\n")
    toc_lines.append("![100 Lời Khuyên Về Đầu Tư Bất Động Sản Khôn Ngoan Nhất - Donald J. Trump](images/cover.png)\n")
    toc_lines.append("## MỤC LỤC\n")
    
    for num, title, fn in generated_files:
        toc_lines.append(f"- [{title}]({fn})")
            
    content = "\n".join(toc_lines) + "\n"
    
    with open("000_Trang_bia_va_Muc_luc.md", "w", encoding="utf-8") as f:
        f.write(content)
    with open("README.md", "w", encoding="utf-8") as f:
        f.write(content)
    print("Generated 000_Trang_bia_va_Muc_luc.md and README.md.")

generate_index_files()
print("All conversion completed!")
