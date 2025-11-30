// src/ai_analyzer/service.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { BadRequestError } from '@src/http/errors';
import OpenAI from 'openai';

// Типы для анализа документов
export interface DocumentAnalysisResult {
  document_type: string;
  summary: string;
  extracted_data: ExtractedData;
  entities: ExtractedEntities;
  confidence: number;
}

export interface ExtractedData {
  document_number?: string;
  document_date?: string;
  total_amount?: number;
  currency?: string;
  seller?: PartyData;
  buyer?: PartyData;
  items?: ItemData[];
  payment_details?: PaymentDetails;
  [key: string]: any;
}

export interface PartyData {
  name?: string;
  inn?: string;
  kpp?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface ItemData {
  name: string;
  quantity?: number;
  unit?: string;
  price?: number;
  total?: number;
}

export interface PaymentDetails {
  bank_name?: string;
  bank_bik?: string;
  account_number?: string;
  correspondent_account?: string;
}

export interface ExtractedEntities {
  dates: string[];
  amounts: { value: number; currency: string }[];
  organizations: string[];
  persons: string[];
  inn_numbers: string[];
  phone_numbers: string[];
  emails: string[];
}

class AiAnalyzerService {
  private openai: OpenAI | null = null;

  constructor(private db: PrismaClient) {
    // Инициализируем OpenAI клиент, если есть API ключ
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  // Проверка доступности ИИ
  private checkAiAvailability(): void {
    if (!this.openai) {
      throw new BadRequestError('OpenAI API ключ не настроен. Установите OPENAI_API_KEY в переменных окружения.');
    }
  }

  // Анализ текста документа с помощью ИИ
  async analyzeDocument(
    text: string,
    ocrResultId?: number,
    userId?: number
  ): Promise<{ success: boolean; analysis: any }> {
    this.checkAiAvailability();

    const startTime = Date.now();

    // Создаём запись в БД
    const analysisRecord = await this.db.ai_document_analysis.create({
      data: {
        ocr_result_id: ocrResultId,
        status: 'processing',
        created_by: userId,
      },
    });

    try {
      // Промпт для анализа документа
      const systemPrompt = `Ты - эксперт по анализу российских бухгалтерских и юридических документов.
Твоя задача - проанализировать текст документа и извлечь из него структурированную информацию.

Определи тип документа (счёт на оплату, накладная, акт выполненных работ, договор, счёт-фактура и т.д.) и извлеки следующую информацию:
1. Номер и дата документа
2. Информация о продавце/исполнителе (название, ИНН, КПП, адрес, банковские реквизиты)
3. Информация о покупателе/заказчике
4. Список товаров/услуг с ценами и количеством
5. Итоговая сумма
6. Важные даты, упомянутые в документе
7. Контактная информация

Верни результат в формате JSON.`;

      const userPrompt = `Проанализируй следующий текст документа и извлеки структурированную информацию:

${text}

Верни результат в следующем JSON формате:
{
  "document_type": "тип документа",
  "summary": "краткое описание документа (1-2 предложения)",
  "extracted_data": {
    "document_number": "номер документа",
    "document_date": "дата документа в формате YYYY-MM-DD",
    "total_amount": числовое значение итоговой суммы,
    "currency": "валюта (RUB, USD, EUR и т.д.)",
    "seller": {
      "name": "название продавца",
      "inn": "ИНН",
      "kpp": "КПП",
      "address": "адрес",
      "phone": "телефон",
      "email": "email"
    },
    "buyer": {
      "name": "название покупателя",
      "inn": "ИНН",
      "kpp": "КПП",
      "address": "адрес"
    },
    "items": [
      {
        "name": "наименование товара/услуги",
        "quantity": количество,
        "unit": "единица измерения",
        "price": цена за единицу,
        "total": сумма
      }
    ],
    "payment_details": {
      "bank_name": "название банка",
      "bank_bik": "БИК",
      "account_number": "расчётный счёт",
      "correspondent_account": "корреспондентский счёт"
    }
  },
  "entities": {
    "dates": ["список всех дат в документе"],
    "amounts": [{"value": сумма, "currency": "валюта"}],
    "organizations": ["список организаций"],
    "persons": ["список ФИО"],
    "inn_numbers": ["список ИНН"],
    "phone_numbers": ["список телефонов"],
    "emails": ["список email"]
  },
  "confidence": число от 0 до 100 - уверенность в анализе
}`;

      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      const processingTime = Date.now() - startTime;
      const responseText = completion.choices[0]?.message?.content || '{}';
      const analysisResult = JSON.parse(responseText) as DocumentAnalysisResult;

      // Обновляем запись с результатом
      const updatedRecord = await this.db.ai_document_analysis.update({
        where: { id: analysisRecord.id },
        data: {
          document_type: analysisResult.document_type,
          extracted_data: analysisResult.extracted_data as unknown as Prisma.InputJsonValue,
          summary: analysisResult.summary,
          entities: analysisResult.entities as unknown as Prisma.InputJsonValue,
          confidence: new Prisma.Decimal(analysisResult.confidence || 0),
          model_used: 'gpt-4o-mini',
          tokens_used: completion.usage?.total_tokens,
          processing_time: processingTime,
          status: 'completed',
        },
      });

      return {
        success: true,
        analysis: {
          id: updatedRecord.id,
          ...analysisResult,
          processing_time: processingTime,
          tokens_used: completion.usage?.total_tokens,
        },
      };
    } catch (error: any) {
      // Обновляем запись с ошибкой
      await this.db.ai_document_analysis.update({
        where: { id: analysisRecord.id },
        data: {
          status: 'failed',
          error_message: error.message,
          processing_time: Date.now() - startTime,
        },
      });

      throw new BadRequestError(`Ошибка анализа ИИ: ${error.message}`);
    }
  }

  // Анализ OCR результата
  async analyzeOcrResult(ocrResultId: number, userId?: number): Promise<{ success: boolean; analysis: any }> {
    const ocrResult = await this.db.ocr_result.findUnique({
      where: { id: ocrResultId },
    });

    if (!ocrResult) {
      throw new BadRequestError('OCR результат не найден');
    }

    if (!ocrResult.recognized_text) {
      throw new BadRequestError('OCR результат не содержит распознанного текста');
    }

    return this.analyzeDocument(ocrResult.recognized_text, ocrResultId, userId);
  }

  // Извлечение данных для генерации документа
  async extractForGeneration(
    text: string,
    targetDocumentType: 'invoice' | 'waybill' | 'completion_act'
  ): Promise<{ success: boolean; data: any }> {
    this.checkAiAvailability();

    const documentTypeNames = {
      invoice: 'счёт на оплату',
      waybill: 'товарная накладная',
      completion_act: 'акт выполненных работ',
    };

    const systemPrompt = `Ты - эксперт по российским бухгалтерским документам.
Извлеки из текста данные, необходимые для генерации документа типа "${documentTypeNames[targetDocumentType]}".
Если какие-то данные отсутствуют, оставь поля пустыми или null.`;

    const userPrompt = `Извлеки данные для генерации ${documentTypeNames[targetDocumentType]} из следующего текста:

${text}

Верни результат в JSON формате, готовом для использования в API генерации документа.`;

    const completion = await this.openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const extractedData = JSON.parse(responseText);

    return {
      success: true,
      data: extractedData,
    };
  }

  // Классификация типа документа
  async classifyDocument(text: string): Promise<{ success: boolean; classification: any }> {
    this.checkAiAvailability();

    const systemPrompt = `Ты - эксперт по классификации российских документов.
Определи тип документа на основе его текста.`;

    const userPrompt = `Определи тип следующего документа:

${text.substring(0, 2000)}

Верни результат в JSON формате:
{
  "document_type": "тип документа на английском (invoice, waybill, completion_act, contract, bill, receipt, unknown)",
  "document_type_ru": "тип документа на русском",
  "confidence": число от 0 до 100,
  "reasoning": "краткое объяснение классификации"
}`;

    const completion = await this.openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const classification = JSON.parse(responseText);

    return {
      success: true,
      classification,
    };
  }

  // Суммаризация документа
  async summarizeDocument(text: string): Promise<{ success: boolean; summary: string }> {
    this.checkAiAvailability();

    const completion = await this.openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Ты - эксперт по анализу документов. Создай краткое резюме документа на русском языке.',
        },
        {
          role: 'user',
          content: `Создай краткое резюме (3-5 предложений) следующего документа:\n\n${text}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const summary = completion.choices[0]?.message?.content || 'Не удалось создать резюме';

    return {
      success: true,
      summary,
    };
  }

  // Получение анализа по ID
  async getById(id: number) {
    if (!id) throw new BadRequestError('ID обязателен');

    const analysis = await this.db.ai_document_analysis.findUnique({
      where: { id },
      include: {
        ocr_result: true,
        users: { select: { id: true, firstname: true, lastname: true } },
      },
    });

    if (!analysis) throw new BadRequestError('Анализ не найден');
    return analysis;
  }

  // Получение анализов по OCR результату
  async getByOcrResult(ocrResultId: number) {
    if (!ocrResultId) throw new BadRequestError('ocr_result_id обязателен');

    return this.db.ai_document_analysis.findMany({
      where: { ocr_result_id: ocrResultId },
      orderBy: { created_at: 'desc' },
    });
  }

  // Получение анализов пользователя
  async getByUser(userId: number, page: number = 1, limit: number = 20) {
    if (!userId) throw new BadRequestError('user_id обязателен');

    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      this.db.ai_document_analysis.findMany({
        where: { created_by: userId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          ocr_result: { select: { id: true, original_file: true } },
        },
      }),
      this.db.ai_document_analysis.count({ where: { created_by: userId } }),
    ]);

    return {
      data: analyses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Удаление анализа
  async delete(id: number) {
    if (!id) throw new BadRequestError('ID обязателен');

    await this.db.ai_document_analysis.delete({ where: { id } });
    return { success: true };
  }
}

export default AiAnalyzerService;
