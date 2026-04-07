const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // Token addresses from deployment
  const tokenA = await hre.ethers.getContractAt("ERC20FixedSupply", "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44");
  const tokenB = await hre.ethers.getContractAt("ERC20FixedSupply", "0x4A679253410272dd5232B3Ff7cF5dbB88f295319");

  // User's MetaMask account (the one imported with private key)
  const userAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

  console.log("Transferring tokens to user:", userAddress);

  // Transfer 100,000 tokens of each to user
  await tokenA.transfer(userAddress, hre.ethers.parseEther("100000"));
  await tokenB.transfer(userAddress, hre.ethers.parseEther("100000"));

  console.log("✅ Tokens transferred!");
  console.log("Token A balance:", await tokenA.balanceOf(userAddress));
  console.log("Token B balance:", await tokenB.balanceOf(userAddress));
}

main().catch(console.error);