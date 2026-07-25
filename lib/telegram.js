import { Telegraf } from 'telegraf';
import config from '../config.js';

let bot;

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

export default {
  initTelegram,
  notifyOwner,
};
