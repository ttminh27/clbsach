#!/usr/bin/env python3
"""
Script to convert 'raw/RenLuyenTuDuyPhanBien_AlbertRutherford.pdf' into Markdown files
with extracted images, preserved formatting (bold, italic, superscripts, headings, lists).
"""

import os
import re
import fitz

PDF_PATH = "raw/RenLuyenTuDuyPhanBien_AlbertRutherford.pdf"
IMAGES_DIR = "images"

os.makedirs(IMAGES_DIR, exist_ok=True)
doc = fitz.open(PDF_PATH)

# 1. Extract Images
def extract_images():
    cover = doc.extract_image(8)
    with open(os.path.join(IMAGES_DIR, "cover.jpg"), "wb") as f:
        f.write(cover["image"])

    intro = doc.extract_image(4)
    with open(os.path.join(IMAGES_DIR, "sachmoi_intro.jpg"), "wb") as f:
        f.write(intro["image"])

    banner = doc.extract_image(131)
    with open(os.path.join(IMAGES_DIR, "sachmoi_banner.jpg"), "wb") as f:
        f.write(banner["image"])
    print("Images extracted to images/ directory.")

extract_images()

# 2. Formatting Helpers
def format_spans(spans):
    clean_spans = []
    for s in spans:
        t = s["text"]
        if not t:
            continue
        is_sup = bool(s.get("flags", 0) & 1 or (s.get("size", 15) < 13 and t.strip().isdigit()))
        is_bold = bool((s.get("flags", 0) & 16 or "Bold" in s.get("font", "")) and not is_sup and s.get("size", 15) < 20)
        is_italic = bool((s.get("flags", 0) & 2 or "Ital" in s.get("font", "")) and not is_sup and s.get("size", 15) < 20)
        clean_spans.append({
            "text": t,
            "bold": is_bold,
            "italic": is_italic,
            "sup": is_sup
        })
    
    merged = []
    for s in clean_spans:
        if merged and merged[-1]["bold"] == s["bold"] and merged[-1]["italic"] == s["italic"] and merged[-1]["sup"] == s["sup"]:
            merged[-1]["text"] += s["text"]
        else:
            merged.append(dict(s))
            
    out = ""
    for s in merged:
        t = s["text"]
        if s["sup"]:
            out += f"<sup>{t.strip()}</sup>"
            if t.endswith(" "):
                out += " "
            continue
        
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

def get_page_blocks(pno):
    page = doc[pno]
    d = page.get_text("dict")
    blocks = []
    drop_cap = None
    
    for b in d["blocks"]:
        if b.get("type") == 0:
            if b["bbox"][1] >= 740:
                continue
            lines = []
            for l in b["lines"]:
                if l["bbox"][1] >= 740:
                    continue
                if len(l["spans"]) == 1 and l["spans"][0]["size"] > 30 and len(l["spans"][0]["text"].strip()) == 1:
                    if drop_cap is None:
                        drop_cap = l["spans"][0]["text"].strip()
                    continue
                lines.append({
                    "raw": "".join(s["text"] for s in l["spans"]),
                    "formatted": format_spans(l["spans"]),
                    "bbox": l["bbox"],
                    "spans": l["spans"]
                })
            if lines:
                blocks.append({
                    "lines": lines,
                    "page": pno + 1,
                    "bbox": b["bbox"]
                })
    return drop_cap, blocks

H2_SET = {
    "TRỰC GIÁC", "NHỮNG THAY ĐỔI TRONG NÃO BỘ", "THÍ NGHIỆM TÁCH NÃO",
    "HIỆU ỨNG VÔ THỨC CỦA CON NGƯỜI23", "TÌNH TRẠNG NHẬN THỨC BỊ THAY ĐỔI",
    "CÁCH XÂY DỰNG MỘT LUẬN ĐIỂM", "LOGIC DIỄN DỊCH24", "LOGIC QUY NẠP",
    "NHỮNG LOGIC KHÔNG HỢP LỆ HOẶC SAI (NON SEQUITUR)25", "NHỮNG LOẠI NGỤY BIỆN LOGIC",
    "KẾT LUẬN", "THƯ RÁC", "NHỮNG EMAIL “TIN GIẢ”", "HUYỀN THOẠI BÁNH BURGER31",
    "NHỮNG TRÒ LỪA TRONG TIẾP THỊ", "MLM (KINH DOANH ĐA CẤP – MULTI-LEVEL MARKETING)",
    "LỜI GIỚI THIỆU", "TẠI SAO CON NGƯỜI THÍCH CÁC THUYẾT ÂM MƯU?",
    "NHẬN DẠNG HÌNH MẪU VÀ TÂM LÝ HỌC", "NHẬN DẠNG MẪU VỚI KIỂM TRA THỰC TẾ",
    "MỞ RỘNG ÂM MƯU", "TÁC HẠI CỦA VIỆC ĐƯA RA CÁC THUYẾT ÂM MƯU LÀ GÌ?",
    "NHỮNG THUYẾT ÂM MƯU CÓ CĂN CỨ"
}

