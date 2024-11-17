import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import documentRoutes from './routes/documentRoutes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('src/uploads'));

// Routes
app.use('/documents', documentRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
