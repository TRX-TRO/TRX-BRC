import axios from 'axios';

export default {
  name: 'Carbon Code',
  intents: ['utility'],
  alias: ['carbon', 'carbon code', 'code screenshot'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const code = m.message?.conversation || '';
    if (!code) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim kode yang ingin dijadikan gambar carbon.' });
    const response = await axios.post('https://carbonara-42.herokuapp.com/api/cook', { code }, { responseType: 'arraybuffer', timeout: 30000 });
    await sock.sendMessage(m.key.remoteJid, { image: { buffer: Buffer.from(response.data) }, caption: 'Ini gambar carbon code kamu.' });
  },
};
