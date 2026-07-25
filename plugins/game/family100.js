export default {
  name: 'Family100',
  intents: ['game'],
  alias: ['family100', 'family 100', 'kuis keluarga'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const poll = {
      name: 'Family100: Tebak satu jawaban paling umum',
      options: ['Buah', 'Hewan', 'Pekerjaan', 'Warna', 'Makanan'],
      selectableCount: 1,
      withPollOptions: true,
    };
    await sock.sendMessage(m.key.remoteJid, { poll });
  },
};
