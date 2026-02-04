import React, { useState, useMemo } from 'react';
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

// T1: Buy (Asset)
// S*y - (1-m)*S*24/25 + S*b*(1+z)
const calculateT1 = (S: number, y: number, m: number, b: number, z: number) => {
  const term1 = S * y; // Property value at end (assuming y is price multiplier)
  const term2 = (1 - m) * S * (24 / 25); // Remaining Debt? Or Cost? Formula: -(1-m)S*24/25
  const term3 = S * b * (1 + z); // Rent income invested? Or implicit value?
  return term1 - term2 + term3;
};

// T2: Rent (Invest)
// S*m + S*m*z + (1-m)*S*(1/25+x)*(z+1)
const calculateT2 = (S: number, m: number, z: number, x: number) => {
  const term1 = S * m; // Initial Capital (Down payment saved)
  const term2 = S * m * z; // Investment return on capital
  // Term 3: (1-m)S is the loan amount. (1/25 + x) implies Principal Repayment (1/25) + Interest (x).
  // This is the monthly calculation? Or yearly? Assuming annual payments saved.
  const term3 = (1 - m) * S * (1/25 + x) * (z + 1); 
  return term1 + term2 + term3;
};

export const BuyVsRentCalculator: React.FC = () => {
  // Default values
  const [S, setS] = useState(5000000); // 5 Million
  const [m, setM] = useState(0.3); // 30% Down
  const [x, setX] = useState(0.04); // 4% Mortgage Rate
  const [y, setY] = useState(1.02); // 2% Price Growth (Multiplier)
  const [z, setZ] = useState(0.03); // 3% Investment Return
  const [b, setB] = useState(0.015); // 1.5% Rent to Value

  // Chart 1 Data: Vary Y (Price Fluctuation)
  const dataY = useMemo(() => {
    const points = [];
    // Range from 0.9 ( -10%) to 1.3 (+30%)
    for (let i = 0.90; i <= 1.30; i += 0.01) {
      const valY = parseFloat(i.toFixed(2));
      points.push({
        yVal: valY, // X-Axis
        T1: calculateT1(S, valY, m, b, z),
        T2: calculateT2(S, m, z, x), // T2 doesn't depend on y
      });
    }
    return points;
  }, [S, m, b, z, x]);

  // Chart 2 Data: Vary B (Rent Yield)
  const dataB = useMemo(() => {
    const points = [];
    // Range from 0.005 (0.5%) to 0.05 (5%)
    for (let i = 0.005; i <= 0.05; i += 0.001) {
      const valB = parseFloat(i.toFixed(3));
      points.push({
        bVal: valB, // X-Axis
        T1: calculateT1(S, y, m, valB, z),
        T2: calculateT2(S, m, z, x), // T2 doesn't depend on b (Formula check: T2 has no b)
      });
    }
    return points;
  }, [S, m, y, z, x]);

  // Current values for Reference Dot
  const currentT1 = calculateT1(S, y, m, b, z);
  const currentT2 = calculateT2(S, m, z, x);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(val);

  const formatYAxis = (val: number) => (val / 10000).toFixed(0) + 'w';

  // Chart 3: Break-even Map (b needed for T1=T2 at given y)
  // Formula: b = (T2 - (S*y - DebtCost)) / (S*(1+z))
  // Where DebtCost = (1-m)*S*24/25
  const dataBreakEven = useMemo(() => {
    const points = [];
    const DebtCost = (1 - m) * S * (24 / 25);
    const T2_val = calculateT2(S, m, z, x);
    
    // Scan y range
    for (let i = 0.90; i <= 1.30; i += 0.01) {
      const valY = parseFloat(i.toFixed(2));
      let requiredB = (T2_val - S * valY + DebtCost) / (S * (1 + z));
      if (requiredB < 0) requiredB = 0; 
      
      points.push({
        yVal: valY,
        bBreakEven: parseFloat(requiredB.toFixed(4)),
        bUser: valY === y ? b : null 
      });
    }
    return points;
  }, [S, m, z, x, b, y]);

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Inputs Panel */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <InputGroup label="房产总值 (S)" value={S} onChange={setS} step={10000} suffix="CNY" />
        <InputGroup label="首付比例 (m)" value={m} onChange={setM} step={0.01} suffix="Ratio" />
        <InputGroup label="按揭利率 (x)" value={x} onChange={setX} step={0.001} suffix="%" />
        <InputGroup label="房价变动系数 (y)" value={y} onChange={setY} step={0.01} suffix="Dec" />
        <InputGroup label="理财收益率 (z)" value={z} onChange={setZ} step={0.001} suffix="%" />
        <InputGroup label="租售比 (b)" value={b} onChange={setB} step={0.001} suffix="%" />
      </div>

      {/* Results Summary */}
      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#8884d8', fontWeight: 600 }}>买房 (T1)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(currentT1)}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#82ca9d', fontWeight: 600 }}>租房 (T2)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(currentT2)}</div>
        </div>
      </div>

      {/* Charts Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
        
        {/* Chart 3: Break-even Map (The New 2D Chart) */}
        <div style={{ 
          gridColumn: '1 / -1', // Span full width
          background: 'var(--glass-bg)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid var(--glass-border)'
        }}>
          <h3 style={{ marginBottom: '8px', textAlign: 'center' }}>盈亏平衡决策图 (Decision Map)</h3>
          <p style={{ textAlign: 'center', color: '#aaa', fontSize: '0.875rem', marginBottom: '24px' }}>
            红线上方：租金收益高，<b>买房划算</b> | 红线下方：房价跌幅大，<b>租房划算</b>
          </p>
          <div style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer>
              <LineChart data={dataBreakEven} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="yVal" 
                  stroke="#eee" 
                  domain={[0.9, 1.3]} 
                  type="number"
                  tickCount={9}
                  allowDecimals={true}
                  label={{ value: '房价系数 (y) → 房价上涨', position: 'bottom', offset: 0, fill: '#aaa' }} 
                />
                <YAxis 
                  stroke="#eee" 
                  domain={[0, 'auto']} 
                  label={{ value: '租售比 (b) → 租金回报', angle: -90, position: 'insideLeft', fill: '#aaa' }} 
                  tickFormatter={(val) => (val * 100).toFixed(1) + '%'}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  labelFormatter={(val) => `房价系数: ${val}`}
                  formatter={(val: number | undefined) => val !== undefined ? [(val * 100).toFixed(2) + '%', '平衡租售比'] : []}
                />
                <Legend />
                {/* The Break-even Line */}
                <Line 
                  type="monotone" 
                  dataKey="bBreakEven" 
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  name="盈亏平衡线 (T1=T2)" 
                  dot={false}
                  animationDuration={500}
                />
                {/* The User's Current Position */}
                <ReferenceDot 
                  x={y} 
                  y={b} 
                  r={8} 
                  fill="#3b82f6" 
                  stroke="#fff"
                  strokeWidth={2}
                  label={{ value: '当前点', position: 'top', fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Existing Charts (Smaller, below) */}
        <div style={{ 
          background: 'var(--glass-bg)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid var(--glass-border)'
        }}>
          <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>房价敏感度分析 (y)</h3>
          <div style={{ height: '250px', width: '100%' }}>
             <ResponsiveContainer>
              <LineChart data={dataY} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="yVal" stroke="#666" domain={['auto', 'auto']} label={{ value: 'y (房价系数)', position: 'bottom', offset: 0 }} />
                <YAxis stroke="#666" tickFormatter={formatYAxis} domain={['auto', 'auto']} label={{ value: '期末总值 (万元)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(val: number | undefined) => val !== undefined ? formatCurrency(val) : ''}
                />
                <Legend />
                <Line type="monotone" dataKey="T1" stroke="#8884d8" name="买房 (T1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="T2" stroke="#82ca9d" name="租房 (T2)" strokeWidth={2} dot={false} />
                <ReferenceDot x={y} y={currentT1} r={6} fill="#8884d8" stroke="none" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
         <div style={{ 
          background: 'var(--glass-bg)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid var(--glass-border)'
        }}>
          <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>租售比敏感度分析 (b)</h3>
          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer>
              <LineChart data={dataB} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="bVal" stroke="#666" domain={['auto', 'auto']} label={{ value: 'b (租售比)', position: 'bottom', offset: 0 }} />
                <YAxis stroke="#666" tickFormatter={formatYAxis} domain={['auto', 'auto']} label={{ value: '期末总值 (万元)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(val: number | undefined) => val !== undefined ? formatCurrency(val) : ''}
                />
                <Legend />
                <Line type="monotone" dataKey="T1" stroke="#8884d8" name="买房 (T1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="T2" stroke="#82ca9d" name="租房 (T2)" strokeWidth={2} dot={false} />
                <ReferenceDot x={b} y={currentT1} r={6} fill="#8884d8" stroke="none" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
      
      <div style={{ textAlign: 'center', color: '#666', fontSize: '0.8rem', fontStyle: 'italic' }}>
        *T1 Formula: S*y - (1-m)S*24/25 + S*b(1+z) <br/>
        *T2 Formula: S*m + S*m*z + (1-m)*S*(1/25+x)*(z+1)
      </div>

    </div>
  );
};
