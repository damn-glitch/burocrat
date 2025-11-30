// src/document_generator/service.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { BadRequestError } from '@src/http/errors';
import { validateFields } from '@utils/additional';
import PdfGenerator from './pdf_generator';
import {
  DocumentType,
  DocumentStatus,
  InvoiceData,
  WaybillData,
  CompletionActData,
  LineItem,
  GenerationResult,
} from './types';
import fs from 'fs';
import path from 'path';

class DocumentGeneratorService {
  constructor(private db: PrismaClient) {}

  // Генерация номера документа
  private async generateDocumentNumber(type: DocumentType, companyId?: number): Promise<string> {
    const prefix = {
      invoice: 'СЧ',
      waybill: 'ТН',
      completion_act: 'АКТ',
    }[type];

    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');

    // Получаем количество документов данного типа за текущий год
    const count = await this.db.generated_document.count({
      where: {
        type,
        company_id: companyId,
        created_at: {
          gte: new Date(`${year}-01-01`),
        },
      },
    });

    const number = (count + 1).toString().padStart(4, '0');
    return `${prefix}-${year}${month}-${number}`;
  }

  // Расчёт итоговой суммы
  private calculateTotal(items: LineItem[]): number {
    return items.reduce((sum, item) => sum + item.total, 0);
  }

  // Валидация позиций документа
  private validateItems(items: LineItem[]): void {
    if (!items || items.length === 0) {
      throw new BadRequestError('Документ должен содержать хотя бы одну позицию');
    }

    items.forEach((item, index) => {
      if (!item.name) throw new BadRequestError(`Позиция ${index + 1}: название обязательно`);
      if (!item.unit) throw new BadRequestError(`Позиция ${index + 1}: единица измерения обязательна`);
      if (item.quantity <= 0) throw new BadRequestError(`Позиция ${index + 1}: количество должно быть положительным`);
      if (item.price < 0) throw new BadRequestError(`Позиция ${index + 1}: цена не может быть отрицательной`);

      // Рассчитываем сумму, если не указана
      if (!item.total) {
        item.total = item.quantity * item.price;
      }

      // Рассчитываем НДС, если указана ставка
      if (item.vat_rate && !item.vat_amount) {
        item.vat_amount = (item.total * item.vat_rate) / (100 + item.vat_rate);
      }
    });
  }

  // Сохранение PDF файла
  private async savePdfFile(buffer: Buffer, documentNumber: string, type: DocumentType): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents', type);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${documentNumber.replace(/\//g, '-')}_${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);

