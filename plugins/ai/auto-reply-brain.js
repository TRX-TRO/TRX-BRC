export default {
  name: 'Auto Reply Brain',
  intents: ['ai-chat'],
  alias: ['troxzy', 'bot', 'zxy'],
  access: 'free',
  execute: async ({ sock, m, sender, ai }) => {
    const message = m.message?.conversation || '';
    const response = await ai.aiChat({ userId: sender, content: message });
    await sock.sendMessage(m.key.remoteJid, { text: response });
  },
};
