import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Edit3, 
  Save, 
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { BudgetStatus } from '../types';

export const BudgetTargets: React.FC = () => {
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadBudget = async () => {
    try {
      setLoading(true);
      const res = await api.getBudgetStatus();
      setBudgetStatus(res);
    } catch (err) {
      console.error("Failed to load budget", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudget();
  }, []);

  const handleSaveBudget = async (category: string) => {
    const val = parseFloat(editAmount);
    if (isNaN(val) || val <= 0) {
      alert("Please specify a valid positive numerical limit.");
      return;
    }

    setSaving(true);
    try {
      await api.setBudget(category, val);
      setEditingCategory(null);
      await loadBudget();
    } catch (err: any) {
      alert(err.message || "Failed to update allocation cap.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-white animate-spin" />
        <p className="text-xs font-mono-code text-zinc-400">Loading budget allocations and econometric trajectories...</p>
      </div>
    );
  }

  const overallPct = budgetStatus?.overall_percentage ?? 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2.5">
            <Target className="w-5 h-5 text-zinc-300" />
            Capital Allocations & Variance Monitoring
          </h2>
          <p className="text-xs text-zinc-400">
            Compare actual category consumption against goals with regression-projected month-end burn estimations.
          </p>
        </div>

        <button
          onClick={loadBudget}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
          Refresh Status
        </button>
      </div>

      {/* High-Level Budget Overview Banner */}
      <div className="glass-card rounded-xl p-6 border border-zinc-800">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Monthly Ceiling Target</span>
            <p className="text-2xl font-bold text-white font-mono-code">
              ₹{budgetStatus?.total_budget.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Actual Incurred ({budgetStatus?.period})</span>
            <p className="text-2xl font-bold text-zinc-200 font-mono-code">
              ₹{budgetStatus?.total_spent_so_far.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Inferred Month-End Total</span>
            <p className="text-2xl font-bold text-zinc-200 font-mono-code">
              ₹{budgetStatus?.total_projected_month_end.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-medium text-zinc-300">Overall Budget Consumption</span>
            <span className="font-mono-code font-bold text-white">{overallPct}%</span>
          </div>
          <div className="w-full h-2 rounded bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${Math.min(100, overallPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetStatus?.categories.map((c) => {
          const isEditing = editingCategory === c.category;

          return (
            <div 
              key={c.category}
              className="glass-card rounded-xl p-5 border border-zinc-800 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white font-heading">{c.category}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono-code uppercase bg-zinc-900 text-zinc-300 border border-zinc-700">
                      {c.status_level}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Residual: <span className="font-mono-code font-semibold text-zinc-200">₹{c.remaining_budget.toLocaleString('en-IN')}</span>
                  </p>
                </div>

                {/* Edit Budget Action */}
                {!isEditing ? (
                  <button
                    onClick={() => {
                      setEditingCategory(c.category);
                      setEditAmount(String(c.monthly_limit));
                    }}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Change monthly limit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-20 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-white font-mono-code"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveBudget(c.category)}
                      disabled={saving}
                      className="p-1.5 rounded bg-white text-black hover:bg-zinc-200 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Consumed: ₹{c.spent_so_far.toLocaleString('en-IN')}</span>
                  <span className="font-mono-code text-white">Ceiling: ₹{c.monthly_limit.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full h-1.5 rounded bg-zinc-900 border border-zinc-800 overflow-hidden">
                  <div 
                    className="h-full bg-zinc-300 transition-all duration-300"
                    style={{ width: `${Math.min(100, c.percentage_used)}%` }}
                  />
                </div>
              </div>

              {/* ML Run-Rate Projections */}
              <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Month-End Estimate:</span>
                <span className="font-mono-code font-bold text-white">
                  ₹{c.projected_month_end.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="mt-2 text-[11px] leading-relaxed text-zinc-300 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80">
                {c.alert_message}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
