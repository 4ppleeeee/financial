import React, { type CSSProperties } from 'react';

// Define the "Props" (arguments) this component accepts.
// Think of this like the constructor parameters for a custom View or Composable function.
interface FundingCardProps {
  title: string;
  amount: string;
  change: string;
  isPositive?: boolean;
}

// In React, components are just functions that return UI descriptions (JSX).
// This is very similar to a Jetpack Compose function.
export const FundingCard: React.FC<FundingCardProps> = ({ 
  title, 
  amount, 
  change, 
  isPositive = true 
}) => {
  
  // Inline styles for demonstration (CSS Modules or Styled Components are also popular)
  // We use the variables we defined earlier.
  const cardStyle: CSSProperties = {
    background: 'var(--glass-bg)',
    backdropFilter: `blur(var(--glass-blur))`,
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    transition: 'transform 0.2s ease',
    cursor: 'default',
  };

  const changeStyle: CSSProperties = {
    color: isPositive ? '#10b981' : '#ef4444',
    fontSize: '0.875rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  return (
    <div style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{title}</span>
      <h3 style={{ fontSize: '2rem', fontWeight: 600 }}>{amount}</h3>
      <div style={changeStyle}>
        <span>{isPositive ? '↑' : '↓'}</span>
        <span>{change}</span>
      </div>
    </div>
  );
};
