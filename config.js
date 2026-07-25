import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const env = process.env;

const requiredKeys = ['BOT_NUMBER', 'AI_API_KEY', 'MIDTRANS_CLIENT_KEY', 'MIDTRANS_SERVER_KEY'];
const missing = requiredKeys.filter((key) => !env[key]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const config = {
  botName: env.BOT_NAME || 'TroxzyMD',
  ownerName: env.OWNER_NAME || 'Troxzy',
  ownerTelegram: env.OWNER_TELEGRAM || 't.me/SoloBanNoTrash',
  ownerNumber: env.BOT_NUMBER,
  aiBaseUrl: env.AI_BASE_URL || 'https://api.freetheai.xyz/v1',
  aiApiKey: env.AI_API_KEY,
  midtransClientKey: env.MIDTRANS_CLIENT_KEY,
  midtransServerKey: env.MIDTRANS_SERVER_KEY,
  port: Number(env.PORT || 3000),
  sessionPath: env.SESSION_PATH || './sessions',
  dbPath: env.DB_PATH || './data/troxzymd.db',
  lowdbPath: env.LOWDB_PATH || './data/state.json',
  telegramBotToken: env.TELEGRAM_BOT_TOKEN || '',
  wakeWords: ['troxzy', 'bot', 'zxy'],
  logLevel: env.LOG_LEVEL || 'info',
  clusterWorkers: Number(env.CLUSTER_WORKERS || 1),
  authMode: (env.AUTH_MODE || 'qr').toLowerCase(),
};

export default config;
