import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = Router();

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const ext = path.extname(file.originalname || '');
    const base = path.basename(file.originalname || 'file', ext).replace(/\s+/g, '-');
    cb(null, `${ts}-${base}${ext}`);
  },
});

const upload = multer({ storage });

router.post('/', requireAuth, requireAdmin, upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: true, message: 'No file provided' });
  // Public URL served from /uploads
  const publicPath = `/uploads/${file.filename}`;
  res.status(201).json({ url: publicPath, filename: file.filename, size: file.size, mimetype: file.mimetype });
});

export default router;

