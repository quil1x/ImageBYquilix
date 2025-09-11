@echo off
echo Встановлення залежностей для Генератора зображень Pollinations...
echo.

REM Перевіряємо чи встановлений Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ПОМИЛКА: Node.js не встановлений!
    echo Будь ласка, встановіть Node.js з https://nodejs.org/
    pause
    exit /b 1
)

REM Встановлюємо залежності
echo Встановлення npm пакетів...
npm install

if %errorlevel% neq 0 (
    echo ПОМИЛКА: Не вдалося встановити залежності!
    pause
    exit /b 1
)

echo.
echo ✅ Встановлення завершено успішно!
echo.
echo Для запуску додатку використовуйте:
echo   npm start
echo.
echo Або для режиму розробки:
echo   npm run dev
echo.
pause
