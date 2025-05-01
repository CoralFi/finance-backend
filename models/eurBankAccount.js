class EurBankAccount {
    constructor(accountName, bankName, bic, iban, accountHolderName, customer) {
        this.accountName = accountName;
        this.bankName = bankName;
        this.accountHolderName = accountHolderName;
        this.customer = customer;
        this.bic = bic;
        this.iban = iban;
    }
}

export default EurBankAccount;