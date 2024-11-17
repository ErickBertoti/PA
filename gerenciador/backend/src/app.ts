import express from 'express';
import multer from 'multer';
import { Request, Response } from 'express';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

// Carregar as variáveis de ambiente
dotenv.config();

// Configurar o AWS SDK com as credenciais do .env
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: process.env.AWS_REGION || 'us-east-1', // Região do seu bucket
});

const s3 = new AWS.S3();
const app = express();

// Configuração do multer para salvar os arquivos na memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rota para upload de arquivos
app.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME!, // Nome do seu bucket
    Key: `uploads/${Date.now()}_${req.file.originalname}`, // Nome único para o arquivo
    Body: req.file.buffer, // Arquivo em buffer
    ContentType: req.file.mimetype, // Tipo MIME do arquivo
    ACL: 'public-read', // Permissão de leitura pública
  };

  try {
    // Envia o arquivo para o S3
    const data = await s3.upload(params).promise();
    res.status(200).json({
      message: 'File uploaded successfully!',
      fileUrl: data.Location, // URL pública do arquivo no S3
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file');
  }
});

// Rota para listar os arquivos do S3
app.get('/files', async (req: Request, res: Response) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!, // Nome do seu bucket
  };

  try {
    // Listar objetos no S3
    const data = await s3.listObjectsV2(params).promise();
    const files = data.Contents?.map(file => ({
      key: file.Key,
      url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${file.Key}`, // URL pública do arquivo
    }));
    res.status(200).json(files);
  } catch (error) {
    console.error('Error listing files from S3:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
