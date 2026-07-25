import axios from 'axios';

export default {
  name: 'GitHub Stalker',
  intents: ['osint'],
  alias: ['github', 'cek github', 'stalker github'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const username = m.message?.conversation?.trim();
    if (!username) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim username GitHub yang ingin dicari.' });
    const response = await axios.get(`https://api.github.com/users/${username}`, { timeout: 20000 });
    const profile = response.data;
    await sock.sendMessage(m.key.remoteJid, { text: `GitHub: ${profile.login}\nNama: ${profile.name || '-'}\nBio: ${profile.bio || '-'}\nRepos: ${profile.public_repos}\nFollowers: ${profile.followers}` });
  },
};
