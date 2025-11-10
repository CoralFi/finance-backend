# Guía de Payment Methods - Conduit API

Esta guía explica cómo usar los endpoints de métodos de pago (Payment Methods) implementados para la API de Conduit Financial.

## 📋 Tabla de Contenidos

- [Configuración Inicial](#configuración-inicial)
- [Endpoints Disponibles](#endpoints-disponibles)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Tipos de Métodos de Pago](#tipos-de-métodos-de-pago)
- [Base de Datos](#base-de-datos)

---

## 🔧 Configuración Inicial

### 1. Ejecutar el Schema SQL en Supabase

Primero, ejecuta el script SQL para crear la tabla en tu base de datos de Supabase:

```bash
# Ubicación del archivo
database/payment_methods_schema.sql
```

Ejecuta este script en el SQL Editor de Supabase o usando el CLI de Supabase.

### 2. Variables de Entorno

Asegúrate de tener configuradas las siguientes variables en tu archivo `.env`:

```env
CONDUIT_API_BASE_URL=https://api.conduit.financial
CONDUIT_PUBLIC_KEY=your_public_key
CONDUIT_PRIVATE_KEY=your_private_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 🚀 Endpoints Disponibles

### 1. Crear Método de Pago
**POST** `/api/business/:customerId/payment-methods`

Crea un nuevo método de pago (cuenta bancaria o wallet) para un customer.

### 2. Listar Métodos de Pago
**GET** `/api/business/:customerId/payment-methods`

Lista todos los métodos de pago de un customer.

### 3. Obtener Método de Pago
**GET** `/api/business/:customerId/payment-methods/:paymentMethodId`

Obtiene los detalles de un método de pago específico.

### 4. Actualizar Método de Pago
**PATCH** `/api/business/:customerId/payment-methods/:paymentMethodId`

Actualiza un método de pago existente.

### 5. Eliminar Método de Pago
**DELETE** `/api/business/:customerId/payment-methods/:paymentMethodId`

Elimina un método de pago.

---

## 📝 Ejemplos de Uso

### Crear una Cuenta Bancaria (Bank Account)

```bash
curl --request POST \
  --url http://localhost:3000/api/business/cus_1234567890/payment-methods \
  --header 'Content-Type: application/json' \
  --data '{
    "type": "bank",
    "currency": "USD",
    "rail": ["fedwire"],
    "bankName": "Bank of America",
    "accountOwnerName": "John Doe",
    "accountType": "savings",
    "accountNumber": "1234567890",
    "routingNumber": "1234567890",
    "address": {
      "streetLine1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "USA"
    }
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Método de pago creado exitosamente",
  "paymentMethod": {
    "id": "bank_2ofTA5mz0T91pBmD3tMTeLE7T4X",
    "type": "bank",
    "rail": ["fedwire"],
    "bankName": "Bank of America",
    "accountOwnerName": "John Doe",
    "accountNumber": "1234567890",
    "accountType": "savings",
    "currency": "USD",
    "routingNumber": "1234567890",
    "status": "enabled",
    "address": {
      "streetLine1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "USA"
    },
    "entity": {
      "id": "cus_1234567890",
      "name": "John Doe",
      "entityType": "individual",
      "complianceEntityType": "customer"
    }
  }
}
```

### Crear una Wallet de Criptomonedas

```bash
curl --request POST \
  --url http://localhost:3000/api/business/cus_1234567890/payment-methods \
  --header 'Content-Type: application/json' \
  --data '{
    "type": "wallet",
    "rail": "tron",
    "walletAddress": "TXYZa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5",
    "walletLabel": "My TRON Wallet",
    "currency": "USDT"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Método de pago creado exitosamente",
  "paymentMethod": {
    "id": "wlt_2nqjHpNLK6wSNlFyMvZgX8SYeAO",
    "type": "wallet",
    "rail": "tron",
    "walletAddress": "TXYZa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5",
    "walletLabel": "My TRON Wallet",
    "currency": "USDT",
    "status": "enabled",
    "entity": {
      "id": "cus_1234567890",
      "name": "John Doe",
      "entityType": "individual",
      "complianceEntityType": "customer"
    }
  }
}
```

### Listar Métodos de Pago

```bash
curl --request GET \
  --url http://localhost:3000/api/business/cus_1234567890/payment-methods
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Métodos de pago obtenidos exitosamente",
  "count": 2,
  "paymentMethods": [
    {
      "id": "bank_2ofTA5mz0T91pBmD3tMTeLE7T4X",
      "type": "bank",
      "bankName": "Bank of America",
      "accountNumber": "1234567890",
      "currency": "USD",
      "status": "enabled"
    },
    {
      "id": "wlt_2nqjHpNLK6wSNlFyMvZgX8SYeAO",
      "type": "wallet",
      "walletAddress": "TXYZa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5",
      "currency": "USDT",
      "status": "enabled"
    }
  ]
}
```

### Obtener un Método de Pago Específico

```bash
curl --request GET \
  --url http://localhost:3000/api/business/cus_1234567890/payment-methods/bank_2ofTA5mz0T91pBmD3tMTeLE7T4X
```

### Actualizar un Método de Pago

```bash
curl --request PATCH \
  --url http://localhost:3000/api/business/cus_1234567890/payment-methods/bank_2ofTA5mz0T91pBmD3tMTeLE7T4X \
  --header 'Content-Type: application/json' \
  --data '{
    "status": "disabled"
  }'
