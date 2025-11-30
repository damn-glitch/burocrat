"""
OCR Service - распознавание текста из изображений и PDF
"""
import os
import time
from typing import Optional, Tuple
from pathlib import Path

import pytesseract
from PIL import Image
from pdf2image import convert_from_path

from app.config import settings


class OCRService:
    """Сервис распознавания текста"""

    SUPPORTED_IMAGE_FORMATS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'}
    SUPPORTED_DOC_FORMATS = {'.pdf'}

    def __init__(self):
        # Проверяем доступность tesseract
        try:
            pytesseract.get_tesseract_version()
        except Exception as e:
            print(f"Warning: Tesseract not found: {e}")

    def process_file(
        self,
        file_path: str,
        language: str = "rus+eng"
    ) -> Tuple[Optional[str], float, int]:
        """
        Обработка файла и извлечение текста

        Returns:
            Tuple[text, confidence, processing_time_ms]
        """
        start_time = time.time()

        file_ext = Path(file_path).suffix.lower()

        try:
            if file_ext in self.SUPPORTED_IMAGE_FORMATS:
                text, confidence = self._process_image(file_path, language)
            elif file_ext in self.SUPPORTED_DOC_FORMATS:
                text, confidence = self._process_pdf(file_path, language)
            else:
                raise ValueError(f"Неподдерживаемый формат файла: {file_ext}")

            processing_time = int((time.time() - start_time) * 1000)
            return text, confidence, processing_time

        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            raise Exception(f"Ошибка OCR: {str(e)}")

    def _process_image(
        self,
        image_path: str,
        language: str
    ) -> Tuple[str, float]:
        """Обработка изображения"""
        image = Image.open(image_path)

        # Получаем данные OCR с информацией о confidence
        data = pytesseract.image_to_data(
            image,
            lang=language,
            output_type=pytesseract.Output.DICT
        )

        # Извлекаем текст
        text = pytesseract.image_to_string(image, lang=language)

        # Рассчитываем средний confidence
        confidences = [
            int(conf) for conf in data['conf']
            if conf != '-1' and str(conf).isdigit()
        ]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

        return text.strip(), avg_confidence

    def _process_pdf(
        self,
        pdf_path: str,
        language: str
    ) -> Tuple[str, float]:
        """Обработка PDF файла"""
        # Конвертируем PDF в изображения
        images = convert_from_path(pdf_path, dpi=300)

        all_text = []
        all_confidences = []

        for i, image in enumerate(images):
            # Сохраняем временно
            temp_path = os.path.join(settings.upload_dir, f"temp_page_{i}.png")
            image.save(temp_path, "PNG")

            try:
                text, confidence = self._process_image(temp_path, language)
                all_text.append(f"--- Страница {i + 1} ---\n{text}")
                all_confidences.append(confidence)
            finally:
                # Удаляем временный файл
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        combined_text = "\n\n".join(all_text)
        avg_confidence = sum(all_confidences) / len(all_confidences) if all_confidences else 0.0

        return combined_text, avg_confidence

    def process_base64(
        self,
        base64_data: str,
        language: str = "rus+eng"
    ) -> Tuple[str, float, int]:
        """Обработка base64 изображения"""
        import base64
        from io import BytesIO

        start_time = time.time()

        # Удаляем префикс data:image/...;base64,
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]

        # Декодируем
        image_data = base64.b64decode(base64_data)
        image = Image.open(BytesIO(image_data))

        # Распознаём
        text = pytesseract.image_to_string(image, lang=language)

        # Получаем confidence
        data = pytesseract.image_to_data(
            image,
            lang=language,
            output_type=pytesseract.Output.DICT
        )
        confidences = [
            int(conf) for conf in data['conf']
            if conf != '-1' and str(conf).isdigit()
        ]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

        processing_time = int((time.time() - start_time) * 1000)

        return text.strip(), avg_confidence, processing_time


# Singleton instance
ocr_service = OCRService()
