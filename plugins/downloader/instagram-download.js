import axios from 'axios';

export default {
  name: 'Instagram Downloader',
  intents: ['download'],
  alias: ['instagram', 'ig', 'download instagram'],
  access: 'free',
  execute: async ({ sock, m, entities }) => {
    const url = entities.url || m.message?.conversation;
    if (!url) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim link Instagramnya dulu.' });
    try {
      const response = await axios.get(`https://api.downloaderhub.com/instagram?url=${encodeURIComponent(url)}`, { timeout: 30000 });
      const result = response.data?.media || url;
      await sock.sendMessage(m.key.remoteJid, { text: `Hasil IG: ${result}` });
    } catch (error) {
      await sock.sendMessage(m.key.remoteJid, { text: 'Gagal unduh IG, coba lagi nanti.' });
    }
  },
};
