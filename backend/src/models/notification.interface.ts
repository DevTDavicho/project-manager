// src/models/notification.interface.ts

// Enum que define los tipos posibles de notificaciones
export enum NotificationType {
    LOGIN_SUCCESS = 'login_success',           // Notificación por inicio de sesión exitoso
    LOGOUT_SUCCESS = 'logout_success',         // Notificación por cierre de sesión exitoso
    PROFILE_UPDATED = 'profile_updated',       // Notificación cuando el perfil es actualizado
    AVATAR_UPLOADED = 'avatar_uploaded',       // Notificación cuando se sube un avatar
    AVATAR_DELETED = 'avatar_deleted',         // Notificación cuando se elimina un avatar
    PASSWORD_UPDATED = 'password_updated',     // Notificación cuando se actualiza la contraseña
    PROJECT_CREATED = 'project_created',       // Notificación cuando se crea un proyecto
    TASK_CREATED = 'task_created',             // Notificación cuando se crea una tarea
    TASK_ASSIGNED = 'task_assigned',           // Notificación cuando se asigna una tarea
    TASK_UPDATED = 'task_updated',             // Notificación cuando se actualiza una tarea
    TASK_COMPLETED = 'task_completed',         // Notificación cuando se completa una tarea
    PROJECT_INVITATION = 'project_invitation', // Notificación por invitación a proyecto
    PROJECT_UPDATED = 'project_updated',       // Notificación cuando se actualiza un proyecto
    // ... otros tipos de notificación pueden agregarse aquí
}

// Interfaz que representa una notificación individual
export interface Notification {
    notificationId: string; // Identificador único de la notificación
    userId: string;         // ID del usuario al que pertenece la notificación
    message: string;        // Mensaje de la notificación
    type: NotificationType; // Tipo de notificación (del enum anterior)
    read: boolean;          // Indica si la notificación ha sido leída

    createdAt: string;      // Fecha de creación (formato ISO)
    updatedAt: string;      // Fecha de última actualización (formato ISO)
    // taskId?: string;      // (Opcional) ID de la tarea relacionada, si aplica
    // projectId?: string;   // (Opcional) ID del proyecto relacionado, si aplica
}

// Interfaz para la configuración de notificaciones de un usuario
export interface NotificationSettings {
    emailNotifications: boolean; // Si el usuario recibe notificaciones por email
    pushNotifications: boolean;  // Si el usuario recibe notificaciones push
    weeklyDigest: boolean;       // Si el usuario recibe un resumen semanal
}