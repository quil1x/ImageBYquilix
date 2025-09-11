// Web version of Image Generator by Quilix
// Powered by Pollinations

class ImageGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadModels();
        this.log(this.getLocalizedMessage('web_app_started'));
    }

    initializeElements() {
        this.promptTextarea = document.getElementById('prompt');
        this.presetSelect = document.getElementById('preset');
        this.modelSelect = document.getElementById('model');
        this.widthSlider = document.getElementById('width');
        this.heightSlider = document.getElementById('height');
        this.widthValue = document.getElementById('widthValue');
        this.heightValue = document.getElementById('heightValue');
        this.countSelect = document.getElementById('count');
        this.seedInput = document.getElementById('seed');
        this.enhanceCheckbox = document.getElementById('enhance');
        this.nologoCheckbox = document.getElementById('nologo');
        this.generateBtn = document.getElementById('generateBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.imageContainer = document.getElementById('imageContainer');
        this.previewArea = document.getElementById('preview');
        this.logsArea = document.getElementById('logs');
        this.clearLogsBtn = document.getElementById('clearLogsBtn');
        this.toggleLogsBtn = document.getElementById('toggleLogsBtn');
        this.langSelect = document.getElementById('langSelect');
        
        this.currentImageData = null;
        this.logsVisible = true;
        this.currentLanguage = 'uk'; // Початкова мова
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateImage());
        this.saveBtn.addEventListener('click', () => this.saveImage());
        this.clearLogsBtn.addEventListener('click', () => this.clearLogs());
        this.toggleLogsBtn.addEventListener('click', () => this.toggleLogs());
        this.langSelect.addEventListener('change', () => this.changeLanguage());
        this.presetSelect.addEventListener('change', () => this.handlePresetChange());
        
        // Size sliders
        this.widthSlider.addEventListener('input', () => this.updateSizeDisplay());
        this.heightSlider.addEventListener('input', () => this.updateSizeDisplay());
        
        // Size preset buttons
        document.querySelectorAll('.size-preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setSizePreset(e.target.dataset.size));
        });
        
        // Enter key to generate
        this.promptTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.generateImage();
            }
        });
    }

    async loadModels() {
        try {
            // For web version, we'll use a simple list
            const models = [
                { id: 'flux', name: 'Flux (Recommended)' },
                { id: 'turbo', name: 'Turbo' }
            ];
            
            // Встановлюємо Flux як модель за замовчуванням
            this.modelSelect.value = 'flux';
            
            this.modelSelect.innerHTML = models.map(model => 
                `<option value="${model.id}">${model.name}</option>`
            ).join('');
            
            this.log(this.getLocalizedMessage('models_loaded'));
        } catch (error) {
            this.log(`${this.getTranslation('models_load_error')}: ${error.message}`, 'error');
        }
    }

    enhancePrompt(prompt) {
        // Додаємо ключові слова для кращої точності
        let enhanced = prompt.trim();
        
        // Додаємо загальні покращення якості
        if (!enhanced.toLowerCase().includes('high quality')) {
            enhanced += ', high quality';
        }
        
        if (!enhanced.toLowerCase().includes('detailed')) {
            enhanced += ', detailed';
        }
        
        if (!enhanced.toLowerCase().includes('sharp')) {
            enhanced += ', sharp focus';
        }
        
        // Додаємо фотореалістичність для певних типів зображень
        if (enhanced.toLowerCase().includes('photo') || 
            enhanced.toLowerCase().includes('portrait') || 
            enhanced.toLowerCase().includes('person') ||
            enhanced.toLowerCase().includes('face') ||
            enhanced.toLowerCase().includes('hand') ||
            enhanced.toLowerCase().includes('ice cream') ||
            enhanced.toLowerCase().includes('food')) {
            if (!enhanced.toLowerCase().includes('photorealistic')) {
                enhanced += ', photorealistic';
            }
            if (!enhanced.toLowerCase().includes('realistic')) {
                enhanced += ', realistic';
            }
        }
        
        // Додаємо художній стиль для абстрактних зображень
        if (enhanced.toLowerCase().includes('art') || 
            enhanced.toLowerCase().includes('painting') || 
            enhanced.toLowerCase().includes('drawing') ||
            enhanced.toLowerCase().includes('illustration')) {
            if (!enhanced.toLowerCase().includes('artistic')) {
                enhanced += ', artistic style';
            }
        }
        
        // Додаємо специфічні покращення для їжі
        if (enhanced.toLowerCase().includes('ice cream') || 
            enhanced.toLowerCase().includes('food') ||
            enhanced.toLowerCase().includes('eat') ||
            enhanced.toLowerCase().includes('delicious')) {
            if (!enhanced.toLowerCase().includes('appetizing')) {
                enhanced += ', appetizing';
            }
            if (!enhanced.toLowerCase().includes('vibrant colors')) {
                enhanced += ', vibrant colors';
            }
        }
        
        // Додаємо покращення для пейзажів
        if (enhanced.toLowerCase().includes('landscape') || 
            enhanced.toLowerCase().includes('forest') ||
            enhanced.toLowerCase().includes('nature') ||
            enhanced.toLowerCase().includes('outdoor')) {
            if (!enhanced.toLowerCase().includes('breathtaking')) {
                enhanced += ', breathtaking';
            }
        }
        
        return enhanced;
    }

    addVariationToPrompt(prompt, imageNumber) {
        // Додаємо варіації до промпту для різних зображень
        const variations = [
            'different angle',
            'different perspective', 
            'different lighting',
            'different composition',
            'alternative view',
            'varied style',
            'unique interpretation',
            'distinctive approach'
        ];
        
        const styleVariations = [
            'photorealistic',
            'artistic',
            'detailed',
            'vibrant',
            'soft lighting',
            'dramatic lighting',
            'close-up',
            'wide shot'
        ];
        
        let variedPrompt = prompt;
        
        // Додаємо варіацію залежно від номера зображення
        if (imageNumber > 1) {
            const variation = variations[(imageNumber - 2) % variations.length];
            const styleVariation = styleVariations[(imageNumber - 2) % styleVariations.length];
            
            variedPrompt += `, ${variation}, ${styleVariation}`;
        }
        
        return variedPrompt;
    }

    // Пресети промптів
    getPresetPrompts() {
        // Пресети завжди англійською для кращої обробки моделями
        return {
            photorealistic: "Ultra-photorealistic portrait, cinematic lighting, natural skin texture, soft depth of field, hyper-detailed 8K look",
            'anime-tnk': "Detailed anime illustration in TNK studio style (High School DxD seasons 1–3), vibrant color palette, clean bold line art, soft shading, expressive character design, dynamic school-life or fantasy pose",
            'anime-passione': "Anime artwork in Passione style (High School DxD Hero), colorful palette, glossy highlights, sharp linework, high-contrast shading, playful and fan-service heavy aesthetic",
            artistic: "Painterly oil-style digital artwork of a surreal scene, rich brush textures, dreamy atmosphere, impressionist-surreal fusion",
            cartoon: "Charming cartoon character, bold outlines, exaggerated expressions, bright flat colors, fun and humorous vibe",
            fantasy: "Epic fantasy artwork, mythical creature or magical warrior, glowing effects, rich detailed environment, cinematic composition",
            'sci-fi': "Cyberpunk sci-fi cityscape, glowing neon signs, futuristic architecture, flying vehicles, highly detailed, cinematic perspective",
            portrait: "Expressive character portrait, dramatic lighting, sharp details, emotional depth, soft background blur",
            landscape: "Atmospheric wide landscape, mountains and forests under dynamic sky, volumetric light, highly detailed digital matte painting",
            abstract: "Abstract composition of flowing shapes and geometric patterns, vibrant colors, high contrast, modern digital aesthetic"
        };
    }

    handlePresetChange() {
        const preset = this.presetSelect.value;
        if (preset !== 'custom') {
            // Не заповнюємо поле промпта, тільки зберігаємо вибраний пресет
            this.currentPreset = preset;
            this.log(`${this.getLocalizedMessage('preset_selected')}: ${preset}`);
        } else {
            this.currentPreset = null;
        }
    }

    changeLanguage() {
        console.log('🔄 Language change triggered, new value:', this.langSelect.value);
        this.currentLanguage = this.langSelect.value;
        this.updateLanguageNew();
        this.log(`${this.getTranslation('language_changed_to')}: ${this.getLanguageName(this.currentLanguage)}`);
    }

    updateLanguageNew() {
        console.log('🌍 Updating language to:', this.currentLanguage);
        
        // Оновлюємо всі елементи з data-lang атрибутами
        const elements = document.querySelectorAll('[data-lang]');
        console.log('📝 Found elements to update:', elements.length);
        
        elements.forEach(element => {
            const langKey = element.getAttribute('data-lang');
            if (langKey) {
                const newText = this.getTranslation(langKey);
                if (newText) {
                    element.textContent = newText;
                    console.log('✅ Updated:', element.tagName, langKey, '→', newText);
                }
            }
        });

        // Оновлюємо placeholder елементи
        const placeholders = document.querySelectorAll('[data-lang-placeholder]');
        placeholders.forEach(element => {
            const langKey = element.getAttribute('data-lang-placeholder');
            if (langKey) {
                const newPlaceholder = this.getTranslation(langKey);
                if (newPlaceholder) {
                    element.placeholder = newPlaceholder;
                    console.log('✅ Updated placeholder:', langKey, '→', newPlaceholder);
                }
            }
        });

        // Оновлюємо опції селекторів
        this.updateSelectOptions();
        
        // Оновлюємо існуючі зображення
        this.updateExistingImages();
        
        console.log('🎉 Language update completed!');
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
                'save_error': 'Помилка збереження'
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
                'save_error': 'Save error'
            },
            ru: {
                'language': 'Язык',
                'prompt': 'Промпт',
                'prompt_placeholder': 'Опишите ваше изображение...',
                'style_presets': 'Стили пресетов',
                'custom': 'Свой',
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
                'save_error': 'Ошибка сохранения'
            },
            de: {
                'language': 'Sprache',
                'prompt': 'Eingabeaufforderung',
                'prompt_placeholder': 'Beschreiben Sie Ihr Bild...',
                'style_presets': 'Stil-Voreinstellungen',
                'custom': 'Benutzerdefiniert',
                'photorealistic': 'Fotorealistisch',
                'anime-tnk': 'Anime (High School DxD / TNK Stil)',
                'anime-passione': 'Anime (Passione Stil, modern)',
                'artistic': 'Künstlerisch',
                'cartoon': 'Cartoon',
                'fantasy': 'Fantasy',
                'sci-fi': 'Sci-Fi',
                'portrait': 'Porträt',
                'landscape': 'Landschaft',
                'abstract': 'Abstrakt',
                'model': 'Modell',
                'image_size': 'Bildgröße',
                'width': 'Breite',
                'height': 'Höhe',
                'number_of_images': 'Anzahl der Bilder',
                '1_image': '1 Bild',
                '2_images': '2 Bilder',
                '3_images': '3 Bilder',
                '4_images': '4 Bilder',
                'seed': 'Seed (Samen) - optional',
                'seed_placeholder': 'Leer lassen für zufällig',
                'enhance_image': 'Bildqualität verbessern',
                'no_logo': 'Kein Pollinations Logo',
                'generate': 'Generieren',
                'generating': 'Generiere...',
                'preview': 'Vorschau',
                'preview_placeholder': 'Ihr generiertes Bild wird hier angezeigt',
                'save': 'Speichern',
                'logs': 'Protokolle',
                'clear': 'Löschen',
                'hide': 'Verstecken',
                'show': 'Zeigen',
                'image': 'Bild',
                'models_load_error': 'Fehler beim Laden der Modelle',
                'language_changed_to': 'Sprache geändert zu',
                'retry_attempt': 'Wiederholungsversuch',
                'for_image': 'für Bild',
                'image_generation_error': 'Bildgenerierungsfehler',
                'generated_count': 'Generiert',
                'api_response_received': 'Antwort erhalten',
                'bytes_type': 'Bytes, Typ',
                'api_works_size': 'funktioniert! Bildgröße',
                'api_returned_not_image': 'gab kein Bild zurück',
                'api_error_status': 'Fehler',
                'api_error_message': 'API-Fehler',
                'image_load_error': 'Bildlade-Fehler',
                'saved_count_images': 'Gespeichert',
                'images_successfully': 'Bilder erfolgreich',
                'image_saved': 'Bild gespeichert',
                'save_error': 'Speicherfehler'
            },
            fr: {
                'language': 'Langue',
                'prompt': 'Invite',
                'prompt_placeholder': 'Décrivez votre image...',
                'style_presets': 'Préréglages de style',
                'custom': 'Personnalisé',
                'photorealistic': 'Photoréaliste',
                'anime-tnk': 'Anime (High School DxD / TNK style)',
                'anime-passione': 'Anime (Passione style, moderne)',
                'artistic': 'Artistique',
                'cartoon': 'Dessin animé',
                'fantasy': 'Fantaisie',
                'sci-fi': 'Sci-Fi',
                'portrait': 'Portrait',
                'landscape': 'Paysage',
                'abstract': 'Abstrait',
                'model': 'Modèle',
                'image_size': 'Taille d\'image',
                'width': 'Largeur',
                'height': 'Hauteur',
                'number_of_images': 'Nombre d\'images',
                '1_image': '1 image',
                '2_images': '2 images',
                '3_images': '3 images',
                '4_images': '4 images',
                'seed': 'Seed (graine) - optionnel',
                'seed_placeholder': 'Laisser vide pour aléatoire',
                'enhance_image': 'Améliorer la qualité d\'image',
                'no_logo': 'Pas de logo Pollinations',
                'generate': 'Générer',
                'generating': 'Génération...',
                'preview': 'Aperçu',
                'preview_placeholder': 'Votre image générée apparaîtra ici',
                'save': 'Sauvegarder',
                'logs': 'Journaux',
                'clear': 'Effacer',
                'hide': 'Masquer',
                'show': 'Afficher',
                'image': 'Image',
                'models_load_error': 'Erreur de chargement des modèles',
                'language_changed_to': 'Langue changée vers',
                'retry_attempt': 'Tentative de retry',
                'for_image': 'pour image',
                'image_generation_error': 'Erreur de génération d\'image',
                'generated_count': 'Généré',
                'api_response_received': 'réponse reçue',
                'bytes_type': 'octets, type',
                'api_works_size': 'fonctionne! Taille d\'image',
                'api_returned_not_image': 'a retourné pas d\'image',
                'api_error_status': 'erreur',
                'api_error_message': 'Erreur API',
                'image_load_error': 'Erreur de chargement d\'image',
                'saved_count_images': 'Sauvegardé',
                'images_successfully': 'images avec succès',
                'image_saved': 'Image sauvegardée',
                'save_error': 'Erreur de sauvegarde'
            },
            es: {
                'language': 'Idioma',
                'prompt': 'Prompt',
                'prompt_placeholder': 'Describe tu imagen...',
                'style_presets': 'Preajustes de estilo',
                'custom': 'Personalizado',
                'photorealistic': 'Fotorrealista',
                'anime-tnk': 'Anime (High School DxD / TNK estilo)',
                'anime-passione': 'Anime (Passione estilo, moderno)',
                'artistic': 'Artístico',
                'cartoon': 'Caricatura',
                'fantasy': 'Fantasía',
                'sci-fi': 'Sci-Fi',
                'portrait': 'Retrato',
                'landscape': 'Paisaje',
                'abstract': 'Abstracto',
                'model': 'Modelo',
                'image_size': 'Tamaño de imagen',
                'width': 'Ancho',
                'height': 'Alto',
                'number_of_images': 'Número de imágenes',
                '1_image': '1 imagen',
                '2_images': '2 imágenes',
                '3_images': '3 imágenes',
                '4_images': '4 imágenes',
                'seed': 'Seed (semilla) - opcional',
                'seed_placeholder': 'Dejar vacío para aleatorio',
                'enhance_image': 'Mejorar calidad de imagen',
                'no_logo': 'Sin logo Pollinations',
                'generate': 'Generar',
                'generating': 'Generando...',
                'preview': 'Vista previa',
                'preview_placeholder': 'Tu imagen generada aparecerá aquí',
                'save': 'Guardar',
                'logs': 'Registros',
                'clear': 'Limpiar',
                'hide': 'Ocultar',
                'show': 'Mostrar',
                'image': 'Imagen',
                'models_load_error': 'Error cargando modelos',
                'language_changed_to': 'Idioma cambiado a',
                'retry_attempt': 'Intento de reintento',
                'for_image': 'para imagen',
                'image_generation_error': 'Error de generación de imagen',
                'generated_count': 'Generado',
                'api_response_received': 'respuesta recibida',
                'bytes_type': 'bytes, tipo',
                'api_works_size': 'funciona! Tamaño de imagen',
                'api_returned_not_image': 'devolvió no imagen',
                'api_error_status': 'error',
                'api_error_message': 'Error de API',
                'image_load_error': 'Error de carga de imagen',
                'saved_count_images': 'Guardado',
                'images_successfully': 'imágenes exitosamente',
                'image_saved': 'Imagen guardada',
                'save_error': 'Error de guardado'
            },
            it: {
                'language': 'Lingua',
                'prompt': 'Prompt',
                'prompt_placeholder': 'Descrivi la tua immagine...',
                'style_presets': 'Preimpostazioni stile',
                'custom': 'Personalizzato',
                'photorealistic': 'Fotorealistico',
                'anime-tnk': 'Anime (High School DxD / TNK stile)',
                'anime-passione': 'Anime (Passione stile, moderno)',
                'artistic': 'Artistico',
                'cartoon': 'Cartone animato',
                'fantasy': 'Fantasy',
                'sci-fi': 'Sci-Fi',
                'portrait': 'Ritratto',
                'landscape': 'Paesaggio',
                'abstract': 'Astratto',
                'model': 'Modello',
                'image_size': 'Dimensione immagine',
                'width': 'Larghezza',
                'height': 'Altezza',
                'number_of_images': 'Numero di immagini',
                '1_image': '1 immagine',
                '2_images': '2 immagini',
                '3_images': '3 immagini',
                '4_images': '4 immagini',
                'seed': 'Seed (seme) - opzionale',
                'seed_placeholder': 'Lascia vuoto per casuale',
                'enhance_image': 'Migliora qualità immagine',
                'no_logo': 'Nessun logo Pollinations',
                'generate': 'Genera',
                'generating': 'Generando...',
                'preview': 'Anteprima',
                'preview_placeholder': 'La tua immagine generata apparirà qui',
                'save': 'Salva',
                'logs': 'Log',
                'clear': 'Cancella',
                'hide': 'Nascondi',
                'show': 'Mostra',
                'image': 'Immagine',
                'models_load_error': 'Errore caricamento modelli',
                'language_changed_to': 'Lingua cambiata a',
                'retry_attempt': 'Tentativo di retry',
                'for_image': 'per immagine',
                'image_generation_error': 'Errore generazione immagine',
                'generated_count': 'Generato',
                'api_response_received': 'risposta ricevuta',
                'bytes_type': 'bytes, tipo',
                'api_works_size': 'funziona! Dimensione immagine',
                'api_returned_not_image': 'ha restituito non immagine',
                'api_error_status': 'errore',
                'api_error_message': 'Errore API',
                'image_load_error': 'Errore caricamento immagine',
                'saved_count_images': 'Salvato',
                'images_successfully': 'immagini con successo',
                'image_saved': 'Immagine salvata',
                'save_error': 'Errore salvataggio'
            },
            pl: {
                'language': 'Język',
                'prompt': 'Prompt',
                'prompt_placeholder': 'Opisz swój obraz...',
                'style_presets': 'Ustawienia stylu',
                'custom': 'Niestandardowy',
                'photorealistic': 'Fotorealistyczny',
                'anime-tnk': 'Anime (High School DxD / TNK styl)',
                'anime-passione': 'Anime (Passione styl, nowoczesny)',
                'artistic': 'Artystyczny',
                'cartoon': 'Kreskówka',
                'fantasy': 'Fantasy',
                'sci-fi': 'Sci-Fi',
                'portrait': 'Portret',
                'landscape': 'Krajobraz',
                'abstract': 'Abstrakcyjny',
                'model': 'Model',
                'image_size': 'Rozmiar obrazu',
                'width': 'Szerokość',
                'height': 'Wysokość',
                'number_of_images': 'Liczba obrazów',
                '1_image': '1 obraz',
                '2_images': '2 obrazy',
                '3_images': '3 obrazy',
                '4_images': '4 obrazy',
                'seed': 'Seed (ziarno) - opcjonalne',
                'seed_placeholder': 'Zostaw puste dla losowego',
                'enhance_image': 'Popraw jakość obrazu',
                'no_logo': 'Bez logo Pollinations',
                'generate': 'Generuj',
                'generating': 'Generowanie...',
                'preview': 'Podgląd',
                'preview_placeholder': 'Twój wygenerowany obraz pojawi się tutaj',
                'save': 'Zapisz',
                'logs': 'Logi',
                'clear': 'Wyczyść',
                'hide': 'Ukryj',
                'show': 'Pokaż',
                'image': 'Obraz',
                'models_load_error': 'Błąd ładowania modeli',
                'language_changed_to': 'Język zmieniony na',
                'retry_attempt': 'Próba ponowienia',
                'for_image': 'dla obrazu',
                'image_generation_error': 'Błąd generowania obrazu',
                'generated_count': 'Wygenerowano',
                'api_response_received': 'otrzymano odpowiedź',
                'bytes_type': 'bajtów, typ',
                'api_works_size': 'działa! Rozmiar obrazu',
                'api_returned_not_image': 'zwrócił nie obraz',
                'api_error_status': 'błąd',
                'api_error_message': 'Błąd API',
                'image_load_error': 'Błąd ładowania obrazu',
                'saved_count_images': 'Zapisano',
                'images_successfully': 'obrazów pomyślnie',
                'image_saved': 'Obraz zapisany',
                'save_error': 'Błąd zapisu'
            },
            pt: {
                'language': 'Idioma',
                'prompt': 'Prompt',
                'prompt_placeholder': 'Descreva sua imagem...',
                'style_presets': 'Predefinições de estilo',
                'custom': 'Personalizado',
                'photorealistic': 'Fotorrealista',
                'anime-tnk': 'Anime (High School DxD / TNK estilo)',
                'anime-passione': 'Anime (Passione estilo, moderno)',
                'artistic': 'Artístico',
                'cartoon': 'Desenho animado',
                'fantasy': 'Fantasia',
                'sci-fi': 'Sci-Fi',
                'portrait': 'Retrato',
                'landscape': 'Paisagem',
                'abstract': 'Abstrato',
                'model': 'Modelo',
                'image_size': 'Tamanho da imagem',
                'width': 'Largura',
                'height': 'Altura',
                'number_of_images': 'Número de imagens',
                '1_image': '1 imagem',
                '2_images': '2 imagens',
                '3_images': '3 imagens',
                '4_images': '4 imagens',
                'seed': 'Seed (semente) - opcional',
                'seed_placeholder': 'Deixe vazio para aleatório',
                'enhance_image': 'Melhorar qualidade da imagem',
                'no_logo': 'Sem logo Pollinations',
                'generate': 'Gerar',
                'generating': 'Gerando...',
                'preview': 'Visualização',
                'preview_placeholder': 'Sua imagem gerada aparecerá aqui',
                'save': 'Salvar',
                'logs': 'Logs',
                'clear': 'Limpar',
                'hide': 'Ocultar',
                'show': 'Mostrar',
                'image': 'Imagem',
                'models_load_error': 'Erro carregando modelos',
                'language_changed_to': 'Idioma alterado para',
                'retry_attempt': 'Tentativa de retry',
                'for_image': 'para imagem',
                'image_generation_error': 'Erro de geração de imagem',
                'generated_count': 'Gerado',
                'api_response_received': 'resposta recebida',
                'bytes_type': 'bytes, tipo',
                'api_works_size': 'funciona! Tamanho da imagem',
                'api_returned_not_image': 'retornou não imagem',
                'api_error_status': 'erro',
                'api_error_message': 'Erro de API',
                'image_load_error': 'Erro de carregamento de imagem',
                'saved_count_images': 'Salvo',
                'images_successfully': 'imagens com sucesso',
                'image_saved': 'Imagem salva',
                'save_error': 'Erro de salvamento'
            },
            ja: {
                'language': '言語',
                'prompt': 'プロンプト',
                'prompt_placeholder': '画像を説明してください...',
                'style_presets': 'スタイルプリセット',
                'custom': 'カスタム',
                'photorealistic': 'フォトリアル',
                'anime-tnk': 'アニメ (High School DxD / TNK スタイル)',
                'anime-passione': 'アニメ (Passione スタイル, モダン)',
                'artistic': 'アーティスティック',
                'cartoon': 'カートゥーン',
                'fantasy': 'ファンタジー',
                'sci-fi': 'Sci-Fi',
                'portrait': 'ポートレート',
                'landscape': '風景',
                'abstract': '抽象',
                'model': 'モデル',
                'image_size': '画像サイズ',
                'width': '幅',
                'height': '高さ',
                'number_of_images': '画像数',
                '1_image': '1枚の画像',
                '2_images': '2枚の画像',
                '3_images': '3枚の画像',
                '4_images': '4枚の画像',
                'seed': 'Seed (シード) - オプション',
                'seed_placeholder': 'ランダムの場合は空のまま',
                'enhance_image': '画像品質を向上',
                'no_logo': 'Pollinationsロゴなし',
                'generate': '生成',
                'generating': '生成中...',
                'preview': 'プレビュー',
                'preview_placeholder': '生成された画像がここに表示されます',
                'save': '保存',
                'logs': 'ログ',
                'clear': 'クリア',
                'hide': '非表示',
                'show': '表示',
                'image': '画像',
                'models_load_error': 'モデル読み込みエラー',
                'language_changed_to': '言語が変更されました',
                'retry_attempt': '再試行',
                'for_image': '画像用',
                'image_generation_error': '画像生成エラー',
                'generated_count': '生成済み',
                'api_response_received': '応答受信',
                'bytes_type': 'バイト、タイプ',
                'api_works_size': '動作中！画像サイズ',
                'api_returned_not_image': '画像以外を返しました',
                'api_error_status': 'エラー',
                'api_error_message': 'APIエラー',
                'image_load_error': '画像読み込みエラー',
                'saved_count_images': '保存済み',
                'images_successfully': '画像が正常に',
                'image_saved': '画像が保存されました',
                'save_error': '保存エラー'
            },
            ko: {
                'language': '언어',
                'prompt': '프롬프트',
                'prompt_placeholder': '이미지를 설명하세요...',
                'style_presets': '스타일 프리셋',
                'custom': '사용자 정의',
                'photorealistic': '포토리얼리스틱',
                'anime-tnk': '애니메 (High School DxD / TNK 스타일)',
                'anime-passione': '애니메 (Passione 스타일, 모던)',
                'artistic': '아티스틱',
                'cartoon': '카툰',
                'fantasy': '판타지',
                'sci-fi': 'Sci-Fi',
                'portrait': '포트레이트',
                'landscape': '풍경',
                'abstract': '추상',
                'model': '모델',
                'image_size': '이미지 크기',
                'width': '너비',
                'height': '높이',
                'number_of_images': '이미지 수',
                '1_image': '1개 이미지',
                '2_images': '2개 이미지',
                '3_images': '3개 이미지',
                '4_images': '4개 이미지',
                'seed': 'Seed (시드) - 선택사항',
                'seed_placeholder': '무작위로 하려면 비워두세요',
                'enhance_image': '이미지 품질 향상',
                'no_logo': 'Pollinations 로고 없음',
                'generate': '생성',
                'generating': '생성 중...',
                'preview': '미리보기',
                'preview_placeholder': '생성된 이미지가 여기에 표시됩니다',
                'save': '저장',
                'logs': '로그',
                'clear': '지우기',
                'hide': '숨기기',
                'show': '보기',
                'image': '이미지',
                'models_load_error': '모델 로딩 오류',
                'language_changed_to': '언어가 변경되었습니다',
                'retry_attempt': '재시도',
                'for_image': '이미지용',
                'image_generation_error': '이미지 생성 오류',
                'generated_count': '생성됨',
                'api_response_received': '응답 수신',
                'bytes_type': '바이트, 타입',
                'api_works_size': '작동 중! 이미지 크기',
                'api_returned_not_image': '이미지가 아닌 것을 반환',
                'api_error_status': '오류',
                'api_error_message': 'API 오류',
                'image_load_error': '이미지 로딩 오류',
                'saved_count_images': '저장됨',
                'images_successfully': '이미지가 성공적으로',
                'image_saved': '이미지가 저장되었습니다',
                'save_error': '저장 오류'
            },
            zh: {
                'language': '语言',
                'prompt': '提示词',
                'prompt_placeholder': '描述您的图像...',
                'style_presets': '样式预设',
                'custom': '自定义',
                'photorealistic': '照片写实',
                'anime-tnk': '动漫 (High School DxD / TNK 风格)',
                'anime-passione': '动漫 (Passione 风格, 现代)',
                'artistic': '艺术性',
                'cartoon': '卡通',
                'fantasy': '奇幻',
                'sci-fi': '科幻',
                'portrait': '肖像',
                'landscape': '风景',
                'abstract': '抽象',
                'model': '模型',
                'image_size': '图像大小',
                'width': '宽度',
                'height': '高度',
                'number_of_images': '图像数量',
                '1_image': '1张图像',
                '2_images': '2张图像',
                '3_images': '3张图像',
                '4_images': '4张图像',
                'seed': '种子 - 可选',
                'seed_placeholder': '留空为随机',
                'enhance_image': '增强图像质量',
                'no_logo': '无 Pollinations 标志',
                'generate': '生成',
                'generating': '生成中...',
                'preview': '预览',
                'preview_placeholder': '您生成的图像将在此显示',
                'save': '保存',
                'logs': '日志',
                'clear': '清除',
                'hide': '隐藏',
                'show': '显示',
                'image': '图像',
                'models_load_error': '模型加载错误',
                'language_changed_to': '语言已更改为',
                'retry_attempt': '重试',
                'for_image': '图像用',
                'image_generation_error': '图像生成错误',
                'generated_count': '已生成',
                'api_response_received': '收到响应',
                'bytes_type': '字节，类型',
                'api_works_size': '工作正常！图像大小',
                'api_returned_not_image': '返回非图像',
                'api_error_status': '错误',
                'api_error_message': 'API错误',
                'image_load_error': '图像加载错误',
                'saved_count_images': '已保存',
                'images_successfully': '图像成功',
                'image_saved': '图像已保存',
                'save_error': '保存错误'
            }
        };
        
        return translations[this.currentLanguage]?.[key] || translations['en']?.[key] || key;
    }

    getLanguageName(langCode) {
        const names = {
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
        return names[langCode] || 'Unknown';
    }

    updateSelectOptions() {
        // Оновлюємо опції селектора кількості зображень
        const countOptions = this.countSelect.querySelectorAll('option');
        countOptions.forEach(option => {
            const langKey = option.getAttribute('data-lang');
            if (langKey) {
                option.textContent = this.getTranslation(langKey);
            }
        });
    }

    updateExistingImages() {
        // Оновлюємо підписи до існуючих зображень
        const imageLabels = document.querySelectorAll('.image-container div');
        imageLabels.forEach((label, index) => {
            if (label.textContent.includes('Зображення') || label.textContent.includes('Image') || label.textContent.includes('Изображение')) {
                label.textContent = `${this.getTranslation('image')} ${index + 1}`;
            }
        });
    }

    updateSizeDisplay() {
        this.widthValue.textContent = this.widthSlider.value;
        this.heightValue.textContent = this.heightSlider.value;
    }

    setSizePreset(size) {
        const [width, height] = size.split('x').map(Number);
        this.widthSlider.value = width;
        this.heightSlider.value = height;
        this.updateSizeDisplay();
        
        // Update active preset button
        document.querySelectorAll('.size-preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }

    async generateImage() {
        const originalPrompt = this.promptTextarea.value.trim();
        if (!originalPrompt) {
            const errorMsg = this.currentLanguage === 'uk' 
                ? 'Будь ласка, введіть опис зображення!' 
                : 'Please enter image description!';
            this.showError(errorMsg);
            return;
        }

        // Додаємо пресет до промпту якщо вибрано (завжди англійською)
        let finalPrompt = originalPrompt;
        if (this.currentPreset && this.currentPreset !== 'custom') {
            const presets = this.getPresetPrompts();
            const presetText = presets[this.currentPreset];
            finalPrompt = `${originalPrompt}, ${presetText}`;
        }
        
        // Покращуємо промпт для кращої точності
        const cleanPrompt = this.enhancePrompt(finalPrompt);

        // Get parameters
        const count = parseInt(this.countSelect.value);
        const params = {
            prompt: cleanPrompt,
            model: this.modelSelect.value,
            width: parseInt(this.widthSlider.value),
            height: parseInt(this.heightSlider.value),
            count: count,
            seed: this.seedInput.value ? parseInt(this.seedInput.value) : null,
            enhance: this.enhanceCheckbox.checked,
            nologo: this.nologoCheckbox.checked
        };

        this.setGenerating(true);
        this.log(`${this.getLocalizedMessage('starting_generation')}: "${originalPrompt}"`);
        this.log(`${this.getLocalizedMessage('enhanced_prompt')}: "${cleanPrompt}"`);
        this.log(`${this.getLocalizedMessage('model_selected')}: ${params.model}, ${this.getLocalizedMessage('size_selected')}: ${params.width}x${params.height}, ${this.getLocalizedMessage('count_selected')}: ${params.count}`);
        this.log(`Seed: ${params.seed || this.getLocalizedMessage('random')}, Enhance: ${params.enhance}, NoLogo: ${params.nologo}`);

        try {
            // Генеруємо зображення
            const images = [];
            for (let i = 0; i < params.count; i++) {
                this.log(`${this.getLocalizedMessage('generating_image')} ${i + 1}/${params.count}...`);
                
                // Створюємо варіацію параметрів для кожного зображення
                const imageParams = { ...params };
                
                // Додаємо варіативність до промпту
                if (params.count > 1) {
                    imageParams.prompt = this.addVariationToPrompt(params.prompt, i + 1);
                    this.log(`${this.getLocalizedMessage('prompt_variation')} ${i + 1}: "${imageParams.prompt}"`);
                }
                
                // Додаємо випадковий seed для кожного зображення
                if (!params.seed) {
                    imageParams.seed = Math.floor(Math.random() * 1000000);
                }
                
                // Додаємо невелику варіацію до розміру
                if (params.count > 1 && i > 0) {
                    const sizeVariation = Math.floor(Math.random() * 64) - 32; // ±32 пікселі
                    imageParams.width = Math.max(256, params.width + sizeVariation);
                    imageParams.height = Math.max(256, params.height + sizeVariation);
                }
                
                this.log(`${this.getLocalizedMessage('parameters_for')} ${i + 1}: seed=${imageParams.seed}, ${this.getLocalizedMessage('size_selected')}=${imageParams.width}x${imageParams.height}`);
                
                // Спробуємо кілька разів для кращого результату
                let result = null;
                let attempts = 0;
                const maxAttempts = 3;
                
                while (attempts < maxAttempts && !result?.success) {
                    attempts++;
                    if (attempts > 1) {
                        this.log(`${this.getTranslation('retry_attempt')} ${attempts} ${this.getTranslation('for_image')} ${i + 1}...`);
                    }
                    
                    result = await this.callPollinationsAPI(imageParams);
                    
                    if (!result.success && attempts < maxAttempts) {
                        // Невелика затримка перед повторною спробою
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                
                if (result.success) {
                    images.push(result.imageData);
                    this.log(`${this.getLocalizedMessage('image_generated')} ${i + 1} ${this.getLocalizedMessage('successfully_generated')}`);
                } else {
                    this.showError(`Помилка генерації зображення ${i + 1}: ${result.error}`);
                    this.log(`${this.getTranslation('image_generation_error')} ${i + 1}: ${result.error}`, 'error');
                }
            }
            
            if (images.length > 0) {
                this.displayImage(images.length === 1 ? images[0] : images);
                this.currentImageData = images.length === 1 ? images[0] : images;
                this.saveBtn.disabled = false;
                this.setStatus(`Згенеровано ${images.length} зображень успішно!`, 'success');
                this.log(`${this.getTranslation('generated_count')} ${images.length} ${this.getTranslation('images_successfully')}`);
                
                // Clear prompt after successful generation
                this.promptTextarea.value = '';
            } else {
                this.showError(this.getLocalizedMessage('failed_to_generate'));
                this.log(this.getLocalizedMessage('failed_to_generate'), 'error');
            }
        } catch (error) {
            this.showError(`${this.getLocalizedMessage('error')}: ${error.message}`);
            this.log(`${this.getLocalizedMessage('error')}: ${error.message}`, 'error');
        } finally {
            this.setGenerating(false);
        }
    }

    async callPollinationsAPI(params) {
        try {
            // Використовуємо прямий API (без проксі)
            const apis = [
                {
                    name: 'Pollinations Direct',
                    url: `https://image.pollinations.ai/prompt/${encodeURIComponent(params.prompt)}?model=${params.model}&width=${params.width}&height=${params.height}&enhance=${params.enhance}&nologo=${params.nologo}${params.seed ? `&seed=${params.seed}` : ''}`
                },
                {
                    name: 'Pollinations Simple',
                    url: `https://image.pollinations.ai/prompt/${encodeURIComponent(params.prompt)}`
                }
            ];

            for (const api of apis) {
                try {
                    this.log(`${this.getLocalizedMessage('trying_api')} ${api.name}...`);
                    
                    const response = await fetch(api.url, {
                        method: 'GET',
                        mode: 'cors',
                        headers: {
                            'Accept': 'image/*'
                        }
                    });

                    if (response.ok) {
                        const blob = await response.blob();
                        this.log(`${api.name} ${this.getTranslation('api_response_received')}: ${blob.size} ${this.getTranslation('bytes_type')}: ${blob.type}`);
                        
                        // Перевіряємо, чи це дійсно зображення
                        if (blob.type.startsWith('image/')) {
                            const imageData = await this.blobToBase64(blob);
                            this.log(`${api.name} ${this.getTranslation('api_works_size')}: ${blob.size} байт`);
                            
                            return {
                                success: true,
                                imageData: imageData
                            };
                        } else {
                            this.log(`${api.name} ${this.getTranslation('api_returned_not_image')}: ${blob.type}, розмір: ${blob.size}`, 'error');
                        }
                    } else {
                        this.log(`${api.name} ${this.getTranslation('api_error_status')}: ${response.status} ${response.statusText}`, 'error');
                    }
                } catch (error) {
                    this.log(`${api.name} ${this.getTranslation('api_error_status')}: ${error.message}`, 'error');
                }
            }

            throw new Error('Всі API endpoints не працюють');
            
        } catch (error) {
            this.log(`${this.getTranslation('api_error_message')}: ${error.message}`, 'error');
            return {
                success: false,
                error: error.message
            };
        }
    }

    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    displayImage(imageData) {
        // Очищаємо контейнер
        this.imageContainer.innerHTML = '';
        
        // Якщо imageData - масив (кілька зображень)
        if (Array.isArray(imageData)) {
            imageData.forEach((imgData, index) => {
                const img = this.createImageElement(imgData, index + 1);
                this.imageContainer.appendChild(img);
            });
        } else {
            // Одне зображення
            const img = this.createImageElement(imageData, 1);
            this.imageContainer.appendChild(img);
        }
    }

    createImageElement(imageData, index) {
        // Створюємо контейнер для зображення
        const imageWrapper = document.createElement('div');
        imageWrapper.style.marginBottom = '20px';
        imageWrapper.style.border = '2px solid rgba(77, 171, 247, 0.3)';
        imageWrapper.style.borderRadius = '12px';
        imageWrapper.style.padding = '10px';
        imageWrapper.style.backgroundColor = 'rgba(77, 171, 247, 0.05)';
        
        // Додаємо номер зображення якщо їх кілька
        if (index > 1) {
            const label = document.createElement('div');
            label.textContent = `${this.getTranslation('image')} ${index}`;
            label.style.color = '#4dabf7';
            label.style.fontSize = '14px';
            label.style.marginBottom = '8px';
            label.style.fontWeight = '600';
            label.style.textAlign = 'center';
            imageWrapper.appendChild(label);
        }
        
        const img = document.createElement('img');
        img.src = imageData;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.borderRadius = '8px';
        img.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        img.style.transition = 'all 0.3s ease';
        img.style.display = 'block';
        img.style.margin = '0 auto';
        
        // Додаємо обробку помилок завантаження
        img.onerror = () => {
            this.log(`${this.getTranslation('image_load_error')} ${index}`, 'error');
            this.showError(`Помилка завантаження зображення ${index}`);
        };
        
        img.onload = () => {
            this.log(`${this.getLocalizedMessage('image_generated')} ${index} ${this.getLocalizedMessage('image_loaded')}`);
        };
        
        imageWrapper.appendChild(img);
        return imageWrapper;
    }

    saveImage() {
        if (!this.currentImageData) {
            this.showError('Немає зображення для збереження!');
            return;
        }

        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            
            // Якщо кілька зображень
            if (Array.isArray(this.currentImageData)) {
                this.currentImageData.forEach((imageData, index) => {
                    const filename = `generated-image-${timestamp}-${index + 1}.jpg`;
                    this.downloadImage(imageData, filename);
                });
                this.setStatus(`Збережено ${this.currentImageData.length} зображень успішно!`, 'success');
                this.log(`${this.getTranslation('saved_count_images')} ${this.currentImageData.length} ${this.getTranslation('images_successfully')}`);
            } else {
                // Одне зображення
                const filename = `generated-image-${timestamp}.jpg`;
                this.downloadImage(this.currentImageData, filename);
                this.setStatus('Зображення збережено успішно!', 'success');
                this.log(`${this.getTranslation('image_saved')}: ${filename}`);
            }
        } catch (error) {
            this.showError(`Помилка збереження: ${error.message}`);
            this.log(`${this.getTranslation('save_error')}: ${error.message}`, 'error');
        }
    }

    downloadImage(imageData, filename) {
        const link = document.createElement('a');
        link.href = imageData;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    setGenerating(generating) {
        this.generateBtn.disabled = generating;
        if (generating) {
            this.generateBtn.innerHTML = `<span class="loading"></span> ${this.getTranslation('generating')}`;
        } else {
            this.generateBtn.innerHTML = `<span class="btn-icon">⚡</span> ${this.getTranslation('generate')}`;
        }
    }

    showError(message) {
        this.setStatus(message, 'error');
    }

    setStatus(message, type) {
        // Remove existing status
        const existingStatus = document.querySelector('.status');
        if (existingStatus) {
            existingStatus.remove();
        }

        // Create new status
        const status = document.createElement('div');
        status.className = `status ${type}`;
        status.textContent = message;
        document.body.appendChild(status);

        // Show status
        setTimeout(() => status.classList.add('show'), 100);

        // Hide status after 3 seconds
        setTimeout(() => {
            status.classList.remove('show');
            setTimeout(() => status.remove(), 300);
        }, 3000);
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        this.logsArea.appendChild(logEntry);
        this.logsArea.scrollTop = this.logsArea.scrollHeight;

        // Keep only last 30 log entries
        const entries = this.logsArea.querySelectorAll('.log-entry');
        if (entries.length > 30) {
            entries[0].remove();
        }
    }

    getLocalizedMessage(key) {
        const messages = {
            uk: {
                'web_app_started': 'Веб-додаток запущено',
                'models_loaded': 'Моделі завантажено успішно',
                'starting_generation': 'Початок генерації',
                'model_selected': 'Модель',
                'size_selected': 'Розмір',
                'count_selected': 'Кількість',
                'generation_complete': 'Генерація завершена',
                'generation_error': 'Помилка генерації',
                'api_error': 'API помилка',
                'saving_images': 'Збереження зображень',
                'images_saved': 'Зображення збережено',
                'language_changed': 'Мова змінена на',
                'ukrainian': 'Українська',
                'english': 'English',
                'russian': 'Русский',
                'enhanced_prompt': 'Покращений промпт',
                'generating_image': 'Генеруємо зображення',
                'generated_successfully': 'зображень успішно',
                'failed_to_generate': 'Не вдалося згенерувати жодного зображення',
                'error': 'Помилка',
                'logs_cleared': 'Логи очищено',
                'preset_selected': 'Обрано пресет',
                'image_generated': 'Зображення',
                'successfully_generated': 'згенеровано успішно',
                'prompt_variation': 'Варіація промпту для зображення',
                'parameters_for': 'Параметри для зображення',
                'trying_api': 'Спробуємо',
                'received_response': 'отримано відповідь',
                'api_works': 'працює! Розмір зображення',
                'image_loaded': 'успішно завантажено',
                'random': 'випадковий',
                'image': 'Зображення',
                'generate': 'Генерувати',
                'generating': 'Генерується...',
                'save': 'Зберегти',
                'clear': 'Очистити',
                'hide': 'Сховати',
                'show': 'Показати',
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
                'language': 'Мова',
                'style_presets': 'Пресети стилів',
                'image_size': 'Розмір зображення',
                'width': 'Ширина',
                'height': 'Висота',
                'number_of_images': 'Кількість зображень',
                'enhance_image': 'Покращити якість зображення',
                'no_logo': 'Без логотипу Pollinations',
                'preview': 'Попередній перегляд'
            },
            en: {
                'web_app_started': 'Web application started',
                'models_loaded': 'Models loaded successfully',
                'starting_generation': 'Starting generation',
                'model_selected': 'Model',
                'size_selected': 'Size',
                'count_selected': 'Count',
                'generation_complete': 'Generation complete',
                'generation_error': 'Generation error',
                'api_error': 'API error',
                'saving_images': 'Saving images',
                'images_saved': 'Images saved',
                'language_changed': 'Language changed to',
                'ukrainian': 'Ukrainian',
                'english': 'English',
                'russian': 'Russian',
                'enhanced_prompt': 'Enhanced prompt',
                'generating_image': 'Generating image',
                'generated_successfully': 'images successfully',
                'failed_to_generate': 'Failed to generate any images',
                'error': 'Error',
                'logs_cleared': 'Logs cleared',
                'preset_selected': 'Preset selected',
                'image_generated': 'Image',
                'successfully_generated': 'generated successfully',
                'prompt_variation': 'Prompt variation for image',
                'parameters_for': 'Parameters for image',
                'trying_api': 'Trying',
                'received_response': 'received response',
                'api_works': 'works! Image size',
                'image_loaded': 'successfully loaded',
                'random': 'random',
                'image': 'Image',
                'generate': 'Generate',
                'generating': 'Generating...',
                'save': 'Save',
                'clear': 'Clear',
                'hide': 'Hide',
                'show': 'Show',
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
                'language': 'Language',
                'style_presets': 'Style Presets',
                'image_size': 'Image Size',
                'width': 'Width',
                'height': 'Height',
                'number_of_images': 'Number of Images',
                'enhance_image': 'Enhance image quality',
                'no_logo': 'No Pollinations logo',
                'preview': 'Preview'
            },
            ru: {
                'web_app_started': 'Веб-приложение запущено',
                'models_loaded': 'Модели загружены успешно',
                'starting_generation': 'Начало генерации',
                'model_selected': 'Модель',
                'size_selected': 'Размер',
                'count_selected': 'Количество',
                'generation_complete': 'Генерация завершена',
                'generation_error': 'Ошибка генерации',
                'api_error': 'API ошибка',
                'saving_images': 'Сохранение изображений',
                'images_saved': 'Изображения сохранены',
                'language_changed': 'Язык изменен на',
                'ukrainian': 'Украинский',
                'english': 'English',
                'russian': 'Русский',
                'enhanced_prompt': 'Улучшенный промпт',
                'generating_image': 'Генерируем изображение',
                'generated_successfully': 'изображений успешно',
                'failed_to_generate': 'Не удалось сгенерировать ни одного изображения',
                'error': 'Ошибка',
                'logs_cleared': 'Логи очищены',
                'preset_selected': 'Выбран пресет',
                'image_generated': 'Изображение',
                'successfully_generated': 'сгенерировано успешно',
                'prompt_variation': 'Вариация промпта для изображения',
                'parameters_for': 'Параметры для изображения',
                'trying_api': 'Пробуем',
                'received_response': 'получен ответ',
                'api_works': 'работает! Размер изображения',
                'image_loaded': 'успешно загружено',
                'random': 'случайный',
                'image': 'Изображение',
                'generate': 'Генерировать',
                'generating': 'Генерируется...',
                'save': 'Сохранить',
                'clear': 'Очистить',
                'hide': 'Скрыть',
                'show': 'Показать',
                'custom': 'Свой',
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
                'language': 'Язык',
                'style_presets': 'Стили пресетов',
                'image_size': 'Размер изображения',
                'width': 'Ширина',
                'height': 'Высота',
                'number_of_images': 'Количество изображений',
                'enhance_image': 'Улучшить качество изображения',
                'no_logo': 'Без логотипа Pollinations',
                'preview': 'Предварительный просмотр'
            }
        };
        
        // Якщо мова не підтримується, використовуємо англійську
        const lang = messages[this.currentLanguage] || messages['en'];
        return lang[key] || key;
    }

    clearLogs() {
        this.logsArea.innerHTML = '';
        this.log(this.getLocalizedMessage('logs_cleared'));
    }

    toggleLogs() {
        this.logsVisible = !this.logsVisible;
        const logsContent = this.logsArea;
        
        if (this.logsVisible) {
            logsContent.classList.remove('hidden');
            this.toggleLogsBtn.innerHTML = `<span class="btn-icon">👁️</span> ${this.getTranslation('hide')}`;
        } else {
            logsContent.classList.add('hidden');
            this.toggleLogsBtn.innerHTML = `<span class="btn-icon">👁️‍🗨️</span> ${this.getTranslation('show')}`;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageGenerator();
});

// Handle CORS proxy issues
window.addEventListener('error', (e) => {
    if (e.message.includes('CORS')) {
        console.warn('CORS proxy might be down. Try refreshing the page.');
    }
});
