// =====================================================
// Conduit Counterparties Types
// =====================================================

/**
 * Tipos de counterparty soportados
 */
export type CounterpartyType = 'individual' | 'business';

/**
 * Estados de un counterparty
 */
export type CounterpartyStatus = 
  | 'active' 
  | 'compliance_rejected' 
  | 'in_compliance_review' 
  | 'deleted';

/**
 * Tipos de identificación soportados
 */
export type IdentificationType = 
  | 'tin'      // Tax Identification Number (USA)
  | 'nit'      // Número de Identificación Tributaria (Colombia)
  | 'cc'       // Cédula de Ciudadanía (Colombia)
  | 'ce'       // Cédula de Extranjería (Colombia)
  | 'passport' // Pasaporte
  | 'cpf'      // Cadastro de Pessoas Físicas (Brasil)
  | 'cnpj'     // Cadastro Nacional da Pessoa Jurídica (Brasil)
  | 'rfc'      // Registro Federal de Contribuyentes (México)
  | 'curp'     // Clave Única de Registro de Población (México)
  | 'cuit'     // Clave Única de Identificación Tributaria (Argentina)
  | 'cuil';    // Código Único de Identificación Laboral (Argentina)

/**
 * Dirección de un counterparty
 */
export interface CounterpartyAddress {
  streetLine1: string;
  streetLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string; // ISO 3166-1 alpha-3 country code (e.g., "USA", "MEX")
}

/**
 * Información de documento asociado
 */
export interface CounterpartyDocument {
  documentId: string;
  documentPurpose?: string;
  documentType?: string;
  documentName?: string;
  uploadedAt?: string;
}

/**
 * Mensaje de compliance
 */
export interface CounterpartyMessage {
  type: string;
  message: string;
  timestamp?: string;
}

/**
 * Payment method dentro de un counterparty (referencia)
 */
export interface CounterpartyPaymentMethodReference {
  id: string;
  type: 'bank' | 'wallet';
}

/**
 * Request para crear un counterparty tipo Individual
 */
export interface CreateIndividualCounterpartyRequest {
  type: 'individual';
  firstName: string;
  middleName?: string;
  lastName: string;
  birthDate: string; // ISO 8601 format
  nationality: string; // ISO 3166-1 alpha-3 country code
  email: string;
  phone: string;
  customerId: string;
  identificationType: IdentificationType;
  identificationNumber: string;
  address: CounterpartyAddress;
  paymentMethods: any[]; // Array de payment methods a crear
  documents?: CounterpartyDocument[];
}

/**
 * Request para crear un counterparty tipo Business
 */
export interface CreateBusinessCounterpartyRequest {
  type: 'business';
  businessName: string;
  website: string;
  email: string;
  phone: string;
  customerId: string;
  identificationType: IdentificationType;
  identificationNumber: string;
  address: CounterpartyAddress;
  paymentMethods: any[]; // Array de payment methods a crear
  documents?: CounterpartyDocument[];
}

/**
 * Union type para crear cualquier tipo de counterparty
 */
export type CreateCounterpartyRequest = 
  | CreateIndividualCounterpartyRequest 
  | CreateBusinessCounterpartyRequest;

/**
 * Response de Conduit para un Individual Counterparty
 */
export interface IndividualCounterpartyResponse {
  id: string;
  type: 'individual';
  firstName: string;
  middleName?: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  email: string;
  phone: string;
  customerId: string;
  identificationType: IdentificationType;
  identificationNumber: string;
  address: CounterpartyAddress;
  paymentMethods: CounterpartyPaymentMethodReference[];
  documents?: CounterpartyDocument[];
  messages?: CounterpartyMessage[];
  status: CounterpartyStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response de Conduit para un Business Counterparty
 */
export interface BusinessCounterpartyResponse {
  id: string;
  type: 'business';
  businessName: string;
  website: string;
  email: string;
  phone: string;
  customerId: string;
  identificationType: IdentificationType;
  identificationNumber: string;
  address: CounterpartyAddress;
  paymentMethods: CounterpartyPaymentMethodReference[];
  documents?: CounterpartyDocument[];
  messages?: CounterpartyMessage[];
  status: CounterpartyStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Union type para response de cualquier tipo de counterparty
 */
export type CounterpartyResponse = 
  | IndividualCounterpartyResponse 
  | BusinessCounterpartyResponse;

/**
 * Modelo de base de datos para counterparties
 */
export interface CounterpartyDB {
  id: string;
  counterparty_id: string;
  customer_id: string;
  type: CounterpartyType;
  status: CounterpartyStatus;
  
  // Individual fields
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  birth_date?: Date;
  nationality?: string;
  
  // Business fields
  business_name?: string;
  website?: string;
  
  // Common fields
  email: string;
  phone: string;
  identification_type?: IdentificationType;
  identification_number?: string;
  address: CounterpartyAddress;
  payment_method_ids?: string[];
  document_ids?: string[];
  messages?: CounterpartyMessage[];
  metadata?: Record<string, any>;
  raw_response?: any;
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
  conduit_created_at?: Date;
  conduit_updated_at?: Date;
}

/**
 * Response para listar counterparties
 */
export interface ListCounterpartiesResponse {
  success: boolean;
  message: string;
  count: number;
  counterparties: CounterpartyResponse[];
}

/**
 * Response para obtener un counterparty
 */
export interface GetCounterpartyResponse {
  success: boolean;
  message: string;
  counterparty: CounterpartyResponse;
}

/**
 * Response para crear un counterparty
 */
export interface CreateCounterpartyResponse {
  success: boolean;
  message: string;
  counterparty: CounterpartyResponse;
}

/**
 * Filtros para listar counterparties
 */
export interface CounterpartyFilters {
  customerId?: string;
  type?: CounterpartyType;
  status?: CounterpartyStatus;
  email?: string;
}

/**
 * Datos para insertar en la base de datos
 */
export interface InsertCounterpartyData {
  counterparty_id: string;
  customer_id: string;
  type: CounterpartyType;
  status: CounterpartyStatus;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  birth_date?: string;
  nationality?: string;
  business_name?: string;
  website?: string;
  email: string;
  phone: string;
  identification_type?: IdentificationType;
  identification_number?: string;
  address: CounterpartyAddress;
  payment_method_ids?: string[];
  document_ids?: string[];
  messages?: CounterpartyMessage[];
  metadata?: Record<string, any>;
  raw_response?: any;
  conduit_created_at?: string;
  conduit_updated_at?: string;
}
