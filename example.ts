export const data = {
  // 🔑 -------- NIVEL RAÍZ --------
  "orgId": "org_12345",                    // ✅ REQUERIDO → ID de tu organización dentro de Conduit
  "kybSetupBy": "client",                  // ⚙️ OPCIONAL → "client" (default) o "conduit" según quién gestione el KYB
  "isDirectSetup": true,                   // ⚙️ OPCIONAL → true si haces el registro directamente vía API

  // 🏢 -------- INFORMACIÓN DE LA EMPRESA --------
  "businessInformation": {

    // === Identificación general ===
    "businessLegalName": "PagoNet S.A.C.",         // ✅ REQUERIDO → Nombre legal de la empresa (razón social)
    "businessTradeName": "PagoNet",                // ⚙️ OPCIONAL → Nombre comercial o marca (si difiere del legal)
    "industry": "Finance",                         // ✅ REQUERIDO → Sector económico (Technology, Finance, Retail, etc.)
    "entityType": "Corporation",                   // ✅ REQUERIDO → Tipo de entidad (Corporation, LLC, Bank, etc.)
    "website": "https://pagonet.pe",               // ⚙️ OPCIONAL → Sitio web oficial
    "registeredDate": "2020-03-10",                // ⚙️ OPCIONAL → Fecha de constitución o registro legal

    // === Contacto ===
    "email": "contacto@pagonet.pe",                // ✅ REQUERIDO → Correo de contacto principal
    "phone": "+51987654321",                       // ✅ REQUERIDO → Teléfono de contacto del negocio

    // === Datos fiscales ===
    "taxIdentificationNumber": "20674591231",      // ✅ REQUERIDO → Número fiscal o RUC
    "taxClassification": "Corporation",            // ✅ REQUERIDO → Estructura fiscal (LLC, C-Corp, etc.)
    "entityTaxedAs": "C-Corporation",              // ⚙️ OPCIONAL → Régimen tributario (S-Corp, C-Corp, Partnership)
    "naicsCode": "522320",                         // ✅ REQUERIDO → Código industrial (EE.UU. NAICS o equivalente)
    "businessEntityId": "BE001",                   // ⚙️ OPCIONAL → ID interno o referencia de tu sistema
    "isFinancialInstitution": true,                // ⚙️ CONDICIONAL → true si la empresa está regulada (fintech, banco, etc.)
    "regulatorName": "Superintendencia de Banca, Seguros y AFP (SBS)", // ⚠️ REQUERIDO SOLO si isFinancialInstitution=true

    // === Direcciones ===
    "registeredAddress": {                         // ✅ REQUERIDO → Domicilio fiscal
      "streetLine1": "Av. Javier Prado Este 1234", // ✅ REQUERIDO → Línea 1 (dirección)
      "streetLine2": "Piso 6",                     // ⚙️ OPCIONAL → Línea 2 o referencia
      "city": "Lima",                              // ✅ REQUERIDO → Ciudad
      "state": "Lima",                             // ⚙️ OPCIONAL → Provincia o estado
      "postalCode": "15046",                       // ⚙️ OPCIONAL → Código postal
      "country": "PER"                             // ✅ REQUERIDO → País (ISO-2 o ISO-3)
    },

    "operatingAddress": {                          // ⚙️ OPCIONAL → Dirección de operación (si difiere)
      "streetLine1": "Av. Javier Prado Este 1234",
      "city": "Lima",
      "state": "Lima",
      "postalCode": "15046",
      "country": "PER"
    },

    "mailingAddress": {                            // ⚙️ OPCIONAL → Dirección postal para correspondencia
      "streetLine1": "Av. República de Panamá 321",
      "city": "Lima",
      "country": "PER"
    },

    // === Estado y estructura ===
    "isSubsidiary": false,                         // ⚙️ OPCIONAL → true si pertenece a otra empresa
    "isOperating": true,                           // ✅ REQUERIDO → Si la empresa está operando actualmente

    // === Actividad financiera esperada ===
    "anticipatedMonthlyVolume": {                  // ⚙️ OPCIONAL → Volumen estimado mensual de operaciones
      "ach": { "incoming": 100000, "outgoing": 80000 },
      "wire": { "incoming": 50000, "outgoing": 30000 },
      "check": { "incoming": 10000, "outgoing": 5000 }
    },
    "expectedAverageDailyBalance": 250000,         // ⚙️ OPCIONAL → Promedio estimado de fondos en cuenta

    // === Cumplimiento y asesoría ===
    "hasAdvisor": true,                            // ⚙️ OPCIONAL → Indica si tiene asesor financiero o contable
    "businessDescription": "Fintech dedicada a pagos electrónicos y remesas digitales.", // ✅ REQUERIDO → Descripción (≥5 caracteres)
    "businessEntityType": "Corporation"            // ✅ REQUERIDO → Tipo legal (Corporation, LLC, Partnership, etc.)
  }
}
