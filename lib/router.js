import Fuse from 'fuse.js';

const wakeWords = ['troxzy', 'bot', 'zxy'];

const patterns = [
  { name: 'registration', patterns: ['register', 'daftar', 'registrasi', 'nama'] },
  { name: 'approval', patterns: ['confirm', 'konfirmasi', 'approve', 'terima'] },
  { name: 'payment', patterns: ['mau beli premium', 'beli premium', 'bayar premium', 'order premium', 'premium'] },
  { name: 'ai-chat', patterns: ['chat', 'ngobrol', 'curhat', 'jawab', 'bales'] },
  { name: 'ai-image', patterns: ['gambar', 'image', 'generate image', 'ai art', 'buat gambar'] },
  { name: 'sticker', patterns: ['sticker', 'stiker', 'bikin sticker', 'buat sticker'] },
  { name: 'download', patterns: ['download', 'unduh', 'save', 'tiktok', 'youtube', 'instagram', 'twitter', 'threads', 'pinterest'] },
  { name: 'group-admin', patterns: ['kick', 'buka grup', 'tutup grup', 'tagall', 'hapus', 'banned'] },
  { name: 'rpg', patterns: ['mine', 'mencari', 'hunting', 'craft', 'inventaris', 'inventory', 'leaderboard'] },
  { name: 'osint', patterns: ['github', 'npm', 'tiktok', 'instagram', 'stalker', 'cek akun', 'profile'] },
  { name: 'utility', patterns: ['ocr', 'removbg', 'screenshot', 'carbon', 'temp mail', 'email sementara'] },
  { name: 'voice-transcribe', patterns: ['transcribe', 'whisper', 'voice note', 'suara jadi teks', 'stt'] },
  { name: 'help', patterns: ['help', 'bantuan', 'menu', 'perintah', 'command'] },
  { name: 'nsfw', patterns: ['nsfw', 'dewasa', 'adult', 'xxx'] },
];

const fuse = new Fuse(patterns.flatMap(p => p.patterns.map(pattern => ({ intent: p.name, pattern }))), {
  keys: ['pattern'],
  threshold: 0.4,
});

const containsWakeWord = (text) => {
  if (!text) return false;
  const normalized = text.toLowerCase();
  return wakeWords.some((word) => normalized.includes(word));
};

const cleanText = (text) => text?.toLowerCase().trim().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, ' ').replace(/\s+/g, ' ') || '';

const extractIntent = (message, isDirectMessage = false) => {
  const text = cleanText(message);
  if (!text) return { intent: 'unknown', confidence: 0.1, entities: {} };
  const hasWake = isDirectMessage || containsWakeWord(text);
  const trovare = fuse.search(text).shift();
  if (trovare && hasWake) {
    const intent = trovare.item.intent;
    const entities = {};
    const urlMatch = text.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) entities.url = urlMatch[0];
    if (/kick\s+@?([0-9]+)|@([0-9]+)/i.test(message)) entities.mention = message.match(/kick\s+@?([0-9]+)|@([0-9]+)/i)?.[1] || message.match(/kick\s+@?([0-9]+)|@([0-9]+)/i)?.[2];
    if (/buka grup|tutup grup|tagall|tag all|tagall semuanya/i.test(message)) entities.groupAction = message;
    return { intent, confidence: 0.75, entities };
  }

  if (isDirectMessage) {
    return { intent: trovare ? trovare.item.intent : 'ai-chat', confidence: trovare ? 0.6 : 0.4, entities: {} };
  }

  return { intent: 'unknown', confidence: 0.1, entities: {} };
};

const checkAccess = (userLevel, requiredLevel) => {
  const order = ['free', 'premium', 'admin', 'owner'];
  return order.indexOf(userLevel) >= order.indexOf(requiredLevel);
};

const accessReply = (requiredLevel) => {
  return `Lu bukan ${requiredLevel} cuy, batrek lu kering.`;
};

export default {
  extractIntent,
  checkAccess,
  accessReply,
  wakeWords,
};
