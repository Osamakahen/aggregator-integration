// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MockAggregator {
    using SafeERC20 for IERC20;

    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external returns (uint256 amountOut) {
        // Transfer tokens from caller
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Calculate output amount (1:1 ratio for simplicity)
        amountOut = amountIn;
        require(amountOut >= minAmountOut, "Slippage too high");

        // Transfer tokens to caller
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);

        return amountOut;
    }
} 