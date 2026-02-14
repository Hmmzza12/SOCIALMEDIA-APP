import Database from 'better-sqlite3';
import { resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Create SQLite database file path
const dbPath = resolve(__dirname, '../../database.sqlite');

// Initialize SQLite database
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Test database connection
export const testConnection = () => {
    try {
        const result = db.prepare('SELECT 1').get();
        console.log('✅ Database connected successfully');
        console.log(`📁 Database file: ${dbPath}`);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
};

// Wrapper to make SQLite work like mysql2/promise
export const query = <T = any>(sql: string, params: any[] = []): Promise<[T, any]> => {
    return new Promise((resolve, reject) => {
        try {
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                const stmt = db.prepare(sql);
                const rows = stmt.all(...params) as T;
                resolve([rows, null]);
            } else if (sql.trim().toUpperCase().startsWith('INSERT')) {
                const stmt = db.prepare(sql);
                const result = stmt.run(...params);
                // Format like MySQL result with insertId
                const insertResult = { insertId: result.lastInsertRowid, affectedRows: result.changes } as unknown as T;
                resolve([insertResult, null]);
            } else if (sql.trim().toUpperCase().startsWith('UPDATE') ||
                sql.trim().toUpperCase().startsWith('DELETE')) {
                const stmt = db.prepare(sql);
                const result = stmt.run(...params);
                const updateResult = { affectedRows: result.changes } as unknown as T;
                resolve([updateResult, null]);
            } else {
                db.exec(sql);
                resolve([[] as unknown as T, null]);
            }
        } catch (error) {
            reject(error);
        }
    });
};

// Export db instance for complex operations
export default { query };
