export interface SignUpRequestBody {
  email: string;
  password?: string;
  nombre: string;
  apellido: string;
  userType: string;
  tosCoral: boolean;
  businessName?: string;
  phoneNumber?: string;
  birthDate?: string;
  recentOccupation?: number;
  employmentStatus?: number;
  accountPurpose?: number;
  fundsOrigin?: number;
  expectedAmount?: number;
  country?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateRegionProvince?: string;
  postalCode?: string;
  recordType: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}


export interface DeleteResponseSuccess {
  success: true;
  message: string;
}

export interface DeleteResponseError {
  success: false;
  message: string;
  status?: number;
  details?: unknown;
}
export type DeleteResponse = DeleteResponseSuccess | DeleteResponseError;



export interface FernKycUpdateSuccess {
  success: true;
  customer: any;
  kycStatus: string | null;
  kycLink: string | null;
  dbResult: any;
  responseText: string;
}

export interface FernKycUpdateError {
  success: false;
  error: {
    message: string;
    status?: number | string;
    details?: any;
    kycData?: any;
    fullError?: string;
    stack?: string;
  };
}
export type FernKycUpdateResponse = FernKycUpdateSuccess | FernKycUpdateError;
