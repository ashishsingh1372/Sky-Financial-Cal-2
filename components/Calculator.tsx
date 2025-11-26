import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CalculatorType, CalculatorInput } from '../types';
import { calculateFinancials, formatCurrency } from '../utils/financials';
import SliderInput from './SliderInput';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { IndianRupee, TrendingUp, Calendar, Calculator as CalcIcon, Info, RotateCcw } from 'lucide-react';

interface CalculatorProps {
  type: CalculatorType;
}

// Helper for animating numbers
const AnimatedAmount = ({ value, className = "" }: { value: number, className?: string }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const startValueRef = useRef<number>(value);

  useEffect(() => {
    startValueRef.current = displayValue;
    startTimeRef.current = performance.now();
    
    const animate = (time: number) => {
      const elapsed = time - startTimeRef.current;
      const duration = 600;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4); // Quartic ease out for smoother finish
      
      const current = startValueRef.current + (value - startValueRef.current) * ease;
      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  return <span className={className}>{formatCurrency(Math.round(displayValue))}</span>;
};

const Calculator: React.FC<CalculatorProps> = ({ type }) => {
  const getDefaults = (t: CalculatorType): CalculatorInput => {
    switch (t) {
      case CalculatorType.SIP: return { amount: 5000, rate: 12, duration: 10 };
      case CalculatorType.EMI: return { amount: 5000000, rate: 9, duration: 20 };
      case CalculatorType.PPF: return { amount: 100000, rate: 7.1, duration: 15 };
      // Default deductions set to 0 so only Standard Deduction applies initially
      case CalculatorType.TAX: return { amount: 1200000, rate: 0, duration: 0, deductions: 0 }; 
      case CalculatorType.LUMPSUM: return { amount: 100000, rate: 12, duration: 10 };
      default: return { amount: 1000, rate: 10, duration: 10 };
    }
  };

  const [values, setValues] = useState<CalculatorInput>(getDefaults(type));

  // Reset when type changes
  React.useEffect(() => {
    setValues(getDefaults(type));
  }, [type]);

  const handleReset = () => {
    setValues(getDefaults(type));
  };

  const result = useMemo(() => calculateFinancials(type, values), [type, values]);

  const renderSliders = () => {
    const isTax = type === CalculatorType.TAX;
    
    return (
      <div className="space-y-1 sm:space-y-8 animate-fade-in-up px-0.5 sm:px-2">
        <SliderInput
          label={type === CalculatorType.EMI ? "Loan Amount" : (isTax ? "Annual Income" : (type === CalculatorType.PPF ? "Yearly Investment" : "Monthly Investment"))}
          value={values.amount}
          onChange={(val) => setValues({ ...values, amount: val })}
          min={isTax ? 500000 : 500}
          max={type === CalculatorType.EMI ? 10000000 : (isTax ? 5000000 : 500000)}
          step={isTax ? 10000 : 500}
          prefix="₹"
        />

        {/* Logic for Tax Calculator Inputs */}
        {isTax ? (
          <SliderInput
            label="Other Deductions (Old Regime)"
            value={values.deductions || 0}
            onChange={(val) => setValues({ ...values, deductions: val })}
            min={0}
            max={500000}
            step={5000}
            prefix="₹"
          />
        ) : (
          <>
            <SliderInput
              label={type === CalculatorType.EMI ? "Interest Rate" : "Expected Return Rate"}
              value={values.rate}
              onChange={(val) => setValues({ ...values, rate: val })}
              min={1}
              max={30}
              step={0.1}
              unit="%"
            />
            <SliderInput
              label={type === CalculatorType.EMI ? "Loan Tenure" : "Time Period"}
              value={values.duration}
              onChange={(val) => setValues({ ...values, duration: val })}
              min={1}
              max={type === CalculatorType.PPF ? 50 : 40}
              step={1}
              unit="Yr"
            />
          </>
        )}
      </div>
    );
  };

  // Custom result rendering for Tax
  if (type === CalculatorType.TAX) {
    const oldTax = result.investedAmount; // Mapped in util
    const newTax = result.wealthGained;   // Mapped in util
    const saving = result.totalValue;     // Mapped in util
    const betterRegime = newTax < oldTax ? 'New Regime' : 'Old Regime';
    const isSame = oldTax === newTax;

    return (
      <div className="grid lg:grid-cols-2 gap-2 sm:gap-10 animate-fade-in">
        <div className="p-2 sm:p-6 lg:p-10 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-1 sm:mb-8 lg:mb-12">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-1.5 sm:p-3.5 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg sm:rounded-2xl text-white shadow-lg shadow-emerald-200 transform rotate-3 shrink-0">
                <CalcIcon size={14} className="sm:w-8 sm:h-8" />
              </div>
              <div>
                <h2 className="text-sm sm:text-3xl font-bold text-slate-800 tracking-tight">Tax Estimator</h2>
                <p className="text-slate-500 text-[8px] sm:text-base font-medium">Old vs New Regime (FY 24-25)</p>
              </div>
            </div>
            <button 
              onClick={handleReset}
              className="p-1 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 group"
              title="Reset Calculator"
            >
              <RotateCcw size={14} className="group-hover:-rotate-180 transition-transform duration-500 sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
          
          {renderSliders()}
          
          <div className="mt-2 sm:mt-10 bg-indigo-50/50 p-2 sm:p-4 rounded-lg sm:rounded-2xl text-[7px] sm:text-sm text-indigo-800 border border-indigo-100 flex gap-1.5 sm:gap-3 items-start shadow-sm mx-0.5 sm:mx-2">
            <div className="bg-white p-0.5 sm:p-1.5 rounded-full shadow-sm text-indigo-600 mt-0.5 shrink-0">
                 <Info size={8} className="sm:w-4 sm:h-4" />
            </div>
            <span className="leading-relaxed">Std Deduction (₹75k New / ₹50k Old) & 4% Cess applied automatically.</span>
          </div>
        </div>

        <div className="bg-slate-50 p-2 sm:p-6 lg:p-10 rounded-b-xl sm:rounded-b-[2.5rem] lg:rounded-r-[2.5rem] lg:rounded-bl-none border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col justify-center relative overflow-hidden">
           {/* Background Pattern */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100/40 to-transparent rounded-bl-full -z-0 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-2 gap-1.5 sm:gap-4 mb-1.5 sm:mb-6">
             <div className="bg-white p-2 sm:p-6 rounded-lg sm:rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 group">
               <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-3">
                 <div className="w-1 sm:w-2.5 h-1 sm:h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                 <p className="text-slate-400 text-[7px] sm:text-xs font-bold uppercase tracking-widest group-hover:text-red-500 transition-colors">Old Regime</p>
               </div>
               <AnimatedAmount value={oldTax} className="text-xs sm:text-xl font-bold text-slate-700" />
             </div>
             <div className="bg-white p-2 sm:p-6 rounded-lg sm:rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 group">
               <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-3">
                 <div className="w-1 sm:w-2.5 h-1 sm:h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                 <p className="text-slate-400 text-[7px] sm:text-xs font-bold uppercase tracking-widest group-hover:text-emerald-600 transition-colors">New Regime</p>
               </div>
               <AnimatedAmount value={newTax} className="text-xs sm:text-xl font-bold text-emerald-600" />
             </div>
          </div>

          <div className={`relative z-10 p-2 sm:p-8 rounded-lg sm:rounded-3xl text-white shadow-2xl shadow-indigo-200 mb-2 sm:mb-8 overflow-hidden group transform hover:scale-[1.02] transition-all duration-300 ${isSame ? 'bg-slate-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
             <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shine" />
             <div className="absolute right-0 top-0 p-2 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:rotate-12">
               <TrendingUp size={30} className="sm:w-[100px] sm:h-[100px]" />
             </div>
             
             <p className="text-indigo-100 text-[7px] sm:text-xs font-bold uppercase tracking-widest mb-0.5 sm:mb-3 border-b border-white/20 pb-1 sm:pb-2 inline-block">Recommendation</p>
             {isSame ? (
               <p className="text-sm sm:text-2xl font-bold">Both are equal.</p>
             ) : (
               <>
                <div className="flex flex-col gap-0.5 sm:gap-1">
                  <span className="text-[9px] sm:text-base font-medium opacity-90">Switch to <strong className="text-yellow-300">{betterRegime}</strong></span>
                  <div className="flex flex-wrap items-baseline gap-x-1 sm:gap-x-3 mt-0.5">
                    <span className="text-[8px] sm:text-xs opacity-80 uppercase tracking-wider font-semibold">You Save</span>
                    <AnimatedAmount value={saving} className="text-base sm:text-3xl font-bold tracking-tight" />
                  </div>
                </div>
               </>
             )}
          </div>

          <div className="h-24 sm:h-48 w-full relative z-10">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={result.breakdown} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }} barSize={15}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 8, fill: '#64748b', fontWeight: 600}} tickLine={false} axisLine={false} />
                 <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 5px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '8px', padding: '4px' }}
                    formatter={(value: number) => formatCurrency(value)} 
                 />
                 <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={1000}>
                   {result.breakdown.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // Default Render for SIP, EMI, PPF, LUMPSUM
  return (
    <div className="grid lg:grid-cols-2 gap-2 sm:gap-8 animate-fade-in h-full">
      <div className="p-2 sm:p-6 lg:p-10 flex flex-col justify-center">
         <div className="flex justify-between items-start mb-1 sm:mb-8 lg:mb-12">
             <div className="flex items-center gap-2 sm:gap-4">
                 <div className="p-1.5 sm:p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-2xl text-white shadow-xl shadow-indigo-200 transform -rotate-2 shrink-0">
                     {type === CalculatorType.SIP && <TrendingUp size={14} className="sm:w-8 sm:h-8" />}
                     {type === CalculatorType.EMI && <IndianRupee size={14} className="sm:w-8 sm:h-8" />}
                     {type === CalculatorType.PPF && <Calendar size={14} className="sm:w-8 sm:h-8" />}
                     {type === CalculatorType.LUMPSUM && <TrendingUp size={14} className="sm:w-8 sm:h-8" />}
                 </div>
                 <div>
                   <h2 className="text-sm sm:text-3xl font-bold text-slate-800 tracking-tight">{type} Calculator</h2>
                   <p className="text-slate-500 text-[8px] sm:text-base font-medium mt-0.5">Calculate returns</p>
                 </div>
             </div>
             <button 
              onClick={handleReset}
              className="p-1 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 group"
              title="Reset Calculator"
            >
              <RotateCcw size={14} className="group-hover:-rotate-180 transition-transform duration-500 sm:w-[18px] sm:h-[18px]" />
            </button>
         </div>
         {renderSliders()}
      </div>

      <div className="bg-slate-50 p-2 sm:p-6 lg:p-10 rounded-b-xl sm:rounded-b-[2.5rem] lg:rounded-r-[2.5rem] lg:rounded-bl-none border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col justify-center relative">
        {/* Result Grid - 2 columns on mobile for tighter fit */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-5 mb-1.5 sm:mb-8 lg:mb-10">
           {type === CalculatorType.EMI && (
             <div className="col-span-2 bg-white p-2 sm:p-6 rounded-lg sm:rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
               <p className="text-slate-400 text-[7px] sm:text-xs font-bold uppercase tracking-widest mb-0.5 sm:mb-2 group-hover:text-indigo-600 transition-colors">Monthly EMI</p>
               <AnimatedAmount value={result.monthlyPayment || 0} className="text-base sm:text-2xl font-bold text-slate-800 tracking-tight" />
             </div>
           )}
           
           <div className="bg-white p-2 sm:p-6 rounded-lg sm:rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
             <p className="text-slate-400 text-[7px] sm:text-xs font-bold uppercase tracking-widest mb-0.5 sm:mb-2 group-hover:text-slate-600 transition-colors">
                 {type === CalculatorType.EMI ? 'Principal' : 'Invested'}
             </p>
             <AnimatedAmount value={result.investedAmount} className="text-[10px] sm:text-lg font-bold text-slate-800" />
           </div>

           <div className="bg-white p-2 sm:p-6 rounded-lg sm:rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
             <p className="text-slate-400 text-[7px] sm:text-xs font-bold uppercase tracking-widest mb-0.5 sm:mb-2 group-hover:text-slate-600 transition-colors">
                 {type === CalculatorType.EMI ? 'Interest' : 'Returns'}
             </p>
             <AnimatedAmount value={result.wealthGained} className="text-[10px] sm:text-lg font-bold text-slate-800" />
           </div>

           <div className="col-span-2 bg-slate-800 p-2.5 sm:p-8 rounded-lg sm:rounded-3xl text-white shadow-2xl shadow-slate-400/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-3 sm:p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110">
               <IndianRupee size={40} className="sm:w-[120px] sm:h-[120px]" />
             </div>
             <p className="text-slate-400 text-[8px] sm:text-xs font-bold uppercase tracking-widest mb-0.5 sm:mb-3 border-b border-slate-700 pb-1 sm:pb-3 inline-block">
                 {type === CalculatorType.EMI ? 'Total Amount Payable' : 'Total Value'}
             </p>
             <div className="relative">
                <AnimatedAmount value={result.totalValue} className="text-base sm:text-3xl font-bold tracking-tight" />
             </div>
           </div>
        </div>

        <div className="h-24 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={result.breakdown}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={45}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
              >
                {result.breakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} className="outline-none focus:outline-none" />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 5px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '8px', padding: '4px' }}
                itemStyle={{ color: '#334155', fontWeight: 600 }}
              />
              <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ paddingTop: '0px', fontSize: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Calculator;