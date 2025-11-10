# 🚀 Quick Start - Webhooks de Conduit

Guía rápida para poner en marcha los webhooks de Conduit en 5 minutos.

## ✅ Checklist de Configuración

### 1. Configurar Variables de Entorno (2 min)

Agrega a tu archivo `.env`:

```env
# Conduit Webhook Secret (lo obtienes después de crear el webhook)
CONDUIT_WEBHOOK_SECRET=tu_webhook_secret_aqui

# Supabase Service Role Key (IMPORTANTE para evitar errores de RLS)
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

**Cómo obtener la Service Role Key:**
1. Ve a https://supabase.com/dashboard
2. Tu proyecto → Settings → API
3. Copia la clave `service_role` (NO la `anon`)
4. Pégala en `.env` como `SUPABASE_SERVICE_ROLE_KEY`

### 2. Crear Tablas en Supabase (1 min)

1. Abre Supabase SQL Editor
2. Copia y ejecuta el contenido de `database/webhooks_schema.sql`
3. Verifica que se creó la tabla `webhook_logs`

### 3. Registrar Webhook en Conduit (2 min)

**Opción A - Dashboard de Conduit:**
1. Ve a https://dashboard.conduit.financial
2. Webhooks → Create Webhook
3. URL: `https://tu-dominio.com/api/webhooks/conduit`
4. Eventos: Selecciona todos los de `transaction.*`
5. Copia el **Webhook Secret** y agrégalo a `.env`

**Opción B - API de Conduit:**
```bash
curl -X POST https://api.conduit.financial/webhooks \
  -H "X-API-Key: TU_API_KEY" \
  -H "X-API-Secret: TU_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://tu-dominio.com/api/webhooks/conduit",
    "status": "enabled",
    "events": ["transaction.created", "transaction.completed", "transaction.cancelled"],
    "organizationId": "TU_CLIENT_ID"
  }'
```

## 🧪 Probar en Desarrollo Local

### Con ngrok:

```bash
# Terminal 1 - Iniciar servidor
npm run dev

# Terminal 2 - Exponer con ngrok
ngrok http 3000

# Usar la URL de ngrok en Conduit:
# https://abc123.ngrok.io/api/webhooks/conduit
```

### Verificar que funciona:

```bash
# Health check
curl http://localhost:3000/api/webhooks/health

# Debería retornar:
# {"status":"ok","service":"webhooks","timestamp":"..."}
```

## 📊 Verificar que los Webhooks Funcionan

### 1. Crear una transacción de prueba en Conduit

### 2. Ver los logs en tu servidor:
```
✅ Webhook signature verified
📨 Received Conduit webhook: { event: 'transaction.created', ... }
📝 Updating transaction trxn_xxx to status: CREATED
✅ Transaction trxn_xxx updated successfully
```

### 3. Verificar en Supabase:

```sql
-- Ver últimos webhooks recibidos
SELECT * FROM webhook_logs 
ORDER BY processed_at DESC 
LIMIT 10;

-- Ver transacciones actualizadas
SELECT transaction_id, status, updated_at 
FROM conduit_transactions 
ORDER BY updated_at DESC 
LIMIT 10;
```

## 🎯 Eventos Principales

| Evento | Cuándo se dispara |
|--------|-------------------|
| `transaction.created` | Transacción creada |
| `transaction.awaiting_funds` | Esperando fondos del usuario |
| `transaction.funds_received` | Fondos recibidos |
| `transaction.in_compliance_review` | En revisión de compliance |
| `transaction.completed` | ✅ Transacción completada |
| `transaction.cancelled` | ❌ Transacción cancelada |
| `transaction.compliance_rejected` | ❌ Rechazada por compliance |

## 🔍 Debugging

### Ver logs de webhooks:
```sql
SELECT 
  event_type,
  transaction_id,
  processed_at,
  payload
FROM webhook_logs
WHERE transaction_id = 'trxn_xxx'
ORDER BY processed_at DESC;
```

### Ver historial de una transacción:
```sql
SELECT * FROM transaction_history
WHERE transaction_id = 'trxn_xxx';
```

## ⚠️ Problemas Comunes

### "Invalid signature"
- ✅ Verifica que `CONDUIT_WEBHOOK_SECRET` sea correcto
- ✅ Reinicia el servidor después de cambiar `.env`

### "Transaction not found"
- ✅ El webhook puede llegar antes que la transacción se guarde
- ✅ El sistema la creará automáticamente

### Webhook no llega
- ✅ Verifica la URL en Conduit Dashboard
- ✅ Asegúrate de que el webhook esté "enabled"
- ✅ Revisa los logs en Conduit Dashboard

## 📚 Más Información

- Documentación completa: [WEBHOOKS_SETUP.md](./WEBHOOKS_SETUP.md)
- Documentación de Conduit: https://docs.conduit.financial/guides/webhooks/first-webhook

## 🎉 ¡Listo!

Ahora tu backend recibirá actualizaciones en tiempo real de todas las transacciones de Conduit y las guardará automáticamente en Supabase.
