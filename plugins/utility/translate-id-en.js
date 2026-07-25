export default {
  name: 'Translate ID to EN',
  intents: ['utility'],
  alias: ['id to en', 'terjemahkan inggris'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const text = m.message?.conversation || '';
    if (!text) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim teks Bahasa Indonesia.' });
    await sock.sendMessage(m.key.remoteJid, { text: `Translate ke Inggris: ${text}` });
  },
};
