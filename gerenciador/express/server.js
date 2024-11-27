import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sharp from 'sharp';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import path from 'path';

import { PrismaClient } from '@prisma/client';
import { uploadFile, deleteFile, getObjectSignedUrl } from './s3.js';

const app = express();
const prisma = new PrismaClient();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit 
});

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const secretKey = process.env.JWT_SECRET_KEY;

// Middleware para permitir CORS
app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'DELETE', 'PUT'], 
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware para interpretar o corpo das requisições como JSON
app.use(express.json());

// Verificação de autenticação
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Remover o prefixo "Bearer " se estiver presente
  const tokenWithoutBearer = token.split(' ')[1]; // O token real fica após o espaço

  if (!tokenWithoutBearer) {
    return res.status(401).json({ error: 'Token format is incorrect' });
  }

  jwt.verify(tokenWithoutBearer, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.userId = decoded.id; // Coloca o ID do usuário no objeto `req`
    next(); // Chama o próximo middleware ou a função de rota
  });
};

// Rota para obter os posts
app.get("/api/posts", authenticateToken, async (req, res) => {
  try {
    const { categoryId } = req.query;

    const filter = categoryId ? { where: { categoryId: +categoryId } } : {};

    const posts = await prisma.posts.findMany({
      ...filter,
      orderBy: [{ created: 'desc' }],
      include: {
        category: true, // If you have a category relationship
      }
    });

    for (let post of posts) {
      post.imageUrl = await getObjectSignedUrl(post.imageName);
    }

    res.send(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send({ error: 'Unable to fetch posts' });
  }
});

// Rota para criar posts (exige autenticação)
app.post('/api/posts', authenticateToken, upload.single('file'), async (req, res) => {
  const file = req.file;
  const caption = req.body.caption;
  const categoryId = req.body.categoryId;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const imageName = generateFileName();

  try {
    let processedBuffer = file.buffer;

    // Try to process image if it's a supported image type
    try {
      processedBuffer = await sharp(file.buffer)
        .resize({ height: 1920, width: 1080, fit: "contain" })
        .toBuffer();
    } catch (imageProcessingError) {
      // If image processing fails, use original buffer
      console.warn('Image processing failed, using original file:', imageProcessingError.message);
    }

    await uploadFile(processedBuffer, imageName, file.mimetype);

    const post = await prisma.posts.create({
      data: {
        imageName,
        originalFileName: file.originalname,
        fileType: file.mimetype,
        caption,
        categoryId: +categoryId,
      }
    });

    res.status(201).send(post);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed', details: error.message });
  }
});

// Rota para obter a imagem/download de um post
app.get("/api/posts/:id/download", async (req, res) => {
  try {
    const id = +req.params.id;
    const post = await prisma.posts.findUnique({ where: { id } });

    if (!post) {
      return res.status(404).json({ error: "File not found" });
    }

    const imageUrl = await getObjectSignedUrl(post.imageName);
    res.json({ 
      url: imageUrl, 
      originalFileName: post.originalFileName, 
      fileType: post.fileType 
    });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Error generating download URL" });
  }
});

// Rota para deletar posts (exige autenticação)
app.delete("/api/posts/:id", authenticateToken, async (req, res) => {
  const id = +req.params.id;
  const post = await prisma.posts.findUnique({ where: { id } });

  await deleteFile(post.imageName);
  await prisma.posts.delete({ where: { id: post.id } });
  res.send(post);
});

// Rota para obter ferramentas e licenças
app.get("/api/tools", authenticateToken, async (req, res) => {
  const tools = await prisma.tool.findMany();
  res.send(tools);
});

// Rota para criar uma nova ferramenta/licença
app.post("/api/tools", authenticateToken, async (req, res) => {
  const { name, description, responsible, acquisitionDate, expirationDate } = req.body;

  const tool = await prisma.tool.create({
    data: {
      name,
      description,
      responsible,
      acquisitionDate: new Date(acquisitionDate),
      expirationDate: new Date(expirationDate),
    },
  });

  res.status(201).send(tool);
});

// Rota para atualizar uma ferramenta/licença
app.put("/api/tools/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, description, responsible, acquisitionDate, expirationDate } = req.body;

  const tool = await prisma.tool.update({
    where: { id: Number(id) },
    data: {
      name,
      description,
      responsible,
      acquisitionDate: new Date(acquisitionDate),
      expirationDate: new Date(expirationDate),
    },
  });

  res.send(tool);
});

