export default {
  name: 'Utility Auto Reply',
  intents: ['ai-chat'],
  alias: ['bot', 'troxzy', 'zxy'],
  access: 'free',
  execute: async ({ sock, m, ai, sender }) => {
    const response = await ai.aiChat({ userId: sender, content: m.message?.conversation || '' });
    await sock.sendMessage(m.key.remoteJid, { text: response });
  },
};
