class TransactionBO {
    constructor(asset, source, destination, amount) {
        this.asset = asset;
        this.source = source;
        this.destination = destination;
        this.amount = amount;
    }
}

export default TransactionBO;