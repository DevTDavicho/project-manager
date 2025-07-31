// src/models/Notification.ts

// Importa herramientas de mongoose para definir esquemas y modelos
import { Schema, model, Document, Types } from 'mongoose';

// Define la estructura de una notificación en TypeScript
export interface INotification extends Document {
    user: Types.ObjectId; // ID del usuario que recibe la notificación
    message: string;      // Mensaje que se muestra al usuario
    read: boolean;        // Indica si la notificación ha sido leída
    createdAt: Date;      // Fecha de creación de la notificación
    updatedAt: Date;      // Fecha de última actualización de la notificación
}

// Crea el esquema de la notificación para mongoose
const notificationSchema = new Schema<INotification>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Relaciona la notificación con un usuario
    message: { type: String, required: true, trim: true },              // Mensaje obligatorio, elimina espacios extra
    read: { type: Boolean, default: false }                             // Por defecto, la notificación está sin leer
}, {
    timestamps: true, // Agrega automáticamente los campos createdAt y updatedAt
});

// Exporta el modelo para usarlo en la aplicación
export default model<INotification>('Notification', notificationSchema);