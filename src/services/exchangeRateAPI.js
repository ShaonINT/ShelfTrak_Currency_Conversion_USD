/**
 * Exchange Rate API Service
 * 
 * This service uses exchangerate.host for free historical exchange rates.
 * Falls back to exchangerate-api.com if needed.
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
  // Try exchangerate.host first (free, reliable, good CORS support)
  try {
    const formattedDate = date
    const url = `https://api.exchangerate.host/${formattedDate}?base=${fromCurrency}&symbols=USD`
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // exchangerate.host returns success flag
    if (data.success === false) {
      throw new Error(data.error?.info || 'API returned error')
    }

    if (!data.rates || !data.rates.USD) {
      throw new Error('USD rate not available')
    }

    const exchangeRate = data.rates.USD
    const convertedAmount = amount * exchangeRate

    return convertedAmount
  } catch (error) {
    console.log('exchangerate.host failed, trying exchangerate-api.com...', error)
    
    // Fallback to exchangerate-api.com
    try {
      return await convertWithExchangeRateAPI(amount, fromCurrency, date)
    } catch (fallbackError) {
      console.error('All APIs failed:', fallbackError)
      throw new Error(
        'Unable to fetch exchange rate. Please check your internet connection and try again.'
      )
    }
  }
}

/**
 * Fallback API using exchangerate-api.com
 */
async function convertWithExchangeRateAPI(amount, fromCurrency, date) {
  const formattedDate = date
  
  // Try historical endpoint first
  let apiUrl = `${API_BASE_URL}/${API_KEY}/history/${formattedDate}/${fromCurrency}`
  
  let response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    mode: 'cors',
  })

  // If historical fails, try latest
  if (!response.ok) {
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
    throw new Error(`API request failed: ${response.status}`)
  }

  const data = await response.json()

  if (data.result === 'error') {
    throw new Error(data['error-type'] || 'API error')
  }

  if (!data.conversion_rates || !data.conversion_rates.USD) {
    throw new Error('USD rate not available')
  }

  const exchangeRate = data.conversion_rates.USD
  return amount * exchangeRate
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

