import axios from 'axios';

export default {
  name: 'Crypto Price',
  intents: ['utility'],
  alias: ['crypto', 'harga crypto', 'bitcoin'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const asset = m.message?.conversation?.trim() || 'BTC';
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(asset.toLowerCase())}&vs_currencies=idr`, { timeout: 20000 });
    const price = response.data[asset.toLowerCase()]?.idr;
    await sock.sendMessage(m.key.remoteJid, { text: price ? `Harga ${asset.toUpperCase()}: Rp${price}` : 'Tidak dapat menemukan harga aset.' });
  },
};
