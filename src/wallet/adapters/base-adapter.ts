import { DAppAdapter, DAppAdapterConfig, TransactionRequest, TransactionResponse } from '../types';
import { ethers } from 'ethers';

export abstract class BaseAdapter implements DAppAdapter {
  protected provider: ethers.providers.JsonRpcProvider;
  protected config: DAppAdapterConfig;

  constructor(config: DAppAdapterConfig) {
    this.config = config;
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  }

  abstract get name(): string;
  abstract get version(): string;
  abstract get supportedNetworks(): string[];

  public async initialize(): Promise<void> {
    // Check if the network is supported
    if (!this.supportedNetworks.includes(this.config.chainId)) {
      throw new Error(`Network ${this.config.chainId} is not supported by ${this.name}`);
    }

    // Verify RPC connection
    try {
      await this.provider.getNetwork();
    } catch (error) {
      throw new Error(`Failed to connect to RPC: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public isSupported(): boolean {
    return this.supportedNetworks.includes(this.config.chainId);
  }

  public async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return balance.toString();
  }

  public async getTokenBalance(tokenAddress: string, address: string): Promise<string> {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ['function balanceOf(address) view returns (uint256)'],
      this.provider
    );
    
    const balance = await tokenContract.balanceOf(address);
    return balance.toString();
  }

  public async getTransactionHistory(address: string): Promise<TransactionResponse[]> {
    const blockNumber = await this.provider.getBlockNumber();
    const transactions: TransactionResponse[] = [];

    // Get last 100 blocks
    for (let i = 0; i < 100; i++) {
      const block = await this.provider.getBlock(blockNumber - i);
      if (!block) continue;

      for (const txHash of block.transactions) {
        const tx = await this.provider.getTransaction(txHash);
        if (!tx) continue;
        
        if (tx.from.toLowerCase() === address.toLowerCase() || 
            tx.to?.toLowerCase() === address.toLowerCase()) {
          transactions.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to || '',
            value: tx.value.toString(),
            data: tx.data,
            gas: tx.gasLimit.toString(),
            gasPrice: tx.gasPrice?.toString() || '0',
            nonce: tx.nonce,
            chainId: tx.chainId.toString()
          });
        }
      }
    }

    return transactions;
  }

  public async estimateGas(transaction: TransactionRequest): Promise<string> {
    const gasEstimate = await this.provider.estimateGas({
      from: transaction.from,
      to: transaction.to,
      value: transaction.value ? ethers.BigNumber.from(transaction.value) : undefined,
      data: transaction.data
    });
    
    return gasEstimate.toString();
  }

  public async getGasPrice(): Promise<string> {
    const gasPrice = await this.provider.getGasPrice();
    return gasPrice.toString();
  }

  public async getNonce(address: string): Promise<number> {
    return await this.provider.getTransactionCount(address);
  }

  protected async getContract(address: string, abi: any[]): Promise<ethers.Contract> {
    return new ethers.Contract(address, abi, this.provider);
  }
} 