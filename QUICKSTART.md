# Быстрый старт (Windows)

## Шаг 1: Установка зависимостей

Убедитесь, что у вас установлен Node.js (версия 18 или выше).

Откройте терминал (PowerShell или CMD) в папке проекта и выполните:

```bash
npm install
```

## Шаг 2: Настройка окружения

Создайте файл `.env` из примера:

```bash
copy .env.example .env
```

Откройте `.env` в текстовом редакторе и настройте параметры:

```env
PORT=3000
NODE_ENV=development

# Адрес вашей 3x-ui панели
PANEL_URL=http://your-server-ip:2053
PANEL_USERNAME=admin
PANEL_PASSWORD=your-password

# Публичный адрес вашего сервера (для генерации ссылок)
SERVER_HOSTNAME=your-domain.com

DATABASE_PATH=./data/database.db

# ВАЖНО: Измените эти ключи на свои!
JWT_SECRET=generate-random-secret-here
API_KEY=generate-random-api-key-here
```

## Шаг 3: Запуск сервера

### Режим разработки (с автоперезагрузкой)

```bash
npm run dev
```

### Режим продакшена

Сначала соберите проект:
```bash
npm run build
```

Затем запустите:
```bash
npm start
```

## Шаг 4: Проверка работоспособности

Откройте браузер и перейдите по адресу: http://localhost:3000

Вы должны увидеть JSON с информацией о доступных API endpoints.

## Шаг 5: Создание первого пользователя

### Вариант 1: Используя готовый скрипт

Отредактируйте `scripts\create-user.bat` - укажите ваш API_KEY из `.env`

Затем выполните:
```bash
scripts\create-user.bat alice alice@example.com
```

### Вариант 2: Используя curl напрямую

```bash
curl -X POST http://localhost:3000/api/admin/users ^
  -H "X-API-Key: ваш-api-key" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"alice\", \"email\": \"alice@example.com\"}"
```

**Важно!** Сохраните `personal_token` из ответа - это персональная ссылка пользователя.

## Шаг 6: Получение списка инбаундов

```bash
curl http://localhost:3000/api/admin/inbounds ^
  -H "X-API-Key: ваш-api-key"
```

Или используйте готовый скрипт:
```bash
scripts\list-inbounds.bat
```

Запомните `id` нужного инбаунда.

## Шаг 7: Привязка инбаунда к пользователю

Предположим, что `user_id = 1` и `inbound_id = 1`:

```bash
curl -X POST http://localhost:3000/api/admin/users/1/inbounds ^
  -H "X-API-Key: ваш-api-key" ^
  -H "Content-Type: application/json" ^
  -d "{\"inbound_id\": 1, \"client_email\": \"alice@example.com\"}"
```

**Важно:** `client_email` должен совпадать с email клиента в 3x-ui панели!

## Шаг 8: Получение конфигурации пользователем

Теперь пользователь может получить свою конфигурацию:

```
http://localhost:3000/api/config/PERSONAL_TOKEN
```

Или в текстовом формате (для импорта в V2Ray клиент):

```
http://localhost:3000/api/config/PERSONAL_TOKEN/text
```

## Пример полного цикла (PowerShell)

```powershell
# Установка
npm install

# Создание .env
copy .env.example .env
# Отредактируйте .env!

# Запуск
npm run dev

# В другом окне терминала:

# 1. Создать пользователя
$response = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/admin/users" `
  -Headers @{"X-API-Key"="your-api-key"; "Content-Type"="application/json"} `
  -Body '{"username":"alice","email":"alice@example.com"}'

$userId = $response.user.id
$token = $response.user.personal_token

Write-Host "User ID: $userId"
Write-Host "Token: $token"

# 2. Получить инбаунды
$inbounds = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/inbounds" `
  -Headers @{"X-API-Key"="your-api-key"}

$inboundId = $inbounds.inbounds[0].id
Write-Host "Inbound ID: $inboundId"

# 3. Привязать инбаунд
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/admin/users/$userId/inbounds" `
  -Headers @{"X-API-Key"="your-api-key"; "Content-Type"="application/json"} `
  -Body "{`"inbound_id`":$inboundId,`"client_email`":`"alice@example.com`"}"

# 4. Получить конфигурацию
Invoke-RestMethod -Uri "http://localhost:3000/api/config/$token"
```

## Проверка API

Используйте тестовый скрипт (не забудьте указать API_KEY):

```bash
scripts\test-api.bat
```

## Частые проблемы

### Ошибка: "Failed to authenticate with 3x-ui panel"

Проверьте:
- Правильно ли указан `PANEL_URL` в `.env`
- Доступна ли 3x-ui панель по этому адресу
- Правильные ли логин и пароль

### Ошибка: "Unauthorized" при обращении к API

Проверьте:
- Указан ли заголовок `X-API-Key` в запросе
- Совпадает ли значение с `API_KEY` в `.env`

### Ошибка: "Client not found in inbound"

Проверьте:
- Существует ли клиент с таким email в инбаунде 3x-ui
- Правильно ли указан `client_email` при привязке

## Следующие шаги

- Настройте HTTPS для безопасного доступа
- Разверните на продакшн сервере
- Настройте firewall для защиты админских endpoints
- Создайте клиентское приложение для удобного получения конфигураций

## Полезные команды

```bash
# Просмотр всех пользователей
curl http://localhost:3000/api/admin/users -H "X-API-Key: your-api-key"

# Удаление пользователя
curl -X DELETE http://localhost:3000/api/admin/users/1 -H "X-API-Key: your-api-key"

# Просмотр инбаундов пользователя
curl http://localhost:3000/api/admin/users/1/inbounds -H "X-API-Key: your-api-key"

# Удаление привязки инбаунда
curl -X DELETE http://localhost:3000/api/admin/users/1/inbounds/1 -H "X-API-Key: your-api-key"
```
