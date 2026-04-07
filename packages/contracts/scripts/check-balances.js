const hre = require("hardhat");

async function main() {
  // Token addresses from deployment
  const tokenA = await hre.ethers.getContractAt("ERC20FixedSupply", "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44");
  const tokenB = await hre.ethers.getContractAt("ERC20FixedSupply", "0x4A679253410272dd5232B3Ff7cF5dbB88f295319");

  const deployerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const userAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

  console.log("Deployer Token A balance:", await tokenA.balanceOf(deployerAddress));
  console.log("Deployer Token B balance:", await tokenB.balanceOf(deployerAddress));
  console.log("User Token A balance:", await tokenA.balanceOf(userAddress));
  console.log("User Token B balance:", await tokenB.balanceOf(userAddress));
}

main().catch(console.error);