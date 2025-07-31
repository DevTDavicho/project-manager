// src/models/user.interface.ts

// Define la interfaz para la configuración de notificaciones
export interface NotificationSettings {
    emailNotifications: boolean; // Si el usuario recibe notificaciones por email
    pushNotifications: boolean;  // Si el usuario recibe notificaciones push
    weeklyDigest: boolean;       // Si el usuario recibe un resumen semanal
}

// Interfaz para el payload del token JWT
export interface JwtPayload {
    userId: string;                        // ID del usuario en el token
    email: string;                         // Email del usuario en el token
    role: 'admin' | 'member' | 'guest';    // Rol del usuario en el token
}

// Define la interfaz principal para el usuario
export interface User {
    userId: string;                        // ID único del usuario
    username: string;                      // Nombre de usuario
    email: string;                         // Email del usuario
    passwordHash: string;                  // Contraseña encriptada
    firstName?: string;                    // Nombre (opcional)
    lastName?: string;                     // Apellido (opcional)
    position?: string;                     // Cargo o puesto (opcional)
    department?: string;                   // Departamento (opcional)
    bio?: string;                          // Biografía (opcional)
    phone?: string;                        // Teléfono (opcional)
    avatar?: string;                       // URL del avatar (opcional)
    role: 'admin' | 'member' | 'guest';    // Rol del usuario
    createdAt: string;                     // Fecha de creación (formato ISO)
    updatedAt: string;                     // Fecha de última actualización (formato ISO)
    notificationSettings?: NotificationSettings; // Configuración de notificaciones (opcional)
}

// Interfaz para el cuerpo de la solicitud de registro
export interface RegisterBody {
    firstName: string;                     // Nombre
    lastName: string;                      // Apellido
    username: string;                      // Nombre de usuario
    email: string;                         // Email
    password: string;                      // Contraseña
    role?: 'admin' | 'member' | 'guest';   // Rol (opcional)
}

// Interfaz para el cuerpo de la solicitud de login
export interface LoginBody {
    email: string;                         // Email para iniciar sesión
    password: string;                      // Contraseña para iniciar sesión
}

// Interfaz para las actualizaciones de usuario (parcial)
export type UserUpdates = Partial<Omit<User, 'userId' | 'createdAt' | 'updatedAt'>>; // Permite actualizar cualquier campo excepto los IDs