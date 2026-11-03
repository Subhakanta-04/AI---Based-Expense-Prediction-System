import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Layers, 
  PieChart, 
  CreditCard, 
  Calculator,
  Activity
} from 'lucide-react';

interface SmartSummaryProps {
  totalSpent: number;
  avgExpense: number;
  maxExpense: number;
  topCategory: string;
  mostUsedPaymentMethod: string;
  predictedNextExpense: number;
  trendDirection?: string;
}

export const SmartSummaryBanner: React.FC<SmartSummaryProps> = ({
  totalSpent,
  avgExpense,
  maxExpense,
  topCategory,
  mostUsedPaymentMethod,
  predictedNextExpense,
  trendDirection = "Stable"
}) => {
  return (
    <div className="rounded-xl p-5 mb-6 glass-panel border border-zinc-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-zinc-800 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-heading">Executive Expenditure Summary</h2>
            <p className="text-xs text-zinc-400">Synthesized directly from historical transactions and supervised regression parameters</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono-code bg-zinc-900 text-zinc-300 border border-zinc-800">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            Trend: {trendDirection}
          </span>
        </div>
      </div>

      {/* 6 Essential Summary Metric Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Spent */}
        <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
            <Wallet className="w-3.5 h-3.5 text-zinc-400" />
            <span>Cumulative Outflow</span>
          </div>
          <p className="text-base font-bold text-white font-mono-code">
            ₹{totalSpent.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Average Expense */}
        <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
            <span>Mean Outflow</span>
          </div>
          <p className="text-base font-bold text-white font-mono-code">
            ₹{avgExpense.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
          </p>
        </div>

        {/* Highest Expense */}
        <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>Peak Outflow</span>
          </div>
          <p className="text-base font-bold text-white font-mono-code">
            ₹{maxExpense.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Top Category */}
        <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
            <PieChart className="w-3.5 h-3.5 text-zinc-400" />
            <span>Primary Allocation</span>
          </div>
          <p className="text-base font-semibold text-zinc-200 truncate font-sans">
            {topCategory || "Food"}
          </p>
        </div>

        {/* Most Used Payment Method */}
        <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
            <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
            <span>Frequent Channel</span>
          </div>
          <p className="text-base font-semibold text-zinc-200 truncate font-sans">
            {mostUsedPaymentMethod || "UPI"}
          </p>
        </div>

        {/* Predicted Next Expense */}
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-700">
          <div className="flex items-center gap-1.5 text-zinc-300 text-xs mb-1">
            <Calculator className="w-3.5 h-3.5 text-zinc-400" />
            <span>Next Estimation</span>
          </div>
          <p className="text-base font-bold text-white font-mono-code">
            ₹{predictedNextExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </div>
  );
};
