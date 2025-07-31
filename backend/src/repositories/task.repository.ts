// src/repositories/task.repository.ts

import {
    PutCommand,      // Comando para insertar o sobrescribir una tarea
    QueryCommand,    // Comando para consultar tareas por clave primaria o índice
    UpdateCommand,   // Comando para actualizar atributos de una tarea
    DeleteCommand,   // Comando para eliminar una tarea
    ScanCommand      // Comando para escanear toda la tabla (útil para búsquedas generales)
} from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../config/dynamodb'; // Cliente configurado para DynamoDB
import { Task } from '../models/task.interface';   // Importa la interfaz Task
import { randomUUID } from 'crypto';               // Genera IDs únicos

const PROJECTS_TABLE = 'Projects';                 // Nombre de la tabla de proyectos
const ASSIGNED_TASKS_INDEX = 'AssignedTasksIndex'; // Nombre del índice secundario para tareas asignadas

export const createTaskInProject = async (taskData: Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    const taskId = randomUUID();                   // Genera un ID único para la tarea
    const now = new Date().toISOString();          // Fecha actual en formato ISO
    const newTask: Task = { ...taskData, taskId, createdAt: now, updatedAt: now }; // Crea el objeto de la tarea

    const params = {
        TableName: PROJECTS_TABLE,                 // Tabla donde se guarda la tarea
        Item: {
            PK: `PROJ#${newTask.project}`,         // Clave primaria: proyecto
            SK: `TASK#${taskId}`,                  // Clave secundaria: tarea
            ...newTask                             // Resto de los datos de la tarea
        },
    };
    try {
        await ddbDocClient.send(new PutCommand(params)); // Inserta la tarea en la tabla
        return newTask;                                 // Devuelve la tarea creada
    } catch (error) {
        console.error('Error al crear la tarea:', error); // Muestra el error en consola
        throw new Error('No se pudo crear la tarea');     // Lanza un error
    }
};

export const getTasksByProjectId = async (projectId: string): Promise<Task[]> => {
    const params = {
        TableName: PROJECTS_TABLE,                 // Tabla a consultar
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)', // Consulta por proyecto y tareas
        ExpressionAttributeValues: {
            ':pk': `PROJ#${projectId}`,            // Valor de la clave primaria
            ':sk': 'TASK#',                        // Prefijo para identificar tareas
        },
    };
    try {
        const { Items } = await ddbDocClient.send(new QueryCommand(params)); // Ejecuta la consulta
        return Items as Task[];                        // Devuelve el array de tareas
    } catch (error) {
        console.error('Error al obtener tareas por proyecto:', error); // Muestra el error en consola
        throw new Error('Error al obtener las tareas del proyecto');   // Lanza un error
    }
};

export const getTasksByAssignedUser = async (userId: string): Promise<Task[]> => {
    const params = {
        TableName: PROJECTS_TABLE,                 // Tabla a consultar
        IndexName: ASSIGNED_TASKS_INDEX,           // Índice secundario para tareas asignadas
        KeyConditionExpression: 'assignedTo = :userId', // Consulta por usuario asignado
        ExpressionAttributeValues: { ':userId': userId }, // Valor del usuario
    };
    try {
        const { Items } = await ddbDocClient.send(new QueryCommand(params)); // Ejecuta la consulta
        return Items as Task[];                        // Devuelve el array de tareas
    } catch (error) {
        console.error('Error al obtener tareas por usuario asignado:', error); // Muestra el error en consola
        throw new Error('Error al obtener las tareas del usuario');            // Lanza un error
    }
};

export const findTaskById = async (taskId: string): Promise<Task | null> => {
    const params = {
        TableName: PROJECTS_TABLE,                 // Tabla a escanear
        FilterExpression: 'taskId = :taskId',      // Filtro por ID de tarea
        ExpressionAttributeValues: { ':taskId': taskId }, // Valor del ID de tarea
    };
    try {
        const { Items } = await ddbDocClient.send(new ScanCommand(params)); // Ejecuta el escaneo
        return Items && Items.length > 0 ? (Items[0] as Task) : null;       // Devuelve la tarea encontrada o null
    } catch (error) {
        console.error(`Error al escanear en busca de la tarea ${taskId}:`, error); // Muestra el error en consola
        throw new Error('Error al encontrar la tarea');                            // Lanza un error
    }
};

export const updateTask = async (projectId: string, taskId: string, updateData: Partial<Task>): Promise<any> => {
    updateData.updatedAt = new Date().toISOString(); // Actualiza la fecha de modificación
    const allowedToUpdate = ['title', 'description', 'status', 'assignedTo', 'dueDate', 'priority']; // Campos permitidos
    const updatePayload: any = { updatedAt: updateData.updatedAt }; // Objeto con los datos a actualizar
    for (const field of allowedToUpdate) {
        if ((updateData as any)[field] !== undefined) {
            updatePayload[field] = (updateData as any)[field]; // Solo actualiza los campos permitidos
        }
    }
    const keys = Object.keys(updatePayload); // Obtiene los nombres de los campos a actualizar
    if (keys.length <= 1) { return findTaskById(taskId); } // Si no hay cambios, retorna la tarea actual
    const UpdateExpression = 'set ' + keys.map(k => `#${k} = :${k}`).join(', '); // Expresión de actualización
    const ExpressionAttributeNames = keys.reduce((acc, k) => ({ ...acc, [`#${k}`]: k }), {}); // Mapeo de nombres de atributos
    const ExpressionAttributeValues = keys.reduce((acc, k) => ({ ...acc, [`:${k}`]: updatePayload[k] }), {}); // Valores de los atributos
    const params = {
        TableName: PROJECTS_TABLE,
        Key: { PK: `PROJ#${projectId}`, SK: `TASK#${taskId}` }, // Claves primarias
        UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues, // Parámetros de actualización
        ReturnValues: 'ALL_NEW', // Devuelve el ítem actualizado
    } as const;
    const { Attributes } = await ddbDocClient.send(new UpdateCommand(params)); // Ejecuta la actualización
    return Attributes; // Devuelve los atributos actualizados
};

export const deleteTask = async (projectId: string, taskId: string): Promise<void> => {
    const params = {
        TableName: PROJECTS_TABLE,                 // Tabla donde está la tarea
        Key: { PK: `PROJ#${projectId}`, SK: `TASK#${taskId}` }, // Claves primarias para identificar la tarea
    };
    try {
        await ddbDocClient.send(new DeleteCommand(params)); // Elimina la tarea de la tabla
    } catch (error) {
        console.error('Error al eliminar la tarea:', error); // Muestra el error en consola
        throw new Error('No se pudo eliminar la tarea');     // Lanza un error
    }
};