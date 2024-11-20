import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sharp from 'sharp';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import { PrismaClient } from '@prisma/client';
import { uploadFile, deleteFile, getObjectSignedUrl } from './s3.js';

const app = express();
const prisma = new PrismaClient();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const secretKey = process.env.JWT_SECRET_KEY;
// Middleware para permitir CORS
app.use(cors({
  origin: 'http://localhost:3000', // Permite requisições do frontend (ajuste conforme necessário)
  methods: ['GET', 'POST', 'DELETE'], // Permite esses métodos, adicione mais se necessário
  allowedHeaders: ['Content-Type', 'Authorization'], // Permite cabeçalhos específicos
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
app.get("/api/posts", async (req, res) => {
  const posts = await prisma.posts.findMany({ orderBy: [{ created: 'desc' }] });
  for (let post of posts) {
    post.imageUrl = await getObjectSignedUrl(post.imageName);
  }
  res.send(posts);
});

// Rota para criar posts (exige autenticação)
app.post('/api/posts', authenticateToken, upload.single('image'), async (req, res) => {
  const file = req.file;
  const caption = req.body.caption;
  const categoryId = req.body.categoryId;
  const imageName = generateFileName();

  const fileBuffer = await sharp(file.buffer)
    .resize({ height: 1920, width: 1080, fit: "contain" })
    .toBuffer();

  await uploadFile(fileBuffer, imageName, file.mimetype);

  const post = await prisma.posts.create({
    data: {
      imageName,
      caption,
      categoryId: +categoryId,
    }
  });

  res.status(201).send(post);
});

// Rota para deletar posts (exige autenticação)
app.delete("/api/posts/:id", authenticateToken, async (req, res) => {
  const id = +req.params.id;
  const post = await prisma.posts.findUnique({ where: { id } });

  await deleteFile(post.imageName);

  await prisma.posts.delete({ where: { id: post.id } });
  res.send(post);
});

// Rota para obter categorias
app.get("/api/categories", async (req, res) => {
  const categories = await prisma.category.findMany();
  res.send(categories);
});

// Rota para obter a imagem de um post
app.get("/api/posts/:id/image", async (req, res) => {
  const id = +req.params.id;
  const post = await prisma.posts.findUnique({ where: { id } });

  const imageUrl = await getObjectSignedUrl(post.imageName);

  res.redirect(imageUrl);
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
      data: { email, password, name }, // A senha será salva em texto puro
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

// Rota para verificar se o usuário está autenticado
app.get("/api/authenticated", authenticateToken, (req, res) => {
  return res.status(200).json({ isAuthenticated: true });
});

app.listen(8080, () => console.log("listening on port 8080"));
