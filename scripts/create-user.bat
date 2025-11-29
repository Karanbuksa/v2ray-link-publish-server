@echo off
setlocal

REM Скрипт для создания нового пользователя
REM Использование: create-user.bat <username> <email>

set API_KEY=your-api-key-here
set BASE_URL=http://localhost:3000

if "%~1"=="" (
    echo Usage: create-user.bat ^<username^> ^<email^>
    echo Example: create-user.bat alice alice@example.com
    exit /b 1
)

if "%~2"=="" (
    echo Usage: create-user.bat ^<username^> ^<email^>
    echo Example: create-user.bat alice alice@example.com
    exit /b 1
)

set USERNAME=%~1
set EMAIL=%~2

echo Creating user: %USERNAME% ^(%EMAIL%^)
echo.

curl -X POST %BASE_URL%/api/admin/users ^
  -H "X-API-Key: %API_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"%USERNAME%\", \"email\": \"%EMAIL%\"}"

echo.
echo.
echo User created! Save the personal_token for the user.
pause
