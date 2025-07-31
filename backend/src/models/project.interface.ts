// src/models/project.interface.ts


export interface Project {
    projectId: string;      // ID único del proyecto
    name: string;           // Nombre del proyecto
    description?: string;   // Descripción opcional del proyecto
    members: string[];      // Lista de IDs de los miembros del proyecto
    createdBy: string;      // ID del usuario que creó el proyecto
    createdAt: string;      // Fecha de creación (formato ISO)
    updatedAt: string;      // Fecha de última actualización (formato ISO)

    // --- NUEVOS CAMPOS AÑADIDOS ---
    status?: string;        // Estado opcional del proyecto (ej: activo, pausado)
    priority?: string;      // Prioridad opcional del proyecto (ej: alta, media, baja)
    dueDate?: string;       // Fecha límite opcional (formato ISO)
}