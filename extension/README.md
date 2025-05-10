# FreoBus Wallet Extension

A modern Web3 wallet extension for seamless dApp integration. Built with TypeScript and Chrome Extension Manifest V3.

## Features

- EIP-1193 compatible Web3 provider
- Modern, responsive UI
- Multi-chain support (Ethereum, Polygon, and testnets)
- Secure session management
- Real-time balance updates
- Network switching
- Auto-connect functionality

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory from the extension folder

### Development Workflow

1. Start the development server:
```bash
npm run dev
```

2. Make changes to the source files in the `src` directory
3. The extension will automatically rebuild
4. Refresh the extension in Chrome to see changes

## Project Structure

```
extension/
├── src/
│   ├── background.ts    # Background service worker
│   ├── content.ts       # Content script
│   ├── inpage.ts        # Injected provider
│   ├── popup.ts         # Popup UI logic
│   └── types.ts         # TypeScript types
├── public/
│   ├── manifest.json    # Extension manifest
│   ├── popup.html       # Popup UI
│   └── icons/           # Extension icons
├── package.json
├── tsconfig.json
└── webpack.config.js
```

## Building for Production

1. Update the version in `manifest.json`
2. Build the extension:
```bash
npm run build
```
3. The production build will be in the `dist` directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT 