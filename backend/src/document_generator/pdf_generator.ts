// src/document_generator/pdf_generator.ts
import PDFDocument from 'pdfkit';
import {
  DocumentType,
  InvoiceData,
  WaybillData,
  CompletionActData,
  LineItem,
  PartyInfo,
} from './types';

// Утилита для форматирования чисел
const formatNumber = (num: number): string => {
  return num.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Утилита для форматирования даты
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
};

// Сумма прописью (упрощённая версия)
const numberToWords = (num: number): string => {
  const units = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
  const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
  const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
  const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];

  const rubles = Math.floor(num);
  const kopecks = Math.round((num - rubles) * 100);

  let result = '';

  if (rubles === 0) {
    result = 'ноль рублей';
  } else {
    const thousands = Math.floor(rubles / 1000);
    const remainder = rubles % 1000;

    if (thousands > 0) {
      if (thousands >= 100) {
        result += hundreds[Math.floor(thousands / 100)] + ' ';
      }
      const thousandRemainder = thousands % 100;
      if (thousandRemainder >= 10 && thousandRemainder < 20) {
        result += teens[thousandRemainder - 10] + ' тысяч ';
      } else {
        if (thousandRemainder >= 20) {
          result += tens[Math.floor(thousandRemainder / 10)] + ' ';
        }
        const lastDigit = thousandRemainder % 10;
        if (lastDigit === 1) result += 'одна тысяча ';
        else if (lastDigit === 2) result += 'две тысячи ';
        else if (lastDigit >= 3 && lastDigit <= 4) result += units[lastDigit] + ' тысячи ';
        else if (lastDigit >= 5 || lastDigit === 0) result += (lastDigit > 0 ? units[lastDigit] + ' ' : '') + 'тысяч ';
      }
    }

    if (remainder >= 100) {
      result += hundreds[Math.floor(remainder / 100)] + ' ';
    }
    const lastTwo = remainder % 100;
    if (lastTwo >= 10 && lastTwo < 20) {
      result += teens[lastTwo - 10] + ' ';
    } else {
      if (lastTwo >= 20) {
        result += tens[Math.floor(lastTwo / 10)] + ' ';
      }
      const lastDigit = lastTwo % 10;
      if (lastDigit > 0) {
        result += units[lastDigit] + ' ';
      }
    }

    const lastDigit = rubles % 10;
    const lastTwo2 = rubles % 100;
    if (lastTwo2 >= 11 && lastTwo2 <= 19) {
      result += 'рублей';
    } else if (lastDigit === 1) {
      result += 'рубль';
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      result += 'рубля';
    } else {
      result += 'рублей';
    }
  }

  result += ` ${kopecks.toString().padStart(2, '0')} копеек`;

  return result.charAt(0).toUpperCase() + result.slice(1);
};

export class PdfGenerator {
  private doc: typeof PDFDocument.prototype;

