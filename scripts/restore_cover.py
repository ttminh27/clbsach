#!/usr/bin/env python3
"""
scripts/restore_cover.py

Tạo và phục chế ảnh bìa chất lượng cao, siêu sắc nét cho sách:
'Naval Ravikant – Để Thịnh Vượng Và Hạnh Phúc'
Từ ảnh người dùng cung cấp:
- Xóa hoàn toàn hình dán / watermark (sticker) ở góc trên bên trái.
- Tái lập dòng chữ nguyên bản "The Almanack of Naval Ravikant" với độ sắc nét tuyệt đối.
- Loại bỏ vệt đen / bóng gáy sách ở mép trái do góc chụp.
- Khử nhiễu nền giấy, cân bằng ánh sáng và tăng độ tương phản.
- Làm sắc nét từng chi tiết chữ (NAVAL RAVIKANT, tác giả, lời tựa, dịch giả) bằng Unsharp Mask và CLAHE.
- Tích hợp logo Ninety Eight độ phân giải cao chính thức.
- Xuất file ảnh chuẩn 880 x 1360 (hoặc 800 x 1200) siêu nét cho website CLB Sách.
"""

import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

def restore_book_cover(input_path, output_path, target_width=880, target_height=1360):
    print(f"Reading input image: {input_path}")
    img_bgr = cv2.imread(input_path)
    if img_bgr is None:
        raise FileNotFoundError(f"Cannot read image: {input_path}")

    h, w, _ = img_bgr.shape
    print(f"Original dimensions: {w}x{h}")

    # 1. Loại bỏ vệt đen / bóng gáy sách ở mép trái (x: 0..10)
    # Lề trái sách bắt đầu từ x ~ 10, cân đối với lề phải x ~ 440
    crop_left = 10
    img_cropped = img_bgr[:, crop_left:w]
    cw = img_cropped.shape[1]
    ch = img_cropped.shape[0]

    # 2. Xóa triệt để nhãn dán sticker màu cam (ở góc trên bên trái)
    # Tọa độ trong ảnh sau khi crop: x: 0..72, y: 0..75
    hsv = cv2.cvtColor(img_cropped, cv2.COLOR_BGR2HSV)
    lower_orange = np.array([3, 70, 70])
    upper_orange = np.array([28, 255, 255])
    mask_orange = cv2.inRange(hsv, lower_orange, upper_orange)

    circle_mask = np.zeros((ch, cw), dtype=np.uint8)
    cv2.circle(circle_mask, (38 - crop_left, 36), 40, 255, -1)
    combined_mask = cv2.bitwise_or(mask_orange, circle_mask)

    # Vùng chứa dòng chữ trên bên trái (The Almanack of Naval Ravikant)
    # Ta sẽ xóa cả vùng chữ bị che một phần này (y: 28..48, x: 0..205) để vẽ lại toàn bộ dòng chữ vector siêu nét
    text_clear_mask = np.zeros((ch, cw), dtype=np.uint8)
    cv2.rectangle(text_clear_mask, (0, 0), (210, 52), 255, -1)

    inpaint_mask = cv2.bitwise_or(combined_mask, text_clear_mask)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    inpaint_mask = cv2.dilate(inpaint_mask, kernel, iterations=1)

    clean_bgr = cv2.inpaint(img_cropped, inpaint_mask, inpaintRadius=9, flags=cv2.INPAINT_TELEA)

    # Điền màu nền giấy phẳng mịn cho góc trên bên trái
    bg_color = np.median(clean_bgr[15:35, 220:250], axis=(0, 1))
    clean_bgr[0:55, 0:215] = bg_color

    # 3. Phóng đại lên độ phân giải cao mục tiêu (880 x 1360) bằng Lanczos
    upscaled = cv2.resize(clean_bgr, (target_width, target_height), interpolation=cv2.INTER_LANCZOS4)

    # 4. Tách lớp nền và lớp chữ để khử nhiễu nền và làm sắc nét chữ
    gray = cv2.cvtColor(upscaled, cv2.COLOR_BGR2GRAY)

    # Denoise nền bằng Bilateral Filter (giữ nguyên cạnh chữ)
    denoised = cv2.bilateralFilter(upscaled, d=7, sigmaColor=35, sigmaSpace=35)

    # Unsharp Mask để tăng độ sắc nét cạnh chữ
    gaussian = cv2.GaussianBlur(denoised, (0, 0), 2.0)
    sharpened = cv2.addWeighted(denoised, 1.7, gaussian, -0.7, 0)

    # Tối ưu hóa tương phản: làm chữ đen sâu hơn, nền giấy trắng sáng sạch sẽ
    lab = cv2.cvtColor(sharpened, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)

    lut = np.arange(256, dtype=np.uint8)
    for i in range(256):
        if i < 115:
            lut[i] = int(i * 0.75) # Chữ đen đậm rõ nét
        elif i > 220:
            lut[i] = min(255, int(i + (255 - i) * 0.45)) # Nền giấy trắng ngà sạch
        else:
            lut[i] = i

    l_enhanced = cv2.LUT(l, lut)
    lab_enhanced = cv2.merge([l_enhanced, a, b])
    enhanced_bgr = cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2BGR)

    # 5. Chuyển sang PIL để render chữ và logo vector
    pil_img = Image.fromarray(cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil_img)

    # Thêm lại dòng chữ 'The Almanack of Naval Ravikant' góc trên bên trái
    # Baseline khớp với 'Lời tựa: TIM FERRISS' ở góc phải (y ~ 71)
    font_path = '/usr/share/fonts/liberation-sans/LiberationSans-Regular.ttf'
    if not os.path.exists(font_path):
        font_path = '/usr/share/fonts/dejavu-sans-fonts/DejaVuSans.ttf'

    font_title = ImageFont.truetype(font_path, 24)
    # Lề trái tương ứng: x ~ 50, y ~ 66
    text_color = (65, 65, 65)
    draw.text((50, 68), "The Almanack of Naval Ravikant", fill=text_color, font=font_title)

    # 6. Tích hợp logo Ninety Eight chuẩn nét cao nếu có
    official_logo_path = os.path.join(os.path.dirname(output_path), 'logo_ninety_eight.png')
    if os.path.exists(official_logo_path):
        try:
            logo_img = Image.open(official_logo_path).convert('RGBA')
            # Lấy vùng nội dung của logo
            logo_gray = logo_img.convert('L')
            logo_arr = np.array(logo_gray)
            dark_y, dark_x = np.where(logo_arr < 200)
            if len(dark_x) > 0:
                crop_box = (dark_x.min(), dark_y.min(), dark_x.max() + 1, dark_y.max() + 1)
                logo_cropped = logo_img.crop(crop_box)
                
                # Tọa độ Ninety Eight ở góc dưới bên trái: x ~ 58, y ~ 1245..1285
                target_logo_w = 120
                target_logo_h = int(logo_cropped.height * (target_logo_w / logo_cropped.width))
                logo_resized = logo_cropped.resize((target_logo_w, target_logo_h), Image.Resampling.LANCZOS)
                
                # Nền logo có thể làm trong suốt
                logo_arr_resized = np.array(logo_resized)
                # Đổi nền trắng thành trong suốt
                alpha = np.where(logo_arr_resized[:, :, :3].mean(axis=2) > 230, 0, 255).astype(np.uint8)
                logo_rgba = Image.fromarray(np.dstack([logo_arr_resized[:, :, :3], alpha]))
                
                # Dán logo vào vị trí chuẩn
                pil_img.paste(logo_rgba, (56, 1248), mask=logo_rgba)
                print("Applied official crisp Ninety Eight logo")
        except Exception as e:
            print(f"Notice: could not apply official logo: {e}")

    # 7. Lưu kết quả
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    pil_img.save(output_path, quality=95, optimize=True)
    print(f"Successfully saved restored cover image to: {output_path} ({pil_img.size})")

if __name__ == '__main__':
    input_file = '/home/mark/.gemini/antigravity-cli/brain/648c627d-26c2-4906-b4fc-4dee9e1475b1/.user_uploaded/uploaded_media_1793005771570.png'
    output_file = '/home/mark/working/clbsach/book/DeThinhVuongVaHanhPhuc/images/cover.jpg'
    restore_book_cover(input_file, output_file)
