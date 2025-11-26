export enum CalculatorType {
  SIP = 'SIP',
  LUMPSUM = 'LUMPSUM',
  EMI = 'EMI',
  PPF = 'PPF',
  TAX = 'TAX'
}

export interface CalculatorInput {
  amount: number;
  rate: number;
  duration: number; // Years
  deductions?: number; // For Tax Calculator
}

export interface CalculationResult {
  investedAmount: number;
  wealthGained: number;
  totalValue: number;
  monthlyPayment?: number;
  breakdown: { name: string; value: number; color: string }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  STREAMING = 'STREAMING',
  ERROR = 'ERROR'
}