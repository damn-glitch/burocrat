"""
Burocrat AI Service
Микросервис для OCR, генерации документов и ИИ анализа
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.api import ocr, documents, ai


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events"""
    # Startup
    print(f"🚀 AI Service starting on {settings.host}:{settings.port}")
    print(f"📁 Upload dir: {settings.upload_dir}")
    print(f"📁 Generated dir: {settings.generated_dir}")
    print(f"🔑 OpenAI API: {'configured' if settings.openai_api_key else 'NOT configured'}")

    yield

    # Shutdown
    print("👋 AI Service shutting down")


app = FastAPI(
    title="Burocrat AI Service",
    description="""
## Микросервис для работы с документами

### Возможности:
- **OCR** - распознавание текста из изображений и PDF
- **Генерация документов** - счёт на оплату, накладная, акт выполненных работ
- **ИИ анализ** - анализ содержания документов, извлечение данных, объяснение договоров

### Интеграция
Этот сервис подключается к основному приложению Burocrat (Node.js backend на порту 8010).
    """,
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for generated documents
app.mount("/files", StaticFiles(directory=settings.generated_dir), name="files")

# Routers
app.include_router(ocr.router)
app.include_router(documents.router)
app.include_router(ai.router)


@app.get("/", tags=["Health"])
async def root():
    """Проверка работоспособности сервиса"""
    return {
        "service": "Burocrat AI Service",
        "status": "running",
        "version": "1.0.0",
        "openai_configured": bool(settings.openai_api_key)
    }


@app.get("/health", tags=["Health"])
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "openai": "configured" if settings.openai_api_key else "not configured"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )
