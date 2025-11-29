#!/bin/bash

# Пример скрипта для настройки сервера
# Скопируйте и адаптируйте под свои нужды

echo "V2Ray Link Publish Server - Setup Example"
echo "=========================================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API ключ для администрирования
API_KEY="your-api-key-here"
BASE_URL="http://localhost:3000"

echo -e "${YELLOW}1. Создаем пользователя${NC}"
echo "POST /api/admin/users"
echo ""

RESPONSE=$(curl -s -X POST ${BASE_URL}/api/admin/users \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com"
  }')

echo "$RESPONSE" | jq .

# Извлекаем ID пользователя и токен
USER_ID=$(echo "$RESPONSE" | jq -r '.user.id')
PERSONAL_TOKEN=$(echo "$RESPONSE" | jq -r '.user.personal_token')

echo ""
echo -e "${GREEN}Пользователь создан!${NC}"
echo "ID: $USER_ID"
echo "Token: $PERSONAL_TOKEN"
echo ""

echo -e "${YELLOW}2. Получаем список инбаундов${NC}"
echo "GET /api/admin/inbounds"
echo ""

INBOUNDS=$(curl -s ${BASE_URL}/api/admin/inbounds \
  -H "X-API-Key: ${API_KEY}")

echo "$INBOUNDS" | jq .

# Извлекаем ID первого инбаунда
INBOUND_ID=$(echo "$INBOUNDS" | jq -r '.inbounds[0].id')

echo ""
echo -e "${GREEN}Найден инбаунд ID: $INBOUND_ID${NC}"
echo ""

echo -e "${YELLOW}3. Привязываем инбаунд к пользователю${NC}"
echo "POST /api/admin/users/${USER_ID}/inbounds"
echo ""

curl -s -X POST ${BASE_URL}/api/admin/users/${USER_ID}/inbounds \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"inbound_id\": ${INBOUND_ID},
    \"client_email\": \"alice@example.com\"
  }" | jq .

echo ""
echo -e "${GREEN}Инбаунд привязан!${NC}"
echo ""

echo -e "${YELLOW}4. Проверяем конфигурацию пользователя${NC}"
echo "GET /api/config/${PERSONAL_TOKEN}"
echo ""

curl -s ${BASE_URL}/api/config/${PERSONAL_TOKEN} | jq .

echo ""
echo ""
echo -e "${GREEN}=== Готово! ===${NC}"
echo ""
echo "Персональная ссылка для пользователя:"
echo "${BASE_URL}/api/config/${PERSONAL_TOKEN}"
echo ""
echo "Текстовый формат (для импорта):"
echo "${BASE_URL}/api/config/${PERSONAL_TOKEN}/text"
echo ""
