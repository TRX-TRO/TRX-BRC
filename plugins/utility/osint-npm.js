import axios from 'axios';

export default {
  name: 'NPM Stalker',
  intents: ['osint'],
  alias: ['npm', 'cek npm', 'stalker npm'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const packageName = m.message?.conversation?.trim();
    if (!packageName) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim nama package NPM yang ingin dicari.' });
    const response = await axios.get(`https://registry.npmjs.org/${packageName}`, { timeout: 20000 });
    const data = response.data;
    await sock.sendMessage(m.key.remoteJid, { text: `NPM: ${packageName}\nVersi terbaru: ${data['dist-tags']?.latest || '-'}\nDescription: ${data.description || '-'}` });
  },
};
