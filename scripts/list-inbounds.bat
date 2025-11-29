@echo off
setlocal

REM Скрипт для получения списка инбаундов

set API_KEY=your-api-key-here
set BASE_URL=http://localhost:3000

echo Fetching inbounds from 3x-ui panel...
echo.

curl -s %BASE_URL%/api/admin/inbounds ^
  -H "X-API-Key: %API_KEY%"

echo.
pause
