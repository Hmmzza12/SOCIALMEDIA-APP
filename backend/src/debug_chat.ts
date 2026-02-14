import Database from 'better-sqlite3';
import { resolve } from 'path';

const dbPath = resolve(__dirname, '../database.sqlite');
const db = new Database(dbPath);

console.log('Checking database tables...');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map((t: any) => t.name));

console.log('\nChecking chat tables content:');
try {
    const conversations = db.prepare('SELECT * FROM conversations').all();
    console.log('Conversations:', conversations);

    const participants = db.prepare('SELECT * FROM conversation_participants').all();
    console.log('Participants:', participants);
} catch (err) {
    console.error('Error querying tables:', err);
}

// Try to simulate create conversation
console.log('\nSimulating Create Conversation logic...');
try {
    const result = db.prepare('INSERT INTO conversations DEFAULT VALUES').run();
    console.log('Insert Result:', result);
    console.log('New ID:', result.lastInsertRowid);
} catch (err) {
    console.error('Insert Failed:', err);
}
