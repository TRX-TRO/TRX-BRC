export default {
  name: 'Quote of the Day',
  intents: ['utility'],
  alias: ['quote of the day', 'quote today'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const quote = 'Setiap hari adalah kesempatan baru untuk jadi lebih baik.';
    await sock.sendMessage(m.key.remoteJid, { text: quote });
  },
};
