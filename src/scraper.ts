// src/scraper.ts
import * as https from 'https';

const url = 'https://r.jina.ai/https://www.launchingnext.com/?ref=producthunt';

export function scrapeLaunchingNext(): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        resolve(data);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}
