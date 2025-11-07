# 📄 Conduit Documents API - Implementación Completa

## 🎯 Resumen

Se ha implementado completamente la integración con la API de documentos de Conduit Financial, permitiendo subir documentos y registrar automáticamente la información en Supabase.

## ✨ Características Implementadas

### 1. **Upload de Documentos a Conduit**
- ✅ Endpoint POST para subir archivos
- ✅ Soporte para múltiples tipos de archivo (PDF, imágenes, Word, Excel)
- ✅ Validación de tamaño (máx. 10MB)
- ✅ Validación de tipo MIME

### 2. **Registro en Base de Datos**
- ✅ Tabla `conduit_documents` en Supabase
- ✅ Almacenamiento de metadatos del documento
- ✅ Registro de quién subió el documento (`conduit_id`)
- ✅ Timestamp de subida
- ✅ Row Level Security (RLS) habilitado

### 3. **Validaciones Completas**
- ✅ Validación de campos requeridos
- ✅ Validación de valores permitidos (scope, type, purpose)
- ✅ Validación condicional (purpose requerido para transactions)
- ✅ Manejo de errores detallado

## 📁 Archivos Creados

### Backend (TypeScript)

```
src/
├── api/
│   └── bussiness/
│       └── documents/
│           ├── index.ts                    # Router con configuración de multer
│           └── uploadDocument.ts           # Controlador principal
├── services/
│   └── conduit/
│       └── conduit-financial.ts            # Método uploadDocument agregado
```

### Base de Datos

```
database/
└── documents_schema.sql                    # Schema completo con tablas, índices, RLS
```

### Documentación

```
├── DOCUMENTS_API_SETUP.md                  # Documentación completa
├── QUICK_START_DOCUMENTS.md                # Guía rápida
├── INSTALL_DOCUMENTS_API.md                # Instrucciones de instalación
└── README_DOCUMENTS_API.md                 # Este archivo
```

## 🗄️ Estructura de Base de Datos

### Tabla: `conduit_documents`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `document_id` | TEXT | ID del documento en Conduit |
| `conduit_id` | TEXT | **ID del usuario que subió el documento** |
| `scope` | TEXT | transaction, counterparty, customer |
| `type` | TEXT | invoice, contract |
| `purpose` | TEXT | transaction_justification |
| `file_name` | TEXT | Nombre original del archivo |
| `file_size` | INTEGER | Tamaño en bytes |
| `mime_type` | TEXT | Tipo MIME del archivo |
| `uploaded_at` | TIMESTAMP | Fecha de subida |
| `created_at` | TIMESTAMP | Fecha de creación del registro |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

### Vista: `documents_stats`

Vista para estadísticas de documentos agrupados por usuario, scope, tipo y fecha.

## 🚀 Endpoint Implementado

### POST `/api/business/documents/upload`

**Request (multipart/form-data):**

```javascript
{
  file: File,                    // Archivo a subir
  conduit_id: string,            // ID del usuario
  scope: string,                 // transaction | counterparty | customer
  type: string,                  // invoice | contract
  purpose?: string               // transaction_justification (requerido si scope=transaction)
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "document_id": "doc_2ofTAESrTs4uQ8N3yGBMhGj59jV",
    "conduit_id": "user_123",
    "file_name": "invoice.pdf",
    "file_size": 245678,
    "scope": "transaction",
    "type": "invoice",
    "uploaded_at": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🔧 Tecnologías Utilizadas

- **Express.js** - Framework web
- **Multer** - Manejo de uploads multipart/form-data
- **Form-Data** - Envío de archivos a Conduit API
- **Axios** - Cliente HTTP
- **Supabase** - Base de datos PostgreSQL
- **TypeScript** - Tipado estático

## 📦 Dependencias Agregadas

```json
{
  "dependencies": {
    "multer": "^1.4.5-lts.1",
    "form-data": "^4.0.0"
  },
  "devDependencies": {
    "@types/multer": "^1.4.11"
  }
}
```

## 🔐 Seguridad

### Row Level Security (RLS)

- ✅ RLS habilitado en tabla `conduit_documents`
- ✅ Políticas para usuarios autenticados
- ✅ Políticas para service role
- ✅ Permisos granulares (SELECT, INSERT)

### Validaciones

- ✅ Validación de tipo de archivo
- ✅ Límite de tamaño (10MB)
- ✅ Validación de campos requeridos
- ✅ Sanitización de inputs

## 📊 Flujo de Datos

```
1. Cliente envía archivo + metadata
   ↓
