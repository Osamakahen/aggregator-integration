import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { AddressZero, WeiPerEther, Zero } from '@ethersproject/constants';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { pack as solidityPack } from '@ethersproject/solidity';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { BaseAggregator, QuoteParams, QuoteResult, SwapParams, SwapResult, AggregatorFeatures } from './types';
import { UNISWAP_QUOTER_ADDRESS, UNISWAP_ROUTER_ADDRESS } from '../constants';
import { SecurityManager, SecurityConfig } from '../security';
import UniswapQuoterABI from '../abis/UniswapQuoter.json';
import UniswapRouterABI from '../abis/UniswapRouter.json';

interface AggregatorConfig {
  rpcUrl: string;
  apiKey?: string;
  security?: Partial<SecurityConfig>;
}

interface UniswapExactInputParams {
  path: string;
  recipient: string;
  deadline: number;
  amountIn: string;
  amountOutMinimum: string;
}

export class UniswapAggregator implements BaseAggregator {
  private provider: JsonRpcProvider;
  private quoterContract: Contract;
  private swapRouterContract: Contract;
  private securityManager: SecurityManager;
  private readonly FEE_TIERS = [100, 500, 3000, 10000]; // 0.01%, 0.05%, 0.3%, 1%

  constructor(config: AggregatorConfig) {
    this.provider = new JsonRpcProvider(config.rpcUrl);
    this.quoterContract = new Contract(
      UNISWAP_QUOTER_ADDRESS,
      UniswapQuoterABI,
      this.provider
    );
    this.swapRouterContract = new Contract(
      UNISWAP_ROUTER_ADDRESS,
      UniswapRouterABI,
      this.provider
    );
    this.securityManager = new SecurityManager(this.provider, config.security || {});
  }

  async getQuote(params: QuoteParams): Promise<QuoteResult> {
    try {
      const { fromTokenAddress, toTokenAddress, amount } = params;
      
      // Find the optimal fee tier
      const feeTier = await this.findOptimalFeeTier(
        fromTokenAddress,
        toTokenAddress,
        amount
      );
      
      // Get quote from Uniswap
      const quote = await this.quoterContract.quoteExactInputSingle(
        fromTokenAddress,
        toTokenAddress,
        feeTier,
        amount,
        0 // sqrtPriceLimitX96
      );
      
      // Calculate price impact
      const priceImpact = await this.calculatePriceImpact(
        fromTokenAddress,
        toTokenAddress,
        amount
      );

      // Validate price impact
      await this.securityManager.validateTransaction({} as TransactionRequest, priceImpact);
      
      // Estimate gas
      const estimatedGas = await this.estimateGas(
        fromTokenAddress,
        toTokenAddress,
        amount
      );

      // Validate gas estimate
      await this.securityManager.validateGasEstimate(estimatedGas);
      
      return {
        provider: 'uniswap',
        fromToken: fromTokenAddress,
        toToken: toTokenAddress,
        toAmount: quote.toString(),
        estimatedGas,
        priceImpact
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Uniswap quote error:', error);
        throw new Error(`Uniswap quote failed: ${error.message}`);
      }
      throw error;
    }
  }

  async executeSwap(params: SwapParams): Promise<SwapResult> {
    const { fromTokenAddress, toTokenAddress, amount, minReturnAmount, userAddress } = params;
    
    try {
      // Find optimal fee tier
      const feeTier = await this.findOptimalFeeTier(
        fromTokenAddress,
        toTokenAddress,
        amount
      );
      
      // Prepare swap parameters
      const deadline = Math.floor(Date.now() / 1000) + 1800; // 30 minutes
      const path = solidityPack(
        ['address', 'uint24', 'address'],
        [fromTokenAddress, feeTier, toTokenAddress]
      );

      // Create transaction request
      const swapParams: UniswapExactInputParams = {
        path,
        recipient: userAddress,
        deadline,
        amountIn: amount,
        amountOutMinimum: minReturnAmount
      };

      // Get gas estimate for the swap
      const gasEstimate = await this.swapRouterContract.estimateGas.exactInput(swapParams);

      // Create full transaction request
      const txRequest: TransactionRequest = {
        to: UNISWAP_ROUTER_ADDRESS,
        data: this.swapRouterContract.interface.encodeFunctionData('exactInput', [swapParams]),
        gasLimit: gasEstimate.mul(120).div(100), // Add 20% buffer
        value: '0'
      };

      // Apply MEV protection
      const protectedTx = await this.securityManager.protectFromMEV(txRequest);
      
      // Execute swap with protected transaction
      const tx = await this.swapRouterContract.exactInput(swapParams, protectedTx);
      const receipt = await tx.wait();

      // Validate slippage
      await this.securityManager.validateSlippage(
        BigNumber.from(amount),
        BigNumber.from(minReturnAmount),
        params.slippage || 0.5
      );
      
      return {
        transactionHash: receipt.transactionHash,
        fromAmount: amount,
        toAmount: minReturnAmount,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Uniswap swap error:', error);
        throw new Error(`Uniswap swap failed: ${error.message}`);
      }
      throw error;
    }
  }

