import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/documentFiles');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

export const uploadDocument = (req: Request, res: Response) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading file', error: err.message });
    }
    return res.status(200).json({ message: 'File uploaded successfully', file: req.file });
  });
};

export const getDocuments = (req: Request, res: Response) => {
  // Mocked response; replace with database query later
  res.status(200).json([
    { id: 1, name: 'Document 1', category: 'Category A' },
    { id: 2, name: 'Document 2', category: 'Category B' },
  ]);
};
