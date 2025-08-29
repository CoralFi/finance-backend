// Currency-specific configuration
export const CURRENCY_CONFIG = {
  EUR: {
    requiredFields: ['iban', 'bicSwift'],
    paymentMethod: 'SEPA',
    errorMessage: 'iban y bicSwift son requeridos para cuentas EUR'
  },
  USD: {
    requiredFields: ['accountNumber', 'routingNumber'],
    paymentMethod: null, // Dynamic from request
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
    paymentMethod: null, // Dynamic from request
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
    requiredFields: ['accountNumber', 'bsbNumber', ],
    paymentMethod: 'AU_BECS',
    errorMessage: 'accountNumber, sortCode y iban son requeridos para cuentas GBP'
  }
};

// Validation function for currency-specific fields
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

// Bank account builder function
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
        taxNumber: externalBankAccount.taxNumber // CPF/CNPJ if provided
      };
      
    case 'CNY':
      return {
        ...baseAccount,
        bankAccountType: bankAccountType || 'CHECKING',
        cnapsCode: externalBankAccount.cnapsCode,
        accountNumber: externalBankAccount.accountNumber,
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
      
    default:
      throw new Error(`Moneda no soportada: ${currency}`);
  }
};
