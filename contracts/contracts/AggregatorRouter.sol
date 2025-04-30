// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract AggregatorRouter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // State variables
    bool public paused;
    mapping(bytes32 => address) public aggregators;
    mapping(address => bool) public whitelistedTokens;
    uint256 public maxSlippageBps; // Maximum allowed slippage in basis points (1 = 0.01%)

    // Events
    event Paused(bool isPaused);
    event AggregatorSet(bytes32 indexed name, address indexed aggregator);
    event TokenWhitelisted(address indexed token, bool whitelisted);
    event MaxSlippageUpdated(uint256 newMaxSlippageBps);
    event SwapExecuted(
        bytes32 indexed aggregatorName,
        address indexed user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    // Errors
    error ContractPaused();
    error InvalidAggregator();
    error TokenNotWhitelisted();
    error SlippageTooHigh();
    error TransferFailed();
    error InvalidAmount();

    constructor(uint256 _maxSlippageBps) {
        maxSlippageBps = _maxSlippageBps;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }

    function setAggregator(bytes32 name, address aggregator) external onlyOwner {
        aggregators[name] = aggregator;
        emit AggregatorSet(name, aggregator);
    }

    function setTokenWhitelist(address token, bool whitelisted) external onlyOwner {
        whitelistedTokens[token] = whitelisted;
        emit TokenWhitelisted(token, whitelisted);
    }

    function setMaxSlippage(uint256 _maxSlippageBps) external onlyOwner {
        maxSlippageBps = _maxSlippageBps;
        emit MaxSlippageUpdated(_maxSlippageBps);
    }

    function executeSwap(
        bytes32 aggregatorName,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        bytes calldata swapData
    ) external nonReentrant whenNotPaused returns (uint256 amountOut) {
        // Validate inputs
        if (amountIn == 0) revert InvalidAmount();
        if (!whitelistedTokens[tokenIn] || !whitelistedTokens[tokenOut]) revert TokenNotWhitelisted();
        
        address aggregator = aggregators[aggregatorName];
        if (aggregator == address(0)) revert InvalidAggregator();

        // Calculate maximum allowed slippage
        uint256 maxAmountOut = (amountIn * (10000 + maxSlippageBps)) / 10000;
        if (minAmountOut > maxAmountOut) revert SlippageTooHigh();

        // Transfer tokens from user
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Approve aggregator to spend tokens
        IERC20(tokenIn).safeApprove(aggregator, amountIn);

        // Execute swap
        (bool success, bytes memory result) = aggregator.call(swapData);
        if (!success) {
            // Revert approval in case of failure
            IERC20(tokenIn).safeApprove(aggregator, 0);
            revert();
        }

        // Get actual amount out
        amountOut = IERC20(tokenOut).balanceOf(address(this));
        if (amountOut < minAmountOut) revert SlippageTooHigh();

        // Transfer tokens to user
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);

        emit SwapExecuted(
            aggregatorName,
            msg.sender,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut
        );

        return amountOut;
    }

    // Emergency function to recover stuck tokens
    function recoverTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
} 