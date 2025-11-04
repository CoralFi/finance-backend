# CoralFi Finance Backend

Backend API para CoralFi - Plataforma de servicios financieros integrada con Conduit Financial.

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# Iniciar servidor de desarrollo
npm run dev
# O con Vercel
vercel dev
```

### Producción

```bash
# Build
npm run build

# Start
npm start
```

## 📁 Estructura del Proyecto

```
finance-backend/
├── src/
│   ├── api/              # Endpoints de la API
│   │   ├── auth/         # Autenticación
│   │   ├── customers/    # Gestión de clientes
│   │   ├── transactions/ # Transacciones
│   │   ├── webhooks/     # Webhooks de Conduit
│   │   └── ...
│   ├── services/         # Lógica de negocio
│   ├── db/              # Configuración de base de datos
│   ├── types/           # Tipos TypeScript
│   └── utils/           # Utilidades
├── database/            # Scripts SQL
└── docs/               # Documentación

```

## 🔧 Configuración

### Variables de Entorno

Consulta `.env.example` para ver todas las variables requeridas:

- **Supabase**: Base de datos y autenticación
- **Conduit**: API de servicios financieros
- **Webhooks**: Secret para validación de webhooks

### Base de Datos

Ejecuta el script SQL para crear las tablas necesarias:

```bash
# En Supabase SQL Editor
database/webhooks_schema.sql
```

## 📡 Webhooks de Conduit

Este backend incluye integración completa con webhooks de Conduit para rastrear el estado de las transacciones en tiempo real.

### Configuración de Webhooks

Ver la guía completa: [WEBHOOKS_SETUP.md](./WEBHOOKS_SETUP.md)

**Endpoint de Webhooks:**
```
POST /api/webhooks/conduit
```

**Eventos Soportados:**
- Transacciones (created, completed, cancelled, etc.)
- Customers (created, active, compliance_rejected, etc.)
- Counterparties (active, deleted, in_compliance_review, etc.)

### Características de Webhooks

✅ Validación HMAC SHA256  
✅ Manejo de idempotencia  
✅ Actualización automática en Supabase  
✅ Logging completo de eventos  
✅ Protección contra replay attacks  

## 🔐 Seguridad

- Validación de firma HMAC para webhooks
- CORS configurado por entorno
- Row Level Security (RLS) en Supabase
- Autenticación con tokens

## 📚 Documentación API

La documentación Swagger está disponible en:

```
http://localhost:3000/api-docs (desarrollo)
```

## 🧪 Testing

### Probar Webhooks Localmente

```bash
# Usar ngrok para exponer localhost
ngrok http 3000

# Configurar la URL de ngrok en Conduit Dashboard
https://your-ngrok-url.ngrok.io/api/webhooks/conduit
```

## 📊 Endpoints Principales

### Autenticación
- `POST /api/auth/signup` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/change-password` - Cambiar contraseña

### Transacciones
- `GET /api/business/transactions` - Listar transacciones
- `POST /api/business/transactions` - Crear transacción
- `GET /api/business/transactions/:id` - Obtener transacción

### Webhooks
- `POST /api/webhooks/conduit` - Recibir webhooks de Conduit
- `GET /api/webhooks/health` - Health check

## 🛠️ Tecnologías

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **API Integration**: Conduit Financial
- **Deployment**: Vercel

## 📝 Scripts Disponibles

```bash
npm run dev      # Desarrollo con hot-reload
npm run build    # Compilar TypeScript
npm start        # Iniciar en producción
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

ISC

## 🆘 Soporte

Para problemas o preguntas:
- Revisa la documentación en `/docs`
- Consulta [WEBHOOKS_SETUP.md](./WEBHOOKS_SETUP.md) para webhooks
- Abre un issue en GitHub