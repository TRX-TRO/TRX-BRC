import axios from 'axios';
import FormData from 'form-data';
import config from '../config.js';
import db from './database.js';

const chatHistoryKey = (userId) => `chat_${userId}`;

const getChatContext = async (userId) => {
  const state = db.getState();
  return state.sessions?.[chatHistoryKey(userId)] || [];
};

const saveChatContext = async (userId, message) => {
  const state = db.getState();
  state.sessions ||= {};
  state.sessions[chatHistoryKey(userId)] ||= [];
  state.sessions[chatHistoryKey(userId)].push(message);
  state.sessions[chatHistoryKey(userId)] = state.sessions[chatHistoryKey(userId)].slice(-5);
  await db.setState(`sessions.${chatHistoryKey(userId)}`, state.sessions[chatHistoryKey(userId)]);
};

const aiChat = async ({ userId, content }) => {
  const context = await getChatContext(userId);
  const messages = [
    { role: 'system', content: 'Kamu TroxzyMD, asisten WhatsApp terbaik, jawab santai, sopan, dan kadang nyeleneh.' },
    ...context,
    { role: 'user', content },
  ];
  const response = await axios.post(`${config.aiBaseUrl}/chat/completions`, {
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 800,
    temperature: 0.8,
  }, {
    headers: { Authorization: `Bearer ${config.aiApiKey}`, 'Content-Type': 'application/json' },
    timeout: 30000,
  });
  const result = response.data.choices?.[0]?.message?.content || 'Maaf, gagal menjawab sekarang.';
  await saveChatContext(userId, { role: 'user', content });
  await saveChatContext(userId, { role: 'assistant', content: result });
  return result;
};

const aiImage = async ({ prompt }) => {
  const response = await axios.post(`${config.aiBaseUrl}/images/generations`, {
    prompt,
    size: '1024x1024',
    n: 1,
  }, {
    headers: { Authorization: `Bearer ${config.aiApiKey}`, 'Content-Type': 'application/json' },
    timeout: 45000,
  });
  return response.data.data?.[0]?.url || null;
};

const transcribeVoice = async ({ buffer }) => {
  const formData = new FormData();
  formData.append('file', buffer, { filename: 'voice.webm', contentType: 'audio/webm' });
  formData.append('model', 'whisper-1');
  const response = await axios.post(`${config.aiBaseUrl}/audio/transcriptions`, formData, {
    headers: { Authorization: `Bearer ${config.aiApiKey}`, ...formData.getHeaders() },
    timeout: 45000,
  });
  return response.data.text || 'Tidak dapat mentranskripsi suara.';
};

export default {
  aiChat,
  aiImage,
  transcribeVoice,
};
