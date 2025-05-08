import { BaseAdapter } from './base-adapter';
import { DAppAdapterConfig, TransactionRequest } from '../types';
import { ethers } from 'ethers';

const UNISWAP_V3_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
const UNISWAP_V3_FACTORY = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

const UNISWAP_V3_ROUTER_ABI = [
  'function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
  'function exactOutputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountOut, uint256 amountInMaximum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountIn)'
];

const UNISWAP_V3_FACTORY_ABI = [
  'function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)',
  'function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)'
];

export class UniswapAdapter extends BaseAdapter {
  private router: ethers.Contract;
  private factory: ethers.Contract;

  constructor(config: DAppAdapterConfig) {
    super(config);
    this.router = new ethers.Contract(UNISWAP_V3_ROUTER, UNISWAP_V3_ROUTER_ABI, this.provider);
    this.factory = new ethers.Contract(UNISWAP_V3_FACTORY, UNISWAP_V3_FACTORY_ABI, this.provider);
  }

  get name(): string {
    return 'Uniswap V3';
  }

  get version(): string {
    return '1.0.0';
  }

  get supportedNetworks(): string[] {
    return ['1', '5']; // Mainnet and Goerli
  }

  public async getPoolAddress(
    tokenA: string,
    tokenB: string,
    fee: number
  ): Promise<string> {
    return await this.factory.getPool(tokenA, tokenB, fee);
  }

  public async createSwapTransaction(
    params: {
      tokenIn: string;
      tokenOut: string;
      fee: number;
      recipient: string;
      deadline: number;
      amountIn: string;
      amountOutMinimum: string;
      sqrtPriceLimitX96?: string;
      from: string;
    }
  ): Promise<TransactionRequest> {
    const poolAddress = await this.getPoolAddress(params.tokenIn, params.tokenOut, params.fee);
    if (!poolAddress) {
      throw new Error('Pool does not exist');
    }

    const swapParams = {
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      fee: params.fee,
      recipient: params.recipient,
      deadline: params.deadline,
      amountIn: params.amountIn,
      amountOutMinimum: params.amountOutMinimum,
      sqrtPriceLimitX96: params.sqrtPriceLimitX96 || '0'
    };

    const data = this.router.interface.encodeFunctionData('exactInputSingle', [swapParams]);

    return {
      from: params.from,
      to: UNISWAP_V3_ROUTER,
      data,
      value: '0x0'
    };
  }

  public async getQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    fee: number
  ): Promise<string> {
    const poolAddress = await this.getPoolAddress(tokenIn, tokenOut, fee);
    if (!poolAddress) {
      throw new Error('Pool does not exist');
    }

    const pool = await this.getContract(poolAddress, [
      'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
      'function liquidity() external view returns (uint128)'
    ]);

    const [slot0, liquidity] = await Promise.all([
      pool.slot0(),
      pool.liquidity()
    ]);

    // This is a simplified quote calculation
    // In a real implementation, you would use the Uniswap SDK
    const sqrtPriceX96 = BigInt(slot0.sqrtPriceX96);
    const price = (sqrtPriceX96 * sqrtPriceX96 * BigInt(1e18)) / (BigInt(2) ** BigInt(192));
    
    return (BigInt(amountIn) * price / BigInt(1e18)).toString();
  }
} 