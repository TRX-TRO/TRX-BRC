import axios from 'axios';

export default {
  name: 'Web Screenshot',
  intents: ['utility'],
  alias: ['screenshot', 'screenshot web', 'capture website'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const url = m.message?.conversation.match(/https?:\/\/[\S]+/i)?.[0];
    if (!url) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim URL situs web yang ingin discreenshot.' });
    const response = await axios.get(`https://api.apiflash.com/v1/urltoimage?access_key=demo&url=${encodeURIComponent(url)}`,
      { responseType: 'arraybuffer', timeout: 30000 });
    await sock.sendMessage(m.key.remoteJid, { image: { buffer: Buffer.from(response.data) }, caption: `Screenshot ${url}` });
  },
};
