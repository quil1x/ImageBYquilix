const { ipcRenderer } = require('electron');

class ImageGenerator {
    constructor() {
        this.currentImageData = null;
        this.initializeElements();
        this.bindEvents();
        this.loadModels();
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
                this.log('Models loaded');
                // Оновлюємо список моделей якщо потрібно
            } else {
                this.log(`Error loading models: ${result.error}`, 'error');
            }
        } catch (error) {
            this.log(`Error loading models: ${error.message}`, 'error');
        }
    }

    // Видалено систему фільтрації промптів для кращої продуктивності

    async generateImage() {
        const originalPrompt = this.promptTextarea.value.trim();
        if (!originalPrompt) {
            this.showError('Please enter image description!');
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
        this.log(`Starting generation: "${cleanPrompt}"`);
        this.log(`Model: ${params.model}, Size: ${params.width}x${params.height}`);

        try {
            const result = await ipcRenderer.invoke('generate-image', params);
            
            if (result.success) {
                this.displayImage(result.imageData);
                this.currentImageData = result.imageData;
                this.saveBtn.disabled = false;
                this.setStatus('Image generated successfully!', 'success');
                this.log('Image generated successfully');
                
                // Очищаємо промпт після успішної генерації
                this.promptTextarea.value = '';
            } else {
                this.showError(`Generation error: ${result.error}`);
                this.log(`Generation error: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showError(`Error: ${error.message}`);
            this.log(`Error: ${error.message}`, 'error');
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
            this.log('Помилка завантаження зображення', 'error');
            this.showError('Помилка завантаження зображення');
        };
        
        img.onload = () => {
            this.log('Зображення успішно завантажено');
        };
        
        this.imageContainer.appendChild(img);
    }

    async saveImage() {
        if (!this.currentImageData) {
            this.showError('Немає зображення для збереження!');
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `generated-image-${timestamp}.jpg`;

        try {
            const result = await ipcRenderer.invoke('save-image', this.currentImageData, filename);
            
            if (result.success) {
                this.showSuccess(`Зображення збережено: ${result.path}`);
                this.log(`Зображення збережено: ${result.path}`);
            } else {
                this.showError(`Помилка збереження: ${result.error}`);
                this.log(`Помилка збереження: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showError(`Помилка: ${error.message}`);
            this.log(`Помилка збереження: ${error.message}`, 'error');
        }
    }

    setGenerating(isGenerating) {
        this.generateBtn.disabled = isGenerating;
        this.progressContainer.style.display = isGenerating ? 'block' : 'none';
        
        if (isGenerating) {
            this.setStatus('Генерується зображення...', 'warning');
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
        this.toggleLogsBtn.textContent = isCollapsed ? 'Показати' : 'Сховати';
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
        this.log('Логи очищено');
    }
}

// Ініціалізація додатку
document.addEventListener('DOMContentLoaded', () => {
    new ImageGenerator();
});
