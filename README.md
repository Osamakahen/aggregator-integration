# FreoBus Web3 Integration Platform

## Overview

FreoBus is a comprehensive Web3 integration platform that combines a Next.js web application with a Chrome extension to provide seamless decentralized application (dApp) interactions. The platform includes a DEX aggregator, wallet management, and cross-dApp communication capabilities.

## Project Structure

The project is organized into three main components:

1. **Web Application** (`src/`): A Next.js application providing the main user interface
   - Wallet management
   - DEX aggregator interface
   - dApp integration hub

2. **Chrome Extension** (`freobus-extension/`): Browser extension for secure wallet operations
   - Secure key management
   - Transaction signing
   - Cross-dApp communication

3. **Deployment Package** (`freobus-deploy/`): Production-ready deployment configuration
   - Vercel deployment setup
   - CI/CD workflows
   - Environment configuration

## Features

### Core Functionality
- **DEX Aggregator**
  - Multi-DEX liquidity aggregation
  - Optimal route finding
  - Price impact minimization
  - Gas optimization

- **Wallet Management**
  - Secure key storage
  - Multi-chain support
  - Transaction signing
  - Account management

- **Cross-dApp Communication**
  - Secure message passing
  - Session management
  - State synchronization
  - Error recovery

### Security Features
- MEV protection
- Transaction validation
- Price impact limits
- Gas optimization
- Error recovery system

## Getting Started

### Prerequisites
- Node.js >= 14.0.0
- Chrome browser (for extension development)
- Ethereum node access (Infura, Alchemy, or local node)

### Installation

```bash
# Clone the repository
git clone https://github.com/Osamakahen/aggregator-integration.git
cd aggregator-integration

# Install dependencies
npm install

# Build the project
npm run build
```

### Development

```bash
# Start the development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Configuration

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_INFURA_API_KEY=your_infura_key
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_key
NEXT_PUBLIC_FLASHBOTS_RPC_URL=optional_flashbots_endpoint
```

## Architecture

### Web Application
- Built with Next.js 14
- TypeScript for type safety
- Tailwind CSS for styling
- React Context for state management

### Chrome Extension
- Built with Vite
- Secure storage using @plasmohq/storage
- Cross-dApp messaging using @plasmohq/messaging
- Background service worker for secure operations

### Smart Contracts
- Written in Solidity
- Deployed on multiple EVM-compatible chains
- Security audited
- Gas optimized

## Security Considerations

- Private keys never leave the extension
- All transactions are validated before signing
- MEV protection through Flashbots
- Price impact limits to prevent sandwich attacks
- Gas optimization to minimize costs

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/aggregators/__tests__/uniswap.test.ts
```

## Deployment

The project is configured for deployment on Vercel:

1. Push to main branch triggers automatic deployment
2. Environment variables are managed through Vercel dashboard
3. Preview deployments for pull requests
4. Production deployments for main branch

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team. 