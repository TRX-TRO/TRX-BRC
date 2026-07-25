export default {
  name: 'Leaderboard',
  intents: ['game'],
  alias: ['leaderboard', 'papan', 'rank'],
  access: 'free',
  execute: async ({ sock, m, db }) => {
    const players = db.getTopRpgPlayers(5);
    const message = players.length
      ? players.map((row, index) => `${index + 1}. ${row.user_id}: Gold ${row.gold}, XP ${row.xp}`).join('\n')
      : 'Belum ada data leaderboard.';
    await sock.sendMessage(m.key.remoteJid, { text: `Leaderboard:\n${message}` });
  },
};
