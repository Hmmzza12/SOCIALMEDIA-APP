import express, { Request, Response } from 'express';
import multer from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { resolve, extname } from 'path';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

const uploadDir = resolve(__dirname, '../../uploads');
if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        if (/^image\/(png|jpe?g|gif|webp|avif)$/.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
});

// Upload a single image (protected). Returns an absolute URL.
router.post('/', authenticateToken, (req: Request, res: Response) => {
    upload.single('image')(req, res, (err: any) => {
        if (err) {
            res.status(400).json({ error: err.message || 'Upload failed' });
            return;
        }
        if (!req.file) {
            res.status(400).json({ error: 'No file provided' });
            return;
        }
        const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.status(201).json({ url });
    });
});

export default router;
