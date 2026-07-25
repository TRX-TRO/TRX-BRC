# TRX-BRC

TRX-BRC is a WhatsApp bot project built with Node.js and the Baileys library. It supports AI features, downloader plugins, premium access, group management, games, utilities, and a simple HTTP dashboard.

## ✨ Features

- WhatsApp bot with Baileys
- QR code and pairing code authentication support
- AI chat and AI-powered utilities
- Downloader plugins for media platforms
- Premium and owner access control
- Group moderation tools
- Games and entertainment plugins
- Express-based health and stats endpoints
- SQLite + JSON state persistence

## 🧰 Tech Stack

- Node.js
- Express
- Baileys
- SQLite via better-sqlite3
- LowDB for state storage
- Pino logging
- Midtrans integration
- Telegram integration

## 📦 Installation

1. Clone the repository
   ```bash
   git clone https://github.com/TRX-TRO/TRX-BRC.git
   cd TRX-BRC
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
   Create a `.env` file with the required values:

   ```env
   BOT_NUMBER=your_whatsapp_number
   AI_API_KEY=your_ai_api_key
   MIDTRANS_CLIENT_KEY=your_midtrans_client_key
   MIDTRANS_SERVER_KEY=your_midtrans_server_key
   PORT=3000
   AUTH_MODE=qr
   ```

   Supported `AUTH_MODE` values:
   - `qr`
   - `pairing`

## ▶️ Running the Bot

Start the application:

```bash
npm start
```

Or use the provided shell script:

```bash
bash start.sh
```

## 🗂 Project Structure

```text
config.js
index.js
lib/
plugins/
data/
public/
```

## 🔐 Notes

- Keep your `.env` file private.
- Session files are stored under the `sessions` folder.
- Bot data is stored in `data/`.
- Protection features such as anti-report, anti-kenon, anti-banned, anti-link, and anti-spam are available through the group protection plugin.

## 📄 License

This project is provided as-is for educational and development purposes.
