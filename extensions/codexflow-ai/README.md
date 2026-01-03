# CodexFlow AI Assistant

LiteLLM destekli AI kod asistanı.

## Özellikler

- 💬 **AI Chat** - Sidebar'da AI ile sohbet
- 📖 **Kod Açıklama** - Seçili kodu açıkla
- 🔧 **Refactor** - Kodu iyileştir
- 🧪 **Test Oluştur** - Otomatik test yaz
- 🐛 **Hata Düzelt** - Hataları tespit et ve düzelt

## Kısayollar

- `Cmd+Shift+A` (Mac) / `Ctrl+Shift+A` (Win/Linux) - Chat aç
- Sağ tık menüsünden AI komutlarına erişin

## Ayarlar

```json
{
  "codexflow.apiEndpoint": "http://localhost:4000",
  "codexflow.apiKey": "your-api-key",
  "codexflow.model": "gpt-4",
  "codexflow.maxTokens": 4096
}
```

## LiteLLM Kurulumu

```bash
pip install litellm
litellm --model gpt-4 --port 4000
```
