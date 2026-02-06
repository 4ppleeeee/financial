import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import { useLoad } from '@tarojs/taro';
import { EChart } from '../../components/EChart'; // Use local wrapper
import './index.scss';

// Import ECharts core and components
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  TitleComponent // Add TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// Register ECharts components
echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  TitleComponent, // Register TitleComponent
  CanvasRenderer
]);

// ----------------------------------------------------------------------
// 1. Logic & Formulas (Direct Port)
// ----------------------------------------------------------------------

const calculateP1 = (A: number, z: number) => A * (1 + z);

const calculateP2 = (A: number, B: number, m: number, x: number, r: number, z: number) => {
  const cashInv = (A - B * m) * (1 + z);
  const houseVal = B * (1 + x);
  const debtCost = B * (1 - m) * (1 + r);
  return cashInv + houseVal - debtCost;
};

const calculateP3 = (A: number, B: number, b: number, z: number) => {
  return (A - B * b) * (1 + z);
};

// ----------------------------------------------------------------------
// 2. Helper Components (InputGroup & ResultCard)
// ----------------------------------------------------------------------

interface InputGroupProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  step?: number;
  suffix?: string;
  isPercentage?: boolean;
}

const InputGroup: React.FC<InputGroupProps> = ({ 
  label, value, onChange, isPercentage = false, suffix
}) => {
  const formatValue = (val: number) => isPercentage ? parseFloat((val * 100).toFixed(3)) : val;
  const [localValue, setLocalValue] = useState<string>(formatValue(value).toString());

  useEffect(() => {
    setLocalValue(formatValue(value).toString());
  }, [value, isPercentage]);

  const handleInput = (e: any) => {
    const inputStr = e.detail.value;
    setLocalValue(inputStr);
    if (inputStr === '') return;
    const val = parseFloat(inputStr);
    if (!isNaN(val)) {
      onChange(isPercentage ? val / 100 : val);
    }
  };

  const handleBlur = (e: any) => {
    const valStr = e.detail.value;
    if (valStr === '' || isNaN(parseFloat(valStr))) {
      onChange(0);
      setLocalValue('0');
    } else {
      const val = parseFloat(valStr);
      const parentVal = isPercentage ? val / 100 : val;
      setLocalValue(formatValue(parentVal).toString());
    }
  };

  return (
    <View className="input-group">
      <Text className="input-label">{label}</Text>
      <View className="input-wrapper">
        <Input 
          className="input-field" 
          type="digit" // Use digit for better keyboard
          value={localValue} 
          onInput={handleInput} 
          onBlur={handleBlur} 
        />
        {suffix && <Text className="input-suffix">{suffix}</Text>}
      </View>
    </View>
  );
};

const ResultCard: React.FC<{ title: string; value: number; color: string; isPrimary?: boolean }> = ({ title, value, color, isPrimary }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(val);
  
  return (
    <View className={`result-card ${isPrimary ? 'primary' : ''}`} style={{ borderColor: isPrimary ? color : 'var(--card-border)' }}>
      {isPrimary && <View className="primary-bar" style={{ background: color }} />}
      <Text className="card-title">{title}</Text>
      <Text className="card-value" style={{ color }}>{formatCurrency(value)}</Text>
    </View>
  );
};

// ----------------------------------------------------------------------
// 3. Main Page Component
// ----------------------------------------------------------------------