  async calculatePriceImpact(
    fromToken: string,
    toToken: string,
    amount: string
  ): Promise<number> {
    try {
      // Get quote for actual amount
      const actualQuote = await this.getQuote({
        fromTokenAddress: fromToken,
        toTokenAddress: toToken,
        amount,
        userAddress: AddressZero
      });
      
      // Get quote for small amount to calculate spot price
      const spotAmount = parseUnits('1', 'wei');
      const spotQuote = await this.getQuote({
        fromTokenAddress: fromToken,
        toTokenAddress: toToken,
        amount: spotAmount.toString(),
        userAddress: AddressZero
      });
      
      // Calculate price impact
      const actualRate = BigNumber.from(actualQuote.toAmount)
        .mul(WeiPerEther)
        .div(amount);
      const spotRate = BigNumber.from(spotQuote.toAmount)
        .mul(WeiPerEther)
        .div(spotAmount);
      
      const priceImpact = spotRate.sub(actualRate)
        .mul(10000)
        .div(spotRate)
        .toNumber() / 100;
      
      return priceImpact;
    } catch (error) {
      console.error('Price impact calculation error:', error);
      return 0;
    }
  }

  async estimateGas(
    fromToken: string,
    toToken: string,
    amount: string
  ): Promise<string> {
    try {
      const feeTier = await this.findOptimalFeeTier(fromToken, toToken, amount);
      const path = solidityPack(
        ['address', 'uint24', 'address'],
        [fromToken, feeTier, toToken]
      );
      
      const gasEstimate = await this.swapRouterContract.estimateGas.exactInput({
        path,
        recipient: AddressZero,
        deadline: Math.floor(Date.now() / 1000) + 1800,
        amountIn: amount,
        amountOutMinimum: 0
      });
      
      // Add 20% buffer for safety
      return gasEstimate.mul(120).div(100).toString();
    } catch (error) {
      console.error('Gas estimation error:', error);
      return '200000'; // Default estimate
    }
  }

  async getSupportedTokens(): Promise<string[]> {
    // In a real implementation, this would fetch from a token list or API
    return [];
  }

  getName(): string {
    return 'uniswap';
  }

  getFeatures(): AggregatorFeatures {
    return {
      supportsSplitRoutes: false,
      supportsLimitOrders: false,
      supportsCrossChain: false,
      gasEstimation: true,
      priceImpactCalculation: true
    };
  }

  private async findOptimalFeeTier(
    fromToken: string,
    toToken: string,
    amount: string
  ): Promise<number> {
    let bestFeeTier = this.FEE_TIERS[2]; // Default to 0.3%
    let maxLiquidity = Zero;
    
    // Check liquidity in each fee tier
    for (const feeTier of this.FEE_TIERS) {
      try {
        const poolAddress = await this.quoterContract.getPool(
          fromToken,
          toToken,
          feeTier
        );
        
        if (poolAddress !== AddressZero) {
          const pool = new Contract(
            poolAddress,
            ['function liquidity() external view returns (uint128)'],
            this.provider
          );
          
          const liquidity = await pool.liquidity();
          if (liquidity.gt(maxLiquidity)) {
            maxLiquidity = liquidity;
            bestFeeTier = feeTier;
          }
        }
      } catch (error) {
        console.debug(`No pool found for fee tier ${feeTier}`);
      }
    }
    
    return bestFeeTier;
  }
} 