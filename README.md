# Image Generator

[![English](https://img.shields.io/badge/English-🇺🇸-blue)](README.md)
[![Українська](https://img.shields.io/badge/Українська-🇺🇦-yellow)](README.uk.md)

Desktop application for generating images using Pollinations.AI API.

**Created by Quilix** | [GitHub Repository](https://github.com/quil1x/image-generator)

## Features

- **Fast Generation**: Multiple AI models (Flux, Turbo, Midjourney)
- **Modern UI**: Dark theme with transparency effects
- **No Filtering**: Direct prompt processing without restrictions
- **Optimized**: Minimal resource usage and fast performance
- **Cross-Platform**: Works on Windows, macOS, Linux

## Installation

1. **Install Node.js** (v16 or higher)
2. **Clone repository**:
   ```bash
   git clone <repository-url>
   cd ImageBYquilix
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```

## Usage

1. **Start application**:
   ```bash
   npm start
   ```
   Or use batch file on Windows:
   ```bash
   .\start.bat
   ```

2. **Generate images**:
   - Enter your prompt in the text area
   - Select AI model (Flux recommended)
   - Click "Generate"
   - Save generated image with "Save" button

## Models

- **Flux**: High quality, recommended
- **Turbo**: Fast generation
- **Midjourney**: Alternative style

## Technical Details

- **Framework**: Electron
- **API**: Pollinations.AI
- **Size**: 1024x1024 (fixed)
- **Format**: PNG/JPEG
- **No Watermark**: Enabled by default

## License

Apache License 2.0 - see LICENSE file for details.

## Credits

- **Created by**: [@quil1x](https://github.com/quil1x)
- **Powered by**: [Pollinations.AI](https://pollinations.ai)
- **Repository**: [GitHub](https://github.com/quil1x/image-generator)