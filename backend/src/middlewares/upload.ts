import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Память для мелких файлов
const memoryStorage = multer.memoryStorage();
export const upload = multer({ storage: memoryStorage });

// Диск для OCR изображений
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'ocr');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `ocr-${uniqueSuffix}${ext}`);
  },
});

// Фильтр для изображений
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Недопустимый формат файла. Разрешены: JPEG, PNG, GIF, WebP, TIFF, PDF'));
  }
};

export const uploadOcr = multer({
  storage: diskStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});