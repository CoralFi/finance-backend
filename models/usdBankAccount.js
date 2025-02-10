class UsdBankAccount {
    constructor(accountNumber, routingNumber, accountType, accountName, bankName, accountHolderName, customer) {
        this.accountNumber = accountNumber;
        this.routingNumber = routingNumber;
        this.accountType = accountType;
        this.accountName = accountName;
        this.bankName = bankName;
        this.accountHolderName = accountHolderName;
        this.customer = customer;
    }
}

export default UsdBankAccount;