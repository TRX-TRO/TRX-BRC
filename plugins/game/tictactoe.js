export default {
  name: 'TicTacToe',
  intents: ['game'],
  alias: ['tictactoe', 'xo', 'game'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const buttons = [
      { buttonId: 'ttt_start', buttonText: { displayText: 'Mulai TicTacToe' }, type: 1 },
    ];
    await sock.sendMessage(m.key.remoteJid, { text: 'Main TicTacToe! Pilih tombol berikut untuk mulai.', buttons, headerType: 1 });
  },
};
