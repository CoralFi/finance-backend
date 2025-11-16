# Counterparties - Configuración y Uso

## 📋 Descripción General

Este módulo gestiona los **counterparties** (cuentas bancarias externas) de Conduit Financial, permitiendo crear, almacenar y consultar información de contrapartes tanto individuales como empresariales.

## 🗄️ Estructura de Base de Datos

### Tabla: `conduit_counterparties`

```sql
CREATE TABLE conduit_counterparties (
  id UUID PRIMARY KEY,
  counterparty_id TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL,
  type TEXT CHECK (type IN ('individual', 'business')),
  status TEXT CHECK (status IN ('active', 'compliance_rejected', 'in_compliance_review', 'deleted')),
  
  -- Campos para Individual
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  birth_date TIMESTAMP WITH TIME ZONE,
  nationality TEXT,
  
  -- Campos para Business
  business_name TEXT,
  website TEXT,
  
  -- Campos comunes
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  identification_type TEXT,
  identification_number TEXT,
  address JSONB NOT NULL,
  payment_method_ids JSONB,
  document_ids JSONB,
  messages JSONB,
  metadata JSONB,
  raw_response JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conduit_created_at TIMESTAMP WITH TIME ZONE,
  conduit_updated_at TIMESTAMP WITH TIME ZONE
);
```

### Vistas Disponibles

#### `active_counterparties`
Vista de counterparties activos con información simplificada.

#### `counterparties_stats`
Estadísticas de counterparties por customer:
- Total de counterparties
- Individuales vs Business
- Por estado (active, rejected, in_review)
- Última fecha de creación

## 📁 Archivos Creados

### 1. Schema SQL
**Ubicación:** `database/counterparties_schema.sql`

Contiene:
- Definición de tabla `conduit_counterparties`
- Índices para optimización de consultas
- Vistas para consultas comunes
- Políticas RLS (Row Level Security)
- Triggers para actualización automática de timestamps
- Función de limpieza de registros antiguos

### 2. Tipos TypeScript
**Ubicación:** `src/types/counterparties.ts`

Define:
- `CounterpartyType`: 'individual' | 'business'
- `CounterpartyStatus`: 'active' | 'compliance_rejected' | 'in_compliance_review' | 'deleted'
- `IdentificationType`: tin, nit, cc, ce, passport, cpf, cnpj, rfc, curp, cuit, cuil
- Interfaces para requests y responses
- Tipos para base de datos

### 3. Servicio de Counterparties
**Ubicación:** `src/services/counterparties/counterpartyService.ts`

Métodos disponibles:
- `saveCounterparty()`: Guarda un counterparty en Supabase
- `updateCounterparty()`: Actualiza un counterparty existente
- `getCounterpartyById()`: Obtiene un counterparty por ID
- `listCounterparties()`: Lista counterparties con filtros
- `deleteCounterparty()`: Soft delete (marca como deleted)
- `hardDeleteCounterparty()`: Eliminación permanente
- `getCounterpartiesStats()`: Obtiene estadísticas por customer

### 4. Controlador Actualizado
**Ubicación:** `src/api/bussiness/bankAccount/createBankAccount.ts`

Ahora incluye:
- Creación de counterparty en Conduit
- Guardado automático en Supabase
- Manejo de errores de base de datos sin afectar la respuesta

## 🚀 Uso

### Crear un Counterparty (Business)

```typescript
POST /api/business/bank-account

{
  "type": "business",
  "businessName": "Tech Solutions Inc",
  "website": "https://techsolutions.com",
  "email": "contact@techsolutions.com",
  "phone": "+1-555-123-4567",
  "customerId": "cus_xxx",
  "identificationType": "tin",
  "identificationNumber": "12-3456789",
  "address": {
    "streetLine1": "123 Main St",
    "streetLine2": "Suite 100",
    "city": "Boston",
    "state": "MA",
    "postalCode": "02111",
    "country": "USA"
  },
  "paymentMethods": [
    {
      "type": "bank",
      "rail": ["ach", "wire"],
      "bankName": "First National Bank",
      "accountType": "checking",
      "accountOwnerName": "Tech Solutions Inc",
      "accountNumber": "123456789",
      "routingNumber": "021000021",
      "currency": "USD",
      "address": {
        "country": "USA"
      }
    }
  ]
}
```

### Crear un Counterparty (Individual)

```typescript
POST /api/business/bank-account

{
  "type": "individual",
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Smith",
  "birthDate": "1990-05-15T00:00:00.000Z",
  "nationality": "USA",
  "email": "john.smith@email.com",
  "phone": "+1-555-987-6543",
  "customerId": "cus_xxx",
  "identificationType": "passport",
  "identificationNumber": "AB1234567",
  "address": {
    "streetLine1": "456 Oak Avenue",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "paymentMethods": [
    {
      "type": "wallet",
      "rail": "ethereum",
      "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "walletLabel": "Personal ETH Wallet"
    }
  ]
}
```

