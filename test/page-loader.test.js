//для теста тестов
// import { processCommandLineArguments } from '../for-tests.js';

// отдельные функции и всё вместе
import main from '../src/index.js';
import { downloadPage, parseArgs, urlToFilename } from '../src/my_functions.js';

// для downloadPage
import axios from 'axios';
import nock from 'nock';

// для всех
import { strict as assert } from 'assert';
import fsp from 'fs/promises';
import path from 'path';
import os from 'os';

describe('downloadPage', () => {
  it('должна скачать содержимое страницы', async () => {
    const url = 'https://www.google.com';

    const response = await axios.get(url);

    nock(url)
      .get('/')
      .reply(200, 'OK')

    assert.equal(response.status, 200);
  });

  it('проверка выброса ошибки при неуспешном ответе', async () => {
    const url = 'https://google.co325m';

    nock(url)
      .get('/')
      .reply(404);

    await assert.rejects(downloadPage(url));
  });
});

describe('urlToFilename', () => {
  let tmpDirPath = '';
  
  beforeEach(async () => {
    process.argv = [
      'node',
      './page-loader.js',
      'https://ru.hexlet.io/courses?q%5Bsearch_text%5D=as',
      '-o',
      './tmp'
    ];
    // На каждый тест своя временная директория (это изоляция!)
    // Чистить не надо, система сама почистит
    tmpDirPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });
  
  it('проверка превращения всех лишних символов в строке URL в тире', () => {
    const url = 'https://ru.hexlet.io/courses?q%5Bsearch_text%5D=asd';
    const expectedUrl = 'ru-hexlet-io-courses.html';
    assert.equal(urlToFilename(url), expectedUrl);
  });

  it('проверка преобразования URL из process.argv в корректное имя файла', () => {
    const { url, outputDir } = parseArgs();
    const expectedUrl = 'ru-hexlet-io-courses.html';
    assert.equal(urlToFilename(url), expectedUrl);
  });
  
  it('должна завершить процесс с ошибкой при отсутствии аргументов', () => {
    process.argv = ['node', './page-loader.js'];

    assert.throws(() => {
      parseArgs();
    });
  });
});


