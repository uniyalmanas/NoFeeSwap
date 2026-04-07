const hre = require("hardhat");

async function main() {
  const [victim] = await hre.ethers.getSigners();
  console.log("Victim address:", victim.address);

  // We use the deployed router address
  const routerAddress = "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0";
  const tokenAAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
  const tokenBAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

  const SimpleRouter = await hre.ethers.getContractAt("SimpleRouter", routerAddress);
  const TokenA = await hre.ethers.getContractAt("ERC20FixedSupply", tokenAAddress);

  // Approve router
  const approveTx = await TokenA.connect(victim).approve(routerAddress, hre.ethers.parseEther("1000000"));
  await approveTx.wait();
  console.log("Victim approved Token A for Router.");

  const amountIn = hre.ethers.parseEther("10");
  const amountOutMin = 0n;
  const path = [tokenAAddress, tokenBAddress];
  const to = victim.address;
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  console.log("\nVictim is broadcasting swap transaction...");
  console.log("Waiting for block to be mined (takes up to 30s due to interval mining)...");

  const tx = await SimpleRouter.connect(victim).swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    path,
    to,
    deadline
  );
  
  console.log("Transaction Hash:", tx.hash);
  
  // Wait for the transaction to be mined
  const receipt = await tx.wait();
  
  console.log("\nTransaction Mined in Block:", receipt.blockNumber);
  
  // Get block details to see if the bot sandwiched it
  const block = await hre.ethers.provider.getBlock(receipt.blockNumber);
  console.log("Total Transactions in this Block:", block.transactions.length);
  
  if (block.transactions.length >= 3) {
      console.log("✅ SUCCESS! The Bot successfully detected the transaction and injected the front-run and back-run.");
      for (let i = 0; i < block.transactions.length; i++) {
          const bTx = await hre.ethers.provider.getTransaction(block.transactions[i]);
          console.log(`   [Tx ${i}] Sender: ${bTx.from}, Gas Price: ${hre.ethers.formatUnits(bTx.gasPrice || 0, "gwei")} Gwei`);
      }
  } else {
      console.log("❌ FAILED: The Bot did not sandwich the transaction (Block only has " + block.transactions.length + " transactions).");
  }
}

main().catch(console.error);
