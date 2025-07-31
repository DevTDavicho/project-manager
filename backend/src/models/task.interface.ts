// src/models/task.interface.ts

// Define la estructura de una tarea
export interface Task {
    taskId: string;          // ID único para cada tarea
    title: string;           // Título de la tarea
    description?: string;    // Descripción opcional de la tarea
    status: 'pending' | 'in_progress' | 'completed'; // Estado actual de la tarea

    // Las referencias ahora son solo strings con los IDs
    project: string;         // ID del proyecto al que pertenece la tarea
    assignedTo?: string;     // ID del usuario asignado a la tarea (opcional)

    dueDate?: string;        // Fecha límite de la tarea (formato ISO, opcional)
    createdAt: string;       // Fecha de creación de la tarea (formato ISO)
    updatedAt: string;       // Fecha de última actualización de la tarea (formato ISO)
}