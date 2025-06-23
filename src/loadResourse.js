import axios from 'axios';
import debug from 'debug';
import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';

const logAxios = debug('axios');

// загружает ресурсы с url в локальную папку
export default (url, path) => {
  logAxios(`Loading from ${url} into ${path}`);
  return axios({
    method: 'get',
    url,
    responseType: 'stream',
    validateStatus: (status) => status === 200,
  })
    .then(({ data }) => {
      logAxios(`Downloading data from ${url} into ${path}`);
      return pipeline(data, fs.createWriteStream(path));
    });
};
