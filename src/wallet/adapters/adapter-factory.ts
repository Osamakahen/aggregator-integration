import { DAppAdapter, DAppAdapterConfig, DAppAdapterFactory } from '../types';
import { UniswapAdapter } from './uniswap-adapter';

export class AdapterFactory implements DAppAdapterFactory {
  private static instance: AdapterFactory;
  private adapters: Map<string, DAppAdapter>;

  private constructor() {
    this.adapters = new Map();
  }

  public static getInstance(): AdapterFactory {
    if (!AdapterFactory.instance) {
      AdapterFactory.instance = new AdapterFactory();
    }
    return AdapterFactory.instance;
  }

  public async createAdapter(config: DAppAdapterConfig): Promise<DAppAdapter> {
    // Check if adapter already exists for this configuration
    const key = this.getAdapterKey(config);
    if (this.adapters.has(key)) {
      return this.adapters.get(key)!;
    }

    // Create new adapter based on configuration
    let adapter: DAppAdapter;

    // In a real implementation, you would have a registry of adapters
    // and create the appropriate one based on the configuration
    if (config.contracts['uniswap']) {
      adapter = new UniswapAdapter(config);
    } else {
      throw new Error('No suitable adapter found for the given configuration');
    }

    // Initialize the adapter
    await adapter.initialize();

    // Store the adapter
    this.adapters.set(key, adapter);

    return adapter;
  }

  public getAdapter(config: DAppAdapterConfig): DAppAdapter | undefined {
    const key = this.getAdapterKey(config);
    return this.adapters.get(key);
  }

  public removeAdapter(config: DAppAdapterConfig): boolean {
    const key = this.getAdapterKey(config);
    return this.adapters.delete(key);
  }

  private getAdapterKey(config: DAppAdapterConfig): string {
    return `${config.chainId}_${Object.keys(config.contracts).sort().join('_')}`;
  }

  public cleanup(): void {
    this.adapters.clear();
  }
} 