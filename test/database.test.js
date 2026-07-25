import test from 'node:test';
import assert from 'node:assert/strict';
import db from '../lib/database.js';

await db.initDatabase();

test('activity logs can be cleared and exported', async () => {
  await db.logActivity('test-user', 'command', 'ping');
  await db.logActivity('test-user', 'register', 'alpha');

  const logs = db.getActivityLogs('test-user', 20);
  assert.ok(logs.length >= 2);

  const exportData = db.exportActivityLogs('test-user');
  assert.equal(exportData.userId, 'test-user');
  assert.ok(exportData.logs.length >= 2);

  db.clearActivityLogs('test-user');
  const cleared = db.getActivityLogs('test-user', 20);
  assert.equal(cleared.length, 0);
});
