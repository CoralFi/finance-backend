# 🔄 Diagrama de Flujo - Webhooks de Conduit

## Flujo Completo de Webhook

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CONDUIT FINANCIAL                            │
│                                                                      │
│  Usuario crea/actualiza transacción                                 │
│         ↓                                                            │
│  Estado de transacción cambia                                       │
│         ↓                                                            │
│  Conduit genera evento webhook                                      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ HTTP POST
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      TU BACKEND (Express.js)                         │
│                                                                      │
│  POST /api/webhooks/conduit                                         │
│         ↓                                                            │
│  ┌──────────────────────────────────────────────────────┐          │
│  │ MIDDLEWARE: validateConduitWebhook                    │          │
│  │                                                       │          │
│  │ 1. Extrae headers:                                   │          │
│  │    - conduit-signature                               │          │
│  │    - conduit-signature-timestamp                     │          │
│  │    - conduit-webhook-idempotency-key (opcional)      │          │
│  │                                                       │          │
│  │ 2. Valida que existan los headers requeridos         │          │
│  │    ❌ No existen → 401 "Missing signature headers"   │          │
│  │                                                       │          │
│  │ 3. Obtiene CONDUIT_WEBHOOK_SECRET del .env           │          │
│  │    ❌ No existe → 500 "Server configuration error"   │          │
│  │                                                       │          │
│  │ 4. Genera firma HMAC SHA256:                         │          │
│  │    stringToSign = timestamp + "." + JSON(body)       │          │
│  │    expectedSignature = HMAC(stringToSign, secret)    │          │
│  │                                                       │          │
│  │ 5. Compara firmas                                    │          │
│  │    ❌ No coinciden → 401 "Invalid signature"         │          │
│  │                                                       │          │
│  │ 6. Valida timestamp (< 5 minutos)                    │          │
│  │    ❌ Muy antiguo → 401 "Invalid timestamp"          │          │
│  │                                                       │          │
│  │ ✅ Todo OK → next()                                  │          │
│  └──────────────────────────────────────────────────────┘          │
│         ↓                                                            │
│  ┌──────────────────────────────────────────────────────┐          │
│  │ CONTROLLER: handleConduitWebhook                      │          │
│  │                                                       │          │
│  │ 1. Extrae payload del body                           │          │
│  │ 2. Identifica tipo de evento:                        │          │
│  │    - transaction.* → handleTransactionEvent()        │          │
│  │    - customer.* → handleCustomerEvent()              │          │
│  │    - counterparty.* → handleCounterpartyEvent()      │          │
│  │                                                       │          │
│  │ 3. Llama al handler específico                       │          │
│  └──────────────────────────────────────────────────────┘          │
│         ↓                                                            │
│  ┌──────────────────────────────────────────────────────┐          │
│  │ HANDLER: handleTransactionEvent                       │          │
│  │                                                       │          │
│  │ 1. Extrae datos de la transacción                    │          │
│  │ 2. Log del evento                                    │          │
│  └──────────────────────────────────────────────────────┘          │
│         ↓                                                            │
│  ┌──────────────────────────────────────────────────────┐          │
│  │ SERVICE: TransactionWebhookService                    │          │
│  │                                                       │          │
│  │ logWebhookEvent()                                    │          │
│  │   ↓                                                   │          │
│  │   Verifica idempotencia (si existe idempotency_key)  │          │
│  │   ↓                                                   │          │
│  │   Guarda en webhook_logs                             │          │
│  │                                                       │          │
│  │ updateTransactionStatus()                            │          │
│  │   ↓                                                   │          │
│  │   Busca transacción por transaction_id               │          │
│  │   ↓                                                   │          │
│  │   ¿Existe?                                           │          │
│  │   ├─ SÍ → Actualiza status y completed_at            │          │
│  │   └─ NO → createTransactionFromWebhook()             │          │
│  │            (crea la transacción automáticamente)     │          │
│  └──────────────────────────────────────────────────────┘          │
│         ↓                                                            │
│  Responde 200 OK a Conduit                                          │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPABASE (PostgreSQL)                        │
│                                                                      │
│  ┌──────────────────────┐    ┌──────────────────────┐             │
│  │  webhook_logs        │    │ conduit_transactions │             │
│  │                      │    │                      │             │
│  │ • event_type         │    │ • transaction_id     │             │
│  │ • transaction_id     │    │ • status ← UPDATED   │             │
│  │ • payload            │    │ • completed_at       │             │
│  │ • idempotency_key    │    │ • updated_at         │             │
│  │ • processed_at       │    │ • ...                │             │
│  └──────────────────────┘    └──────────────────────┘             │
│                                                                      │
│  ✅ Datos guardados y actualizados                                  │
└─────────────────────────────────────────────────────────────────────┘
```

## Eventos de Transacción - Flujo de Estados

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CICLO DE VIDA DE UNA TRANSACCIÓN                  │
└─────────────────────────────────────────────────────────────────────┘

    CREATED
       │
       ↓
    AWAITING_COMPLIANCE_REVIEW
       │
       ↓
    IN_COMPLIANCE_REVIEW
       │
       ├──────────────────────┐
       ↓                      ↓
    COMPLIANCE_APPROVED    COMPLIANCE_REJECTED
       │                      │
       ↓                      ↓
    AWAITING_FUNDS         CANCELLED
       │
       ↓
    FUNDS_RECEIVED
       │
       ↓
    PROCESSING_WITHDRAWAL
       │
       ↓
    WITHDRAWAL_PROCESSED
       │
       ↓
    PROCESSING_SETTLEMENT
       │
       ↓
    SETTLEMENT_PROCESSED
       │
       ↓
    PROCESSING_PAYMENT
       │
       ↓
    PAYMENT_PROCESSED
       │
       ↓
    COMPLETED ✅

Cada cambio de estado genera un webhook que actualiza tu base de datos
```

