export default {
  name: 'Bot Status',
  intents: ['help'],
  alias: ['status', 'info bot', 'status bot'],
  access: 'free',
  execute: async ({ sock, m }) => {
    await sock.sendMessage(m.key.remoteJid, { text: 'TroxzyMD online, siap bantu tanpa prefix. Coba kirim troxzy menu.' });
  },
};