H3_SET = {
    "Ngụy biện “người có thẩm quyền luôn đúng”26",
    "Ngụy biện nhân quả",
    "Ngụy biện Post hoc",
    "Ngụy biện phi thể thức (Ad hoc) hay lý lẽ post hoc",
    "Ngụy biện tấn công cá nhân (Ad hominem)",
    "Ngụy biện bất khả tri (Argumentum ad ignorantiam)",
    "Ngụy biện “nhị nguyên luận” (False dichotomy)",
    "Đổi mục tiêu",
    "Ngụy biện rơm"
}

def clean_h2_title(t):
    if "23" in t:
        return "HIỆU ỨNG VÔ THỨC CỦA CON NGƯỜI<sup>23</sup>"
    if "24" in t:
        return "LOGIC DIỄN DỊCH<sup>24</sup>"
    if "25" in t:
        return "NHỮNG LOGIC KHÔNG HỢP LỆ HOẶC SAI (NON SEQUITUR)<sup>25</sup>"
    if "31" in t:
        return "HUYỀN THOẠI BÁNH BURGER<sup>31</sup>"
    return t

def clean_h3_title(t):
    if "26" in t:
        return "Ngụy biện “người có thẩm quyền luôn đúng”<sup>26</sup>"
    return t

def process_chapter(start_p, end_p, title, banner=False, closing_img=False):
    all_blocks = []
    drop_cap = None
    
    for p in range(start_p - 1, end_p):
        dc, blocks = get_page_blocks(p)
        if dc and not drop_cap:
            drop_cap = dc
        all_blocks.extend([(p + 1, b) for b in blocks])
        
    md = []
    md.append(f"# {title}\n")
    
    first_body_done = False
    skip_titles = {
        "LỜI MỞ ĐẦU", "Chương 1", "KHOA HỌC THẦN KINH VỀ NIỀM TIN VÀ SỰ", "HOÀN HẢO",
        "Chương 2", "KÝ ỨC VÀ SỰ NGỘ NHẬN", "Chương 3", "THỰC TẾ",
        "Chương 4", "NHỮNG LẬP LUẬN VÀ NHỮNG NGỤY BIỆN", "LOGIC",
        "Chương 5", "TIẾP THỊ, TRUYỀN THÔNG, VÀ NHỮNG TRÒ", "CHƠI TRÍ TUỆ KHÁC",
        "Chương 6", "NHỮNG THUYẾT ÂM MƯU ĐƯỢC HUYỀN BÍ", "HÓA",
        "KẾT", "THAM KHẢO", "TRÍCH DẪN TÀI LIỆU THAM KHẢO"
    }
    
    i = 0
    while i < len(all_blocks):
        pno, b = all_blocks[i]
        lines = b["lines"]
        raw_b = " ".join(l["raw"] for l in lines).strip()
        
        if raw_b in skip_titles or any(raw_b == t for t in skip_titles):
            i += 1
            continue
            
        first_l_raw = lines[0]["raw"].strip()
        
        if first_l_raw in skip_titles:
            lines = [l for l in lines if l["raw"].strip() not in skip_titles]
            if not lines:
                i += 1
                continue
            first_l_raw = lines[0]["raw"].strip()
            
        # Question (?)
        if first_l_raw.startswith("(?)"):
            q_text = " ".join(l["formatted"] for l in lines)
            md.append(f"**{q_text}**\n")
            md.append("_____________________  \n_____________________  \n_____________________  \n_____________________  \n")
            i += 1
            continue
            
        # Underlines
        if first_l_raw.startswith("_____"):
            i += 1
            continue
            
        # Author initials A.R.
        if first_l_raw == "A.R.":
            md.append("**A.R.**\n")
            i += 1
            continue
            
        # Footnotes starting with *
        if first_l_raw.startswith("* ") or (first_l_raw.startswith("*") and len(first_l_raw) > 2 and first_l_raw[1] != "*"):
            fn_lines = []
            rem_lines = []
            in_note = True
            for l in lines:
                is_ital = any("Ital" in s["font"] for s in l["spans"])
                if in_note and (is_ital or l["raw"].strip().startswith("*")):
                    fn_lines.append(l)
                else:
                    in_note = False
                    rem_lines.append(l)
                    
            raw_note = " ".join(l["raw"] for l in fn_lines).strip()
            body = raw_note.lstrip("*").strip()
            md.append(f"> *\\* {body}*\n")
            
            if rem_lines:
                para = " ".join(l["formatted"] for l in rem_lines)
                md.append(para + "\n")
            i += 1
            continue
            
        # Quoted email
        if "“Kính gửi Ông/Bà." in first_l_raw:
            raw_email = " ".join(l["raw"] for l in lines)
            md.append(f"> *{raw_email}*\n")
            i += 1
            continue
            
        # H2
        if first_l_raw in H2_SET:
            h2_title = clean_h2_title(first_l_raw)
            md.append(f"## {h2_title}\n")
            rem_lines = lines[1:]
            if rem_lines:
                if rem_lines[0]["raw"].strip() in H3_SET:
                    h3_title = clean_h3_title(rem_lines[0]["raw"].strip())
                    md.append(f"### {h3_title}\n")
                    rem_lines = rem_lines[1:]
                if rem_lines:
                    para = " ".join(l["formatted"] for l in rem_lines)
                    md.append(para + "\n")
            i += 1
            continue
            
        # H3
        if first_l_raw in H3_SET:
            h3_title = clean_h3_title(first_l_raw)
            md.append(f"### {h3_title}\n")
            rem_lines = lines[1:]
            if rem_lines:
                para = " ".join(l["formatted"] for l in rem_lines)
                md.append(para + "\n")
            i += 1
            continue
            
        # Syllogism in Chapter 4 on P.33 (B là A. / Do đó, C là B.)
        if first_l_raw == "B là A.":
            if md and "Tất cả A là B." in md[-1]:
                prev = md.pop().strip()
                prev = prev.replace("Tất cả A là B.", "").strip()
                if prev:
                    md.append(prev + "\n")
            md.append("> Tất cả A là B.  \n> B là A.  \n> Do đó, C là B.\n")
            rem_lines = lines[2:]
            if rem_lines:
                para = " ".join(l["formatted"] for l in rem_lines)
                md.append(para + "\n")
            i += 1
            continue
            
        # Bullets
        if any(l["raw"].strip().startswith("•\uf020") or l["raw"].strip().startswith("•") for l in lines):
            bullet_items = []
            curr_bullet = []
            curr_after_para = []
            in_after = False
            
            for l in lines:
                raw_l = l["raw"].strip()
                if raw_l.startswith("•\uf020") or raw_l.startswith("•"):
                    if curr_bullet:
                        bullet_items.append(" ".join(curr_bullet))
                    b_txt = l["formatted"].lstrip("•\uf020").lstrip("•").strip()
                    curr_bullet = [b_txt]
                elif in_after:
                    curr_after_para.append(l["formatted"])
                elif l["bbox"][0] > 75 and curr_bullet:
                    bullet_items.append(" ".join(curr_bullet))
                    curr_bullet = []
                    in_after = True
                    curr_after_para.append(l["formatted"])
                else:
                    if curr_bullet:
                        curr_bullet.append(l["formatted"])
                    else:
                        curr_after_para.append(l["formatted"])
            if curr_bullet:
                bullet_items.append(" ".join(curr_bullet))
                
            for b_it in bullet_items:
                md.append(f"- {b_it}")
            md.append("")
            
            if curr_after_para:
                md.append(" ".join(curr_after_para) + "\n")
            i += 1
            continue

        # Normal Paragraph
        para = " ".join(l["formatted"] for l in lines)
        
        can_cont = (lines[0]["bbox"][0] < 75 and len(md) > 1 and md[-1].strip() 
                    and not md[-1].strip().startswith(("#", "-", ">", "**(?)", "___"))
                    and not md[-1].strip().endswith((".", "!", "?", ":", "”", "\"", "’", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ">"))
                    and not md[-1].strip().endswith("A là B."))
                    
        if can_cont:
            prev = md.pop().strip()
            md.append(prev + " " + para + "\n")
        else:
            if not first_body_done and drop_cap:
                para = drop_cap + para
                first_body_done = True
            md.append(para + "\n")
            
        i += 1
        
    if banner:

    if closing_img:

        
    return "\n".join(md)

