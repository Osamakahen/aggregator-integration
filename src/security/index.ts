import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { JsonRpcProvider } from '@ethersproject/providers';
import { TransactionRequest } from '@ethersproject/abstract-provider';

export interface SecurityConfig {
  maxPriceImpact: number;
  maxGasPrice: string;
  flashbotRpcUrl?: string;
  minerTipPercentage?: number;
}

const DEFAULT_CONFIG: Partial<SecurityConfig> = {
  maxPriceImpact: 2, // 2%
  maxGasPrice: '500000000000', // 500 Gwei
  minerTipPercentage: 90 // 90% of potential MEV
};

export class SecurityManager {
  private provider: JsonRpcProvider;
  private config: SecurityConfig;

  constructor(provider: JsonRpcProvider, config: Partial<SecurityConfig>) {
    this.provider = provider;
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    } as SecurityConfig;
  }

  async validateTransaction(tx: TransactionRequest, priceImpact?: number): Promise<boolean> {
    // Check price impact
    if (priceImpact && priceImpact > this.config.maxPriceImpact) {
      throw new Error(`Price impact too high: ${priceImpact}%`);
    }

    // Check gas price
    const gasPrice = tx.gasPrice ? BigNumber.from(tx.gasPrice) : await this.provider.getGasPrice();
    if (gasPrice.gt(this.config.maxGasPrice)) {
      throw new Error(`Gas price too high: ${gasPrice.toString()}`);
    }

    return true;
  }

  async protectFromMEV(tx: TransactionRequest): Promise<TransactionRequest> {
    // If Flashbots RPC is configured, use it
    if (this.config.flashbotRpcUrl) {
      return this.sendViaFlashbots(tx);
    }

    // Otherwise, use standard MEV protection
    return this.applyStandardMEVProtection(tx);
  }

  private async sendViaFlashbots(tx: TransactionRequest): Promise<TransactionRequest> {
    // Implementation would use Flashbots RPC
    // This is a placeholder for actual Flashbots integration
    return {
      ...tx,
      // Add Flashbots-specific parameters
      maxFeePerGas: tx.maxFeePerGas,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas
    };
  }

  private async applyStandardMEVProtection(tx: TransactionRequest): Promise<TransactionRequest> {
    const currentBlock = await this.provider.getBlock('latest');
    const baseFee = currentBlock.baseFeePerGas || BigNumber.from('0');
    
    // Calculate miner tip based on potential MEV
    const minerTip = baseFee.mul(this.config.minerTipPercentage || 90).div(100);
    
    return {
      ...tx,
      maxFeePerGas: baseFee.mul(2), // 2x base fee as max fee
      maxPriorityFeePerGas: minerTip // Miner tip to incentivize inclusion
    };
  }

  async validateSlippage(expectedAmount: BigNumber, actualAmount: BigNumber, slippage: number): Promise<boolean> {
    const minAmount = expectedAmount.mul(1000 - Math.floor(slippage * 10)).div(1000);
    if (actualAmount.lt(minAmount)) {
      throw new Error(`Slippage exceeded: expected at least ${minAmount.toString()}, got ${actualAmount.toString()}`);
    }
    return true;
  }

  async validateGasEstimate(gasEstimate: BigNumberish): Promise<boolean> {
    const estimate = BigNumber.from(gasEstimate);
    const block = await this.provider.getBlock('latest');
    if (estimate.gt(block.gasLimit.mul(90).div(100))) { // Max 90% of block gas limit
      throw new Error('Gas estimate too high');
    }
    return true;
  }
} 