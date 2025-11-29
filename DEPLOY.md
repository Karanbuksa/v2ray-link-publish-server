# Инструкция по деплою и обновлению

## Первоначальная установка

См. `QUICKSTART.md`

## Обновление сервера после изменений в коде

Когда вы запушили изменения в GitHub и хотите обновить сервер:

### Автоматический способ (рекомендуется)

Создайте скрипт `update.sh` на сервере:

```bash
nano ~/v2ray-link-publish-server/update.sh
```

Вставьте:

```bash
#!/bin/bash
cd ~/v2ray-link-publish-server

echo "🔄 Pulling latest changes from GitHub..."
git pull

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building project..."
npm run build

echo "♻️  Restarting PM2 service..."
pm2 restart v2ray-publish

echo "✅ Update complete!"
echo ""
pm2 logs v2ray-publish --lines 20
```

Сделайте скрипт исполняемым:
```bash
chmod +x ~/v2ray-link-publish-server/update.sh
```

Теперь для обновления просто запускайте:
```bash
~/v2ray-link-publish-server/update.sh
```

### Ручной способ

```bash
# 1. Перейти в директорию проекта
cd ~/v2ray-link-publish-server

# 2. Получить последние изменения
git pull

# 3. Установить новые зависимости (если есть)
npm install

# 4. Пересобрать проект
npm run build

# 5. Перезапустить PM2
pm2 restart v2ray-publish

# 6. Проверить логи
pm2 logs v2ray-publish --lines 20
```

## Проблемы и решения

### Ошибка "Failed to authenticate with 3x-ui panel"

Проверьте:
1. Правильно ли указаны учетные данные в `.env`
2. Доступна ли панель по указанному URL
3. Используется ли HTTPS и указан ли правильный порт

### Ошибка "ENOENT: no such file or directory, open schema.sql"

Скопируйте вручную:
```bash
mkdir -p dist/database
cp src/database/schema.sql dist/database/
pm2 restart v2ray-publish
```

### Порт 3000 уже занят

Измените PORT в `.env` на другой:
```bash
nano .env
# Измените PORT=3000 на PORT=3001
pm2 restart v2ray-publish
```

### База данных повреждена

Создайте бэкап и удалите старую БД:
```bash
cp data/database.db data/database.db.backup
rm data/database.db
pm2 restart v2ray-publish
```

## Проверка работоспособности

```bash
# Статус PM2
pm2 status

# Логи
pm2 logs v2ray-publish

# Проверка API
curl http://localhost:3000

# Проверка аутентификации с 3x-ui
curl http://localhost:3000/api/admin/inbounds -H "X-API-Key: your-api-key"
```

## Откат к предыдущей версии

```bash
cd ~/v2ray-link-publish-server

# Посмотреть историю коммитов
git log --oneline -10

# Откатиться на конкретный коммит
git checkout <commit-hash>

# Пересобрать
npm install
npm run build
pm2 restart v2ray-publish
```

Для возврата к последней версии:
```bash
git checkout main  # или master
```

## Мониторинг

```bash
# Постоянный просмотр логов
pm2 logs v2ray-publish

# Мониторинг ресурсов
pm2 monit

# Информация о процессе
pm2 info v2ray-publish

# Список процессов
pm2 list
```

## Остановка и удаление

```bash
# Остановить
pm2 stop v2ray-publish

# Удалить из PM2
pm2 delete v2ray-publish

# Удалить автозапуск
pm2 unstartup

# Полное удаление проекта
rm -rf ~/v2ray-link-publish-server
```
