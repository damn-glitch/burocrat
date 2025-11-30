"""
AI Analyzer Service - анализ документов с помощью OpenAI
"""
import time
import json
from typing import Optional, Dict, Any, List

from openai import OpenAI

from app.config import settings


class AIAnalyzer:
    """Сервис анализа документов с помощью ИИ"""

    def __init__(self):
        self.client = None
        if settings.openai_api_key:
            self.client = OpenAI(api_key=settings.openai_api_key)

    def _check_availability(self):
        """Проверка доступности OpenAI API"""
        if not self.client:
            raise ValueError("OpenAI API ключ не настроен")

    def analyze_document(
        self,
        text: str,
        analyze_type: str = "full"
    ) -> Dict[str, Any]:
        """
        Полный анализ документа

        Args:
            text: Текст документа
            analyze_type: Тип анализа (full, summary, extract, classify)

        Returns:
            Результат анализа
        """
        self._check_availability()
        start_time = time.time()

        try:
            if analyze_type == "summary":
                result = self._summarize(text)
            elif analyze_type == "classify":
                result = self._classify(text)
            elif analyze_type == "extract":
                result = self._extract_data(text)
            else:  # full
                result = self._full_analysis(text)

            result['processing_time_ms'] = int((time.time() - start_time) * 1000)
            result['success'] = True
            return result

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'processing_time_ms': int((time.time() - start_time) * 1000)
            }

    def _full_analysis(self, text: str) -> Dict[str, Any]:
        """Полный анализ документа"""
        system_prompt = """Ты - эксперт по анализу российских бухгалтерских и юридических документов.
Проанализируй текст документа и верни структурированную информацию в формате JSON.

Определи:
1. Тип документа (счёт, накладная, акт, договор, счёт-фактура и т.д.)
2. Извлеки ключевую информацию (номер, дата, стороны, суммы)
3. Найди все упомянутые сущности (организации, даты, суммы, ИНН, телефоны)
4. Создай краткое резюме документа"""

        user_prompt = f"""Проанализируй документ и верни JSON:

{text[:4000]}

Формат ответа:
{{
  "document_type": "тип документа",
  "document_type_ru": "тип на русском",
  "summary": "краткое описание (2-3 предложения)",
  "extracted_data": {{
    "document_number": "номер",
    "document_date": "дата в формате YYYY-MM-DD",
    "total_amount": числовое значение суммы или null,
    "currency": "валюта",
    "seller": {{"name": "", "inn": "", "address": ""}},
    "buyer": {{"name": "", "inn": "", "address": ""}},
    "items": [{{"name": "", "quantity": 0, "price": 0, "total": 0}}]
  }},
  "entities": {{
    "organizations": ["список организаций"],
    "dates": ["список дат"],
    "amounts": [{{"value": 0, "currency": "RUB"}}],
    "inn_numbers": ["список ИНН"],
    "phones": ["список телефонов"],
    "emails": ["список email"]
  }},
  "confidence": число от 0 до 100
}}"""

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)
        result['tokens_used'] = response.usage.total_tokens

        return result

    def _summarize(self, text: str) -> Dict[str, Any]:
        """Краткое описание документа"""
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Ты - эксперт по анализу документов. Создай краткое резюме документа на русском языке (3-5 предложений)."
                },
                {
                    "role": "user",
                    "content": f"Создай краткое резюме документа:\n\n{text[:3000]}"
                }
            ],
            temperature=0.3,
            max_tokens=500
        )

        return {
            'summary': response.choices[0].message.content,
            'tokens_used': response.usage.total_tokens
        }

    def _classify(self, text: str) -> Dict[str, Any]:
        """Классификация типа документа"""
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Классифицируй тип документа. Верни JSON."
                },
                {
                    "role": "user",
                    "content": f"""Определи тип документа:

{text[:2000]}

Верни JSON:
{{
  "document_type": "тип на английском (invoice, waybill, completion_act, contract, bill, receipt, unknown)",
  "document_type_ru": "тип на русском",
  "confidence": число от 0 до 100,
  "reasoning": "краткое объяснение"
}}"""
                }
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)
        result['tokens_used'] = response.usage.total_tokens

        return result

    def _extract_data(self, text: str) -> Dict[str, Any]:
        """Извлечение структурированных данных"""
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Извлеки структурированные данные из документа. Верни JSON."
                },
                {
                    "role": "user",
                    "content": f"""Извлеки данные из документа:

{text[:4000]}

Верни JSON:
{{
  "document_number": "номер документа",
  "document_date": "дата в формате YYYY-MM-DD",
  "total_amount": числовое значение,
  "currency": "валюта",
  "seller": {{
    "name": "название",
    "inn": "ИНН",
    "kpp": "КПП",
    "address": "адрес",
    "bank_name": "банк",
    "bank_account": "счёт"
  }},
  "buyer": {{
    "name": "название",
    "inn": "ИНН",
    "address": "адрес"
  }},
  "items": [
    {{
      "name": "наименование",
      "quantity": число,
      "unit": "единица",
      "price": число,
      "total": число
    }}
  ]
}}"""
                }
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)
        result['tokens_used'] = response.usage.total_tokens

        return {'extracted_data': result, 'tokens_used': result.pop('tokens_used', 0)}

    def explain_contract(self, text: str) -> Dict[str, Any]:
        """Объяснение содержания договора на понятном языке"""
        self._check_availability()
        start_time = time.time()

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": """Ты - юрист, который объясняет договоры простым языком.
Проанализируй договор и объясни его содержание понятным деловым языком.
Выдели ключевые моменты, риски и важные условия."""
                    },
                    {
                        "role": "user",
                        "content": f"""Объясни этот договор простым языком:

