'use client';
import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { ERC20_ABI, ROUTER_ABI, TOKEN_A_ADDRESS, TOKEN_B_ADDRESS, ROUTER_ADDRESS } from './constants';

export default function Swap() {
  const { address } = useAccount();
  const [amountIn, setAmountIn] = useState('');
  const [slippage, setSlippage] = useState('1.0');
  const [estimatedOut, setEstimatedOut] = useState('0');
  const [priceImpact, setPriceImpact] = useState('0');
  
  const { writeContract: writeApprove } = useWriteContract();
  const { writeContract: writeSwap, data: hash, isPending } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Mock estimation - since getAmountsOut doesn't exist in SimpleRouter
  useEffect(() => {
    if (amountIn) {
      const mockOut = (parseFloat(amountIn) * 0.95).toFixed(4); // Mock 5% fee
      setEstimatedOut(mockOut);
      const impact = (parseFloat(amountIn) / 1000) * 0.5; // Mock impact
      setPriceImpact(impact.toFixed(2));
    } else {
      setEstimatedOut('0');
      setPriceImpact('0');
    }
  }, [amountIn]);

  const handleApprove = () => {
    writeApprove({
      address: TOKEN_A_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [ROUTER_ADDRESS as `0x${string}`, parseEther('1000000')],
    });
  };

  const handleSwap = () => {
    if (!address) return;
    
    const amountInWei = parseEther(amountIn || '0');
    const slippagePercent = parseFloat(slippage) / 100;
    const minOut = parseEther((parseFloat(estimatedOut) * (1 - slippagePercent)).toString());

    writeSwap({
      address: ROUTER_ADDRESS as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'swapExactTokensForTokens',
      args: [
        amountInWei,
        minOut,
        [TOKEN_A_ADDRESS as `0x${string}`, TOKEN_B_ADDRESS as `0x${string}`],
        address,
        BigInt(Math.floor(Date.now() / 1000) + 60 * 20)
      ]
    });
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Swap Tokens</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={handleApprove} style={{ padding: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
          1. Approve Token A
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block' }}>Amount In (Token A)</label>
        <input 
          type="number" 
          value={amountIn} 
          onChange={e => setAmountIn(e.target.value)} 
          style={{ padding: '0.5rem', width: '100%' }} 
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block' }}>Estimated Output (Token B): {estimatedOut}</label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block' }}>Price Impact: {priceImpact}%</label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block' }}>Slippage Tolerance (%)</label>
        <input 
          type="number" 
          value={slippage} 
          onChange={e => setSlippage(e.target.value)} 
          style={{ padding: '0.5rem', width: '100%' }} 
        />
      </div>

      <button 
        onClick={handleSwap} 
        disabled={isPending || isLoading || !amountIn}
        style={{ width: '100%', padding: '0.75rem', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
      >
        {isLoading ? 'Processing...' : 'Swap'}
      </button>

      {isSuccess && <div style={{ color: 'green', marginTop: '1rem' }}>Swap executed! TX: {hash}</div>}
    </div>
  );
}