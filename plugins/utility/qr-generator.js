import qrcode from 'qrcode';

export default {
  name: 'QR Generator',
  intents: ['utility'],
  alias: ['qr', 'qrcode', 'generate qr'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const text = m.message?.conversation || '';
    if (!text) return await sock.sendMessage(m.key.remoteJid, { text: 'Ketik teks untuk dibuat QR.' });
    const qrBuffer = await qrcode.toBuffer(text, { type: 'png' });
    await sock.sendMessage(m.key.remoteJid, { image: { buffer: qrBuffer }, caption: `QR untuk: ${text}` });
  },
};
