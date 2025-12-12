# ShelfTrak Currency Conversion USD

A modern web application that converts any currency to USD based on historical exchange rates for a specific date.

## Features

- Convert any currency to USD
- Historical exchange rates for any date (back to 1999)
- Clean, modern user interface
- Real-time conversion with exchange rate display
- Support for 15+ major currencies
- Deployed on GitHub Pages

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. Enter the amount you want to convert
2. Select the source currency from the dropdown
3. Choose a date (the app will use the exchange rate from that date)
4. Click "Convert to USD" to see the result

## API

This app uses [exchangerate.host](https://exchangerate.host/) API for free historical exchange rates. The API provides:
- Free access (no API key required)
- Historical data back to 1999
- Real-time exchange rates

## Supported Currencies

- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen)
- AUD (Australian Dollar)
- CAD (Canadian Dollar)
- CHF (Swiss Franc)
- CNY (Chinese Yuan)
- INR (Indian Rupee)
- MXN (Mexican Peso)
- BRL (Brazilian Real)
- ZAR (South African Rand)
- KRW (South Korean Won)
- SGD (Singapore Dollar)
- HKD (Hong Kong Dollar)
- NZD (New Zealand Dollar)

And many more through the API!

## GitHub Pages Deployment

This app is automatically deployed to GitHub Pages using GitHub Actions. The workflow triggers on every push to the `main` branch.

To enable GitHub Pages:
1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select "GitHub Actions"
4. The app will be available at: `https://shaonint.github.io/ShelfTrak_Currency_Conversion_USD/`

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- exchangerate.host API
- GitHub Actions (for CI/CD)

## License

MIT
