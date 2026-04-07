'use client';
import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { DELEGATEE_ADDRESS, DELEGATEE_ABI, TOKEN_A_ADDRESS, TOKEN_B_ADDRESS } from './constants';

export default function InitializePool() {
  const [logOffset, setLogOffset] = useState('0');
  
  // Mock kernel data for visualization
  const kernelData = [
    { logPrice: -10, liquidity: 0 },
    { logPrice: -5, liquidity: 100 },
    { logPrice: 0, liquidity: 500 },
    { logPrice: 5, liquidity: 100 },
    { logPrice: 10, liquidity: 0 },
  ];
  
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleInit = () => {
    // 1. Convert Token Addresses to integer tags (as required by NoFeeSwap yellowpaper/code)
    const tag0 = BigInt(TOKEN_A_ADDRESS);
    const tag1 = BigInt(TOKEN_B_ADDRESS);
    
    // Sort tags (tag0 must be < tag1 per initialize logic)
    const sortedTags = tag0 < tag1 ? [tag0, tag1] : [tag1, tag0];

    // 2. Unsalted poolId using mock bit shifting
    // poolId = (n << 188) + (twosComplementInt8(logOffset) << 180) + hookAddress
    // We just mock it for this demonstration
    const unsaltedPoolId = (1n << 188n) + (0n << 180n) + 0n; // Simple mock ID

    // 3. poolGrowthPortion
    const poolGrowthPortion = (1n << 47n) / 5n; // 20%

    // 4. kernel & curve mock (From SwapData_test.py)
    // kernel = [[0, 0], [logPriceSpacingLargeX59, 2 ** 15]]
    // We mock the compact kernel array 
    const kernelCompactArray = [0n]; 
    const curveArray = [0n, 1000n, 500n]; 

    writeContract({
      address: DELEGATEE_ADDRESS as `0x${string}`,
      abi: DELEGATEE_ABI,
      functionName: 'initialize',
      args: [
        unsaltedPoolId,
        sortedTags[0],
        sortedTags[1],
        poolGrowthPortion,
        kernelCompactArray,
        curveArray,
        "0x"
      ]
    });
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Initialize Liquidity Pool</h2>
      <p>Configure the basic parameters to initialize a new NoFeeSwap pool.</p>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Log Offset</label>
        <input 
          type="number" 
          value={logOffset} 
          onChange={(e) => setLogOffset(e.target.value)} 
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} 
        />
        
        <p style={{ fontSize: '0.85rem', color: '#666' }}>
          * Using mock Kernel and Curve parameters from SwapData_test.py
        </p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h3>Kernel Visualization</h3>
        <LineChart width={400} height={200} data={kernelData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="logPrice" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="liquidity" stroke="#8884d8" />
        </LineChart>
      </div>

      <button 
        onClick={handleInit} 
        disabled={isLoading}
        style={{ width: '100%', padding: '0.75rem', background: '#0066cc', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
      >
        {isLoading ? 'Initializing...' : 'Initialize Pool'}
      </button>

      {isSuccess && (
        <div style={{ marginTop: '1rem', color: 'green' }}>
          Pool Initialized successfully! Hash: {hash}
        </div>
      )}
    </div>
  );
}