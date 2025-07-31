// src/repositories/notification.repository.ts

import {
    PutCommand,            // Comando para insertar o sobrescribir un ítem en DynamoDB
    QueryCommand,          // Comando para consultar ítems por clave primaria
    UpdateCommand,         // Comando para actualizar atributos de un ítem
    DeleteCommand,         // Comando para eliminar un ítem
    ScanCommand,           // Comando para escanear toda la tabla (ineficiente en tablas grandes)
    TransactWriteCommand   // Comando para ejecutar varias operaciones en una transacción
} from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../config/dynamodb'; // Cliente configurado para DynamoDB
import { Notification } from '../models/notification.interface'; // Importa la interfaz de notificación
import { randomUUID } from 'crypto'; // Genera IDs únicos

// Nombre de la tabla de notificaciones
const NOTIFICATIONS_TABLE = 'Notifications';

export const createNotification = async (
    notificationData: Omit<Notification, 'notificationId' | 'read' | 'createdAt' | 'updatedAt'>
): Promise<Notification> => {
    const now = new Date(); // Fecha actual
    const newNotification: Notification = {
        ...notificationData,                  // Copia los datos recibidos
        notificationId: randomUUID(),         // Genera un ID único
        read: false,                          // La notificación inicia como no leída
        createdAt: now.toISOString(),         // Fecha de creación en formato ISO
        updatedAt: now.toISOString(),         // Fecha de actualización en formato ISO
    };
    // await ddbDocClient.send(new PutCommand({ TableName: NOTIFICATIONS_TABLE, Item: newNotification })); // Guarda la notificación en la tabla
    return newNotification; // Devuelve la notificación creada
};

export const getNotificationsByUserId = async (userId: string): Promise<Notification[]> => {
    const params = {
        TableName: NOTIFICATIONS_TABLE,           // Tabla a consultar
        KeyConditionExpression: 'userId = :userId', // Consulta por userId
        ExpressionAttributeValues: { ':userId': userId }, // Valor para la consulta
        ScanIndexForward: false,                  // Orden descendente (más recientes primero)
    };
    const { Items } = await ddbDocClient.send(new QueryCommand(params)); // Ejecuta la consulta
    return Items as Notification[]; // Devuelve el array de notificaciones
};

/**
 * NUEVA FUNCIÓN: Busca una notificación por su ID único.
 * ADVERTENCIA: Usa Scan, ineficiente en tablas muy grandes.
 */
export const findNotificationById = async (notificationId: string): Promise<Notification | null> => {
    const params = {
        TableName: NOTIFICATIONS_TABLE,              // Tabla a escanear
        FilterExpression: 'notificationId = :notificationId', // Filtro por ID de notificación
        ExpressionAttributeValues: { ':notificationId': notificationId }, // Valor para el filtro
    };
    const { Items } = await ddbDocClient.send(new ScanCommand(params)); // Ejecuta el escaneo
    return Items && Items.length > 0 ? (Items[0] as Notification) : null; // Devuelve la notificación encontrada o null
};

export const markNotificationAsRead = async (userId: string, createdAt: string): Promise<Notification> => {
    const params = {
        TableName: NOTIFICATIONS_TABLE,          // Tabla a actualizar
        Key: { userId, createdAt },              // Clave primaria de la notificación
        UpdateExpression: 'set #read = :read, updatedAt = :updatedAt', // Expresión de actualización
        ExpressionAttributeNames: { '#read': 'read' }, // Mapeo de nombres de atributos
        ExpressionAttributeValues: { ':read': true, ':updatedAt': new Date().toISOString() }, // Nuevos valores
        ReturnValues: 'ALL_NEW',                 // Devuelve el ítem actualizado
    } as const;
    const { Attributes } = await ddbDocClient.send(new UpdateCommand(params)); // Ejecuta la actualización
    return Attributes as Notification; // Devuelve la notificación actualizada
};

/**
 * NUEVA FUNCIÓN: Marca todas las notificaciones de un usuario como leídas.
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
    // 1. Obtenemos todas las notificaciones del usuario.
    const notifications = await getNotificationsByUserId(userId); // Trae todas las notificaciones del usuario
    const unreadNotifications = notifications.filter(n => !n.read); // Filtra las que no están leídas

    if (unreadNotifications.length === 0) return; // Si no hay ninguna sin leer, termina

    // 2. Creamos una operación de actualización para cada una.
    const updateRequests = unreadNotifications.map(n => ({
        Put: { // Usamos Put para sobrescribir, es más simple que Update en una transacción
            TableName: NOTIFICATIONS_TABLE, // Tabla de notificaciones
            Item: { ...n, read: true, updatedAt: new Date().toISOString() }, // Marca como leída y actualiza la fecha
        }
    }));

    // 3. Las ejecutamos en un batch para ser eficientes.
    // TransactWriteCommand tiene un límite de 100 items.
    await ddbDocClient.send(new TransactWriteCommand({ TransactItems: updateRequests })); // Ejecuta todas las actualizaciones en una transacción
};

export const deleteNotification = async (userId: string, createdAt: string): Promise<void> => {
    await ddbDocClient.send(new DeleteCommand({ TableName: NOTIFICATIONS_TABLE, Key: { userId, createdAt } }));     // Elimina la notificación por clave primaria
};