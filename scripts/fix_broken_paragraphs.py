#!/usr/bin/env python3
"""
scripts/fix_broken_paragraphs.py

Rà soát và tự động gộp (merge) các dòng văn bản bị ngắt đoạn sai quy cách trong kho sách Markdown.
Trường hợp xử lý:
- Dòng A kết thúc không có dấu chấm/ngắt câu (dấu phẩy, từ nối, chữ thường/hoa...)
- Dòng B (sau 1 hoặc nhiều dòng trống) bắt đầu bằng một chữ cái viết thường (a-z, à-ỹ...)
-> Ghép dòng A và dòng B thành một đoạn văn liền mạch, loại bỏ dòng trống ngắt quãng giữa chừng.
"""

import os
import sys
import glob
import re
import argparse

# Punctuation that marks the end of a sentence
TERMINAL_PATTERN = re.compile(r'([\.!\?:…]\s*["”\')\]\*_]*|--|---|–)$')

# Markdown block markup that shouldn't be merged arbitrarily
SPECIAL_START = re.compile(r'^(\s*#|\s*>|\s*!\[|\s*\||\s*[-*+]\s|\s*\d+\.\s|---)')

def fix_content(content):
    lines = content.split('\n')
    changed = False
    
    i = 0
    new_lines = []
    
    while i < len(lines):
        curr_line = lines[i]
        curr_stripped = curr_line.strip()
        
        # If line is empty or a special markdown block, keep it as is
        if not curr_stripped or SPECIAL_START.match(curr_stripped):
            new_lines.append(curr_line)
            i += 1
            continue
        
        # Look ahead to see if next non-empty line starts with lowercase
        j = i + 1
        blank_lines = []
        while j < len(lines) and not lines[j].strip():
            blank_lines.append(lines[j])
            j += 1
        
        if j < len(lines) and len(blank_lines) > 0:
            next_line = lines[j]
            next_stripped = next_line.strip()
            
            # Check conditions for broken paragraph:
            # 1. curr_stripped does NOT end with terminal punctuation
            # 2. next_stripped does NOT start with special markdown markup
            # 3. next_stripped starts with a lowercase letter
            if (not TERMINAL_PATTERN.search(curr_stripped) 
                and not SPECIAL_START.match(next_stripped) 
                and next_stripped[0].islower()):
                
                # Merge curr_line and next_line
                if curr_stripped.endswith('-') and not curr_stripped.endswith(' -'):
                    merged = curr_stripped + next_stripped
                else:
                    merged = curr_stripped + ' ' + next_stripped
                
                # Replace curr_line with merged and skip the blank lines and next_line
                lines[j] = merged
                changed = True
                i = j
                continue
        
        new_lines.append(curr_line)
        i += 1
        
    return '\n'.join(new_lines), changed

def process_file(file_path, apply_changes=False):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fixed, changed = fix_content(content)
    if changed:
        if apply_changes:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed)
        return True
    return False

def main():
    parser = argparse.ArgumentParser(description="Fix mid-sentence broken paragraphs in Markdown books.")
    parser.add_argument("--book", type=str, default=None, help="Specific book folder name (e.g. DungBaoGioDiAnMotMinh)")
    parser.add_argument("--apply", action="store_true", help="Apply fixes to files")
    args = parser.parse_args()

    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    book_base = os.path.join(root_dir, 'book')

    if args.book:
        target_dirs = [os.path.join(book_base, args.book)]
    else:
        target_dirs = sorted(glob.glob(os.path.join(book_base, '*')))

    total_files_changed = 0
    total_books_affected = 0

    for bdir in target_dirs:
        if not os.path.isdir(bdir):
            continue
        bname = os.path.basename(bdir)
        md_files = sorted(glob.glob(os.path.join(bdir, '*.md')))
        
        book_changes = 0
        for mdf in md_files:
            # Skip README.md and index files
            fname = os.path.basename(mdf)
            if fname.lower() in ['readme.md', 'muc_luc.md']:
                continue
            
            if process_file(mdf, apply_changes=args.apply):
                book_changes += 1
                total_files_changed += 1
        
        if book_changes > 0:
            total_books_affected += 1
            action_str = "Fixed" if args.apply else "Detected issues in"
            print(f"[{bname}] {action_str} {book_changes} files.")

    mode_str = "APPLIED" if args.apply else "DRY-RUN (use --apply to write)"
    print(f"\nDone [{mode_str}]: {total_files_changed} files affected across {total_books_affected} books.")

if __name__ == '__main__':
    main()
