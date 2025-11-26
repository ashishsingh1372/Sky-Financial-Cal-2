import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  prefix?: string;
}

const SliderInput: React.FC<SliderInputProps> = ({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step = 1, 
  unit = '',
  prefix = ''
}) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  // Update local input when prop changes, unless focused
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onChange(val);
    setInputValue(val.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (/^\d*\.?\d*$/.test(rawVal)) {
        setInputValue(rawVal);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    let val = parseFloat(inputValue);
    if (isNaN(val)) val = min;
    if (val < min) val = min;
    if (val > max) val = max;
    
    // Round to 2 decimals to prevent float errors
    val = Math.round(val * 100) / 100;
    onChange(val);
    setInputValue(val.toString());
  };

  const handleIncrement = () => {
      const newVal = Math.min(max, value + step);
      const rounded = Math.round(newVal * 100) / 100; 
      onChange(rounded);
  };

  const handleDecrement = () => {
      const newVal = Math.max(min, value - step);
      const rounded = Math.round(newVal * 100) / 100;
      onChange(rounded);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="w-full py-0.5 sm:py-2">
      <div className="flex justify-between items-center mb-0.5 sm:mb-3">
        <label className="text-[8px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 mb-1 sm:mb-5">
        <button 
            onClick={handleDecrement}
            className="w-6 h-6 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded sm:rounded-2xl bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md touch-manipulation"
            disabled={value <= min}
            aria-label="Decrease"
        >
            <Minus size={10} className="sm:w-5 sm:h-5" strokeWidth={3} />
        </button>

        <div className={`
            flex-1 flex items-center justify-center gap-0.5 sm:gap-1 h-8 sm:h-16 px-1 rounded sm:rounded-2xl transition-all duration-300 border cursor-text group relative overflow-hidden
            ${isFocused 
                ? 'border-indigo-500 bg-indigo-50/20 shadow-inner' 
                : 'border-slate-100 bg-white hover:border-indigo-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]'
            }
        `}>
           <span className={`text-base sm:text-2xl font-bold mb-0.5 sm:mb-1 ${isFocused ? 'text-indigo-600' : 'text-slate-500'}`}>{prefix}</span>
           <input
             type="text"
             inputMode="decimal"
             value={inputValue}
             onChange={handleInputChange}
             onBlur={handleInputBlur}
             onFocus={() => setIsFocused(true)}
             onKeyDown={handleKeyDown}
             className={`w-full min-w-0 text-center text-lg sm:text-3xl font-bold bg-transparent outline-none transition-colors ${isFocused ? 'text-indigo-700' : 'text-slate-800'}`}
           />
           <span className={`text-sm sm:text-xl font-bold self-end mb-1.5 sm:mb-3 ${isFocused ? 'text-indigo-400' : 'text-slate-500'}`}>{unit}</span>
        </div>

        <button 
            onClick={handleIncrement}
            className="w-6 h-6 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded sm:rounded-2xl bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md touch-manipulation"
            disabled={value >= max}
            aria-label="Increase"
        >
            <Plus size={10} className="sm:w-5 sm:h-5" strokeWidth={3} />
        </button>
      </div>

      <div className="relative h-2 sm:h-5 flex items-center select-none group px-0.5 sm:px-1">
        {/* Track */}
        <div className="absolute w-full h-0.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
             <div 
               className="h-full bg-gradient-to-r from-indigo-400 to-purple-500"
               style={{ width: `${percentage}%` }}
             />
        </div>

        {/* Native Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="absolute w-full h-full opacity-0 cursor-pointer z-20"
        />

        {/* Custom Thumb */}
        <div 
            className={`
                absolute h-2.5 w-2.5 sm:h-5 sm:w-5 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.2)] border-[1.5px] sm:border-[3px] border-indigo-500
                z-10 pointer-events-none transition-transform duration-100 ease-out
                group-hover:scale-125
            `}
            style={{ left: `calc(${percentage}% - 5px)` }} 
        />
      </div>
      
      <div className="flex justify-between text-[6px] sm:text-[10px] font-bold text-slate-300 select-none px-0.5 pt-0.5">
        <span>{prefix}{min.toLocaleString('en-IN')}</span>
        <span>{prefix}{max.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
};

export default SliderInput;