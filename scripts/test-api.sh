#!/bin/bash

# Скрипт для тестирования API
# Убедитесь, что сервер запущен перед использованием

API_KEY="${API_KEY:-your-api-key-here}"
BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "Testing V2Ray Link Publish Server API"
echo "======================================"
echo ""
echo "Base URL: $BASE_URL"
echo ""

# Функция для красивого вывода
print_test() {
    echo ""
    echo "----------------------------------------"
    echo "Test: $1"
    echo "----------------------------------------"
}

# 1. Проверка главной страницы
print_test "GET / - Main page"
curl -s $BASE_URL | jq .

# 2. Создание пользователя
print_test "POST /api/admin/users - Create user"
USER_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/admin/users \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser_'$(date +%s)'",
    "email": "test_'$(date +%s)'@example.com"
  }')

echo "$USER_RESPONSE" | jq .

USER_ID=$(echo "$USER_RESPONSE" | jq -r '.user.id')
USER_TOKEN=$(echo "$USER_RESPONSE" | jq -r '.user.personal_token')

# 3. Получение списка пользователей
print_test "GET /api/admin/users - List users"
curl -s ${BASE_URL}/api/admin/users \
  -H "X-API-Key: ${API_KEY}" | jq .

# 4. Получение пользователя по ID
print_test "GET /api/admin/users/${USER_ID} - Get user by ID"
curl -s ${BASE_URL}/api/admin/users/${USER_ID} \
  -H "X-API-Key: ${API_KEY}" | jq .

# 5. Получение списка инбаундов
print_test "GET /api/admin/inbounds - List inbounds"
INBOUNDS_RESPONSE=$(curl -s ${BASE_URL}/api/admin/inbounds \
  -H "X-API-Key: ${API_KEY}")
echo "$INBOUNDS_RESPONSE" | jq .

# 6. Получение инбаундов пользователя (пока пусто)
print_test "GET /api/admin/users/${USER_ID}/inbounds - Get user inbounds"
curl -s ${BASE_URL}/api/admin/users/${USER_ID}/inbounds \
  -H "X-API-Key: ${API_KEY}" | jq .

# 7. Проверка публичного API (должен вернуть ошибку, т.к. нет привязанных инбаундов)
print_test "GET /api/config/${USER_TOKEN} - Get user config (should fail)"
curl -s ${BASE_URL}/api/config/${USER_TOKEN} | jq .

# 8. Удаление пользователя
print_test "DELETE /api/admin/users/${USER_ID} - Delete user"
curl -s -X DELETE ${BASE_URL}/api/admin/users/${USER_ID} \
  -H "X-API-Key: ${API_KEY}" | jq .

echo ""
echo "======================================"
echo "Tests completed!"
echo "======================================"
