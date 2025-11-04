# 🎯 Próximos Pasos - Integración de Webhooks Conduit

## ✅ Lo que ya está hecho

He implementado completamente la integración de webhooks de Conduit. Todo el código está listo y funcionando.

## 🔧 Lo que TÚ necesitas hacer ahora

### Paso 1: Agregar Variables de Entorno (OBLIGATORIO)

1. **Obtener la Supabase Service Role Key**
   - Ve a https://supabase.com/dashboard
   - Tu proyecto → Settings → API
   - Copia la clave **`service_role`** (NO la `anon`)
   
2. **Obtener el Webhook Secret de Conduit**
   - Ve a https://dashboard.conduit.financial
   - Navega a la sección **Webhooks**
   - Si ya tienes un webhook creado, haz clic en él y copia el **Key Secret**
   - Si no tienes uno, sigue el Paso 3 primero

3. **Agregar a tu archivo `.env`**
   ```env
   # Supabase Service Role Key (IMPORTANTE)
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # Conduit Webhook Secret
   CONDUIT_WEBHOOK_SECRET=el_secret_que_copiaste
   ```

⚠️ **IMPORTANTE**: La `service_role` key es necesaria para evitar errores de RLS al guardar logs de webhooks.

### Paso 2: Ejecutar el Script SQL en Supabase (OBLIGATORIO)

1. Abre Supabase Dashboard
2. Ve a **SQL Editor**
3. Abre el archivo `database/webhooks_schema.sql`
4. Copia TODO el contenido
5. Pégalo en el SQL Editor
6. Haz clic en **RUN**
7. Verifica que se creó la tabla `webhook_logs`

### Paso 3: Registrar el Webhook en Conduit (OBLIGATORIO)

#### Opción A: Usando el Dashboard (MÁS FÁCIL)

1. Ve a https://dashboard.conduit.financial
2. Navega a **Webhooks** → **Create Webhook**
3. Configura:
   - **URL**: 
     - Desarrollo: `https://tu-ngrok-url.ngrok.io/api/webhooks/conduit`
     - Producción: `https://tu-dominio.com/api/webhooks/conduit`
   - **Status**: Enabled
   - **Events**: Selecciona TODOS los que empiecen con `transaction.`:
     - ✅ transaction.created
     - ✅ transaction.completed
     - ✅ transaction.cancelled
     - ✅ transaction.compliance_approved
     - ✅ transaction.compliance_rejected
     - ✅ transaction.awaiting_funds
     - ✅ transaction.funds_received
     - ✅ transaction.in_compliance_review
     - ✅ (y todos los demás de transacciones)
4. Guarda
5. Copia el **Webhook Secret** y agrégalo a `.env` (Paso 1)

#### Opción B: Usando la API de Conduit

```bash
curl -X POST https://api.conduit.financial/webhooks \
  -H "X-API-Key: TU_CONDUIT_API_KEY" \
  -H "X-API-Secret: TU_CONDUIT_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://tu-dominio.com/api/webhooks/conduit",
    "status": "enabled",
    "events": [
      "transaction.created",
      "transaction.completed",
      "transaction.cancelled",
      "transaction.compliance_approved",
      "transaction.compliance_rejected",
      "transaction.awaiting_funds",
      "transaction.funds_received",
      "transaction.in_compliance_review",
      "transaction.awaiting_compliance_review",
      "transaction.processing_withdrawal",
      "transaction.withdrawal_processed",
      "transaction.processing_settlement",
      "transaction.settlement_processed",
      "transaction.processing_payment",
      "transaction.payment_processed"
    ],
    "organizationId": "TU_CLIENT_ID"
  }'
```

### Paso 4: Probar en Desarrollo Local (RECOMENDADO)

1. **Instalar ngrok** (si no lo tienes)
   ```bash
   npm install -g ngrok
   ```

2. **Iniciar tu servidor**
   ```bash
   npm run dev
   ```

3. **En otra terminal, exponer con ngrok**
   ```bash
   ngrok http 3000
   ```

4. **Copiar la URL de ngrok**
   - Verás algo como: `https://abc123.ngrok.io`
   - Esta es tu URL temporal pública

5. **Actualizar webhook en Conduit**
   - Ve al Dashboard de Conduit
   - Edita tu webhook
   - Cambia la URL a: `https://abc123.ngrok.io/api/webhooks/conduit`
   - Guarda

6. **Crear una transacción de prueba**
   - Crea una transacción en Conduit (usando tu app o API)
   - Observa los logs en tu terminal

7. **Verificar que funcionó**
   ```bash
   # Deberías ver en la consola:
   ✅ Webhook signature verified
   📨 Received Conduit webhook: { event: 'transaction.created', ... }
   📝 Updating transaction trxn_xxx to status: CREATED
   ✅ Transaction trxn_xxx updated successfully
   ```

