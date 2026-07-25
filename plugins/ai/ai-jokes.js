import axios from 'axios';
import config from '../../config.js';

export default {
  name: 'AI Jokes',
  intents: ['ai-chat'],
  alias: ['jokes', 'lucu', 'humor'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const response = await axios.post(`${config.aiBaseUrl}/chat/completions`, {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Buatkan satu joke singkat dan lucu dalam bahasa Indonesia.' }],
      max_tokens: 100,
      temperature: 0.9,
    }, {
      headers: { Authorization: `Bearer ${config.aiApiKey}`, 'Content-Type': 'application/json' },
    });
    const joke = response.data.choices?.[0]?.message?.content || 'Gagal membuat joke sekarang.';
    await sock.sendMessage(m.key.remoteJid, { text: joke });
  },
};
