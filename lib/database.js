import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import config from '../config.js';

const dataDir = path.resolve('./data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const sqlite = new Database(path.resolve(config.dbPath));
const lowAdapter = new JSONFile(path.resolve(config.lowdbPath));
const lowdb = new Low(lowAdapter, { sessions: {}, stats: { totalUsers: 0, premiumUsers: 0, commandsToday: 0, lastReset: Date.now(), uptimeStart: Date.now() }, payments: {} });

const initSql = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      level TEXT DEFAULT 'free',
      premium_expires INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      usage_count INTEGER DEFAULT 0,
      usage_limit INTEGER DEFAULT 20,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS payments (
      order_id TEXT PRIMARY KEY,
      user_id TEXT,
      tier TEXT,
      amount INTEGER,
      status TEXT,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS rpg_profiles (
      user_id TEXT PRIMARY KEY,
      inventory TEXT DEFAULT '{}',
      gold INTEGER DEFAULT 100,
      xp INTEGER DEFAULT 0,
      jobs TEXT DEFAULT '[]',
      updated_at INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS analytics (
      key TEXT PRIMARY KEY,
      value INTEGER DEFAULT 0
    );
  `);
};

const initLowDb = async () => {
  await lowdb.read();
  lowdb.data ||= { sessions: {}, stats: { totalUsers: 0, premiumUsers: 0, commandsToday: 0, lastReset: Date.now(), uptimeStart: Date.now() }, payments: {} };
  await lowdb.write();
};

const getUser = (id) => {
  let row = sqlite.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (row) return row;
  sqlite.prepare('INSERT OR IGNORE INTO users (id, level) VALUES (?, ?)').run(id, 'free');
  row = sqlite.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (row) {
    lowdb.data.stats.totalUsers = (lowdb.data.stats.totalUsers || 0) + 1;
    void lowdb.write();
  }
  return row;
};

const setUserLevel = (id, level) => {
  sqlite.prepare('UPDATE users SET level = ? WHERE id = ?').run(level, id);
};

const setUserName = (id, name) => {
  sqlite.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, id);
};

const setUserStatus = (id, status) => {
  sqlite.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
};

const incrementUsage = (id) => {
  sqlite.prepare('UPDATE users SET usage_count = usage_count + 1 WHERE id = ?').run(id);
};

const resetUsage = () => {
  sqlite.prepare('UPDATE users SET usage_count = 0 WHERE level = ?').run('free');
};

const resetUserUsage = (id) => {
  sqlite.prepare('UPDATE users SET usage_count = 0 WHERE id = ?').run(id);
};

const canUseBot = (id) => {
  const user = sqlite.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!user) return false;
  if (user.level === 'owner' || user.level === 'admin' || user.level === 'premium') return true;
  if (user.status !== 'approved') return false;
  return user.usage_count < user.usage_limit;
};

const setPremiumExpiry = (id, expiresAt) => {
  sqlite.prepare('UPDATE users SET premium_expires = ? WHERE id = ?').run(expiresAt, id);
};

const savePayment = (payment) => {
  sqlite.prepare('INSERT OR REPLACE INTO payments (order_id, user_id, tier, amount, status) VALUES (?, ?, ?, ?, ?)').run(payment.order_id, payment.user_id, payment.tier, payment.amount, payment.status);
};

const getPayment = (orderId) => sqlite.prepare('SELECT * FROM payments WHERE order_id = ?').get(orderId);

const ensureRpg = (userId) => {
  const exists = sqlite.prepare('SELECT 1 FROM rpg_profiles WHERE user_id = ?').get(userId);
  if (!exists) sqlite.prepare('INSERT INTO rpg_profiles (user_id, inventory, jobs) VALUES (?, ?, ?)').run(userId, JSON.stringify({}), JSON.stringify([]));
};

const getRpgProfile = (userId) => {
  ensureRpg(userId);
  return sqlite.prepare('SELECT * FROM rpg_profiles WHERE user_id = ?').get(userId);
};

const updateRpgProfile = (userId, data) => {
  const profile = getRpgProfile(userId);
  const inventory = JSON.stringify(data.inventory ?? JSON.parse(profile.inventory));
  const jobs = JSON.stringify(data.jobs ?? JSON.parse(profile.jobs));
  sqlite.prepare('UPDATE rpg_profiles SET inventory = ?, gold = ?, xp = ?, jobs = ?, updated_at = strftime(\'%s\',\'now\') WHERE user_id = ?').run(inventory, data.gold ?? profile.gold, data.xp ?? profile.xp, jobs, userId);
};

const getTopRpgPlayers = (limit = 5) => {
  return sqlite.prepare('SELECT user_id, gold, xp FROM rpg_profiles ORDER BY gold DESC LIMIT ?').all(limit);
};

const incrementStat = async (key, amount = 1) => {
  lowdb.data.stats[key] = (lowdb.data.stats[key] || 0) + amount;
  await lowdb.write();
};

const getStats = () => ({
  totalUsers: lowdb.data.stats.totalUsers,
  premiumUsers: lowdb.data.stats.premiumUsers,
  commandsToday: lowdb.data.stats.commandsToday,
  uptimeStart: lowdb.data.stats.uptimeStart,
});

const getState = () => lowdb.data;

const setState = async (path, value) => {
  const parts = path.split('.');
  let current = lowdb.data;
  for (let i = 0; i < parts.length - 1; i += 1) {
    current[parts[i]] ||= {};
    current = current[parts[i]];
  }
  current[parts.at(-1)] = value;
  await lowdb.write();
};

const initDatabase = async () => {
  initSql();
  await initLowDb();
};

export default {
  initDatabase,
  getUser,
  setUserLevel,
  setUserName,
  setUserStatus,
  incrementUsage,
  resetUsage,
  resetUserUsage,
  canUseBot,
  setPremiumExpiry,
  savePayment,
  getPayment,
  getRpgProfile,
  updateRpgProfile,
  incrementStat,
  getStats,
  getState,
  setState,
};
