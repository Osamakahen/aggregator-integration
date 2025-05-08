import { BaseAdapter } from './base-adapter';
import { DAppAdapterConfig, TransactionRequest } from '../types';
import { ethers } from 'ethers';

const OPENSEA_SEAPORT = '0x00000000006c3852cbEf3e08E8dF289169EdE581';
const OPENSEA_CONDUIT = '0x1E0049783F008A0085193E00003D00cd54003c71';

const OPENSEA_SEAPORT_ABI = [
  'function fulfillOrder(tuple(address offerer, address zone, tuple(uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] offer, tuple(uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] consideration, uint8 orderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 conduitKey, uint256 counter) order, bytes32 fulfillerConduitKey) external payable returns (bool fulfilled)',
  'function validate(tuple(address offerer, address zone, tuple(uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] offer, tuple(uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] consideration, uint8 orderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 conduitKey, uint256 counter)[] orders) external returns (bool[] validated)'
];

const ERC721_ABI = [
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function approve(address to, uint256 tokenId) external',
  'function setApprovalForAll(address operator, bool approved) external'
];

export class OpenSeaAdapter extends BaseAdapter {
  private seaport: ethers.Contract;
  private readonly API_BASE_URL = 'https://api.opensea.io/api/v1';

  constructor(config: DAppAdapterConfig) {
    super(config);
    this.seaport = new ethers.Contract(OPENSEA_SEAPORT, OPENSEA_SEAPORT_ABI, this.provider);
  }

  get name(): string {
    return 'OpenSea';
  }

  get version(): string {
    return '1.0.0';
  }

  get supportedNetworks(): string[] {
    return ['1', '5']; // Mainnet and Goerli
  }

  public async getNFTDetails(
    contractAddress: string,
    tokenId: string
  ): Promise<{
    owner: string;
    tokenURI: string;
    metadata?: any;
  }> {
    const nftContract = await this.getContract(contractAddress, ERC721_ABI);
    
    const [owner, tokenURI] = await Promise.all([
      nftContract.ownerOf(tokenId),
      nftContract.tokenURI(tokenId)
    ]);

    let metadata;
    try {
      const response = await fetch(tokenURI);
      metadata = await response.json();
    } catch (error) {
      console.warn('Failed to fetch NFT metadata:', error);
    }

    return {
      owner,
      tokenURI,
      metadata
    };
  }

  public async createBuyOrderTransaction(
    params: {
      order: any; // OpenSea order structure
      from: string;
      value?: string;
    }
  ): Promise<TransactionRequest> {
    const data = this.seaport.interface.encodeFunctionData('fulfillOrder', [
      params.order,
      ethers.constants.HashZero // fulfillerConduitKey
    ]);

    return {
      from: params.from,
      to: OPENSEA_SEAPORT,
      data,
      value: params.value || '0x0'
    };
  }

  public async validateOrders(orders: any[]): Promise<boolean[]> {
    return await this.seaport.validate(orders);
  }

  public async approveNFT(
    contractAddress: string,
    tokenId: string,
    from: string
  ): Promise<TransactionRequest> {
    const nftContract = await this.getContract(contractAddress, ERC721_ABI);
    const data = nftContract.interface.encodeFunctionData('approve', [
      OPENSEA_SEAPORT,
      tokenId
    ]);

    return {
      from,
      to: contractAddress,
      data
    };
  }

  public async approveAllNFTs(
    contractAddress: string,
    from: string
  ): Promise<TransactionRequest> {
    const nftContract = await this.getContract(contractAddress, ERC721_ABI);
    const data = nftContract.interface.encodeFunctionData('setApprovalForAll', [
      OPENSEA_SEAPORT,
      true
    ]);

    return {
      from,
      to: contractAddress,
      data
    };
  }

  public async getNFTListings(
    contractAddress: string,
    tokenId: string
  ): Promise<any[]> {
    if (!this.config.apiKey) {
      throw new Error('OpenSea API key is required');
    }

    const response = await fetch(
      `${this.API_BASE_URL}/asset/${contractAddress}/${tokenId}/listings/`,
      {
        headers: {
          'X-API-KEY': this.config.apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch NFT listings');
    }

    const data = await response.json();
    return data.listings || [];
  }
} 