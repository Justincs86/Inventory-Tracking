
import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (newValue: number) => void;
  label?: string;
}

const QuantityStepper: React.FC<QuantityStepperProps> = ({ 
  value, 
  min = 1, 
  max = Infinity, 
  onChange,
  label
}) => {
  const [inputValue, setInputValue] = useState<string>(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    const newVal = Math.max(min, value - 1);
    onChange(newVal);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    const newVal = Math.min(max, value + 1);
    onChange(newVal);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (rawValue === '' || /^[0-9]+$/.test(rawValue)) {
      setInputValue(rawValue);
      const numericVal = parseInt(rawValue, 10);
      if (!isNaN(numericVal) && numericVal >= min && numericVal <= max) {
        onChange(numericVal);
      }
    }
  };

  const handleBlur = () => {
    let numericVal = parseInt(inputValue, 10);
    if (isNaN(numericVal)) numericVal = min;
    const clampedVal = Math.min(max, Math.max(min, numericVal));
    setInputValue(clampedVal.toString());
    onChange(clampedVal);
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block ml-1 transition-colors">
          {label}
        </label>
      )}
      <div className="flex items-stretch bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm h-14 focus-within:border-blue-500 dark:focus-within:border-blue-700 transition-all">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className={`w-14 sm:w-16 flex items-center justify-center transition-all ${
            value <= min 
              ? 'bg-slate-50 dark:bg-slate-950 text-slate-300 dark:text-slate-700' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600'
          }`}
          aria-label="Decrease"
        >
          <Minus className="w-6 h-6 stroke-[2.5]" />
        </button>
        
        <div className="flex-1 relative bg-white dark:bg-slate-900">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            className="w-full h-full text-center font-black text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none text-xl transition-colors"
            placeholder="0"
          />
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className={`w-14 sm:w-16 flex items-center justify-center transition-all ${
            value >= max 
              ? 'bg-slate-50 dark:bg-slate-950 text-slate-300 dark:text-slate-700' 
              : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60 active:bg-blue-300'
          }`}
          aria-label="Increase"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

export default QuantityStepper;
