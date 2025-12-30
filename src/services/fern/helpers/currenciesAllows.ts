
const currenciesAllows = (currency: string) => {
    const currencies = ['USD', 'EUR', 'BRL', 'ARS', 'MXN', 'CLP', 'PEN', 'HKD', 'IDR', 'ILS', 'CNY', 'CAD', 'GBP', 'AUD', 'PHP'];
    return currencies.includes(currency);
}

export default currenciesAllows