## 🔍 Consultas Útiles

### Listar todos los counterparties de un customer

```typescript
import { CounterpartyService } from '@/services/counterparties/counterpartyService';

const counterparties = await CounterpartyService.listCounterparties({
  customerId: 'cus_xxx'
});
```

### Obtener solo counterparties activos

```typescript
const activeCounterparties = await CounterpartyService.listCounterparties({
  customerId: 'cus_xxx',
  status: 'active'
});
```

### Obtener estadísticas

```typescript
const stats = await CounterpartyService.getCounterpartiesStats('cus_xxx');
console.log(stats);
// {
//   customer_id: 'cus_xxx',
//   total_counterparties: 10,
//   individuals: 6,
//   businesses: 4,
//   active_counterparties: 8,
//   rejected_counterparties: 1,
//   in_review_counterparties: 1
// }
```

### Actualizar un counterparty

```typescript
await CounterpartyService.updateCounterparty('cp_xxx', {
  status: 'active',
  email: 'newemail@example.com'
});
```

## 🔐 Seguridad

### Row Level Security (RLS)

La tabla tiene RLS habilitado con las siguientes políticas:

- **Lectura**: Usuarios autenticados pueden leer todos los counterparties
- **Inserción**: Solo service_role puede insertar
- **Actualización**: Solo service_role puede actualizar
- **Eliminación**: Solo service_role puede eliminar

### Permisos

```sql
-- Usuarios autenticados: Solo lectura
GRANT SELECT ON conduit_counterparties TO authenticated;
GRANT SELECT ON active_counterparties TO authenticated;
GRANT SELECT ON counterparties_stats TO authenticated;

-- Service role: Acceso completo
GRANT ALL ON conduit_counterparties TO service_role;
```

## 📊 Índices

Para optimizar las consultas, se crearon los siguientes índices:

- `idx_counterparties_counterparty_id`: ID del counterparty
- `idx_counterparties_customer_id`: ID del customer
- `idx_counterparties_type`: Tipo (individual/business)
- `idx_counterparties_status`: Estado
- `idx_counterparties_email`: Email
- `idx_counterparties_customer_type`: Compuesto (customer_id, type)
- `idx_counterparties_customer_status`: Compuesto (customer_id, status)
- `idx_counterparties_created_at`: Fecha de creación
- `idx_counterparties_payment_method_ids`: GIN para búsquedas en JSONB
- `idx_counterparties_document_ids`: GIN para búsquedas en JSONB

## 🧹 Mantenimiento

### Limpiar counterparties eliminados antiguos

```sql
SELECT cleanup_old_deleted_counterparties();
```

Esta función elimina counterparties con status 'deleted' más antiguos de 180 días.

## 📝 Tipos de Identificación Soportados

| Código | Descripción | País |
|--------|-------------|------|
| tin | Tax Identification Number | USA |
| nit | Número de Identificación Tributaria | Colombia |
| cc | Cédula de Ciudadanía | Colombia |
| ce | Cédula de Extranjería | Colombia |
| passport | Pasaporte | Internacional |
| cpf | Cadastro de Pessoas Físicas | Brasil |
| cnpj | Cadastro Nacional da Pessoa Jurídica | Brasil |
| rfc | Registro Federal de Contribuyentes | México |
| curp | Clave Única de Registro de Población | México |
| cuit | Clave Única de Identificación Tributaria | Argentina |
| cuil | Código Único de Identificación Laboral | Argentina |

## ✅ Checklist de Implementación

- [x] Schema SQL creado
- [x] Tipos TypeScript definidos
- [x] Servicio de Supabase implementado
- [x] Controlador actualizado
- [x] Documentación creada
- [ ] Schema aplicado en Supabase
- [ ] Tests implementados

## 🔄 Próximos Pasos

1. **Aplicar el schema en Supabase**
   ```bash
   # Ejecutar el archivo SQL en Supabase
   psql -h your-db-host -U postgres -d postgres -f database/counterparties_schema.sql
   ```

2. **Probar la creación de counterparties**
   - Crear un counterparty tipo business
   - Crear un counterparty tipo individual
   - Verificar que se guarden en Supabase

3. **Implementar endpoints adicionales** (opcional)
   - GET /api/counterparties - Listar counterparties
   - GET /api/counterparties/:id - Obtener counterparty por ID
   - PATCH /api/counterparties/:id - Actualizar counterparty
   - DELETE /api/counterparties/:id - Eliminar counterparty

4. **Agregar tests**
   - Tests unitarios para el servicio
   - Tests de integración para el controlador

## 📚 Referencias

- [Conduit API - Counterparties](https://docs.conduit.financial/api-reference/counterparties/create-a-counterparty)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
