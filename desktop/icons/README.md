# Icon Files for FixMyDB Desktop

This directory contains the application icons used by Electron Builder for different platforms.

## Required Files

### Windows (.ico)
- File: `icon.ico`
- Size: 256x256 (recommended)
- Format: ICO with multiple sizes (16, 32, 48, 64, 128, 256)

### macOS (.icns)
- File: `icon.icns`
- Size: Should include: 16x16, 32x32, 64x64, 128x128, 256x256, 512x512
- Format: ICNS (macOS icon format)

### Linux
- File: `icon.png`
- Size: 1024x1024 (recommended for AppImage)
- Format: PNG

## How to Create Icons

### From the current favicon.svg
You can use the existing `frontend/public/favicon.svg` as the base:

**Windows & Linux:**
```bash
# Install ImageMagick (Windows) or use online converters
# Convert SVG to ICO (Windows)
magick convert frontend/public/favicon.svg icons/icon.ico

# Convert SVG to PNG (Linux)
magick convert frontend/public/favicon.svg icons/icon.png
```

**macOS:**
```bash
# Install icm (ImageMagick for macOS)
brew install imagemagick

# Create PNG first, then convert to ICNS
magick convert frontend/public/favicon.svg icons/icon.png
# Use a tool like 'iconutil' or Adobe Fireworks to create icon.icns
```

### Using Online Tools
1. **ICO Converter:** https://convertio.co/ico/svg/
2. **ICNS Converter:** https://icns.cc/ or use 'iconutil' on macOS

### Using Free Software
- **ImageMagick:** Cross-platform image manipulation tool
- **IcoFX:** Windows-only ICO editor
- **Icon Composer:** macOS built-in tool for creating .icns files

## Additional Notes

- The icon should be visually similar to the current FixMyDB favicon (blue and purple colors)
- For best results, maintain a square aspect ratio
- Ensure the icon looks good at all sizes
- macOS also supports .icns in .zip format - you can package multiple sizes in a zip

## After Creating Icons

1. Place the icon files in the `desktop/icons/` directory
2. Run the build command for each platform:
   - Windows: `npm run dist:win`
   - macOS: `npm run dist:mac`
   - Linux: `npm run dist:linux`

For more information about Electron Builder icons, see:
- https://www.electron.build/configuration/icon.html
- https://developer.apple.com/design/human-interface-guidelines/foundations/imagery-and-icons/
- https://specifications.freedesktop.org/icon-theme-spec/icon-theme-spec-latest.html
