// src/middleware/auth.ts

// -------------------------------
// Middleware: Verifica JWT en las peticiones protegidas
// -------------------------------
// Importa tipos necesarios desde Express
import { Request, Response, NextFunction } from 'express';
// Importa la biblioteca jsonwebtoken para verificar tokens JWT
import jwt from 'jsonwebtoken';

// Define la forma que tendrá el token una vez decodificado (payload)
interface JwtPayload {
    userId: string;     // ID del usuario
    email: string; // Incluye todos los campos que estén en el payload de tu token
    role: string;       // Rol del usuario (opcional, dependiendo de tu implementación)
}

// Extiende el objeto Request para incluir el campo opcional 'user' con la forma del payload JWT
export interface AuthRequest extends Request {
    user?: JwtPayload;
}

// Obtiene el secreto JWT desde las variables de entorno
const JWT_SECRET = process.env.JWT_SECRET as string;

// Verifica si la variable está definida; si no, lanza advertencia
if (!JWT_SECRET) {
    console.error('JWT_SECRET no está definido en las variables de entorno. Autenticación fallará.');
}

// Middleware que verifica si el usuario está autenticado mediante JWT
export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Obtiene el encabezado 'Authorization' del request
    const authHeader = req.headers.authorization;

    // Si no existe el header, responde con error 401 (no autorizado)
    if(!authHeader) return res.status(401).json({ message: 'No autorizado' });

    // Extrae el token (esperando formato "Bearer <token>")
    const token = authHeader.split(' ')[1];

    // Si el token no está bien formado o vacío, responde con error
    if(!token) return res.status(401).json({ message: 'Token no válido' });

    try {
        // Verifica el token usando el secreto definido
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JwtPayload;

        // Asigna el usuario decodificado al request (disponible en los controladores)
        req.user = decoded;

        // Continúa al siguiente middleware o ruta
        next();
    } catch (error) {
        // Si ocurre un error al verificar el token, responde con error 403 (prohibido)
        return res.status(403).json({ message: 'Token inválido' });
    }
};