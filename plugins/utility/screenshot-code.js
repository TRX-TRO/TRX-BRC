export default {
  name: 'Code Screenshot',
  intents: ['utility'],
  alias: ['code screenshot', 'code image', 'carbon code'],
  access: 'free',
  execute: async ({ sock, m }) => {
    await sock.sendMessage(m.key.remoteJid, { text: 'Fitur carbon code berjalan. Kirim kode untuk dijadikan gambar.' });
  },
};
