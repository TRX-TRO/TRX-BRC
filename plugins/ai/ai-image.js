export default {
  name: 'AI Image',
  intents: ['ai-image'],
  alias: ['gambar', 'image', 'buat gambar'],
  access: 'free',
  execute: async ({ sock, m, entities, ai }) => {
    const prompt = entities.prompt || m.message?.conversation || 'TroxzyMD menghasilkan karya keren';
    const imageUrl = await ai.aiImage({ prompt });
    if (!imageUrl) {
      return await sock.sendMessage(m.key.remoteJid, { text: 'Gagal bikin gambar, coba lagi nanti.' });
    }
    await sock.sendMessage(m.key.remoteJid, { image: { url: imageUrl }, caption: `Hasil gambar untuk: ${prompt}` });
  },
};
