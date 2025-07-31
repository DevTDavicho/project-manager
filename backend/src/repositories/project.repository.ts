// src/repositories/project.repository.ts (VERSIÓN FINAL, COMPLETA Y CON TODOS LOS CAMPOS)

import {
    TransactWriteCommand, // Comando para operaciones transaccionales en DynamoDB
    QueryCommand,         // Comando para consultar por clave primaria o índice
    UpdateCommand,        // Comando para actualizar atributos de un ítem
    PutCommand,           // Comando para insertar o sobrescribir un ítem
    DeleteCommand,        // Comando para eliminar un ítem
    BatchGetCommand       // Comando para obtener varios ítems en una sola petición
} from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../config/dynamodb'; // Cliente configurado para DynamoDB
import { Project } from '../models/project.interface'; // Importa la interfaz Project
import { randomUUID } from 'crypto'; // Genera IDs únicos

const PROJECTS_TABLE = 'Projects'; // Nombre de la tabla de proyectos
const USER_PROJECTS_INDEX = 'UserProjectsIndex'; // Nombre del índice secundario para usuarios


// =================================================================
// --- FUNCIONES DE LECTURA (GET) ---
// =================================================================
export const getProjectDetailsById = async (projectId: string): Promise<Project | null> => {
    const params = {
        TableName: PROJECTS_TABLE, // Tabla a consultar
        KeyConditionExpression: 'PK = :pk', // Consulta por clave primaria
        ExpressionAttributeValues: { ':pk': `PROJ#${projectId}` } // Valor de la clave primaria
    };
    const { Items } = await ddbDocClient.send(new QueryCommand(params)); // Ejecuta la consulta
    if (!Items || Items.length === 0) return null; // Si no hay resultados, retorna null

    const metadata = Items.find(item => item.SK === 'METADATA'); // Busca el ítem de metadatos
    if (!metadata) return null; // Si no hay metadatos, retorna null

    const members = Items // Obtiene los miembros del proyecto
        .filter(item => item.SK.startsWith('USER#')) // Filtra los ítems que representan miembros
        .map(item => item.SK.split('#')[1]); // Extrae el ID del usuario

    return {
        projectId: metadata.PK.split('#')[1], // Extrae el ID del proyecto
        name: metadata.name,                  // Nombre del proyecto
        description: metadata.description,    // Descripción del proyecto
        createdBy: metadata.createdBy,        // ID del creador
        createdAt: metadata.createdAt,        // Fecha de creación
        updatedAt: metadata.updatedAt,        // Fecha de última actualización
        members: members,                     // Lista de miembros
        status: metadata.status,              // Estado del proyecto
        priority: metadata.priority,          // Prioridad del proyecto
        dueDate: metadata.dueDate,            // Fecha límite
    };
};

export const getProjectsByUserId = async (userId: string): Promise<{ projectId: string }[]> => {
    const params = {
        TableName: PROJECTS_TABLE, // Tabla a consultar
        IndexName: USER_PROJECTS_INDEX, // Índice secundario para buscar por usuario
        KeyConditionExpression: 'SK = :user_sk', // Consulta por clave secundaria
        ExpressionAttributeValues: { ':user_sk': `USER#${userId}` }, // Valor de la clave secundaria
    };

    try {
        const { Items } = await ddbDocClient.send(new QueryCommand(params)); // Ejecuta la consulta
        const projects = Items?.map(item => ({ projectId: item.PK.split('#')[1] })) || []; // Extrae los IDs de proyecto
        return projects; // Retorna la lista de proyectos
    } catch (error) {
        console.error('Error al obtener proyectos por usuario:', error); // Muestra el error en consola
        throw error; // Lanza el error
    }
};


// =================================================================
// --- FUNCIONES DE ESCRITURA (CREATE, UPDATE, DELETE) ---
// =================================================================
export const createProject = async (projectData: Omit<Project, 'projectId' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    const projectId = randomUUID(); // Genera un ID único para el proyecto
    const now = new Date().toISOString(); // Fecha actual en formato ISO
    const newProject: Project = { ...projectData, projectId, createdAt: now, updatedAt: now }; // Crea el objeto del proyecto
    const membersToLink = new Set([newProject.createdBy, ...newProject.members]); // Conjunto de miembros (incluye al creador)
    const transactionItems = []; // Array para las operaciones de la transacción

    transactionItems.push({
        Put: {
            TableName: PROJECTS_TABLE, // Tabla de proyectos
            Item: {
                PK: `PROJ#${projectId}`, SK: `METADATA`, // Claves primarias
                name: newProject.name, description: newProject.description, // Nombre y descripción
                createdBy: newProject.createdBy, createdAt: newProject.createdAt, updatedAt: newProject.updatedAt, // Fechas y creador
                status: newProject.status, priority: newProject.priority, dueDate: newProject.dueDate, // Campos adicionales
            },
        },
    });

    membersToLink.forEach(memberId => {
        transactionItems.push({
            Put: { TableName: PROJECTS_TABLE, Item: { PK: `PROJ#${projectId}`, SK: `USER#${memberId}` } }, // Relaciona cada miembro con el proyecto
        });
    });

    try {
        await ddbDocClient.send(new TransactWriteCommand({ TransactItems: transactionItems })); // Ejecuta la transacción
        return newProject; // Retorna el proyecto creado
    } catch (error) { 
        console.error('Error en createProject:', error); // Muestra el error en consola
        throw new Error('No se pudo crear el proyecto'); // Lanza un error
    }
};

