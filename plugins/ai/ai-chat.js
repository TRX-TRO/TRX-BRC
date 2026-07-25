export default {
  name: 'AI Chat',
  intents: ['ai-chat'],
  alias: ['chat', 'ngobrol', 'curhat'],
  access: 'free',
  execute: async ({ sock, message, m, sender, ai }) => {
    const response = await ai.aiChat({ userId: sender, content: message });
    await sock.sendMessage(m.key.remoteJid, { text: response });
  },
};
