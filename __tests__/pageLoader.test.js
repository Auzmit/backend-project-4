import nock from 'nock';
import path from 'path';
import os from 'os';
import { mkdtemp, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'url';

import pageLoader from '../src/pageLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockUrl = 'https://ru.hexlet.io';

describe('pageLoader function', () => {
  it('правильно ли изменены ресурсы', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
    const pageBefore = await readFile(path.join(__dirname, '..', '__fixtures__', 'pageBefore.html'), 'utf-8');
    const pageAfter = await readFile(path.join(__dirname, '..', '__fixtures__', 'pageAfter.html'), 'utf-8');
    const dummyData = '';
    nock(mockUrl)
      .persist()
      .get('/courses')
      .reply(200, pageBefore);
    nock(mockUrl).get('/assets/professions/nodejs.png').reply(200, dummyData);
    nock(mockUrl).get('/assets/application.css').reply(200, dummyData);
    nock(mockUrl).get('/packs/js/runtime.js').reply(200, dummyData);

    const pathActual = await pageLoader(`${mockUrl}/courses`, tempDir);
    const modifiedPage = await readFile(path.resolve(tempDir, pathActual), 'utf-8');
    expect(modifiedPage).toBe(pageAfter);
  });
});
