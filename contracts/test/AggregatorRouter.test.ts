import { expect } from "chai";
import { ethers } from "hardhat";
import { AggregatorRouter } from "../typechain-types/contracts/AggregatorRouter";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";

describe("AggregatorRouter", function () {
  let router: AggregatorRouter;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let tokenIn: Contract;
  let tokenOut: Contract;
  let aggregator: Contract;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy mock tokens
    const Token = await ethers.getContractFactory("ERC20Mock");
    tokenIn = await Token.deploy("Token In", "TKI", 18);
    tokenOut = await Token.deploy("Token Out", "TKO", 18);

    // Deploy mock aggregator
    const MockAggregator = await ethers.getContractFactory("MockAggregator");
    aggregator = await MockAggregator.deploy();

    // Deploy router
    const AggregatorRouter = await ethers.getContractFactory("AggregatorRouter");
    router = (await AggregatorRouter.deploy(100)) as AggregatorRouter; // 1% max slippage
    await router.deployed();

    // Setup
    await router.setAggregator(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MOCK")), aggregator.address);
    await router.setTokenWhitelist(tokenIn.address, true);
    await router.setTokenWhitelist(tokenOut.address, true);

    // Mint tokens to user
    await tokenIn.mint(user.address, ethers.utils.parseEther("1000"));
    await tokenOut.mint(aggregator.address, ethers.utils.parseEther("1000"));
  });

  it("should execute swap successfully", async function () {
    const amountIn = ethers.utils.parseEther("100");
    const minAmountOut = ethers.utils.parseEther("99"); // 1% slippage

    // Approve router to spend tokens
    await tokenIn.connect(user).approve(router.address, amountIn);

    // Execute swap
    const swapData = aggregator.interface.encodeFunctionData("swap", [
      tokenIn.address,
      tokenOut.address,
      amountIn,
      minAmountOut
    ]);

    await expect(
      router.connect(user).executeSwap(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MOCK")),
        tokenIn.address,
        tokenOut.address,
        amountIn,
        minAmountOut,
        swapData
      )
    ).to.emit(router, "SwapExecuted");
  });

  it("should revert when contract is paused", async function () {
    await router.setPaused(true);

    const amountIn = ethers.utils.parseEther("100");
    const minAmountOut = ethers.utils.parseEther("99");

    await tokenIn.connect(user).approve(router.address, amountIn);

    const swapData = aggregator.interface.encodeFunctionData("swap", [
      tokenIn.address,
      tokenOut.address,
      amountIn,
      minAmountOut
    ]);

    await expect(
      router.connect(user).executeSwap(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MOCK")),
        tokenIn.address,
        tokenOut.address,
        amountIn,
        minAmountOut,
        swapData
      )
    ).to.be.revertedWithCustomError(router, "ContractPaused");
  });

  it("should revert when token is not whitelisted", async function () {
    await router.setTokenWhitelist(tokenIn.address, false);

    const amountIn = ethers.utils.parseEther("100");
    const minAmountOut = ethers.utils.parseEther("99");

    await tokenIn.connect(user).approve(router.address, amountIn);

    const swapData = aggregator.interface.encodeFunctionData("swap", [
      tokenIn.address,
      tokenOut.address,
      amountIn,
      minAmountOut
    ]);

    await expect(
      router.connect(user).executeSwap(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MOCK")),
        tokenIn.address,
        tokenOut.address,
        amountIn,
        minAmountOut,
        swapData
      )
    ).to.be.revertedWithCustomError(router, "TokenNotWhitelisted");
  });

  it("should revert when slippage is too high", async function () {
    const amountIn = ethers.utils.parseEther("100");
    const minAmountOut = ethers.utils.parseEther("102"); // More than 1% slippage

    await tokenIn.connect(user).approve(router.address, amountIn);

    const swapData = aggregator.interface.encodeFunctionData("swap", [
      tokenIn.address,
      tokenOut.address,
      amountIn,
      minAmountOut
    ]);

    await expect(
      router.connect(user).executeSwap(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MOCK")),
        tokenIn.address,
        tokenOut.address,
        amountIn,
        minAmountOut,
        swapData
      )
    ).to.be.revertedWithCustomError(router, "SlippageTooHigh");
  });
}); 