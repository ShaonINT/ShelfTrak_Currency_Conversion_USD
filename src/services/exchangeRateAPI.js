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
  // Try multiple APIs in sequence with detailed logging
  console.log('Starting currency conversion:', { amount, fromCurrency, date })
  
  const apis = [
    { name: 'exchangerate.host', fn: () => tryExchangeRateHost(amount, fromCurrency, date) },
    { name: 'exchangerate-api.com', fn: () => tryExchangeRateAPI(amount, fromCurrency, date) },
    { name: 'exchangerate.host convert', fn: () => tryFixerIO(amount, fromCurrency, date) },
  ]

  let lastError = null
  
  for (const api of apis) {
    try {
      console.log(`Trying ${api.name}...`)
      const result = await api.fn()
      console.log(`Success with ${api.name}:`, result)
      return result
    } catch (error) {
      console.error(`${api.name} failed:`, error.message, error)
      lastError = error
      // Continue to next API
    }
  }

  // All APIs failed - provide detailed error
  console.error('All API attempts failed. Last error:', lastError)
  const errorMessage = lastError?.message || 'Unknown error'
  throw new Error(
    `Unable to fetch exchange rate (${errorMessage}). Please check your internet connection and try again.`
  )
}

/**
 * Try exchangerate.host API
 */
async function tryExchangeRateHost(amount, fromCurrency, date) {
  const formattedDate = date
  const url = `https://api.exchangerate.host/${formattedDate}?base=${fromCurrency}&symbols=USD`
  
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const data = await response.json()

  if (data.success === false) {
    throw new Error(data.error?.info || 'API error')
  }

  if (!data.rates || !data.rates.USD) {
    throw new Error('USD rate not available')
  }

  return amount * data.rates.USD
}

/**
 * Try exchangerate-api.com with API key
 */
async function tryExchangeRateAPI(amount, fromCurrency, date) {
  // Try latest endpoint first (more reliable)
  let apiUrl = `${API_BASE_URL}/${API_KEY}/latest/${fromCurrency}`
  
  let response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    mode: 'cors',
  })

  // If latest works, use it; otherwise try historical
  if (!response.ok) {
    const formattedDate = date
    apiUrl = `${API_BASE_URL}/${API_KEY}/history/${formattedDate}/${fromCurrency}`
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

  return amount * data.conversion_rates.USD
}

/**
 * Try fixer.io format (alternative)
 */
async function tryFixerIO(amount, fromCurrency, date) {
  // Use exchangerate.host with different endpoint format
  const formattedDate = date
  const url = `https://api.exchangerate.host/convert?from=${fromCurrency}&to=USD&amount=${amount}&date=${formattedDate}`
  
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const data = await response.json()

  if (data.success === false || !data.result) {
    throw new Error('Conversion failed')
  }

  return data.result
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

