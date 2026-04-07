const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  try {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // Deploy SimpleRouter at the expected address
    const SimpleRouter = await hre.ethers.getContractFactory("SimpleRouter");
    const router = await SimpleRouter.deploy("0x0000000000000000000000000000000000000000"); // Mock core address
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();

    console.log("SimpleRouter deployed at:", routerAddress);

    // Check if it matches expected
    if (routerAddress.toLowerCase() === "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0".toLowerCase()) {
      console.log("✅ Router deployed at expected address!");
    } else {
      console.log("⚠️ Router deployed at different address. Update constants.ts");
    }

  } catch (error) {
    console.error("Deployment failed:", error);
  }
}

main();