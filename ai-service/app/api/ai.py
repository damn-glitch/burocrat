"""
AI Analysis API endpoints
"""
from typing import Optional
from pydantic import BaseModel, Field

from fastapi import APIRouter, HTTPException

from app.services.ai_analyzer import ai_analyzer
from app.models.schemas import AIAnalyzeRequest, AIAnalysisResponse

router = APIRouter(prefix="/ai", tags=["AI Analysis"])


class AnalyzeTextRequest(BaseModel):
    """Запрос на анализ текста"""
    text: str = Field(..., min_length=10, description="Текст для анализа")
    analyze_type: str = Field("full", description="Тип анализа: full, summary, extract, classify")


class ExplainContractRequest(BaseModel):
    """Запрос на объяснение договора"""
    text: str = Field(..., min_length=50, description="Текст договора")


class ExtractForGenerationRequest(BaseModel):
    """Запрос на извлечение данных для генерации"""
    text: str = Field(..., min_length=10, description="Текст документа")
    target_type: str = Field(..., description="Тип документа: invoice, waybill, completion_act")


@router.post("/analyze")
async def analyze_document(request: AnalyzeTextRequest):
    """
    Анализ текста документа

    Типы анализа:
    - **full** - полный анализ (тип, данные, сущности, резюме)
    - **summary** - только краткое описание
    - **extract** - извлечение структурированных данных
    - **classify** - определение типа документа
    """
    if request.analyze_type not in ['full', 'summary', 'extract', 'classify']:
        raise HTTPException(
            status_code=400,
            detail="analyze_type должен быть: full, summary, extract, classify"
        )

    result = ai_analyzer.analyze_document(request.text, request.analyze_type)

    if not result.get('success', True):
        raise HTTPException(status_code=500, detail=result.get('error', 'Ошибка анализа'))

    return result


@router.post("/explain-contract")
async def explain_contract(request: ExplainContractRequest):
    """
    Объяснение договора понятным языком

    Анализирует договор и объясняет его содержание простым деловым языком.
    Выделяет ключевые условия, риски и важные моменты.
    """
    result = ai_analyzer.explain_contract(request.text)

    if not result.get('success'):
        raise HTTPException(status_code=500, detail=result.get('error', 'Ошибка анализа'))

    return result


@router.post("/extract-for-generation")
async def extract_for_generation(request: ExtractForGenerationRequest):
    """
    Извлечение данных для генерации документа

    Анализирует текст и извлекает структурированные данные,
    готовые для использования в генерации документа.

    Типы документов:
    - **invoice** - счёт на оплату
    - **waybill** - товарная накладная
    - **completion_act** - акт выполненных работ
    """
    if request.target_type not in ['invoice', 'waybill', 'completion_act']:
        raise HTTPException(
            status_code=400,
            detail="target_type должен быть: invoice, waybill, completion_act"
        )

    result = ai_analyzer.extract_for_generation(request.text, request.target_type)

    if not result.get('success'):
        raise HTTPException(status_code=500, detail=result.get('error', 'Ошибка извлечения'))

    return result


@router.post("/classify")
async def classify_document(text: str):
    """
    Классификация типа документа

    Определяет тип документа на основе его содержания.
    """
    result = ai_analyzer.analyze_document(text, "classify")

    if not result.get('success', True):
        raise HTTPException(status_code=500, detail=result.get('error', 'Ошибка классификации'))

    return result


@router.post("/summarize")
async def summarize_document(text: str):
    """
    Краткое описание документа

    Создаёт краткое резюме документа (3-5 предложений).
    """
    result = ai_analyzer.analyze_document(text, "summary")

    if not result.get('success', True):
        raise HTTPException(status_code=500, detail=result.get('error', 'Ошибка создания резюме'))

    return result
