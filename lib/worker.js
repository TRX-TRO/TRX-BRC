import { Worker } from 'worker_threads';
import os from 'os';
import path from 'path';

const workerCount = Math.max(1, Number(process.env.CLUSTER_WORKERS || os.cpus().length));
const workers = new Map();

const createWorker = (id) => {
  const worker = new Worker(path.resolve('./lib/worker-task.js'), { workerData: { id } });
  worker.on('message', (message) => {
    if (message.type === 'ready') {
      workers.set(id, worker);
    }
  });
  worker.on('error', (error) => {
    console.error(`[Worker ${id}] Error`, error);
    restartWorker(id);
  });
  worker.on('exit', (code) => {
    if (code !== 0) {
      console.warn(`[Worker ${id}] Exited with ${code}. Restarting.`);
      restartWorker(id);
    }
  });
  return worker;
};

const restartWorker = (id) => {
  if (workers.has(id)) {
    workers.get(id).terminate().catch(() => {});
    workers.delete(id);
  }
  setTimeout(() => createWorker(id), 2000 + Math.random() * 3000);
};

const initWorkers = () => {
  for (let i = 0; i < workerCount; i += 1) {
    createWorker(`worker-${i}`);
  }
};

const broadcastTask = (payload) => {
  const available = Array.from(workers.values());
  const selected = available[Math.floor(Math.random() * available.length)];
  if (!selected) return Promise.reject(new Error('No worker available'));
  return new Promise((resolve, reject) => {
    const onMessage = (message) => {
      if (message.id === payload.taskId) {
        selected.off('message', onMessage);
        resolve(message.result);
      }
    };
    selected.on('message', onMessage);
    selected.postMessage(payload);
    setTimeout(() => {
      selected.off('message', onMessage);
      reject(new Error('Worker timeout'));
    }, 30000);
  });
};

export default {
  initWorkers,
  broadcastTask,
};
