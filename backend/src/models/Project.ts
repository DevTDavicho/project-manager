// src/models/Project.ts

// Importa herramientas de mongoose para definir esquemas y modelos
import { Schema, model, Document, Types } from 'mongoose';

// Interfaz que representa la estructura de un proyecto en la base de datos
export interface IProject extends Document {
    name: string;                // Nombre del proyecto
    description?: string;        // Descripción opcional del proyecto
    members: Types.ObjectId[];   // Array de IDs de usuarios que son miembros del proyecto
    createdBy: Types.ObjectId;   // ID del usuario que creó el proyecto
    createdAt: Date;             // Fecha de creación del proyecto
    updatedAt: Date;             // Fecha de última actualización del proyecto
}

// Define el esquema de mongoose para proyectos
const projectSchema = new Schema<IProject>({
    name: { type: String, required: true, trim: true },           // Campo obligatorio, elimina espacios extra
    description: { type: String, trim: true },                    // Campo opcional, elimina espacios extra
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],      // Array de referencias a usuarios
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true } // Referencia al usuario creador, obligatorio
}, {
    timestamps: true, // Agrega automáticamente los campos createdAt y updatedAt
});

// Exporta el modelo para usarlo en la
export default model<IProject>('Project', projectSchema);