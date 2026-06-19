import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const FILE = join(DATA_DIR, 'qa_conversations.json');

function ensure() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(FILE)) writeFileSync(FILE, JSON.stringify({ snapshots: [] }, null, 2), 'utf8');
}

function readAll() {
  ensure();
  try {
    const data = JSON.parse(readFileSync(FILE, 'utf8'));
    if (!Array.isArray(data.snapshots)) data.snapshots = [];
    return data;
  } catch (_) {
    return { snapshots: [] };
  }
}

function writeAll(db) {
  ensure();
  writeFileSync(FILE, JSON.stringify(db, null, 2), 'utf8');
}

export function appendSnapshot({ userId, id, title, messages, event }) {
  const db = readAll();
  db.snapshots.push({
    userId: String(userId || ''),
    id: String(id || ''),
    title: String(title || ''),
    messages: Array.isArray(messages) ? messages : [],
    event: String(event || 'update'),
    timestamp: new Date().toISOString()
  });
  writeAll(db);
}