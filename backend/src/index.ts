// src/index.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('✅ Backend funcionando correctamente');
});

// Rutas
import authRoutes from './routes/auth';
app.use('/api/auth', authRoutes);

import userRoutes from './routes/users';
app.use('/api/users', userRoutes);

// Escuchar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});