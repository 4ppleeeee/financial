import React, { type ChangeEvent } from 'react';

interface InputGroupProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  step?: number;
  suffix?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({ 
  label, 
  value, 
  onChange, 
  step = 0.01,
  suffix 
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    // Allow empty/NaN during typing, but for this simple version we'll just handle valid numbers
    if (!isNaN(val)) {
      onChange(val);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ 
        color: 'var(--text-secondary)', 
        fontSize: '0.875rem',
        fontWeight: 500 
      }}>
        {label}
      </label>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--glass-border)',
        borderRadius: '8px',
        padding: '0 12px',
        focusWithin: 'border-color: var(--brand-primary)' 
      } as React.CSSProperties}>
        <input 
          type="number" 
          value={value}
          onChange={handleChange}
          step={step}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            padding: '12px 0',
            width: '100%',
            outline: 'none',
            fontSize: '1rem',
            fontFamily: 'var(--font-sans)'
          }}
        />
        {suffix && (
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginLeft: '8px' }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};
