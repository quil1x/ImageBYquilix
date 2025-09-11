const { ipcRenderer } = require('electron');

class ImageGenerator {
    constructor() {
        this.currentImageData = null;
        this.currentLanguage = 'uk';
        this.initializeElements();
        this.bindEvents();
        this.loadModels();
        this.updateLanguageNew();
        this.log('Interface initialized');
    }

    initializeElements() {
        this.promptTextarea = document.getElementById('prompt');
        this.modelSelect = document.getElementById('model');
        this.sizeSelect = document.getElementById('size');
        this.seedInput = document.getElementById('seed');
        this.enhanceCheckbox = document.getElementById('enhance');
        this.nologoCheckbox = document.getElementById('nologo');
        this.generateBtn = document.getElementById('generateBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.imageContainer = document.getElementById('imageContainer');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.logsContent = document.getElementById('logsContent');
        this.toggleLogsBtn = document.getElementById('toggleLogs');
        this.logsPanel = document.getElementById('logsPanel');
        this.langSelect = document.getElementById('langSelect');
        
        // Встановлюємо значення за замовчуванням
        this.sizeSelect.value = '1024x1024';
        this.seedInput.value = '';
        this.enhanceCheckbox.value = 'false';
        this.nologoCheckbox.value = 'true';
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateImage());
        this.saveBtn.addEventListener('click', () => this.saveImage());
        this.toggleLogsBtn.addEventListener('click', () => this.toggleLogs());
        this.clearLogsBtn = document.getElementById('clearLogs');
        this.clearLogsBtn.addEventListener('click', () => this.clearLogs());
        this.langSelect.addEventListener('change', () => this.changeLanguage());
        
        // Enter для генерації
        this.promptTextarea.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.generateImage();
            }
        });
    }

    async loadModels() {
        try {
            const result = await ipcRenderer.invoke('get-models');
            if (result.success) {
                this.log(`${this.getTranslation('models')} ${this.getTranslation('loaded')}`);
                // Оновлюємо список моделей якщо потрібно
            } else {
                this.log(`${this.getTranslation('models_load_error')}: ${result.error}`, 'error');
            }
        } catch (error) {
            this.log(`${this.getTranslation('models_load_error')}: ${error.message}`, 'error');
        }
    }

    // Видалено систему фільтрації промптів для кращої продуктивності

    async generateImage() {
        const originalPrompt = this.promptTextarea.value.trim();
        if (!originalPrompt) {
            this.showError(`${this.getTranslation('prompt_placeholder')}!`);
            return;
        }

        // Використовуємо оригінальний промпт без фільтрації
        const cleanPrompt = originalPrompt;

        // Отримуємо параметри
        const size = this.sizeSelect.value.split('x');
        const params = {
            prompt: cleanPrompt,
            model: this.modelSelect.value,
            width: parseInt(size[0]),
            height: parseInt(size[1]),
            seed: this.seedInput.value ? parseInt(this.seedInput.value) : null,
            enhance: this.enhanceCheckbox.value === 'true',
            nologo: this.nologoCheckbox.value === 'true'
        };

        this.setGenerating(true);
        this.log(`${this.getTranslation('generating')}: "${cleanPrompt}"`);
        this.log(`${this.getTranslation('model')}: ${params.model}, ${this.getTranslation('image_size')}: ${params.width}x${params.height}`);

        try {
            const result = await ipcRenderer.invoke('generate-image', params);
            
            if (result.success) {
                this.displayImage(result.imageData);
                this.currentImageData = result.imageData;
                this.saveBtn.disabled = false;
                this.setStatus(`${this.getTranslation('image')} ${this.getTranslation('generated_count')} ${this.getTranslation('images_successfully')}!`, 'success');
                this.log(`${this.getTranslation('image')} ${this.getTranslation('generated_count')} ${this.getTranslation('images_successfully')}`);
                
                // Очищаємо промпт після успішної генерації
                this.promptTextarea.value = '';
            } else {
                this.showError(`${this.getTranslation('image_generation_error')}: ${result.error}`);
                this.log(`${this.getTranslation('image_generation_error')}: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showError(`${this.getTranslation('api_error_message')}: ${error.message}`);
            this.log(`${this.getTranslation('api_error_message')}: ${error.message}`, 'error');
        } finally {
            this.setGenerating(false);
        }
    }

    displayImage(imageData) {
        // Очищаємо контейнер
        this.imageContainer.innerHTML = '';
        
        const img = document.createElement('img');
        img.src = `data:image/jpeg;base64,${imageData}`;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.borderRadius = '8px';
        img.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        img.style.transition = 'all 0.3s ease';
        
        // Додаємо обробку помилок завантаження
        img.onerror = () => {
            this.log(`${this.getTranslation('image_load_error')}`, 'error');
            this.showError(`${this.getTranslation('image_load_error')}`);
        };
        
        img.onload = () => {
            this.log(`${this.getTranslation('image')} ${this.getTranslation('loaded')} ${this.getTranslation('images_successfully')}`);
        };
        
        this.imageContainer.appendChild(img);
    }

    async saveImage() {
        if (!this.currentImageData) {
            this.showError(`${this.getTranslation('image')} ${this.getTranslation('save_error')}!`);
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `generated-image-${timestamp}.jpg`;

        try {
            const result = await ipcRenderer.invoke('save-image', this.currentImageData, filename);
            
            if (result.success) {
                this.showSuccess(`${this.getTranslation('image_saved')}: ${result.path}`);
                this.log(`${this.getTranslation('image_saved')}: ${result.path}`);
            } else {
                this.showError(`${this.getTranslation('save_error')}: ${result.error}`);
                this.log(`${this.getTranslation('save_error')}: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showError(`${this.getTranslation('api_error_message')}: ${error.message}`);
            this.log(`${this.getTranslation('save_error')}: ${error.message}`, 'error');
        }
    }

    setGenerating(isGenerating) {
        this.generateBtn.disabled = isGenerating;
        this.progressContainer.style.display = isGenerating ? 'block' : 'none';
        
        if (isGenerating) {
            this.generateBtn.textContent = this.getTranslation('generating');
            this.setStatus(`${this.getTranslation('generating')}...`, 'warning');
        } else {
            this.generateBtn.textContent = this.getTranslation('generate');
        }
    }

    setStatus(message, type = 'success') {
        this.statusText.textContent = message;
        this.statusIndicator.className = `status-indicator ${type}`;
    }

    showError(message) {
        this.setStatus(message, 'error');
        // Можна додати toast повідомлення
    }

    showSuccess(message) {
        this.setStatus(message, 'success');
        // Можна додати toast повідомлення
    }

    toggleLogs() {
        this.logsPanel.classList.toggle('collapsed');
        const isCollapsed = this.logsPanel.classList.contains('collapsed');
        this.toggleLogsBtn.textContent = isCollapsed ? this.getTranslation('show') : this.getTranslation('hide');
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        this.logsContent.appendChild(logEntry);
        this.logsContent.scrollTop = this.logsContent.scrollHeight;
        
        // Очищаємо логи якщо їх більше 30 (оптимізація)
        const logs = this.logsContent.children;
        if (logs.length > 30) {
            for (let i = 0; i < 5; i++) {
                this.logsContent.removeChild(logs[0]);
            }
        }
    }

    clearLogs() {
        this.logsContent.innerHTML = '';
        this.log(`${this.getTranslation('logs')} ${this.getTranslation('clear')}`);
    }

    changeLanguage() {
        this.currentLanguage = this.langSelect.value;
        this.updateLanguageNew();
        this.log(`${this.getTranslation('language_changed_to')}: ${this.getLanguageName(this.currentLanguage)}`);
    }

    updateLanguageNew() {
        // Оновлюємо всі елементи з data-lang
        const elements = document.querySelectorAll('[data-lang]');
        elements.forEach(element => {
            const key = element.getAttribute('data-lang');
            const translation = this.getTranslation(key);
            if (translation) {
                element.textContent = translation;
            }
        });

        // Оновлюємо placeholder атрибути
        const placeholderElements = document.querySelectorAll('[data-lang-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-lang-placeholder');
            const translation = this.getTranslation(key);
            if (translation) {
                element.placeholder = translation;
            }
        });

        // Оновлюємо опції селектів
        this.updateSelectOptions();
    }

    updateSelectOptions() {
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            const options = select.querySelectorAll('option[data-lang]');
            options.forEach(option => {
                const key = option.getAttribute('data-lang');
                const translation = this.getTranslation(key);
                if (translation) {
                    option.textContent = translation;
                }
            });
        });
    }

    getTranslation(key) {
        const translations = {
            uk: {
                'language': 'Мова',
                'prompt': 'Промпт',
                'prompt_placeholder': 'Опишіть ваше зображення...',
                'style_presets': 'Пресети стилів',
                'custom': 'Власний',
                'photorealistic': 'Фотореалістичний',
                'anime-tnk': 'Аніме (High School DxD / TNK стиль)',
                'anime-passione': 'Аніме (Passione стиль, сучасний)',
                'artistic': 'Художній',
                'cartoon': 'Мультфільм',
                'fantasy': 'Фентезі',
                'sci-fi': 'Sci-Fi',
                'portrait': 'Портрет',
                'landscape': 'Пейзаж',
                'abstract': 'Абстрактний',
                'model': 'Модель',
                'image_size': 'Розмір зображення',
                'width': 'Ширина',
                'height': 'Висота',
                'number_of_images': 'Кількість зображень',
                '1_image': '1 зображення',
                '2_images': '2 зображення',
                '3_images': '3 зображення',
                '4_images': '4 зображення',
                'seed': 'Seed (насіння) - опціонально',
                'seed_placeholder': 'Залиште порожнім для випадкового',
                'enhance_image': 'Покращити якість зображення',
                'no_logo': 'Без логотипу Pollinations',
                'generate': 'Генерувати',
                'generating': 'Генерується...',
                'preview': 'Попередній перегляд',
                'preview_placeholder': 'Ваше згенероване зображення з\'явиться тут',
                'save': 'Зберегти',
                'logs': 'Логи',
                'clear': 'Очистити',
                'hide': 'Сховати',
                'show': 'Показати',
                'image': 'Зображення',
                'models_load_error': 'Помилка завантаження моделей',
                'language_changed_to': 'Мова змінена на',
                'retry_attempt': 'Повторна спроба',
                'for_image': 'для зображення',
                'image_generation_error': 'Помилка генерації зображення',
                'generated_count': 'Згенеровано',
                'api_response_received': 'отримано відповідь',
                'bytes_type': 'байт, тип',
                'api_works_size': 'працює! Розмір зображення',
                'api_returned_not_image': 'повернув не зображення',
                'api_error_status': 'помилка',
                'api_error_message': 'Помилка API',
                'image_load_error': 'Помилка завантаження зображення',
                'saved_count_images': 'Збережено',
                'images_successfully': 'зображень успішно',
                'image_saved': 'Зображення збережено',
                'save_error': 'Помилка збереження',
                'loaded': 'завантажено'
            },
            en: {
                'language': 'Language',
                'prompt': 'Prompt',
                'prompt_placeholder': 'Describe your image...',
                'style_presets': 'Style Presets',
                'custom': 'Custom',
                'photorealistic': 'Photorealistic',
                'anime-tnk': 'Anime (High School DxD / TNK style)',
                'anime-passione': 'Anime (Passione style, modern)',
                'artistic': 'Artistic',
                'cartoon': 'Cartoon',
                'fantasy': 'Fantasy',
                'sci-fi': 'Sci-Fi',
                'portrait': 'Portrait',
                'landscape': 'Landscape',
                'abstract': 'Abstract',
                'model': 'Model',
                'image_size': 'Image Size',
                'width': 'Width',
                'height': 'Height',
                'number_of_images': 'Number of Images',
                '1_image': '1 image',
                '2_images': '2 images',
                '3_images': '3 images',
                '4_images': '4 images',
                'seed': 'Seed (optional)',
                'seed_placeholder': 'Leave empty for random',
                'enhance_image': 'Enhance image quality',
                'no_logo': 'No Pollinations logo',
                'generate': 'Generate',
                'generating': 'Generating...',
                'preview': 'Preview',
                'preview_placeholder': 'Your generated image will appear here',
                'save': 'Save',
                'logs': 'Logs',
                'clear': 'Clear',
                'hide': 'Hide',
                'show': 'Show',
                'image': 'Image',
                'models_load_error': 'Error loading models',
                'language_changed_to': 'Language changed to',
                'retry_attempt': 'Retry attempt',
                'for_image': 'for image',
                'image_generation_error': 'Image generation error',
                'generated_count': 'Generated',
                'api_response_received': 'received response',
                'bytes_type': 'bytes, type',
                'api_works_size': 'works! Image size',
                'api_returned_not_image': 'returned not image',
                'api_error_status': 'error',
                'api_error_message': 'API error',
                'image_load_error': 'Image load error',
                'saved_count_images': 'Saved',
                'images_successfully': 'images successfully',
                'image_saved': 'Image saved',
                'save_error': 'Save error',
                'loaded': 'loaded'
            },
            ru: {
                'language': 'Язык',
                'prompt': 'Промпт',
                'prompt_placeholder': 'Опишите ваше изображение...',
                'style_presets': 'Стили пресетов',
                'custom': 'Пользовательский',
                'photorealistic': 'Фотореалистичный',
                'anime-tnk': 'Аниме (High School DxD / TNK стиль)',
                'anime-passione': 'Аниме (Passione стиль, современный)',
                'artistic': 'Художественный',
                'cartoon': 'Мультфильм',
                'fantasy': 'Фэнтези',
                'sci-fi': 'Sci-Fi',
                'portrait': 'Портрет',
                'landscape': 'Пейзаж',
                'abstract': 'Абстрактный',
                'model': 'Модель',
                'image_size': 'Размер изображения',
                'width': 'Ширина',
                'height': 'Высота',
                'number_of_images': 'Количество изображений',
                '1_image': '1 изображение',
                '2_images': '2 изображения',
                '3_images': '3 изображения',
                '4_images': '4 изображения',
                'seed': 'Seed (семя) - опционально',
                'seed_placeholder': 'Оставьте пустым для случайного',
                'enhance_image': 'Улучшить качество изображения',
                'no_logo': 'Без логотипа Pollinations',
                'generate': 'Генерировать',
                'generating': 'Генерируется...',
                'preview': 'Предварительный просмотр',
                'preview_placeholder': 'Ваше сгенерированное изображение появится здесь',
                'save': 'Сохранить',
                'logs': 'Логи',
                'clear': 'Очистить',
                'hide': 'Скрыть',
                'show': 'Показать',
                'image': 'Изображение',
                'models_load_error': 'Ошибка загрузки моделей',
                'language_changed_to': 'Язык изменен на',
                'retry_attempt': 'Повторная попытка',
                'for_image': 'для изображения',
                'image_generation_error': 'Ошибка генерации изображения',
                'generated_count': 'Сгенерировано',
                'api_response_received': 'получен ответ',
                'bytes_type': 'байт, тип',
                'api_works_size': 'работает! Размер изображения',
                'api_returned_not_image': 'вернул не изображение',
                'api_error_status': 'ошибка',
                'api_error_message': 'Ошибка API',
                'image_load_error': 'Ошибка загрузки изображения',
                'saved_count_images': 'Сохранено',
                'images_successfully': 'изображений успешно',
                'image_saved': 'Изображение сохранено',
                'save_error': 'Ошибка сохранения',
                'loaded': 'загружено'
            }
        };
        
        return translations[this.currentLanguage]?.[key] || translations['en']?.[key] || key;
    }

    getLanguageName(langCode) {
        const languageNames = {
            'uk': 'Українська',
            'en': 'English',
            'ru': 'Русский',
            'de': 'Deutsch',
            'fr': 'Français',
            'es': 'Español',
            'it': 'Italiano',
            'pl': 'Polski',
            'pt': 'Português',
            'ja': '日本語',
            'ko': '한국어',
            'zh': '中文'
        };
        return languageNames[langCode] || langCode;
    }
}

// Ініціалізація додатку
document.addEventListener('DOMContentLoaded', () => {
    new ImageGenerator();
});
