# Local Development Setup Instructions

## Step 1: Install Node.js

If Node.js is not installed on your system, you need to install it first:

1. **Download Node.js:**
   - Go to https://nodejs.org/
   - Download the LTS (Long Term Support) version for Windows
   - Run the installer and follow the setup wizard
   - Make sure to check "Add to PATH" during installation

2. **Verify Installation:**
   - Close and reopen your terminal/PowerShell
   - Run: `node --version`
   - Run: `npm --version`
   - Both commands should show version numbers

## Step 2: Install Project Dependencies

Once Node.js is installed, navigate to the project directory and run:

```bash
npm install
```

This will install all required dependencies (React, Vite, Tailwind CSS, etc.)

## Step 3: Start the Development Server

After dependencies are installed, start the development server:

```bash
npm run dev
```

## Step 4: View the App

The development server will start and show you a URL, typically:
- **Local:** http://localhost:5173
- **Network:** http://192.168.x.x:5173 (for access from other devices)

Open this URL in your web browser to see the app running locally.

## Troubleshooting

### If `npm` command is not recognized:
- Make sure Node.js is installed
- Restart your terminal/PowerShell
- Check if Node.js is in your PATH: `echo $env:PATH` (PowerShell)

### If port 5173 is already in use:
- The terminal will show an error
- You can change the port by editing `vite.config.js` or using: `npm run dev -- --port 3000`

### If you see build errors:
- Make sure all files are saved
- Try deleting `node_modules` folder and running `npm install` again

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Notes

- The development server will automatically reload when you make changes to the code
- Press `Ctrl+C` in the terminal to stop the development server
- The app will be available at http://localhost:5173 by default

