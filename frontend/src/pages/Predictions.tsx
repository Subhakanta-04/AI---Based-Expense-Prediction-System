import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Calendar, 
  Tag, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { PredictionResult, DatasetInfo } from '../types';

export const Predictions: React.FC = () => {
  const [info, setInfo] = useState<DatasetInfo | null>(null);
  const [category, setCategory] = useState('Food');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  
  // Advanced features override toggle
  const [useAdvancedOverrides, setUseAdvancedOverrides] = useState(false);
  const [prevExpense, setPrevExpense] = useState<string>('450');
  const [roll3Avg, setRoll3Avg] = useState<string>('520');
  const [roll7Avg, setRoll7Avg] = useState<string>('610');
  const [roll14Avg, setRoll14Avg] = useState<string>('580');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    async function loadMeta() {
      try {
        const d = await api.getDatasetInfo();
        setInfo(d);
        if (d.categories.length) setCategory(d.categories[0]);
        if (d.payment_methods.length) setPaymentMethod(d.payment_methods[0]);
      } catch (err) {
        console.error("Failed to load dataset metadata", err);
      }
    }
    loadMeta();
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        Date: date,
        Category: category,
        Payment_Method: paymentMethod,
        Description: description || `${category} expense`,
      };

      if (useAdvancedOverrides) {
        payload.Previous_Expense = parseFloat(prevExpense) || 450;
        payload.Rolling_3_Day_Avg = parseFloat(roll3Avg) || 520;
        payload.Rolling_7_Day_Avg = parseFloat(roll7Avg) || 610;
        payload.Rolling_14_Day_Avg = parseFloat(roll14Avg) || 580;
      }

      const res = await api.predictExpense(payload);
      setResult(res);
    } catch (err) {
      console.error("Prediction failed", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = info?.categories || ['Food', 'Shopping', 'Transport', 'Entertainment', 'Health', 'Utilities'];
  const paymentMethods = info?.payment_methods || ['UPI', 'Credit Card', 'Cash', 'Net Banking'];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2.5">
          <Calculator className="w-5 h-5 text-zinc-300" />
          Regression Inference Engine
        </h2>
        <p className="text-xs text-zinc-400">
          Estimate expected expenditure conditional on category, date, channel, and historical rolling averages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form Column (7 Cols) */}
        <div className="lg:col-span-7 glass-card rounded-xl p-6 border border-zinc-800">
          <h3 className="text-sm font-bold text-white font-heading mb-1">
            Inference Parameters
          </h3>
          <p className="text-xs text-zinc-400 mb-5">
            Configure transaction attributes or automatically condition on recent rolling historical expenditure.
          </p>

          <form onSubmit={handlePredict} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-zinc-400" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-500"
                >
                  {paymentMethods.map((pm) => (
                    <option key={pm} value={pm}>{pm}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Date */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  Target Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dinner outing"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {/* Advanced Rolling Features Override Section */}
            <div className="pt-2 border-t border-zinc-800/80">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-300 select-none">
                <input
                  type="checkbox"
                  checked={useAdvancedOverrides}
                  onChange={(e) => setUseAdvancedOverrides(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-white focus:ring-0"
                />
                <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                <span>Specify Custom Causal Lag Features (Manual Mode)</span>
              </label>

              {useAdvancedOverrides && (
                <div className="mt-3 p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">Previous Expense (₹)</label>
                    <input
                      type="number"
                      value={prevExpense}
                      onChange={(e) => setPrevExpense(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white font-mono-code"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">3-Day Rolling Average (₹)</label>
                    <input
                      type="number"
                      value={roll3Avg}
                      onChange={(e) => setRoll3Avg(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white font-mono-code"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">7-Day Rolling Average (₹)</label>
                    <input
                      type="number"
                      value={roll7Avg}
                      onChange={(e) => setRoll7Avg(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white font-mono-code"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">14-Day Rolling Average (₹)</label>
                    <input
                      type="number"
                      value={roll14Avg}
                      onChange={(e) => setRoll14Avg(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white font-mono-code"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Evaluating Regression Model...
                </>
              ) : (
                <>
                  <Calculator className="w-3.5 h-3.5" />
                  Execute Prediction
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Display (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {result ? (
            <div className="glass-card rounded-xl p-6 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code uppercase tracking-wider text-zinc-400">
                  Predicted Outflow
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono-code bg-zinc-900 text-zinc-300 border border-zinc-700">
                  {result.reliability_label} Confidence
                </span>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-white font-mono-code tracking-tight">
                  ₹{result.predicted_amount.toLocaleString('en-IN')}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Interval Bounds: <span className="font-semibold text-zinc-200 font-mono-code">₹{result.typical_range.lower.toLocaleString('en-IN')}</span> – <span className="font-semibold text-zinc-200 font-mono-code">₹{result.typical_range.upper.toLocaleString('en-IN')}</span>
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Model:</span>
                  <span className="text-white font-medium">{result.model_name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Test MAE:</span>
                  <span className="font-mono-code text-zinc-200">±₹{result.test_mae}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Test RMSE:</span>
                  <span className="font-mono-code text-zinc-200">₹{result.test_rmse}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Explained Variance (R²):</span>
                  <span className="font-mono-code text-zinc-200">{result.test_r2}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
                {result.interpretation}
              </p>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 border border-zinc-800 text-center flex flex-col items-center justify-center min-h-[300px] text-zinc-400">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center mb-3">
                <Calculator className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Awaiting Parameter Submission</h4>
              <p className="text-xs max-w-xs text-zinc-400">
                Specify transaction features and click "Execute Prediction" to trigger inference.
              </p>
            </div>
          )}

          {/* Educational Disclaimer Card */}
          <div className="p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-zinc-300 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-zinc-300 block mb-0.5">Empirical Reliability Rationale</strong>
              Confidence boundaries represent empirical residual dispersion measured on out-of-time test partitions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
