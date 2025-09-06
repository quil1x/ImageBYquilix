# Генератор Зображень

[![English](https://img.shields.io/badge/English-🇬🇧-blue)](README.md)
[![Українська](https://img.shields.io/badge/Українська-🇺🇦-yellow)](README.uk.md)

Десктопний додаток для генерації зображень з використанням Pollinations.AI API.

**Створено Quilix** | [GitHub Репозиторій](https://github.com/quil1x/ImageBYquilix)

## Можливості

- **Швидка генерація**: Кілька AI моделей (Flux, Turbo, Midjourney)
- **Сучасний інтерфейс**: Темна тема з ефектами прозорості
- **Без фільтрації**: Пряма обробка промптів без обмежень
- **Оптимізовано**: Мінімальне споживання ресурсів та швидка робота
- **Крос-платформний**: Працює на Windows, macOS, Linux

## Встановлення

1. **Встановіть Node.js** (v16 або вище)
2. **Клонуйте репозиторій**:
   ```bash
   git clone <repository-url>
   cd ImageBYquilix
   ```
3. **Встановіть залежності**:
   ```bash
   npm install
   ```

## Використання

1. **Запустіть додаток**:
   ```bash
   npm start
   ```
   Або використовуйте batch файл на Windows:
   ```bash
   .\start.bat
   ```

2. **Генеруйте зображення**:
   - Введіть ваш промпт в текстове поле
   - Оберіть AI модель (рекомендується Flux)
   - Натисніть "Generate"
   - Збережіть згенероване зображення кнопкою "Save"

## Моделі

- **Flux**: Висока якість, рекомендується
- **Turbo**: Швидка генерація
- **Midjourney**: Альтернативний стиль

## Технічні деталі

- **Фреймворк**: Electron
- **API**: Pollinations.AI
- **Розмір**: 1024x1024 (фіксований)
- **Формат**: PNG/JPEG
- **Без водяного знака**: Увімкнено за замовчуванням

## Ліцензія

Apache License 2.0 - дивіться файл LICENSE для деталей.

## Автори

- **Створено**: [@quil1x](https://github.com/quil1x)
- **Працює на**: [Pollinations.AI](https://pollinations.ai)
- **Репозиторій**: [GitHub](https://github.com/quil1x/image-generator)
