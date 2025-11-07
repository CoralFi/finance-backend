# Conduit Documents API - Guía de Configuración

Esta guía te ayudará a configurar y usar la API de subida de documentos de Conduit Financial integrada con Supabase.

## 📋 Tabla de Contenidos

- [Instalación de Dependencias](#instalación-de-dependencias)
- [Configuración de Base de Datos](#configuración-de-base-de-datos)
- [Uso de la API](#uso-de-la-api)
- [Ejemplos de Código](#ejemplos-de-código)
- [Validaciones y Restricciones](#validaciones-y-restricciones)

## 🔧 Instalación de Dependencias

### 1. Instalar paquetes necesarios

Ejecuta el siguiente comando para instalar las dependencias:

```bash
npm install multer form-data
npm install --save-dev @types/multer
```

### 2. Verificar instalación

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

## 🗄️ Configuración de Base de Datos

### 1. Ejecutar el schema en Supabase

Ejecuta el archivo SQL en tu base de datos de Supabase:

```bash
# Ubicación del archivo
database/documents_schema.sql
```

O copia y pega el contenido directamente en el SQL Editor de Supabase.

### 2. Verificar la tabla creada

La tabla `conduit_documents` debe tener las siguientes columnas:

- `id` (UUID) - Primary Key
- `document_id` (TEXT) - ID del documento en Conduit
- `conduit_id` (TEXT) - ID del usuario que subió el documento
- `scope` (TEXT) - transaction, counterparty, customer
- `type` (TEXT) - invoice, contract
- `purpose` (TEXT) - transaction_justification
- `file_name` (TEXT) - Nombre del archivo
- `file_size` (INTEGER) - Tamaño en bytes
- `mime_type` (TEXT) - Tipo MIME
- `uploaded_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

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

## 📊 Consultar Documentos Subidos

### Query SQL para ver documentos de un usuario

```sql
SELECT 
  document_id,
  conduit_id,
  scope,
  type,
  file_name,
  file_size,
  uploaded_at
FROM conduit_documents
WHERE conduit_id = 'user_123'
ORDER BY uploaded_at DESC;
```

### Ver estadísticas usando la vista

```sql
SELECT * FROM documents_stats
WHERE conduit_id = 'user_123'
ORDER BY upload_date DESC;
```

## 🔍 Debugging

### Modo Development

En modo desarrollo (`NODE_ENV=development`), la API imprime logs detallados:

```javascript
// Logs que verás en la consola
console.log('Uploading document to Conduit:', { ... });
console.log('Document uploaded to Conduit:', { ... });
console.log('Document record saved in DB:', { ... });
```

### Verificar en Supabase

1. Ve al SQL Editor en Supabase
2. Ejecuta: `SELECT * FROM conduit_documents ORDER BY uploaded_at DESC LIMIT 10;`
3. Verifica que el registro se haya creado correctamente

## 🎯 Próximos Pasos

1. **Agregar autenticación**: Implementar middleware de autenticación para proteger el endpoint
2. **Listar documentos**: Crear endpoint GET para listar documentos de un usuario
3. **Eliminar documentos**: Crear endpoint DELETE para eliminar documentos
4. **Descargar documentos**: Integrar con la API de Conduit para descargar documentos
5. **Webhooks**: Configurar webhooks para recibir notificaciones de cambios en documentos

## 📝 Notas Importantes

- El `document_id` retornado por Conduit debe usarse en las transacciones
- Los documentos se almacenan en Conduit, no en Supabase (solo guardamos metadatos)
- Asegúrate de tener configuradas las variables de entorno `CONDUIT_PUBLIC_KEY` y `CONDUIT_PRIVATE_KEY`
- La tabla tiene RLS (Row Level Security) habilitado para mayor seguridad

## 🆘 Soporte

Si encuentras problemas:

1. Verifica que las dependencias estén instaladas correctamente
2. Revisa los logs en modo development
3. Verifica que el schema de la base de datos esté aplicado
4. Confirma que las credenciales de Conduit sean válidas
5. Revisa la documentación oficial de Conduit: https://docs.conduit.financial
