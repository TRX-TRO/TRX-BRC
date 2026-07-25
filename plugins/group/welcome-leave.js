export default {
  name: 'Welcome Leave',
  intents: ['group-admin'],
  alias: ['welcome', 'keluar', 'leave'],
  access: 'admin',
  execute: async ({ sock, m }) => {
    const type = m.message?.conversation?.toLowerCase();
    if (/selamat datang|welcome/i.test(type)) {
      return await sock.sendMessage(m.key.remoteJid, { text: 'Selamat datang di grup, semoga betah!' });
    }
    if (/bye|keluar|leave/i.test(type)) {
      return await sock.sendMessage(m.key.remoteJid, { text: 'Selamat jalan, sampai ketemu lagi!' });
    }
    await sock.sendMessage(m.key.remoteJid, { text: 'Perintah welcome/leave tidak dikenali.' });
  },
};
