import express from 'express';
import dotenv from 'dotenv';
import { getDatabase } from './database/db';
import { XUIClient } from './services/xuiClient';
import { createAdminRouter } from './routes/admin';
import { createPublicRouter } from './routes/public';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Инициализация БД
const db = getDatabase();
console.log('Database initialized');

// Инициализация клиента 3x-ui
const xuiClient = new XUIClient({
    url: process.env.PANEL_URL || 'http://localhost:2053',
    username: process.env.PANEL_USERNAME || 'admin',
    password: process.env.PANEL_PASSWORD || 'admin'
});

// Авторизация при старте
xuiClient.login()
    .then(success => {
        if (success) {
            console.log('Successfully authenticated with 3x-ui panel');
        } else {
            console.error('Failed to authenticate with 3x-ui panel');
        }
    })
    .catch(error => {
        console.error('Error during authentication:', error);
    });

// Маршруты
app.use('/api/admin', createAdminRouter(db, xuiClient));
app.use('/api', createPublicRouter(db, xuiClient));

// Главная страница
app.get('/', (req, res) => {
    res.json({
        name: 'V2Ray Link Publish Server',
        version: '1.0.0',
        endpoints: {
            admin: {
                users: 'GET /api/admin/users',
                createUser: 'POST /api/admin/users',
                getUser: 'GET /api/admin/users/:id',
                deleteUser: 'DELETE /api/admin/users/:id',
                addInbound: 'POST /api/admin/users/:id/inbounds',
                getUserInbounds: 'GET /api/admin/users/:id/inbounds',
                removeInbound: 'DELETE /api/admin/users/:id/inbounds/:inbound_id',
                listInbounds: 'GET /api/admin/inbounds',
                getInbound: 'GET /api/admin/inbounds/:id'
            },
            public: {
                getConfig: 'GET /api/config/:token',
                getConfigText: 'GET /api/config/:token/text'
            }
        }
    });
});

// Обработка ошибок
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`API documentation: http://localhost:${port}/`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    db.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nShutting down gracefully...');
    db.close();
    process.exit(0);
});
