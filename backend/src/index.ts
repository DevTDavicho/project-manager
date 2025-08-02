// src/index.ts

// Importaciones principales
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from './config/dynamodb';

// Rutas integradas (DynamoDB)
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import notificationRoutes from './routes/notifications';
import dashboardRoutes from './routes/dashboard';

// Inicializar variables de entorno
dotenv.config();

// Crear instancia de Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS (modificar según frontend real)
app.use(cors({
  origin: [
    'http://localhost:4200',
    'http://localhost:3000',
    'https://tu-dominio-frontend.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares para datos JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Ruta de prueba para verificar backend
app.get('/', (req, res) => {
  res.send('✅ Backend funcionando correctamente');
});

// Rutas de la API (todas con DynamoDB)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Middleware de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);

  // Prueba rápida de conexión a DynamoDB
  ddbDocClient.send(new GetCommand({
    TableName: 'Users',
    Key: { userId: 'nonExistent' }
  }))
  .then(() => console.log('✅ Conexión a DynamoDB exitosa'))
  .catch((error) => console.error('❌ Error de conexión a DynamoDB:', error));
});