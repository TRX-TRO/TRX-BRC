export default {
  name: 'Anti Link',
  intents: ['group-admin'],
  alias: ['anti-link', 'antilink'],
  access: 'admin',
  execute: async ({ sock, m }) => {
    const message = m.message?.conversation || '';
    if (/https?:\/\//i.test(message)) {
      await sock.sendMessage(m.key.remoteJid, { text: 'Link terdeteksi, kick otomatis.' });
      const sender = m.key.participant || m.key.remoteJid;
      await sock.groupParticipantsUpdate(m.key.remoteJid, [`${sender}@s.whatsapp.net`], 'remove');
    }
  },
};
