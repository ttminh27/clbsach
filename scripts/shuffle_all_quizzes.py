import glob, json, random
from collections import Counter

# Set a deterministic seed or standard random
random.seed(42)

def shuffle_quiz_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    questions = data.get('questions', [])
    modified = False

    for q in questions:
        options = q.get('options', [])
        correct_idx = q.get('correctIndex', 0)
        
        if 0 <= correct_idx < len(options):
            correct_text = options[correct_idx]
            shuffled = list(options)
            random.shuffle(shuffled)
            new_idx = shuffled.index(correct_text)
            q['options'] = shuffled
            q['correctIndex'] = new_idx
            modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

# Shuffle all books
all_files = sorted(glob.glob('*/quizzes/*.json'))
for f in all_files:
    shuffle_quiz_file(f)

print("Finished shuffling all quizzes!")

# Verify distribution
for book in sorted(glob.glob('*/quizzes')):
    files = sorted(glob.glob(f'{book}/*.json'))
    all_indices = []
    for f in files:
        with open(f) as fp:
            d = json.load(fp)
        for q in d.get('questions', []):
            all_indices.append(q.get('correctIndex'))
    counter = Counter(all_indices)
    print(f'{book}: total={len(all_indices)}, distribution={dict(sorted(counter.items()))}')
