@echo off
setlocal enabledelayedexpansion

REM Скрипт для тестирования API на Windows
REM Требуется curl (встроен в Windows 10+)

set API_KEY=your-api-key-here
set BASE_URL=http://localhost:3000

echo Testing V2Ray Link Publish Server API
echo ======================================
echo.
echo Base URL: %BASE_URL%
echo.

REM 1. Проверка главной страницы
echo ----------------------------------------
echo Test: GET / - Main page
echo ----------------------------------------
curl -s %BASE_URL%
echo.
echo.

REM 2. Создание пользователя
echo ----------------------------------------
echo Test: POST /api/admin/users - Create user
echo ----------------------------------------
set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

curl -s -X POST %BASE_URL%/api/admin/users ^
  -H "X-API-Key: %API_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"testuser_%TIMESTAMP%\", \"email\": \"test_%TIMESTAMP%@example.com\"}" > temp_response.json

type temp_response.json
echo.
echo.

REM 3. Получение списка пользователей
echo ----------------------------------------
echo Test: GET /api/admin/users - List users
echo ----------------------------------------
curl -s %BASE_URL%/api/admin/users ^
  -H "X-API-Key: %API_KEY%"
echo.
echo.

REM 4. Получение списка инбаундов
echo ----------------------------------------
echo Test: GET /api/admin/inbounds - List inbounds
echo ----------------------------------------
curl -s %BASE_URL%/api/admin/inbounds ^
  -H "X-API-Key: %API_KEY%"
echo.
echo.

echo ======================================
echo Tests completed!
echo ======================================

if exist temp_response.json del temp_response.json

pause
