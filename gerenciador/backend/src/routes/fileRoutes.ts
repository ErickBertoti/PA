import express from 'express';
import { listFilesFromS3 } from '../controllers/fileController';  // Importando o controlador para listar arquivos

const router = express.Router();

// Rota para listar arquivos do S3
router.get('/', listFilesFromS3);  // Vai acessar '/files' no backend

export default router;
