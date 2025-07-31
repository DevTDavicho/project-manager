// src/models/Task,ts


import { Schema, model, Document, Types } from 'mongoose';

// Interfaz que representa la estructura de una tarea en la base de datos
export interface ITask extends Document {
    title: string;                // Título de la tarea
    description?: string;         // Descripción opcional de la tarea
    status: 'pending' | 'in_progress' | 'completed'; // Estado actual de la tarea
    project: Types.ObjectId;      // Referencia al proyecto al que pertenece la tarea
    assignedTo?: Types.ObjectId;  // Referencia al usuario asignado a la tarea (opcional)
    dueDate?: Date;               // Fecha límite de la tarea (opcional)
    createdAt: Date;              // Fecha de creación de la tarea
    updatedAt: Date;              // Fecha de última actualización de la tarea
}

// Define el esquema de mongoose para tareas
const taskSchema = new Schema<ITask>({
    title: { type: String, required: true, trim: true }, // Título obligatorio, elimina espacios extra
    description: { type: String, trim: true },           // Descripción opcional, elimina espacios extra
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' }, // Estado con valores permitidos y valor por defecto
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true }, // Relaciona la tarea con un proyecto
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' }, // Relaciona la tarea con un usuario (opcional)
    dueDate: { type: Date }                                   // Fecha límite opcional
}, {
    timestamps: true, // Agrega automáticamente los campos createdAt y updatedAt
});

// Exporta el modelo para usarlo
export default model<ITask>('Task', taskSchema);