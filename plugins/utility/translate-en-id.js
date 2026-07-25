export default {
  name: 'Translate EN to ID',
  intents: ['utility'],
  alias: ['en to id', 'terjemahkan indonesia'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const text = m.message?.conversation || '';
    if (!text) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim teks Bahasa Inggris.' });
    await sock.sendMessage(m.key.remoteJid, { text: `Translate ke Indonesia: ${text}` });
  },
};
