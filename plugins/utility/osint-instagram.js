import axios from 'axios';

export default {
  name: 'Instagram Stalker',
  intents: ['osint'],
  alias: ['instagram', 'cek instagram', 'stalker instagram'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const username = m.message?.conversation?.trim();
    if (!username) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim username Instagram yang ingin dicari.' });
    const response = await axios.get(`https://www.instagram.com/${username}/?__a=1`, { timeout: 20000 });
    const data = response.data.graphql.user;
    await sock.sendMessage(m.key.remoteJid, { text: `Instagram: ${data.username}\nNama: ${data.full_name}\nFollowers: ${data.edge_followed_by.count}\nFollowing: ${data.edge_follow.count}` });
  },
};
