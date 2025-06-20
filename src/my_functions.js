// for downloadPage()
import https from 'https';
import http from 'http';

function downloadPage(url) {
  // console.log(url);
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Ошибка downloadPage (загрузки страницы: статус ${res.statusCode})`));
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

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(`Ошибка parseArgs: ${err.message}`);
    exit(1);
  }
  const url = args[0];
  let outputDir = process.cwd(); // по умолчанию текущая директория

  for (let i = 1; i < args.length; i++) {
    if ((args[i] === '-o' || args[i] === '--output') && i + 1 < args.length) {
      outputDir = args[i + 1];
      i++;
    }
  }

  return { url, outputDir };
}

function urlToFilename(urlString) {
  try {
    const url = new URL(urlString);
    const withoutProtocol = url.host + url.pathname;
    // Заменяем все символы, кроме букв и цифр на дефис
    const filename = withoutProtocol.replace(/[^a-zA-Z0-9]/g, '-');
    return filename + '.html';
  } catch (err) {
    throw new Error(`Ошибка urlToFilename: ${err.message}`);
  }
}

export { downloadPage, parseArgs, urlToFilename };
