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
 * Alternative API using exchangerate.host with correct API format
 * Based on official API documentation: http://api.exchangerate.host/
 * Format: historical?access_key=KEY&date=YYYY-MM-DD&source=CURRENCY&currencies=USD&format=1
 */
async function tryAlternativeAPI(amount, fromCurrency, date, isFutureDate) {
  const API_KEY = '12d80645fb41af2af60435c4c06bf9eb'
  const BASE_URL = 'http://api.exchangerate.host'
  
  // Try 1: Historical endpoint (for past dates)
  if (!isFutureDate) {
    try {
      // Format: historical?access_key=KEY&date=YYYY-MM-DD&source=CURRENCY&currencies=USD&format=1
      const historicalUrl = `${BASE_URL}/historical?access_key=${API_KEY}&date=${date}&source=${fromCurrency}&currencies=USD&format=1`
      
      const response = await fetch(historicalUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
      })

      if (response.ok) {
        const data = await response.json()
        
        // Response format: { success: true, quotes: { "QARUSD": rate } }
        if (data.success === true && data.quotes) {
          const quoteKey = `${fromCurrency}USD`
          if (data.quotes[quoteKey]) {
            console.log('exchangerate.host (historical) succeeded')
            return amount * data.quotes[quoteKey]
          }
        }
      }
    } catch (error) {
      console.log('exchangerate.host historical failed, trying live endpoint...', error.message)
    }
  }
  
  // Try 2: Live endpoint (for latest rates or fallback)
  try {
    // Format: live?access_key=KEY&source=CURRENCY&currencies=USD&format=1
    const liveUrl = `${BASE_URL}/live?access_key=${API_KEY}&source=${fromCurrency}&currencies=USD&format=1`
    
    const response = await fetch(liveUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
    })

    if (response.ok) {
      const data = await response.json()
      
      // Response format: { success: true, quotes: { "QARUSD": rate } }
      if (data.success === true && data.quotes) {
        const quoteKey = `${fromCurrency}USD`
        if (data.quotes[quoteKey]) {
          console.log('exchangerate.host (live) succeeded')
          return amount * data.quotes[quoteKey]
        }
      }
    }
  } catch (error) {
    console.log('exchangerate.host live failed:', error.message)
  }
  
  // Try 3: Convert endpoint (alternative method)
  try {
    // Format: convert?access_key=KEY&from=CURRENCY&to=USD&amount=AMOUNT
    const convertUrl = `${BASE_URL}/convert?access_key=${API_KEY}&from=${fromCurrency}&to=USD&amount=${amount}`
    
    const response = await fetch(convertUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
    })

    if (response.ok) {
      const data = await response.json()
      
      if (data.success === true && data.result !== undefined) {
        console.log('exchangerate.host (convert) succeeded')
        return data.result
      }
    }
  } catch (error) {
    console.log('exchangerate.host convert failed:', error.message)
  }
  
  throw new Error('All exchangerate.host endpoints failed')
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
