export default {
  name: 'Emoji Translator',
  intents: ['utility'],
  alias: ['emoji', 'emoticon'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const text = m.message?.conversation || '';
    if (!text) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim teks untuk diubah jadi emoji.' });
    await sock.sendMessage(m.key.remoteJid, { text: text.split('').map((c) => `${c}⃣`).join('') });
  },
};
