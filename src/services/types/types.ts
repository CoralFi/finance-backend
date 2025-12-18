export interface FernUser {
  customer_id: number;
  fernCustomerId: string;
  fernWalletId: string;
  kyc: string;
  kycStatus: string;
  businessname: string;
  organizationid: string;
}

export interface UserInfo {
  customer_id: number;
  user_id: number;
  password?: string;
  email?: string;
  nombre?: string;
  apellido?: string;
  user_type?: string;
  verificado_email?: boolean;
  google_auth?: boolean;
  tos_coral?: boolean;
  fern?: FernUser;
  conduit_id?: string;
  conduit?: any;
}