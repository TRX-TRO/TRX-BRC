import axios from 'axios';

export default {
  name: 'TikTok Stalker',
  intents: ['osint'],
  alias: ['tiktok', 'cek tiktok', 'stalker tiktok'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const username = m.message?.conversation?.trim();
    if (!username) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim username TikTok yang ingin dicari.' });
    const response = await axios.get(`https://www.tiktok.com/@${username}`, { timeout: 20000 });
    await sock.sendMessage(m.key.remoteJid, { text: `Hasil stalking TikTok untuk @${username}.` });
  },
};