export const updateProjectDetails = async (projectId: string, updateData: any): Promise<any> => {
    const now = new Date().toISOString(); // Fecha actual
    const allowedToUpdate = ['name', 'description', 'status', 'priority', 'dueDate']; // Campos permitidos para actualizar
    const updatePayload: any = { updatedAt: now }; // Objeto con los datos a actualizar

    for (const field of allowedToUpdate) {
        if (updateData[field] !== undefined) { updatePayload[field] = updateData[field]; } // Solo actualiza los campos permitidos
    }

    const keys = Object.keys(updatePayload); // Obtiene los nombres de los campos a actualizar
    if (keys.length <= 1) { return getProjectDetailsById(projectId); } // Si no hay cambios, retorna el proyecto actual

    const UpdateExpression = 'set ' + keys.map(k => `#${k} = :${k}`).join(', '); // Expresión de actualización
    const ExpressionAttributeNames = keys.reduce((acc, k) => ({ ...acc, [`#${k}`]: k }), {}); // Mapeo de nombres de atributos
    const ExpressionAttributeValues = keys.reduce((acc, k) => ({ ...acc, [`:${k}`]: updatePayload[k] }), {}); // Valores de los atributos

    const params = {
        TableName: PROJECTS_TABLE, Key: { PK: `PROJ#${projectId}`, SK: `METADATA` }, // Claves primarias
        UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues, // Parámetros de actualización
        ReturnValues: 'ALL_NEW', // Devuelve el ítem actualizado
    } as const;

    const { Attributes } = await ddbDocClient.send(new UpdateCommand(params)); // Ejecuta la actualización
    return Attributes; // Retorna los atributos actualizados
};

export const addMemberToProject = (projectId: string, memberId: string) => {
    return ddbDocClient.send(new PutCommand({
        TableName: PROJECTS_TABLE, Item: { PK: `PROJ#${projectId}`, SK: `USER#${memberId}` } // Agrega un miembro al proyecto
    }));
};

export const removeMemberFromProject = (projectId: string, memberId: string) => {
    return ddbDocClient.send(new DeleteCommand({
        TableName: PROJECTS_TABLE, Key: { PK: `PROJ#${projectId}`, SK: `USER#${memberId}` } // Elimina un miembro del proyecto
    }));
};

export const deleteProjectById = async (projectId: string) => {
    const queryParams = { TableName: PROJECTS_TABLE, KeyConditionExpression: 'PK = :pk', ExpressionAttributeValues: { ':pk': `PROJ#${projectId}` } };
    const { Items } = await ddbDocClient.send(new QueryCommand(queryParams)); // Busca todos los ítems del proyecto

    if (!Items || Items.length === 0) return; // Si no hay ítems, termina
    const deleteRequests = Items.map(item => ({ Delete: { TableName: PROJECTS_TABLE, Key: { PK: item.PK, SK: item.SK } } })); // Prepara las operaciones de borrado
    await ddbDocClient.send(new TransactWriteCommand({ TransactItems: deleteRequests })); // Ejecuta la transacción para borrar todo
};

/**
 * Busca los detalles de múltiples proyectos por sus IDs de forma eficiente.
 * @param projectIds - Un array de IDs de proyecto a buscar.
 * @returns Un array de objetos de proyecto encontrados.
 */
export const getProjectsByIds = async (projectIds: string[]): Promise<Project[]> => {
    if (!projectIds || projectIds.length === 0) {
        return []; // Si no hay IDs, retorna array vacío
    }
    const uniqueProjectIds = [...new Set(projectIds)]; // Elimina IDs duplicados

    // Usamos BatchGetCommand para traer múltiples items de forma optimizada
    const params = {
        RequestItems: {
            [PROJECTS_TABLE]: {
                Keys: uniqueProjectIds.map(id => ({
                    PK: `PROJ#${id}`, // Clave primaria
                    SK: 'METADATA'    // Solo los metadatos
                })),
            },
        },
    };

    try {
        const { Responses } = await ddbDocClient.send(new BatchGetCommand(params)); // Ejecuta la consulta batch
        const projects = Responses?.[PROJECTS_TABLE] || []; // Obtiene los proyectos encontrados

        // Mapeamos la respuesta al formato de nuestra interfaz Project
        return projects.map(p => ({
            projectId: p.PK.split('#')[1], // Extrae el ID del proyecto
            name: p.name,                  // Nombre
            description: p.description,    // Descripción
            createdBy: p.createdBy,        // Creador
            createdAt: p.createdAt,        // Fecha de creación
            updatedAt: p.updatedAt,        // Fecha de actualización
            members: [],                   // Nota: esta consulta no trae los miembros, solo los metadatos
            status: p.status,              // Estado
            priority: p.priority,          // Prioridad
            dueDate: p.dueDate,            // Fecha límite
        }));
    } catch (error) {
        console.error('Error al buscar proyectos por IDs:', error); // Muestra el error en consola
        throw new Error('Error al obtener proyectos'); // Lanza un error
    }
};