### Paso 5: Verificar en Supabase (RECOMENDADO)

1. Ve a Supabase Dashboard
2. Abre **Table Editor**
3. Busca la tabla `webhook_logs`
4. Deberías ver los webhooks recibidos

```sql
-- O ejecuta esta query en SQL Editor:
SELECT * FROM webhook_logs 
ORDER BY processed_at DESC 
LIMIT 10;
```

### Paso 6: Deploy a Producción (CUANDO ESTÉS LISTO)

1. **Agregar variable de entorno en Vercel**
   - Ve a tu proyecto en Vercel
   - Settings → Environment Variables
   - Agrega: `CONDUIT_WEBHOOK_SECRET` = tu_secret

2. **Deploy**
   ```bash
   git add .
   git commit -m "Add Conduit webhooks integration"
   git push
   ```

3. **Actualizar webhook en Conduit**
   - Ve al Dashboard de Conduit
   - Edita tu webhook
   - Cambia la URL a tu dominio de producción:
     - `https://tu-dominio.vercel.app/api/webhooks/conduit`
   - Guarda

## 🧪 Cómo Probar que Funciona

### Test 1: Health Check
```bash
curl http://localhost:3000/api/webhooks/health

# Respuesta esperada:
# {"status":"ok","service":"webhooks","timestamp":"..."}
```

### Test 2: Crear una Transacción
1. Crea una transacción usando tu API de Conduit
2. Observa los logs en tu consola
3. Verifica en Supabase que se actualizó el status

### Test 3: Ver el Historial
```sql
-- En Supabase SQL Editor:
SELECT * FROM transaction_history
WHERE transaction_id = 'trxn_tu_transaccion_id';
```

## 📚 Documentación Disponible

- **[QUICK_START_WEBHOOKS.md](./QUICK_START_WEBHOOKS.md)** - Inicio rápido (5 min)
- **[WEBHOOKS_SETUP.md](./WEBHOOKS_SETUP.md)** - Guía completa y detallada
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Resumen de implementación
- **[README.md](./README.md)** - Documentación general del proyecto

## ⚠️ Troubleshooting

### Error: "Invalid signature"
**Solución**: 
1. Verifica que `CONDUIT_WEBHOOK_SECRET` en `.env` sea correcto
2. Reinicia el servidor: `npm run dev`

### Error: "Missing signature headers"
**Solución**: 
- Asegúrate de que el webhook esté configurado correctamente en Conduit
- Verifica que la URL sea la correcta

### No recibo webhooks
**Solución**:
1. Verifica que el webhook esté "enabled" en Conduit
2. Verifica la URL en Conduit Dashboard
3. Si usas ngrok, asegúrate de que esté corriendo
4. Revisa los logs en Conduit Dashboard

### Webhook llega pero no se guarda en BD
**Solución**:
1. Verifica que ejecutaste el script SQL en Supabase
2. Verifica que la tabla `webhook_logs` existe
3. Revisa los logs de tu servidor para ver el error específico

## 🎯 Checklist Final

Antes de considerar que está todo listo, verifica:

- [ ] ✅ Agregué `CONDUIT_WEBHOOK_SECRET` a `.env`
- [ ] ✅ Ejecuté el script SQL en Supabase
- [ ] ✅ La tabla `webhook_logs` existe en Supabase
- [ ] ✅ Registré el webhook en Conduit Dashboard
- [ ] ✅ Probé con ngrok en desarrollo local
- [ ] ✅ Vi los logs en la consola confirmando que funciona
- [ ] ✅ Verifiqué en Supabase que se guardan los webhooks
- [ ] ✅ Probé creando una transacción real
- [ ] ✅ El status de la transacción se actualiza automáticamente

## 🚀 Una vez completado todo...

¡Tu backend estará recibiendo actualizaciones en tiempo real de Conduit!

Cada vez que una transacción cambie de estado:
1. Conduit enviará un webhook
2. Tu backend lo validará y procesará
3. Se actualizará automáticamente en Supabase
4. Se guardará un log para auditoría

## 💡 Tips Adicionales

1. **Desarrollo**: Siempre usa ngrok para probar webhooks localmente
2. **Producción**: Asegúrate de usar HTTPS
3. **Monitoring**: Revisa regularmente la tabla `webhook_logs`
4. **Limpieza**: Considera ejecutar `cleanup_old_webhook_logs()` mensualmente

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:
1. Revisa la sección de Troubleshooting en [WEBHOOKS_SETUP.md](./WEBHOOKS_SETUP.md)
2. Verifica los logs de tu servidor
3. Verifica los logs en Conduit Dashboard
4. Consulta la tabla `webhook_logs` en Supabase

---

**¡Éxito con la integración! 🎉**
