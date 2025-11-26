import { CalculatorType, CalculatorInput, CalculationResult } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const calculateTaxLiability = (taxableIncome: number, regime: 'OLD' | 'NEW'): number => {
  let tax = 0;

  if (regime === 'NEW') {
    // New Regime Slabs (FY 2024-25)
    // 0-3L: Nil
    // 3-7L: 5%
    // 7-10L: 10%
    // 10-12L: 15%
    // 12-15L: 20%
    // >15L: 30%
    
    if (taxableIncome <= 300000) return 0;
    
    // Calculate base tax according to slabs
    if (taxableIncome > 300000) tax += Math.min(taxableIncome - 300000, 400000) * 0.05; // 3L-7L
    if (taxableIncome > 700000) tax += Math.min(taxableIncome - 700000, 300000) * 0.10; // 7L-10L
    if (taxableIncome > 1000000) tax += Math.min(taxableIncome - 1000000, 200000) * 0.15; // 10L-12L
    if (taxableIncome > 1200000) tax += Math.min(taxableIncome - 1200000, 300000) * 0.20; // 12L-15L
    if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30; // >15L

    // Rebate u/s 87A for New Regime
    // Full rebate if taxable income <= 7L
    if (taxableIncome <= 700000) {
        tax = 0;
    } else {
        // Marginal Relief: Tax payable should not exceed the income exceeding 7 Lakhs
        const excessIncome = taxableIncome - 700000;
        if (tax > excessIncome) {
            tax = excessIncome;
        }
    }

  } else {
    // Old Regime Slabs
    // 0-2.5L: Nil
    // 2.5-5L: 5%
    // 5-10L: 20%
    // >10L: 30%

    if (taxableIncome <= 250000) return 0;

    if (taxableIncome > 250000) tax += Math.min(taxableIncome - 250000, 250000) * 0.05; // 2.5L-5L
    if (taxableIncome > 500000) tax += Math.min(taxableIncome - 500000, 500000) * 0.20; // 5L-10L
    if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30; // >10L

    // Rebate u/s 87A for Old Regime
    // Available if taxable income <= 5L. Max rebate 12500 (which covers the 5% tax on 2.5-5L)
    if (taxableIncome <= 500000) {
        tax = 0;
    }
  }

  // Health and Education Cess @ 4%
  return Math.round(tax + (tax * 0.04));
};

export const calculateFinancials = (type: CalculatorType, input: CalculatorInput): CalculationResult => {
  const { amount, rate, duration, deductions = 0 } = input;
  
  let investedAmount = 0;
  let totalValue = 0;
  let wealthGained = 0;
  let monthlyPayment = 0;
  let breakdown: { name: string; value: number; color: string }[] = [];

  switch (type) {
    case CalculatorType.SIP:
      // Monthly Rate
      const i = rate / 100 / 12;
      const n = duration * 12;
      investedAmount = amount * n;
      // SIP Formula: P × ({[1 + i]^n - 1} / i) × (1 + i)
      totalValue = amount * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      wealthGained = totalValue - investedAmount;
      break;

    case CalculatorType.LUMPSUM:
      investedAmount = amount;
      // Compound Interest: P(1 + r/n)^(nt)
      totalValue = amount * Math.pow(1 + rate / 100, duration);
      wealthGained = totalValue - investedAmount;
      break;

    case CalculatorType.EMI:
      // EMI Formula: [P x R x (1+R)^N]/[(1+R)^N-1]
      const monthlyRate = rate / 12 / 100;
      const months = duration * 12;
      monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      totalValue = monthlyPayment * months; // Total Amount Payable
      investedAmount = amount; // Principal
      wealthGained = totalValue - investedAmount; // Total Interest Payable
      break;

    case CalculatorType.PPF:
      // PPF calculates interest annually on lowest balance between 5th and end of month. 
      // Simplified annual compounding for estimation.
      let balance = 0;
      for (let j = 0; j < duration; j++) {
        balance += amount; 
        balance += balance * (rate / 100);
      }
      investedAmount = amount * duration;
      totalValue = balance;
      wealthGained = totalValue - investedAmount;
      break;
      
    case CalculatorType.TAX:
      // Calculate for Old Regime
      const standardDeductionOld = 50000;
      // Old Regime allows user deductions (80C, 80D, HRA etc.)
      const taxableOld = Math.max(0, amount - standardDeductionOld - deductions);
      const taxOld = calculateTaxLiability(taxableOld, 'OLD');

      // Calculate for New Regime
      // 2024 Proposed Standard Deduction for New Regime is 75k
      const standardDeductionNew = 75000;
      // New Regime allows only limited deductions (NPS 80CCD(2), etc), ignoring generic deductions here for simplicity
      const taxableNew = Math.max(0, amount - standardDeductionNew); 
      const taxNew = calculateTaxLiability(taxableNew, 'NEW');

      investedAmount = taxOld; // Storing Old Tax here for result mapping
      wealthGained = taxNew;   // Storing New Tax here for result mapping
      totalValue = Math.abs(taxOld - taxNew); // Tax Saved

      breakdown = [
        { name: 'Old Regime Tax', value: taxOld, color: '#ef4444' }, // Red-500
        { name: 'New Regime Tax', value: taxNew, color: '#10b981' }, // Emerald-500
      ];
      
      return {
        investedAmount, // Old Tax
        wealthGained,   // New Tax
        totalValue,     // Difference
        monthlyPayment: undefined,
        breakdown
      };
  }

  breakdown = [
    { name: type === CalculatorType.EMI ? 'Principal' : 'Invested', value: Math.round(investedAmount), color: '#3b82f6' },
    { name: type === CalculatorType.EMI ? 'Interest' : 'Returns', value: Math.round(wealthGained), color: '#10b981' },
  ];

  return {
    investedAmount: Math.round(investedAmount),
    wealthGained: Math.round(wealthGained),
    totalValue: Math.round(totalValue),
    monthlyPayment: monthlyPayment ? Math.round(monthlyPayment) : undefined,
    breakdown
  };
};