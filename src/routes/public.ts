import { Router, Request, Response } from 'express';
import { UserService } from '../services/userService';
import { XUIClient } from '../services/xuiClient';
import { LinkGenerator } from '../services/linkGenerator';
import { DatabaseManager } from '../database/db';

export function createPublicRouter(
    db: DatabaseManager,
    xuiClient: XUIClient
): Router {
    const router = Router();
    const userService = new UserService(db);
    const linkGenerator = new LinkGenerator();

    // Получить конфигурацию пользователя по персональному токену
    router.get('/config/:token', async (req: Request, res: Response) => {
        try {
            const token = req.params.token;
            const user = userService.getUserByToken(token);

            if (!user) {
                return res.status(404).json({ error: 'Invalid token' });
            }

            // Получаем все инбаунды пользователя
            const mappings = userService.getUserInbounds(user.id);

            if (mappings.length === 0) {
                return res.status(404).json({ error: 'No inbounds configured for this user' });
            }

            const links: string[] = [];

            // Генерируем ссылки для каждого инбаунда
            for (const mapping of mappings) {
                try {
                    const inbound = await xuiClient.getInbound(mapping.inbound_id);

                    if (!inbound) {
                        console.warn(`Inbound ${mapping.inbound_id} not found`);
                        continue;
                    }

                    const link = linkGenerator.generateLink(inbound, mapping.client_email);
                    if (link) {
                        links.push(link);
                    }
                } catch (error) {
                    console.error(`Error generating link for inbound ${mapping.inbound_id}:`, error);
                }
            }

            if (links.length === 0) {
                return res.status(500).json({ error: 'Failed to generate any links' });
            }

            res.json({
                user: {
                    username: user.username,
                    email: user.email
                },
                links,
                count: links.length
            });
        } catch (error) {
            console.error('Error in /config/:token:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Получить конфигурацию в виде текста (для импорта в клиент)
    router.get('/config/:token/text', async (req: Request, res: Response) => {
        try {
            const token = req.params.token;
            const user = userService.getUserByToken(token);

            if (!user) {
                return res.status(404).json({ error: 'Invalid token' });
            }

            const mappings = userService.getUserInbounds(user.id);

            if (mappings.length === 0) {
                return res.status(404).json({ error: 'No inbounds configured for this user' });
            }

            const links: string[] = [];

            for (const mapping of mappings) {
                try {
                    const inbound = await xuiClient.getInbound(mapping.inbound_id);

                    if (!inbound) {
                        continue;
                    }

                    const link = linkGenerator.generateLink(inbound, mapping.client_email);
                    if (link) {
                        links.push(link);
                    }
                } catch (error) {
                    console.error(`Error generating link for inbound ${mapping.inbound_id}:`, error);
                }
            }

            if (links.length === 0) {
                return res.status(500).send('Failed to generate any links');
            }

            // Возвращаем ссылки разделенные новой строкой
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.send(links.join('\n'));
        } catch (error) {
            console.error('Error in /config/:token/text:', error);
            res.status(500).send('Internal server error');
        }
    });

    return router;
}
