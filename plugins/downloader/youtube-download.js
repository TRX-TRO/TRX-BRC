export default {
  name: 'YouTube Downloader',
  intents: ['download'],
  alias: ['youtube', 'unduh', 'download', 'save'],
  access: 'free',
  execute: async ({ sock, m, entities, workerPool }) => {
    const url = entities.url || m.message?.conversation;
    if (!url) return await sock.sendMessage(m.key.remoteJid, { text: 'Kirim link YouTube dulu.' });
    const taskId = `task-${Date.now()}`;
    const result = await workerPool.broadcastTask({ taskId, type: 'downloadMedia', data: { url } });
    if (result?.error) {
      return await sock.sendMessage(m.key.remoteJid, { text: `Gagal download: ${result.error}` });
    }
    await sock.sendMessage(m.key.remoteJid, { text: `Link hasil: ${result.url}
Judul: ${result.title}` });
  },
};
