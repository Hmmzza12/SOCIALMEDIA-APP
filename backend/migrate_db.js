const Database = require('better-sqlite3');
const path = require('path');

// DB is in the same directory as this script (backend/)
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Migrating database at:', dbPath);

try {
    // Add community_name column
    try {
        db.exec('ALTER TABLE posts ADD COLUMN community_name TEXT');
        console.log('Added community_name column');
    } catch (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('community_name column already exists');
        } else {
            throw err;
        }
    }

    // Add community_icon column
    try {
        db.exec('ALTER TABLE posts ADD COLUMN community_icon TEXT');
        console.log('Added community_icon column');
    } catch (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('community_icon column already exists');
        } else {
            throw err;
        }
    }

    console.log('Migration completed successfully');
} catch (error) {
    console.error('Migration failed:', error);
} finally {
    db.close();
}
