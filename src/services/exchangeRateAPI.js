/**
 * Exchange Rate API Service
 * 
 * Uses multiple free APIs with CORS support for historical exchange rates.
 */

const API_KEY = '12d80645fb41af2af60435c4c06bf9eb'

/**
 * Converts currency to USD based on historical exchange rate
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Currency code (e.g., 'EUR', 'GBP')
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<number>} - Converted amount in USD
 */
export async function convertCurrency(amount, fromCurrency, date) {
  console.log('Starting currency conversion:', { amount, fromCurrency, date })
  
  // Check if date is in the future - if so, use latest rates
  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isFutureDate = selectedDate > today
  
  // If future date, use latest rates; otherwise try historical first
  const apis = isFutureDate
    ? [
        { name: 'frankfurter.app (latest)', fn: () => tryFrankfurterLatest(amount, fromCurrency) },
        { name: 'exchangerate.host (latest)', fn: () => tryExchangeRateHostLatest(amount, fromCurrency) },
      ]
    : [
        { name: 'frankfurter.app', fn: () => tryFrankfurter(amount, fromCurrency, date) },
        { name: 'exchangerate.host (latest)', fn: () => tryExchangeRateHostLatest(amount, fromCurrency) },
        { name: 'exchangerate.host (date)', fn: () => tryExchangeRateHost(amount, fromCurrency, date) },
      ]

  let lastError = null
  
  for (const api of apis) {
    try {
      console.log(`Trying ${api.name}...`)
      const result = await api.fn()
      console.log(`Success with ${api.name}:`, result)
      return result
    } catch (error) {
      console.error(`${api.name} failed:`, error.message)
      lastError = error
      // Continue to next API
    }
  }

  // All APIs failed
  console.error('All API attempts failed. Last error:', lastError)
  const errorMessage = lastError?.message || 'Unknown error'
  throw new Error(
    `Unable to fetch exchange rate. ${errorMessage}`
  )
}

/**
 * Try exchangerate.host API - using simple date endpoint
 * Note: exchangerate.host may require API key now, so this might fail
 */
async function tryExchangeRateHost(amount, fromCurrency, date) {
  const formattedDate = date
  
  // Try the simple date endpoint
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
 * Try exchangerate.host with latest rates (fallback if historical fails)
 * Note: This may require API key now
 */
async function tryExchangeRateHostLatest(amount, fromCurrency) {
  // Try exchangerate-api.com through a CORS proxy or use alternative
  // For now, skip this as it requires API key
  throw new Error('API requires key')
}

/**
 * Try frankfurter.app latest endpoint (for future dates)
 */
async function tryFrankfurterLatest(amount, fromCurrency) {
  const url = `https://api.frankfurter.app/latest?from=${fromCurrency}&to=USD`
  
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const data = await response.json()

  if (!data.rates || !data.rates.USD) {
    throw new Error('USD rate not available')
  }

  return amount * data.rates.USD
}

/**
 * Try frankfurter.app - free API with CORS support (most reliable)
 * Supports historical data back to 1999
 */
async function tryFrankfurter(amount, fromCurrency, date) {
  const formattedDate = date
  const url = `https://api.frankfurter.app/${formattedDate}?from=${fromCurrency}&to=USD`
  
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const data = await response.json()

  if (!data.rates || !data.rates.USD) {
    throw new Error('USD rate not available')
  }

  return amount * data.rates.USD
}


/**
 * Get available currencies
 * @returns {Promise<Object>} - Object with currency codes and names
 */
export async function getAvailableCurrencies() {
  try {
    // Get latest rates to see available currencies using frankfurter.app
    const response = await fetch('https://api.frankfurter.app/latest?from=USD', {
      method: 'GET',
      mode: 'cors',
    })
    
    const data = await response.json()

    if (!data.rates) {
      throw new Error('Failed to fetch currencies')
    }

    // Return conversion rates as available currencies
    return data.rates || {}
  } catch (error) {
    throw new Error('Failed to fetch available currencies')
  }
}

