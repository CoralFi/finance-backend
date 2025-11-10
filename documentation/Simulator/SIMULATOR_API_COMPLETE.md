# 🧪 Conduit Simulator API - Documentación Completa

## 🎯 Resumen

Implementación completa de la integración con la API de simulación de Conduit Financial para el entorno Sandbox, permitiendo simular verificaciones KYB de customers y cambiar estados de compliance de customers y counterparties para pruebas.

## 📋 Tabla de Contenidos

- [Características Implementadas](#características-implementadas)
- [Instalación](#instalación)
- [Quick Start](#quick-start)
- [Uso de la API](#uso-de-la-api)
- [Ejemplos de Código](#ejemplos-de-código)
- [Validaciones y Restricciones](#validaciones-y-restricciones)
- [Estructura de Archivos](#estructura-de-archivos)
- [Casos de Uso](#casos-de-uso)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## ✨ Características Implementadas

### 1. Simulación de KYB de Customers
- ✅ Endpoint POST para simular verificación KYB
- ✅ Soporte para diferentes códigos de país (ISO 3166-1 alpha-3)
- ✅ Validación de campos requeridos
- ✅ Manejo de errores detallado

### 2. Cambio de Estado de Compliance
- ✅ Endpoint POST para cambiar estados de compliance
- ✅ Soporte para customers y counterparties
- ✅ Validación de estados permitidos según tipo
- ✅ Respuestas detalladas con información del cambio

### 3. Validaciones Completas
- ✅ Validación de campos requeridos
- ✅ Validación de tipos (customer/counterparty)
- ✅ Validación de estados permitidos
- ✅ Validación de formato de código de país
- ✅ Logging en modo desarrollo

---

## 📦 Instalación

### Paso 1: Verificar Dependencias

No se requieren dependencias adicionales. El proyecto ya cuenta con las dependencias necesarias.

### Paso 2: Configurar Variables de Entorno

Asegúrate de tener estas variables en tu `.env`:

```env
# Usar la URL del Sandbox
CONDUIT_API_BASE_URL=https://sandbox-api.conduit.financial
CONDUIT_PUBLIC_KEY=tu_public_key
CONDUIT_PRIVATE_KEY=tu_private_key
```

⚠️ **Importante**: Para usar los endpoints de simulación, debes usar la URL del **Sandbox** de Conduit.

### Paso 3: Iniciar el Servidor

```bash
npm run dev
```

---

## 🚀 Quick Start

### 1. Crear un Customer

```bash
curl -X POST http://localhost:3000/api/business/customers \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Company", "email": "test@company.com"}'
```

### 2. Simular KYB del Customer

```bash
curl -X POST http://localhost:3000/api/business/simulator/customer-kyb \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cus_2ofTA13AD0xBtbEvBl20aEb1hEu",
    "countryCode": "USA"
  }'
```

### 3. Cambiar Estado de Compliance a "active"

```bash
curl -X POST http://localhost:3000/api/business/simulator/compliance \
  -H "Content-Type: application/json" \
  -d '{
    "type": "customer",
    "id": "cus_2ofTA13AD0xBtbEvBl20aEb1hEu",
    "status": "active"
  }'
```

---

## 🚀 Uso de la API

## Endpoint 1: Simular KYB de Customer

### Endpoint

```
POST /api/business/simulator/customer-kyb
```

### Parámetros (JSON Body)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `customerId` | String | ✅ Sí | ID del customer en Conduit |
| `countryCode` | String | ✅ Sí | Código de país ISO 3166-1 alpha-3 (USA, MEX, CAN) |

### Respuesta Exitosa (200)

```json
{
  "success": true,
  "message": "Customer KYB simulated successfully",
  "data": {"success": true}
}
```

---

## Endpoint 2: Cambiar Estado de Compliance

### Endpoint

```
POST /api/business/simulator/compliance
```

### Parámetros (JSON Body)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `type` | String | ✅ Sí | `customer` o `counterparty` |
| `id` | String | ✅ Sí | ID de la entidad en Conduit |
| `status` | String | ✅ Sí | Nuevo estado de compliance |

### Estados Permitidos para Customers

- `active` - Customer activo y listo para transacciones
- `in_compliance_review` - En revisión de compliance
- `compliance_rejected` - Rechazado por compliance
- `created` - Recién creado
- `kyb_in_progress` - KYB en progreso
- `kyb_expired` - KYB expirado
- `kyb_missing_information` - Falta información para KYB
- `account_onboarding_pending` - Onboarding de cuenta pendiente

### Estados Permitidos para Counterparties

- `active` - Counterparty activo
- `deleted` - Counterparty eliminado
- `in_compliance_review` - En revisión de compliance
- `compliance_rejected` - Rechazado por compliance

### Respuesta Exitosa (200)

```json
{
  "success": true,
  "message": "Customer compliance status changed successfully",
  "data": {
    "type": "customer",
    "id": "cus_2ofTA13AD0xBtbEvBl20aEb1hEu",
    "status": "active",
    "success": true
  }
}
```

---

## 💻 Ejemplos de Código

### Ejemplo con JavaScript (Fetch)

```javascript
// Simular KYB
async function simulateKYB(customerId, countryCode) {
  const response = await fetch('/api/business/simulator/customer-kyb', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({customerId, countryCode})
  });
  return await response.json();
}

// Cambiar estado de compliance
async function changeCompliance(type, id, status) {
  const response = await fetch('/api/business/simulator/compliance', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({type, id, status})
  });
  return await response.json();
}

// Uso
await simulateKYB('cus_xxx', 'USA');
await changeCompliance('customer', 'cus_xxx', 'active');
```

### Ejemplo con Axios

```javascript
import axios from 'axios';

// Simular KYB
const simulateKYB = async (customerId, countryCode) => {
  const { data } = await axios.post('/api/business/simulator/customer-kyb', {
    customerId,
    countryCode
  });
  return data;
};

// Cambiar compliance
const changeCompliance = async (type, id, status) => {
  const { data } = await axios.post('/api/business/simulator/compliance', {
    type,
    id,
    status
  });
  return data;
};
```

---

## ⚠️ Validaciones y Restricciones

### Códigos de Error Comunes

| Código | Mensaje | Solución |
|--------|---------|----------|
| 400 | Field "customerId" is required | Incluye el `customerId` |
| 400 | Field "countryCode" is required | Incluye el `countryCode` |
| 400 | Invalid ISO 3166-1 alpha-3 code | Usa código de 3 letras (USA, MEX, CAN) |
| 400 | Field "type" must be "customer" or "counterparty" | Verifica el tipo |
| 400 | Invalid customer status | Usa un estado permitido |
| 500 | Failed to simulate KYB | Verifica credenciales y URL del sandbox |

---

## 📁 Estructura de Archivos

```
src/
├── api/bussiness/simulator/
│   ├── index.ts                    # Router
│   ├── simulateKYB.ts              # Controlador KYB
│   └── changeCompliance.ts         # Controlador compliance
└── services/conduit/
    └── conduit-financial.ts        # Métodos del servicio
```

---

## 🎨 Casos de Uso

### Onboarding Completo de Customer

```bash
# 1. Crear customer
# 2. Simular KYB
curl -X POST http://localhost:3000/api/business/simulator/customer-kyb \
  -H "Content-Type: application/json" \
  -d '{"customerId": "cus_xxx", "countryCode": "USA"}'

# 3. Activar customer
curl -X POST http://localhost:3000/api/business/simulator/compliance \
  -H "Content-Type: application/json" \
  -d '{"type": "customer", "id": "cus_xxx", "status": "active"}'
```

### Simular Rechazo de Compliance

```bash
curl -X POST http://localhost:3000/api/business/simulator/compliance \
  -H "Content-Type: application/json" \
  -d '{"type": "customer", "id": "cus_xxx", "status": "compliance_rejected"}'
```

---

## 🧪 Testing

### Test con cURL

```bash
# Simular KYB
curl -X POST http://localhost:3000/api/business/simulator/customer-kyb \
  -H "Content-Type: application/json" \
  -d '{"customerId": "cus_xxx", "countryCode": "USA"}' \
  -v

# Cambiar compliance
curl -X POST http://localhost:3000/api/business/simulator/compliance \
  -H "Content-Type: application/json" \
  -d '{"type": "customer", "id": "cus_xxx", "status": "active"}' \
  -v
```

---

## 🔍 Troubleshooting

### Error: "Failed to simulate customer KYB"

Verifica tu `.env`:
```bash
CONDUIT_API_BASE_URL=https://sandbox-api.conduit.financial
CONDUIT_PUBLIC_KEY=tu_key
CONDUIT_PRIVATE_KEY=tu_secret
```

### Error: "Invalid ISO 3166-1 alpha-3 code"

Usa códigos de 3 letras mayúsculas: `USA`, `MEX`, `CAN`, `GBR`, `DEU`

### Error: "Invalid customer status"

Usa solo estados permitidos listados arriba.

---

## 📚 Referencias

- [Conduit Sandbox Documentation](https://docs.conduit.financial/developer-sections/setting-up-sandbox)
- [ISO 3166-1 alpha-3 Country Codes](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3)

---

**Implementado por:** Cascade AI  
**Fecha:** Enero 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Completo y listo para usar
