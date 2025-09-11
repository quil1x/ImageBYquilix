@echo off
echo Запуск веб-сервера для генератора зображень...
echo Відкрийте http://localhost:8000 у браузері
echo Для зупинки натисніть Ctrl+C
echo.
python -m http.server 8000
pause
