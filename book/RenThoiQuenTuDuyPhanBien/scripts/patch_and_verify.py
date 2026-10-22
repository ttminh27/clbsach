import re

# Update 05_chuong_4.md with page 88 ad
with open('05_chuong_4.md', 'r', encoding='utf-8') as f:
    c4 = f.read().strip()

ad_text = """

---

## TẢI THÊM SÁCH

[**Tư duy phản Biện – Từ Làm Quen Đến Thói Quen**](https://hoimesach.com/tim-hieu-sach/tu-duy-phan-bien-tu-lam-quen-den-thoi-quen/)

Cuốn sách cung cấp những nội dung sau: • Khung tư duy phản biện được phát triển bởi hai trong...
"""

if "TẢI THÊM SÁCH" not in c4:
    with open('05_chuong_4.md', 'w', encoding='utf-8') as f:
        f.write(c4 + ad_text)
    print("Added page 88 ad to 05_chuong_4.md")

# Update 09_doi_ngu_thinknetic.md
with open('09_doi_ngu_thinknetic.md', 'r', encoding='utf-8') as f:
    c9 = f.read()

c9 = c9.replace("hai trong những chuyên gia hàng đầu...", "hai trong...")
with open('09_doi_ngu_thinknetic.md', 'w', encoding='utf-8') as f:
    f.write(c9)
print("Updated 09_doi_ngu_thinknetic.md")
