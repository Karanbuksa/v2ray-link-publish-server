import { Router, Request, Response } from 'express';
import { UserService } from '../services/userService';
import { XUIClient } from '../services/xuiClient';
import { DatabaseManager } from '../database/db';

export function createAdminRouter(
    db: DatabaseManager,
    xuiClient: XUIClient
): Router {
    const router = Router();
    const userService = new UserService(db);

    // Middleware для проверки API ключа
    router.use((req: Request, res: Response, next) => {
        const apiKey = req.header('X-API-Key');
        if (apiKey !== process.env.API_KEY) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
    });

    // Получить всех пользователей
    router.get('/users', (req: Request, res: Response) => {
        try {
            const users = userService.getAllUsers();
            res.json({ users });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    });

    // Создать нового пользователя
    router.post('/users', (req: Request, res: Response) => {
        try {
            const { username, email } = req.body;

            if (!username || !email) {
                return res.status(400).json({ error: 'Username and email are required' });
            }

            const user = userService.createUser(username, email);
            res.status(201).json({ user });
        } catch (error: any) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                return res.status(400).json({ error: 'User already exists' });
            }
            res.status(500).json({ error: 'Failed to create user' });
        }
    });

    // Получить пользователя по ID
    router.get('/users/:id', (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const user = userService.getUserById(id);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ user });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch user' });
        }
    });

    // Обновить пользователя
    router.put('/users/:id', (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const { username, email } = req.body;

            if (!username || !email) {
                return res.status(400).json({ error: 'Username and email are required' });
            }

            const user = userService.updateUser(id, username, email);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ user });
        } catch (error: any) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                return res.status(400).json({ error: 'Username or email already exists' });
            }
            res.status(500).json({ error: 'Failed to update user' });
        }
    });

    // Удалить пользователя
    router.delete('/users/:id', (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            userService.deleteUser(id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete user' });
        }
    });

    // Привязать инбаунд к пользователю
    router.post('/users/:id/inbounds', (req: Request, res: Response) => {
        try {
            const userId = parseInt(req.params.id);
            const { inbound_id, client_email } = req.body;

            if (!inbound_id || !client_email) {
                return res.status(400).json({ error: 'inbound_id and client_email are required' });
            }

            const mapping = userService.addInboundMapping(userId, inbound_id, client_email);
            res.status(201).json({ mapping });
        } catch (error) {
            res.status(500).json({ error: 'Failed to add inbound mapping' });
        }
    });

    // Получить инбаунды пользователя
    router.get('/users/:id/inbounds', (req: Request, res: Response) => {
        try {
            const userId = parseInt(req.params.id);
            const mappings = userService.getUserInbounds(userId);
            res.json({ inbounds: mappings });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch user inbounds' });
        }
    });

    // Удалить привязку инбаунда
    router.delete('/users/:id/inbounds/:inbound_id', (req: Request, res: Response) => {
        try {
            const userId = parseInt(req.params.id);
            const inboundId = parseInt(req.params.inbound_id);

            userService.removeInboundMapping(userId, inboundId);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to remove inbound mapping' });
        }
    });

    // Получить список всех инбаундов из 3x-ui
    router.get('/inbounds', async (req: Request, res: Response) => {
        try {
            const inbounds = await xuiClient.getInbounds();
            res.json({ inbounds });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch inbounds from panel' });
        }
    });

    // Получить конкретный инбаунд
    router.get('/inbounds/:id', async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const inbound = await xuiClient.getInbound(id);

            if (!inbound) {
                return res.status(404).json({ error: 'Inbound not found' });
            }

            res.json({ inbound });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch inbound' });
        }
    });

    return router;
}