// Rota para deletar uma ferramenta/licença
app.delete("/api/tools/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const tool = await prisma.tool.delete({
    where: { id: Number(id) },
  });

  res.send(tool);
});

// Rota para criar treinamento
app.post('/api/trainings', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { title, description, categoryId, links } = req.body;

    // Validação dos campos obrigatórios
    if (!title || !description || !categoryId) {
      return res.status(400).json({ error: 'Título, descrição e categoria são obrigatórios.' });
    }

    // Garantir que `links` seja um array, mesmo que vazio
    const linksArray = Array.isArray(links) ? links : [];

    let imageName = null;

    if (req.file) {
      imageName = generateFileName();

      const fileBuffer = await sharp(req.file.buffer)
        .resize({ height: 1920, width: 1080, fit: 'contain' })
        .toBuffer();

      await uploadFile(fileBuffer, imageName, req.file.mimetype);
    }

    const training = await prisma.training.create({
      data: {
        title,
        description,
        imageName,
        categoryId: +categoryId,
        trainingLinks: {
          create: linksArray.map((link) => ({ url: link })),
        },
      },
    });

    res.status(201).json(training);
  } catch (error) {
    console.error('Erro ao criar treinamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Rota para obter treinamentos
app.get('/api/trainings', authenticateToken, async (req, res) => {
  try {
    const { categoryId } = req.query;

    const filter = categoryId ? { where: { categoryId: +categoryId } } : {};

    const trainings = await prisma.training.findMany({
      ...filter,
      include: {
        trainingLinks: true,
        category: true,
      },
    });

    // Gerar URLs assinadas para as imagens
    for (let training of trainings) {
      if (training.imageName) {
        training.imageUrl = await getObjectSignedUrl(training.imageName);
      }
    }

    res.json(trainings);
  } catch (error) {
    console.error('Erro ao buscar treinamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter categorias
app.get("/api/categories", async (req, res) => {
  const categories = await prisma.category.findMany();
  res.send(categories);
});

// Rota para obter a imagem de um post
app.get("/api/posts/:id/image", async (req, res) => {
  try {
    const id = +req.params.id

    const post = await prisma.posts.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: "Post não encontrado" });
    }

    const imageUrl = await getObjectSignedUrl(post.imageName);
    if (!imageUrl) {
      return res.status(500).json({ error: "Erro ao gerar URL da imagem" });
    }

    // Retorne a URL assinada
    res.json({ url: imageUrl });
  } catch (error) {
    console.error("Erro na rota de imagem:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota para criar um novo usuário (signup)
app.post('/api/signup', async (req, res) => {
  const { email, password, name } = req.body;

  const existingProfile = await prisma.profile.findUnique({
    where: { email },
  });

  if (existingProfile) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  try {
    await prisma.profile.create({
      data: { email, password, name },
    });

    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Rota para login de usuários
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const profile = await prisma.profile.findUnique({
    where: { email },
  });

  if (!profile) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (password !== profile.password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: profile.id }, secretKey, { expiresIn: '1h' });

  return res.status(200).json({ token });
});

// Rota para obter detalhes do perfil do usuário
app.get("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({
      name: profile.name,
      email: profile.email
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rota para verificar se o usuário está autenticado
app.get("/api/authenticated", authenticateToken, (req, res) => {
  return res.status(200).json({ isAuthenticated: true });
});

app.listen(8080, () => console.log("listening on port 8080"));