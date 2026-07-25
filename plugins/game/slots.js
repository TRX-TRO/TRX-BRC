export default {
  name: 'Slots',
  intents: ['game'],
  alias: ['slots', 'judi', 'spin'],
  access: 'free',
  execute: async ({ sock, m, sender, db }) => {
    const symbols = ['🍒', '🍋', '🍉', '⭐', '7️⃣'];
    const result = [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]];
    const won = result[0] === result[1] && result[1] === result[2];
    const profile = db.getRpgProfile(sender);
    if (won) {
      db.updateRpgProfile(sender, { gold: profile.gold + 50, xp: profile.xp + 10 });
    } else {
      db.updateRpgProfile(sender, { gold: Math.max(0, profile.gold - 10), xp: profile.xp + 2 });
    }
    await sock.sendMessage(m.key.remoteJid, { text: `Slots: ${result.join(' | ')}\n${won ? 'Menang! +50 gold' : 'Kalah! -10 gold'}` });
  },
};
