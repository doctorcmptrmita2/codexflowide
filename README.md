# CodexFlow IDE

VSCodium tabanlı, AI destekli kod editörü.

## Özellikler
- 🚀 VSCodium tabanlı açık kaynak IDE
- 🤖 LiteLLM entegrasyonu ile AI asistan (gömülü)
- 💬 AI Chat sidebar
- 📖 Kod açıklama
- 🔧 Otomatik refactoring
- 🧪 Test oluşturma
- 🐛 Hata düzeltme

## Proje Yapısı

```
codexflow-ide/
├── .github/workflows/    # CI/CD pipeline
├── branding/             # Logo ve marka dosyaları
├── extensions/
│   └── codexflow-ai/     # Gömülü AI eklentisi
├── scripts/              # Build scriptleri
└── build.sh              # Lokal build
```

## Build

```bash
# GitHub Actions otomatik olarak derler
# Manuel build için:
./build.sh
```

## LiteLLM Kurulumu

```bash
pip install litellm
litellm --model gpt-4 --port 4000
```

## Ayarlar

IDE içinde `Cmd+,` ile ayarlara gidip `codexflow` arayın:
- `codexflow.apiEndpoint` - LiteLLM sunucu adresi
- `codexflow.apiKey` - API anahtarı
- `codexflow.model` - Kullanılacak model

## Lisans
MIT License