## Ejemplo de Payload de Webhook

```json
{
  "event": "transaction.completed",
  "version": "1.0",
  "data": {
    "transaction": {
      "type": "deposit",
      "id": "trxn_31C6aorcaHHEl1jLbSzXRTbj7eC",
      "status": "COMPLETED",
      "source": {
        "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        "amount": {
          "assetType": "USDC",
          "decimals": 6,
          "standardDecimals": 6,
          "amount": "10000000000"
        }
      },
      "destination": {
        "id": "acct_31C4OLZH4qdXXXizursw2FsDcmb",
        "amount": {
          "assetType": "USDC",
          "decimals": 6,
          "standardDecimals": 6,
          "amount": "10000000000"
        }
      },
      "createdAt": "2025-08-12T16:22:53.782Z",
      "completedAt": "2025-08-12T16:23:03.007Z",
      "clientId": "client_31C4ON5QZPrSnpGcUTDzQAPVXGS"
    }
  }
}
```

## Headers del Webhook

```
POST /api/webhooks/conduit HTTP/1.1
Host: tu-dominio.com
Content-Type: application/json
conduit-signature: a1b2c3d4e5f6...
conduit-signature-timestamp: 1699123456
conduit-webhook-idempotency-key: whk_evt_123abc
```

## Validación de Firma HMAC

```javascript
// 1. Construir string a firmar
const timestamp = "1699123456";
const payload = JSON.stringify(webhookBody);
const stringToSign = `${timestamp}.${payload}`;

// 2. Generar firma esperada
const secret = process.env.CONDUIT_WEBHOOK_SECRET;
const expectedSignature = crypto
  .createHmac('sha256', secret)
  .update(stringToSign)
  .digest('hex');

// 3. Comparar con la firma recibida
if (expectedSignature === receivedSignature) {
  // ✅ Webhook válido
} else {
  // ❌ Webhook inválido
}
```

## Manejo de Idempotencia

```
┌─────────────────────────────────────────────────────────────────────┐
│  Conduit envía webhook con idempotency_key = "whk_evt_123"          │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Backend verifica en webhook_logs si existe ese idempotency_key     │
│                                                                      │
│  SELECT * FROM webhook_logs                                         │
│  WHERE idempotency_key = 'whk_evt_123'                              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    │                   │
                    ↓                   ↓
            ┌───────────────┐   ┌───────────────┐
            │  YA EXISTE    │   │  NO EXISTE    │
            └───────────────┘   └───────────────┘
                    │                   │
                    ↓                   ↓
            ⚠️ Webhook ya      ✅ Procesar webhook
               procesado           y guardar log
                    │                   │
                    ↓                   ↓
            Return sin error    INSERT INTO webhook_logs
            (evita duplicados)  VALUES (...)
```

## Arquitectura de Archivos

```
src/
├── api/
│   └── webhooks/
│       ├── index.ts                    # Router principal
│       ├── conduitWebhook.ts           # Controller
│       ├── middleware/
│       │   └── validateWebhook.ts      # Validación HMAC
│       └── test/
│           └── webhookTest.ts          # Utilidades de testing
│
├── services/
│   └── webhooks/
│       └── transactionWebhookService.ts # Lógica de negocio
│
├── types/
│   └── conduit-webhooks.ts             # Tipos TypeScript
│
└── db/
    └── supabase.ts                     # Cliente de Supabase

database/
└── webhooks_schema.sql                 # Schema de BD
```

## Logs de Consola (Ejemplo)

```bash
# Webhook recibido
📨 Received Conduit webhook: {
  event: 'transaction.completed',
  version: '1.0',
  idempotencyKey: 'whk_evt_123abc'
}

# Validación exitosa
✅ Webhook signature verified

# Procesamiento
📊 Processing transaction event: transaction.completed {
  transactionId: 'trxn_31C6aorcaHHEl1jLbSzXRTbj7eC',
  status: 'COMPLETED',
  type: 'deposit'
}

# Actualización en BD
📝 Updating transaction trxn_31C6aorcaHHEl1jLbSzXRTbj7eC to status: COMPLETED
✅ Transaction trxn_31C6aorcaHHEl1jLbSzXRTbj7eC updated successfully

# Evento específico
✅ Transaction trxn_31C6aorcaHHEl1jLbSzXRTbj7eC completed
```

## Seguridad - Capas de Protección

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CAPAS DE SEGURIDAD                           │
└─────────────────────────────────────────────────────────────────────┘

1. CORS
   ↓ Permite requests sin origin (webhooks)
   
2. Validación de Headers
   ↓ Verifica conduit-signature y conduit-signature-timestamp
   
3. Validación HMAC SHA256
   ↓ Verifica que el webhook viene de Conduit
   
4. Validación de Timestamp
   ↓ Protege contra replay attacks (< 5 minutos)
   
5. Idempotencia
   ↓ Evita procesamiento duplicado
   
6. Row Level Security (RLS) en Supabase
   ↓ Protege acceso a datos

✅ Webhook procesado de forma segura
```

---

Este diagrama muestra el flujo completo desde que Conduit envía un webhook hasta que se actualiza en tu base de datos de Supabase.
