'use client';
import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import InitializePool from './InitializePool';
import ManageLiquidity from './ManageLiquidity';
import Swap from './Swap';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const [activeTab, setActiveTab] = useState<'init' | 'liquidity' | 'swap'>('swap');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = () => {
    const injectedConnector = connectors.find(c => c.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    } else {
      // Fallback: try to connect with the first available connector
      connect({ connector: connectors[0] });
    }
  };

  const tabStyle = (tab: string) => ({
    padding: '0.75rem 1.5rem',
    cursor: 'pointer',
    borderBottom: activeTab === tab ? '3px solid #000' : '3px solid transparent',
    background: 'none',
    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
    fontSize: '1rem',
    fontWeight: activeTab === tab ? 'bold' : 'normal'
  });

  if (!mounted) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2>Loading NoFeeSwap...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>NoFeeSwap 🔄</h1>
        <div>
          {isConnected ? (
            <button style={{ padding: '0.5rem 1rem' }}>
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </button>
          ) : (
            <button onClick={handleConnect} disabled={isPending} style={{ padding: '0.5rem 1rem' }}>
              {isPending ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </header>

      {isConnected ? (
        <main>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #eee' }}>
            <button style={tabStyle('init')} onClick={() => setActiveTab('init')}>Init Pool</button>
            <button style={tabStyle('liquidity')} onClick={() => setActiveTab('liquidity')}>Liquidity</button>
            <button style={tabStyle('swap')} onClick={() => setActiveTab('swap')}>Swap</button>
          </div>

          <div>
            {activeTab === 'init' && <InitializePool />}
            {activeTab === 'liquidity' && <ManageLiquidity />}
            {activeTab === 'swap' && <Swap />}
          </div>
        </main>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h2>Welcome to NoFeeSwap!</h2>
          <p>Please connect your wallet to start interacting with the protocol.</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>Note: Use a Web3 wallet like MetaMask connected to Anvil (localhost:8546)</p>
        </div>
      )}
    </div>
  );
}