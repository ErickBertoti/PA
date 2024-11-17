import AWS from 'aws-sdk';
import { Request, Response } from 'express';
import multer from 'multer';

AWS.config.update({
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

// Configuração do multer para salvar os arquivos na memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const uploadToS3 = async (req: Request, res: Response) => {
    try {
        // Verifique se o arquivo existe antes de usar
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        const params = {
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: `uploads/${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        // Faça o upload para o S3
        const data = await s3.upload(params).promise();
        res.status(200).json({ message: 'Upload feito com sucesso', url: data.Location });
    } catch (error) {
        console.error('Erro ao fazer upload para o S3:', error);
        res.status(500).json({ error: 'Falhou no upload' });
    }
};
