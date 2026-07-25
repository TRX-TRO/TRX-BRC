import axios from 'axios';
import config from '../../config.js';

export default {
  name: 'AI Sentiment',
  intents: ['ai-chat'],
  alias: ['sentiment', 'analisis sentimen', 'mood'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const text = m.message?.conversation || '';
    if (!text) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim teks untuk analisis sentimen.' });
    const response = await axios.post(`${config.aiBaseUrl}/chat/completions`, {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: `Analisis sentimen teks berikut dan sebutkan positif, negatif, atau netral:
${text}` }],
      max_tokens: 120,
      temperature: 0.5,
    }, {
      headers: { Authorization: `Bearer ${config.aiApiKey}`, 'Content-Type': 'application/json' },
    });
    const final = response.data.choices?.[0]?.message?.content || 'Tidak dapat menganalisis sekarang.';
    await sock.sendMessage(m.key.remoteJid, { text: final });
  },
};
