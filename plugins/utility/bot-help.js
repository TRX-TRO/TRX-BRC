export default {
  name: 'Help',
  intents: ['help'],
  alias: ['help', 'bantuan', 'menu', 'perintah'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const helpText = `TroxzyMD Help:\n- troxzy mau beli premium\n- troxzy download tiktok <link>\n- bot bikin sticker\n- troxzy image <deskripsi>\n- troxzy voice transcribe\n- troxzy cek profile\n- troxzy game\n- troxzy status premium`;
    await sock.sendMessage(m.key.remoteJid, { text: helpText });
  },
};
