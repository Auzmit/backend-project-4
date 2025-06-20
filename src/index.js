import fs from 'fs/promises';
import path from 'path';

// мои функции
import { downloadPage, parseArgs, urlToFilename } from './my_functions.js';

async function main() {
  try {
    const { url, outputDir } = parseArgs();
    const content = await downloadPage(url);
    const filename = urlToFilename(url);
    await fs.mkdir(outputDir, { recursive: true });
    const fullPath = path.resolve(outputDir, filename);
    await fs.writeFile(fullPath, content, 'utf8');
  } catch (err) {
    console.error(`Ошибка main: ${err.message}`);
    exit(1);
  }
}

export default main;
