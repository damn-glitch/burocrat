"""
Document Generation API endpoints
"""
import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.config import settings
from app.services.document_generator import document_generator
from app.models.schemas import (
    InvoiceRequest, WaybillRequest, CompletionActRequest,
    GeneratedDocument, DocumentType
)

router = APIRouter(prefix="/generate", tags=["Document Generation"])


@router.post("/invoice", response_model=GeneratedDocument)
async def generate_invoice(data: InvoiceRequest):
    """
    Генерация счёта на оплату

    Создаёт PDF документ счёта на оплату с указанными данными.
    """
    try:
        file_path, doc_number, total = document_generator.generate_invoice(data)

        return GeneratedDocument(
            success=True,
            document_type=DocumentType.INVOICE,
            document_number=doc_number,
            file_path=file_path,
            file_url=f"/files/{os.path.basename(file_path)}",
            total_amount=total,
            currency="RUB"
        )

    except Exception as e:
        return GeneratedDocument(
            success=False,
            document_type=DocumentType.INVOICE,
            document_number="",
            file_path="",
            file_url="",
            total_amount=0,
            error=str(e)
        )


@router.post("/waybill", response_model=GeneratedDocument)
async def generate_waybill(data: WaybillRequest):
    """
    Генерация товарной накладной

    Создаёт PDF документ товарной накладной (ТОРГ-12).
    """
    try:
        file_path, doc_number, total = document_generator.generate_waybill(data)

        return GeneratedDocument(
            success=True,
            document_type=DocumentType.WAYBILL,
            document_number=doc_number,
            file_path=file_path,
            file_url=f"/files/{os.path.basename(file_path)}",
            total_amount=total,
            currency="RUB"
        )

    except Exception as e:
        return GeneratedDocument(
            success=False,
            document_type=DocumentType.WAYBILL,
            document_number="",
            file_path="",
            file_url="",
            total_amount=0,
            error=str(e)
        )


@router.post("/completion-act", response_model=GeneratedDocument)
async def generate_completion_act(data: CompletionActRequest):
    """
    Генерация акта выполненных работ

    Создаёт PDF документ акта приёмки выполненных работ (оказанных услуг).
    """
    try:
        file_path, doc_number, total = document_generator.generate_completion_act(data)

        return GeneratedDocument(
            success=True,
            document_type=DocumentType.COMPLETION_ACT,
            document_number=doc_number,
            file_path=file_path,
            file_url=f"/files/{os.path.basename(file_path)}",
            total_amount=total,
            currency="RUB"
        )

    except Exception as e:
        return GeneratedDocument(
            success=False,
            document_type=DocumentType.COMPLETION_ACT,
            document_number="",
            file_path="",
            file_url="",
            total_amount=0,
            error=str(e)
        )


@router.get("/download/{filename}")
async def download_document(filename: str):
    """
    Скачивание сгенерированного документа
    """
    file_path = os.path.join(settings.generated_dir, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Файл не найден")

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/pdf"
    )
