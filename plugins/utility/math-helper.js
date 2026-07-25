export default {
  name: 'Math Helper',
  intents: ['utility'],
  alias: ['math', 'hitung', 'kalkulator'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const text = m.message?.conversation || '';
    try {
      const result = eval(text.replace(/[^0-9+\-*/(). ]/g, ''));
      await sock.sendMessage(m.key.remoteJid, { text: `Hasil: ${result}` });
    } catch (error) {
      await sock.sendMessage(m.key.remoteJid, { text: 'Gagal menghitung. Gunakan format angka dan operator.' });
    }
  },
};
