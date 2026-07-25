import fs from 'fs/promises';
import path from 'path';

const stateFile = path.join(process.cwd(), 'data', 'protection.json');

const defaultState = {
  antiReport: true,
  antiKenon: true,
  antiBanned: true,
  antiSpam: true,
  antiLink: true,
  antiMentionFlood: true,
  maxMentionCount: 5,
};

const loadState = async () => {
  try {
    const raw = await fs.readFile(stateFile, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch (err) {
    return defaultState;
  }
};

const saveState = async (state) => {
  await fs.mkdir(path.dirname(stateFile), { recursive: true });
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
};

export default {
  name: 'Group Protection',
  intents: ['group-admin'],
  alias: ['protect', 'protection', 'anti-report', 'anti-kenon', 'anti-banned'],
  access: 'admin',
  execute: async ({ sock, m, sender }) => {
    const message = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
    const remoteJid = m.key?.remoteJid;
    const isGroup = remoteJid?.endsWith('@g.us');
    if (!isGroup) return;

    const state = await loadState();
    const text = message.toLowerCase();

    if (state.antiLink && /https?:\/\//i.test(message)) {
      await sock.sendMessage(remoteJid, { text: '⚠️ Link terdeteksi, tindakan perlindungan dijalankan.' });
      const participant = m.key.participant || sender;
      await sock.groupParticipantsUpdate(remoteJid, [`${participant}@s.whatsapp.net`], 'remove');
      return;
    }

    if (state.antiSpam && /\b(banned|ban|kenon|report|spam|scam)\b/i.test(text)) {
      await sock.sendMessage(remoteJid, { text: '⚠️ Kata berbahaya terdeteksi, bot mengunci perilaku mencurigakan.' });
      return;
    }

    if (state.antiMentionFlood) {
      const mentions = (message.match(/@\d+/g) || []).length;
      if (mentions >= state.maxMentionCount) {
        await sock.sendMessage(remoteJid, { text: '⚠️ Mention berlebihan terdeteksi, tindakan perlindungan dijalankan.' });
        const participant = m.key.participant || sender;
        await sock.groupParticipantsUpdate(remoteJid, [`${participant}@s.whatsapp.net`], 'remove');
        return;
      }
    }

    if (state.antiReport || state.antiKenon || state.antiBanned) {
      await sock.sendMessage(remoteJid, { text: '🛡️ Proteksi aktif: anti-report, anti-kenon, anti-banned, anti-link, anti-spam.' });
    }
  },
};
