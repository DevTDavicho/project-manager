// src/config/dynamodb.ts

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import dotenv from 'dotenv';

// 🔧 Cargar variables de entorno desde .env
dotenv.config();

// 🌍 Región de AWS (por defecto: us-east-1)
const REGION = process.env.AWS_REGION || 'us-east-1';

// 🧠 Crear cliente base de DynamoDB
const ddbClient = new DynamoDBClient({
    region: REGION,
});

// 📦 Crear DocumentClient para trabajar con objetos JSON directamente
export const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// ✅ Mensaje visual de confirmación
console.log(`🚀 DynamoDB DocumentClient inicializado en la región: ${REGION}`);