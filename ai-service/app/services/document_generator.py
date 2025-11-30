"""
Document Generator Service - генерация PDF документов
Счёт на оплату, Накладная, Акт выполненных работ
"""
import os
from datetime import date, datetime
from typing import List, Optional
from decimal import Decimal

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from app.config import settings
from app.models.schemas import (
    InvoiceRequest, WaybillRequest, CompletionActRequest,
    PartyInfo, LineItem, DocumentType
)


class DocumentGenerator:
    """Генератор PDF документов"""

    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_fonts()
        self._setup_styles()

    def _setup_fonts(self):
        """Настройка шрифтов (для кириллицы)"""
        # Используем стандартный шрифт, который поддерживает кириллицу
        # В продакшене нужно добавить TTF шрифт
        pass

    def _setup_styles(self):
        """Настройка стилей"""
        self.styles.add(ParagraphStyle(
            name='TitleRu',
            fontName='Helvetica-Bold',
            fontSize=14,
            alignment=1,  # center
            spaceAfter=10
        ))
        self.styles.add(ParagraphStyle(
            name='Normal',
            fontName='Helvetica',
            fontSize=10,
            leading=12
        ))

    def _format_number(self, num: float) -> str:
        """Форматирование числа"""
        return f"{num:,.2f}".replace(",", " ").replace(".", ",")

    def _format_date(self, d: date) -> str:
        """Форматирование даты"""
        months = [
            '', 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ]
        return f"{d.day} {months[d.month]} {d.year} г."

    def _number_to_words(self, num: float) -> str:
        """Сумма прописью (упрощённая версия)"""
        rubles = int(num)
        kopecks = int((num - rubles) * 100)

        units = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']
        teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать',
                 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать']
        tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят',
                'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто']
        hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот',
                    'шестьсот', 'семьсот', 'восемьсот', 'девятьсот']

        if rubles == 0:
            result = 'ноль рублей'
        else:
            result = ''
            thousands = rubles // 1000
            remainder = rubles % 1000

            if thousands > 0:
                if thousands >= 100:
                    result += hundreds[thousands // 100] + ' '
                t_rem = thousands % 100
                if t_rem >= 10 and t_rem < 20:
                    result += teens[t_rem - 10] + ' тысяч '
                else:
                    if t_rem >= 20:
                        result += tens[t_rem // 10] + ' '
                    last = t_rem % 10
                    if last == 1:
                        result += 'одна тысяча '
                    elif last == 2:
                        result += 'две тысячи '
                    elif last in [3, 4]:
                        result += units[last] + ' тысячи '
                    elif last >= 5 or last == 0:
                        if last > 0:
                            result += units[last] + ' '
                        result += 'тысяч '

            if remainder >= 100:
                result += hundreds[remainder // 100] + ' '
            r_rem = remainder % 100
            if r_rem >= 10 and r_rem < 20:
                result += teens[r_rem - 10] + ' '
            else:
                if r_rem >= 20:
                    result += tens[r_rem // 10] + ' '
                last = r_rem % 10
                if last > 0:
                    result += units[last] + ' '

            # Определяем окончание "рублей"
            last_digit = rubles % 10
            last_two = rubles % 100
            if last_two >= 11 and last_two <= 19:
                result += 'рублей'
            elif last_digit == 1:
                result += 'рубль'
            elif last_digit in [2, 3, 4]:
                result += 'рубля'
            else:
                result += 'рублей'

        result += f' {kopecks:02d} копеек'
        return result.strip().capitalize()

    def _generate_doc_number(self, doc_type: str) -> str:
        """Генерация номера документа"""
        prefix = {
            'invoice': 'СЧ',
            'waybill': 'ТН',
            'completion_act': 'АКТ'
        }.get(doc_type, 'ДОК')

        now = datetime.now()
        return f"{prefix}-{now.strftime('%Y%m%d')}-{now.strftime('%H%M%S')}"

    def _calculate_totals(self, items: List[LineItem]) -> dict:
        """Расчёт итогов"""
        subtotal = sum(item.quantity * item.price for item in items)
        vat = sum(
            (item.quantity * item.price * item.vat_rate / (100 + item.vat_rate))
            if item.vat_rate else 0
            for item in items
        )
        return {
            'subtotal': subtotal - vat,
            'vat': vat,
            'total': subtotal
        }

    # ==================== Счёт на оплату ====================

    def generate_invoice(self, data: InvoiceRequest) -> tuple[str, str, float]:
        """
        Генерация счёта на оплату

        Returns:
            tuple[file_path, doc_number, total_amount]
        """
        doc_number = self._generate_doc_number('invoice')
        filename = f"invoice_{doc_number}.pdf"
        file_path = os.path.join(settings.generated_dir, filename)

        doc = SimpleDocTemplate(
            file_path,
            pagesize=A4,
            rightMargin=20*mm,
            leftMargin=20*mm,
            topMargin=20*mm,
            bottomMargin=20*mm
        )

        elements = []

        # Заголовок
        elements.append(Paragraph(
            f"СЧЁТ НА ОПЛАТУ № {doc_number}",
            self.styles['Title']
        ))
        elements.append(Paragraph(
            f"от {self._format_date(data.invoice_date)}",
            self.styles['Normal']
        ))
        elements.append(Spacer(1, 10*mm))

        # Поставщик
        elements.append(Paragraph("<b>Поставщик:</b>", self.styles['Normal']))
        elements.append(Paragraph(self._format_party(data.seller), self.styles['Normal']))
        elements.append(Spacer(1, 5*mm))

        # Покупатель
        elements.append(Paragraph("<b>Покупатель:</b>", self.styles['Normal']))
        elements.append(Paragraph(self._format_party(data.buyer), self.styles['Normal']))
        elements.append(Spacer(1, 10*mm))

        # Таблица товаров
        table_data = [['№', 'Наименование', 'Ед.', 'Кол-во', 'Цена', 'Сумма']]
        if data.include_vat:
            table_data[0].insert(-1, 'НДС')

        for i, item in enumerate(data.items, 1):
            row = [
                str(i),
                item.name,
                item.unit,
                str(item.quantity),
                self._format_number(item.price),
            ]
            if data.include_vat:
                vat_str = f"{int(item.vat_rate)}%" if item.vat_rate else "-"
                row.append(vat_str)
            row.append(self._format_number(item.quantity * item.price))
            table_data.append(row)

        table = Table(table_data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 5*mm))

        # Итого
        totals = self._calculate_totals(data.items)
        if data.include_vat and totals['vat'] > 0:
            elements.append(Paragraph(
                f"<b>Итого без НДС:</b> {self._format_number(totals['subtotal'])} руб.",
                self.styles['Normal']
            ))
            elements.append(Paragraph(
                f"<b>В т.ч. НДС:</b> {self._format_number(totals['vat'])} руб.",
                self.styles['Normal']
            ))
        elements.append(Paragraph(
            f"<b>ИТОГО:</b> {self._format_number(totals['total'])} руб.",
            self.styles['Normal']
        ))
        elements.append(Spacer(1, 3*mm))

        # Сумма прописью
        elements.append(Paragraph(
            f"<b>Всего наименований {len(data.items)}, на сумму {self._format_number(totals['total'])} руб.</b>",
            self.styles['Normal']
        ))
        elements.append(Paragraph(
            self._number_to_words(totals['total']),
            self.styles['Normal']
        ))

        # Срок оплаты
        if data.due_date:
            elements.append(Spacer(1, 5*mm))
            elements.append(Paragraph(
                f"<b>Срок оплаты:</b> {self._format_date(data.due_date)}",
                self.styles['Normal']
            ))

        # Примечания
        if data.notes:
            elements.append(Spacer(1, 5*mm))
            elements.append(Paragraph(f"Примечание: {data.notes}", self.styles['Normal']))

        # Подписи
        elements.append(Spacer(1, 15*mm))
        elements.append(Paragraph(
            f"Руководитель __________________ {data.seller.director or ''}",
            self.styles['Normal']
        ))
        elements.append(Spacer(1, 5*mm))
        elements.append(Paragraph(
            f"Главный бухгалтер __________________ {data.seller.accountant or ''}",
            self.styles['Normal']
        ))
        elements.append(Spacer(1, 10*mm))
        elements.append(Paragraph("М.П.", self.styles['Normal']))

        doc.build(elements)

        return file_path, doc_number, totals['total']

    # ==================== Товарная накладная ====================

    def generate_waybill(self, data: WaybillRequest) -> tuple[str, str, float]:
        """Генерация товарной накладной"""
        doc_number = self._generate_doc_number('waybill')
        filename = f"waybill_{doc_number}.pdf"
        file_path = os.path.join(settings.generated_dir, filename)

        doc = SimpleDocTemplate(
            file_path,
            pagesize=A4,
            rightMargin=15*mm,
            leftMargin=15*mm,
            topMargin=15*mm,
            bottomMargin=15*mm
        )

        elements = []

        # Заголовок
        elements.append(Paragraph(
            f"ТОВАРНАЯ НАКЛАДНАЯ № {doc_number}",
            self.styles['Title']
        ))
        elements.append(Paragraph(
            f"от {self._format_date(data.waybill_date)}",
            self.styles['Normal']
        ))
        elements.append(Spacer(1, 8*mm))

        # Стороны
        elements.append(Paragraph("<b>Поставщик:</b> " + data.seller.name, self.styles['Normal']))
        elements.append(Paragraph("<b>Покупатель:</b> " + data.buyer.name, self.styles['Normal']))

        if data.shipper and data.shipper.name != data.seller.name:
            elements.append(Paragraph("<b>Грузоотправитель:</b> " + data.shipper.name, self.styles['Normal']))
        if data.consignee and data.consignee.name != data.buyer.name:
            elements.append(Paragraph("<b>Грузополучатель:</b> " + data.consignee.name, self.styles['Normal']))

        if data.contract_number:
            contract_date = self._format_date(data.contract_date) if data.contract_date else ''
            elements.append(Paragraph(
                f"<b>Основание:</b> Договор № {data.contract_number} от {contract_date}",
                self.styles['Normal']
            ))

        elements.append(Spacer(1, 8*mm))

        # Таблица товаров
        table_data = [['№', 'Наименование', 'Ед.', 'Кол-во', 'Цена', 'НДС', 'Сумма']]

        for i, item in enumerate(data.items, 1):
            vat_str = f"{int(item.vat_rate)}%" if item.vat_rate else "-"
            table_data.append([
                str(i),
                item.name,
                item.unit,
                str(item.quantity),
                self._format_number(item.price),
                vat_str,
                self._format_number(item.quantity * item.price)
            ])

        table = Table(table_data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 5*mm))

        # Итого
        totals = self._calculate_totals(data.items)
        elements.append(Paragraph(
            f"<b>Всего отпущено {len(data.items)} наименований на сумму {self._format_number(totals['total'])} руб.</b>",
            self.styles['Normal']
        ))
        elements.append(Paragraph(self._number_to_words(totals['total']), self.styles['Normal']))

        # Подписи
        elements.append(Spacer(1, 10*mm))
        elements.append(Paragraph("<b>Отпуск разрешил:</b>", self.styles['Normal']))
        elements.append(Paragraph(
            f"Директор __________________ {data.seller.director or ''}",
            self.styles['Normal']
        ))
        elements.append(Spacer(1, 8*mm))
        elements.append(Paragraph("<b>Груз принял:</b>", self.styles['Normal']))
        elements.append(Paragraph("Представитель __________________", self.styles['Normal']))

        doc.build(elements)

        return file_path, doc_number, totals['total']

    # ==================== Акт выполненных работ ====================

    def generate_completion_act(self, data: CompletionActRequest) -> tuple[str, str, float]:
        """Генерация акта выполненных работ"""
        doc_number = self._generate_doc_number('completion_act')
        filename = f"act_{doc_number}.pdf"
        file_path = os.path.join(settings.generated_dir, filename)

        doc = SimpleDocTemplate(
            file_path,
            pagesize=A4,
            rightMargin=20*mm,
            leftMargin=20*mm,
            topMargin=20*mm,
            bottomMargin=20*mm
        )

        elements = []

        # Заголовок
        elements.append(Paragraph(f"АКТ № {doc_number}", self.styles['Title']))
        elements.append(Paragraph(
            "о приёмке выполненных работ (оказанных услуг)",
            self.styles['Normal']
        ))
        elements.append(Paragraph(
            f"от {self._format_date(data.act_date)}",
            self.styles['Normal']
        ))
        elements.append(Spacer(1, 10*mm))

        # Стороны
        elements.append(Paragraph("<b>Исполнитель:</b>", self.styles['Normal']))
        elements.append(Paragraph(self._format_party(data.executor), self.styles['Normal']))
        elements.append(Spacer(1, 5*mm))
        elements.append(Paragraph("<b>Заказчик:</b>", self.styles['Normal']))
        elements.append(Paragraph(self._format_party(data.customer), self.styles['Normal']))
        elements.append(Spacer(1, 5*mm))

        # Основание
        if data.contract_number:
            contract_date = self._format_date(data.contract_date) if data.contract_date else ''
            elements.append(Paragraph(
                f"<b>Основание:</b> Договор № {data.contract_number} от {contract_date}",
                self.styles['Normal']
            ))

        # Период
        if data.period_start and data.period_end:
            elements.append(Paragraph(
                f"<b>Период:</b> с {self._format_date(data.period_start)} по {self._format_date(data.period_end)}",
                self.styles['Normal']
            ))

        elements.append(Spacer(1, 8*mm))

        # Таблица работ
        table_data = [['№', 'Наименование работ/услуг', 'Ед.', 'Кол-во', 'Цена', 'Сумма']]

        for i, item in enumerate(data.items, 1):
            table_data.append([
                str(i),
                item.name,
                item.unit,
                str(item.quantity),
                self._format_number(item.price),
                self._format_number(item.quantity * item.price)
            ])

        table = Table(table_data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 5*mm))

        # Итого
        totals = self._calculate_totals(data.items)
        elements.append(Paragraph(
            f"<b>Итого оказано услуг (выполнено работ) на сумму: {self._format_number(totals['total'])} руб.</b>",
            self.styles['Normal']
        ))
        elements.append(Paragraph(self._number_to_words(totals['total']), self.styles['Normal']))

        # Заключение
        elements.append(Spacer(1, 10*mm))
        elements.append(Paragraph(
            "Вышеперечисленные работы (услуги) выполнены полностью и в срок. "
            "Заказчик претензий по объёму, качеству и срокам оказания услуг не имеет.",
            self.styles['Normal']
        ))

        # Подписи
        elements.append(Spacer(1, 15*mm))

        sig_table = Table([
            ['<b>ИСПОЛНИТЕЛЬ:</b>', '<b>ЗАКАЗЧИК:</b>'],
            [f"__________________ {data.executor.director or ''}", f"__________________ {data.customer.director or ''}"],
            ['М.П.', 'М.П.']
        ], colWidths=[250, 250])
        sig_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(sig_table)

        doc.build(elements)

        return file_path, doc_number, totals['total']

    def _format_party(self, party: PartyInfo) -> str:
        """Форматирование информации о контрагенте"""
        parts = [party.name]
        if party.inn:
            inn_kpp = f"ИНН {party.inn}"
            if party.kpp:
                inn_kpp += f", КПП {party.kpp}"
            parts.append(inn_kpp)
        if party.address:
            parts.append(f"Адрес: {party.address}")
        if party.bank_name:
            parts.append(f"Банк: {party.bank_name}, БИК {party.bank_bik or '-'}")
            parts.append(f"Р/с: {party.bank_account or '-'}")
        return "<br/>".join(parts)


# Singleton instance
document_generator = DocumentGenerator()
