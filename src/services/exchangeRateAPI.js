/**
 * Exchange Rate API Service
 * 
 * Uses frankfurter.app - free API with CORS support for historical exchange rates.
 * Supports historical data back to 1999.
 */

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
  const selectedDate = new Date(date + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isFutureDate = selectedDate > today
  
  // Try frankfurter.app first, if it fails (404 = currency not supported), try alternative
  try {
    let result
    if (isFutureDate) {
      console.log('Date is in the future, using latest rates...')
      result = await tryFrankfurterLatest(amount, fromCurrency)
    } else {
      console.log('Trying historical rates...')
      try {
        result = await tryFrankfurter(amount, fromCurrency, date)
      } catch (error) {
        // If historical fails, fallback to latest
        console.log('Historical failed, using latest rates...')
        result = await tryFrankfurterLatest(amount, fromCurrency)
      }
    }
    console.log('Conversion successful:', result)
    return result
  } catch (error) {
    // If frankfurter fails (likely currency not supported), try alternative API
    console.log('frankfurter.app failed, trying alternative API...', error.message)
    try {
      return await tryAlternativeAPI(amount, fromCurrency, date, isFutureDate)
    } catch (altError) {
      console.error('All API attempts failed:', altError)
      throw new Error(
        `Unable to fetch exchange rate for ${fromCurrency}. The currency may not be supported, or please check your internet connection and try again.`
      )
    }
  }
}

/**
 * Alternative API using exchangerate-api.com through CORS proxy or direct call
 */
async function tryAlternativeAPI(amount, fromCurrency, date, isFutureDate) {
  // Use exchangerate-api.com with your API key
  // Since it has CORS issues, we'll try it anyway - some browsers might allow it
  const API_KEY = '12d80645fb41af2af60435c4c06bf9eb'
  const API_BASE_URL = 'https://v6.exchangerate-api.com/v6'
  
  let apiUrl
  if (isFutureDate) {
    apiUrl = `${API_BASE_URL}/${API_KEY}/latest/${fromCurrency}`
  } else {
    apiUrl = `${API_BASE_URL}/${API_KEY}/history/${date}/${fromCurrency}`
  }
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    mode: 'cors',
  })

  if (!response.ok) {
    // If CORS fails, try latest as fallback
    if (!isFutureDate) {
      apiUrl = `${API_BASE_URL}/${API_KEY}/latest/${fromCurrency}`
      const latestResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
      })
      
      if (latestResponse.ok) {
        const data = await latestResponse.json()
        if (data.conversion_rates && data.conversion_rates.USD) {
          return amount * data.conversion_rates.USD
        }
      }
    }
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
 * Try frankfurter.app latest endpoint (for future dates or fallback)
 */
async function tryFrankfurterLatest(amount, fromCurrency) {
  const url = `https://api.frankfurter.app/latest?from=${fromCurrency}&to=USD`
  
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
  })

  if (!response.ok) {
    // If 404, the currency might not be supported by frankfurter
    if (response.status === 404) {
      throw new Error(`Currency ${fromCurrency} not supported by this API`)
    }
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
