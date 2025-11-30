from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import date
from enum import Enum


# ==================== Enums ====================

class DocumentType(str, Enum):
    INVOICE = "invoice"  # Счёт на оплату
    WAYBILL = "waybill"  # Накладная
    COMPLETION_ACT = "completion_act"  # Акт выполненных работ


class DocumentStatus(str, Enum):
    DRAFT = "draft"
    SIGNED = "signed"
    SENT = "sent"
    PAID = "paid"


# ==================== Party Info ====================

class PartyInfo(BaseModel):
    """Информация о контрагенте"""
    name: str = Field(..., description="Наименование организации")
    inn: Optional[str] = Field(None, description="ИНН")
    kpp: Optional[str] = Field(None, description="КПП")
    ogrn: Optional[str] = Field(None, description="ОГРН")
    address: Optional[str] = Field(None, description="Юридический адрес")
    bank_name: Optional[str] = Field(None, description="Название банка")
    bank_bik: Optional[str] = Field(None, description="БИК банка")
    bank_account: Optional[str] = Field(None, description="Расчётный счёт")
    corr_account: Optional[str] = Field(None, description="Корр. счёт")
    phone: Optional[str] = Field(None, description="Телефон")
    email: Optional[str] = Field(None, description="Email")
    director: Optional[str] = Field(None, description="ФИО директора")
    accountant: Optional[str] = Field(None, description="ФИО бухгалтера")


class LineItem(BaseModel):
    """Позиция в документе"""
    name: str = Field(..., description="Наименование товара/услуги")
    description: Optional[str] = Field(None, description="Описание")
    unit: str = Field("шт.", description="Единица измерения")
    quantity: float = Field(..., gt=0, description="Количество")
    price: float = Field(..., ge=0, description="Цена за единицу")
    vat_rate: Optional[float] = Field(None, description="Ставка НДС (%)")

    @property
    def total(self) -> float:
        return self.quantity * self.price

    @property
    def vat_amount(self) -> float:
        if self.vat_rate:
            return self.total * self.vat_rate / (100 + self.vat_rate)
        return 0.0


# ==================== Document Requests ====================

class InvoiceRequest(BaseModel):
    """Запрос на генерацию счёта на оплату"""
    seller: PartyInfo
    buyer: PartyInfo
    items: List[LineItem]
    invoice_date: date = Field(default_factory=date.today)
    due_date: Optional[date] = None
    notes: Optional[str] = None
    include_vat: bool = True
    company_id: Optional[int] = None


class WaybillRequest(BaseModel):
    """Запрос на генерацию товарной накладной"""
    seller: PartyInfo
    buyer: PartyInfo
    shipper: Optional[PartyInfo] = None  # Грузоотправитель
    consignee: Optional[PartyInfo] = None  # Грузополучатель
    items: List[LineItem]
    waybill_date: date = Field(default_factory=date.today)
    contract_number: Optional[str] = None
    contract_date: Optional[date] = None
    transport_info: Optional[str] = None
    company_id: Optional[int] = None


class CompletionActRequest(BaseModel):
    """Запрос на генерацию акта выполненных работ"""
    executor: PartyInfo  # Исполнитель
    customer: PartyInfo  # Заказчик
    items: List[LineItem]
    act_date: date = Field(default_factory=date.today)
    contract_number: Optional[str] = None
    contract_date: Optional[date] = None
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    notes: Optional[str] = None
    company_id: Optional[int] = None


# ==================== OCR ====================

class OCRRequest(BaseModel):
    """Запрос на OCR"""
    language: str = Field("rus+eng", description="Язык распознавания")
    company_id: Optional[int] = None


class OCRResponse(BaseModel):
    """Результат OCR"""
    success: bool
    text: Optional[str] = None
    confidence: Optional[float] = None
    processing_time_ms: int
    error: Optional[str] = None


# ==================== AI Analysis ====================

class AIAnalyzeRequest(BaseModel):
    """Запрос на анализ документа ИИ"""
    text: str = Field(..., min_length=10, description="Текст для анализа")
    analyze_type: str = Field("full", description="Тип анализа: full, summary, extract, classify")


class ExtractedEntity(BaseModel):
    """Извлечённая сущность"""
    type: str
    value: str
    confidence: Optional[float] = None


class AIAnalysisResponse(BaseModel):
    """Результат анализа ИИ"""
    success: bool
    document_type: Optional[str] = None
    summary: Optional[str] = None
    extracted_data: Optional[dict] = None
    entities: Optional[List[ExtractedEntity]] = None
    confidence: Optional[float] = None
    tokens_used: Optional[int] = None
    processing_time_ms: int
    error: Optional[str] = None


# ==================== Document Response ====================

class GeneratedDocument(BaseModel):
    """Сгенерированный документ"""
    success: bool
    document_type: DocumentType
    document_number: str
    file_path: str
    file_url: str
    total_amount: float
    currency: str = "RUB"
    error: Optional[str] = None
