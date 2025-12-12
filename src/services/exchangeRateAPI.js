/**
 * Exchange Rate API Service
 * 
 * This service uses exchangerate-api.com v6 for historical exchange rates.
 * API Documentation: https://www.exchangerate-api.com/docs/overview
 */

const API_KEY = '12d80645fb41af2af60435c4c06bf9eb'
const API_BASE_URL = 'https://v6.exchangerate-api.com/v6'

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

    // Use exchangerate-api.com v6 for historical rates
    // Format: /v6/{api_key}/history/{date}/{base_currency}
    const response = await fetch(
      `${API_BASE_URL}/${API_KEY}/history/${formattedDate}/${fromCurrency}`
    )

    if (!response.ok) {
      // If historical endpoint fails, try latest rates as fallback
      if (response.status === 404 || response.status === 400) {
        throw new Error('Historical data not available for this date. Please try a different date.')
      }
      throw new Error('Failed to fetch exchange rate')
    }

    const data = await response.json()

    // Check for API errors
    if (data.result === 'error') {
      throw new Error(data['error-type'] || 'Failed to fetch exchange rate')
    }

    // exchangerate-api.com returns rates object with target currencies
    if (!data.conversion_rates || !data.conversion_rates.USD) {
      throw new Error('USD rate not available for the selected date')
    }

    const exchangeRate = data.conversion_rates.USD
    const convertedAmount = amount * exchangeRate

    return convertedAmount
  } catch (error) {
    // Enhanced error handling
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
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
    // Get latest rates to see available currencies
    const response = await fetch(`${API_BASE_URL}/${API_KEY}/latest/USD`)
    const data = await response.json()

    if (data.result === 'error') {
      throw new Error(data['error-type'] || 'Failed to fetch currencies')
    }

    // Return conversion rates as available currencies
    return data.conversion_rates || {}
  } catch (error) {
    throw new Error('Failed to fetch available currencies')
  }
}

