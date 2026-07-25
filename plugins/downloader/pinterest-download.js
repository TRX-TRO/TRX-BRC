import axios from 'axios';

export default {
  name: 'Pinterest Downloader',
  intents: ['download'],
  alias: ['pinterest', 'download pinterest'],
  access: 'free',
  execute: async ({ sock, m, entities }) => {
    const url = entities.url || m.message?.conversation;
    if (!url) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim link Pinterest terlebih dahulu.' });
    try {
      const response = await axios.get(`https://api.pinterestdownloader.com/download?url=${encodeURIComponent(url)}`, { timeout: 30000 });
      await sock.sendMessage(m.key.remoteJid, { text: `Hasil Pinterest: ${response.data?.download || url}` });
    } catch (error) {
      await sock.sendMessage(m.key.remoteJid, { text: 'Gagal ambil Pinterest, coba lagi nanti.' });
    }
  },
};
