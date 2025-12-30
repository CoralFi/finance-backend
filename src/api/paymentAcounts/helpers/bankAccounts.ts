export const CURRENCY_CONFIG = {
  EUR: {
    requiredFields: ['iban', 'bicSwift'],
    paymentMethod: 'SEPA',
    errorMessage: 'iban y bicSwift son requeridos para cuentas EUR'
  },
  USD: {
    requiredFields: ['accountNumber', 'routingNumber'],
    paymentMethod: null,
    errorMessage: 'accountNumber y routingNumber son requeridos para cuentas USD'
  },
  ARS: {
    requiredFields: ['accountNumber', 'taxNumber'],
    paymentMethod: 'AR_TRANSFERS_3',
    errorMessage: 'accountNumber (CBU) y taxNumber (CUIT/CUIL) son requeridos para ARS'
  },
  MXN: {
    requiredFields: ['clabeNumber'],
    paymentMethod: 'MX_SPEI',
    errorMessage: 'clabeNumber es requerido para cuentas MXN'
  },
  BRL: {
    requiredFields: ['pixCode'],
    paymentMethod: null,
    errorMessage: 'pixCode es requerido para cuentas BRL'
  },
  CNY: {
    requiredFields: ['cnapsCode', 'accountNumber'],
    paymentMethod: 'CN_CNAPS',
    errorMessage: 'cnapsCode y accountNumber son requeridos para cuentas CNY'
  },
  CAD: {
    requiredFields: ['accountNumber', 'institutionNumber', 'transitNumber'],
    paymentMethod: 'CA_INTERAC',
    errorMessage: 'accountNumber, institutionNumber y transitNumber son requeridos para cuentas CAD'
  },
  GBP: {
    requiredFields: ['accountNumber', 'sortCode', 'iban'],
    paymentMethod: 'GB_BACS_CHAPS_FPS',
    errorMessage: 'accountNumber, sortCode y iban son requeridos para cuentas GBP'
  },
  AUD: {
    requiredFields: ['accountNumber', 'bsbNumber',],
    paymentMethod: 'AU_BECS',
    errorMessage: 'accountNumber, sortCode y iban son requeridos para cuentas GBP'
  },
  PEN: {
    requiredFields: ['accountNumber', 'taxNumber'],
    paymentMethod: 'PE_CCE',
    errorMessage: 'accountNumber y taxNumber son requeridos para cuentas PEN'
  },
  CLP: {
    requiredFields: ['accountNumber'],
    paymentMethod: 'CL_TEF',
    errorMessage: 'accountNumber es requerido para cuentas CLP'
  },
  HKD: {
    requiredFields: ['accountNumber', 'clearingCode'],
    paymentMethod: 'HK_HKICL_CHATS_ECG',
    errorMessage: 'accountNumber y clearingCode son requeridos para cuentas HK_HKICL_CHATS_ECG'
  },
  IDR: {
    requiredFields: ['accountNumber', 'bankCode'],
    paymentMethod: 'ID_SKN_RTGS',
    errorMessage: 'accountNumber y bankCode son requeridos para cuentas ID_SKN_RTGS'
  },
  ILS: {
    requiredFields: ['accountNumber', 'iban'],
    paymentMethod: 'IL_ZAHAV',
    errorMessage: 'accountNumber y iban son requeridos para cuentas IL_ZAHAV'
  },
  PHP: {
    requiredFields: ['accountNumber', 'bankCode'],
    paymentMethod: 'PH_INSTAPAY_PESONET',
    errorMessage: 'accountNumber y bankCode son requeridos para cuentas PHP'
  },
};

export const validateCurrencyFields = (currency, externalBankAccount) => {
  const config = CURRENCY_CONFIG[currency];
  if (!config) {
    throw new Error(`Moneda no soportada: ${currency}`);
  }

  for (const field of config.requiredFields) {
    if (!externalBankAccount[field]) {
      throw new Error(config.errorMessage);
    }
  }
};

