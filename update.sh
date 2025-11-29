#!/bin/bash

# Скрипт для обновления сервера
# Использование: ./update.sh

set -e  # Остановить при ошибке

echo "🔄 V2Ray Link Publish Server - Update Script"
echo "============================================"
echo ""

# Проверка что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📥 Pulling latest changes from GitHub..."
git pull

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building project..."
npm run build

echo ""
echo "♻️  Restarting PM2 service..."
pm2 restart v2ray-publish

echo ""
echo "✅ Update complete!"
echo ""
echo "📋 Checking logs..."
echo ""
pm2 logs v2ray-publish --lines 20
