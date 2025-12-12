/**
 * Exchange Rate API Service
 * 
 * This service uses exchangerate-api.com which provides free historical exchange rates.
 * For production use, you may want to:
 * 1. Sign up for a free API key at https://www.exchangerate-api.com/
 * 2. Replace the base URL with your API key
 * 3. Or use another service like fixer.io, exchangerate.host, etc.
 */

const API_BASE_URL = 'https://api.exchangerate-api.com/v4'

/**
 * Converts currency to USD based on historical exchange rate
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Currency code (e.g., 'EUR', 'GBP')
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<number>} - Converted amount in USD
 */
export async function convertCurrency(amount, fromCurrency, date) {
  try {
    // Format date for API (YYYY-MM-DD)
    const formattedDate = date

    // exchangerate-api.com v4 doesn't support historical dates directly
    // We'll use exchangerate.host which provides free historical data
    const response = await fetch(
      `https://api.exchangerate.host/${formattedDate}?base=${fromCurrency}&symbols=USD`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate')
    }

    const data = await response.json()

    if (!data.success && data.success !== undefined) {
      throw new Error(data.error?.info || 'Failed to fetch exchange rate')
    }

    if (!data.rates || !data.rates.USD) {
      throw new Error('USD rate not available for the selected date')
    }

    const exchangeRate = data.rates.USD
    const convertedAmount = amount * exchangeRate

    return convertedAmount
  } catch (error) {
    // Fallback: Try alternative API
    if (error.message.includes('Failed to fetch')) {
      throw new Error(
        'Network error. Please check your internet connection and try again.'
      )
    }
    throw error
  }
}

/**
 * Get available currencies
 * @returns {Promise<Object>} - Object with currency codes and names
 */
export async function getAvailableCurrencies() {
  try {
    const response = await fetch('https://api.exchangerate.host/symbols')
    const data = await response.json()

    if (!data.success) {
      throw new Error('Failed to fetch currencies')
    }

    return data.symbols
  } catch (error) {
    throw new Error('Failed to fetch available currencies')
  }
}

