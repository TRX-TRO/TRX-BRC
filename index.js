import cluster from 'cluster';
import os from 'os';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import P from 'pino';
import qrcode from 'qrcode';
import config from './config.js';
import db from './lib/database.js';
import router from './lib/router.js';
import payment from './lib/payment.js';
import ai from './lib/ai.js';
import workerPool from './lib/worker.js';
import telegram from './lib/telegram.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startExpress = () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/health', (req, res) => {
    const mem = process.memoryUsage();
    res.json({ status: 'online', uptime: process.uptime(), memory: `${Math.round(mem.heapUsed / 1024 / 1024)}MB` });
  });

  app.post('/webhook', payment.midtransWebhookHandler);

  app.get('/stats', async (req, res) => {
    const stats = db.getStats();
    res.json({ ...stats, uptime: process.uptime() });
  });

  const startServer = (port) => {
    const server = app.listen(port, () => console.log(`Express listening on port ${port}`));
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} already in use. Trying ${port + 1}...`);
        startServer(port + 1);
        return;
      }
      console.error('Express server error', err);
    });
  };

  startServer(config.port);
};

const loadPlugins = async () => {
  const pluginDirs = ['ai', 'downloader', 'group', 'game', 'utility', 'premium', 'owner', 'generated'];
  const plugins = [];
  for (const dir of pluginDirs) {
    const pluginPath = path.join(__dirname, 'plugins', dir);
    if (!fs.existsSync(pluginPath)) continue;
    for (const file of fs.readdirSync(pluginPath).filter((f) => f.endsWith('.js'))) {
      try {
        const plugin = await import(`./plugins/${dir}/${file}?update=${Date.now()}`);
        if (plugin.default) plugins.push(plugin.default);
      } catch (error) {
        console.error('Gagal memuat plugin', file, error);
      }
    }
  }
  return plugins;
};

const watchPlugins = async (onReload) => {
  const chokidar = await import('chokidar');
  const watcher = chokidar.watch(path.join(__dirname, 'plugins'), { ignoreInitial: true, depth: 4 });
  watcher.on('all', async () => {
    console.log('Plugin berubah. Reload plugin...');
    await onReload();
  });
};

const handleMessage = async (sock, m, plugins) => {
  try {
    const message = m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || '';
    const isDM = m.key.remoteJid && m.key.remoteJid.endsWith('@s.whatsapp.net');
    const sender = m.key.participant || m.key.remoteJid;
    const { intent, entities, confidence } = router.extractIntent(message, isDM);
    await sock.sendPresenceUpdate('composing', m.key.remoteJid);
    const user = db.getUser(sender);
    const activePlugins = plugins.filter((plugin) => plugin.intents?.includes(intent) || plugin.alias?.includes(intent));
    if (!activePlugins.length) {
      if (intent === 'ai-chat' || isDM) {
        const response = await ai.aiChat({ userId: sender, content: message });
        await sock.sendMessage(m.key.remoteJid, { text: response });
        return;
      }
      await sock.sendMessage(m.key.remoteJid, { text: 'Ketik troxzy bant~an kalau butuh help, cuy.' });
      return;
    }
    for (const plugin of activePlugins) {
      if (!router.checkAccess(user.level, plugin.access || 'free')) {
        await sock.sendMessage(m.key.remoteJid, { text: router.accessReply(plugin.access) });
        continue;
      }
      await plugin.execute({ sock, message, m, sender, entities, db, ai, payment, workerPool, config });
    }
  } catch (error) {
    console.error('handleMessage error', error);
  }
};

const startBot = async () => {
  await db.initDatabase();
  workerPool.initWorkers();
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionPath);
  const logger = P({ level: config.logLevel });
  const sock = makeWASocket({
    auth: state,
    logger,
    browser: ['TroxzyMD', 'Chrome', '1.0'],
    printQRInTerminal: config.authMode === 'qr',
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr, pairingCode } = update;
    if (qr && config.authMode === 'qr') {
      try {
        const qrString = await qrcode.toString(qr, { type: 'terminal', small: true });
        console.log(qrString);
      } catch (err) {
        console.log('QR code failed to render in terminal', err.message);
      }
    }

    if (pairingCode && config.authMode === 'pairing') {
      console.log('Pairing code:', pairingCode);
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.warn('Connection closed', reason);
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        setTimeout(startBot, 5000);
      }
    }
    if (connection === 'open') {
      console.log('WhatsApp connected');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  let plugins = await loadPlugins();
  watchPlugins(async () => { plugins = await loadPlugins(); });
  telegram.initTelegram();

  sock.ev.on('messages.upsert', async (update) => {
    if (!update.messages?.length) return;
    for (const msg of update.messages) {
      if (msg.key.fromMe || !msg.message) continue;
      await handleMessage(sock, msg, plugins);
    }
  });
};

if (cluster.isPrimary) {
  const maxWorkers = Math.max(1, config.clusterWorkers);
  console.log(`Master berjalan dengan ${maxWorkers} worker`);
  for (let i = 0; i < maxWorkers; i += 1) {
    const worker = cluster.fork();
    worker.on('exit', (code) => {
      console.warn(`Worker ${worker.process.pid} mati, restart...`);
      cluster.fork();
    });
  }
  startExpress();
} else {
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception', err);
    process.exit(1);
  });
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection', err);
  });
  startBot();
}