export default function Index() {
  // State
  const [B, setB] = useState(5000000); 
  const [m, setM] = useState(0.3);     
  const [A, setA] = useState(1500000); 
  const [x, setX] = useState(0.02);    
  const [r, setR] = useState(0.04);    
  const [z, setZ] = useState(0.03);    
  const [b, setB_Rent] = useState(0.015);

  // Results
  const currentP1 = calculateP1(A, z);
  const currentP2 = calculateP2(A, B, m, x, r, z);
  const currentP3 = calculateP3(A, B, b, z);

  // Break-even
  const breakEvenX = (m - b) * (1 + z) + (1 - m) * (1 + r) - 1;
  const breakEvenB = (A - currentP2 / (1 + z)) / B;

  // Chart Data Generation
  const getChartOptionX = () => {
    const xData: string[] = [];
    const p1Data: number[] = [];
    const p2Data: number[] = [];
    const p3Data: number[] = [];
    
    // Generate data points
    for (let i = -0.05; i <= 0.10; i += 0.005) {    
      const valX = parseFloat(i.toFixed(3));
      const p1 = calculateP1(A, z);
      const p2 = calculateP2(A, B, m, valX, r, z);
      const p3 = calculateP3(A, B, b, z); 
      
      xData.push((valX * 100).toFixed(1) + '%'); 
      p1Data.push(Math.round(p1));
      p2Data.push(Math.round(p2));
      p3Data.push(Math.round(p3));
    }

    return {
      title: { text: '房价涨幅敏感度 (x)', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { 
        trigger: 'axis',
        formatter: (params: any) => {
          let res = params[0].name + '<br/>';
          params.forEach((item: any) => {
            res += item.marker + item.seriesName + ': ' + (item.value / 10000).toFixed(0) + 'w<br/>';
          });
          return res;
        }
      },
      legend: { bottom: 0, data: ['基准', '买房', '租房'] },
      grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
      xAxis: { type: 'category', data: xData, name: '房价涨幅' },
      yAxis: { type: 'value', axisLabel: { formatter: (val: number) => (val/10000).toFixed(0) + 'w' } },
      series: [
        { 
          name: '基准', type: 'line', data: p1Data, 
          itemStyle: { color: '#9CA3AF' }, lineStyle: { type: 'dashed' }, symbol: 'none' 
        },
        { 
          name: '买房', type: 'line', data: p2Data, 
          itemStyle: { color: '#2563EB' }, lineStyle: { width: 3 }, symbol: 'none'
        },
        { 
          name: '租房', type: 'line', data: p3Data, 
          itemStyle: { color: '#EA580C' }, symbol: 'none' 
        }
      ]
    };
  };

  const getChartOptionB = () => {
    const xData: string[] = [];
    const p1Data: number[] = [];
    const p2Data: number[] = [];
    const p3Data: number[] = [];
    
    for (let i = 0.005; i <= 0.05; i += 0.001) {
      const valB = parseFloat(i.toFixed(3));
      const p1 = currentP1;
      const p2 = currentP2;
      const p3 = calculateP3(A, B, valB, z);
      
      xData.push((valB * 100).toFixed(1) + '%');
      p1Data.push(Math.round(p1));
      p2Data.push(Math.round(p2));
      p3Data.push(Math.round(p3));
    }

    return {
      title: { text: '租售比敏感度 (b)', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { 
        trigger: 'axis',
        formatter: (params: any) => {
          let res = params[0].name + '<br/>';
          params.forEach((item: any) => {
            res += item.marker + item.seriesName + ': ' + (item.value / 10000).toFixed(0) + 'w<br/>';
          });
          return res;
        }
      },
      legend: { bottom: 0, data: ['基准', '买房', '租房'] },
      grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
      xAxis: { type: 'category', data: xData, name: '租售比' },
      yAxis: { type: 'value', axisLabel: { formatter: (val: number) => (val/10000).toFixed(0) + 'w' } },
      series: [
        { 
          name: '基准', type: 'line', data: p1Data, 
          itemStyle: { color: '#9CA3AF' }, lineStyle: { type: 'dashed' }, symbol: 'none' 
        },
        { 
          name: '买房', type: 'line', data: p2Data, 
          itemStyle: { color: '#2563EB' }, symbol: 'none' 
        },
        { 
          name: '租房', type: 'line', data: p3Data, 
          itemStyle: { color: '#EA580C' }, lineStyle: { width: 3 }, symbol: 'none'
        }
      ]
    };
  };

  const formatPercent = (val: number) => (val * 100).toFixed(1) + '%';

  return (
    <ScrollView className='index' scrollY>
      <View className="container">
        {/* Input Panel */}
        <View className="card input-panel">
          <Text className="section-title">基础参数</Text>
          <InputGroup label="初始资金 (A)" value={A} onChange={setA} step={10000} suffix="CNY" />
          <InputGroup label="房产总值 (B)" value={B} onChange={setB} step={10000} suffix="CNY" />
          <InputGroup label="首付比例 (m)" value={m} onChange={setM} isPercentage suffix="%" />
          
          <View className="divider" />
          
          <Text className="section-title">市场与利率</Text>
          <InputGroup label="房价涨幅 (x)" value={x} onChange={setX} isPercentage suffix="%" />
          <InputGroup label="按揭利率 (r)" value={r} onChange={setR} isPercentage suffix="%" />
          <InputGroup label="理财收益 (z)" value={z} onChange={setZ} isPercentage suffix="%" />
          <InputGroup label="租售比 (b)" value={b} onChange={setB_Rent} isPercentage suffix="%" />
        </View>

        {/* Results */}
        <View className="results-grid">
          <ResultCard title="基准" value={currentP1} color="#9CA3AF" />
          <ResultCard title="买房 (p2)" value={currentP2} color="#2563EB" isPrimary />
          <ResultCard title="租房 (p3)" value={currentP3} color="#EA580C" />
        </View>

        {/* Charts */}
        <View className="card chart-card">
          <EChart echarts={echarts} option={getChartOptionX()} style={{ width: '100%', height: '300px' }} />
          <View className="chart-footer">
            <Text className="chart-hint">📈 房价涨幅平衡点: {formatPercent(breakEvenX)}</Text>
          </View>
        </View>

        <View className="card chart-card">
          <EChart echarts={echarts} option={getChartOptionB()} style={{ width: '100%', height: '300px' }} />
          <View className="chart-footer">
             <Text className="chart-hint">⚖️ 租售比平衡点: {formatPercent(breakEvenB)}</Text>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}
