import { useState } from 'react'
import { convertCurrency } from '../services/exchangeRateAPI'

const CURRENCIES = [
  { code: 'QAR', name: 'Qatari Riyal' },
  { code: 'AED', name: 'United Arab Emirates Dirham' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'BHD', name: 'Bahraini Dinar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'KWD', name: 'Kuwaiti Dinar' },
  { code: 'MOP', name: 'Macanese Pataca' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'OMR', name: 'Omani Rial' },
  { code: 'PEN', name: 'Peruvian Sol' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'TWD', name: 'New Taiwan Dollar' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'GBP', name: 'British Pound' },
]

function CurrencyConverter() {
  const [amount, setAmount] = useState('')
  const [fromCurrency, setFromCurrency] = useState('QAR')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setResult(null)

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (!date) {
      setError('Please select a date')
      return
    }

    setLoading(true)

    try {
      const convertedAmount = await convertCurrency(
        parseFloat(amount),
        fromCurrency,
        date
      )
      const exchangeRate = convertedAmount / parseFloat(amount)
      setResult({
        originalAmount: parseFloat(amount),
        fromCurrency,
        convertedAmount,
        date,
        exchangeRate: parseFloat(exchangeRate.toFixed(7)),
      })
    } catch (err) {
      setError(err.message || 'Failed to fetch exchange rate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Get max date (today)
  const maxDate = new Date().toISOString().split('T')[0]
  // Get min date (reasonable limit - 1999-01-01 for most APIs)
  const minDate = '1999-01-01'

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              placeholder="Enter amount"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              From Currency
            </label>
            <select
              id="currency"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={minDate}
              max={maxDate}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Select a date to get the exchange rate for that day
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Converting...' : 'Convert to USD'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Conversion Result
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Original Amount:</span>
                <span className="font-semibold text-gray-800">
                  {result.originalAmount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  {result.fromCurrency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Exchange Rate:</span>
                <span className="font-semibold text-gray-800">
                  1 {result.fromCurrency} ={' '}
                  {result.exchangeRate.toLocaleString('en-US', {
                    minimumFractionDigits: 7,
                    maximumFractionDigits: 7,
                  })}{' '}
                  USD
                </span>
              </div>
              <div className="pt-2 border-t border-indigo-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">
                    Converted Amount:
                  </span>
                  <span className="text-2xl font-bold text-indigo-700">
                    ${result.convertedAmount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
              <div className="pt-2 text-xs text-gray-500">
                Rate as of: {new Date(result.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CurrencyConverter

