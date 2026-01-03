#!/bin/bash
# CodexFlow IDE Local Build Script

set -e

echo "=========================================="
echo "CodexFlow IDE Build"
echo "=========================================="

# VSCodium'u klonla
if [ ! -d "vscodium-src" ]; then
    echo "VSCodium klonlanıyor..."
    git clone --depth 1 https://github.com/VSCodium/vscodium.git vscodium-src
fi

# Branding uygula
echo "Branding uygulanıyor..."
python3 scripts/apply-branding.py

# Build
cd vscodium-src
echo "Build başlıyor..."
export SHOULD_BUILD="yes"
export CI_BUILD="no"

./get_repo.sh
./build.sh

echo "=========================================="
echo "Build tamamlandı!"
echo "=========================================="
