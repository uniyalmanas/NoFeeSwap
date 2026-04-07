import { parseAbi } from 'viem';

export const TOKEN_A_ADDRESS = '0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44';
export const TOKEN_B_ADDRESS = '0x4A679253410272dd5232B3Ff7cF5dbB88f295319';
export const DELEGATEE_ADDRESS = '0xc5a5C42992dECbae36851359345FE25997F5C42d';
export const CORE_ADDRESS = '0x67d269191c92Caf3cD7723F116c85e6E9bf55933';
export const ROUTER_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

export const ERC20_ABI = parseAbi([
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
]);

export const DELEGATEE_ABI = parseAbi([
  'function initialize(uint256 unsaltedPoolId, uint256 tag0, uint256 tag1, uint256 poolGrowthPortion, uint256[] calldata kernelCompactArray, uint256[] calldata curveArray, bytes calldata hookData) external'
]);

export const ROUTER_ABI = parseAbi([
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)'
]);