{text[:5000]}

Структура ответа:
1. **Предмет договора** - о чём договор
2. **Стороны** - кто участвует
3. **Основные условия** - ключевые пункты
4. **Сроки** - важные даты и сроки
5. **Финансы** - суммы, порядок оплаты
6. **Ответственность сторон** - что будет при нарушении
7. **Риски и важные моменты** - на что обратить внимание
8. **Необычные условия** - если есть что-то нестандартное"""
                    }
                ],
                temperature=0.3,
                max_tokens=2000
            )

            return {
                'success': True,
                'explanation': response.choices[0].message.content,
                'tokens_used': response.usage.total_tokens,
                'processing_time_ms': int((time.time() - start_time) * 1000)
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'processing_time_ms': int((time.time() - start_time) * 1000)
            }

    def extract_for_generation(
        self,
        text: str,
        target_type: str
    ) -> Dict[str, Any]:
        """Извлечение данных для генерации документа"""
        self._check_availability()
        start_time = time.time()

        type_names = {
            'invoice': 'счёт на оплату',
            'waybill': 'товарная накладная',
            'completion_act': 'акт выполненных работ'
        }

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": f"Извлеки данные для генерации документа типа '{type_names.get(target_type, target_type)}'. Верни JSON."
                    },
                    {
                        "role": "user",
                        "content": f"""Извлеки данные из текста для генерации {type_names.get(target_type, target_type)}:

{text[:4000]}

Верни JSON с полями:
- seller/executor (название, ИНН, КПП, адрес, банк, счёт, директор)
- buyer/customer (название, ИНН, адрес)
- items (наименование, количество, единица, цена)
- date (дата документа)
- contract_number, contract_date (если есть)"""
                    }
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )

            result = json.loads(response.choices[0].message.content)

            return {
                'success': True,
                'data': result,
                'tokens_used': response.usage.total_tokens,
                'processing_time_ms': int((time.time() - start_time) * 1000)
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'processing_time_ms': int((time.time() - start_time) * 1000)
            }


# Singleton instance
ai_analyzer = AIAnalyzer()
