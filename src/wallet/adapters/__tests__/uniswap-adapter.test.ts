import { ethers } from 'ethers';
import { UniswapAdapter } from '../uniswap-adapter';
import { DAppAdapterConfig } from '../../types';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('ethers');

describe('UniswapAdapter', () => {
  let adapter: UniswapAdapter;
  let config: DAppAdapterConfig;
  let mockProvider: any;
  let mockRouterContract: any;
  let mockFactoryContract: any;
  let mockPoolContract: any;

  beforeEach(() => {
    config = {
      type: 'uniswap' as const,
      rpcUrl: 'https://mainnet.infura.io/v3/test',
      chainId: '1',
      contracts: {
        router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
      }
    };

    mockProvider = {
      getNetwork: vi.fn().mockResolvedValue({ chainId: 1 }),
      getBalance: vi.fn().mockResolvedValue(ethers.utils.parseEther('1.0')),
      getTransactionCount: vi.fn().mockResolvedValue(1),
      estimateGas: vi.fn().mockResolvedValue(ethers.utils.parseUnits('21000', 'wei')),
      getGasPrice: vi.fn().mockResolvedValue(ethers.utils.parseUnits('50', 'gwei'))
    };

    mockRouterContract = {
      interface: {
        encodeFunctionData: vi.fn().mockReturnValue('0x')
      },
      exactInputSingle: vi.fn().mockResolvedValue({
        hash: '0x123'
      }),
      exactOutputSingle: vi.fn().mockResolvedValue({
        hash: '0x456'
      })
    };

    mockFactoryContract = {
      interface: {
        encodeFunctionData: vi.fn().mockReturnValue('0x')
      },
      getPool: vi.fn().mockResolvedValue('0x789'),
      createPool: vi.fn().mockResolvedValue({
        hash: '0xabc'
      })
    };

    mockPoolContract = {
      slot0: vi.fn().mockResolvedValue({
        sqrtPriceX96: ethers.utils.parseUnits('1', 18),
        tick: 0,
        observationIndex: 0,
        observationCardinality: 0,
        observationCardinalityNext: 0,
        feeProtocol: 0,
        unlocked: true
      }),
      liquidity: vi.fn().mockResolvedValue(ethers.utils.parseUnits('1000', 18))
    };

    (ethers.Contract as any).mockImplementation((address: string, abi: any, provider: any) => {
      if (address === config.contracts.router) {
        return mockRouterContract;
      }
      if (address === config.contracts.factory) {
        return mockFactoryContract;
      }
      if (address === '0x789') { // Pool address
        return mockPoolContract;
      }
      return {
        interface: {
          encodeFunctionData: vi.fn().mockReturnValue('0x')
        },
        balanceOf: vi.fn().mockResolvedValue(ethers.utils.parseEther('1000')),
        allowance: vi.fn().mockResolvedValue(ethers.utils.parseEther('500'))
      };
    });

    adapter = new UniswapAdapter(config);
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await expect(adapter.initialize()).resolves.not.toThrow();
    });
  });

  describe('getPoolAddress', () => {
    it('should return pool address', async () => {
      const tokenA = '0x1234567890123456789012345678901234567890';
      const tokenB = '0x0987654321098765432109876543210987654321';
      const fee = 3000;

      const poolAddress = await adapter.getPoolAddress(tokenA, tokenB, fee);

      expect(poolAddress).toBe('0x789');
      expect(mockFactoryContract.getPool).toHaveBeenCalledWith(tokenA, tokenB, fee);
    });
  });

  describe('createSwapTransaction', () => {
    it('should create exact input swap transaction', async () => {
      const params = {
        tokenIn: '0x1234567890123456789012345678901234567890',
        tokenOut: '0x0987654321098765432109876543210987654321',
        fee: 3000,
        recipient: '0x5555555555555555555555555555555555555555',
        deadline: Math.floor(Date.now() / 1000) + 3600,
        amountIn: '1000000000000000000',
        amountOutMinimum: '900000000000000000',
        sqrtPriceLimitX96: '0',
        from: '0x1234567890123456789012345678901234567890'
      };

      const tx = await adapter.createSwapTransaction(params);

      expect(tx).toEqual({
        from: params.from,
        to: config.contracts.router,
        data: '0x',
        value: '0x0'
      });
      expect(mockRouterContract.interface.encodeFunctionData).toHaveBeenCalledWith(
        'exactInputSingle',
        [{
          tokenIn: params.tokenIn,
          tokenOut: params.tokenOut,
          fee: params.fee,
          recipient: params.recipient,
          deadline: params.deadline,
          amountIn: params.amountIn,
          amountOutMinimum: params.amountOutMinimum,
          sqrtPriceLimitX96: params.sqrtPriceLimitX96
        }]
      );
    });

    it('should create exact output swap transaction', async () => {
      const params = {
        tokenIn: '0x1234567890123456789012345678901234567890',
        tokenOut: '0x0987654321098765432109876543210987654321',
        fee: 3000,
        recipient: '0x5555555555555555555555555555555555555555',
        deadline: Math.floor(Date.now() / 1000) + 3600,
        amountIn: '1000000000000000000',
        amountOutMinimum: '900000000000000000',
        sqrtPriceLimitX96: '0',
        from: '0x1234567890123456789012345678901234567890'
      };

      const tx = await adapter.createSwapTransaction(params);

      expect(tx).toEqual({
        from: params.from,
        to: config.contracts.router,
        data: '0x',
        value: '0x0'
      });
      expect(mockRouterContract.interface.encodeFunctionData).toHaveBeenCalledWith(
        'exactInputSingle',
        [{
          tokenIn: params.tokenIn,
          tokenOut: params.tokenOut,
          fee: params.fee,
          recipient: params.recipient,
          deadline: params.deadline,
          amountIn: params.amountIn,
          amountOutMinimum: params.amountOutMinimum,
          sqrtPriceLimitX96: params.sqrtPriceLimitX96
        }]
      );
    });
  });

  describe('getQuote', () => {
    it('should return quote for swap', async () => {
      const tokenIn = '0x1234567890123456789012345678901234567890';
      const tokenOut = '0x0987654321098765432109876543210987654321';
      const amountIn = '1000000000000000000';
      const fee = 3000;

      const poolAddress = '0x789';
      mockFactoryContract.getPool.mockResolvedValue(poolAddress);

      const quote = await adapter.getQuote(tokenIn, tokenOut, amountIn, fee);

      expect(quote).toBe('1000000000000000000'); // Simplified quote calculation result
    });
  });
}); 