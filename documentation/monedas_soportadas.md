# Reporte de Monedas Soportadas

Este documento detalla las monedas actualmente soportadas en el sistema (`src/api/paymentAcounts/helpers/bankAccounts.ts`) comparadas con la cobertura total ofrecida por la documentación de FernHQ.

## 1. Monedas Disponible (Implementadas)
Estas monedas ya cuentan con configuración y validación en el código base.

| Código | Nombre (Implícito) | Tipo de Soporte en Fern |
|--------|-------------------|-------------------------|
| **EUR** | Euro | Onramp & Offramp |
| **USD** | Dólar Estadounidense | Onramp & Offramp |
| **ARS** | Peso Argentino | Onramp & Offramp |
| **MXN** | Peso Mexicano | Onramp & Offramp |
| **BRL** | Real Brasileño | Onramp & Offramp |
| **CNY** | Yuan Chino | Offramp Only |
| **CAD** | Dólar Canadiense | Offramp Only |
| **GBP** | Libra Esterlina | Offramp Only |
| **AUD** | Dólar Australiano | Offramp Only |
| **PEN** | Sol Peruano | Offramp Only |
| **CLP** | Peso Chileno | Offramp Only |
| **HKD** | Dólar de Hong Kong | Offramp Only |
| **IDR** | Rupia Indonesia | Onramp & Offramp |
| **ILS** | Nuevo séquel israelí | Offramp Only |
| **PHP** | Peso Filipino | Onramp & Offramp |
| **BOB** | Boliviano | Offramp Only |
| **CRC** | Colón Costarricense | Offramp Only |
| **COP** | Peso Colombiano | Offramp Only |
| **DOP** | Peso Dominicano | Offramp Only |
| **JPY** | Yen Japonés | Offramp Only |
| **SGD** | Dólar de Singapur | Offramp Only |
| **PLN** | Złoty Polaco | Offramp Only |
| **CZK** | Corona Checa | Offramp Only |
| **DKK** | Corona Danesa | Offramp Only |
| **NOK** | Corona Noruega | Offramp Only |
| **RON** | Leu Rumano | Offramp Only |
| **SEK** | Corona Sueca | Offramp Only |
| **EGP** | Libra Egipcia | Offramp Only |
| **SAR** | Riyal Saudí | Offramp Only |
| **AED** | Dirham EAU | Offramp Only |

Total Implementadas: **30**

---

## 2. Monedas Faltantes (Soportadas por Fern pero no implementadas)
Estas monedas aparecen en la documentación de FernHQ pero no tienen configuración definida en `bankAccounts.ts`.

### Monedas con Soporte Onramp & Offramp (Prioridad Alta)
*Ninguna por el momento.*

### Monedas con Soporte Offramp Only (Pagos salientes)
#### África
- **GHS** (Ghana)
- **KES** (Kenia)
- **NGN** (Nigeria)
- **ZAR** (Sudáfrica)
- **TZS** (Tanzania)

#### Asia / Pacífico
- **BDT** (Bangladesh)
- **INR** (India)
- **MYR** (Malasia)
- **PKR** (Pakistán)
- **THB** (Tailandia)
- **TRY** (Turquía)
- **VND** (Vietnam)

#### Europa
*Ninguna por el momento.*

#### Medio Oriente
*Ninguna por el momento.*

#### Américas (Latam/Caribe)
*Ninguna por el momento.*

### Otras Monedas (Soporte Limitado / Local Rail)
- **GTQ** (Guatemala)
- **HUF** (Hungría)
- **JMD** (Jamaica)
- **JOD** (Jordania)
- **KRW** (Corea del Sur)
- **LKR** (Sri Lanka)
- **NPR** (Nepal)
- **NZD** (Nueva Zelanda)
- **QAR** (Qatar)
- **XOF** (Costa de Marfil)

---

## Referencias
- Código Fuente: `src/api/paymentAcounts/helpers/bankAccounts.ts`
- Documentación Externa: [FernHQ Fiat Currency Support](https://docs.fernhq.com/coverage/fiat-currency-support)
