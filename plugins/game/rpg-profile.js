export default {
  name: 'RPG Profile',
  intents: ['rpg'],
  alias: ['inventory', 'inventaris', 'mine', 'hunting', 'craft'],
  access: 'free',
  execute: async ({ sock, m, sender, db }) => {
    const profile = db.getRpgProfile(sender);
    const inventory = JSON.parse(profile.inventory || '{}');
    await sock.sendMessage(m.key.remoteJid, {
      text: `RPG Profile:
Gold: ${profile.gold}
XP: ${profile.xp}
Inventory: ${Object.entries(inventory).map(([k, v]) => `${k}: ${v}`).join(', ') || 'Kosong'}
Jobs: ${JSON.parse(profile.jobs || '[]').join(', ') || 'Belum ada'}`,
    });
  },
};