2. Multer procesa el upload (memoria)
   ↓
3. Validaciones de campos y archivo
   ↓
4. Upload a Conduit API
   ↓
5. Conduit retorna document_id
   ↓
6. Guardar registro en Supabase
   ↓
7. Retornar respuesta al cliente
```

## 🎨 Casos de Uso

### 1. Subir factura para transacción

```bash
curl -X POST /api/business/documents/upload \
  -F "file=@invoice.pdf" \
  -F "conduit_id=user_123" \
  -F "scope=transaction" \
  -F "type=invoice" \
  -F "purpose=transaction_justification"
```

### 2. Subir contrato para counterparty

```bash
curl -X POST /api/business/documents/upload \
  -F "file=@contract.pdf" \
  -F "conduit_id=user_456" \
  -F "scope=counterparty" \
  -F "type=contract"
```

### 3. Subir documento para customer

```bash
curl -X POST /api/business/documents/upload \
  -F "file=@document.pdf" \
  -F "conduit_id=user_789" \
  -F "scope=customer" \
  -F "type=invoice"
```

## 📈 Consultas Útiles

### Ver documentos de un usuario

```sql
SELECT * FROM conduit_documents 
WHERE conduit_id = 'user_123' 
ORDER BY uploaded_at DESC;
```

### Estadísticas por usuario

```sql
SELECT * FROM documents_stats 
WHERE conduit_id = 'user_123';
```

### Documentos recientes

```sql
SELECT 
  document_id,
  conduit_id,
  file_name,
  scope,
  type,
  uploaded_at
FROM conduit_documents 
ORDER BY uploaded_at DESC 
LIMIT 10;
```

## 🧪 Testing

### Test Manual con cURL

```bash
# 1. Preparar un archivo de prueba
echo "Test document" > test.pdf

# 2. Subir el documento
curl -X POST http://localhost:3000/api/business/documents/upload \
  -F "file=@test.pdf" \
  -F "conduit_id=test_user" \
  -F "scope=transaction" \
  -F "type=invoice" \
  -F "purpose=transaction_justification" \
  -v

# 3. Verificar en Supabase
# Ejecutar en SQL Editor:
# SELECT * FROM conduit_documents WHERE conduit_id = 'test_user';
```

### Test con Postman

1. Crear nueva request POST
2. URL: `http://localhost:3000/api/business/documents/upload`
3. Body → form-data
4. Agregar campos según documentación
5. Send

## 🎯 Próximas Mejoras Sugeridas

### Funcionalidades Adicionales

- [ ] **GET** `/api/business/documents` - Listar documentos
- [ ] **GET** `/api/business/documents/:id` - Obtener documento por ID
- [ ] **DELETE** `/api/business/documents/:id` - Eliminar documento
- [ ] **GET** `/api/business/documents/download/:id` - Descargar documento

### Mejoras de Seguridad

- [ ] Middleware de autenticación JWT
- [ ] Validación de permisos por usuario
- [ ] Rate limiting
- [ ] Escaneo de virus en archivos

### Optimizaciones

- [ ] Compresión de archivos antes de subir
- [ ] Cache de metadatos
- [ ] Paginación en listados
- [ ] Búsqueda y filtros avanzados

## 📚 Referencias

- [Conduit API - Upload Document](https://docs.conduit.financial/api-reference/documents/upload-document)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Supabase Documentation](https://supabase.com/docs)

## 🆘 Soporte

Para problemas o preguntas:

1. Revisa `DOCUMENTS_API_SETUP.md` para documentación detallada
2. Consulta `QUICK_START_DOCUMENTS.md` para guía rápida
3. Verifica `INSTALL_DOCUMENTS_API.md` para instalación

## ✅ Checklist de Implementación

- [x] Crear schema de base de datos
- [x] Implementar método en servicio Conduit
- [x] Crear controlador de upload
- [x] Configurar multer para manejo de archivos
- [x] Crear router con validaciones
- [x] Integrar en API principal
- [x] Agregar dependencias al package.json
- [x] Documentación completa
- [x] Guía de instalación
- [x] Quick start guide

---

**Implementado por:** Cascade AI  
**Fecha:** Enero 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Completo y listo para usar
