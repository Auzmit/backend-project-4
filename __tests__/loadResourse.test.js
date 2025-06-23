import fsp from 'node:fs/promises';
import nock from 'nock';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

import loadResourse from '../src/loadResourse.js';
import urlToFilename from '../src/my_functions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockUrl = 'https://ru.hexlet.io';
let tempDir;

beforeEach(async () => {
  tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

describe('должна скачать ресурсы страницы', () => {
  it('проверка превращения всех лишних символов в строке URL в тире', async () => {
    const url = 'https://ru.hexlet.io/courses';
    const expectedUrl = 'ru-hexlet-io-courses.html';
    await expect(urlToFilename(url)).toBe(expectedUrl);
  });

  it.each([
    ['ru-hexlet-io-courses.html', '/courses'],
    ['ru-hexlet-io-packs-js-runtime.js', '/packs/js/runtime.js'],
    ['ru-hexlet-io-assets-application.css', '/assets/application.css'],
    ['ru-hexlet-io-assets-professions-nodejs.png', '/assets/professions/nodejs.png'],
  ])('should load %p file from %p', async (fileName, url) => {
    const samplePath = path.join(__dirname, '..', '__fixtures__', fileName);
    const sample = await fsp.readFile(samplePath, 'utf8');
    nock(mockUrl).get(url).replyWithFile(200, samplePath);
    const filePath = path.join(tempDir, fileName);
    await loadResourse(`${mockUrl}${url}`, filePath);
    await expect(fsp.readFile(filePath, 'utf-8')).resolves.toStrictEqual(sample);
  });

  it('должна завершить процесс с ошибкой когда статус ответа не 200', async () => {
    const statusCode = 400;
    const errorMessage = `Request failed with status code ${statusCode}`;
    nock(mockUrl).get('/').reply(statusCode, '');
    await expect(loadResourse(mockUrl, '')).rejects.toThrow(errorMessage);
  });

  it('должна завершить процесс с ошибкой если пути не существует', async () => {
    const invalidPath = 'this-path-doesnt-exist';
    const errorMessage = `ENOENT: no such file or directory, open '${invalidPath}'`;
    nock(mockUrl).get('/').reply(200, '');
    await expect(loadResourse(mockUrl, invalidPath)).rejects.toThrow(errorMessage);
  });

  it('должна завершить процесс с ошибкой когда нет прав на запись', async () => {
    const tempNoPermissionDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'noPermission'));
    await fsp.chmod(tempNoPermissionDir, 0o555);
    const errorMessage = `EISDIR: illegal operation on a directory, open '${tempNoPermissionDir}'`;
    nock(mockUrl).get('/').reply(200, '');
    await expect(loadResourse(mockUrl, tempNoPermissionDir)).rejects.toThrow(errorMessage);
  });
});
