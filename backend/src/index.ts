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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

import authRoutes from './routes/auth';
app.use('/api/auth', authRoutes);

import userRoutes from './routes/users';
app.use('/api/users', userRoutes);

app.listen(3000, () => {
  console.log('🚀 Servidor corriendo en puerto 3000');
});
