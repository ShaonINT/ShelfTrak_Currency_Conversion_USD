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

    // Try exchangerate-api.com v6 first
    // Format: /v6/{api_key}/history/{date}/{base_currency}
    let apiUrl = `${API_BASE_URL}/${API_KEY}/history/${formattedDate}/${fromCurrency}`
    
    let response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
    })

    // If historical endpoint fails, try latest rates
    if (!response.ok || response.status === 404 || response.status === 400) {
      console.log('Historical endpoint failed, trying latest rates...')
      apiUrl = `${API_BASE_URL}/${API_KEY}/latest/${fromCurrency}`
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
      })
    }

    if (!response.ok) {
      // Try alternative API as fallback
      console.log('Primary API failed, trying alternative API...')
      return await convertCurrencyAlternative(amount, fromCurrency, date)
    }

    const data = await response.json()

    // Check for API errors
    if (data.result === 'error') {
      // Try alternative API
      return await convertCurrencyAlternative(amount, fromCurrency, date)
    }

    // exchangerate-api.com returns rates object with target currencies
    if (!data.conversion_rates || !data.conversion_rates.USD) {
      // Try alternative API
      return await convertCurrencyAlternative(amount, fromCurrency, date)
    }

    const exchangeRate = data.conversion_rates.USD
    const convertedAmount = amount * exchangeRate

    return convertedAmount
  } catch (error) {
    console.error('Primary API error:', error)
    // Try alternative API as fallback
    try {
      return await convertCurrencyAlternative(amount, fromCurrency, date)
    } catch (altError) {
      // Enhanced error handling
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') || 
          error.message.includes('CORS') ||
          error.name === 'TypeError') {
        throw new Error(
          'Unable to connect to exchange rate service. Please check your internet connection and try again.'
        )
      }
      throw error
    }
  }
}

/**
 * Alternative API fallback using exchangerate.host
 */
async function convertCurrencyAlternative(amount, fromCurrency, date) {
  try {
    const formattedDate = date
    const response = await fetch(
      `https://api.exchangerate.host/${formattedDate}?base=${fromCurrency}&symbols=USD`,
      {
        method: 'GET',
        mode: 'cors',
      }
    )

    if (!response.ok) {
      throw new Error('Alternative API request failed')
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
    throw new Error('Unable to fetch exchange rate. Please try again later.')
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

