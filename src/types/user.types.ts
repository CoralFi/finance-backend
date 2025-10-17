export interface CreateUserParams {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  userType: string;
  tosCoral: boolean;
  recordType: number;
  phoneNumber?: string | null;
  birthDate?: string | null;
  occupationId?: number | null;
  employmentSituationId?: number | null;
  accountPurposesId?: number | null;
  sourceFundId?: number | null;
  amountToMovedId?: number | null;
  country?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  stateRegionProvince?: string | null;
  postalCode?: string | null;
  [key: string]: any;
}

export interface UserRecord {
  user_id: string;
  email: string;
  nombre: string;
  apellido: string;
  user_type: string;
  tos_coral: boolean;
  [key: string]: any;
}
