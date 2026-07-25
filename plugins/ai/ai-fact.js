import axios from 'axios';
import config from '../../config.js';

export default {
  name: 'AI Fact',
  intents: ['ai-chat'],
  alias: ['fact', 'fakta', 'fun fact'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const response = await axios.post(`${config.aiBaseUrl}/chat/completions`, {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Berikan satu fakta menarik tentang teknologi dalam bahasa Indonesia.' }],
      max_tokens: 120,
      temperature: 0.75,
    }, {
      headers: { Authorization: `Bearer ${config.aiApiKey}`, 'Content-Type': 'application/json' },
    });
    const fact = response.data.choices?.[0]?.message?.content || 'Gagal mendapatkan fakta.';
    await sock.sendMessage(m.key.remoteJid, { text: fact });
  },
};
