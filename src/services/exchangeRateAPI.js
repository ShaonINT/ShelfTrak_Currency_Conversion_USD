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
  
  // Try multiple APIs in sequence - all CORS-friendly
  const apis = [
    { name: 'exchangerate.host (date)', fn: () => tryExchangeRateHost(amount, fromCurrency, date) },
    { name: 'exchangerate.host (convert)', fn: () => tryExchangeRateHostConvert(amount, fromCurrency, date) },
    { name: 'exchangerate.host (latest)', fn: () => tryExchangeRateHostLatest(amount, fromCurrency) },
    { name: 'frankfurter.app (free)', fn: () => tryFrankfurter(amount, fromCurrency, date) },
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
 */
async function tryExchangeRateHost(amount, fromCurrency, date) {
  const formattedDate = date
  // Try the simple date endpoint first
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
 */
async function tryExchangeRateHostLatest(amount, fromCurrency) {
  const url = `https://api.exchangerate.host/latest?base=${fromCurrency}&symbols=USD`
  
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
 * Try exchangerate.host convert endpoint (alternative)
 */
async function tryExchangeRateHostConvert(amount, fromCurrency, date) {
  const formattedDate = date
  const url = `https://api.exchangerate.host/convert?from=${fromCurrency}&to=USD&amount=${amount}&date=${formattedDate}`
  
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
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
 * Try frankfurter.app - free API with CORS support
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
    // Get latest rates to see available currencies using CORS-friendly API
    const response = await fetch('https://api.exchangerate.host/latest?base=USD', {
      method: 'GET',
      mode: 'cors',
    })
    
    const data = await response.json()

    if (data.success === false) {
      throw new Error(data.error?.info || 'Failed to fetch currencies')
    }

    // Return conversion rates as available currencies
    return data.rates || {}
  } catch (error) {
    throw new Error('Failed to fetch available currencies')
  }
}

