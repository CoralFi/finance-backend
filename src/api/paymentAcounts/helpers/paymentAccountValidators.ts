import { BankAccountPayload } from "../../../types/paymentAccounts.types";


export const validateBasicData = (data: BankAccountPayload): string => {
  if (!data) throw new Error("No se proporcionó ningún dato");
  const currency = data.externalBankAccount?.bankAccountCurrency;
  if (!data.customerId || !currency)
    throw new Error("customerId y bankAccountCurrency son requeridos");
  return currency;
};

export const validateCommonFields = (
  externalBankAccount: BankAccountPayload["externalBankAccount"]
): void => {
  const { bankName, bankAccountType, bankAddress, bankAccountOwner } =
    externalBankAccount;
  if (!bankName || !bankAccountType || !bankAddress || !bankAccountOwner)
    throw new Error(
      "bankName, bankAccountType, bankAddress y bankAccountOwner son requeridos."
    );
};

