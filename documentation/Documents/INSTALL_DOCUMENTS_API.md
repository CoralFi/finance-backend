# 📦 Instalación - Documents API

## Paso 1: Instalar Dependencias NPM

Ejecuta el siguiente comando en la raíz del proyecto:

```bash
npm install
```

Esto instalará las nuevas dependencias agregadas al `package.json`:
- `multer@^1.4.5-lts.1` - Para manejar uploads de archivos
- `form-data@^4.0.0` - Para enviar archivos a Conduit API
- `@types/multer@^1.4.11` - Tipos TypeScript para multer

## Paso 2: Aplicar Schema de Base de Datos

### Opción A: Usando Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Abre el archivo `database/documents_schema.sql`
4. Copia todo el contenido
5. Pégalo en el SQL Editor
6. Haz clic en **Run**

### Opción B: Usando Supabase CLI (si lo tienes instalado)

```bash
# Asegúrate de estar en la raíz del proyecto
supabase db push
```

## Paso 3: Verificar Instalación

### Verificar dependencias instaladas:

```bash
npm list multer form-data
```

Deberías ver algo como:
```
finance-backend@1.0.0
├── form-data@4.0.0
└── multer@1.4.5-lts.1
```

### Verificar tabla en Supabase:

Ejecuta en SQL Editor:

```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'conduit_documents'
ORDER BY ordinal_position;
```

Deberías ver 12 columnas.

## Paso 4: Iniciar el Servidor

```bash
npm run dev
```

Deberías ver en la consola:

```
Server running on port 3000
```

## Paso 5: Probar el Endpoint

```bash
curl -X POST http://localhost:3000/api/business/documents/upload \
  -F "file=@test.pdf" \
  -F "conduit_id=test_user" \
  -F "scope=transaction" \
  -F "type=invoice" \
  -F "purpose=transaction_justification"
```

## ✅ Checklist de Instalación

- [ ] Dependencias NPM instaladas (`npm install`)
- [ ] Schema de BD aplicado en Supabase
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Servidor iniciado sin errores
- [ ] Endpoint probado exitosamente

## 🔧 Troubleshooting

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

## 📚 Siguiente Paso

Una vez instalado, consulta:
- `QUICK_START_DOCUMENTS.md` - Para empezar a usar la API
- `DOCUMENTS_API_SETUP.md` - Para documentación completa

## 🆘 ¿Necesitas Ayuda?

Si encuentras problemas durante la instalación:

1. Verifica que estés usando Node.js v16 o superior
2. Asegúrate de tener acceso a tu proyecto de Supabase
3. Verifica que las credenciales de Conduit sean válidas
4. Revisa los logs del servidor para más detalles

---

**Tiempo estimado de instalación:** 5-10 minutos
