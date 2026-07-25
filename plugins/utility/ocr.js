import axios from 'axios';

export default {
  name: 'OCR Utility',
  intents: ['utility'],
  alias: ['ocr', 'baca teks', 'text recognition'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const image = m.message?.imageMessage;
    if (!image) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim gambar teks terlebih dahulu.' });
    const buffer = await sock.downloadMediaMessage(m, 'buffer');
    const response = await axios.post('https://api.ocr.space/parse/image', buffer, {
      headers: { 'apikey': 'helloworld', 'Content-Type': 'application/octet-stream' },
    });
    const text = response.data.ParsedResults?.[0]?.ParsedText || 'Tidak dapat membaca teks.';
    await sock.sendMessage(m.key.remoteJid, { text: `Hasil OCR:\n${text}` });
  },
};
