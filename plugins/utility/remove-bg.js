import axios from 'axios';

export default {
  name: 'Remove BG',
  intents: ['utility'],
  alias: ['removbg', 'remove bg', 'hapus background'],
  access: 'premium',
  execute: async ({ sock, m }) => {
    const image = m.message?.imageMessage;
    if (!image) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim gambar terlebih dahulu.' });
    const buffer = await sock.downloadMediaMessage(m, 'buffer');
    const form = new FormData();
    form.append('image_file', buffer, 'image.png');
    form.append('size', 'auto');
    const response = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
      headers: { 'X-Api-Key': 'REMOVE_BG_KEY', ...form.getHeaders() },
      responseType: 'arraybuffer',
      timeout: 30000,
    });
    await sock.sendMessage(m.key.remoteJid, { image: { buffer: Buffer.from(response.data) }, caption: 'Background berhasil dihapus.' });
  },
};
