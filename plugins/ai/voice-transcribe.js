export default {
  name: 'Voice Transcribe',
  intents: ['voice-transcribe'],
  alias: ['transcribe', 'whisper', 'stt', 'suara jadi teks'],
  access: 'free',
  execute: async ({ sock, m, ai }) => {
    const audio = m.message?.audioMessage || m.message?.voiceMessage;
    if (!audio) {
      return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim voice note dulu cuy.' });
    }
    const buffer = await sock.downloadMediaMessage(m, 'buffer');
    const text = await ai.transcribeVoice({ buffer });
    await sock.sendMessage(m.key.remoteJid, { text: `Hasil transkripsi: ${text}` });
  },
};
