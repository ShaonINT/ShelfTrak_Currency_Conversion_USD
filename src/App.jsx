import CurrencyConverter from './components/CurrencyConverter'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header matching Shelftrak style */}
      <header className="bg-slate-900 text-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold tracking-tight">Shelftrak</h1>
              <span className="text-slate-400 text-sm font-medium">Currency Conversion USD</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Convert currencies to USD
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get accurate historical exchange rates with precision to 7 decimal places. 
              Track currency conversions for any date since 1999.
            </p>
          </div>

          {/* Converter Component */}
          <CurrencyConverter />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-slate-600 text-sm">
            <p>© Shelftrak Currency Conversion USD. Powered by ExchangeRate-API.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

