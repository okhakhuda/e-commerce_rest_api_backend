import multer from 'multer';
import { MAX_UPLOAD_FILE_SIZE } from '../lib/constants.js';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.includes('image/')) {
      return cb(null, true);
    }
    cb(new Error('Формат файла не підтримується! Дозволені лише зображення.'));
  },
});
