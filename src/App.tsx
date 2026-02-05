import React from 'react';
import { BuyVsRentCalculator } from './components/BuyVsRentCalculator';

function App() {
  
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'var(--bg-primary)',
    padding: '48px 20px',
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '48px',
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ 
          display: 'inline-block', 
          padding: '6px 12px', 
          borderRadius: '99px', 
          background: 'var(--brand-surface)', 
          color: 'var(--brand-primary)',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          Financial Pro 2.0
        </div>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          marginBottom: '16px'
        }}>
          买房 vs 租房 投资回报分析
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
          基于全新的三态模型 (p1/p2/p3)，助您做出更理性的资产配置决策。
        </p>
      </header>
      
      <BuyVsRentCalculator />
      
      <footer style={{ marginTop: 'auto', paddingTop: '48px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        技术支持：React + Vite + Recharts
      </footer>
    </div>
  );
}

export default App;
