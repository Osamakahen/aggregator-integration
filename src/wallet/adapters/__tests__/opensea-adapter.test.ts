import { ethers } from 'ethers';
import { OpenSeaAdapter } from '../opensea-adapter';
import { DAppAdapterConfig } from '../../types';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('ethers');

describe('OpenSeaAdapter', () => {
  let adapter: OpenSeaAdapter;
  let config: DAppAdapterConfig;
  let mockProvider: any;
  let mockSeaportContract: any;
  let mockConduitContract: any;

  beforeEach(() => {
    config = {
      type: 'opensea',
      rpcUrl: 'https://mainnet.infura.io/v3/test',
      chainId: '1',
      contracts: {
        seaport: '0x00000000006c3852cbEf3e08E8dF289169EdE581',
        conduit: '0x1E0049783F008A0085193E00003D00cd54003c71'
      }
    };

    mockProvider = {
      getNetwork: vi.fn().mockResolvedValue({ chainId: 1 }),
      getBalance: vi.fn().mockResolvedValue(ethers.utils.parseEther('1.0')),
      getTransactionCount: vi.fn().mockResolvedValue(1),
      estimateGas: vi.fn().mockResolvedValue(ethers.utils.parseUnits('21000', 'wei')),
      getGasPrice: vi.fn().mockResolvedValue(ethers.utils.parseUnits('50', 'gwei'))
    };

    mockSeaportContract = {
      interface: {
        encodeFunctionData: vi.fn().mockReturnValue('0x')
      },
      validate: vi.fn().mockResolvedValue(true),
      getOrderStatus: vi.fn().mockResolvedValue({
        isValid: true,
        isCancelled: false,
        isFulfilled: false
      })
    };

    mockConduitContract = {
      interface: {
        encodeFunctionData: vi.fn().mockReturnValue('0x')
      },
      getApproval: vi.fn().mockResolvedValue(true)
    };

    (ethers.Contract as any).mockImplementation((address: string) => {
      if (address === config.contracts.seaport) {
        return mockSeaportContract;
      }
      if (address === config.contracts.conduit) {
        return mockConduitContract;
      }
      return {
        interface: {
          encodeFunctionData: vi.fn().mockReturnValue('0x')
        },
        ownerOf: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
        tokenURI: vi.fn().mockResolvedValue('ipfs://Qm...'),
        isApprovedForAll: vi.fn().mockResolvedValue(false),
        setApprovalForAll: vi.fn().mockResolvedValue(true)
      };
    });

    adapter = new OpenSeaAdapter(config);
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await expect(adapter.initialize()).resolves.not.toThrow();
    });
  });

  describe('getNFTDetails', () => {
    it('should return NFT details', async () => {
      const nftAddress = '0x1234567890123456789012345678901234567890';
      const tokenId = '1';

      const details = await adapter.getNFTDetails(nftAddress, tokenId);

      expect(details).toEqual({
        owner: '0x1234567890123456789012345678901234567890',
        metadata: 'ipfs://Qm...'
      });
    });
  });

  describe('createBuyOrderTransaction', () => {
    it('should create buy order transaction', async () => {
      const params = {
        order: {
          parameters: {
            offerer: '0x1234567890123456789012345678901234567890',
            zone: '0x0000000000000000000000000000000000000000',
            offer: [{
              itemType: 2, // ERC721
              token: '0x1234567890123456789012345678901234567890',
              identifierOrCriteria: '1',
              startAmount: '1',
              endAmount: '1'
            }],
            consideration: [{
              itemType: 0, // NATIVE
              token: '0x0000000000000000000000000000000000000000',
              identifierOrCriteria: '0',
              startAmount: '1000000000000000000',
              endAmount: '1000000000000000000',
              recipient: '0x1234567890123456789012345678901234567890'
            }]
          },
          signature: '0x'
        },
        from: '0x1234567890123456789012345678901234567890'
      };

      const tx = await adapter.createBuyOrderTransaction(params);

      expect(tx).toEqual({
        from: params.from,
        to: config.contracts.seaport,
        data: '0x'
      });
      expect(mockSeaportContract.interface.encodeFunctionData).toHaveBeenCalled();
    });
  });

  describe('validateOrders', () => {
    it('should validate orders', async () => {
      const orders = [{
        parameters: {
          offerer: '0x1234567890123456789012345678901234567890',
          zone: '0x0000000000000000000000000000000000000000',
          offer: [{
            itemType: 2,
            token: '0x1234567890123456789012345678901234567890',
            identifierOrCriteria: '1',
            startAmount: '1',
            endAmount: '1'
          }],
          consideration: [{
            itemType: 0,
            token: '0x0000000000000000000000000000000000000000',
            identifierOrCriteria: '0',
            startAmount: '1000000000000000000',
            endAmount: '1000000000000000000',
            recipient: '0x1234567890123456789012345678901234567890'
          }]
        },
        signature: '0x'
      }];

      const result = await adapter.validateOrders(orders);

      expect(result).toBe(true);
      expect(mockSeaportContract.validate).toHaveBeenCalledWith(orders);
    });
  });

  describe('approveNFT', () => {
    it('should create approve transaction', async () => {
      const params = {
        nftAddress: '0x1234567890123456789012345678901234567890',
        from: '0x1234567890123456789012345678901234567890'
      };

      const tx = await adapter.approveNFT(params.nftAddress, '1', params.from);

      expect(tx).toEqual({
        from: params.from,
        to: params.nftAddress,
        data: '0x'
      });
    });
  });

  describe('approveAllNFTs', () => {
    it('should create approve all transaction', async () => {
      const params = {
        nftAddress: '0x1234567890123456789012345678901234567890',
        from: '0x1234567890123456789012345678901234567890'
      };

      const tx = await adapter.approveAllNFTs(params.nftAddress, params.from);

      expect(tx).toEqual({
        from: params.from,
        to: params.nftAddress,
        data: '0x'
      });
    });
  });

  describe('getNFTListings', () => {
    it('should return NFT listings', async () => {
      const nftAddress = '0x1234567890123456789012345678901234567890';
      const tokenId = '1';

      const listings = await adapter.getNFTListings(nftAddress, tokenId);

      expect(listings).toEqual([]);
    });
  });
}); 