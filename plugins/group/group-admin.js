export default {
  name: 'Group Admin',
  intents: ['group-admin'],
  alias: ['kick', 'buka grup', 'tutup grup', 'tagall', 'tag all'],
  access: 'admin',
  execute: async ({ sock, message, m, entities }) => {
    if (/kick/i.test(message)) {
      const mention = entities.mention?.replace('@', '') || message.match(/@([0-9]+)/)?.[1];
      if (!mention) return await sock.sendMessage(m.key.remoteJid, { text: 'Tag user yang mau di-kick.' });
      await sock.groupParticipantsUpdate(m.key.remoteJid, [`${mention}@s.whatsapp.net`], 'remove');
      return await sock.sendMessage(m.key.remoteJid, { text: `Selesai kick @${mention}` });
    }
    if (/buka grup/i.test(message)) {
      await sock.groupSettingUpdate(m.key.remoteJid, 'not_announcement');
      return await sock.sendMessage(m.key.remoteJid, { text: 'Grup sudah dibuka, bebas ngomong lagi!' });
    }
    if (/tutup grup/i.test(message)) {
      await sock.groupSettingUpdate(m.key.remoteJid, 'announcement');
      return await sock.sendMessage(m.key.remoteJid, { text: 'Grup ditutup. Hanya admin yang bisa kirim pesan.' });
    }
    if (/tagall/i.test(message) || /tag all/i.test(message)) {
      const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
      const mentions = groupMetadata.participants.map((p) => p.id);
      await sock.sendMessage(m.key.remoteJid, { text: 'Tag semua member!', mentions });
      return;
    }
    await sock.sendMessage(m.key.remoteJid, { text: 'Perintah grup tidak dikenali.' });
  },
};