# 3. Generate all markdown files
def generate_all():
    # 00. Trang bìa & Mục lục
    make_00 = """# RÈN LUYỆN TƯ DUY PHẢN BIỆN

**Tác giả:** Albert Rutherford  
**Người dịch:** Nguyễn Ngọc Anh  
**Đơn vị phát hành:** THƯ VIỆN EBOOK SACHMOI.NET  

![Bìa sách: Rèn Luyện Tư Duy Phản Biện](images/cover.jpg)



## MỤC LỤC

- [Lời mở đầu](01_Loi_mo_dau.md)
- [Chương 1: Khoa học thần kinh về niềm tin và sự hoàn hảo](02_Chuong_1_Khoa_hoc_than_kinh_ve_niem_tin_va_su_hoan_hao.md)
- [Chương 2: Ký ức và sự ngộ nhận](03_Chuong_2_Ky_uc_va_su_ngo_nhan.md)
- [Chương 3: Thực tế](04_Chuong_3_Thuc_te.md)
- [Chương 4: Những lập luận và những ngụy biện logic](05_Chuong_4_Nhung_lap_luan_va_nhung_nguy_bien_logic.md)
- [Chương 5: Tiếp thị, truyền thông, và những trò chơi trí tuệ khác](06_Chuong_5_Tiep_thi_truyen_thong_va_nhung_tro_choi_tri_tue_khac.md)
- [Chương 6: Những thuyết âm mưu được huyền bí hóa](07_Chuong_6_Nhung_thuyet_am_muu_duoc_huyen_bi_hoa.md)
- [Kết](08_Ket.md)
- [Tham khảo](09_Tham_khao.md)
- [Trích dẫn tài liệu tham khảo](10_Trich_dan_tai_lieu_tham_khao.md)
"""
    with open("00_Trang_bia_va_Muc_luc.md", "w", encoding="utf-8") as f:
        f.write(make_00)
    print("Saved 00_Trang_bia_va_Muc_luc.md")

    # 01. Lời mở đầu
    with open("01_Loi_mo_dau.md", "w", encoding="utf-8") as f:
        f.write(process_chapter(4, 9, "Lời mở đầu", banner=True))
    print("Saved 01_Loi_mo_dau.md")

    # 02. Chương 1
    with open("02_Chuong_1_Khoa_hoc_than_kinh_ve_niem_tin_va_su_hoan_hao.md", "w", encoding="utf-8") as f:
        f.write(process_chapter(10, 16, "Chương 1: Khoa học thần kinh về niềm tin và sự hoàn hảo", banner=True))
    print("Saved 02_Chuong_1_Khoa_hoc_than_kinh_ve_niem_tin_va_su_hoan_hao.md")

    # 03. Chương 2
    with open("03_Chuong_2_Ky_uc_va_su_ngo_nhan.md", "w", encoding="utf-8") as f:
        f.write(process_chapter(17, 24, "Chương 2: Ký ức và sự ngộ nhận"))
    print("Saved 03_Chuong_2_Ky_uc_va_su_ngo_nhan.md")

    # 04. Chương 3
    with open("04_Chuong_3_Thuc_te.md", "w", encoding="utf-8") as f:
        f.write(process_chapter(25, 29, "Chương 3: Thực tế"))
    print("Saved 04_Chuong_3_Thuc_te.md")

    # 05. Chương 4
    with open("05_Chuong_4_Nhung_lap_luan_va_nhung_nguy_bien_logic.md", "w", encoding="utf-8") as f:
        f.write(process_chapter(30, 40, "Chương 4: Những lập luận và những ngụy biện logic"))
    print("Saved 05_Chuong_4_Nhung_lap_luan_va_nhung_nguy_bien_logic.md")

    # 06. Chương 5
    with open("06_Chuong_5_Tiep_thi_truyen_thong_va_nhung_tro_choi_tri_tue_khac.md", "w", encoding="utf-8") as f:
        f.write(process_chapter(41, 47, "Chương 5: Tiếp thị, truyền thông, và những trò chơi trí tuệ khác"))
    print("Saved 06_Chuong_5_Tiep_thi_truyen_thong_va_nhung_tro_choi_tri_tue_khac.md")

    # 07. Chương 6
    with open("07_Chuong_6_Nhung_thuyet_am_muu_duoc_huyen_bi_hoa.md", "w", encoding="utf-8") as f:
        f.write(process_chapter(48, 56, "Chương 6: Những thuyết âm mưu được huyền bí hóa"))
    print("Saved 07_Chuong_6_Nhung_thuyet_am_muu_duoc_huyen_bi_hoa.md")

    # 08. Kết
    with open("08_Ket.md", "w", encoding="utf-8") as f:
        f.write(process_chapter(57, 58, "Kết", banner=True))
    print("Saved 08_Ket.md")

    # 09. Tham khảo
    md_9 = ["# Tham khảo\n"]
    entries_9 = [
        "**AP Psychology Community.** Neisser và Harsch. AP Psychology Community. 2018. https://www.appsychology.com/IB%20Psych/IBcontent/Studies/Neisser%20and%20Harsch.htm",
        "**Bradford, Alina.** Deductive reasoning vs. Inductive reasoning. Live Science. 2017. https://www.livescience.com/21569-deduction-vs-induction.html",
        "**Neel Burton.** Our Hierarchy of Needs. Psychology Today. 2012. https://www.psychologytoday.com/us/blog/hide-and-seek/201205/our-hierarchy-needs",
        "**Cahn, Lauren.** 12 crazy conspiracy theories that actually turned out to be true. Readers Digest. 2019. http://www.readersdigest.com.au/true-stories-lifestyle/12-crazy-conspiracy-theories-actually-turned-out-be-true",
        "**Cheriyedath, Susha.** What is a Phantom Limb? News Medical. 2019. https://www.news-medical.net/health/What-is-a-Phantom-Limb.aspx",
        "**Critical Thinking Web.** What is Critical Thinking? Philosophy. 2019. https://philosophy.hku.hk/think/critical/ct.php",
        "**Gundacker, Felix.** Genealogical Dictionary (PDF). Trích từ bản PDF gốc vào ngày 19/4/2014. 2013.",
        "**Lynn Hasher, David Goldstein, Thomas Toppino.** Frequency And The Conference Of Referential Validity. Journal of Verbal Learning and Verbal Behavior. 16 (1): 107–112. doi:10.1016/S0022-5371(77)80012-1. 1977.",
        "**Chris Higgins.** The McGurk Effect. Mental Floss. 2015. http://mentalfloss.com/article/72587/mcgurk-effect-or-brains-are-weird",
        "**J. H. Hyslop.** The Elements of Logic, Theoretical and Practical. C. Scribner’s Sons. 1892. 2019. https://www.logicallyfallacious.com/tools/lp/Bo/LogicalFallacies/136/Non-Sequitur",
        "**Trích từ tạp chí Forensic Psychology.** 2019. https://sites.google.com/site/consultingservicesinfo/criminal-justice-issues/false-memory-contamination",
        "**John Jackson.** The Ideomotor Effect. Critical Thinking. 2005. http://www.critical-thinking.org.uk/psychology/the-ideomotor-effect.php",
        "**Howard Kahane.** Logic and Contemporary Rhetoric: The Use of Reason in Everyday Life, tái bản lần thứ 8. 1997.",
        "**Andreas Komninos.** Our Three Brains – The Reptilian Brain. Interaction Design. 2018. https://www.interaction-design.org/literature/article/our-three-brains-the-reptilian-brain",
        "**Kenji Lopez.** The Burger Lab. The Burger Lab: Revisiting the Myth of The 12-Year Old McDonald’s Burger That Just Won’t Rot (Testing Results!) Serious Eats. 2010. https://aht.seriouseats.com/2010/11/the-burger-lab-revisiting-the-myth-of-the-12-year-old-burger-testing-results.html",
        "**Jamie Madigan.** The Left Digit Effect. Psychology Today. 2013. https://www.psychologytoday.com/intl/blog/mind-games/201306/the-left-digit-effect-why-game-prices-end-in-99",
        "**Art Markman.** The Consistency of Flashbulb Memories. Psychology Today. 2015. https://www.psychologytoday.com/us/blog/ulterior-motives/201506/the-consistency-flashbulb-memories",
        "**Luke Mastin.** Long Term Memory. The Human Memory. 2018. http://www.human-memory.net/types_long.html",
        "**Luke Mastin.** Short Term Memory. The Human Memory. 2018. http://www.human-memory.net/types_short.html",
        "**Saul McLeod.** Attention Models. Simply Psychology. 2018. https://www.simplypsychology.org/attention-models.html",
        "**Cindy Perras.** Metacognitive Strategies or “Thinking About My Thinking”. Ldat School. 2019. https://www.ldatschool.ca/metacognitive-strategies-or-thinking-about-my-thinking/",
        "**Psycheducation.** “3-Brains-In-One” Brain. Psycheducation. 2019. https://psycheducation.org/brain-tours/3-brains-in-one-brain/",
        "**Eric Robinson.** Extra Sensory Perception. The British Psychological Society. 2009. https://thepsychologist.bps.org.uk/volume-22/edition-7/extra-sensory-perception-controversial-debate",
        "**D.L. Schacter, J.L. Harbluk và D.R. McLachlen.** Retrieval without recollection: an experimental analysis of source amnesia. Journal of verbal learning and verbal behaviour. 23 (5): 593–611. doi:10.1016/S0022-5371(84)90373-6. 1984.",
        "**Skeptical Raptor.** Godwin’s Law. Skeptical Raptor. 2019. https://www.skepticalraptor.com/skepticalraptorblog.php/logical-fallacies/godwins-law/",
        "**Skeptical Raptor.** Post Hoc Ergo Propter Hoc. Skeptical Raptor. 2019. https://www.skepticalraptor.com/skepticalraptorblog.php/logical-fallacies/post-hoc-ergo-propter-hoc-logical-fallies/",
        "**Kerry Smith.** Brain makes decisions before you even know it. Nature. 2008. https://www.nature.com/news/2008/080411/full/news.2008.751.html",
        "**Alastair Sook.** The Strange Photographs Used. BBC. 2017. http://www.bbc.com/culture/story/20170216-five-photographs-used-to-prove-conspiracy-theories",
        "**Sophie Sowden, Caroline Catmur.** The Role of the Right Temporoparietal Junction in the Control of Imitation, Cerebral Cortex, tập 25, số 4, 04/2015, trang 1107–1113, https://doi.org/10.1093/cercor/bht306. Tải xuống năm 2019.",
        "**Terry Libkuman, Charles Stabler và Hajime Otani (2004).** Arousal, Valence, and Memory For Detail, Memory, 12:2, 237-247, DOI:10.1080/09658210244000630",
        "**D. Todman.** History of Neuroscience: Roger Sperry (1913-1994), IBRO History of Neuroscience. 2008. http://www.ibro1.info/Pub/Pub_Main_Display.asp?LC_Docs_ID=3473",
        "**Robin Waterfield.** Hidden Depths: The Story of Hypnosis. Pan Macmillan. ISBN: 9781447206903. 2011.",
        "**Susan Weinshenk.** Dopamine Seeking Reward Loop. Psychology Today. 2018. https://www.psychologytoday.com/intl/blog/brain-wise/201802/the-dopamine-seeking-rewardloop",
        "**Richard Wiseman.** Total Recall. Quirkology. 2019. http://www.richardwiseman.com/quirkology/new/USA/Experiment_totalRecall.shtml"
    ]
    for e in entries_9:
        md_9.append(f"- {e}\n")

    with open("09_Tham_khao.md", "w", encoding="utf-8") as f:
        f.write("\n".join(md_9))
    print("Saved 09_Tham_khao.md")

    # 10. Trích dẫn tài liệu tham khảo
    md_10 = ["# Trích dẫn tài liệu tham khảo\n"]
    citations_10 = [
        "Critical Thinking Web. “What is Critical Thinking?” Philosophy. 2019. https://philosophy.hku.hk/think/critical/ct.php",
        "Cindy Perras. “Metacognitive Strategies or ‘Thinking About My Thinking’”. Ldat School. 2019. https://www.ldatschool.ca/metacognitivestrategies-or-thinking-about-my-thinking/",
        "Psycheducation. “3-Brains-In-One”. Brain. Psycheducation. 2019. https://psycheducation.org/brain-tours/3-brainsin-one-brain/",
        "Andreas Komninos. “Our Three Brains – The Reptilian Brain”. Interaction Design. 2018. https://www.interactiondesign.org/literature/article/our-three-brainsthe-reptilian-brain",
        "Neel Burton. “Our Hierarchy of Needs”. Psychology Today. 2012. https://www.psychologytoday.com/us/blog/hideand-seek/201205/our-hierarchy-needs",
        "Susan Weinshenk. “Dopamine Seeking Reward Loop”. Psychology Today. 2018. 172 https://www.psychologytoday.com/intl/blog/brain-wise/201802/the-dopamine-seeking-rewardloop",
        "Chris Higgins. “The McGurk Effect”. Mental Floss. 2015. http://mentalfloss.com/article/72587/mcgurkeffect-or-brains-are-weird)",
        "Luke Mastin. “Short Term Memory”. The Human Memory. 2018. http://www.humanmemory.net/types_short.html",
        "Luke Mastin. “Long Term Memory”. The Human Memory. 2018. http://www.humanmemory.net/types_long.html",
        "Richard Wiseman. “Total Recall”. Quirkology. 2019. http://www.richardwiseman.com/quirkology/new/USA/Experiment_totalRecall.shtml",
        "Art Markman. “The Consistency of Flashbulb Memories”. Psychology Today. 2015. https://www.psychologytoday.com/us/blog/ulterior-motives/201506/the-consistency-flashbulbmemories",
        "AP Psychology Community. Neisser và Harsch. AP Psychology Community. 2018. https://www.appsychology.com/IB%20Psych/IBcontent/Studies/Neisser%20and%20Harsch.htm",
        "D.L. Schacter, J.L. Harbluk, và D.R. McLachlen, “Retrieval Without Recollection: An Experimental Analysis of Source Amnesia”. Số 173 trong Verbal Learning and Verbal Behaviour. 23 (5): 593–611. doi:10.1016/S0022-5371(84)90373-6. 1984.",
        "Robin Waterfield. Hidden Depths: The Story of Hypnosis. Pan Macmillan. ISBN: 9781447206903. 2011.",
        "Lynn Hasher, David Goldstein, Thomas Toppino. “Frequency and The Conference of Referential Validity”. Journal of Verbal Learning and Verbal Behavior. 16 (1): 107–112. doi:10.1016/S0022-5371(77)80012-1. 1977.",
        "Terry Libkuman, Charles Stabler và Hajime Otani (2004) Arousal, Valence, and Memory For Detail, Memory, 12:2, 237-247, DOI:10.1080/09658210244000630",
        "Saul McLeod. “Attention Models”. Simply Psychology. 2018. https://www.simplypsychology.org/attentionmodels.html",
        "Trích từ Forensic Psychology. 2019. https://sites.google.com/site/consultingservicesinfo/criminal-justice-issues/false-memorycontamination",
        "Kerry Smith. “Brain Makes Decisions Before You Even Know It” Nature. 2008. https://www.nature.com/news/2008/080411/full/news.2008.751.html",
        "Sophie Sowden, Caroline Catmur, “The Role of The Right Temporoparietal Junction in the Control 174 of Imitation”, Cerebral Cortex, tập 25, số 4, 04/2015, trang 1107–1113, https://doi.org/10.1093/cercor/bht306. Downloaded in 2019.",
        "D. Todman, “History of Neuroscience: Roger Sperry” (1913-1994), IBRO History of Neuroscience. 2008. http://www.ibro1.info/Pub/Pub_Main_Display.asp?LC_Docs_ID=3473",
        "Susha Cheriyedath. “What is a Phantom Limb?” News Medical. 2019. https://www.newsmedical.net/health/What-is-aPhantomLimb.aspx",
        "John Jackson. “The Ideomotor Effect”. Critical Thinking. 2005. http://www.criticalthinking.org.uk/psychology/the-ideomotoreffect.php",
        "Alina Bradford. “Deductive reasoning vs. Inductive reasoning”. Live Science. 2017. https://www.livescience.com/21569-deductionvs-induction.html",
        "J. H. Hyslop, The Elements of Logic, Theoretical and Practical. C. Scribner’s Sons. 1892. 2019. https://www.logicallyfallacious.com/tools/lp/Bo/LogicalFallacies/136/Non-Sequitur",
        "Howard Kahane. Logic and Contemporary Rhetoric: The Use of Reason in Everyday Life, tái bản lần thứ 8. 1997. 175",
        "Skeptical Raptor. “Post Hoc Ergo Propter Hoc”. Skeptical Raptor. 2019. https://www.skepticalraptor.com/skepticalraptorblog.php/logical-fallacies/post-hoc-ergo-propterhoc-logical-fallies/",
        "Eric Robinson. “Extra Sensory Perception”. The British Psychological Society. 2009. https://thepsychologist.bps.org.uk/volume-22/edition-7/extra-sensory-perceptioncontroversial-debate",
        "Alastair Sook. “The Strange Photographs Used”. BBC. 2017. http://www.bbc.com/culture/story/20170216five-photographs-used-to-prove-conspiracytheories",
        "Skeptical Raptor. “Godwin’s Law”. Skeptical Raptor. 2019. https://www.skepticalraptor.com/skepticalraptorblog.php/logical-fallacies/godwins-law/",
        "Kenj Lopez. The Burger Lab. The Burger Lab: Revisiting the Myth of The 12-Year Old McDonald’s Burger That Just Won’t Rot (Testing Results!) Serious Eats. 2010. https://aht.seriouseats.com/2010/11/the-burgerlab-revisiting-the-myth-of-the-12-year-oldburger-testing-results.html",
        "Jamie Madigan. “The Left Digit Effect”. Psychology Today. 2013. https://www.psychologytoday.com/intl/blog/min176d-games/201306/the-left-digit-effect-why-gameprices-end-in-99",
        "Felix Gundacker. Genealogical Dictionary (PDF). Trích từ bản gốc (PDF) vào ngày 2014/04/19. 2013.",
        "Lauren Cahn. “12 Crazy Conspiracy Theories That Actually Turned Out To Be True”. Readers Digest. 2019. http://www.readersdigest.com.au/true-storieslifestyle/12-crazy-conspiracy-theories-actuallyturned-out-be-tru"
    ]
    for i, c in enumerate(citations_10):
        md_10.append(f"{i+1}. {c}\n")

    md_10.append("\n\n")
    with open("10_Trich_dan_tai_lieu_tham_khao.md", "w", encoding="utf-8") as f:
        f.write("\n".join(md_10))
    print("Saved 10_Trich_dan_tai_lieu_tham_khao.md")

    # README.md
    readme_md = """# RÈN LUYỆN TƯ DUY PHẢN BIỆN

**Tác giả:** Albert Rutherford  
**Người dịch:** Nguyễn Ngọc Anh  
**Đơn vị phát hành:** THƯ VIỆN EBOOK SACHMOI.NET  

![Bìa sách: Rèn Luyện Tư Duy Phản Biện](images/cover.jpg)

Cuốn sách **"Rèn Luyện Tư Duy Phản Biện"** (Albert Rutherford) cung cấp những kiến thức nền tảng và phương pháp thực tế để:
- Nhận thức về quá trình suy nghĩ (siêu nhận thức - metacognition).
- Hiểu được cấu trúc và sự vận hành của các cấp độ não bộ ảnh hưởng đến niềm tin và quyết định.
- Nhận diện những hạn chế, lỗ hổng của trí nhớ và thực tế chủ quan.
- Xây dựng luận điểm vững chắc và tránh các cạm bẫy ngụy biện logic phổ biến.
- Tỉnh táo trước các chiêu trò tiếp thị, truyền thông, tin giả và mô hình đa cấp lừa đảo.
- Phân tích và huyền bí hóa các thuyết âm mưu dưới góc nhìn khoa học và lý trí.

---

## Danh mục tài liệu

- [00. Trang bìa & Mục lục](00_Trang_bia_va_Muc_luc.md)
- [01. Lời mở đầu](01_Loi_mo_dau.md)
- [02. Chương 1: Khoa học thần kinh về niềm tin và sự hoàn hảo](02_Chuong_1_Khoa_hoc_than_kinh_ve_niem_tin_va_su_hoan_hao.md)
- [03. Chương 2: Ký ức và sự ngộ nhận](03_Chuong_2_Ky_uc_va_su_ngo_nhan.md)
- [04. Chương 3: Thực tế](04_Chuong_3_Thuc_te.md)
- [05. Chương 4: Những lập luận và những ngụy biện logic](05_Chuong_4_Nhung_lap_luan_va_nhung_nguy_bien_logic.md)
- [06. Chương 5: Tiếp thị, truyền thông, và những trò chơi trí tuệ khác](06_Chuong_5_Tiep_thi_truyen_thong_va_nhung_tro_choi_tri_tue_khac.md)
- [07. Chương 6: Những thuyết âm mưu được huyền bí hóa](07_Chuong_6_Nhung_thuyet_am_muu_duoc_huyen_bi_hoa.md)
- [08. Kết](08_Ket.md)
- [09. Tham khảo](09_Tham_khao.md)
- [10. Trích dẫn tài liệu tham khảo](10_Trich_dan_tai_lieu_tham_khao.md)
"""
    with open("README.md", "w", encoding="utf-8") as f:
        f.write(readme_md)
    print("Saved README.md")

if __name__ == "__main__":
    generate_all()
    print("All tasks completed successfully!")
