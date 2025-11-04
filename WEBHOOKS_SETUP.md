# Configuración de Webhooks de Conduit

Esta guía explica cómo configurar los webhooks de Conduit para recibir actualizaciones en tiempo real sobre el estado de las transacciones.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Configuración del Webhook Secret](#configuración-del-webhook-secret)
- [Registro del Webhook en Conduit](#registro-del-webhook-en-conduit)
- [Eventos Soportados](#eventos-soportados)
- [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
- [Pruebas](#pruebas)
- [Troubleshooting](#troubleshooting)

## 🔧 Requisitos Previos

1. Cuenta activa en Conduit
2. API Key y API Secret de Conduit
3. URL pública accesible para recibir webhooks (en producción)
4. Base de datos Supabase configurada

## 🔐 Configuración del Webhook Secret

### 1. Agregar el Webhook Secret al archivo `.env`

Agrega la siguiente variable de entorno a tu archivo `.env`:

```env
CONDUIT_WEBHOOK_SECRET=your_webhook_secret_here
```

### 2. Obtener el Webhook Secret

El webhook secret se obtiene después de registrar el webhook en Conduit:

1. Inicia sesión en tu [Conduit Dashboard](https://dashboard.conduit.financial)
2. Navega a la pestaña **Webhooks**
3. Crea o selecciona tu webhook
4. Copia el **Key Secret** - este es tu `CONDUIT_WEBHOOK_SECRET`

## 📡 Registro del Webhook en Conduit

### Opción 1: Usando la API de Conduit

```bash
curl -X POST https://api.conduit.financial/webhooks \
  -H "X-API-Key: your_api_key" \
  -H "X-API-Secret: your_api_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/webhooks/conduit",
    "status": "enabled",
    "events": [
      "transaction.created",
      "transaction.completed",
      "transaction.compliance_approved",
      "transaction.compliance_rejected",
      "transaction.awaiting_funds",
      "transaction.funds_received",
      "transaction.cancelled",
      "transaction.in_compliance_review",
      "transaction.awaiting_compliance_review",
      "transaction.processing_withdrawal",
      "transaction.withdrawal_processed",
      "transaction.processing_settlement",
      "transaction.settlement_processed",
      "transaction.processing_payment",
      "transaction.payment_processed"
    ],
    "organizationId": "your_client_id"
  }'
```

### Opción 2: Usando el Dashboard de Conduit

1. Ve a [Conduit Dashboard](https://dashboard.conduit.financial)
2. Navega a **Webhooks** → **Create Webhook**
3. Configura:
   - **URL**: `https://your-domain.com/api/webhooks/conduit`
   - **Status**: Enabled
   - **Events**: Selecciona todos los eventos de transacciones que necesites
4. Guarda y copia el **Webhook Secret**

## 📊 Eventos Soportados

### Eventos de Transacciones

| Evento | Descripción |
|--------|-------------|
| `transaction.created` | Transacción creada |
| `transaction.completed` | Transacción completada exitosamente |
| `transaction.compliance_approved` | Aprobada por compliance |
| `transaction.compliance_rejected` | Rechazada por compliance |
| `transaction.awaiting_funds` | Esperando fondos |
| `transaction.funds_received` | Fondos recibidos |
| `transaction.cancelled` | Transacción cancelada |
| `transaction.in_compliance_review` | En revisión de compliance |
| `transaction.awaiting_compliance_review` | Esperando revisión de compliance |
| `transaction.processing_withdrawal` | Procesando retiro |
| `transaction.withdrawal_processed` | Retiro procesado |
| `transaction.processing_settlement` | Procesando liquidación |
| `transaction.settlement_processed` | Liquidación procesada |
| `transaction.processing_payment` | Procesando pago |
| `transaction.payment_processed` | Pago procesado |

### Eventos de Counterparties

| Evento | Descripción |
|--------|-------------|
| `counterparty.active` | Counterparty activo |
| `counterparty.compliance_rejected` | Rechazado por compliance |
| `counterparty.deleted` | Counterparty eliminado |
| `counterparty.in_compliance_review` | En revisión de compliance |

### Eventos de Customers

| Evento | Descripción |
|--------|-------------|
| `customer.created` | Cliente creado |
| `customer.active` | Cliente activo |
| `customer.in_compliance_review` | En revisión de compliance |
| `customer.compliance_rejected` | Rechazado por compliance |
| `customer.kyb_in_progress` | KYB en progreso |
| `customer.kyb_expired` | KYB expirado |
| `customer.kyb_missing_information` | Falta información en KYB |
| `customer.account_onboarding_pending` | Onboarding pendiente |

## 🗄️ Estructura de la Base de Datos

### Tabla: `webhook_logs`

Crea esta tabla en Supabase para registrar todos los eventos de webhook:

```sql
CREATE TABLE webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  transaction_id TEXT,
  payload JSONB NOT NULL,
  idempotency_key TEXT UNIQUE,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_webhook_logs_transaction_id ON webhook_logs(transaction_id);
CREATE INDEX idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_processed_at ON webhook_logs(processed_at);
CREATE INDEX idx_webhook_logs_idempotency_key ON webhook_logs(idempotency_key);
```

### Actualización de la tabla: `conduit_transactions`

Asegúrate de que la tabla `conduit_transactions` tenga las columnas necesarias:

```sql
-- Agregar columna completed_at si no existe
ALTER TABLE conduit_transactions 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Agregar índice para mejorar búsquedas por transaction_id
CREATE INDEX IF NOT EXISTS idx_conduit_transactions_transaction_id 
ON conduit_transactions(transaction_id);
```

## 🧪 Pruebas

### 1. Verificar el Health Check

```bash
curl https://your-domain.com/api/webhooks/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "service": "webhooks",
  "timestamp": "2025-11-04T15:41:00.000Z"
}
```

### 2. Probar con ngrok (Desarrollo Local)

Para probar webhooks en desarrollo local:

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer tu servidor local
ngrok http 3000

# Usar la URL de ngrok en Conduit
# Ejemplo: https://abc123.ngrok.io/api/webhooks/conduit
```

### 3. Simular un Webhook

Puedes simular un webhook manualmente:

```bash
curl -X POST http://localhost:3000/api/webhooks/conduit \
  -H "Content-Type: application/json" \
  -H "conduit-signature: test_signature" \
  -H "conduit-signature-timestamp: $(date +%s)" \
  -d '{
    "event": "transaction.completed",
    "version": "1.0",
    "data": {
      "transaction": {
        "id": "trxn_test123",
        "type": "deposit",
        "status": "COMPLETED",
        "source": {
          "address": "0x123...",
          "amount": {
            "assetType": "USDC",
            "decimals": 6,
            "standardDecimals": 6,
            "amount": "1000000"
          }
        },
        "destination": {
          "id": "acct_123",
          "amount": {
            "assetType": "USDC",
            "decimals": 6,
            "standardDecimals": 6,
            "amount": "1000000"
          }
        },
        "createdAt": "2025-11-04T15:00:00.000Z",
        "completedAt": "2025-11-04T15:05:00.000Z",
        "clientId": "client_123"
      }
    }
  }'
```

**Nota**: Este ejemplo fallará la validación de firma. Para pruebas reales, usa el Dashboard de Conduit o crea transacciones reales.

## 🔍 Troubleshooting

### Error: "Missing signature headers"

**Causa**: El webhook no incluye los headers de firma requeridos.

**Solución**: Verifica que Conduit esté enviando los headers `conduit-signature` y `conduit-signature-timestamp`.

### Error: "Invalid signature"

**Causa**: El webhook secret configurado no coincide con el de Conduit.

**Solución**: 
1. Verifica que `CONDUIT_WEBHOOK_SECRET` en `.env` sea correcto
2. Obtén el secret correcto del Dashboard de Conduit
3. Reinicia el servidor después de actualizar el `.env`

### Error: "Invalid timestamp"

**Causa**: El timestamp del webhook es muy antiguo (>5 minutos).

**Solución**: Esto puede indicar problemas de red o retrasos. Conduit reintentará automáticamente.

### Webhook no se recibe

**Posibles causas y soluciones**:

1. **URL incorrecta**: Verifica que la URL en Conduit sea correcta
2. **Firewall**: Asegúrate de que tu servidor permita conexiones desde Conduit
3. **SSL**: En producción, usa HTTPS
4. **Webhook deshabilitado**: Verifica el estado en el Dashboard de Conduit

### Ver logs de webhooks

```bash
# En desarrollo
npm run dev

# Los logs mostrarán:
# ✅ Webhook signature verified
# 📨 Received Conduit webhook: { event: 'transaction.completed', ... }
# 📝 Updating transaction trxn_123 to status: COMPLETED
# ✅ Transaction trxn_123 updated successfully
```

## 📝 Notas Importantes

1. **Idempotencia**: El sistema maneja automáticamente webhooks duplicados usando `conduit-webhook-idempotency-key`
2. **Seguridad**: Todos los webhooks son validados con HMAC SHA256
3. **Timeout**: El webhook debe responder en <5 segundos para evitar reintentos
4. **Reintentos**: Conduit reintenta automáticamente si el webhook falla
5. **Orden**: Los webhooks pueden llegar fuera de orden - usa timestamps para ordenar

## 🚀 Deployment

### Variables de Entorno Requeridas

```env
# Conduit
CONDUIT_WEBHOOK_SECRET=your_webhook_secret

# Supabase (ya configuradas)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Node
NODE_ENV=production
```

### Vercel Deployment

Si usas Vercel, agrega las variables de entorno en:
1. Dashboard de Vercel → Tu proyecto → Settings → Environment Variables
2. Agrega `CONDUIT_WEBHOOK_SECRET`
3. Redeploy

### URL del Webhook en Producción

Tu URL de webhook será:
```
https://your-domain.com/api/webhooks/conduit
```

Actualiza esta URL en el Dashboard de Conduit.

## 📚 Referencias

- [Conduit Webhooks Documentation](https://docs.conduit.financial/guides/webhooks/first-webhook)
- [Conduit API Reference](https://docs.conduit.financial/developer-sections/webhooks)
- [Supabase Documentation](https://supabase.com/docs)

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica los logs en el Dashboard de Conduit
3. Consulta la tabla `webhook_logs` en Supabase
4. Contacta al soporte de Conduit
