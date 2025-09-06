@echo off
echo Запуск Генератора зображень Pollinations.AI...
echo.

REM Перевіряємо чи встановлені залежності
if not exist "node_modules" (
    echo Залежності не встановлені. Запускаємо встановлення...
    call install.bat
    if %errorlevel% neq 0 (
        echo Не вдалося встановити залежності!
        pause
        exit /b 1
    )
)

REM Запускаємо додаток
echo Запуск додатку...
npm start
