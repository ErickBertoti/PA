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

// Rota para obter todos os treinamentos
// Esta rota não exige autenticação, e retorna todos os treinamentos cadastrados.
app.get("/api/trainings", async (req, res) => {
  try {
    const trainings = await prisma.training.findMany();
    res.json(trainings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar treinamentos" });
  }
});

// Rota para criar um novo treinamento (exige autenticação)
app.post("/api/trainings", authenticateToken, upload.single('image'), async (req, res) => {
  const { title, description, links, categoryId } = req.body;
  const file = req.file;
  const imageName = file ? generateFileName() : null;

  let imageUrl = null;
  if (file) {
    // Processa a imagem antes de enviá-la para o S3.
    const fileBuffer = await sharp(file.buffer)
      .resize({ height: 1920, width: 1080, fit: "contain" })
      .toBuffer();

    await uploadFile(fileBuffer, imageName, file.mimetype); // Faz upload da imagem
    imageUrl = await getObjectSignedUrl(imageName); // Obtém URL pública da imagem
  }

  try {
    // Cria um novo treinamento no banco de dados, incluindo links de treinamento associados.
    const training = await prisma.training.create({
      data: {
        title,
        description,
        categoryId: +categoryId,
        imageName,
        imageUrl, // Armazena a URL da imagem
        trainingLinks: {
          create: JSON.parse(links).map((link) => ({ url: link })), // Cria os registros na tabela TrainingLink
        },
      },
      include: { trainingLinks: true }, // Inclui os links criados no retorno
    });

    res.status(201).json(training);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar treinamento" });
  }
});

// Rota para atualizar um treinamento
app.put("/api/trainings/:id", authenticateToken, upload.single('image'), async (req, res) => {
  const { title, description, links, categoryId } = req.body;
  const id = +req.params.id;
  const file = req.file;

  let imageName = null;
  let imageUrl = null;
  
  if (file) {
    // Processa a imagem antes de enviá-la para o S3.
    imageName = generateFileName();
    const fileBuffer = await sharp(file.buffer)
      .resize({ height: 1920, width: 1080, fit: "contain" })
      .toBuffer();
    
    await uploadFile(fileBuffer, imageName, file.mimetype); // Faz upload da nova imagem
    imageUrl = await getObjectSignedUrl(imageName); // Obtém URL pública da nova imagem
  }

  try {
    // Atualiza o treinamento no banco de dados com os novos dados e links.
    const training = await prisma.training.update({
      where: { id },
      data: {
        title,
        description,
        categoryId: +categoryId,
        imageName,
        imageUrl,
        trainingLinks: {
          deleteMany: {}, // Remove todos os links antigos
          create: JSON.parse(links).map((link) => ({ url: link })), // Adiciona novos links
        },
      },
      include: { trainingLinks: true }, // Inclui os links atualizados no retorno
    });

    res.json(training);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar treinamento" });
  }
});

// Rota para deletar um treinamento
app.delete("/api/trainings/:id", authenticateToken, async (req, res) => {
  const id = +req.params.id;
  
  try {
    // Obtém o treinamento, incluindo os links associados.
    const training = await prisma.training.findUnique({ 
      where: { id },
      include: { trainingLinks: true }, // Obtém os links associados ao treinamento
    });

    if (training?.imageName) {
      await deleteFile(training.imageName); // Apaga a imagem associada ao treinamento
    }

    // Remove os links associados ao treinamento
    await prisma.trainingLink.deleteMany({ where: { trainingId: id } });
    // Deleta o próprio treinamento
    await prisma.training.delete({ where: { id } });

    res.json({ message: "Treinamento deletado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar treinamento" });
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

    const imageUrl = await getObjectSignedUrl(post.imageName); // Gere a URL assinada
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
