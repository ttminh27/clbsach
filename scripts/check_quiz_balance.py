import json, os, glob

def check_quizzes(quizzes_dir):
    files = sorted(glob.glob(os.path.join(quizzes_dir, "*.json")))
    print(f"Checking {len(files)} quiz files in {quizzes_dir}")
    all_ok = True
    for f in files:
        fname = os.path.basename(f)
        with open(f, 'r', encoding='utf-8') as fp:
            data = json.load(fp)
        qs = data.get('questions', [])
        if len(qs) != 15:
            print(f"[{fname}] FAILED: Question count is {len(qs)} (expected 15)")
            all_ok = False
        
        counts = {0: 0, 1: 0, 2: 0, 3: 0}
        longest_is_correct = 0
        shortest_is_correct = 0
        ratios = []
        
        for idx, q in enumerate(qs):
            c_idx = q.get('correctIndex')
            counts[c_idx] = counts.get(c_idx, 0) + 1
            opts = q.get('options', [])
            if len(opts) != 4:
                print(f"[{fname}] Q{idx+1}: options count is {len(opts)}")
                all_ok = False
            lens = [len(o) for o in opts]
            max_len = max(lens)
            min_len = min(lens)
            ratio = max_len / min_len if min_len > 0 else 999
            ratios.append(ratio)
            if lens[c_idx] == max_len and lens.count(max_len) == 1:
                longest_is_correct += 1
            if lens[c_idx] == min_len and lens.count(min_len) == 1:
                shortest_is_correct += 1
            
            if ratio > 1.45 and (max_len - min_len) > 25:
                print(f"[{fname}] Q{idx+1}: Length disparity! Ratio {ratio:.2f}, diff {max_len - min_len}. lens={lens}")
                all_ok = False
        
        # Check distribution: in 15 questions, distribution should be e.g. 4,4,4,3
        sorted_counts = sorted(counts.values())
        if sorted_counts != [3, 4, 4, 4]:
            print(f"[{fname}] FAILED: Distribution is {counts} (expected 3, 4, 4, 4)")
            all_ok = False
        else:
            print(f"[{fname}] OK: Dist={counts}, max_ratio={max(ratios):.2f}, avg_ratio={sum(ratios)/len(ratios):.2f}, longest_c={longest_is_correct}/15, shortest_c={shortest_is_correct}/15")
            
    return all_ok

if __name__ == '__main__':
    quizzes_dir = "/home/mark/working/clbsach/book/KiLuatTichCucTrongThucHanhLamChaMeHangNgay/quizzes"
    check_quizzes(quizzes_dir)
