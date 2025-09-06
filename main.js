const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Налаштування логування
const logFile = 'image_generator.log';

function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${level} - ${message}\n`;
    
    // Виводимо в консоль
    console.log(logMessage.trim());
    
    // Записуємо в файл
    fs.appendFileSync(logFile, logMessage);
}

// Створюємо головне вікно
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: path.join(__dirname, 'assets/icon.png'),
        titleBarStyle: 'default',
        show: false
    });

    mainWindow.loadFile('index.html');
    
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        log('Головне вікно відкрито');
    });

    // Відкриваємо DevTools в режимі розробки
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }
}

// Обробники подій
app.whenReady().then(() => {
    createWindow();
    log('Додаток запущено');

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        log('Додаток закрито');
        app.quit();
    }
});

// IPC обробники
ipcMain.handle('generate-image', async (event, params) => {
    try {
        log(`Початок генерації зображення: ${params.prompt}`);
        
        const axios = require('axios');
        const querystring = require('querystring');
        
        const apiParams = {
            model: params.model || 'flux',
            width: params.width || 1024,
            height: params.height || 1024,
            enhance: params.enhance ? 'true' : 'false',
            nologo: params.nologo ? 'true' : 'false'
        };
        
        if (params.seed) {
            apiParams.seed = params.seed;
        }
        
        const encodedPrompt = encodeURIComponent(params.prompt);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?${querystring.stringify(apiParams)}`;
        
        log(`API URL: ${url}`);
        
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 300000 // 5 хвилин
        });
        
        log('Зображення успішно згенеровано');
        
        return {
            success: true,
            imageData: Buffer.from(response.data).toString('base64'),
            contentType: response.headers['content-type']
        };
        
    } catch (error) {
        log(`Помилка генерації зображення: ${error.message}`, 'ERROR');
        return {
            success: false,
            error: error.message
        };
    }
});

ipcMain.handle('save-image', async (event, imageData, filename) => {
    try {
        const result = await dialog.showSaveDialog({
            defaultPath: filename,
            filters: [
                { name: 'JPEG Images', extensions: ['jpg', 'jpeg'] },
                { name: 'PNG Images', extensions: ['png'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        
        if (!result.canceled) {
            const buffer = Buffer.from(imageData, 'base64');
            fs.writeFileSync(result.filePath, buffer);
            log(`Зображення збережено: ${result.filePath}`);
            return { success: true, path: result.filePath };
        }
        
        return { success: false, error: 'Збереження скасовано' };
        
    } catch (error) {
        log(`Помилка збереження: ${error.message}`, 'ERROR');
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-models', async () => {
    try {
        const axios = require('axios');
        const response = await axios.get('https://image.pollinations.ai/models');
        log('Список моделей отримано');
        return { success: true, models: response.data };
    } catch (error) {
        log(`Помилка отримання моделей: ${error.message}`, 'ERROR');
        return { success: false, error: error.message };
    }
});
