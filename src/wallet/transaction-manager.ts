import { EventEmitter } from 'events';
import { 
  TransactionRequest,
  TransactionResponse,
  TransactionReceipt,
  TransactionStatus
} from './types';

export class TransactionManager extends EventEmitter {
  private transactions: Map<string, TransactionStatus>;
  private readonly CONFIRMATION_THRESHOLD = 1;

  constructor() {
    super();
    this.transactions = new Map();
  }

  public async signAndSendTransaction(
    request: TransactionRequest,
    signer: (tx: TransactionRequest) => Promise<string>
  ): Promise<TransactionResponse> {
    try {
      // Validate transaction request
      this.validateTransactionRequest(request);

      // Sign the transaction
      const signedTx = await signer(request);

      // Create transaction response
      const response: TransactionResponse = {
        hash: signedTx,
        from: request.from,
        to: request.to,
        value: request.value || '0x0',
        data: request.data || '0x',
        gas: request.gas || '0x0',
        gasPrice: request.gasPrice || '0x0',
        nonce: request.nonce || 0,
        chainId: request.chainId || '1'
      };

      // Initialize transaction status
      this.transactions.set(signedTx, {
        hash: signedTx,
        status: 'pending'
      });

      this.emit('transactionSent', response);
      return response;
    } catch (error) {
      this.emit('transactionError', {
        request,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  public async trackTransaction(
    hash: string,
    provider: {
      getTransactionReceipt: (hash: string) => Promise<TransactionReceipt | null>;
      getTransaction: (hash: string) => Promise<TransactionResponse | null>;
    }
  ): Promise<TransactionReceipt> {
    const status = this.transactions.get(hash);
    if (!status) {
      throw new Error('Transaction not found');
    }

    try {
      // Wait for transaction receipt
      const receipt = await this.waitForTransactionReceipt(hash, provider);
      
      // Update transaction status
      const updatedStatus: TransactionStatus = {
        hash,
        status: receipt.status ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        confirmations: 1
      };
      
      this.transactions.set(hash, updatedStatus);
      this.emit('transactionConfirmed', { receipt, status: updatedStatus });
      
      return receipt;
    } catch (error) {
      const failedStatus: TransactionStatus = {
        hash,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.transactions.set(hash, failedStatus);
      this.emit('transactionFailed', { hash, error });
      
      throw error;
    }
  }

  public getTransactionStatus(hash: string): TransactionStatus | undefined {
    return this.transactions.get(hash);
  }

  private async waitForTransactionReceipt(
    hash: string,
    provider: {
      getTransactionReceipt: (hash: string) => Promise<TransactionReceipt | null>;
      getTransaction: (hash: string) => Promise<TransactionResponse | null>;
    }
  ): Promise<TransactionReceipt> {
    let receipt: TransactionReceipt | null = null;
    
    while (!receipt) {
      receipt = await provider.getTransactionReceipt(hash);
      if (!receipt) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return receipt;
  }

  private validateTransactionRequest(request: TransactionRequest): void {
    if (!request.from) {
      throw new Error('Transaction must include a from address');
    }
    if (!request.to) {
      throw new Error('Transaction must include a to address');
    }
    if (request.value && !this.isValidHex(request.value)) {
      throw new Error('Invalid value format');
    }
    if (request.data && !this.isValidHex(request.data)) {
      throw new Error('Invalid data format');
    }
    if (request.gas && !this.isValidHex(request.gas)) {
      throw new Error('Invalid gas format');
    }
    if (request.gasPrice && !this.isValidHex(request.gasPrice)) {
      throw new Error('Invalid gasPrice format');
    }
  }

  private isValidHex(value: string): boolean {
    return /^0x[0-9a-fA-F]+$/.test(value);
  }

  public cleanup(): void {
    this.transactions.clear();
  }
} 