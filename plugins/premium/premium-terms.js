export default {
  name: 'Premium Terms',
  intents: ['payment'],
  alias: ['syarat premium', 'premium terms'],
  access: 'free',
  execute: async ({ sock, m }) => {
    await sock.sendMessage(m.key.remoteJid, { text: 'Premium TroxzyMD:\nBasic 7 hari 10k\nPro 30 hari 25k\nUltimate Lifetime 50k' });
  },
};