  constructor() {
    this.doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 40, left: 50, right: 50 },
      info: {
        Title: 'Document',
        Author: 'Burocrat System',
      },
    });
  }

  // Генерация счёта на оплату
  generateInvoice(data: InvoiceData, documentNumber: string): Buffer {
    const chunks: Buffer[] = [];

    this.doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Заголовок счёта
    this.doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .text(`СЧЁТ НА ОПЛАТУ № ${documentNumber}`, { align: 'center' });

    this.doc
      .font('Helvetica')
      .fontSize(10)
      .text(`от ${formatDate(data.invoice_date)}`, { align: 'center' });

    this.doc.moveDown(2);

    // Информация о продавце
    this.drawPartyInfo('Поставщик:', data.seller);
    this.doc.moveDown();

    // Информация о покупателе
    this.drawPartyInfo('Покупатель:', data.buyer);
    this.doc.moveDown(2);

    // Таблица товаров/услуг
    this.drawItemsTable(data.items, data.include_vat);

    // Итого
    const totals = this.calculateTotals(data.items, data.include_vat);
    this.doc.moveDown();
    this.drawTotals(totals, data.include_vat);

    // Сумма прописью
    this.doc.moveDown();
    this.doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(`Всего наименований ${data.items.length}, на сумму ${formatNumber(totals.total)} руб.`);
    this.doc.font('Helvetica').text(numberToWords(totals.total));

    // Примечания
    if (data.notes) {
      this.doc.moveDown();
      this.doc.font('Helvetica').fontSize(9).text(`Примечание: ${data.notes}`);
    }

    // Срок оплаты
    if (data.due_date) {
      this.doc.moveDown();
      this.doc.font('Helvetica-Bold').fontSize(10).text(`Срок оплаты: ${formatDate(data.due_date)}`);
    }

    // Подписи
    this.doc.moveDown(3);
    this.drawSignatures(data.seller.director, data.seller.accountant);

    this.doc.end();

    return Buffer.concat(chunks);
  }

  // Генерация товарной накладной
  generateWaybill(data: WaybillData, documentNumber: string): Buffer {
    const chunks: Buffer[] = [];

    this.doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Заголовок
    this.doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .text(`ТОВАРНАЯ НАКЛАДНАЯ № ${documentNumber}`, { align: 'center' });

    this.doc
      .font('Helvetica')
      .fontSize(10)
      .text(`от ${formatDate(data.waybill_date)}`, { align: 'center' });

    this.doc.moveDown(2);

    // Информация о сторонах
    this.drawPartyInfo('Поставщик:', data.seller);
    this.doc.moveDown(0.5);
    this.drawPartyInfo('Покупатель:', data.buyer);

    if (data.shipper && data.shipper.name !== data.seller.name) {
      this.doc.moveDown(0.5);
      this.drawPartyInfo('Грузоотправитель:', data.shipper);
    }

    if (data.consignee && data.consignee.name !== data.buyer.name) {
      this.doc.moveDown(0.5);
      this.drawPartyInfo('Грузополучатель:', data.consignee);
    }

    // Основание
    if (data.contract_number) {
      this.doc.moveDown();
      this.doc
        .font('Helvetica')
        .fontSize(10)
        .text(`Основание: Договор № ${data.contract_number} от ${data.contract_date || '-'}`);
    }

    this.doc.moveDown(2);

    // Таблица товаров
    this.drawItemsTable(data.items, true);

    // Итого
    const totals = this.calculateTotals(data.items, true);
    this.doc.moveDown();
    this.drawTotals(totals, true);

    // Сумма прописью
    this.doc.moveDown();
    this.doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(`Всего отпущено ${data.items.length} наименований на сумму ${formatNumber(totals.total)} руб.`);
    this.doc.font('Helvetica').text(numberToWords(totals.total));

    // Транспорт
    if (data.transport_info) {
      this.doc.moveDown();
      this.doc.font('Helvetica').fontSize(9).text(`Транспортная информация: ${data.transport_info}`);
    }

    // Подписи
    this.doc.moveDown(2);
    this.doc.font('Helvetica-Bold').fontSize(10).text('Отпуск разрешил:');
    this.doc.moveDown(0.5);
    this.drawSignatureLine('Директор', data.seller.director);

    this.doc.moveDown();
    this.doc.font('Helvetica-Bold').text('Груз принял:');
    this.doc.moveDown(0.5);
    this.drawSignatureLine('Представитель', '');

    this.doc.end();

    return Buffer.concat(chunks);
  }

  // Генерация акта выполненных работ
  generateCompletionAct(data: CompletionActData, documentNumber: string): Buffer {
    const chunks: Buffer[] = [];

    this.doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Заголовок
    this.doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .text(`АКТ № ${documentNumber}`, { align: 'center' });

    this.doc
      .font('Helvetica')
      .fontSize(12)
      .text('о приёмке выполненных работ (оказанных услуг)', { align: 'center' });

    this.doc
      .font('Helvetica')
      .fontSize(10)
      .text(`от ${formatDate(data.act_date)}`, { align: 'center' });

    this.doc.moveDown(2);

    // Информация о сторонах
    this.drawPartyInfo('Исполнитель:', data.executor);
    this.doc.moveDown(0.5);
    this.drawPartyInfo('Заказчик:', data.customer);

    // Основание
    if (data.contract_number) {
      this.doc.moveDown();
      this.doc
        .font('Helvetica')
        .fontSize(10)
        .text(`Основание: Договор № ${data.contract_number} от ${data.contract_date || '-'}`);
    }

    // Период
    if (data.period_start && data.period_end) {
      this.doc.moveDown(0.5);
      this.doc
        .font('Helvetica')
        .fontSize(10)
        .text(`Период: с ${formatDate(data.period_start)} по ${formatDate(data.period_end)}`);
    }

    this.doc.moveDown(2);

    // Таблица работ/услуг
    this.drawItemsTable(data.items, true);

    // Итого
    const totals = this.calculateTotals(data.items, true);
    this.doc.moveDown();
    this.drawTotals(totals, true);

    // Сумма прописью
    this.doc.moveDown();
    this.doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(`Итого оказано услуг (выполнено работ) на сумму: ${formatNumber(totals.total)} руб.`);
    this.doc.font('Helvetica').text(numberToWords(totals.total));

    // Заключение
    this.doc.moveDown(2);
    this.doc
      .font('Helvetica')
      .fontSize(10)
      .text(
        'Вышеперечисленные работы (услуги) выполнены полностью и в срок. Заказчик претензий по объёму, качеству и срокам оказания услуг не имеет.',
        { align: 'justify' }
      );

    // Подписи сторон
    this.doc.moveDown(3);

    const y = this.doc.y;
    const pageWidth = this.doc.page.width - 100;

    // Исполнитель
    this.doc.font('Helvetica-Bold').fontSize(10).text('ИСПОЛНИТЕЛЬ:', 50, y);
    this.doc.moveDown(0.5);
    this.drawSignatureLine('', data.executor.director || '');

    // Заказчик
    this.doc.font('Helvetica-Bold').fontSize(10).text('ЗАКАЗЧИК:', pageWidth / 2 + 50, y);
    this.doc.y = y + 25;
    this.doc.x = pageWidth / 2 + 50;
    this.drawSignatureLine('', data.customer.director || '');

    this.doc.end();

    return Buffer.concat(chunks);
  }

  // Вспомогательные методы
  private drawPartyInfo(label: string, party: PartyInfo): void {
    this.doc.font('Helvetica-Bold').fontSize(10).text(label);
    this.doc.font('Helvetica').fontSize(9);
    this.doc.text(`${party.name}`);
    if (party.inn) this.doc.text(`ИНН: ${party.inn}${party.kpp ? `, КПП: ${party.kpp}` : ''}`);
    if (party.address) this.doc.text(`Адрес: ${party.address}`);
    if (party.bank_name) {
      this.doc.text(`Банк: ${party.bank_name}, БИК: ${party.bank_bik || '-'}`);
      this.doc.text(`Р/с: ${party.bank_account || '-'}, К/с: ${party.correspondent_account || '-'}`);
    }
    if (party.phone) this.doc.text(`Тел: ${party.phone}`);
  }

  private drawItemsTable(items: LineItem[], includeVat?: boolean): void {
    const tableTop = this.doc.y;
    const colWidths = includeVat
      ? [30, 180, 50, 60, 70, 50, 60]
      : [30, 220, 60, 70, 120];
    const headers = includeVat
      ? ['№', 'Наименование', 'Ед.', 'Кол-во', 'Цена', 'НДС', 'Сумма']
      : ['№', 'Наименование', 'Ед.', 'Кол-во', 'Сумма'];

    // Заголовки таблицы
    this.doc.font('Helvetica-Bold').fontSize(9);
    let x = 50;
    headers.forEach((header, i) => {
      this.doc.text(header, x, tableTop, { width: colWidths[i], align: 'center' });
      x += colWidths[i];
    });

    // Линия под заголовками
    this.doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Строки таблицы
    this.doc.font('Helvetica').fontSize(8);
    let y = tableTop + 20;

    items.forEach((item, index) => {
      x = 50;
      const row = includeVat
        ? [
            (index + 1).toString(),
            item.name,
            item.unit,
            item.quantity.toString(),
            formatNumber(item.price),
            item.vat_rate ? `${item.vat_rate}%` : '-',
            formatNumber(item.total),
          ]
        : [
            (index + 1).toString(),
            item.name,
            item.unit,
            item.quantity.toString(),
            formatNumber(item.total),
          ];

      row.forEach((cell, i) => {
        this.doc.text(cell, x, y, { width: colWidths[i], align: i === 1 ? 'left' : 'center' });
        x += colWidths[i];
      });

      y += 15;
    });

    // Линия под таблицей
    this.doc.moveTo(50, y).lineTo(550, y).stroke();
    this.doc.y = y + 5;
  }

  private calculateTotals(items: LineItem[], includeVat?: boolean): { subtotal: number; vat: number; total: number } {
    let subtotal = 0;
    let vat = 0;

    items.forEach((item) => {
      subtotal += item.total;
      if (includeVat && item.vat_rate) {
        vat += item.vat_amount || (item.total * item.vat_rate) / (100 + item.vat_rate);
      }
    });

    return {
      subtotal: includeVat ? subtotal - vat : subtotal,
      vat,
      total: subtotal,
    };
  }

  private drawTotals(totals: { subtotal: number; vat: number; total: number }, includeVat?: boolean): void {
    const x = 400;
    this.doc.font('Helvetica').fontSize(10);

    if (includeVat && totals.vat > 0) {
      this.doc.text(`Итого без НДС: ${formatNumber(totals.subtotal)} руб.`, x);
      this.doc.text(`В т.ч. НДС: ${formatNumber(totals.vat)} руб.`, x);
    }

    this.doc.font('Helvetica-Bold').text(`ИТОГО: ${formatNumber(totals.total)} руб.`, x);
  }

  private drawSignatures(director?: string, accountant?: string): void {
    this.doc.font('Helvetica-Bold').fontSize(10);

    this.drawSignatureLine('Руководитель', director || '');
    this.doc.moveDown();
    this.drawSignatureLine('Главный бухгалтер', accountant || '');

    this.doc.moveDown(2);
    this.doc.font('Helvetica').fontSize(8).text('М.П.', { align: 'left' });
  }

  private drawSignatureLine(title: string, name: string): void {
    const y = this.doc.y;
    this.doc.font('Helvetica').fontSize(10);

    if (title) {
      this.doc.text(title, 50, y);
    }

    // Линия для подписи
    this.doc.moveTo(150, y + 10).lineTo(300, y + 10).stroke();
    this.doc.fontSize(8).text('(подпись)', 200, y + 12);

    // Расшифровка
    this.doc.moveTo(320, y + 10).lineTo(500, y + 10).stroke();
    if (name) {
      this.doc.fontSize(10).text(name, 350, y - 2);
    }
    this.doc.fontSize(8).text('(ФИО)', 390, y + 12);

    this.doc.y = y + 25;
  }
}

export default PdfGenerator;
