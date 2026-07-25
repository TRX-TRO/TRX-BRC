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
    const text = message.trim();
    const { intent, entities, confidence } = router.extractIntent(text, isDM);
    await sock.sendPresenceUpdate('composing', m.key.remoteJid);
    const user = db.getUser(sender);

    if (intent === 'registration' && isDM) {
      const name = text.replace(/^(register|daftar|registrasi|nama)/i, '').trim();
      if (!name) {
        await sock.sendMessage(m.key.remoteJid, { text: 'Kirim format: register <nama>' });
        return;
      }
      db.setUserName(sender, name);
      db.setUserStatus(sender, 'pending');
      const ownerNumber = config.ownerNumber?.replace(/\D/g, '') || '';
      if (ownerNumber) {
        await sock.sendMessage(`${ownerNumber}@s.whatsapp.net`, { text: `⚠️ Permintaan akses bot dari ${name} (${sender}).
Balas dengan .confirm ${sender}` });
      }
      await sock.sendMessage(m.key.remoteJid, { text: `Registrasi diterima. Nama: ${name}. Menunggu persetujuan owner.` });
      return;
    }

    if (intent === 'approval' && isDM && user.level === 'owner') {
      const target = text.replace(/^(confirm|konfirmasi|approve|terima)/i, '').trim().replace(/\D/g, '');
      if (!target) {
        await sock.sendMessage(m.key.remoteJid, { text: 'Format: .confirm <nomor>' });
        return;
      }
      const targetUser = db.getUser(`${target}@s.whatsapp.net`);
      db.setUserLevel(`${target}@s.whatsapp.net`, 'free');
      db.setUserStatus(`${target}@s.whatsapp.net`, 'approved');
      await sock.sendMessage(m.key.remoteJid, { text: `User ${target} disetujui.` });
      await sock.sendMessage(`${target}@s.whatsapp.net`, { text: 'Akses Anda telah disetujui. Anda bisa mulai memakai bot.' });
      return;
    }

    if (intent === 'status') {
      const statusText = user.level === 'owner'
        ? 'Status: Owner (tanpa batas)'
        : user.level === 'premium'
          ? 'Status: Premium'
          : user.status === 'approved'
            ? `Status: Approved\nLimit gratis: ${Math.max(0, user.usage_limit - user.usage_count)}/${user.usage_limit}`
            : 'Status: Menunggu approval owner';
      await sock.sendMessage(m.key.remoteJid, { text: statusText });
      return;
    }

    if (intent === 'admin' && (user.level === 'owner' || user.level === 'admin')) {
      const commandText = text.toLowerCase();
      if (commandText.startsWith('reset limit')) {
        const target = commandText.replace('reset limit', '').trim().replace(/\D/g, '');
        if (!target) {
          db.resetUsage();
          await sock.sendMessage(m.key.remoteJid, { text: 'Semua limit gratis user telah di-reset.' });
        } else {
          db.resetUserUsage(`${target}@s.whatsapp.net`);
          await sock.sendMessage(m.key.remoteJid, { text: `Limit user ${target} telah di-reset.` });
        }
        return;
      }

      if (commandText.startsWith('cek user')) {
        const target = commandText.replace('cek user', '').trim().replace(/\D/g, '');
        if (!target) {
          await sock.sendMessage(m.key.remoteJid, { text: 'Format: cek user <nomor>' });
          return;
        }
        const targetUser = db.getUser(`${target}@s.whatsapp.net`);
        const detailText = `User: ${target}\nLevel: ${targetUser.level}\nStatus: ${targetUser.status || 'pending'}\nBanned: ${targetUser.banned ? 'ya' : 'tidak'}\nLimit: ${targetUser.usage_count}/${targetUser.usage_limit}`;
        await sock.sendMessage(m.key.remoteJid, { text: detailText });
        return;
      }

      if (commandText.startsWith('ban ')) {
        const target = commandText.replace('ban ', '').trim().replace(/\D/g, '');
        if (!target) {
          await sock.sendMessage(m.key.remoteJid, { text: 'Format: ban <nomor>' });
          return;
        }
        db.setUserBan(`${target}@s.whatsapp.net`, true);
        await sock.sendMessage(m.key.remoteJid, { text: `User ${target} telah diban.` });
        return;
      }

      if (commandText.startsWith('unban ')) {
        const target = commandText.replace('unban ', '').trim().replace(/\D/g, '');
        if (!target) {
          await sock.sendMessage(m.key.remoteJid, { text: 'Format: unban <nomor>' });
          return;
        }
        db.setUserBan(`${target}@s.whatsapp.net`, false);
        await sock.sendMessage(m.key.remoteJid, { text: `User ${target} telah di-unban.` });
        return;
      }
    }

    if (!db.canUseBot(sender)) {
      const status = user.status || 'pending';
      if (status === 'pending') {
        await sock.sendMessage(m.key.remoteJid, { text: 'Anda belum terdaftar. Kirim register <nama> untuk mendaftar, lalu tunggu owner menyetujui akses.' });
      } else if (user.level === 'free') {
        await sock.sendMessage(m.key.remoteJid, { text: 'Limit gratis Anda sudah habis. Upgrade ke premium untuk akses tanpa batas.' });
      } else {
        await sock.sendMessage(m.key.remoteJid, { text: 'Akses Anda belum disetujui owner.' });
      }
      return;
    }

    const activePlugins = plugins.filter((plugin) => plugin.intents?.includes(intent) || plugin.alias?.includes(intent));
    if (!activePlugins.length) {
      if (intent === 'ai-chat' || isDM) {
        db.incrementUsage(sender);
        const response = await ai.aiChat({ userId: sender, content: text });
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
      if (user.level === 'free' && user.status === 'approved') {
        db.incrementUsage(sender);
        const updatedUser = db.getUser(sender);
        const remaining = Math.max(0, updatedUser.usage_limit - updatedUser.usage_count);
        if (remaining <= 3) {
          await sock.sendMessage(m.key.remoteJid, { text: `⚠️ Sisa limit gratis Anda: ${remaining}/20. Upgrade premium untuk akses tanpa batas.` });
        }
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
