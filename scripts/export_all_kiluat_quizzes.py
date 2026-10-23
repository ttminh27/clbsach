#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os
import sys

BOOK_ID = "KiLuatTichCucTrongThucHanhLamChaMeHangNgay"
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)
QUIZZES_DIR = os.path.join(ROOT_DIR, "book", BOOK_ID, "quizzes")
os.makedirs(QUIZZES_DIR, exist_ok=True)

from scripts.quiz_chap00_a import data as chap00_a
from scripts.quiz_chap00_b import data as chap00_b
from scripts.quiz_chap01 import data as chap01
from scripts.quiz_chap02 import data as chap02
from scripts.quiz_chap03 import data as chap03
from scripts.quiz_chap04 import data as chap04
from scripts.quiz_chap05 import data as chap05
from scripts.quiz_chap06 import data as chap06

CHAPTER_MAP = [
    ("00_loi_noi_dau", chap00_a),
    ("00_loi_gioi_thieu", chap00_b),
    ("01_chuong_1", chap01),
    ("02_chuong_2", chap02),
    ("03_chuong_3", chap03),
    ("04_chuong_4", chap04),
    ("05_chuong_5", chap05),
    ("06_ket_luan", chap06),
]

for chap_id, d in CHAPTER_MAP:
    filepath = os.path.join(QUIZZES_DIR, f"{chap_id}.json")
    obj = {
        "bookId": BOOK_ID,
        "chapterId": chap_id,
        "chapterTitle": d["chapterTitle"],
        "totalQuestions": len(d["questions"]),
        "questions": d["questions"]
    }
    with open(filepath, "w", encoding="utf-8") as fp:
        json.dump(obj, fp, indent=2, ensure_ascii=False)
    print(f"Exported {chap_id}.json: {len(d['questions'])} questions.")

print("All 8 quiz files exported successfully!")
