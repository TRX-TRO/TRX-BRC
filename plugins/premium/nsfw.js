import fs from 'fs/promises';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'nsfw.json');

const isVideoUrl = (url) => {
  const lowerUrl = url.toLowerCase();
  const videoRegex = /\.(mp4|mov|webm|mkv|avi|flv|3gp|m3u8)(?:\?|$)/i;
  return videoRegex.test(lowerUrl) || /viddeyyo|vldeys|vildeey|video|vid|stream|watch|reel|story/i.test(lowerUrl);
};

const loadUrls = async () => {
  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    const urls = JSON.parse(raw);
    return Array.isArray(urls) ? urls.filter((item) => typeof item === 'string') : [];
  } catch (err) {
    console.error('Gagal memuat data NSFW', err.message);
    return [];
  }
};

export default {
  name: 'NSFW Media',
  intents: ['nsfw'],
  alias: ['nsfw', 'dewasa', 'xxx', 'adult'],
  access: 'premium',
  execute: async ({ sock, m }) => {
    const urls = await loadUrls();
    if (!urls.length) {
      await sock.sendMessage(m.key.remoteJid, { text: 'Maaf, data NSFW belum tersedia saat ini.' });
      return;
    }

    const url = urls[Math.floor(Math.random() * urls.length)];
    const caption = 'Video NSFW untuk member premium/owner.';

    try {
      if (!isVideoUrl(url)) {
        await sock.sendMessage(m.key.remoteJid, { text: 'Link yang dipilih bukan video yang valid.' });
        return;
      }

      await sock.sendMessage(m.key.remoteJid, { video: { url }, caption });
    } catch (err) {
      console.error('NSFW plugin failed to send media', err.message);
      await sock.sendMessage(m.key.remoteJid, { text: 'Gagal mengirim video NSFW. Coba lagi nanti.' });
    }
  },
};
