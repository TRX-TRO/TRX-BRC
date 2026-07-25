import axios from 'axios';

export default {
  name: 'Threads Downloader',
  intents: ['download'],
  alias: ['threads', 'download threads'],
  access: 'free',
  execute: async ({ sock, m, entities }) => {
    const url = entities.url || m.message?.conversation;
    if (!url) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim link Threads dulu.' });
    try {
      const response = await axios.get(`https://api.threadsdownloader.com/threads?url=${encodeURIComponent(url)}`, { timeout: 30000 });
      await sock.sendMessage(m.key.remoteJid, { text: `Hasil Threads: ${response.data?.download || url}` });
    } catch (error) {
      await sock.sendMessage(m.key.remoteJid, { text: 'Gagal unduh Threads, coba lagi nanti.' });
    }
  },
};
