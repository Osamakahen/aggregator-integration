import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { SecurityManager } from '../index';

// Mock provider
jest.mock('@ethersproject/providers', () => ({
  JsonRpcProvider: jest.fn().mockImplementation(() => ({
    getGasPrice: jest.fn().mockResolvedValue(BigNumber.from('50000000000')), // 50 Gwei
    getBlock: jest.fn().mockResolvedValue({
      baseFeePerGas: BigNumber.from('40000000000'), // 40 Gwei
      gasLimit: BigNumber.from('15000000') // 15M gas
    })
  }))
}));

describe('SecurityManager', () => {
  let securityManager: SecurityManager;
  let provider: JsonRpcProvider;

  beforeEach(() => {
    provider = new JsonRpcProvider('https://mainnet.infura.io/v3/your-api-key');
    securityManager = new SecurityManager(provider, {
      maxPriceImpact: 2,
      maxGasPrice: '100000000000' // 100 Gwei
    });
  });

  describe('validateTransaction', () => {
    it('should pass validation for acceptable price impact', async () => {
      const tx = {};
      const result = await securityManager.validateTransaction(tx, 1.5);
      expect(result).toBe(true);
    });

    it('should reject transaction with high price impact', async () => {
      const tx = {};
      await expect(securityManager.validateTransaction(tx, 2.5))
        .rejects
        .toThrow('Price impact too high: 2.5%');
    });

    it('should pass validation for acceptable gas price', async () => {
      const tx = { gasPrice: BigNumber.from('90000000000') }; // 90 Gwei
      const result = await securityManager.validateTransaction(tx);
      expect(result).toBe(true);
    });

    it('should reject transaction with high gas price', async () => {
      const tx = { gasPrice: BigNumber.from('150000000000') }; // 150 Gwei
      await expect(securityManager.validateTransaction(tx))
        .rejects
        .toThrow('Gas price too high');
    });
  });

  describe('protectFromMEV', () => {
    it('should apply MEV protection to transaction', async () => {
      const tx = {
        to: '0x1234567890123456789012345678901234567890',
        value: '1000000000000000000'
      };

      const protectedTx = await securityManager.protectFromMEV(tx);
      expect(protectedTx.maxFeePerGas).toBeDefined();
      expect(protectedTx.maxPriorityFeePerGas).toBeDefined();
    });

    it('should use Flashbots when configured', async () => {
      const flashbotsManager = new SecurityManager(provider, {
        maxPriceImpact: 2,
        maxGasPrice: '100000000000',
        flashbotRpcUrl: 'https://relay.flashbots.net'
      });

      const tx = {
        to: '0x1234567890123456789012345678901234567890',
        value: '1000000000000000000'
      };

      const protectedTx = await flashbotsManager.protectFromMEV(tx);
      expect(protectedTx.maxFeePerGas).toBeDefined();
      expect(protectedTx.maxPriorityFeePerGas).toBeDefined();
    });
  });

  describe('validateSlippage', () => {
    it('should pass validation for acceptable slippage', async () => {
      const expected = BigNumber.from('1000000000000000000'); // 1 ETH
      const actual = BigNumber.from('995000000000000000');   // 0.995 ETH (0.5% slippage)
      const result = await securityManager.validateSlippage(expected, actual, 0.5);
      expect(result).toBe(true);
    });

    it('should reject when slippage exceeds limit', async () => {
      const expected = BigNumber.from('1000000000000000000'); // 1 ETH
      const actual = BigNumber.from('900000000000000000');    // 0.9 ETH (10% slippage)
      await expect(securityManager.validateSlippage(expected, actual, 0.5))
        .rejects
        .toThrow('Slippage exceeded');
    });
  });

  describe('validateGasEstimate', () => {
    it('should pass validation for acceptable gas estimate', async () => {
      const gasEstimate = BigNumber.from('500000'); // 500k gas
      const result = await securityManager.validateGasEstimate(gasEstimate);
      expect(result).toBe(true);
    });

    it('should reject when gas estimate is too high', async () => {
      const gasEstimate = BigNumber.from('14000000'); // 14M gas (>90% block limit)
      await expect(securityManager.validateGasEstimate(gasEstimate))
        .rejects
        .toThrow('Gas estimate too high');
    });
  });
}); 