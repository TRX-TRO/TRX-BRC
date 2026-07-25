export default {
  name: 'Premium Cancel',
  intents: ['payment'],
  alias: ['batal premium', 'cancel premium'],
  access: 'free',
  execute: async ({ sock, m, sender, db }) => {
    db.setUserLevel(sender, 'free');
    db.setPremiumExpiry(sender, 0);
    await sock.sendMessage(m.key.remoteJid, { text: 'Premium kamu sudah dibatalkan. Kembali ke Free.' });
  },
};
