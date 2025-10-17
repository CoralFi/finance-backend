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
customer_id: string;
user_id: string;
email: string;
nombre: string;
apellido: string;
user_type: string;
tos_coral: boolean;
phone_number: string | null;
birthdate: string | null;
occupation_id: number | null;
employment_situation_id: number | null;
account_purposes_id: number | null;
source_fund_id: number | null;
amount_to_moved_id: number | null;
country: string | null;
address_line_1: string | null;
address_line_2: string | null;
city: string | null;
state_region_province: string | null;
postal_code: string | null;
user_info_created: boolean | null;
}
