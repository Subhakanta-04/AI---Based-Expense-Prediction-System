import React, { useState } from 'react';
import { Calculator, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { PredictionResult } from '../../types';

interface PredictionCardProps {
  categories: string[];
  paymentMethods: string[];
  onPredicted?: (result: PredictionResult) => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  categories = ['Food', 'Shopping', 'Transport', 'Utilities', 'Entertainment', 'Health'],
  paymentMethods = ['UPI', 'Credit Card', 'Cash', 'Net Banking'],
  onPredicted
}) => {
  const [category, setCategory] = useState(categories[0] || 'Food');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0] || 'UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.predictExpense({
        Date: date,
        Category: category,
        Payment_Method: paymentMethod,
        Description: description || `${category} expense`,
      });
      setResult(res);
      if (onPredicted) onPredicted(res);
    } catch (err) {
      console.error("Prediction failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-zinc-800 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading">Supervised Inference</h3>
              <p className="text-xs text-zinc-400">Estimate expected expenditure with trained model</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono-code bg-zinc-900 text-zinc-400 border border-zinc-800">
            Random Forest
          </span>
        </div>

        <form onSubmit={handlePredict} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-500 transition-colors"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-500 transition-colors"
              >
                {paymentMethods.map((pm) => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Target Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Description (Optional)</label>
              <input
                type="text"
                placeholder="Dinner expense"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2 px-4 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Computing Regression...
              </>
            ) : (
              <>
                <Calculator className="w-3.5 h-3.5" />
                Compute Predicted Expense
              </>
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="mt-4 p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-700 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-zinc-400 font-medium">Estimated Expenditure</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono-code bg-zinc-800 text-zinc-300 border border-zinc-700">
              Confidence: {result.reliability_score}%
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-mono-code">
            ₹{result.predicted_amount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between">
            <span>Interval: ₹{result.typical_range.lower} – ₹{result.typical_range.upper}</span>
            <span className="font-mono-code text-zinc-500">Test MAE: ±₹{result.test_mae}</span>
          </div>
        </div>
      )}
    </div>
  );
};
