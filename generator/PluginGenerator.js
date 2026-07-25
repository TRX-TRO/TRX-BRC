import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categories = {
  facts: { dir: 'generated/facts', count: 390, template: (name, content) => `export default { name: '${name}', intents: ['fact'], alias: ['fact', 'fakta'], access: 'free', execute: async ({ sock, m }) => { await sock.sendMessage(m.key.remoteJid, { text: '${content}' }); } };` },
  quotes: { dir: 'generated/quotes', count: 390, template: (name, content) => `export default { name: '${name}', intents: ['quote'], alias: ['quote', 'quotes'], access: 'free', execute: async ({ sock, m }) => { await sock.sendMessage(m.key.remoteJid, { text: '${content}' }); } };` },
  trivia: { dir: 'generated/trivia', count: 390, template: (name, content) => `export default { name: '${name}', intents: ['trivia'], alias: ['trivia', 'kuis'], access: 'free', execute: async ({ sock, m }) => { await sock.sendMessage(m.key.remoteJid, { text: '${content}' }); } };` },
  miniTools: { dir: 'generated/minitools', count: 390, template: (name, content) => `export default { name: '${name}', intents: ['utility'], alias: ['utility', '${name.toLowerCase()}'], access: 'free', execute: async ({ sock, m }) => { await sock.sendMessage(m.key.remoteJid, { text: '${content}' }); } };` },
  translators: { dir: 'generated/translators', count: 390, template: (name, content) => `export default { name: '${name}', intents: ['utility'], alias: ['translate', '${name.toLowerCase()}'], access: 'free', execute: async ({ sock, m }) => { await sock.sendMessage(m.key.remoteJid, { text: '${content}' }); } };` },
};

const ensureDir = (dir) => {
  const resolved = path.resolve(__dirname, '../plugins', dir);
  if (!fs.existsSync(resolved)) fs.mkdirSync(resolved, { recursive: true });
  return resolved;
};

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const generateContent = (type, index) => {
  if (type === 'facts') return `Fakta ${index}: TroxzyMD adalah bot canggih yang bekerja tanpa prefix.`;
  if (type === 'quotes') return `Quote ${index}: Jangan pernah menyerah, kerja keras dan sedikit ngocol.`;
  if (type === 'trivia') return `Trivia ${index}: Sistem ini mendukung SQLite + LowDB untuk performa lokal.`;
  if (type === 'miniTools') return `Tool ${index}: Ini hanya contoh utilitas mini untuk demo plugin.`;
  if (type === 'translators') return `Translator ${index}: Terjemahan otomatis sedang dikembangkan.`;
  return `Data ${index}`;
};

const main = async () => {
  const pluginBase = path.resolve('../plugins/generated');
  if (!fs.existsSync(pluginBase)) fs.mkdirSync(pluginBase, { recursive: true });
  for (const [key, config] of Object.entries(categories)) {
    const dir = ensureDir(config.dir);
    for (let i = 1; i <= config.count; i += 1) {
      const name = `${key}-${i}`;
      const content = generateContent(key, i);
      const filePath = path.join(dir, `${slugify(name)}.js`);
      fs.writeFileSync(filePath, config.template(name, content), 'utf-8');
    }
  }
  console.log('Generated plugins:', Object.values(categories).reduce((acc, c) => acc + c.count, 0));
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
