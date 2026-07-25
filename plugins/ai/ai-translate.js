import axios from 'axios';
import config from '../../config.js';

export default {
  name: 'AI Translate',
  intents: ['ai-chat'],
  alias: ['translate', 'terjemahkan', 'alih bahasa'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const text = m.message?.conversation || '';
    if (!text) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim teks yang ingin diterjemahkan.' });
    const response = await axios.post(`${config.aiBaseUrl}/chat/completions`, {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: `Terjemahkan kalimat ini ke dalam Bahasa Indonesia dengan gaya santai:
${text}` }],
      max_tokens: 400,
      temperature: 0.7,
    }, {
      headers: { Authorization: `Bearer ${config.aiApiKey}`, 'Content-Type': 'application/json' },
    });
    const translated = response.data.choices?.[0]?.message?.content || 'Gagal menerjemahkan.';
    await sock.sendMessage(m.key.remoteJid, { text: translated });
  },
};
