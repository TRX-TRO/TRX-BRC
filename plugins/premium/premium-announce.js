import telegram from '../../lib/telegram.js';

export default {
  name: 'Premium Announce',
  intents: ['payment'],
  alias: ['premium announce', 'bayar'],
  access: 'owner',
  execute: async ({ sock, m, sender }) => {
    await sock.sendMessage(m.key.remoteJid, { text: 'Fitur ini hanya untuk owner.' });
    await telegram.notifyOwner(`User ${sender} ingin upgrade premium.`);
  },
};
