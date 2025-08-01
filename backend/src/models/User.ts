// src/models/User.ts

// Importa las interfaces necesarias
import { User, NotificationSettings } from '../models/user.interface';

// Clase que implementa la interfaz User
export class UserClass implements User {
    userId: string;                          // ID único del usuario
    username: string;                        // Nombre de usuario
    email: string;                           // Email del usuario
    passwordHash: string;                    // Contraseña encriptada
    firstName?: string;                      // Nombre (opcional)
    lastName?: string;                       // Apellido (opcional)
    position?: string;                       // Cargo o puesto (opcional)
    department?: string;                     // Departamento (opcional)
    bio?: string;                            // Biografía (opcional)
    phone?: string;                          // Teléfono (opcional)
    avatar?: string;                         // URL del avatar (opcional)
    role: 'admin' | 'member' | 'guest';      // Rol del usuario
    createdAt: string;                       // Fecha de creación (formato ISO)
    updatedAt: string;                       // Fecha de última actualización (formato ISO)
    notificationSettings?: NotificationSettings; // Configuración de notificaciones (opcional)

    // Constructor que recibe un objeto User
    constructor(data: User) {
        this.userId = data.userId;           // Asigna el ID único
        this.username = data.username;       // Asigna el nombre de usuario
        this.email = data.email;             // Asigna el email
        this.passwordHash = data.passwordHash;// Asigna la contraseña encriptada
        this.firstName = data.firstName;     // Asigna el nombre (opcional)
        this.lastName = data.lastName;       // Asigna el apellido (opcional)
        this.position = data.position;       // Asigna el cargo (opcional)
        this.department = data.department;   // Asigna el departamento (opcional)
        this.bio = data.bio;                 // Asigna la biografía (opcional)
        this.phone = data.phone;             // Asigna el teléfono (opcional)
        this.avatar = data.avatar;           // Asigna la URL del avatar (opcional)
        this.role = data.role;               // Asigna el rol
        this.createdAt = data.createdAt;     // Asigna la fecha de creación
        this.updatedAt = data.updatedAt;     // Asigna la fecha de última actualización
        this.notificationSettings = data.notificationSettings; // Asigna la configuración de notificaciones (opcional)
    }
}