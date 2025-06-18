#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { program } from 'commander';
import axios from 'axios';
import { URL } from 'url';

// Функция для преобразования URL в имя файла
function urlToFilename(urlString) {
  const url = new URL(urlString);
  let name = url.hostname + url.pathname;

  if (name.endsWith('/')) {
    name += 'index';
  }

  // Заменяем все неалфавитно-цифровые символы на дефисы
  name = name.replace(/[^a-zA-Z0-9]/g, '-');

  // Убираем повторяющиеся дефисы
  name = name.replace(/-+/g, '-');

  // Убираем дефисы в начале и конце
  name = name.replace(/^-|-$/g, '');

  return `${name}.html`;
}

async function downloadPage(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    throw new Error(`Ошибка при загрузке страницы: ${err.message}`);
  }
}

async function savePage(content, directory, filename) {
  await fs.mkdir(directory, { recursive: true });
  const filepath = path.resolve(directory, filename);
  await fs.writeFile(filepath, content, 'utf8');
  return filepath;
}

async function main() {
  program
    .name('page-loader')
    .description('Скачивает страницу по URL и сохраняет в директорию')
    .argument('<url>', 'URL страницы для загрузки')
    .option('-o, --output <directory>', 'Директория для сохранения', '.')
    .parse(process.argv);

  const options = program.opts();
  const url = program.args[0];
  const outputDir = options.output;

  try {
    const content = await downloadPage(url);
    const filename = urlToFilename(url);
    const savedPath = await savePage(content, outputDir, filename);
    console.log(savedPath);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
