#!/usr/bin/env python3
"""
CodexFlow IDE Branding Script
VSCodium'u CodexFlow olarak yeniden markalar.
"""

import json
import os
import shutil
from pathlib import Path

VSCODIUM_DIR = Path("vscodium-src")
BRANDING_DIR = Path("branding")

# Marka değişiklikleri
REPLACEMENTS = {
    "VSCodium": "CodexFlow",
    "vscodium": "codexflow",
    "VSCode": "CodexFlow",
    "Visual Studio Code": "CodexFlow IDE",
}

def update_product_json():
    """product.json dosyasını güncelle"""
    product_path = VSCODIUM_DIR / "product.json"
    
    if not product_path.exists():
        print("product.json bulunamadı, şablon oluşturuluyor...")
        return
    
    with open(product_path, 'r', encoding='utf-8') as f:
        product = json.load(f)
    
    # Marka bilgilerini güncelle
    product.update({
        "nameShort": "CodexFlow",
        "nameLong": "CodexFlow IDE",
        "applicationName": "codexflow",
        "dataFolderName": ".codexflow",
        "win32MutexName": "codexflow",
        "licenseName": "MIT",
        "licenseUrl": "https://github.com/codexflow/codexflow-ide/blob/main/LICENSE",
        "win32DirName": "CodexFlow",
        "win32NameVersion": "CodexFlow",
        "win32AppUserModelId": "CodexFlow.CodexFlow",
        "darwinBundleIdentifier": "com.codexflow.ide",
    })
    
    with open(product_path, 'w', encoding='utf-8') as f:
        json.dump(product, f, indent=2)
    
    print("✓ product.json güncellendi")

def copy_icons():
    """Özel ikonları kopyala"""
    icons_src = BRANDING_DIR / "icons"
    
    if not icons_src.exists():
        print("⚠ Branding ikonları bulunamadı, varsayılan kullanılacak")
        return
    
    # İkon hedefleri
    targets = [
        VSCODIUM_DIR / "src/vs/workbench/browser/media",
        VSCODIUM_DIR / "resources/linux",
        VSCODIUM_DIR / "resources/darwin",
        VSCODIUM_DIR / "resources/win32",
    ]
    
    for target in targets:
        if target.exists():
            for icon in icons_src.glob("*"):
                shutil.copy2(icon, target)
    
    print("✓ İkonlar kopyalandı")

def update_package_json():
    """Ana package.json'ı güncelle"""
    pkg_path = VSCODIUM_DIR / "package.json"
    
    if not pkg_path.exists():
        return
    
    with open(pkg_path, 'r', encoding='utf-8') as f:
        pkg = json.load(f)
    
    pkg.update({
        "name": "codexflow",
        "productName": "CodexFlow",
        "author": {
            "name": "CodexFlow Team"
        }
    })
    
    with open(pkg_path, 'w', encoding='utf-8') as f:
        json.dump(pkg, f, indent=2)
    
    print("✓ package.json güncellendi")

def bundle_extensions():
    """CodexFlow AI eklentisini dahil et"""
    ext_src = Path("extensions/codexflow-ai")
    ext_dest = VSCODIUM_DIR / "extensions/codexflow-ai"
    
    if not ext_src.exists():
        print("⚠ CodexFlow AI eklentisi bulunamadı")
        return
    
    if ext_dest.exists():
        shutil.rmtree(ext_dest)
    
    shutil.copytree(ext_src, ext_dest)
    print("✓ CodexFlow AI eklentisi dahil edildi")

def main():
    print("=" * 50)
    print("CodexFlow IDE Branding")
    print("=" * 50)
    
    if not VSCODIUM_DIR.exists():
        print("HATA: vscodium-src dizini bulunamadı!")
        return 1
    
    update_product_json()
    update_package_json()
    copy_icons()
    bundle_extensions()
    
    print("=" * 50)
    print("✓ Branding tamamlandı!")
    print("=" * 50)
    return 0

if __name__ == "__main__":
    exit(main())
