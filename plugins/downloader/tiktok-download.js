import axios from 'axios';

export default {
  name: 'TikTok Downloader',
  intents: ['download'],
  alias: ['tiktok', 'download tiktok', 'unduh tiktok'],
  access: 'free',
  execute: async ({ sock, m, entities }) => {
    const url = entities.url || m.message?.conversation;
    if (!url) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim link TikTok dulu bro.' });
    try {
      const response = await axios.get(`https://api.tiktokdownloader.ai/download?url=${encodeURIComponent(url)}`, { timeout: 30000 });
      const result = response.data?.video || response.data?.download || null;
      if (!result) return await sock.sendMessage(m.key.remoteJid, { text: 'Gagal ambil link, coba lagi nanti.' });
      await sock.sendMessage(m.key.remoteJid, { text: `Hasil TikTok: ${result}` });
    } catch (error) {
      await sock.sendMessage(m.key.remoteJid, { text: 'API sekunder gagal, coba lagi nanti.' });
    }
  },
};
