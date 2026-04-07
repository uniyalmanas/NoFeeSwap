pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import { ERC20Mock } from "../src/ERC20Mock.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Mock Tokens
        ERC20Mock tokenA = new ERC20Mock("Mock Token A", "TKNA", 1000000 * 10**18);
        ERC20Mock tokenB = new ERC20Mock("Mock Token B", "TKNB", 1000000 * 10**18);

        // 2. Deploy NoFeeSwap Core & Operator
        // Note: Instantiate core NoFeeSwap factory & operator contracts here.
        // Example:
        // Operator operator = new Operator(factoryAddress);

        vm.stopBroadcast();
    }
}