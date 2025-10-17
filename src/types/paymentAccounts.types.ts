export type PaymentAccountType = "BANK_ACCOUNT" | "EXTERNAL_WALLET" | "WALLET";

export interface BankAccountPayload {
  paymentAccountType: "BANK_ACCOUNT";
  customerId: string;
  nickname?: string;
  organizationId?: string;
  externalBankAccount: {
    bankName: string;
    bankAccountType: string;
    bankAddress: string;
    bankAccountOwner: string;
    bankAccountCurrency: string;
  };
}

export interface ExternalWalletPayload {
  paymentAccountType: "EXTERNAL_WALLET";
  customerId: string;
  nickname: string;
  cryptoWalletType: string;
  chain: string;
  address: string;
}

export interface WalletPayload {
  paymentAccountType: "WALLET";
  customerId: string;
  cryptoWalletType?: string;
}

export type PaymentAccountRequestBody =
  | BankAccountPayload
  | ExternalWalletPayload
  | WalletPayload;
