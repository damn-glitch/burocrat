# Burocrat AI Service

Микросервис для OCR, генерации документов и ИИ анализа.

## Возможности

- **OCR** - распознавание текста из изображений и PDF (Tesseract)
- **Генерация документов**:
  - Счёт на оплату
  - Товарная накладная (ТОРГ-12)
  - Акт выполненных работ
- **ИИ анализ** (OpenAI GPT-4):
  - Анализ содержания документов
  - Извлечение структурированных данных
  - Классификация типа документа
  - Объяснение договоров понятным языком

## Установка

### Требования

- Python 3.10+
- Tesseract OCR
- Poppler (для PDF)

### Установка Tesseract (Windows)

1. Скачай установщик: https://github.com/UB-Mannheim/tesseract/wiki
2. Установи с русским языком
3. Добавь путь в PATH: `C:\Program Files\Tesseract-OCR`

### Установка Tesseract (Linux/Mac)

```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr tesseract-ocr-rus poppler-utils

# Mac
brew install tesseract tesseract-lang poppler
```

### Установка Python зависимостей

```bash
cd ai-service
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

## Конфигурация

Создай файл `.env`:

```env
# Server
HOST=0.0.0.0
PORT=8020

# Database
DATABASE_URL=postgresql://burokrat_user:7Vow1e2v0v7x@109.248.170.239:5432/burokrat

# OpenAI API (для ИИ функций)
OPENAI_API_KEY=sk-your-key-here

# Main backend
BACKEND_URL=http://localhost:8010

# Paths
UPLOAD_DIR=./uploads
GENERATED_DIR=./generated
```

## Запуск

```bash
# Development
python main.py

# или
uvicorn main:app --reload --port 8020
```

Сервис будет доступен на http://localhost:8020

## API Документация

После запуска откройте:
- Swagger UI: http://localhost:8020/docs
- ReDoc: http://localhost:8020/redoc

## API Endpoints

### OCR

```
POST /ocr/process          - Распознавание из файла
POST /ocr/process-base64   - Распознавание из base64
```

### Генерация документов

```
POST /generate/invoice         - Счёт на оплату
POST /generate/waybill         - Товарная накладная
POST /generate/completion-act  - Акт выполненных работ
GET  /generate/download/{file} - Скачать документ
```

### ИИ Анализ

```
POST /ai/analyze              - Полный анализ документа
POST /ai/explain-contract     - Объяснение договора
POST /ai/extract-for-generation - Извлечение данных для генерации
POST /ai/classify             - Классификация типа
POST /ai/summarize            - Краткое описание
```

## Примеры использования

### OCR

```bash
curl -X POST "http://localhost:8020/ocr/process" \
  -F "file=@document.jpg" \
  -F "language=rus+eng"
```

### Генерация счёта

```bash
curl -X POST "http://localhost:8020/generate/invoice" \
  -H "Content-Type: application/json" \
  -d '{
    "seller": {
      "name": "ООО Ромашка",
      "inn": "7701234567",
      "address": "г. Москва, ул. Примерная, д. 1"
    },
    "buyer": {
      "name": "ООО Покупатель",
      "inn": "7709876543"
    },
    "items": [
      {"name": "Услуга 1", "unit": "шт", "quantity": 1, "price": 10000}
    ],
    "invoice_date": "2024-01-15"
  }'
```

### ИИ Анализ

```bash
curl -X POST "http://localhost:8020/ai/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "СЧЁТ № 123 от 15.01.2024...",
    "analyze_type": "full"
  }'
```

## Docker

```bash
docker build -t burocrat-ai .
docker run -p 8020:8020 --env-file .env burocrat-ai
```

## Интеграция с основным backend

AI Service работает как отдельный микросервис. Основной Node.js backend может вызывать его API:

```javascript
// В Node.js backend
const response = await axios.post('http://localhost:8020/ocr/process', formData);
const result = await axios.post('http://localhost:8020/ai/analyze', { text, analyze_type: 'full' });
```
