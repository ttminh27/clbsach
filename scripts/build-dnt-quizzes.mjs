import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const quizzesDir = path.resolve(rootDir, 'DacNhanTam', 'quizzes');

if (!fs.existsSync(quizzesDir)) {
  fs.mkdirSync(quizzesDir, { recursive: true });
}

export const quizzes = {};

export function saveAllQuizzes() {
  let totalCount = 0;
  for (const [chapterId, quizData] of Object.entries(quizzes)) {
    const filePath = path.resolve(quizzesDir, `${chapterId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(quizData, null, 2), 'utf-8');
    totalCount++;
  }
  console.log(`Successfully generated ${totalCount} quiz files in ${quizzesDir}`);
}
