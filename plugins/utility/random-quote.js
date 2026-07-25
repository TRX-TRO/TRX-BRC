export default {
  name: 'Random Quote',
  intents: ['utility'],
  alias: ['quote', 'random quote', 'quotes'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const quotes = ['Hidup itu pilihan.', 'Jangan takut mencoba.', 'Kerja keras pangkal sukses.', 'Santuy tapi produktif.', 'Mimpi besar dimulai dari aksi kecil.'];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    await sock.sendMessage(m.key.remoteJid, { text: quote });
  },
};
