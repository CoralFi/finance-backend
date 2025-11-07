# 🚀 Quick Start - Documents API

Guía rápida para poner en marcha la API de documentos en 5 minutos.

## 1️⃣ Instalar Dependencias

```bash
npm install multer form-data
npm install --save-dev @types/multer
```

## 2️⃣ Configurar Base de Datos

Ejecuta el siguiente SQL en Supabase SQL Editor:

```bash
# Abre el archivo y copia el contenido
database/documents_schema.sql
```

O ejecuta directamente desde la terminal si tienes Supabase CLI:

```bash
supabase db push
```

## 3️⃣ Verificar Variables de Entorno

Asegúrate de tener estas variables en tu `.env`:

```env
CONDUIT_API_BASE_URL=https://api.conduit.financial
CONDUIT_PUBLIC_KEY=tu_public_key
CONDUIT_PRIVATE_KEY=tu_private_key
```

## 4️⃣ Iniciar el Servidor

```bash
npm run dev
```

## 5️⃣ Probar el Endpoint

### Con cURL:

```bash
curl -X POST http://localhost:3000/api/business/documents/upload \
  -F "file=@/path/to/invoice.pdf" \
  -F "conduit_id=user_123" \
  -F "scope=transaction" \
  -F "type=invoice" \
  -F "purpose=transaction_justification"
```

### Con Postman:

1. Método: **POST**
2. URL: `http://localhost:3000/api/business/documents/upload`
3. Body: **form-data**
4. Campos:
   - `file`: [Seleccionar archivo]
   - `conduit_id`: `user_123`
   - `scope`: `transaction`
   - `type`: `invoice`
   - `purpose`: `transaction_justification`

## ✅ Respuesta Esperada

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

## 🔍 Verificar en Supabase

```sql
SELECT * FROM conduit_documents ORDER BY uploaded_at DESC LIMIT 5;
```

## 📚 Documentación Completa

Para más detalles, consulta: `DOCUMENTS_API_SETUP.md`

## ⚠️ Troubleshooting

### Error: "Cannot find module 'multer'"
```bash
npm install multer @types/multer
```

### Error: "Table conduit_documents does not exist"
```bash
# Ejecuta el schema SQL en Supabase
database/documents_schema.sql
```

### Error: "CONDUIT_PRIVATE_KEY is not defined"
```bash
# Verifica tu archivo .env
cat .env | grep CONDUIT
```

## 🎯 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/business/documents/upload` | Subir documento |

## 📝 Campos Requeridos

- ✅ `file` - Archivo a subir
- ✅ `conduit_id` - ID del usuario
- ✅ `scope` - transaction/counterparty/customer
- ✅ `type` - invoice/contract
- ⚠️ `purpose` - Requerido si scope=transaction

## 🎨 Tipos de Archivo Soportados

- PDF (`.pdf`)
- Imágenes (`.jpg`, `.jpeg`, `.png`)
- Word (`.doc`, `.docx`)
- Excel (`.xls`, `.xlsx`)

**Tamaño máximo:** 10 MB

---

¿Listo? ¡Empieza a subir documentos! 🚀
