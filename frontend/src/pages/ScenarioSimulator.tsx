import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  RefreshCw, 
  TrendingDown, 
  Wallet, 
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { api } from '../services/api';
import { ScenarioResult } from '../types';

export const ScenarioSimulator: React.FC = () => {
  const [cutFood, setCutFood] = useState<number>(20);
  const [cutShopping, setCutShopping] = useState<number>(30);
  const [cutEntertainment, setCutEntertainment] = useState<number>(15);
  const [shoppingCap, setShoppingCap] = useState<number>(2500);

  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const data = await api.simulateScenario({
        cut_food_pct: cutFood,
        cut_shopping_pct: cutShopping,
        cut_entertainment_pct: cutEntertainment,
        shopping_cap: shoppingCap
      });
      setResult(data);
    } catch (err) {
      console.error("Simulation failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2.5">
          <Sliders className="w-5 h-5 text-zinc-300" />
          Sensitivity Analysis & Fiscal Simulation
        </h2>
        <p className="text-xs text-zinc-400">
          Simulate behavioral adjustments, category budget caps, and model-projected monetary savings.
        </p>
      </div>

      {/* Control Sliders Card */}
      <div className="glass-card rounded-xl p-6 border border-zinc-800">
        <h3 className="text-sm font-bold text-white mb-1">
          Spending Adjustment Parameters
        </h3>
        <p className="text-xs text-zinc-400 mb-6">
          Adjust the parameters below to compute projected expenditure trajectories under varied interventions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Cut Food */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-zinc-300">Food Reduction</span>
              <span className="font-mono-code font-bold text-white">-{cutFood}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={cutFood}
              onChange={(e) => setCutFood(Number(e.target.value))}
              className="w-full accent-white cursor-pointer"
            />
            <p className="text-[10px] text-zinc-500 mt-1">Dining & food delivery reduction</p>
          </div>

          {/* Cut Shopping */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-zinc-300">Shopping Reduction</span>
              <span className="font-mono-code font-bold text-white">-{cutShopping}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="5"
              value={cutShopping}
              onChange={(e) => setCutShopping(Number(e.target.value))}
              className="w-full accent-white cursor-pointer"
            />
            <p className="text-[10px] text-zinc-500 mt-1">Discretionary apparel & gear</p>
          </div>

          {/* Shopping Single Item Cap */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-zinc-300">Transaction Ceiling</span>
              <span className="font-mono-code font-bold text-white">₹{shoppingCap}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="4000"
              step="250"
              value={shoppingCap}
              onChange={(e) => setShoppingCap(Number(e.target.value))}
              className="w-full accent-white cursor-pointer"
            />
            <p className="text-[10px] text-zinc-500 mt-1">Maximum single transaction threshold</p>
          </div>

          {/* Cut Entertainment */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-zinc-300">Entertainment Reduction</span>
              <span className="font-mono-code font-bold text-white">-{cutEntertainment}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={cutEntertainment}
              onChange={(e) => setCutEntertainment(Number(e.target.value))}
              className="w-full accent-white cursor-pointer"
            />
            <p className="text-[10px] text-zinc-500 mt-1">Leisure activities & events</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={runSimulation}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs bg-white hover:bg-zinc-200 text-black transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>Re-compute Sensitivity Model</span>
          </button>
        </div>
      </div>

      {/* Simulation Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Key Metric Savings Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-5 border border-zinc-800">
              <span className="text-xs text-zinc-400 block mb-1">Baseline 30-Day Outflow</span>
              <p className="text-2xl font-bold text-zinc-400 font-mono-code">
                ₹{result.baseline_30_day_total.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-zinc-500 mt-1 block">Unadjusted projection</span>
            </div>

            <div className="glass-card rounded-xl p-5 border border-zinc-800">
              <span className="text-xs text-zinc-400 block mb-1">Simulated 30-Day Outflow</span>
              <p className="text-2xl font-bold text-white font-mono-code">
                ₹{result.scenario_30_day_total.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-zinc-400 mt-1 block">Under applied constraints</span>
            </div>

            <div className="glass-card rounded-xl p-5 border border-zinc-700 bg-zinc-900/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-zinc-200">Total Net Savings</span>
                <TrendingDown className="w-4 h-4 text-zinc-300" />
              </div>
              <p className="text-2xl font-bold text-white font-mono-code">
                ₹{result.projected_monthly_savings.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-zinc-300 font-mono-code font-bold mt-1 block">
                {result.savings_percentage}% Expenditure Reduction
              </span>
            </div>
          </div>

          {/* Chronological Savings Chart */}
          <div className="glass-card rounded-xl p-6 border border-zinc-800">
            <h3 className="text-sm font-bold text-white font-heading mb-1">
              Temporal Trajectory Comparison
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Baseline vs Simulated Outflows across projected daily steps
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.daily_comparison} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    tickFormatter={(d) => d.slice(5)}
                    axisLine={{ stroke: '#27272a' }}
                  />
                  <YAxis 
                    tickFormatter={(v) => `₹${v}`} 
                    tick={{ fill: '#71717a', fontSize: 10 }} 
                    axisLine={{ stroke: '#27272a' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px', color: '#fff' }}
                    formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString('en-IN')}`, name === 'baseline_amount' ? 'Baseline' : 'Simulated']}
                    labelFormatter={(lbl) => `Date: ${lbl}`}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="baseline_amount" 
                    stroke="#71717a" 
                    fill="#27272a" 
                    fillOpacity={0.4} 
                    name="Baseline Outflow" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="simulated_amount" 
                    stroke="#ffffff" 
                    fill="#ffffff" 
                    fillOpacity={0.15} 
                    name="Simulated Outflow" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
