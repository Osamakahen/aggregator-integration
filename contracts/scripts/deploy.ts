import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy AggregatorRouter with 1% max slippage (100 basis points)
  const AggregatorRouter = await ethers.getContractFactory("AggregatorRouter");
  const router = await AggregatorRouter.deploy(100);
  await router.deployed();

  console.log("AggregatorRouter deployed to:", router.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 