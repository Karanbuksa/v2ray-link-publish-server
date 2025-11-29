import { v4 as uuidv4 } from 'uuid';
import { DatabaseManager } from '../database/db';
import { User, UserInboundMapping } from '../types';

export class UserService {
    constructor(private db: DatabaseManager) {}

    createUser(username: string, email: string): User {
        const personalToken = uuidv4();
        const stmt = this.db.getDb().prepare(`
            INSERT INTO users (username, email, personal_token)
            VALUES (?, ?, ?)
        `);

        const result = stmt.run(username, email, personalToken);

        return this.getUserById(result.lastInsertRowid as number)!;
    }

    getUserById(id: number): User | null {
        const stmt = this.db.getDb().prepare(`
            SELECT * FROM users WHERE id = ?
        `);
        return stmt.get(id) as User | null;
    }

    getUserByToken(token: string): User | null {
        const stmt = this.db.getDb().prepare(`
            SELECT * FROM users WHERE personal_token = ?
        `);
        return stmt.get(token) as User | null;
    }

    getUserByEmail(email: string): User | null {
        const stmt = this.db.getDb().prepare(`
            SELECT * FROM users WHERE email = ?
        `);
        return stmt.get(email) as User | null;
    }

    getAllUsers(): User[] {
        const stmt = this.db.getDb().prepare(`
            SELECT * FROM users ORDER BY created_at DESC
        `);
        return stmt.all() as User[];
    }

    addInboundMapping(userId: number, inboundId: number, clientEmail: string): UserInboundMapping {
        const stmt = this.db.getDb().prepare(`
            INSERT OR IGNORE INTO user_inbound_mappings (user_id, inbound_id, client_email)
            VALUES (?, ?, ?)
        `);

        stmt.run(userId, inboundId, clientEmail);

        const selectStmt = this.db.getDb().prepare(`
            SELECT * FROM user_inbound_mappings
            WHERE user_id = ? AND inbound_id = ? AND client_email = ?
        `);

        return selectStmt.get(userId, inboundId, clientEmail) as UserInboundMapping;
    }

    getUserInbounds(userId: number): UserInboundMapping[] {
        const stmt = this.db.getDb().prepare(`
            SELECT * FROM user_inbound_mappings WHERE user_id = ?
        `);
        return stmt.all(userId) as UserInboundMapping[];
    }

    removeInboundMapping(userId: number, inboundId: number): void {
        const stmt = this.db.getDb().prepare(`
            DELETE FROM user_inbound_mappings
            WHERE user_id = ? AND inbound_id = ?
        `);
        stmt.run(userId, inboundId);
    }

    deleteUser(id: number): void {
        const stmt = this.db.getDb().prepare(`
            DELETE FROM users WHERE id = ?
        `);
        stmt.run(id);
    }
}
