// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface INofeeswap {
    function unlock(address operator, bytes calldata data) external returns (bytes memory result);
    function swap(
        uint256 poolId,
        int256 amountSpecified,
        int256 logPriceLimit,
        uint256 zeroForOne,
        bytes calldata hookData
    ) external returns (int256 amount0, int256 amount1);
}

interface IUnlockCallback {
    function unlockCallback(address sender, bytes calldata data) external returns (bytes memory result);
}

contract SimpleRouter is IUnlockCallback {
    address public immutable nofeeswap;

    constructor(address _nofeeswap) {
        nofeeswap = _nofeeswap;
    }

    struct SwapData {
        uint256 poolId;
        int256 amountSpecified;
        int256 logPriceLimit;
        uint256 zeroForOne;
        address tokenIn;
        address tokenOut;
        address to;
    }

    function addLiquidity(uint256 poolId, uint256 amount0, uint256 amount1) external { 
        IERC20(0x0165878A594ca255338adfa4d48449f69242Eb8F).transferFrom(msg.sender, address(this), amount0); 
        IERC20(0xa513E6E4b8f2a923D98304ec87F64353C4D5C853).transferFrom(msg.sender, address(this), amount1); 
    }

    function removeLiquidity(uint256 poolId, uint256 liquidity) external {}

    // Function signature matches the Bot's expectation
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts) {
        require(block.timestamp <= deadline, "EXPIRED");
        
        // Transfer tokens from user to this router
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        
        // We pack the swap details and call unlock
        // For simplicity we'll assume zeroForOne is 2 (any) or we derive from path
        // poolId is 0 for this mock, or we can hardcode
        SwapData memory data = SwapData({
            poolId: 0, // This needs to be the actual poolId, we'll pass it in or construct it
            amountSpecified: int256(amountIn),
            logPriceLimit: 0, // Mock
            zeroForOne: 2,
            tokenIn: path[0],
            tokenOut: path[1],
            to: to
        });
        
        INofeeswap(nofeeswap).unlock(address(this), abi.encode(data));
        
        // This is a simplified mock. We just return mock amounts array
        amounts = new uint256[](2);
        amounts[0] = amountIn;
        amounts[1] = amountOutMin;
    }

    function unlockCallback(address sender, bytes calldata data) external override returns (bytes memory result) {
        require(msg.sender == nofeeswap, "Only nofeeswap");
        SwapData memory swapData = abi.decode(data, (SwapData));

        // Approve Nofeeswap to take our tokens
        IERC20(swapData.tokenIn).approve(nofeeswap, uint256(swapData.amountSpecified));

        // Call the actual swap
        INofeeswap(nofeeswap).swap(
            swapData.poolId,
            swapData.amountSpecified,
            swapData.logPriceLimit,
            swapData.zeroForOne,
            ""
        );

        // Nofeeswap should have sent us the output tokens. Send them to 'to'
        uint256 outBalance = IERC20(swapData.tokenOut).balanceOf(address(this));
        IERC20(swapData.tokenOut).transfer(swapData.to, outBalance);

        return "";
    }
}
