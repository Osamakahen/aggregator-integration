import { ethers } from 'ethers';
import { Token } from '../components/swap/SwapInterface';

export class PriceService {
  private provider: ethers.JsonRpcProvider;
  private aggregatorAddress: string;

  constructor(rpcUrl: string, aggregatorAddress: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.aggregatorAddress = aggregatorAddress;
  }

  async getPrice(tokenIn: Token, tokenOut: Token, amountIn: string): Promise<string> {
    try {
      // TODO: Implement actual price fetching from aggregator
      // For now, return a mock price
      const amountInWei = ethers.parseUnits(amountIn, tokenIn.decimals);
      const mockPrice = '1.0'; // 1:1 price ratio
      return mockPrice;
    } catch (error) {
      console.error('Error fetching price:', error);
      return '0';
    }
  }

  async calculateAmountOut(tokenIn: Token, tokenOut: Token, amountIn: string): Promise<string> {
    const price = await this.getPrice(tokenIn, tokenOut, amountIn);
    const amountInWei = ethers.parseUnits(amountIn, tokenIn.decimals);
    const amountOutWei = amountInWei * ethers.parseUnits(price, tokenOut.decimals);
    return ethers.formatUnits(amountOutWei, tokenOut.decimals);
  }
} 