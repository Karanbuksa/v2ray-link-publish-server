import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { mkdirSync } from 'fs';

export class DatabaseManager {
    private db: Database.Database;

    constructor(dbPath: string) {
        // Создаем директорию для БД если её нет
        const dir = join(dbPath, '..');
        try {
            mkdirSync(dir, { recursive: true });
        } catch (err) {
            // Директория уже существует
        }

        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
        this.initialize();
    }

    private initialize() {
        const schema = readFileSync(
            join(__dirname, 'schema.sql'),
            'utf-8'
        );
        this.db.exec(schema);
    }

    getDb(): Database.Database {
        return this.db;
    }

    close() {
        this.db.close();
    }
}

let dbInstance: DatabaseManager | null = null;

export function getDatabase(dbPath?: string): DatabaseManager {
    if (!dbInstance) {
        const path = dbPath || process.env.DATABASE_PATH || './data/database.db';
        dbInstance = new DatabaseManager(path);
    }
    return dbInstance;
}
