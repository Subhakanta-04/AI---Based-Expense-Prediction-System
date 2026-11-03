import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  ComposedChart 
} from 'recharts';
import { api } from '../services/api';
import { ForecastData } from '../types';

export const Forecast: React.FC = () => {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [horizon, setHorizon] = useState<7 | 14 | 30>(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForecast() {
      try {
        setLoading(true);
        const data = await api.getForecast(30);
        setForecast(data);
      } catch (err) {
        console.error("Failed to load forecast", err);
      } finally {
        setLoading(false);
      }
    }
    loadForecast();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-white animate-spin" />
        <p className="text-xs font-mono-code text-zinc-400">Computing recursive autoregressive projections...</p>
      </div>
    );
  }

  const selectedSummary = horizon === 7 
    ? forecast?.next_7_days 
    : horizon === 14 
    ? forecast?.next_14_days 
    : forecast?.next_30_days;

  const chartSeries = forecast?.combined_chart_series || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-zinc-300" />
            Forward Econometric Forecasting
          </h2>
          <p className="text-xs text-zinc-400">
            Recursive multi-step projection across 7, 14, and 30-day temporal horizons based on estimated momentum.
          </p>
        </div>

        {/* Horizon Selector Pill */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
          {[7, 14, 30].map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h as any)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                horizon === h
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {h} Days
            </button>
          ))}
        </div>
      </div>

      {/* 3 Metric Cards for Horizons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Next 7 Days */}
        <div className={`glass-card rounded-xl p-5 border transition-colors ${
          horizon === 7 ? 'border-zinc-700 bg-zinc-900/80' : 'border-zinc-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">7-Day Projected Total</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono-code bg-zinc-900 text-zinc-300 border border-zinc-800">
              Short-Term
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white font-mono-code">
            ₹{forecast?.next_7_days.total_spending.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Mean: ₹{forecast?.next_7_days.daily_average.toLocaleString('en-IN')}/day
          </p>
        </div>

        {/* Next 14 Days */}
        <div className={`glass-card rounded-xl p-5 border transition-colors ${
          horizon === 14 ? 'border-zinc-700 bg-zinc-900/80' : 'border-zinc-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">14-Day Projected Total</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono-code bg-zinc-900 text-zinc-300 border border-zinc-800">
              Bi-Weekly
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white font-mono-code">
            ₹{forecast?.next_14_days.total_spending.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Mean: ₹{forecast?.next_14_days.daily_average.toLocaleString('en-IN')}/day
          </p>
        </div>

        {/* Next 30 Days */}
        <div className={`glass-card rounded-xl p-5 border transition-colors ${
          horizon === 30 ? 'border-zinc-700 bg-zinc-900/80' : 'border-zinc-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">30-Day Projected Total</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono-code bg-zinc-900 text-zinc-300 border border-zinc-800">
              Monthly
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white font-mono-code">
            ₹{forecast?.next_30_days.total_spending.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Mean: ₹{forecast?.next_30_days.daily_average.toLocaleString('en-IN')}/day
          </p>
        </div>
      </div>

      {/* Historical vs Predicted Interactive Graph */}
      <div className="glass-card rounded-xl p-6 border border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-sm font-bold text-white font-heading">
              Temporal Continuity: Historical Actuals vs Forecast Projections
            </h3>
            <p className="text-xs text-zinc-400">
              Seamless contiguous transition from recorded ledger history to forward recursive regression
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-200">
              <span className="w-3 h-0.5 bg-white inline-block" /> Historical
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-3 h-0.5 border-t border-dashed border-zinc-400 inline-block" /> Forecast
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartSeries} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
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
                formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString('en-IN')}`, name]}
                labelFormatter={(lbl) => `Date: ${lbl}`}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {/* Historical Line */}
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#ffffff" 
                strokeWidth={1.75} 
                dot={{ r: 2, fill: '#ffffff' }} 
                name="Historical Actual"
                connectNulls={false}
              />
              {/* Forecast Line */}
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#a1a1aa" 
                strokeWidth={1.75} 
                strokeDasharray="4 4"
                dot={{ r: 2, fill: '#a1a1aa' }} 
                name="Model Forecast"
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Breakdown Table for Selected Horizon */}
      <div className="glass-card rounded-xl p-6 border border-zinc-800">
        <h3 className="text-sm font-bold text-white font-heading mb-1">
          Daily Forecast Breakdown ({horizon}-Day Horizon)
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          Day-by-day simulated projections with empirical lower and upper boundaries
        </p>

        <div className="overflow-x-auto max-h-[360px]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-zinc-900 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-3">Step</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Day</th>
                <th className="py-2.5 px-3">Simulated Category</th>
                <th className="py-2.5 px-3 text-right">Predicted Amount</th>
                <th className="py-2.5 px-3 text-right">Interval Range</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 font-mono-code text-zinc-300">
              {selectedSummary?.records.map((r: any) => (
                <tr key={r.step} className="hover:bg-zinc-900/50">
                  <td className="py-2.5 px-3 text-zinc-500">Day +{r.step}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{r.date}</td>
                  <td className="py-2.5 px-3 font-sans text-zinc-400">{r.day_name}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {r.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-white">
                    ₹{r.predicted_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-400">
                    ₹{r.lower_bound.toLocaleString('en-IN')} – ₹{r.upper_bound.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Limitations Disclaimer */}
      <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="block font-semibold text-white mb-0.5">Methodological Disclaimer</strong>
          {forecast?.disclaimer}
        </div>
      </div>
    </div>
  );
};
