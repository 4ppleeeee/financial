import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceDot 
} from 'recharts';
import { InputGroup } from './InputGroup';

// 3-State Model Formulas (1 Year Horizon)

// p1: Benchmark (Cash Only / Free Rent)
// p1 = A * (1 + z)
const calculateP1 = (A: number, z: number) => {
  return A * (1 + z);
};

// p2: Buy (Mortgage)
// p2 = (A - B*m)*(1 + z) + B*(1 + x) - B*(1 - m)*(1 + r)
const calculateP2 = (A: number, B: number, m: number, x: number, r: number, z: number) => {
  const cashInv = (A - B * m) * (1 + z);
  const houseVal = B * (1 + x);
  const debtCost = B * (1 - m) * (1 + r);
  return cashInv + houseVal - debtCost;
};

// p3: Rent (Invest Difference)
// p3 = (A - B*b)*(1 + z)
const calculateP3 = (A: number, B: number, b: number, z: number) => {
  return (A - B * b) * (1 + z);
};

export const BuyVsRentCalculator: React.FC = () => {
  // Default values
  const [B, setB] = useState(5000000); // House Value (was S)
  const [m, setM] = useState(0.3);     // Down Payment
  const [A, setA] = useState(1500000); // Initial Cash (Default to Down Payment amount for logical start)
  
  const [x, setX] = useState(0.02);    // House Growth (was y)
  const [r, setR] = useState(0.04);    // Mortgage Rate (was x)
  const [z, setZ] = useState(0.03);    // Invest Return
  const [b, setB_Rent] = useState(0.015); // Rent Yield (renamed setter to avoid clash)

  // Auto-update A if it's too low (optional DX: at least cover down payment?)
  // For now, let user control A freely, but default was just a hint.
  
  // Update A default on mount if desired, but state preserves.

  // Current Results
  const currentP1 = calculateP1(A, z);
  const currentP2 = calculateP2(A, B, m, x, r, z);
  const currentP3 = calculateP3(A, B, b, z);

  // Chart 1: Sensitivity to House Growth (x)
  const dataX = useMemo(() => {
    const points = [];
    for (let i = -0.05; i <= 0.10; i += 0.005) { // -5% to +10%
      const valX = parseFloat(i.toFixed(3));
      points.push({
        xVal: valX,
        P1: currentP1,
        P2: calculateP2(A, B, m, valX, r, z),
        P3: currentP3,
      });
    }
    return points;
  }, [A, B, m, r, z, b, currentP1, currentP3]);

  // Chart 2: Sensitivity to Rent Yield (b)
  const dataB = useMemo(() => {
    const points = [];
    for (let i = 0.005; i <= 0.05; i += 0.001) { // 0.5% to 5%
      const valB = parseFloat(i.toFixed(3));
      points.push({
        bVal: valB,
        P1: currentP1, // Constant vs b
        P2: currentP2, // Constant vs b
        P3: calculateP3(A, B, valB, z),
      });
    }
    return points;
  }, [A, B, m, x, r, z, currentP1, currentP2]);

  // Break-even Analysis
  // 1. Break-even House Growth (x) where Buy (p2) == Rent (p3)
  // p2 = p3 => x = (m - b)*(1+z) + (1-m)*(1+r) - 1
  const breakEvenX = (m - b) * (1 + z) + (1 - m) * (1 + r) - 1;
  const breakEvenVal_X = currentP3; // At this x, P2 equals P3

  // 2. Break-even Rent Yield (b) where Rent (p3) == Buy (p2)
  // p3 = p2 => b = (A - p2/(1+z)) / B
  // Note: p2 here is based on the *current* x input
  const breakEvenB = (A - currentP2 / (1 + z)) / B;
  const breakEvenVal_B = currentP2; // At this b, P3 equals P2

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(val);

  const formatPercent = (val: number) => (val * 100).toFixed(1) + '%';
  const formatYAxis = (val: number) => (val / 10000).toFixed(0) + 'w';

  // Common Styles for Charts (Material 3)
  const chartCardStyle: React.CSSProperties = {
    background: 'var(--card-bg)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid var(--card-border)',
    boxShadow: 'var(--card-shadow)',
    flex: 1,
    minWidth: '500px'
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Inputs Panel */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '24px',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{ gridColumn: '1 / -1', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          基础参数
        </div>
        <InputGroup label="初始资金 (A)" value={A} onChange={setA} step={10000} suffix="CNY" />
        <InputGroup label="房产总值 (B)" value={B} onChange={setB} step={10000} suffix="CNY" />
        <InputGroup label="首付比例 (m)" value={m} onChange={setM} isPercentage suffix="%" />
        
        <div style={{ gridColumn: '1 / -1', height: '1px', background: 'var(--card-border)', margin: '8px 0' }} />
        
        <div style={{ gridColumn: '1 / -1', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          市场与利率
        </div>
        <InputGroup label="房价涨幅 (x)" value={x} onChange={setX} isPercentage suffix="%" />
        <InputGroup label="按揭利率 (r)" value={r} onChange={setR} isPercentage suffix="%" />
        <InputGroup label="理财收益 (z)" value={z} onChange={setZ} isPercentage suffix="%" />
        <InputGroup label="租售比 (b)" value={b} onChange={setB_Rent} isPercentage suffix="%" />
      </div>

      {/* Results Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <ResultCard title="基准 (免租)" value={currentP1} color="#9CA3AF" />
        <ResultCard title="买房 (p2)" value={currentP2} color="#2563EB" isPrimary />
        <ResultCard title="租房 (p3)" value={currentP3} color="#EA580C" />
      </div>

      {/* Charts Area */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        
        {/* Chart 1: Sensitivity to House Growth (x) */}
        <div style={chartCardStyle}>
          <h3 style={{ marginBottom: '8px', textAlign: 'center', color: 'var(--text-primary)' }}>房价涨幅敏感度 (x)</h3>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
            当房价涨幅变化时，买房(p2)收益的波动
          </p>
          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer>
              <LineChart data={dataX} margin={{ top: 10, right: 30, left: 10, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis 
                  dataKey="xVal" 
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  stroke="#9CA3AF" 
                  tickFormatter={formatPercent}
                  label={{ value: 'x (房价涨幅)', position: 'bottom', offset: 0, fill: '#6B7280' }} 
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  tickFormatter={formatYAxis} 
                  domain={['auto', 'auto']} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1F2937' }}
                  labelFormatter={(val) => `房价涨幅: ${formatPercent(val)}`}
                  formatter={(val: number) => formatCurrency(val)}
                />
                <Legend wrapperStyle={ {paddingTop: '20px'}} />
                <Line type="monotone" dataKey="P1" stroke="#9CA3AF" strokeDasharray="5 5" name="基准 (p1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="P2" stroke="#2563EB" name="买房 (p2)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="P3" stroke="#EA580C" name="租房 (p3)" strokeWidth={2} dot={false} />
                {/* Current Position Removed */}
                {/* Break-even Point */}
                <ReferenceDot 
                  x={breakEvenX} 
                  y={breakEvenVal_X} 
                  r={8} 
                  fill="#10B981" 
                  stroke="#fff" 
                  strokeWidth={2} 
                  label={{ value: '平衡点', position: 'top', fill: '#10B981', fontSize: 12, fontWeight: 'bold' }} 
                  ifOverflow="extendDomain"
                />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: '-30px', fontSize: '0.9rem', color: '#10B981', fontWeight: 600 }}>
              📈 房价涨幅平衡点: {formatPercent(breakEvenX)} <br/>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                (高于此值买房更优，低于此值租房更优)
              </span>
            </div>
          </div>
        </div>

         {/* Chart 2: Sensitivity to Rent Yield (b) */}
         <div style={chartCardStyle}>
          <h3 style={{ marginBottom: '8px', textAlign: 'center', color: 'var(--text-primary)' }}>租售比敏感度 (b)</h3>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
            当租金变化时，租房(p3)收益的波动
          </p>
          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer>
              <LineChart data={dataB} margin={{ top: 10, right: 30, left: 10, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis 
                  dataKey="bVal" 
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  stroke="#9CA3AF" 
                  tickFormatter={formatPercent}
                  label={{ value: 'b (租售比)', position: 'bottom', offset: 0, fill: '#6B7280' }} 
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  tickFormatter={formatYAxis} 
                  domain={['auto', 'auto']} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1F2937' }}
                  labelFormatter={(val) => `租售比: ${formatPercent(val)}`}
                  formatter={(val: number) => formatCurrency(val)}
                />
                <Legend wrapperStyle={ {paddingTop: '20px'}} />
                <Line type="monotone" dataKey="P1" stroke="#9CA3AF" strokeDasharray="5 5" name="基准 (p1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="P2" stroke="#2563EB" name="买房 (p2)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="P3" stroke="#EA580C" name="租房 (p3)" strokeWidth={3} dot={false} />
                {/* Current Position Removed */}
                 {/* Break-even Point */}
                 <ReferenceDot 
                   x={breakEvenB} 
                   y={breakEvenVal_B} 
                   r={8} 
                   fill="#10B981" 
                   stroke="#fff" 
                   strokeWidth={2} 
                   label={{ value: '平衡点', position: 'top', fill: '#10B981', fontSize: 12, fontWeight: 'bold' }} 
                   ifOverflow="extendDomain"
                 />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: '-30px', fontSize: '0.9rem', color: '#10B981', fontWeight: 600 }}>
              ⚖️ 租售比平衡点: {formatPercent(breakEvenB)} <br/>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                (低于此值买房更优，高于此值租房更优)
              </span>
            </div>
          </div>
        </div>

      </div>
      
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', opacity: 0.8 }}>
        * p1 (基准) = A(1+z) <br/>
        * p2 (买房) = (A - Bm)(1+z) + B(1+x) - B(1-m)(1+r) <br/>
        * p3 (租房) = (A - Bb)(1+z)
      </div>

    </div>
  );
};

// Helper Component for Results
const ResultCard: React.FC<{ title: string; value: number; color: string; isPrimary?: boolean }> = ({ title, value, color, isPrimary }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(val);

  return (
    <div style={{
      background: 'var(--card-bg)',
      border: `1px solid ${isPrimary ? color : 'var(--card-border)'}`,
      borderRadius: '16px',
      padding: '20px',
      textAlign: 'center',
      boxShadow: isPrimary ? `0 4px 12px ${color}20` : 'var(--card-shadow)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {isPrimary && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: color }} />}
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ color: color, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
        {formatCurrency(value)}
      </div>
    </div>
  );
};
