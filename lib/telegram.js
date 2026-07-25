import { Telegraf } from 'telegraf';
import config from '../config.js';

let bot;
let lastHeartbeatAt = 0;
let lastHeartbeatSent = false;

const initTelegram = () => {
  if (!config.telegramBotToken) return null;
  bot = new Telegraf(config.telegramBotToken);
  bot.launch().catch((err) => console.error('Telegram bot gagal launch:', err));
  return bot;
};

const notifyOwner = async (message) => {
  if (!bot) return null;
  const ownerChat = config.ownerTelegram.replace('t.me/', '');
  try {
    return await bot.telegram.sendMessage(ownerChat, message);
  } catch (error) {
    console.error('Telegram notify failed', error);
    return null;
  }
};

const sendHeartbeat = async () => {
  if (!bot) return;
  const now = Date.now();
  if (now - lastHeartbeatAt < 60000) return;
  lastHeartbeatAt = now;
  const uptime = Math.round(process.uptime());
  const message = `🟢 Bot online\nUptime: ${Math.floor(uptime / 60)} menit\nWaktu: ${new Date().toLocaleString('id-ID')}`;
  if (!lastHeartbeatSent) {
    await notifyOwner(message);
    lastHeartbeatSent = true;
    return;
  }
  await notifyOwner(`💡 Heartbeat\n${message}`);
};

const reportError = async (error, context = 'bot') => {
  if (!bot) return;
  const message = `🚨 ${context.toUpperCase()} ERROR\n${error?.message || error}\nWaktu: ${new Date().toLocaleString('id-ID')}`;
  await notifyOwner(message);
};

export default {
  initTelegram,
  notifyOwner,
  sendHeartbeat,
  reportError,
};
