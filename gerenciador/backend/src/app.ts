import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import documentRoutes from './routes/documentRoutes';
import fileRoutes from './routes/fileRoutes';  // Importando as rotas para listar arquivos do S3

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('src/uploads')); // Para servir uploads locais, se necessário

// Rotas
app.use('/documents', documentRoutes);  // Já existente para gerenciar documentos
app.use('/files', fileRoutes);  // Nova rota para gerenciar arquivos do S3

// Iniciando o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
