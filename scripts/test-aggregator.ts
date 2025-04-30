import { ethers } from 'ethers';
import { UniswapAggregator } from '../src/aggregators/uniswap';
import dotenv from 'dotenv';

dotenv.config();

// Token addresses
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

async function main() {
  // Initialize provider and aggregator
  const provider = new ethers.providers.JsonRpcProvider(
    `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`
  );

  const uniswap = new UniswapAggregator({
    rpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`
  });

  try {
    // Get quote for 1 WETH to USDC
    console.log('Getting quote for 1 WETH to USDC...');
    const quote = await uniswap.getQuote({
      fromTokenAddress: WETH,
      toTokenAddress: USDC,
      amount: ethers.utils.parseEther('1').toString(),
      userAddress: ethers.constants.AddressZero
    });

    console.log('Quote received:');
    console.log(`Expected output: ${ethers.utils.formatUnits(quote.toAmount, 6)} USDC`);
    console.log(`Estimated gas: ${quote.estimatedGas}`);
    console.log(`Price impact: ${quote.priceImpact}%`);

    // Get optimal fee tier
    console.log('\nChecking pool liquidity...');
    const ethBalance = await provider.getBalance(WETH);
    console.log(`WETH contract balance: ${ethers.utils.formatEther(ethBalance)} ETH`);

    // Test features
    console.log('\nSupported features:');
    const features = uniswap.getFeatures();
    console.log(JSON.stringify(features, null, 2));

  } catch (error) {
    console.error('Error testing aggregator:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 