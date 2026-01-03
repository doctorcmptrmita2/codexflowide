#!/bin/bash
# CodexFlow Icon Generator
# Gereksinim: ImageMagick (brew install imagemagick) veya Inkscape

set -e

ICONS_DIR="branding/icons"
SVG_FILE="$ICONS_DIR/codexflow.svg"

echo "CodexFlow Icon Generator"
echo "========================"

# ImageMagick ile PNG oluştur
if command -v convert &> /dev/null; then
    echo "ImageMagick ile PNG'ler oluşturuluyor..."
    
    convert -background none -resize 512x512 "$SVG_FILE" "$ICONS_DIR/codexflow-512.png"
    convert -background none -resize 256x256 "$SVG_FILE" "$ICONS_DIR/codexflow-256.png"
    convert -background none -resize 128x128 "$SVG_FILE" "$ICONS_DIR/codexflow-128.png"
    convert -background none -resize 64x64 "$SVG_FILE" "$ICONS_DIR/codexflow-64.png"
    convert -background none -resize 32x32 "$SVG_FILE" "$ICONS_DIR/codexflow-32.png"
    convert -background none -resize 16x16 "$SVG_FILE" "$ICONS_DIR/codexflow-16.png"
    
    # Ana PNG (512x512)
    cp "$ICONS_DIR/codexflow-512.png" "$ICONS_DIR/codexflow.png"
    
    echo "✓ PNG dosyaları oluşturuldu"
    
    # Windows ICO
    convert "$ICONS_DIR/codexflow-16.png" \
            "$ICONS_DIR/codexflow-32.png" \
            "$ICONS_DIR/codexflow-64.png" \
            "$ICONS_DIR/codexflow-128.png" \
            "$ICONS_DIR/codexflow-256.png" \
            "$ICONS_DIR/codexflow.ico"
    echo "✓ Windows ICO oluşturuldu"
    
else
    echo "⚠ ImageMagick bulunamadı. Yüklemek için:"
    echo "  macOS: brew install imagemagick"
    echo "  Ubuntu: sudo apt install imagemagick"
fi

# macOS ICNS (sadece macOS'ta)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "macOS ICNS oluşturuluyor..."
    
    ICONSET="$ICONS_DIR/codexflow.iconset"
    mkdir -p "$ICONSET"
    
    # iconset için gerekli boyutlar
    convert -background none -resize 16x16 "$SVG_FILE" "$ICONSET/icon_16x16.png"
    convert -background none -resize 32x32 "$SVG_FILE" "$ICONSET/icon_16x16@2x.png"
    convert -background none -resize 32x32 "$SVG_FILE" "$ICONSET/icon_32x32.png"
    convert -background none -resize 64x64 "$SVG_FILE" "$ICONSET/icon_32x32@2x.png"
    convert -background none -resize 128x128 "$SVG_FILE" "$ICONSET/icon_128x128.png"
    convert -background none -resize 256x256 "$SVG_FILE" "$ICONSET/icon_128x128@2x.png"
    convert -background none -resize 256x256 "$SVG_FILE" "$ICONSET/icon_256x256.png"
    convert -background none -resize 512x512 "$SVG_FILE" "$ICONSET/icon_256x256@2x.png"
    convert -background none -resize 512x512 "$SVG_FILE" "$ICONSET/icon_512x512.png"
    convert -background none -resize 1024x1024 "$SVG_FILE" "$ICONSET/icon_512x512@2x.png"
    
    iconutil -c icns "$ICONSET" -o "$ICONS_DIR/codexflow.icns"
    rm -rf "$ICONSET"
    
    echo "✓ macOS ICNS oluşturuldu"
fi

echo ""
echo "Oluşturulan dosyalar:"
ls -la "$ICONS_DIR"/*.{png,ico,icns} 2>/dev/null || true
