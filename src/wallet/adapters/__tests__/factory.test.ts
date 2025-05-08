import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterFactory } from '../factory';
import { UniswapAdapter } from '../uniswap-adapter';
import { OpenSeaAdapter } from '../opensea-adapter';
import { AaveAdapter } from '../aave-adapter';
import { DAppAdapterConfig } from '../../types';

vi.mock('../uniswap-adapter');
vi.mock('../opensea-adapter');
vi.mock('../aave-adapter');

describe('AdapterFactory', () => {
  let factory: AdapterFactory;
  let config: DAppAdapterConfig;

  beforeEach(() => {
    factory = AdapterFactory.getInstance();
    config = {
      type: 'uniswap' as const,
      rpcUrl: 'https://mainnet.infura.io/v3/test',
      chainId: '1',
      contracts: {
        router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
      }
    };

    vi.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = AdapterFactory.getInstance();
      const instance2 = AdapterFactory.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('createAdapter', () => {
    it('should create a Uniswap adapter', async () => {
      const adapter = await factory.createAdapter(config);
      expect(adapter).toBeInstanceOf(UniswapAdapter);
      expect(UniswapAdapter).toHaveBeenCalledWith(config);
    });

    it('should create an OpenSea adapter', async () => {
      const openSeaConfig: DAppAdapterConfig = { ...config, type: 'opensea' };
      const adapter = await factory.createAdapter(openSeaConfig);
      expect(adapter).toBeInstanceOf(OpenSeaAdapter);
      expect(OpenSeaAdapter).toHaveBeenCalledWith(openSeaConfig);
    });

    it('should create an Aave adapter', async () => {
      const aaveConfig: DAppAdapterConfig = { ...config, type: 'aave' };
      const adapter = await factory.createAdapter(aaveConfig);
      expect(adapter).toBeInstanceOf(AaveAdapter);
      expect(AaveAdapter).toHaveBeenCalledWith(aaveConfig);
    });

    it('should throw error for unsupported adapter type', async () => {
      const unsupportedConfig = { ...config, type: 'unsupported' as any };
      await expect(factory.createAdapter(unsupportedConfig)).rejects.toThrow(
        'Unsupported adapter type: unsupported'
      );
    });

    it('should return cached adapter for same config', async () => {
      const adapter1 = await factory.createAdapter(config);
      const adapter2 = await factory.createAdapter(config);
      expect(adapter1).toBe(adapter2);
      expect(UniswapAdapter).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAdapter', () => {
    it('should return undefined for non-existent adapter', () => {
      const adapter = factory.getAdapter(config);
      expect(adapter).toBeUndefined();
    });

    it('should return existing adapter', async () => {
      const createdAdapter = await factory.createAdapter(config);
      const retrievedAdapter = factory.getAdapter(config);
      expect(retrievedAdapter).toBe(createdAdapter);
    });
  });

  describe('removeAdapter', () => {
    it('should remove adapter', async () => {
      await factory.createAdapter(config);
      factory.removeAdapter(config);
      const adapter = factory.getAdapter(config);
      expect(adapter).toBeUndefined();
    });
  });

  describe('cleanup', () => {
    it('should clear all adapters', async () => {
      await factory.createAdapter(config);
      factory.cleanup();
      const adapter = factory.getAdapter(config);
      expect(adapter).toBeUndefined();
    });
  });
}); 