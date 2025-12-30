
const currenciesAllows = (currency: string) => {
    const currencies = ['USD', 'EUR', 'BRL', 'ARS', 'MXN', 'CLP', 'PEN', 'HKD', 'IDR', 'ILS', 'CNY', 'CAD', 'GBP', 'AUD', 'PHP', 'BOB', 'CRC', 'COP', 'DOP', 'JPY', 'SGD', 'PLN', 'CZK', 'DKK', 'NOK', 'RON', 'SEK', 'EGP', 'SAR', 'AED'];
    return currencies.includes(currency);
}

export default currenciesAllows
