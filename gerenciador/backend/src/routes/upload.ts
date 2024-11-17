import AWS from 'aws-sdk';
import { Request, Response } from 'express';

AWS.config.update({
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export const uploadToS3 = async (req: Request, res: Response) => {
    try {
        const file = req.file; 
        const params = {
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: `uploads/${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        const data = await s3.upload(params).promise();
        res.status(200).json({ message: 'Upload feito com sucesso', url: data.Location });
    } catch (error) {
        console.error('Erro ao fazer upload para o S3:', error);
        res.status(500).json({ error: 'Falhou no upload' });
    }
};
