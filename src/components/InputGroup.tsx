import React, { type ChangeEvent } from 'react';

interface InputGroupProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  step?: number;
  suffix?: string;
  isPercentage?: boolean;
}

export const InputGroup: React.FC<InputGroupProps> = ({ 
  label, 
  value, 
  onChange, 
  step,
  suffix,
  isPercentage = false
}) => {
  // Format the number for display (e.g. 0.02 -> 2 if percentage)
  const formatValue = (val: number) => {
    return isPercentage ? parseFloat((val * 100).toFixed(3)) : val;
  };

  const defaultStep = isPercentage ? 0.1 : 0.01;
  const currentStep = step ?? defaultStep;

  // Local state to handle string input (allows empty string)
  const [localValue, setLocalValue] = React.useState<string>(formatValue(value).toString());

  // Sync local state when prop value changes externally
  // We compare parsed local value with new prop value to avoid cursor jumping or unwanted resets
  React.useEffect(() => {
    const newVal = formatValue(value);
    // If local value is empty (user clearing), don't force it back unless value changed significantly?
    // Actually, relying on dependency change is enough. If parent value changes, we must sync.
    // But if parent value DOES NOT change (e.g. we didn't call onChange), this effect won't run.
    setLocalValue(newVal.toString());
  }, [value, isPercentage]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputStr = e.target.value;
    setLocalValue(inputStr);

    // If empty, do NOT call onChange (keep parent value stale until blur or valid input)
    if (inputStr === '') {
      return;
    }

    const val = parseFloat(inputStr);
    if (!isNaN(val)) {
      if (isPercentage) {
        onChange(val / 100);
      } else {
        onChange(val);
      }
    }
  };

  const handleBlur = () => {
    // On blur, if empty, reset to 0
    if (localValue === '' || isNaN(parseFloat(localValue))) {
      onChange(0);
      setLocalValue('0');
    } else {
        // Ensure consistent formatting on blur (e.g. remove leading zeros or extra decimals if desired)
        // Or just let the useEffect sync it back from the parent's processed value
        const val = parseFloat(localValue);
        const parentVal = isPercentage ? val / 100 : val;
        // Triggering onChange again with same value might not trigger useEffect if React bails out,
        // so we manually ensure localValue is formatted.
        setLocalValue(formatValue(parentVal).toString());
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
        background: 'var(--input-bg)',
        border: '1px solid var(--input-border)',
        borderRadius: '8px',
        padding: '0 12px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
      } as React.CSSProperties}>
        <input 
          type="number" 
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          step={currentStep}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            padding: '10px 0',
            width: '100%',
            outline: 'none',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: 500
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
