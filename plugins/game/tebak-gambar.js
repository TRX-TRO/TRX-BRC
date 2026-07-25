export default {
  name: 'Tebak Gambar',
  intents: ['game'],
  alias: ['tebak gambar', 'gambar', 'quiz gambar'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const question = 'Gambar jenis apa ini? Jawab dengan angka.';
    await sock.sendMessage(m.key.remoteJid, { text: question });
  },
};