    return `/uploads/documents/${type}/${fileName}`;
  }

  // ==================== Счёт на оплату ====================
  async generateInvoice(
    data: InvoiceData,
    userId?: number,
    companyId?: number
  ): Promise<GenerationResult> {
    validateFields(data, ['seller', 'buyer', 'items', 'invoice_date']);
    validateFields(data.seller, ['name']);
    validateFields(data.buyer, ['name']);
    this.validateItems(data.items);

    const documentNumber = await this.generateDocumentNumber('invoice', companyId);
    const totalAmount = this.calculateTotal(data.items);

    // Генерируем PDF
    const pdfGenerator = new PdfGenerator();
    const pdfBuffer = pdfGenerator.generateInvoice(data, documentNumber);

    // Сохраняем PDF
    const pdfUrl = await this.savePdfFile(pdfBuffer, documentNumber, 'invoice');

    // Сохраняем в БД
    const document = await this.db.generated_document.create({
      data: {
        type: 'invoice',
        number: documentNumber,
        status: 'draft',
        data: data as unknown as Prisma.InputJsonValue,
        pdf_url: pdfUrl,
        total_amount: new Prisma.Decimal(totalAmount),
        currency: 'RUB',
        company_id: companyId,
        created_by: userId,
      },
    });

    return {
      id: document.id,
      type: 'invoice',
      number: documentNumber,
      pdf_url: pdfUrl,
      total_amount: totalAmount,
      currency: 'RUB',
    };
  }

  // ==================== Товарная накладная ====================
  async generateWaybill(
    data: WaybillData,
    userId?: number,
    companyId?: number
  ): Promise<GenerationResult> {
    validateFields(data, ['seller', 'buyer', 'items', 'waybill_date']);
    validateFields(data.seller, ['name']);
    validateFields(data.buyer, ['name']);
    this.validateItems(data.items);

    const documentNumber = await this.generateDocumentNumber('waybill', companyId);
    const totalAmount = this.calculateTotal(data.items);

    // Генерируем PDF
    const pdfGenerator = new PdfGenerator();
    const pdfBuffer = pdfGenerator.generateWaybill(data, documentNumber);

    // Сохраняем PDF
    const pdfUrl = await this.savePdfFile(pdfBuffer, documentNumber, 'waybill');

    // Сохраняем в БД
    const document = await this.db.generated_document.create({
      data: {
        type: 'waybill',
        number: documentNumber,
        status: 'draft',
        data: data as unknown as Prisma.InputJsonValue,
        pdf_url: pdfUrl,
        total_amount: new Prisma.Decimal(totalAmount),
        currency: 'RUB',
        company_id: companyId,
        created_by: userId,
      },
    });

    return {
      id: document.id,
      type: 'waybill',
      number: documentNumber,
      pdf_url: pdfUrl,
      total_amount: totalAmount,
      currency: 'RUB',
    };
  }

  // ==================== Акт выполненных работ ====================
  async generateCompletionAct(
    data: CompletionActData,
    userId?: number,
    companyId?: number
  ): Promise<GenerationResult> {
    validateFields(data, ['executor', 'customer', 'items', 'act_date']);
    validateFields(data.executor, ['name']);
    validateFields(data.customer, ['name']);
    this.validateItems(data.items);

    const documentNumber = await this.generateDocumentNumber('completion_act', companyId);
    const totalAmount = this.calculateTotal(data.items);

    // Генерируем PDF
    const pdfGenerator = new PdfGenerator();
    const pdfBuffer = pdfGenerator.generateCompletionAct(data, documentNumber);

    // Сохраняем PDF
    const pdfUrl = await this.savePdfFile(pdfBuffer, documentNumber, 'completion_act');

    // Сохраняем в БД
    const document = await this.db.generated_document.create({
      data: {
        type: 'completion_act',
        number: documentNumber,
        status: 'draft',
        data: data as unknown as Prisma.InputJsonValue,
        pdf_url: pdfUrl,
        total_amount: new Prisma.Decimal(totalAmount),
        currency: 'RUB',
        company_id: companyId,
        created_by: userId,
      },
    });

    return {
      id: document.id,
      type: 'completion_act',
      number: documentNumber,
      pdf_url: pdfUrl,
      total_amount: totalAmount,
      currency: 'RUB',
    };
  }

  // ==================== CRUD операции ====================

  // Получение документа по ID
  async getById(id: number) {
    if (!id) throw new BadRequestError('ID обязателен');

    const document = await this.db.generated_document.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true } },
        users: { select: { id: true, firstname: true, lastname: true } },
      },
    });

    if (!document) throw new BadRequestError('Документ не найден');
    return document;
  }

  // Получение документов по компании
  async getByCompany(
    companyId: number,
    type?: DocumentType,
    page: number = 1,
    limit: number = 20
  ) {
    if (!companyId) throw new BadRequestError('company_id обязателен');

    const skip = (page - 1) * limit;
    const where: any = { company_id: companyId };
    if (type) where.type = type;

    const [documents, total] = await Promise.all([
      this.db.generated_document.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          users: { select: { id: true, firstname: true, lastname: true } },
        },
      }),
      this.db.generated_document.count({ where }),
    ]);

    return {
      data: documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Получение документов пользователя
  async getByUser(userId: number, type?: DocumentType, page: number = 1, limit: number = 20) {
    if (!userId) throw new BadRequestError('user_id обязателен');

    const skip = (page - 1) * limit;
    const where: any = { created_by: userId };
    if (type) where.type = type;

    const [documents, total] = await Promise.all([
      this.db.generated_document.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          company: { select: { id: true, name: true } },
        },
      }),
      this.db.generated_document.count({ where }),
    ]);

    return {
      data: documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Обновление статуса документа
  async updateStatus(id: number, status: DocumentStatus) {
    if (!id) throw new BadRequestError('ID обязателен');

    const validStatuses: DocumentStatus[] = ['draft', 'signed', 'sent', 'paid', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestError('Недопустимый статус');
    }

    const document = await this.db.generated_document.update({
      where: { id },
      data: { status, updated_at: new Date() },
    });

    return { success: true, document };
  }

  // Удаление документа
  async delete(id: number) {
    if (!id) throw new BadRequestError('ID обязателен');

    const document = await this.db.generated_document.findUnique({ where: { id } });
    if (!document) throw new BadRequestError('Документ не найден');

    // Удаляем PDF файл
    if (document.pdf_url) {
      const filePath = path.join(process.cwd(), document.pdf_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await this.db.generated_document.delete({ where: { id } });
    return { success: true };
  }

  // Скачивание PDF
  async downloadPdf(id: number): Promise<{ buffer: Buffer; fileName: string }> {
    if (!id) throw new BadRequestError('ID обязателен');

    const document = await this.db.generated_document.findUnique({ where: { id } });
    if (!document) throw new BadRequestError('Документ не найден');
    if (!document.pdf_url) throw new BadRequestError('PDF не найден');

    const filePath = path.join(process.cwd(), document.pdf_url);
    if (!fs.existsSync(filePath)) {
      throw new BadRequestError('Файл PDF не найден на сервере');
    }

    const buffer = fs.readFileSync(filePath);
    const fileName = `${document.type}_${document.number}.pdf`;

    return { buffer, fileName };
  }
}

export default DocumentGeneratorService;
