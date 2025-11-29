# V2Ray Link Publish Server

Сервер для публикации персональных V2Ray ссылок пользователям, интегрированный с 3x-ui панелью.

## Основная идея

При изменении конфигурации инбаунда в 3x-ui панели обычно требуется обновлять ссылки у всех пользователей. Этот сервер решает эту проблему:

- Каждый пользователь получает персональный токен
- По токену пользователь всегда получает актуальную конфигурацию
- При изменении инбаунда в 3x-ui, ссылки обновляются автоматически
- Не нужно вручную распространять новые ссылки

## Возможности

- Интеграция с 3x-ui панелью через API
- Автоматическое получение инбаундов из 3x-ui
- Генерация персональных ссылок для пользователей
- Поддержка протоколов: VMess, VLESS, Trojan, Shadowsocks
- API для управления пользователями
- Персональные токены для каждого пользователя

## Установка

### Требования

- Node.js 18+
- npm или yarn
- Доступ к серверу с 3x-ui панелью

### Шаги установки

1. Клонируйте репозиторий:
```bash
git clone <url>
cd new-v2ray-link-publish-server
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env`:
```bash
cp .env.example .env
```

4. Настройте `.env`:
```env
PORT=3000
NODE_ENV=production

# Настройки 3x-ui панели
PANEL_URL=http://your-server-ip:2053
PANEL_USERNAME=admin
PANEL_PASSWORD=your-password

# Публичный адрес сервера (для генерации ссылок)
SERVER_HOSTNAME=your-domain.com

# База данных
DATABASE_PATH=./data/database.db

# Безопасность
JWT_SECRET=your-random-secret-key
API_KEY=your-admin-api-key
```

5. Соберите проект:
```bash
npm run build
```

6. Запустите сервер:
```bash
npm start
```

Для разработки:
```bash
npm run dev
```

## Использование

### API Endpoints

#### Публичные эндпоинты

**Получить конфигурацию пользователя (JSON)**
```
GET /api/config/:token
```

Пример ответа:
```json
{
  "user": {
    "username": "john",
    "email": "john@example.com"
  },
  "links": [
    "vless://uuid@server:port?type=ws&security=tls#config1",
    "vmess://base64config"
  ],
  "count": 2
}
```

**Получить конфигурацию (текстовый формат)**
```
GET /api/config/:token/text
```

Возвращает ссылки разделенные переносом строки (для импорта в клиент).

#### Админские эндпоинты

Все админские эндпоинты требуют заголовок: `X-API-Key: your-api-key`

**Создать пользователя**
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "email": "john@example.com"}'
```

Ответ содержит `personal_token` - сохраните его!

**Получить список пользователей**
```bash
curl http://localhost:3000/api/admin/users \
  -H "X-API-Key: your-api-key"
```

**Получить список инбаундов из 3x-ui**
```bash
curl http://localhost:3000/api/admin/inbounds \
  -H "X-API-Key: your-api-key"
```

**Привязать инбаунд к пользователю**
```bash
curl -X POST http://localhost:3000/api/admin/users/1/inbounds \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "inbound_id": 1,
    "client_email": "user@example.com"
  }'
```

**Получить инбаунды пользователя**
```bash
curl http://localhost:3000/api/admin/users/1/inbounds \
  -H "X-API-Key: your-api-key"
```

**Удалить привязку инбаунда**
```bash
curl -X DELETE http://localhost:3000/api/admin/users/1/inbounds/1 \
  -H "X-API-Key: your-api-key"
```

**Удалить пользователя**
```bash
curl -X DELETE http://localhost:3000/api/admin/users/1 \
  -H "X-API-Key: your-api-key"
```

## Пример использования

### 1. Создание пользователя

```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "email": "alice@example.com"}'
```

Ответ:
```json
{
  "user": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com",
    "personal_token": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-01 12:00:00"
  }
}
```

### 2. Привязка инбаунда к пользователю

Сначала узнайте ID инбаундов:
```bash
curl http://localhost:3000/api/admin/inbounds \
  -H "X-API-Key: your-api-key"
```

Затем привяжите:
```bash
curl -X POST http://localhost:3000/api/admin/users/1/inbounds \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "inbound_id": 1,
    "client_email": "alice@example.com"
  }'
```

### 3. Получение конфигурации пользователем

Отправьте пользователю ссылку:
```
http://your-server:3000/api/config/550e8400-e29b-41d4-a716-446655440000
```

Или для текстового формата (удобно для импорта):
```
http://your-server:3000/api/config/550e8400-e29b-41d4-a716-446655440000/text
```

## Структура проекта

```
├── src/
│   ├── database/
│   │   ├── db.ts              # Менеджер базы данных
│   │   └── schema.sql         # SQL схема
│   ├── routes/
│   │   ├── admin.ts           # Админские маршруты
│   │   └── public.ts          # Публичные маршруты
│   ├── services/
│   │   ├── xuiClient.ts       # Клиент для 3x-ui API
│   │   ├── userService.ts     # Сервис работы с пользователями
│   │   └── linkGenerator.ts   # Генератор V2Ray ссылок
│   ├── types/
│   │   └── index.ts           # TypeScript типы
│   └── index.ts               # Главный файл
├── data/                       # База данных (создается автоматически)
├── package.json
├── tsconfig.json
└── .env                        # Конфигурация
```

## Безопасность

- Храните `.env` в безопасности
- Используйте сложные API ключи
- Настройте firewall для ограничения доступа к админским эндпоинтам
- Используйте HTTPS в продакшене
- Регулярно обновляйте зависимости

## Развертывание в продакшене

### С использованием PM2

```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name v2ray-publish-server
pm2 save
pm2 startup
```

### С использованием systemd

Создайте файл `/etc/systemd/system/v2ray-publish.service`:

```ini
[Unit]
Description=V2Ray Link Publish Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/new-v2ray-link-publish-server
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Затем:
```bash
sudo systemctl enable v2ray-publish
sudo systemctl start v2ray-publish
```

## Поддерживаемые протоколы

- ✅ VMess
- ✅ VLESS
- ✅ Trojan
- ✅ Shadowsocks

## Лицензия

MIT

## Важное замечание

Этот проект предназначен только для личного использования. Не используйте его для незаконных целей.
