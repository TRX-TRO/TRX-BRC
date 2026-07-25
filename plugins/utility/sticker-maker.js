export default {
  name: 'Sticker Maker',
  intents: ['sticker'],
  alias: ['sticker', 'stiker', 'bikin sticker'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const image = m.message?.imageMessage || m.message?.videoMessage;
    if (!image) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim gambar atau video dulu.' });
    const buffer = await sock.downloadMediaMessage(m, 'buffer');
    await sock.sendMessage(m.key.remoteJid, { sticker: { buffer } });
  },
};
