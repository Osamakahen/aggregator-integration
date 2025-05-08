import { ethers } from 'ethers';
import { AaveAdapter } from '../aave-adapter';
import { DAppAdapterConfig } from '../../types';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('ethers');

describe('AaveAdapter', () => {
  let adapter: AaveAdapter;
  let config: DAppAdapterConfig;
  let mockProvider: any;
  let mockPoolContract: any;
  let mockPoolDataProviderContract: any;

  beforeEach(() => {
    config = {
      type: 'aave',
      rpcUrl: 'https://mainnet.infura.io/v3/test',
      chainId: '1',
      contracts: {
        pool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
        poolDataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3'
      }
    };

    mockProvider = {
      getNetwork: vi.fn().mockResolvedValue({ chainId: 1 }),
      getBalance: vi.fn().mockResolvedValue(ethers.utils.parseEther('1.0')),
      getTransactionCount: vi.fn().mockResolvedValue(1),
      estimateGas: vi.fn().mockResolvedValue(ethers.utils.parseUnits('21000', 'wei')),
      getGasPrice: vi.fn().mockResolvedValue(ethers.utils.parseUnits('50', 'gwei'))
    };

    mockPoolContract = {
      interface: {
        encodeFunctionData: vi.fn().mockReturnValue('0x')
      }
    };

    mockPoolDataProviderContract = {
      getReserveData: vi.fn().mockResolvedValue({
        liquidityRate: ethers.utils.parseUnits('0.05', 27),
        variableBorrowRate: ethers.utils.parseUnits('0.07', 27),
        stableBorrowRate: ethers.utils.parseUnits('0.06', 27),
        availableLiquidity: ethers.utils.parseEther('1000000'),
        totalStableDebt: ethers.utils.parseEther('500000'),
        totalVariableDebt: ethers.utils.parseEther('300000')
      }),
      getUserReserveData: vi.fn().mockResolvedValue({
        currentATokenBalance: ethers.utils.parseEther('1000'),
        currentStableDebt: ethers.utils.parseEther('500'),
        currentVariableDebt: ethers.utils.parseEther('300'),
        principalStableDebt: ethers.utils.parseEther('500'),
        scaledVariableDebt: ethers.utils.parseEther('300'),
        stableBorrowRate: ethers.utils.parseUnits('0.06', 27),
        liquidityRate: ethers.utils.parseUnits('0.05', 27),
        usageAsCollateralEnabled: true
      })
    };

    (ethers.Contract as any).mockImplementation((address: string) => {
      if (address === config.contracts.pool) {
        return mockPoolContract;
      }
      if (address === config.contracts.poolDataProvider) {
        return mockPoolDataProviderContract;
      }
      return {
        interface: {
          encodeFunctionData: vi.fn().mockReturnValue('0x')
        },
        allowance: vi.fn().mockResolvedValue(ethers.utils.parseEther('1000'))
      };
    });

    adapter = new AaveAdapter(config);
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await expect(adapter.initialize()).resolves.not.toThrow();
    });
  });

  describe('getReserveData', () => {
    it('should return reserve data', async () => {
      const asset = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // DAI
      const data = await adapter.getReserveData(asset);

      expect(data).toEqual({
        liquidityRate: '50000000000000000000000000',
        variableBorrowRate: '70000000000000000000000000',
        stableBorrowRate: '60000000000000000000000000',
        availableLiquidity: '1000000000000000000000000',
        totalStableDebt: '500000000000000000000000',
        totalVariableDebt: '300000000000000000000000'
      });
    });
  });

  describe('getUserReserveData', () => {
    it('should return user reserve data', async () => {
      const asset = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // DAI
      const user = '0x1234567890123456789012345678901234567890';
      const data = await adapter.getUserReserveData(asset, user);

      expect(data).toEqual({
        currentATokenBalance: '1000000000000000000000',
        currentStableDebt: '500000000000000000000',
        currentVariableDebt: '300000000000000000000',
        principalStableDebt: '500000000000000000000',
        scaledVariableDebt: '300000000000000000000',
        stableBorrowRate: '60000000000000000000000000',
        liquidityRate: '50000000000000000000000000',
        usageAsCollateralEnabled: true
      });
    });
  });

  describe('createSupplyTransaction', () => {
    it('should create supply transaction', async () => {
      const params = {
        asset: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
        amount: '1000000000000000000000', // 1000 DAI
        onBehalfOf: '0x1234567890123456789012345678901234567890',
        from: '0x1234567890123456789012345678901234567890'
      };

      const tx = await adapter.createSupplyTransaction(params);

      expect(tx).toEqual({
        from: params.from,
        to: config.contracts.pool,
        data: '0x'
      });
      expect(mockPoolContract.interface.encodeFunctionData).toHaveBeenCalledWith(
        'supply',
        [params.asset, params.amount, params.onBehalfOf, 0]
      );
    });
  });

  describe('createBorrowTransaction', () => {
    it('should create borrow transaction', async () => {
      const params = {
        asset: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
        amount: '1000000000000000000000', // 1000 DAI
        interestRateMode: 2, // Variable rate
        onBehalfOf: '0x1234567890123456789012345678901234567890',
        from: '0x1234567890123456789012345678901234567890'
      };

      const tx = await adapter.createBorrowTransaction(params);

      expect(tx).toEqual({
        from: params.from,
        to: config.contracts.pool,
        data: '0x'
      });
      expect(mockPoolContract.interface.encodeFunctionData).toHaveBeenCalledWith(
        'borrow',
        [params.asset, params.amount, params.interestRateMode, 0, params.onBehalfOf]
      );
    });
  });

  describe('createRepayTransaction', () => {
    it('should create repay transaction', async () => {
      const params = {
        asset: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
        amount: '1000000000000000000000', // 1000 DAI
        interestRateMode: 2, // Variable rate
        onBehalfOf: '0x1234567890123456789012345678901234567890',
        from: '0x1234567890123456789012345678901234567890'
      };

      const tx = await adapter.createRepayTransaction(params);

      expect(tx).toEqual({
        from: params.from,
        to: config.contracts.pool,
        data: '0x'
      });
      expect(mockPoolContract.interface.encodeFunctionData).toHaveBeenCalledWith(
        'repay',
        [params.asset, params.amount, params.interestRateMode, params.onBehalfOf]
      );
    });
  });

  describe('createWithdrawTransaction', () => {
    it('should create withdraw transaction', async () => {
      const params = {
        asset: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
        amount: '1000000000000000000000', // 1000 DAI
        to: '0x1234567890123456789012345678901234567890',
        from: '0x1234567890123456789012345678901234567890'
      };

      const tx = await adapter.createWithdrawTransaction(params);

      expect(tx).toEqual({
        from: params.from,
        to: config.contracts.pool,
        data: '0x'
      });
      expect(mockPoolContract.interface.encodeFunctionData).toHaveBeenCalledWith(
        'withdraw',
        [params.asset, params.amount, params.to]
      );
    });
  });

  describe('approveToken', () => {
    it('should create approve transaction', async () => {
      const tokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // DAI
      const amount = '1000000000000000000000'; // 1000 DAI
      const from = '0x1234567890123456789012345678901234567890';

      const tx = await adapter.approveToken(tokenAddress, amount, from);

      expect(tx).toEqual({
        from,
        to: tokenAddress,
        data: '0x'
      });
    });
  });

  describe('checkAllowance', () => {
    it('should return allowance', async () => {
      const tokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // DAI
      const owner = '0x1234567890123456789012345678901234567890';

      const allowance = await adapter.checkAllowance(tokenAddress, owner);

      expect(allowance).toBe('1000000000000000000000');
    });
  });
}); 