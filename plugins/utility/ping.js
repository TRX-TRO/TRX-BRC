export default {
  name: 'Ping',
  intents: ['help'],
  alias: ['ping', 'pong', 'cek'],
  access: 'free',
  execute: async ({ sock, m }) => {
    await sock.sendMessage(m.key.remoteJid, { text: 'Pong! TroxzyMD hidup.' });
  },
};
