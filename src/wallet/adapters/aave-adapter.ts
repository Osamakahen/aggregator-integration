import { BaseAdapter } from './base-adapter';
import { DAppAdapterConfig, TransactionRequest } from '../types';
import { ethers } from 'ethers';

const AAVE_POOL = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2';
const AAVE_POOL_DATA_PROVIDER = '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3';

const AAVE_POOL_ABI = [
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external',
  'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external',
  'function repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf) external returns (uint256)',
  'function withdraw(address asset, uint256 amount, address to) external returns (uint256)'
];

const AAVE_POOL_DATA_PROVIDER_ABI = [
  'function getReserveData(address asset) external view returns (uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 availableLiquidity, uint128 totalStableDebt, uint128 totalVariableDebt, uint128 averageStableRate, uint128 liquidityRate, uint128 variableBorrowRate, uint128 stableBorrowRate)',
  'function getUserReserveData(address asset, address user) external view returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)'
];

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)'
];

export class AaveAdapter extends BaseAdapter {
  private pool: ethers.Contract;
  private poolDataProvider: ethers.Contract;

  constructor(config: DAppAdapterConfig) {
    super(config);
    this.pool = new ethers.Contract(AAVE_POOL, AAVE_POOL_ABI, this.provider);
    this.poolDataProvider = new ethers.Contract(
      AAVE_POOL_DATA_PROVIDER,
      AAVE_POOL_DATA_PROVIDER_ABI,
      this.provider
    );
  }

  get name(): string {
    return 'Aave V3';
  }

  get version(): string {
    return '1.0.0';
  }

  get supportedNetworks(): string[] {
    return ['1', '5']; // Mainnet and Goerli
  }

  public async getReserveData(asset: string): Promise<{
    liquidityRate: string;
    variableBorrowRate: string;
    stableBorrowRate: string;
    availableLiquidity: string;
    totalStableDebt: string;
    totalVariableDebt: string;
  }> {
    const data = await this.poolDataProvider.getReserveData(asset);
    return {
      liquidityRate: data.liquidityRate.toString(),
      variableBorrowRate: data.variableBorrowRate.toString(),
      stableBorrowRate: data.stableBorrowRate.toString(),
      availableLiquidity: data.availableLiquidity.toString(),
      totalStableDebt: data.totalStableDebt.toString(),
      totalVariableDebt: data.totalVariableDebt.toString()
    };
  }

  public async getUserReserveData(
    asset: string,
    user: string
  ): Promise<{
    currentATokenBalance: string;
    currentStableDebt: string;
    currentVariableDebt: string;
    principalStableDebt: string;
    scaledVariableDebt: string;
    stableBorrowRate: string;
    liquidityRate: string;
    usageAsCollateralEnabled: boolean;
  }> {
    const data = await this.poolDataProvider.getUserReserveData(asset, user);
    return {
      currentATokenBalance: data.currentATokenBalance.toString(),
      currentStableDebt: data.currentStableDebt.toString(),
      currentVariableDebt: data.currentVariableDebt.toString(),
      principalStableDebt: data.principalStableDebt.toString(),
      scaledVariableDebt: data.scaledVariableDebt.toString(),
      stableBorrowRate: data.stableBorrowRate.toString(),
      liquidityRate: data.liquidityRate.toString(),
      usageAsCollateralEnabled: data.usageAsCollateralEnabled
    };
  }

  public async createSupplyTransaction(
    params: {
      asset: string;
      amount: string;
      onBehalfOf: string;
      from: string;
    }
  ): Promise<TransactionRequest> {
    const data = this.pool.interface.encodeFunctionData('supply', [
      params.asset,
      params.amount,
      params.onBehalfOf,
      0 // referralCode
    ]);

    return {
      from: params.from,
      to: AAVE_POOL,
      data
    };
  }

  public async createBorrowTransaction(
    params: {
      asset: string;
      amount: string;
      interestRateMode: number; // 1 for stable, 2 for variable
      onBehalfOf: string;
      from: string;
    }
  ): Promise<TransactionRequest> {
    const data = this.pool.interface.encodeFunctionData('borrow', [
      params.asset,
      params.amount,
      params.interestRateMode,
      0, // referralCode
      params.onBehalfOf
    ]);

    return {
      from: params.from,
      to: AAVE_POOL,
      data
    };
  }

  public async createRepayTransaction(
    params: {
      asset: string;
      amount: string;
      interestRateMode: number;
      onBehalfOf: string;
      from: string;
    }
  ): Promise<TransactionRequest> {
    const data = this.pool.interface.encodeFunctionData('repay', [
      params.asset,
      params.amount,
      params.interestRateMode,
      params.onBehalfOf
    ]);

    return {
      from: params.from,
      to: AAVE_POOL,
      data
    };
  }

  public async createWithdrawTransaction(
    params: {
      asset: string;
      amount: string;
      to: string;
      from: string;
    }
  ): Promise<TransactionRequest> {
    const data = this.pool.interface.encodeFunctionData('withdraw', [
      params.asset,
      params.amount,
      params.to
    ]);

    return {
      from: params.from,
      to: AAVE_POOL,
      data
    };
  }

  public async approveToken(
    tokenAddress: string,
    amount: string,
    from: string
  ): Promise<TransactionRequest> {
    const token = await this.getContract(tokenAddress, ERC20_ABI);
    const data = token.interface.encodeFunctionData('approve', [
      AAVE_POOL,
      amount
    ]);

    return {
      from,
      to: tokenAddress,
      data
    };
  }

  public async checkAllowance(
    tokenAddress: string,
    owner: string
  ): Promise<string> {
    const token = await this.getContract(tokenAddress, ERC20_ABI);
    return (await token.allowance(owner, AAVE_POOL)).toString();
  }
} 