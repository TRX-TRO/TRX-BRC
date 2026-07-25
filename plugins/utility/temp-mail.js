import axios from 'axios';

export default {
  name: 'Temp Mail',
  intents: ['utility'],
  alias: ['temp mail', 'email sementara', 'mail sementara'],
  access: 'free',
  execute: async ({ sock, m }) => {
    const username = `troxzy${Date.now()}`;
    const domain = '1secmail.com';
    await sock.sendMessage(m.key.remoteJid, { text: `Email sementara kamu: ${username}@${domain}` });
  },
};
