import { parentPort, workerData } from 'worker_threads';
import ytdl from 'ytdl-core';
import axios from 'axios';
import * as cheerio from 'cheerio';

const taskHandlers = {
  async downloadMedia({ url }) {
    if (!url) throw new Error('URL tidak disediakan');
    if (/youtube\.com|youtu\.be/i.test(url)) {
      const info = await ytdl.getInfo(url);
      const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });
      return { title: info.videoDetails.title, url: format.url };
    }
    const response = await axios.get(url, { timeout: 20000 });
    const $ = cheerio.load(response.data);
    return { title: $('title').text() || 'Unknown', url };
  },
};

parentPort.on('message', async (payload) => {
  const { taskId, type, data } = payload;
  try {
    const result = await taskHandlers[type](data);
    parentPort.postMessage({ id: taskId, result });
  } catch (error) {
    parentPort.postMessage({ id: taskId, error: error.message || 'Worker error' });
  }
});

parentPort.postMessage({ type: 'ready', workerId: workerData.id });
