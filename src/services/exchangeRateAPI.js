/**
 * Exchange Rate API Service
 * 
 * This service uses exchangerate.host for free historical exchange rates.
 * exchangerate.host supports CORS and works perfectly with GitHub Pages.
 */

/**
 * Converts currency to USD based on historical exchange rate
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Currency code (e.g., 'EUR', 'GBP')
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<number>} - Converted amount in USD
 */
export async function convertCurrency(amount, fromCurrency, date) {
  // Try multiple CORS-friendly APIs in sequence
  console.log('Starting currency conversion:', { amount, fromCurrency, date })
  
  // Only use APIs that support CORS (exchangerate-api.com has CORS issues)
  const apis = [
    { name: 'exchangerate.host (timeseries)', fn: () => tryExchangeRateHost(amount, fromCurrency, date) },
    { name: 'exchangerate.host (convert)', fn: () => tryFixerIO(amount, fromCurrency, date) },
    { name: 'exchangerate.host (latest)', fn: () => tryExchangeRateHostLatest(amount, fromCurrency) },
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
  // Use the timeseries endpoint which is more reliable
  const url = `https://api.exchangerate.host/timeseries?start_date=${formattedDate}&end_date=${formattedDate}&base=${fromCurrency}&symbols=USD`
  
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

  // timeseries returns data.rates[date].USD
  const dateKey = formattedDate
  if (!data.rates || !data.rates[dateKey] || !data.rates[dateKey].USD) {
    throw new Error('USD rate not available')
  }

  const exchangeRate = data.rates[dateKey].USD
  return amount * exchangeRate
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
async function tryFixerIO(amount, fromCurrency, date) {
  // Use exchangerate.host convert endpoint
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

