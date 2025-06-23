import * as cheerio from 'cheerio';
import debug from 'debug';
import fsp from 'fs/promises';
import Listr from 'listr';
import path from 'path';
import _ from 'lodash';

import loadResourse from './loadResourse.js';

const log = debug('page-loader');

const strUrlToFilename = (str) => {
  const unwantedSymbol = /[^A-Za-z0-9]/g;
  const newStr = str.replaceAll(unwantedSymbol, '-');

  return newStr;
};

// создаёт имя директории (из url host и пути до неё)
const createFilesDirName = ({ host, pathname }) => `${strUrlToFilename(host + pathname)}_files`;

// создаёт имя файла (из url host и пути до него)
const createFileName = (srcUrl) => {
  const extension = path.extname(srcUrl.pathname) || '.html';
  const fileName = extension === '.html' ? srcUrl.pathname : srcUrl.pathname.slice(0, -extension.length);
  return strUrlToFilename(srcUrl.host + fileName) + extension;
};

const srcAttrubuteName = {
  img: 'src',
  link: 'href',
  script: 'src',
};

// подготавливаем ассеты для url и, соответственно, html
const prepareAssets = (pageUrl, filesDirName, html) => {
  const $ = cheerio.load(html, { decodeEntities: false });
  const assets = [];
  const entries = Object.entries(srcAttrubuteName);
  entries.forEach(([tagName, attrubuteName]) => {
    $(tagName).each((_i, el) => {
      const oldSrc = $(el).attr(attrubuteName);
      if (!oldSrc) {
        return null;
      }
      const srcUrl = new URL(oldSrc, pageUrl.origin);
      if (pageUrl.host !== srcUrl.host) {
        return null;
      }
      const srcFileName = createFileName(srcUrl);
      const newSrc = `${filesDirName}/${srcFileName}`;
      $(el).attr(attrubuteName, newSrc);
      return assets.push({ url: srcUrl.href, fileName: srcFileName });
    });
  });
  return { html: $.html(), assets };
};

// скачивает html и его ресурсы (картинки и тд)
// и переназначает в скачанном html ссылки на локально загруженные ресурсы
export default (url, output = process.cwd()) => {
  log(`Starting loading page from ${url} to ${output}`);
  const tasks = [];
  const pageUrl = new URL(url);
  const pageFileName = createFileName(pageUrl);
  const filesDirName = createFilesDirName(pageUrl);
  const filesDirFullPath = path.join(output, filesDirName);
  const pageFileFullPath = path.join(output, pageFileName);

  return loadResourse(url, pageFileFullPath)
    .then(() => {
      log(`Creating directory for files - ${filesDirFullPath}`);
      return fsp.mkdir(filesDirFullPath);
    })
    .then(() => fsp.readFile(pageFileFullPath, 'utf-8'))
    .then((data) => {
      const { html, assets } = prepareAssets(pageUrl, filesDirName, data);
      assets.forEach((asset) => {
        const srcFileFullPath = path.join(output, filesDirName, asset.fileName);
        log(`Adding task of loading ${asset.url} to ${path.join(output, filesDirName, asset.fileName)}`);
        const task = {
          title: asset.url,
          task: () => loadResourse(asset.url, srcFileFullPath),
        };
        return tasks.push(task);
      });
      return html;
    })
    .then((html) => {
      log('Changing src values');
      return fsp.writeFile(pageFileFullPath, html);
    })
    .then(() => {
      const noDuplicateTasks = _.uniqBy(tasks, 'title');
      const list = new Listr(noDuplicateTasks, { concurrent: true });
      log(`Running ${noDuplicateTasks.length} tasks`);
      return list.run();
    })
    .then(() => pageFileFullPath);
};
