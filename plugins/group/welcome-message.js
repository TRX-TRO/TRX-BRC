export default {
  name: 'Welcome Message',
  intents: ['group-admin'],
  alias: ['welcome', 'selamat datang'],
  access: 'admin',
  execute: async ({ sock, m }) => {
    const welcomeTemplate = 'Halo @member, selamat datang di grup! Jangan lupa baca rules ya.';
    const mentions = [m.participant || m.key.participant];
    await sock.sendMessage(m.key.remoteJid, { text: welcomeTemplate.replace('@member', `@${mentions[0].split('@')[0]}`), mentions });
  },
};
