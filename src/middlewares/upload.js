import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { nanoid } from 'nanoid';

const TEMP_UPLOAD_DIR = 'temp';

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await fs.mkdir(TEMP_UPLOAD_DIR, { recursive: true });
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${nanoid()}${ext}`);
  },
});

export const upload = multer({ storage });