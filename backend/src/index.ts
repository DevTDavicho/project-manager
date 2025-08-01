// src/index.ts

// Importaciones principales
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import { GetCommand } from '@aws-sdk/lib-dynamodb';

// Configuraciones
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de prueba
app.get('/', (req, res) => {
    res.send('✅ Backend funcionando correctamente');
});

// Rutas de la aplicacion
import authRoutes from './routes/auth';
app.use('/api/auth', authRoutes);

import userRoutes from './routes/users';
app.use('/api/users', userRoutes);

// Conexion a mongodb (temproal para prueba)
/*import connectDB from './config/db';
connectDB(); // Asegúrate de llamar a la función*/

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});