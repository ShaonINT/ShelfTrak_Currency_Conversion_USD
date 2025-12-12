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
    <div className="grid md:grid-cols-2 gap-8">
      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Currency Conversion
          </h3>
          <p className="text-sm text-slate-600">
            Enter the amount, select currency and date to convert to USD
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-slate-700 mb-2"
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
              placeholder="0.00"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition text-slate-900 font-medium"
              required
            />
          </div>

          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              From Currency
            </label>
            <select
              id="currency"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition text-slate-900 font-medium bg-white"
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
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Historical Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={minDate}
              max={maxDate}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition text-slate-900 font-medium"
              required
            />
            <p className="mt-2 text-xs text-slate-500">
              Select a date to get the exchange rate for that specific day
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3.5 px-6 rounded-lg font-semibold hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Converting...
              </span>
            ) : (
              'Convert to USD'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results Card */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Conversion Result
            </h3>
            <p className="text-sm text-slate-600">
              Exchange rate and converted amount
            </p>
          </div>

          <div className="space-y-6">
            {/* Original Amount */}
            <div className="pb-4 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">Original Amount</span>
                <span className="text-lg font-semibold text-slate-900">
                  {result.originalAmount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  <span className="text-slate-600 font-normal">{result.fromCurrency}</span>
                </span>
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="pb-4 border-b border-slate-200">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-slate-600">Exchange Rate</span>
                <div className="text-right">
                  <div className="text-lg font-semibold text-slate-900">
                    1 {result.fromCurrency} =
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {result.exchangeRate.toLocaleString('en-US', {
                      minimumFractionDigits: 7,
                      maximumFractionDigits: 7,
                    })}{' '}
                    <span className="text-slate-600 font-normal text-base">USD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Converted Amount */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                  Converted Amount
                </span>
                <span className="text-3xl font-bold text-slate-900">
                  ${result.convertedAmount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Date Info */}
            <div className="pt-2">
              <p className="text-xs text-slate-500 flex items-center">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Rate as of: {new Date(result.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder when no result */}
      {!result && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-500 text-sm font-medium">Conversion results will appear here</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CurrencyConverter

