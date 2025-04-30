import { ethers } from 'ethers';
import { UniswapAggregator } from '../uniswap';
import { Contract } from '@ethersproject/contracts';

// Mock the ethers provider and contracts
jest.mock('ethers', () => ({
  providers: {
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      getNetwork: jest.fn().mockResolvedValue({ chainId: 1 })
    }))
  },
  Contract: jest.fn().mockImplementation(() => ({
    quoteExactInputSingle: jest.fn(),
    getPool: jest.fn(),
    estimateGas: {
      exactInput: jest.fn().mockResolvedValue(ethers.BigNumber.from('200000'))
    }
  })),
  BigNumber: {
    from: jest.fn().mockImplementation((value) => ({
      toString: () => value,
      mul: jest.fn().mockReturnThis(),
      div: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnValue(true)
    }))
  },
  constants: {
    AddressZero: '0x0000000000000000000000000000000000000000',
    WeiPerEther: '1000000000000000000',
    Zero: '0'
  },
  utils: {
    parseUnits: jest.fn().mockReturnValue('1000000000000000000'),
    solidityPack: jest.fn().mockReturnValue('0x')
  }
}));

describe('UniswapAggregator', () => {
  let aggregator: UniswapAggregator;
  const mockConfig = {
    rpcUrl: 'https://mainnet.infura.io/v3/your-api-key'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    aggregator = new UniswapAggregator(mockConfig);
  });

  describe('getQuote', () => {
    const mockParams = {
      fromTokenAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
      toTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      amount: '1000000000000000000', // 1 ETH
      userAddress: '0x1234567890123456789012345678901234567890'
    };

    it('should return a valid quote', async () => {
      // Mock the quoter contract response
      const mockQuote = '950000000000000000'; // 0.95 ETH
      ((Contract as unknown) as jest.Mock).mockImplementation(() => ({
        quoteExactInputSingle: jest.fn().mockResolvedValue(mockQuote),
        getPool: jest.fn().mockResolvedValue('0xmockPool'),
        liquidity: jest.fn().mockResolvedValue('1000000000000000000')
      }));

      const result = await aggregator.getQuote(mockParams);

      expect(result).toEqual({
        provider: 'uniswap',
        fromToken: mockParams.fromTokenAddress,
        toToken: mockParams.toTokenAddress,
        toAmount: mockQuote,
        estimatedGas: '200000',
        priceImpact: expect.any(Number)
      });
    });

    it('should handle errors gracefully', async () => {
      // Mock an error in the quoter contract
      ((Contract as unknown) as jest.Mock).mockImplementation(() => ({
        quoteExactInputSingle: jest.fn().mockRejectedValue(new Error('Insufficient liquidity'))
      }));

      await expect(aggregator.getQuote(mockParams)).rejects.toThrow('Uniswap quote failed: Insufficient liquidity');
    });
  });

  describe('executeSwap', () => {
    const mockSwapParams = {
      fromTokenAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      toTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      amount: '1000000000000000000',
      minReturnAmount: '950000000000000000',
      userAddress: '0x1234567890123456789012345678901234567890'
    };

    it('should execute a swap successfully', async () => {
      const mockTxHash = '0xmockTransactionHash';
      const mockReceipt = {
        transactionHash: mockTxHash,
        gasUsed: { toString: () => '200000' }
      };

      // Mock the router contract
      ((Contract as unknown) as jest.Mock).mockImplementation(() => ({
        exactInput: jest.fn().mockResolvedValue({
          wait: jest.fn().mockResolvedValue(mockReceipt)
        }),
        getPool: jest.fn().mockResolvedValue('0xmockPool'),
        liquidity: jest.fn().mockResolvedValue('1000000000000000000')
      }));

      const result = await aggregator.executeSwap(mockSwapParams);

      expect(result).toEqual({
        transactionHash: mockTxHash,
        fromAmount: mockSwapParams.amount,
        toAmount: mockSwapParams.minReturnAmount,
        gasUsed: '200000'
      });
    });

    it('should handle swap errors', async () => {
      // Mock a swap error
      ((Contract as unknown) as jest.Mock).mockImplementation(() => ({
        exactInput: jest.fn().mockRejectedValue(new Error('Swap failed'))
      }));

      await expect(aggregator.executeSwap(mockSwapParams)).rejects.toThrow('Uniswap swap failed: Swap failed');
    });
  });

  describe('helper methods', () => {
    it('should return correct features', () => {
      const features = aggregator.getFeatures();
      expect(features).toEqual({
        supportsSplitRoutes: false,
        supportsLimitOrders: false,
        supportsCrossChain: false,
        gasEstimation: true,
        priceImpactCalculation: true
      });
    });

    it('should return correct name', () => {
      expect(aggregator.getName()).toBe('uniswap');
    });

    it('should calculate price impact', async () => {
      const priceImpact = await aggregator.calculatePriceImpact(
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        '1000000000000000000'
      );
      expect(typeof priceImpact).toBe('number');
    });
  });
}); 