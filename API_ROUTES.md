# Catálogo de Rutas API - Coral Finance

Este documento contiene el listado completo de rutas disponibles en el backend.
**Dominio Base:** `http://localhost:3000`

---

## 👤 Rutas de Clientes (Persona)

Estas rutas están diseñadas para usuarios finales o procesos generales del sistema.

### 🔐 Autenticación
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Inicio de sesión (Crea cookies `access_token` y `refresh_token`) |
| `POST` | `/api/auth/logout` | Cierre de sesión (Limpia cookies) |
| `POST` | `/api/auth/refresh` | Renovación de access_token usando el refresh_token |
| `GET` | `/api/auth/me` | Obtener información del usuario actual (vía cookie) |
| `POST` | `/api/auth/signup` | Registro de nuevo usuario cliente |
| `POST` | `/api/auth/change-password` | Cambio de contraseña |
| `POST` | `/api/auth/reset-password` | Restablecer contraseña |

### 👥 Clientes y Perfil
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/customers` | Listar clientes |
| `GET` | `/api/customers/:customerId` | Obtener info básica del cliente |
| `GET` | `/api/customers/:customerId/info` | Obtener info total detallada |
| `POST` | `/api/customers/:customerId/info` | Actualizar info detallada |
| `GET` | `/api/customers/:customerId/addresses` | Ver direcciones |
| `POST` | `/api/customers/:customerId/addresses` | Agregar/Actualizar dirección |
| `DELETE` | `/api/customers/:customerId/addresses` | Eliminar dirección |
| `GET` | `/api/customers/kyc/:customerId/status` | Ver estado KYC en Fern |
| `POST` | `/api/customers/kyc/update` | Actualizar manualmente estado KYC |

### 📧 Email y Verificación
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/email/send-confirm-email` | Enviar link de confirmación |
| `GET` | `/api/email/confirm-email` | Confirmar email (vía token) |
| `POST` | `/api/email/send-code` | Enviar código OTP |
| `POST` | `/api/email/verify-code` | Verificar código OTP |
| `POST` | `/api/email/send-reset-password` | Enviar email de recuperación |

### 🏦 Cuentas de Pago (Clientes)
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/payment-accounts` | Listar cuentas de pago |
| `POST` | `/api/payment-accounts` | Crear cuenta de pago |
| `DELETE` | `/api/payment-accounts` | Eliminar cuenta de pago |
| `GET` | `/api/payment-accounts/:id/balance` | Ver saldo de la cuenta |
| `GET` | `/api/payment-accounts/:id/info` | Ver info de la cuenta |

### 💸 Transacciones y Cotizaciones
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/transactions` | Listar transacciones |
| `POST` | `/api/transactions` | Crear transacción desde un quote |
| `POST` | `/api/quotes` | Crear cotización de transacción |
| `POST` | `/api/quotes/conduit` | Crear cotización vía Conduit |

---

## 🏢 Rutas de Negocios (Business)

Rutas específicas para la gestión de empresas y operaciones B2B.

### 🔐 Autenticación Business
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/auth/business/signup` | Registro de empresa (Conduit) |
| `POST` | `/api/auth/business/reset-password` | Restablecer contraseña de negocio |
| `POST` | `/api/auth/business/change-password` | Cambiar contraseña de negocio |

### 📈 Gestión de Negocio
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/business/customers` | Listar empresas registradas |
| `GET` | `/api/business/customers/:id` | Ver detalle de empresa |
| `POST` | `/api/business/customers/accept-tos` | Aceptar Términos de Servicio |
| `GET` | `/api/business/balances/:conduitId` | Ver balances en Conduit |
| `GET` | `/api/business/balances/:conduitId/samename` | Balances de cuentas mismo nombre |

### 🏦 Cuentas y Contrapartes
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/business/accounts` | Listar cuentas del negocio |
| `GET` | `/api/business/accounts/:id` | Ver detalle de cuenta |
| `GET` | `/api/business/accounts/deposit/:id` | Instrucciones de depósito |
| `POST` | `/api/business/counterparties/create` | Crear cuenta bancaria externa (contraparte) |
| `GET` | `/api/business/counterparties/:customerId/list/:currency` | Listar contrapartes por moneda |
| `PATCH` | `/api/business/counterparties/update/:id` | Actualizar contraparte |
| `DELETE` | `/api/business/counterparties/delete/:id/:pmId` | Eliminar contraparte |

### 💳 Métodos de Pago
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/business/:customerId/payment-methods` | Crear método de pago |
| `GET` | `/api/business/:customerId/payment-methods` | Listar métodos de pago |
| `DELETE` | `/api/business/:customerId/payment-methods/:id` | Eliminar método de pago |

### 📄 Documentos y Otros
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/business/documents/upload` | Subir documentos a Conduit |
| `POST` | `/api/business/simulator/customer-kyb` | Simular KYB (Solo Sandbox) |
| `POST` | `/api/business/quote/crypto-wallet` | Cotización para flujos de Crypto |

---

## 🛠️ Rutas Generales / Utilidades

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/locations` | Listar países |
| `GET` | `/api/locations/:countryId` | Listar estados/provincias |
| `GET` | `/api/locations/:countryId/:stateId` | Listar ciudades |
| `POST` | `/api/webhooks/conduit` | Webhook para eventos de Conduit |
| `GET` | `/api/webhooks/health` | Estado del servicio de webhooks |
| `DELETE` | `/api/deactivate/:type/:id` | Desactivar recursos (PM / Counterparty) |
