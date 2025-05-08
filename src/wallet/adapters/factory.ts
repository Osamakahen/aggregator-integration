import { DAppAdapter, DAppAdapterConfig, DAppAdapterFactory } from '../types';
import { UniswapAdapter } from './uniswap-adapter';
import { OpenSeaAdapter } from './opensea-adapter';
import { AaveAdapter } from './aave-adapter';

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
    const key = this.generateKey(config);
    
    if (this.adapters.has(key)) {
      return this.adapters.get(key)!;
    }

    let adapter: DAppAdapter;

    switch (config.type) {
      case 'uniswap':
        adapter = new UniswapAdapter(config);
        break;
      case 'opensea':
        adapter = new OpenSeaAdapter(config);
        break;
      case 'aave':
        adapter = new AaveAdapter(config);
        break;
      default:
        throw new Error(`Unsupported adapter type: ${config.type}`);
    }

    await adapter.initialize();
    this.adapters.set(key, adapter);
    return adapter;
  }

  public getAdapter(config: DAppAdapterConfig): DAppAdapter | undefined {
    const key = this.generateKey(config);
    return this.adapters.get(key);
  }

  public removeAdapter(config: DAppAdapterConfig): void {
    const key = this.generateKey(config);
    this.adapters.delete(key);
  }

  private generateKey(config: DAppAdapterConfig): string {
    return `${config.type}-${config.chainId}-${config.rpcUrl}`;
  }

  public cleanup(): void {
    this.adapters.clear();
  }
} 