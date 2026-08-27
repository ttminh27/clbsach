import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { part0Quizzes } from './dnt-quizzes-part0.mjs';
import { part1Quizzes } from './dnt-quizzes-part1.mjs';
import { part2Quizzes } from './dnt-quizzes-part2.mjs';
import { part3aQuizzes } from './dnt-quizzes-part3a.mjs';
import { part3bQuizzes } from './dnt-quizzes-part3b.mjs';
import { part4aQuizzes } from './dnt-quizzes-part4a.mjs';
import { part4bQuizzes } from './dnt-quizzes-part4b.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const quizzesDir = path.resolve(rootDir, 'DacNhanTam', 'quizzes');

if (!fs.existsSync(quizzesDir)) {
  fs.mkdirSync(quizzesDir, { recursive: true });
}

const allQuizzes = {
  ...part0Quizzes,
  ...part1Quizzes,
  ...part2Quizzes,
  ...part3aQuizzes,
  ...part3bQuizzes,
  ...part4aQuizzes,
  ...part4bQuizzes
};

let count = 0;
for (const [chapterId, quizData] of Object.entries(allQuizzes)) {
  const filePath = path.resolve(quizzesDir, `${chapterId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(quizData, null, 2), 'utf-8');
  count++;
}

console.log(`Generated ${count} quiz files in ${quizzesDir}`);
