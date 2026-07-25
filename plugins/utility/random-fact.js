export default {
  name: 'Random Fact',
  intents: ['utility'],
  alias: ['fact', 'random fact', 'fakta'],
  access: 'free',
  execute: async ({ sock }) => {
    const facts = ['Udara mengandung nitrogen 78%.', 'Otak manusia cukup kuat untuk menghasilkan listrik.', 'Cahaya bulan sebenarnya adalah pantulan matahari.', 'Kucing memiliki 230 tulang.'];
    await sock.sendMessage('status@broadcast', { text: facts[Math.floor(Math.random() * facts.length)] });
  },
};
