export interface QuoteParams {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  userAddress: string;
  slippage?: number;
}

export interface QuoteResult {
  provider: string;
  fromToken: string;
  toToken: string;
  toAmount: string;
  estimatedGas: string;
  priceImpact?: number;
}

export interface SwapParams extends QuoteParams {
  minReturnAmount: string;
  deadline?: number;
}

export interface SwapResult {
  transactionHash: string;
  fromAmount: string;
  toAmount: string;
  gasUsed: string;
}

export interface AggregatorFeatures {
  supportsSplitRoutes: boolean;
  supportsLimitOrders: boolean;
  supportsCrossChain: boolean;
  gasEstimation: boolean;
  priceImpactCalculation: boolean;
}

export interface BaseAggregator {
  // Core functionality
  getQuote(params: QuoteParams): Promise<QuoteResult>;
  executeSwap(params: SwapParams): Promise<SwapResult>;
  
  // Helper methods
  calculatePriceImpact(fromToken: string, toToken: string, amount: string): Promise<number>;
  estimateGas(fromToken: string, toToken: string, amount: string): Promise<string>;
  
  // Adapter-specific features
  getSupportedTokens(): Promise<string[]>;
  getFeatures(): AggregatorFeatures;
} 