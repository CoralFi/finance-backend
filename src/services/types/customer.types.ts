export interface CustomerUser {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  verificatedEmail: boolean;
  phoneNumber: string | null;
  birthDate: string | null;
}

export interface EmploymentStatus {
  employmentStatus: string | null;
  esLabel: string | null;
  enLabel: string | null;
}

export interface MostRecentOccupation {
  occupationCode: string | null;
  occupationName: string | null;
  esLabel: string | null;
  enLabel: string | null;
}

export interface SourceOfFunds {
  sourceOfFunds: string | null;
  esLabel: string | null;
  enLabel: string | null;
}

export interface AccountPurpose {
  accountPurpose: string | null;
  esLabel: string | null;
  enLabel: string | null;
}

export interface ExpectedMonthlyPayments {
  expectedMonthlyPaymentsUsd: string | null;
  esLabel: string | null;
  enLabel: string | null;
}

export interface FernInfo {
  fernCustomerId: string | null;
  fernWalletId: string | null;
  kyc: string | null;
  kycLink: string | null;
}

export interface CustomerTotalInfo {
  user: CustomerUser;
  employmentStatus: EmploymentStatus;
  mostRecentOccupation: MostRecentOccupation;
  sourceOfFunds: SourceOfFunds;
  accountPurpose: AccountPurpose;
  expectedMonthlyPaymentsUsd: ExpectedMonthlyPayments;
  isIntermediary: boolean;
  fern: FernInfo;
  user_info: boolean;
}

export interface RawCustomerData {
  name: string | null;
  last_name: string | null;
  email: string | null;
  verificated_email: boolean;
  phone_number: string | null;
  birth_date: string | null;
  country: string | null;
  state_region_province: string | null;
  city: string | null;
  postal_code: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  occupations: string | null;
  occupation_code: string | null;
  occupation_label: string | null;
  occupation_label_en: string | null;
  employment_situation: string | null;
  employment_situation_label: string | null;
  employment_situation_label_en: string | null;
  source_fund: string | null;
  source_fund_label: string | null;
  source_fund_label_en: string | null;
  account_purposes: string | null;
  account_purposes_label: string | null;
  account_purposes_label_en: string | null;
  amount_to_moved: string | null;
  amount_to_moved_label: string | null;
  amount_to_moved_label_en: string | null;
  fernCustomerId: string | null;
  fernWalletId: string | null;
  Kyc: string | null;
  KycLink: string | null;
}