export const buildExternalBankAccount = (currency, data) => {
  const { externalBankAccount } = data;
  const { bankName, bankAccountType, bankAddress, bankAccountOwner } = externalBankAccount;

  const baseAccount = {
    bankName,
    bankAccountCurrency: currency,
    bankAccountType,
    bankAddress,
    bankAccountOwner
  };

  switch (currency) {
    case 'EUR':
      return {
        ...baseAccount,
        iban: externalBankAccount.iban,
        bicSwift: externalBankAccount.bicSwift,
        bankAccountPaymentMethod: 'SEPA'
      };

    case 'USD':
      return {
        ...baseAccount,
        accountNumber: externalBankAccount.accountNumber,
        routingNumber: externalBankAccount.routingNumber,
        bankAccountPaymentMethod: externalBankAccount.bankAccountPaymentMethod,
        bicSwift: externalBankAccount.bicSwift || undefined
      };

    case 'ARS':
      return {
        ...baseAccount,
        accountNumber: externalBankAccount.accountNumber,
        taxNumber: externalBankAccount.taxNumber,
        bankAccountPaymentMethod: 'AR_TRANSFERS_3'
      };

    case 'MXN':
      return {
        ...baseAccount,
        bankAccountType: bankAccountType || 'CHECKING',
        clabeNumber: externalBankAccount.clabeNumber,
        bankAccountPaymentMethod: 'MX_SPEI',
        bicSwift: externalBankAccount.bicSwift || undefined
      };

    case 'BRL':
      return {
        ...baseAccount,
        bankAccountType: bankAccountType || 'CHECKING',
        pixCode: externalBankAccount.pixCode,
        bankAccountPaymentMethod: externalBankAccount.bankAccountPaymentMethod,
        taxNumber: externalBankAccount.taxNumber
      };

    case 'CNY':
      return {
        ...baseAccount,
        bankAccountType: bankAccountType || 'CHECKING',
        cnapsCode: externalBankAccount.cnapsCode,
        accountNumber: externalBankAccount.accountNumber,
        bicSwift: externalBankAccount.bicSwift || undefined,
        bankAccountPaymentMethod: 'CN_CNAPS'
      };

    case 'CAD':
      return {
        ...baseAccount,
        bankAccountType: bankAccountType || 'CHECKING',
        accountNumber: externalBankAccount.accountNumber,
        institutionNumber: externalBankAccount.institutionNumber,
        transitNumber: externalBankAccount.transitNumber,
        bicSwift: externalBankAccount?.bicSwift || undefined,
        bankAccountPaymentMethod: 'CA_INTERAC'
      };

    case 'GBP':
      return {
        ...baseAccount,
        bankAccountType: bankAccountType || 'CHECKING',
        accountNumber: externalBankAccount.accountNumber,
        sortCode: externalBankAccount.sortCode,
        iban: externalBankAccount.iban,
        bicSwift: externalBankAccount?.bicSwift || undefined,
        bankAccountPaymentMethod: 'GB_BACS_CHAPS_FPS'
      };

    case 'AUD':
      return {
        ...baseAccount,
        bankAccountType: bankAccountType || 'CHECKING',
        accountNumber: externalBankAccount.accountNumber,
        bsbNumber: externalBankAccount.bsbNumber,
        bicSwift: externalBankAccount?.bicSwift || undefined,
        bankAccountPaymentMethod: 'AU_BECS'
      };

    case 'PEN':
      return {
        ...baseAccount,
        bankAccountType: bankAccountType || 'CHECKING',
        accountNumber: externalBankAccount.accountNumber,
        taxNumber: externalBankAccount.taxNumber,
        bankAccountPaymentMethod: 'PE_CCE'
      };

    case 'CLP':
      return {
        ...baseAccount,
        bankAccountType: bankAccountType || 'CHECKING',
        accountNumber: externalBankAccount.accountNumber,
        bankAccountPaymentMethod: 'CL_TEF'
      };
    case 'HKD':
      return {
        ...baseAccount,
        bankAccountType: bankAccountType || 'CHECKING',
        accountNumber: externalBankAccount.accountNumber,
        clearingCode: externalBankAccount.clearingCode,
        bankAccountPaymentMethod: 'HK_HKICL_CHATS_ECG'
      };
    case 'IDR':
      return {
        ...baseAccount,
        bankAccountType: bankAccountType || 'CHECKING',
        accountNumber: externalBankAccount.accountNumber,
        bankCode: externalBankAccount.bankCode,
        bankAccountPaymentMethod: 'ID_SKN_RTGS'
      };
    case 'ILS':
      return {
        ...baseAccount,
        bankAccountType: bankAccountType || 'CHECKING',
        accountNumber: externalBankAccount.accountNumber,
        iban: externalBankAccount.iban,
        bankAccountPaymentMethod: 'IL_ZAHAV'
      };
    case 'PHP':
      return {
        ...baseAccount,
        bankAccountType: bankAccountType || 'CHECKING',
        accountNumber: externalBankAccount.accountNumber,
        bankCode: externalBankAccount.bankCode,
        bankAccountPaymentMethod: 'PH_INSTAPAY_PESONET'
      };
    default:
      throw new Error(`Moneda no soportada: ${currency}`);
  }
};
