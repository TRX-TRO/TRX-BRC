import fs from 'fs/promises';
import path from 'path';

const stateFile = path.join(process.cwd(), 'data', 'protection.json');

const defaultState = {
  enabled: true,
  antiReport: true,
  antiKenon: true,
  antiBanned: true,
  antiSpam: true,
  antiLink: true,
  antiMentionFlood: true,
  maxMentionCount: 5,
};

const featureKeys = ['antiReport', 'antiKenon', 'antiBanned', 'antiSpam', 'antiLink', 'antiMentionFlood'];

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
  execute: async ({ sock, m, sender, db }) => {
    const message = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
    const remoteJid = m.key?.remoteJid;
    const isGroup = remoteJid?.endsWith('@g.us');
    if (!isGroup) return;

    const state = await loadState();
    const text = message.toLowerCase();

    if (/^protect(?:ion)?\b/i.test(text)) {
      const parts = message.trim().split(/\s+/);
      const action = parts[1]?.toLowerCase();
      if (!action || action === 'status') {
        await sock.sendMessage(remoteJid, { text: `🛡️ Status proteksi: ${state.enabled ? 'aktif' : 'mati'}\nAnti-link: ${state.antiLink ? 'on' : 'off'}\nAnti-spam: ${state.antiSpam ? 'on' : 'off'}\nAnti-mention flood: ${state.antiMentionFlood ? 'on' : 'off'}` });
        return;
      }

      if (action === 'on' || action === 'off') {
        state.enabled = action === 'on';
        await saveState(state);
        await db?.logActivity?.(sender, 'protection-toggle', `enabled=${state.enabled}`);
        await sock.sendMessage(remoteJid, { text: `🛡️ Proteksi ${state.enabled ? 'diaktifkan' : 'dimatikan'}.` });
        return;
      }

      if (parts[2] && ['on', 'off'].includes(parts[2].toLowerCase())) {
        const featureKey = action;
        if (featureKeys.includes(featureKey)) {
          state[featureKey] = parts[2].toLowerCase() === 'on';
          await saveState(state);
          await db?.logActivity?.(sender, 'protection-toggle', `${featureKey}=${state[featureKey]}`);
          await sock.sendMessage(remoteJid, { text: `✅ ${featureKey} ${state[featureKey] ? 'aktif' : 'nonaktif'}.` });
          return;
        }
      }
    }

    if (!state.enabled) return;

    if (state.antiLink && /https?:\/\//i.test(message)) {
      await db?.logActivity?.(sender, 'protection-trigger', 'anti-link');
      await sock.sendMessage(remoteJid, { text: '⚠️ Link terdeteksi, tindakan perlindungan dijalankan.' });
      const participant = m.key.participant || sender;
      await sock.groupParticipantsUpdate(remoteJid, [`${participant}@s.whatsapp.net`], 'remove');
      return;
    }

    if (state.antiSpam && /\b(banned|ban|kenon|report|spam|scam)\b/i.test(text)) {
      await db?.logActivity?.(sender, 'protection-trigger', 'anti-spam');
      await sock.sendMessage(remoteJid, { text: '⚠️ Kata berbahaya terdeteksi, bot mengunci perilaku mencurigakan.' });
      return;
    }

    if (state.antiMentionFlood) {
      const mentions = (message.match(/@\d+/g) || []).length;
      if (mentions >= state.maxMentionCount) {
        await db?.logActivity?.(sender, 'protection-trigger', 'anti-mention');
        await sock.sendMessage(remoteJid, { text: '⚠️ Mention berlebihan terdeteksi, tindakan perlindungan dijalankan.' });
        const participant = m.key.participant || sender;
        await sock.groupParticipantsUpdate(remoteJid, [`${participant}@s.whatsapp.net`], 'remove');
        return;
      }
    }
  },
};
