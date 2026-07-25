# Deployment Guide

## Requirements
- Node.js 20+
- npm
- PM2 (optional but recommended)

## Install dependencies
```bash
npm install
```

## Environment variables
Create a `.env` file with:
```env
BOT_NUMBER=your_whatsapp_number
AI_API_KEY=your_ai_api_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_SERVER_KEY=your_midtrans_server_key
PORT=3000
AUTH_MODE=qr
TELEGRAM_BOT_TOKEN=optional
OWNER_TELEGRAM=optional
BACKUP_INTERVAL_MS=3600000
```

## Run with PM2
```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
```

## Health check
```bash
curl http://localhost:3000/healthz
```

## Backup
```bash
curl -X POST http://localhost:3000/backup
```
