import axios from 'axios';
import config from '../../config.js';

export default {
  name: 'AI Summary',
  intents: ['ai-chat'],
  alias: ['summarize', 'ringkas', 'summary'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const text = m.message?.conversation || '';
    if (!text) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim teks atau URL yang ingin diringkas.' });
    const response = await axios.post(`${config.aiBaseUrl}/chat/completions`, {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: `Ringkas teks berikut:
${text}` }],
      max_tokens: 300,
      temperature: 0.6,
    }, {
      headers: { Authorization: `Bearer ${config.aiApiKey}`, 'Content-Type': 'application/json' },
    });
    const result = response.data.choices?.[0]?.message?.content || 'Tidak dapat merangkum sekarang.';
    await sock.sendMessage(m.key.remoteJid, { text: result });
  },
};
