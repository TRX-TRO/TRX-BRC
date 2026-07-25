export default {
  name: 'Time Now',
  intents: ['utility'],
  alias: ['time', 'waktu', 'jam sekarang'],
  access: 'free',
  execute: async ({ sock, m }) => {
    await sock.sendMessage(m.key.remoteJid, { text: `Waktu sekarang: ${new Date().toLocaleString('id-ID')}` });
  },
};
