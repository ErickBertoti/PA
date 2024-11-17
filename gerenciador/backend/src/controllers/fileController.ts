import { Request, Response } from 'express';
import AWS from 'aws-sdk';

// Configuração do AWS SDK
const s3 = new AWS.S3({
    region: 'us-east-1', // Ajuste conforme sua região
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Função para listar arquivos do S3
export const listFilesFromS3 = async (req: Request, res: Response) => {
    try {
        const params = {
            Bucket: process.env.S3_BUCKET_NAME!,  // Nome do seu bucket no S3
        };

        const data = await s3.listObjectsV2(params).promise();
        const files = data.Contents?.map(file => ({
            key: file.Key,
            lastModified: file.LastModified,
            size: file.Size,
            url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${file.Key}`,
        }));

        res.status(200).json(files);  // Retorna os arquivos encontrados
    } catch (error) {
        console.error('Error listing files from S3:', error);
        res.status(500).json({ error: 'Failed to list files' });
    }
};
