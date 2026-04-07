'use client';
import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther, parseAbi } from 'viem';
import { ERC20_ABI, ROUTER_ABI, TOKEN_A_ADDRESS, TOKEN_B_ADDRESS, ROUTER_ADDRESS } from './constants';

export default function ManageLiquidity() {
  const { address } = useAccount();
  const [amount0, setAmount0] = useState('');
  const [amount1, setAmount1] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  
  const { writeContract: writeApprove } = useWriteContract();
  const { writeContract: writeAddLiquidity, data: hash, isPending } = useWriteContract();
  const { writeContract: writeBurnLiquidity, data: burnHash, isPending: isBurnPending } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });
  const { isLoading: isBurnLoading, isSuccess: isBurnSuccess } = useWaitForTransactionReceipt({ burnHash });

  const handleApprove = () => {
    writeApprove({
      address: TOKEN_A_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [ROUTER_ADDRESS as `0x${string}`, parseEther('1000000')],
    });
    setTimeout(() => {
      writeApprove({
        address: TOKEN_B_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [ROUTER_ADDRESS as `0x${string}`, parseEther('1000000')],
      });
    }, 2000);
  };

  const handleBurnLiquidity = () => {
    writeBurnLiquidity({
      address: ROUTER_ADDRESS as `0x${string}`,
      abi: parseAbi(['function removeLiquidity(uint256 poolId, uint256 liquidity) external']),
      functionName: 'removeLiquidity',
      args: [0n, parseEther(burnAmount || '0')]
    });
  };

  const handleAddLiquidity = () => {
    writeAddLiquidity({
      address: ROUTER_ADDRESS as `0x${string}`,
      abi: parseAbi(['function addLiquidity(uint256 poolId, uint256 amount0, uint256 amount1) external']),
      functionName: 'addLiquidity',
      args: [0n, parseEther(amount0 || '0'), parseEther(amount1 || '0')]
    });
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Manage Liquidity (Mint/Burn)</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={handleApprove} style={{ padding: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
          1. Approve Tokens
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block' }}>Token A Amount</label>
          <input type="number" value={amount0} onChange={e => setAmount0(e.target.value)} style={{ padding: '0.5rem', width: '100%' }} />
        </div>
        <div>
          <label style={{ display: 'block' }}>Token B Amount</label>
          <input type="number" value={amount1} onChange={e => setAmount1(e.target.value)} style={{ padding: '0.5rem', width: '100%' }} />
        </div>
      </div>

      <button 
        onClick={handleAddLiquidity} 
        disabled={isPending || isLoading}
        style={{ width: '100%', padding: '0.75rem', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
      >
        {isLoading ? 'Processing...' : 'Add Liquidity'}
      </button>

      {isSuccess && <div style={{ color: 'green', marginTop: '1rem' }}>Liquidity added! TX: {hash}</div>}

      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Remove Liquidity</h3>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block' }}>Liquidity Amount to Burn</label>
          <input type="number" value={burnAmount} onChange={e => setBurnAmount(e.target.value)} style={{ padding: '0.5rem', width: '100%' }} />
        </div>
        <button 
          onClick={handleBurnLiquidity} 
          disabled={isBurnPending || isBurnLoading}
          style={{ width: '100%', padding: '0.75rem', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        >
          {isBurnLoading ? 'Processing...' : 'Burn Liquidity'}
        </button>
        {isBurnSuccess && <div style={{ color: 'green', marginTop: '1rem' }}>Liquidity burned! TX: {burnHash}</div>}
      </div>
    </div>
  );
}