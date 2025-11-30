"""
OCR API endpoints
"""
import os
import shutil
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.config import settings
from app.services.ocr_service import ocr_service
from app.models.schemas import OCRResponse

router = APIRouter(prefix="/ocr", tags=["OCR"])


@router.post("/process", response_model=OCRResponse)
async def process_image(
    file: UploadFile = File(..., description="Изображение или PDF для распознавания"),
    language: str = Form("rus+eng", description="Язык распознавания"),
    company_id: Optional[int] = Form(None, description="ID компании")
):
    """
    Распознавание текста из загруженного файла

    Поддерживаемые форматы: JPG, PNG, GIF, BMP, TIFF, WebP, PDF
    """
    # Сохраняем файл
    file_ext = os.path.splitext(file.filename)[1].lower()
    allowed_ext = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.pdf'}

    if file_ext not in allowed_ext:
        raise HTTPException(
            status_code=400,
            detail=f"Неподдерживаемый формат файла. Разрешены: {', '.join(allowed_ext)}"
        )

    # Сохраняем во временный файл
    temp_path = os.path.join(settings.upload_dir, f"ocr_{file.filename}")

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Обрабатываем
        text, confidence, processing_time = ocr_service.process_file(temp_path, language)

        return OCRResponse(
            success=True,
            text=text,
            confidence=confidence,
            processing_time_ms=processing_time
        )

    except Exception as e:
        return OCRResponse(
            success=False,
            error=str(e),
            processing_time_ms=0
        )

    finally:
        # Удаляем временный файл
        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.post("/process-base64", response_model=OCRResponse)
async def process_base64(
    image: str = Form(..., description="Base64 изображение"),
    language: str = Form("rus+eng", description="Язык распознавания")
):
    """
    Распознавание текста из base64 изображения
    """
    try:
        text, confidence, processing_time = ocr_service.process_base64(image, language)

        return OCRResponse(
            success=True,
            text=text,
            confidence=confidence,
            processing_time_ms=processing_time
        )

    except Exception as e:
        return OCRResponse(
            success=False,
            error=str(e),
            processing_time_ms=0
        )
