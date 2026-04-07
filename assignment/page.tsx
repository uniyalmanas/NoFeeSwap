'use client';
import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useSimulateContract } from 'wagmi';
import { parseEther } from 'viem';

// Setup actual operator and token addresses from your Deploy script run
const OPERATOR_ADDRESS = '0x0000000000000000000000000000000000000000';
const operatorAbi = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
      {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
      {"internalType": "address[]", "name": "path", "type": "address[]"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"}
    ],
    "name": "swapExactTokensForTokens",
    "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export default function SwapInterface() {
  const [amountIn, setAmountIn] = useState('');
  const [slippage, setSlippage] = useState('1.0');

  const { data: simulateData } = useSimulateContract({
    address: OPERATOR_ADDRESS as `0x${string}`,
    abi: operatorAbi,
    functionName: 'swapExactTokensForTokens',
    args: [
      parseEther(amountIn || '0'),
      0n, // Calculate min output dynamically relying on user slippage selection
      ['0x...', '0x...'], 
      '0x...', // Address from useAccount() hook
      BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
    ],
    query: { enabled: Boolean(amountIn) }
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const executeSwap = () => {
    if (simulateData?.request) writeContract(simulateData.request);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>NoFeeSwap 🔄</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>Amount In</label>
        <input type="number" value={amountIn} onChange={(e) => setAmountIn(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Slippage (%)</label>
        <input type="number" value={slippage} onChange={(e) => setSlippage(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
      </div>
      <button onClick={executeSwap} disabled={!simulateData || isLoading} style={{ width: '100%', padding: '1rem', background: '#333', color: '#fff', cursor: 'pointer' }}>
        {isLoading ? 'Processing...' : 'Execute Swap'}
      </button>
      {isSuccess && <div style={{ color: 'green', marginTop: '1rem' }}>Tx Confirmed! Hash: {hash}</div>}
    </div>
  );
}