export default {
  name: 'Premium Status',
  intents: ['payment'],
  alias: ['status premium', 'cek premium'],
  access: 'free',
  execute: async ({ sock, m, sender, db }) => {
    const user = db.getUser(sender);
    const expires = user.premium_expires ? new Date(user.premium_expires).toLocaleString('id-ID') : 'Tidak berlaku';
    await sock.sendMessage(m.key.remoteJid, { text: `Level: ${user.level}\nPremium sampai: ${expires}` });
  },
};
