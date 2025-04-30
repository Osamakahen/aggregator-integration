# Aggregator Integration Smart Contracts

This directory contains the smart contracts for the aggregator integration project. The main contract is `AggregatorRouter.sol`, which provides a secure and efficient way to route trades through different DEX aggregators.

## Features

- Reentrancy protection
- Emergency pause functionality
- Token whitelisting
- Slippage protection
- Safe token transfers
- Event logging
- Owner-only administrative functions

## Security Considerations

The contracts implement several security measures:

1. **Reentrancy Protection**: Using OpenZeppelin's ReentrancyGuard
2. **Emergency Pause**: Circuit breaker pattern for emergency situations
3. **Token Whitelisting**: Only whitelisted tokens can be used
4. **Slippage Protection**: Maximum slippage limit enforced
5. **Safe Token Transfers**: Using OpenZeppelin's SafeERC20
6. **Owner Controls**: Administrative functions restricted to owner

## Development

### Prerequisites

- Node.js
- npm or yarn
- Hardhat

### Installation

```bash
npm install
```

### Testing

```bash
npm test
```

### Deployment

```bash
npm run deploy
```

## Contract Architecture

### AggregatorRouter

The main contract that handles routing trades through different DEX aggregators. It includes:

- Token whitelisting
- Slippage protection
- Emergency pause functionality
- Safe token transfers
- Event logging

### Mock Contracts

For testing purposes, we have:

- `MockAggregator`: Simulates a DEX aggregator
- `ERC20Mock`: Simulates ERC20 tokens

## License

MIT 