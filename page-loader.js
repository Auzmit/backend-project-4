#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { argv, exit } from 'process';
import { URL } from 'url';
import https from 'https';
import http from 'http';

// Функция для скачивания страницы, возвращает Promise с содержимым
function downloadPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Ошибка загрузки страницы: статус ${res.statusCode}`));
        res.resume();
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Функция для генерации имени файла из URL
function urlToFilename(urlString) {
  try {
    const url = new URL(urlString);
    const withoutProtocol = url.host + url.pathname;
    // Заменяем все символы, кроме букв и цифр, на дефис
    const filename = withoutProtocol.replace(/[^a-zA-Z0-9]/g, '-');
    return filename + '.html';
  } catch (err) {
    throw new Error('Некорректный URL');
  }
}

// Парсим аргументы командной строки
function parseArgs() {
  const args = argv.slice(2);
  if (args.length === 0) {
    console.error('Ошибка: не указан URL');
    exit(1);
  }
  const url = args[0];
  let outputDir = process.cwd(); // по умолчанию текущая директория

  // Опционально можно добавить поддержку -o или --output
  for (let i = 1; i < args.length; i++) {
    if ((args[i] === '-o' || args[i] === '--output') && i + 1 < args.length) {
      outputDir = args[i + 1];
      i++;
    }
  }

  return { url, outputDir };
}

async function main() {
  try {
    const { url, outputDir } = parseArgs();
    const content = await downloadPage(url);
    const filename = urlToFilename(url);
    await fs.mkdir(outputDir, { recursive: true });
    const fullPath = path.resolve(outputDir, filename);
    await fs.writeFile(fullPath, content, 'utf8');
    console.log(fullPath);
  } catch (err) {
    console.error(`Ошибка: ${err.message}`);
    exit(1);
  }
}

main();
