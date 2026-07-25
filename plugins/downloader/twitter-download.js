import axios from 'axios';

export default {
  name: 'Twitter Downloader',
  intents: ['download'],
  alias: ['twitter', 'tweet', 'download twitter'],
  access: 'free',
  execute: async ({ sock, m, entities }) => {
    const url = entities.url || m.message?.conversation;
    if (!url) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim link Twitter dulu.' });
    try {
      const response = await axios.get(`https://api.twscraper.com/download?url=${encodeURIComponent(url)}`, { timeout: 30000 });
      const media = response.data?.media || url;
      await sock.sendMessage(m.key.remoteJid, { text: `Hasil Twitter: ${media}` });
    } catch (error) {
      await sock.sendMessage(m.key.remoteJid, { text: 'Gagal unduh Twitter, coba lagi nanti.' });
    }
  },
};
