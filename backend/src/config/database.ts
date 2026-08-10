import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL || 'file:./database.sqlite';
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient(
    url.startsWith('file:') ? { url } : { url, authToken }
);

// Test database connection
export const testConnection = async () => {
    try {
        await client.execute('SELECT 1');
        console.log('✅ Database connected successfully');
        console.log(`📁 Database: ${url.startsWith('file:') ? url : 'Turso (remote)'}`);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
};

// Wrapper to keep the mysql2-style [rows, meta] call signature used across all routes
export const query = async <T = any>(sql: string, params: any[] = []): Promise<[T, any]> => {
    const result = await client.execute({ sql, args: params });

    const trimmed = sql.trim().toUpperCase();
    if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA')) {
        return [result.rows as unknown as T, null];
    }
    if (trimmed.startsWith('INSERT')) {
        const insertResult = {
            insertId: Number(result.lastInsertRowid ?? 0),
            affectedRows: result.rowsAffected,
        } as unknown as T;
        return [insertResult, null];
    }
    if (trimmed.startsWith('UPDATE') || trimmed.startsWith('DELETE')) {
        const updateResult = { affectedRows: result.rowsAffected } as unknown as T;
        return [updateResult, null];
    }
    return [[] as unknown as T, null];
};

// Run a raw multi-statement script (used for schema initialization)
export const execScript = async (sql: string): Promise<void> => {
    const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);
    for (const statement of statements) {
        await client.execute(statement);
    }
};

export default { query };
