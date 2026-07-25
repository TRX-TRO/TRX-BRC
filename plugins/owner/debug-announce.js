export default {
  name: 'Owner Debug Announce',
  intents: ['owner'],
  alias: ['owner', 'debug'],
  access: 'owner',
  execute: async ({ sock, m }) => {
    const text = m.message?.conversation || 'Owner melakukan pengecekan.';
    await sock.sendMessage(m.key.remoteJid, { text: `Owner command diterima: ${text}` });
  },
};
