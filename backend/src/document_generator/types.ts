// src/document_generator/types.ts

// Типы документов
export type DocumentType = 'invoice' | 'waybill' | 'completion_act';

// Статусы документов
export type DocumentStatus = 'draft' | 'signed' | 'sent' | 'paid' | 'cancelled';

// Информация о компании/контрагенте
export interface PartyInfo {
  name: string;
  inn?: string; // ИНН
  kpp?: string; // КПП
  ogrn?: string; // ОГРН
  address?: string;
  bank_name?: string;
  bank_bik?: string;
  bank_account?: string;
  correspondent_account?: string;
  phone?: string;
  email?: string;
  director?: string;
  accountant?: string;
}

// Товар/услуга в документе
export interface LineItem {
  name: string;
  description?: string;
  unit: string; // единица измерения (шт, кг, м и т.д.)
  quantity: number;
  price: number;
  vat_rate?: number; // Ставка НДС в процентах (0, 10, 20)
  vat_amount?: number;
  total: number;
}

// Данные для счёта на оплату
export interface InvoiceData {
  seller: PartyInfo;
  buyer: PartyInfo;
  items: LineItem[];
  invoice_date: string;
  due_date?: string;
  notes?: string;
  include_vat?: boolean;
}

// Данные для товарной накладной (ТОРГ-12)
export interface WaybillData {
  seller: PartyInfo;
  buyer: PartyInfo;
  shipper?: PartyInfo; // Грузоотправитель
  consignee?: PartyInfo; // Грузополучатель
  items: LineItem[];
  waybill_date: string;
  contract_number?: string;
  contract_date?: string;
  transport_info?: string;
  notes?: string;
}

// Данные для акта выполненных работ
export interface CompletionActData {
  executor: PartyInfo; // Исполнитель
  customer: PartyInfo; // Заказчик
  items: LineItem[];
  act_date: string;
  contract_number?: string;
  contract_date?: string;
  period_start?: string;
  period_end?: string;
  notes?: string;
}

// Общий тип данных документа
export type DocumentData = InvoiceData | WaybillData | CompletionActData;

// Результат генерации
export interface GenerationResult {
  id: number;
  type: DocumentType;
  number: string;
  pdf_buffer?: Buffer;
  pdf_url?: string;
  total_amount: number;
  currency: string;
}