```

### Eliminar un Método de Pago

```bash
curl --request DELETE \
  --url http://localhost:3000/api/business/cus_1234567890/payment-methods/bank_2ofTA5mz0T91pBmD3tMTeLE7T4X
```

---

## 💳 Tipos de Métodos de Pago

### Bank Account (Cuenta Bancaria)

**Campos Requeridos:**
- `type`: "bank"
- `currency`: Código de moneda fiat (USD, MXN, BRL, COP, EUR, NGN, ARS, GBP)
- `rail`: Array de rails soportados (fedwire, ach, wire, sepa, swift, pix, spei)
- `bankName`: Nombre del banco
- `accountOwnerName`: Nombre del titular de la cuenta
- `accountNumber`: Número de cuenta
- `accountType`: Tipo de cuenta (savings, checking, electronic_deposit)

**Campos Opcionales:**
- `routingNumber`: Número de routing (requerido para bancos US)
- `swiftCode`: Código SWIFT
- `iban`: IBAN
- `branchCode`: Código de sucursal
- `bankCode`: Código del banco
- `sortCode`: Sort code
- `pixKey`: Clave PIX (para Brasil)
- `address`: Dirección asociada

### Wallet (Billetera de Criptomonedas)

**Campos Requeridos:**
- `type`: "wallet"
- `rail`: Red blockchain (tron, ethereum, polygon, bitcoin, stellar)
- `walletAddress`: Dirección de la wallet

**Campos Opcionales:**
- `walletLabel`: Etiqueta descriptiva para la wallet
- `currency`: Criptomoneda (USDT, USDC, BTC, ETH)

---

## 🗄️ Base de Datos

### Tabla: `customer_payment_methods`

La tabla almacena todos los métodos de pago con los siguientes campos principales:

- `id`: UUID único
- `payment_method_id`: ID del método de pago en Conduit
- `customer_id`: ID del customer en Conduit
- `type`: Tipo de método de pago (bank o wallet)
- `status`: Estado (enabled, disabled, pending)
- Campos específicos para bank accounts
- Campos específicos para wallets
- `rail`: Rails/redes soportadas (JSONB)
- `currency`: Moneda
- `address`: Dirección (JSONB)
- `entity_info`: Información de la entidad (JSONB)
- Timestamps

### Vistas Disponibles

#### `active_payment_methods`
Vista de métodos de pago activos con información simplificada.

```sql
SELECT * FROM active_payment_methods WHERE customer_id = 'cus_1234567890';
```

#### `payment_methods_stats`
Estadísticas de métodos de pago por customer.

```sql
SELECT * FROM payment_methods_stats WHERE customer_id = 'cus_1234567890';
```

**Ejemplo de respuesta:**
```json
{
  "customer_id": "cus_1234567890",
  "total_methods": 5,
  "bank_accounts": 3,
  "wallets": 2,
  "active_methods": 4,
  "disabled_methods": 1,
  "currencies_count": 3,
  "last_method_added": "2024-01-15T10:30:00Z"
}
```

---

## 🔒 Seguridad

- La tabla tiene **Row Level Security (RLS)** habilitado
- Solo usuarios autenticados pueden leer
- Solo el service role puede insertar, actualizar y eliminar
- Los métodos de pago eliminados se marcan como "disabled" (soft delete)

---

## 🧹 Mantenimiento

### Limpiar Métodos de Pago Deshabilitados Antiguos

Ejecuta esta función para eliminar métodos de pago deshabilitados con más de 180 días:

```sql
SELECT cleanup_old_disabled_payment_methods();
```

---

## 📊 Monitoreo

### Ver Logs de Actividad

```sql
-- Ver métodos de pago creados recientemente
SELECT * FROM customer_payment_methods 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver métodos de pago por tipo
SELECT type, COUNT(*) as count 
FROM customer_payment_methods 
GROUP BY type;

-- Ver métodos de pago por moneda
SELECT currency, COUNT(*) as count 
FROM customer_payment_methods 
GROUP BY currency 
ORDER BY count DESC;
```

---

## 🐛 Troubleshooting

### Error: "Customer ID es requerido"
- Verifica que estás pasando el `customerId` en la URL del endpoint

### Error: "Campos requeridos faltantes"
- Para bank accounts: verifica que incluyas currency, rail, bankName, accountOwnerName, accountNumber, accountType
- Para wallets: verifica que incluyas rail y walletAddress

### Error al guardar en Supabase
- Verifica que el schema SQL se haya ejecutado correctamente
- Verifica las credenciales de Supabase en el archivo .env
- Revisa los logs del servidor para más detalles

---

## 📚 Referencias

- [Documentación de Conduit - Create Payment Method](https://docs.conduit.financial/api-reference/customers/create-payment-method)
- [Guía de Customer Payment Methods](https://docs.conduit.financial/guides/customer/first-payment-method)

---

## ✅ Checklist de Implementación

- [x] Schema SQL creado en Supabase
- [x] Tipos TypeScript definidos
- [x] Servicio de Conduit actualizado
- [x] Servicio de Supabase creado
- [x] Controladores implementados
- [x] Rutas registradas
- [x] Documentación completa

---

**¡Listo para usar!** 🚀

Los endpoints de Payment Methods están completamente integrados con Conduit Financial y Supabase.
