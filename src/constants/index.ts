// Uniswap V3 Mainnet Addresses
export const UNISWAP_QUOTER_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
export const UNISWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

// Network Configuration
export const SUPPORTED_CHAINS = {
  MAINNET: 1,
  OPTIMISM: 10,
  ARBITRUM: 42161,
  POLYGON: 137
};

// Default Configuration
export const DEFAULT_SLIPPAGE = 0.5; // 0.5%
export const DEFAULT_DEADLINE = 20 * 60; // 20 minutes
export const DEFAULT_GAS_LIMIT = 200000;

// Error Messages
export const ERROR_MESSAGES = {
  INSUFFICIENT_LIQUIDITY: 'Insufficient liquidity for this trade',
  PRICE_IMPACT_TOO_HIGH: 'Price impact too high',
  SLIPPAGE_EXCEEDED: 'Slippage tolerance exceeded',
  TRANSACTION_FAILED: 'Transaction failed',
  UNSUPPORTED_TOKEN: 'Token not supported',
  INVALID_AMOUNT: 'Invalid amount',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  NETWORK_ERROR: 'Network error occurred',
  TIMEOUT: 'Request timed out'
}; 