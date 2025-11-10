# 🚀 Setup Rápido - Payment Methods

## Paso 1: Ejecutar Schema SQL

Ejecuta el siguiente archivo SQL en tu base de datos de Supabase:

```bash
database/payment_methods_schema.sql
```

### Opción A: Usando Supabase Dashboard
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido de `payment_methods_schema.sql`
5. Ejecuta la query

### Opción B: Usando Supabase CLI
```bash
supabase db push
```

## Paso 2: Verificar Variables de Entorno

Asegúrate de tener estas variables en tu `.env`:

```env
# Conduit API
CONDUIT_API_BASE_URL=https://api.conduit.financial
CONDUIT_PUBLIC_KEY=your_public_key_here
CONDUIT_PRIVATE_KEY=your_private_key_here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Paso 3: Instalar Dependencias (si es necesario)

```bash
npm install
# o
yarn install
```

## Paso 4: Iniciar el Servidor

```bash
npm run dev
# o
yarn dev
```

## Paso 5: Probar los Endpoints

### Crear una cuenta bancaria:

```bash
curl -X POST http://localhost:3000/api/business/YOUR_CUSTOMER_ID/payment-methods \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bank",
    "currency": "USD",
    "rail": ["fedwire"],
    "bankName": "Bank of America",
    "accountOwnerName": "John Doe",
    "accountType": "savings",
    "accountNumber": "1234567890",
    "routingNumber": "1234567890"
  }'
```

### Crear una wallet:

```bash
curl -X POST http://localhost:3000/api/business/YOUR_CUSTOMER_ID/payment-methods \
  -H "Content-Type: application/json" \
  -d '{
    "type": "wallet",
    "rail": "tron",
    "walletAddress": "TXYZa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5",
    "walletLabel": "My TRON Wallet"
  }'
```

### Listar métodos de pago:

```bash
curl http://localhost:3000/api/business/YOUR_CUSTOMER_ID/payment-methods
```

## 📁 Archivos Creados

### Base de Datos
- `database/payment_methods_schema.sql` - Schema de Supabase

### Tipos
- `src/types/payment-methods.ts` - Definiciones TypeScript

### Servicios
- `src/services/conduit/conduit-financial.ts` - Cliente de Conduit (actualizado)
- `src/services/paymentMethods/paymentMethodService.ts` - Servicio de Supabase

### API
- `src/api/paymentMethods/createPaymentMethod.ts` - Crear método de pago
- `src/api/paymentMethods/listPaymentMethods.ts` - Listar métodos de pago
- `src/api/paymentMethods/getPaymentMethod.ts` - Obtener método de pago
- `src/api/paymentMethods/updatePaymentMethod.ts` - Actualizar método de pago
- `src/api/paymentMethods/deletePaymentMethod.ts` - Eliminar método de pago
- `src/api/paymentMethods/index.ts` - Router

### Rutas
- `src/api/index.ts` - Router principal (actualizado)

### Documentación
- `PAYMENT_METHODS_GUIDE.md` - Guía completa
- `PAYMENT_METHODS_SETUP.md` - Este archivo

## 🔍 Verificar Instalación

### 1. Verificar tabla en Supabase

```sql
SELECT * FROM customer_payment_methods LIMIT 1;
```

### 2. Verificar vistas

```sql
SELECT * FROM active_payment_methods LIMIT 1;
SELECT * FROM payment_methods_stats LIMIT 1;
```

### 3. Verificar endpoints

```bash
# Debe retornar 400 (Bad Request) si no hay customer ID
curl http://localhost:3000/api/business//payment-methods
```

## ✅ Checklist

- [ ] Schema SQL ejecutado en Supabase
- [ ] Variables de entorno configuradas
- [ ] Servidor iniciado sin errores
- [ ] Endpoint de crear método de pago funciona
- [ ] Endpoint de listar métodos de pago funciona
- [ ] Datos se guardan correctamente en Supabase

## 🆘 Problemas Comunes

### Error: "CONDUIT_PRIVATE_KEY is not defined"
- Verifica que la variable esté en tu archivo `.env`
- Reinicia el servidor después de agregar variables

### Error: "Failed to save payment method"
- Verifica que el schema SQL se haya ejecutado
- Verifica las credenciales de Supabase
- Revisa los permisos de RLS en Supabase

### Error 404 en endpoints
- Verifica que las rutas estén registradas en `src/api/index.ts`
- Reinicia el servidor

## 📖 Documentación Completa

Para más detalles, consulta:
- `PAYMENT_METHODS_GUIDE.md` - Guía completa con ejemplos
- [Conduit API Docs](https://docs.conduit.financial)

---

**¡Todo listo!** 🎉 Ahora puedes gestionar métodos de pago de tus customers.
