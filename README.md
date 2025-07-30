# 🧩 Project Manager – Aplicación Cloud en AWS

Aplicación web para la gestión de proyectos y tareas, desarrollada con Angular y Node.js, desplegada en una arquitectura cloud escalable sobre servicios de AWS.

---

## ⚙️ Tecnologías usadas

- AWS (EC2, EBS, EFS, Elastic Beanstalk, DynamoDB, S3, CloudFront)
- Node.js + Express
- Angular
- Docker
- Terraform (para infraestructura como código)
- CloudWatch + IAM

---

## 🏗️ Arquitectura

![arquitectura]()

---

## 📁 Estructura del Proyecto
```bash
project-manager/
├── backend/              # Código del backend (Node.js + Express)
│   ├── src/
│   ├── dist/
│   ├── package.json
│   ├── Procfile
│   └── Dockerfile
├── frontend/             # Código del frontend (Angular)
│   ├── src/
│   ├── angular.json
│   └── package.json
├── docs/                 # Documentación, arquitectura, informe técnico
│   └── arquitectura.png
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🚀 Cómo ejecutar el proyecto localmente

### Backend

```bash
cd backend/
npm install
npm run dev
```

### Frontend
```bash
cd frontend/
npm install
ng serve
```

## 👨‍💻 Autores del Proyecto

- Persona 1
- Persona 2
- Persona 3
- Persona 4
- Persona 5