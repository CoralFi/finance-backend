# 🔧 Solución: Error de Row Level Security (RLS)

## ❌ Error que estabas viendo:

```
Error logging webhook event: {
  code: '42501',
  message: 'new row violates row-level security policy for table "webhook_logs"'
}
```

## 🎯 Causa del Problema

El backend estaba usando la clave **anon** (pública) de Supabase, que está sujeta a las políticas de Row Level Security (RLS). Las políticas RLS bloquean las inserciones desde el cliente público por seguridad.

Para operaciones de backend (como guardar logs de webhooks), necesitas usar la clave **service_role** que bypasea RLS.

## ✅ Solución Implementada

He actualizado el código para usar `SUPABASE_SERVICE_ROLE_KEY` cuando esté disponible.

## 📝 Lo que TÚ necesitas hacer AHORA:

### 1. Obtener la Service Role Key de Supabase

1. Ve a tu proyecto en https://supabase.com/dashboard
2. Click en **Settings** (⚙️) en el menú lateral
3. Click en **API**
4. En la sección **Project API keys**, encontrarás:
   - `anon` `public` - Esta es la que probablemente ya tienes como `SUPABASE_KEY`
   - `service_role` `secret` - **Esta es la que necesitas copiar**

⚠️ **IMPORTANTE**: La clave `service_role` es **SECRETA** y tiene acceso completo a tu base de datos. **NUNCA** la expongas en el frontend o la compartas públicamente.

### 2. Agregar a tu archivo `.env`

Abre tu archivo `.env` y agrega:

```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_anon_key_existente
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # ← PEGA AQUÍ la service_role key
```

### 3. Reiniciar el Servidor

```bash
# Detén el servidor (Ctrl+C)
# Inicia de nuevo
npm run dev
```

## 🧪 Verificar que Funciona

Después de reiniciar, cuando recibas un webhook deberías ver:

```bash
✅ Webhook signature verified
📨 Received Conduit webhook: { event: 'transaction.completed', ... }
📝 Updating transaction trxn_xxx to status: COMPLETED
✅ Transaction trxn_xxx updated successfully
# ✅ YA NO VERÁS el error de RLS
```

## 🔍 Verificar en Supabase

```sql
-- Ahora deberías ver los logs guardados
SELECT * FROM webhook_logs 
ORDER BY processed_at DESC 
LIMIT 10;
```

## 🔐 Seguridad

### ✅ Buenas Prácticas:

1. **NUNCA** expongas `SUPABASE_SERVICE_ROLE_KEY` en el frontend
2. **NUNCA** la subas a Git (ya está en `.gitignore`)
3. Úsala **SOLO** en el backend/servidor
4. En producción, agrégala como variable de entorno en Vercel/tu hosting

### Variables de Entorno en Producción (Vercel):

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega:
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: tu_service_role_key
   - Environments: Production, Preview, Development
4. Redeploy

## 📊 Diferencias entre las Keys

| Key | Uso | Acceso | RLS |
|-----|-----|--------|-----|
| `anon` (public) | Frontend/Cliente | Limitado | ✅ Sujeto a RLS |
| `service_role` (secret) | Backend/Servidor | Completo | ❌ Bypasea RLS |

## 🎉 Resultado

Después de agregar `SUPABASE_SERVICE_ROLE_KEY`:

- ✅ Los webhooks se guardarán correctamente en `webhook_logs`
- ✅ Las transacciones se actualizarán sin problemas
- ✅ Tendrás logs completos para auditoría
- ✅ El sistema funcionará como se diseñó

## ⚠️ Si aún ves errores

1. Verifica que copiaste la clave correcta (debe empezar con `eyJ...`)
2. Verifica que no haya espacios extra al pegar
3. Reinicia el servidor completamente
4. Verifica que la variable se cargó: `console.log(process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20))`

---

**Nota**: Este cambio es necesario porque el backend necesita permisos completos para guardar logs de webhooks, mientras que el frontend solo necesita acceso limitado por seguridad.
