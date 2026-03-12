// Exchange rates relative to USD (base currency)
export interface ExchangeRates {
  [key: string]: number;
}

export const EXCHANGE_RATES: ExchangeRates = {
  USD: 1,        // Base currency
  INR: 0.012,    // 1 INR = 0.012 USD
  EUR: 1.08,      // 1 EUR = 1.08 USD
  GBP: 1.27,      // 1 GBP = 1.27 USD
  JPY: 0.0067,    // 1 JPY = 0.0067 USD
  CAD: 0.74,      // 1 CAD = 0.74 USD
  AUD: 0.66,      // 1 AUD = 0.66 USD
};

export const BASE_CURRENCY = 'USD';

export const convertToBaseCurrency = (amount: number, fromCurrency: string): number => {
  if (fromCurrency === BASE_CURRENCY) return amount;
  
  const rate = EXCHANGE_RATES[fromCurrency];
  if (!rate) {
    console.warn(`Exchange rate not found for currency: ${fromCurrency}`);
    return amount;
  }
  
  return amount * rate;
};

export const formatBaseCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: BASE_CURRENCY,
  }).format(amount);
};

// For future API integration
export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  try {
    // Example with exchangerate-api.com (free tier)
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return EXCHANGE_RATES; // Fallback to hardcoded rates
  }
};
