// src/ocr/service.ts
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '@src/http/errors';
import Tesseract from 'tesseract.js';
import path from 'path';
import fs from 'fs';

export interface OcrProcessResult {
  text: string;
  confidence: number;
  language: string;
  processingTime: number;
}

class OcrService {
  constructor(private db: PrismaClient) {}

  // Обработка изображения и распознавание текста
  async processImage(
    imagePath: string,
    userId?: number,
    companyId?: number,
    language: string = 'rus+eng'
  ): Promise<{ success: boolean; result: any }> {
    const startTime = Date.now();

    // Создаём запись в БД
    const ocrRecord = await this.db.ocr_result.create({
      data: {
        original_file: imagePath,
        status: 'processing',
        language,
        created_by: userId,
        company_id: companyId,
      },
    });

    try {
      // Проверяем существование файла
      if (!fs.existsSync(imagePath)) {
        throw new BadRequestError('Файл не найден');
      }

      // Распознаём текст с помощью Tesseract
      const result = await Tesseract.recognize(imagePath, language, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const processingTime = Date.now() - startTime;

      // Обновляем запись с результатом
      const updatedRecord = await this.db.ocr_result.update({
        where: { id: ocrRecord.id },
        data: {
          recognized_text: result.data.text,
          confidence: result.data.confidence,
          processing_time: processingTime,
          status: 'completed',
          metadata: {
            words: result.data.words?.length || 0,
            lines: result.data.lines?.length || 0,
            paragraphs: result.data.paragraphs?.length || 0,
          },
        },
      });

      return {
        success: true,
        result: {
          id: updatedRecord.id,
          text: result.data.text,
          confidence: result.data.confidence,
          processingTime,
          metadata: updatedRecord.metadata,
        },
      };
    } catch (error: any) {
      // Обновляем запись с ошибкой
      await this.db.ocr_result.update({
        where: { id: ocrRecord.id },
        data: {
          status: 'failed',
          error_message: error.message,
          processing_time: Date.now() - startTime,
        },
      });

      throw new BadRequestError(`Ошибка OCR: ${error.message}`);
    }
  }

  // Обработка base64 изображения
  async processBase64Image(
    base64Data: string,
    userId?: number,
    companyId?: number,
    language: string = 'rus+eng'
  ): Promise<{ success: boolean; result: any }> {
    const startTime = Date.now();

    // Создаём временный файл
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFileName = `ocr_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
    const tempFilePath = path.join(tempDir, tempFileName);

    try {
      // Удаляем префикс data:image/...;base64, если есть
      const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Clean, 'base64');
      fs.writeFileSync(tempFilePath, imageBuffer);

      // Обрабатываем изображение
      const result = await this.processImage(tempFilePath, userId, companyId, language);

      return result;
    } finally {
      // Удаляем временный файл
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  }

  // Получение результата OCR по ID
  async getById(id: number) {
    if (!id) throw new BadRequestError('ID обязателен');

    const result = await this.db.ocr_result.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true } },
        users: { select: { id: true, firstname: true, lastname: true } },
        ai_analysis: true,
      },
    });

    if (!result) throw new BadRequestError('Результат OCR не найден');
    return result;
  }

  // Получение списка OCR результатов по компании
  async getByCompany(companyId: number, page: number = 1, limit: number = 20) {
    if (!companyId) throw new BadRequestError('company_id обязателен');

    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      this.db.ocr_result.findMany({
        where: { company_id: companyId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          users: { select: { id: true, firstname: true, lastname: true } },
        },
      }),
      this.db.ocr_result.count({ where: { company_id: companyId } }),
    ]);

    return {
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Получение всех результатов OCR пользователя
  async getByUser(userId: number, page: number = 1, limit: number = 20) {
    if (!userId) throw new BadRequestError('user_id обязателен');

    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      this.db.ocr_result.findMany({
        where: { created_by: userId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          company: { select: { id: true, name: true } },
        },
      }),
      this.db.ocr_result.count({ where: { created_by: userId } }),
    ]);

    return {
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Удаление результата OCR
  async delete(id: number) {
    if (!id) throw new BadRequestError('ID обязателен');

    await this.db.ocr_result.delete({ where: { id } });
    return { success: true };
  }
}

export default OcrService;
