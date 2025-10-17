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