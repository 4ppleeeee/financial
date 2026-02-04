import React from 'react';
import { BuyVsRentCalculator } from './components/BuyVsRentCalculator';

function App() {
  
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, var(--bg-primary) 70%)',
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
          background: 'rgba(59, 130, 246, 0.1)', 
          color: 'var(--brand-primary)',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          Financial Pro 2.0
        </div>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 700, 
          letterSpacing: '-0.02em',
          background: 'linear-gradient(to right, #fff, #94a3b8)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          marginBottom: '16px'
        }}>
          买房 vs 租房 投资回报分析
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
          可视化分析房产价格波动 (y) 和租售比 (b) 对长期财富积累的影响。
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
