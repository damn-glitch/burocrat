import multer from 'multer';

const storage = multer.memoryStorage(); // сохраняем в RAM (buffer)
export const upload = multer({ storage });