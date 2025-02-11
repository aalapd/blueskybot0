// src/scraper.ts
import axios from 'axios';

const url = 'https://r.jina.ai/https://www.launchingnext.com/?ref=producthunt';

export function scrapeLaunchingNext(): Promise<string> {
  return axios.get(url, {
    headers: {
      'Accept': 'text/event-stream',
      'X-Base': 'final',
      'X-No-Cache': 'true',
      'X-Return-Format': 'markdown',
      // 'X-With-Iframe': 'true'
    }
  })
  .then(response => response.data)
  .catch(error => {
    throw error;
  });
}
