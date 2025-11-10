# 📄 Conduit Documents API - Documentación Completa

## 🎯 Resumen

Implementación completa de la integración con la API de documentos de Conduit Financial, permitiendo subir documentos y registrar automáticamente la información en Supabase.

## 📋 Tabla de Contenidos

- [Características Implementadas](#-características-implementadas)
- [Instalación](#-instalación)
- [Configuración de Base de Datos](#️-configuración-de-base-de-datos)
- [Quick Start](#-quick-start)
- [Uso de la API](#-uso-de-la-api)
- [Ejemplos de Código](#-ejemplos-de-código)
- [Validaciones y Restricciones](#️-validaciones-y-restricciones)
- [Estructura de Archivos](#-estructura-de-archivos)
- [Seguridad](#-seguridad)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Próximas Mejoras](#-próximas-mejoras)

---

## ✨ Características Implementadas

### 1. Upload de Documentos a Conduit
- ✅ Endpoint POST para subir archivos
- ✅ Soporte para múltiples tipos de archivo (PDF, imágenes, Word, Excel)
- ✅ Validación de tamaño (máx. 10MB)
- ✅ Validación de tipo MIME

### 2. Registro en Base de Datos
- ✅ Tabla `conduit_documents` en Supabase
- ✅ Almacenamiento de metadatos del documento
- ✅ Registro de quién subió el documento (`conduit_id`)
- ✅ Timestamp de subida
- ✅ Row Level Security (RLS) habilitado

### 3. Validaciones Completas
- ✅ Validación de campos requeridos
- ✅ Validación de valores permitidos (scope, type, purpose)
- ✅ Validación condicional (purpose requerido para transactions)
- ✅ Manejo de errores detallado

---

## 📦 Instalación

### Paso 1: Instalar Dependencias NPM

Ejecuta el siguiente comando en la raíz del proyecto:

```bash
npm install multer form-data
npm install --save-dev @types/multer
```

Esto instalará las siguientes dependencias:
- `multer@^1.4.5-lts.1` - Para manejar uploads de archivos
- `form-data@^4.0.0` - Para enviar archivos a Conduit API
- `@types/multer@^1.4.11` - Tipos TypeScript para multer

### Paso 2: Verificar Instalación

```bash
npm list multer form-data
```

Deberías ver algo como:
```
finance-backend@1.0.0
├── form-data@4.0.0
└── multer@1.4.5-lts.1
```

Asegúrate de que las siguientes dependencias estén en tu `package.json`:

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

---

## 🗄️ Configuración de Base de Datos

### Opción A: Usando Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Abre el archivo `database/documents_schema.sql`
4. Copia todo el contenido
5. Pégalo en el SQL Editor
6. Haz clic en **Run**

### Opción B: Usando Supabase CLI

```bash
# Asegúrate de estar en la raíz del proyecto
supabase db push
```

### Verificar Tabla Creada

Ejecuta en SQL Editor:

```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'conduit_documents'
ORDER BY ordinal_position;
```

Deberías ver 12 columnas.

### Estructura de la Tabla `conduit_documents`

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

---

## 🚀 Quick Start

### 1. Configurar Variables de Entorno

Asegúrate de tener estas variables en tu `.env`:

```env
CONDUIT_API_BASE_URL=https://api.conduit.financial
CONDUIT_PUBLIC_KEY=tu_public_key
CONDUIT_PRIVATE_KEY=tu_private_key
```

### 2. Iniciar el Servidor

```bash
npm run dev
```

Deberías ver en la consola:
```
Server running on port 3000
```

### 3. Probar el Endpoint

#### Con cURL:

```bash
curl -X POST http://localhost:3000/api/business/documents/upload \
  -F "file=@/path/to/invoice.pdf" \
  -F "conduit_id=user_123" \
  -F "scope=transaction" \
  -F "type=invoice" \
  -F "purpose=transaction_justification"
```

#### Con Postman:

1. Método: **POST**
2. URL: `http://localhost:3000/api/business/documents/upload`
3. Body: **form-data**
4. Campos:
   - `file`: [Seleccionar archivo]
   - `conduit_id`: `user_123`
   - `scope`: `transaction`
   - `type`: `invoice`
   - `purpose`: `transaction_justification`

### 4. Respuesta Esperada

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

### 5. Verificar en Supabase

```sql
SELECT * FROM conduit_documents ORDER BY uploaded_at DESC LIMIT 5;
```

---

## 🚀 Uso de la API

### Endpoint

```
POST /api/business/documents/upload
```

### Headers

```
Content-Type: multipart/form-data
Authorization: Bearer YOUR_TOKEN (si aplica)
```

### Parámetros (Form Data)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `file` | File | ✅ Sí | El archivo a subir (PDF, imágenes, Word, Excel) |
| `conduit_id` | String | ✅ Sí | ID del usuario que sube el documento |
| `scope` | String | ✅ Sí | Alcance: `transaction`, `counterparty`, `customer` |
| `type` | String | ✅ Sí | Tipo: `invoice`, `contract` |
| `purpose` | String | ⚠️ Condicional | Requerido si scope es `transaction`. Valor: `transaction_justification` |

### Respuesta Exitosa (201)

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

### Respuesta de Error (400/500)

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

---

## 💻 Ejemplos de Código

### Ejemplo con cURL

```bash
curl -X POST http://localhost:3000/api/business/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/invoice.pdf" \
  -F "conduit_id=user_123" \
  -F "scope=transaction" \
  -F "type=invoice" \
  -F "purpose=transaction_justification"
```

### Ejemplo con JavaScript (Fetch)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('conduit_id', 'user_123');
formData.append('scope', 'transaction');
formData.append('type', 'invoice');
formData.append('purpose', 'transaction_justification');

const response = await fetch('http://localhost:3000/api/business/documents/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

### Ejemplo con Axios

```javascript
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const formData = new FormData();
formData.append('file', fs.createReadStream('/path/to/invoice.pdf'));
formData.append('conduit_id', 'user_123');
formData.append('scope', 'transaction');
formData.append('type', 'invoice');
formData.append('purpose', 'transaction_justification');

try {
  const response = await axios.post(
    'http://localhost:3000/api/business/documents/upload',
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer YOUR_TOKEN'
      }
    }
  );
  console.log(response.data);
} catch (error) {
  console.error(error.response.data);
}
```

### Ejemplo con React + TypeScript

```typescript
import React, { useState } from 'react';

interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    document_id: string;
    conduit_id: string;
    file_name: string;
    file_size: number;
    scope: string;
    type: string;
    uploaded_at: string;
  };
  error?: string;
}

const DocumentUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('conduit_id', 'user_123');
    formData.append('scope', 'transaction');
    formData.append('type', 'invoice');
    formData.append('purpose', 'transaction_justification');

    setUploading(true);

    try {
      const response = await fetch('/api/business/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result: UploadResponse = await response.json();
      
      if (result.success) {
        console.log('Document uploaded:', result.data);
        alert('Documento subido exitosamente!');
      } else {
        console.error('Upload failed:', result.error);
        alert('Error al subir documento');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error de conexión');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
      />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Subiendo...' : 'Subir Documento'}
      </button>
    </div>
  );
};

export default DocumentUpload;
```

---

## ⚠️ Validaciones y Restricciones

### Tipos de Archivo Permitidos

- **PDF**: `application/pdf`
- **Imágenes**: `image/jpeg`, `image/jpg`, `image/png`
- **Word**: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Excel**: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

### Tamaño Máximo

- **10 MB** por archivo

### Validaciones de Campos

1. **scope**: Debe ser uno de: `transaction`, `counterparty`, `customer`
2. **type**: Debe ser uno de: `invoice`, `contract`
3. **purpose**: 
   - Requerido cuando `scope = 'transaction'`
   - Valor permitido: `transaction_justification`

### Códigos de Error Comunes

| Código | Mensaje | Solución |
|--------|---------|----------|
| 400 | No file uploaded | Asegúrate de incluir un archivo en el campo `file` |
| 400 | Field 'conduit_id' is required | Incluye el `conduit_id` en el form data |
| 400 | Invalid scope | Usa uno de los valores permitidos para `scope` |
| 400 | Invalid type | Usa uno de los valores permitidos para `type` |
| 400 | Field 'purpose' is required when scope is 'transaction' | Incluye `purpose` cuando uses scope `transaction` |
| 413 | File too large | El archivo excede los 10 MB |
| 415 | Invalid file type | El tipo de archivo no está permitido |
| 500 | Failed to upload document to Conduit | Error en la API de Conduit |
| 500 | Failed to save record in database | Error al guardar en Supabase |

---

## 📁 Estructura de Archivos

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

---

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

---

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

---

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

---

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

---

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

---

## 🔍 Troubleshooting

### Error: "Cannot find module 'multer'"

```bash
# Elimina node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
```

### Error: "relation 'conduit_documents' does not exist"

```bash
# Verifica que el schema se haya aplicado correctamente
# Ejecuta en Supabase SQL Editor:
SELECT * FROM conduit_documents LIMIT 1;
```

Si da error, vuelve a ejecutar `database/documents_schema.sql`

### Error: "CONDUIT_PRIVATE_KEY is not defined"

```bash
# Verifica tu archivo .env
cat .env | grep CONDUIT

# Debe contener:
# CONDUIT_API_BASE_URL=https://api.conduit.financial
# CONDUIT_PUBLIC_KEY=tu_key
# CONDUIT_PRIVATE_KEY=tu_secret
```

### Modo Development

En modo desarrollo (`NODE_ENV=development`), la API imprime logs detallados:

```javascript
// Logs que verás en la consola
console.log('Uploading document to Conduit:', { ... });
console.log('Document uploaded to Conduit:', { ... });
console.log('Document record saved in DB:', { ... });
```

---

## 🎯 Próximas Mejoras

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

---

## 🔧 Tecnologías Utilizadas

- **Express.js** - Framework web
- **Multer** - Manejo de uploads multipart/form-data
- **Form-Data** - Envío de archivos a Conduit API
- **Axios** - Cliente HTTP
- **Supabase** - Base de datos PostgreSQL
- **TypeScript** - Tipado estático

---

## 📚 Referencias

- [Conduit API - Upload Document](https://docs.conduit.financial/api-reference/documents/upload-document)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Supabase Documentation](https://supabase.com/docs)

---

## 📝 Notas Importantes

- El `document_id` retornado por Conduit debe usarse en las transacciones
- Los documentos se almacenan en Conduit, no en Supabase (solo guardamos metadatos)
- Asegúrate de tener configuradas las variables de entorno `CONDUIT_PUBLIC_KEY` y `CONDUIT_PRIVATE_KEY`
- La tabla tiene RLS (Row Level Security) habilitado para mayor seguridad

---

## ✅ Checklist de Instalación

- [ ] Dependencias NPM instaladas (`npm install`)
- [ ] Schema de BD aplicado en Supabase
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Servidor iniciado sin errores
- [ ] Endpoint probado exitosamente

---

## 🆘 Soporte

Si encuentras problemas:

1. Verifica que estés usando Node.js v16 o superior
2. Asegúrate de tener acceso a tu proyecto de Supabase
3. Verifica que las credenciales de Conduit sean válidas
4. Revisa los logs del servidor para más detalles
5. Revisa la documentación oficial de Conduit: https://docs.conduit.financial

---

**Implementado por:** Cascade AI  
**Fecha:** Enero 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Completo y listo para usar  
**Tiempo estimado de instalación:** 5-10 minutos
