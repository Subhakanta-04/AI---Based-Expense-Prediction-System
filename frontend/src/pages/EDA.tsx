import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  PieChart as PieIcon, 
  Layers, 
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { EDASummary, EDACharts } from '../types';

export const EDA: React.FC = () => {
  const [summary, setSummary] = useState<EDASummary | null>(null);
  const [charts, setCharts] = useState<EDACharts | null>(null);
  const [correlation, setCorrelation] = useState<{ features: string[]; correlation_matrix: Record<string, Record<string, number>> } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEDA() {
      try {
        setLoading(true);
        const [s, c, cr] = await Promise.all([
          api.getEDASummary(),
          api.getEDACharts(),
          api.getEDACorrelation()
        ]);
        setSummary(s);
        setCharts(c);
        setCorrelation(cr);
      } catch (err) {
        console.error("Failed to load EDA", err);
      } finally {
        setLoading(false);
      }
    }
    loadEDA();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-white animate-spin" />
        <p className="text-xs font-mono-code text-zinc-400">Computing exploratory analytics & correlation matrices...</p>
      </div>
    );
  }

  const catData = summary?.categories || [];
  const pmData = summary?.payment_methods || [];
  const monthlyData = charts?.monthly || [];
  const dailyData = charts?.daily_pattern || [];
  const buckets = charts?.distribution_buckets || [];
  const wk = summary?.weekend_vs_weekday;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white font-heading">Exploratory Data Analysis</h2>
        <p className="text-xs text-zinc-400">
          Structural statistical breakdown of 114 transactions across categories, temporal horizons, channels, and correlations.
        </p>
      </div>

      {/* Spending Trend Banner */}
      <div className="p-4 rounded-xl glass-card border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono-code font-semibold text-zinc-400 uppercase tracking-wider">Spending Velocity</span>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Trend Vector: <span className="text-white">{summary?.spending_trend.direction}</span>
              <span className="text-xs font-normal text-zinc-400">({summary?.spending_trend.percentage_change}% vs early records)</span>
            </h3>
            <p className="text-xs text-zinc-300 mt-0.5">{summary?.spending_trend.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs px-2.5 py-1 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono-code">
            Linear Slope: {summary?.spending_trend.slope}
          </span>
        </div>
      </div>

      {/* Grid 1: Category Total & Average Spent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Total Spend */}
        <div className="glass-card rounded-xl p-5 border border-zinc-800">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-zinc-400" />
            1. Total Outflow by Category
          </h3>
          <p className="text-xs text-zinc-400 mb-4">Cumulative volume across each expense classification</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} layout="vertical" margin={{ left: 15, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis type="number" tickFormatter={(v) => `₹${v}`} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#27272a' }} />
                <YAxis dataKey="category" type="category" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={{ stroke: '#27272a' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px', color: '#fff' }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Total Outflow']}
                />
                <Bar dataKey="total_spent" fill="#ffffff" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Average Spend */}
        <div className="glass-card rounded-xl p-5 border border-zinc-800">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-zinc-400" />
            2. Mean Outflow per Transaction
          </h3>
          <p className="text-xs text-zinc-400 mb-4">Average transaction ticket size per category</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="category" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#27272a' }} />
                <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#27272a' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px', color: '#fff' }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Mean Ticket']}
                />
                <Bar dataKey="average_spent" fill="#a1a1aa" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid 2: Monthly Timeline & Day-of-Week Pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Expenses */}
        <div className="glass-card rounded-xl p-5 border border-zinc-800">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            3. Monthly Outflow Progression
          </h3>
          <p className="text-xs text-zinc-400 mb-4">Cumulative monthly expenditure across the observation period</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#27272a' }} />
                <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#27272a' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px', color: '#fff' }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Total Outflow']}
                />
                <Bar dataKey="total" fill="#ffffff" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Spending Pattern */}
        <div className="glass-card rounded-xl p-5 border border-zinc-800">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-zinc-400" />
            4. Outflow Distribution by Day of Week
          </h3>
          <p className="text-xs text-zinc-400 mb-4">Total expenditure partitioned Monday through Sunday</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="day" tickFormatter={(d) => d.slice(0, 3)} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#27272a' }} />
                <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#27272a' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px', color: '#fff' }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Total Outflow']}
                />
                <Bar dataKey="total" fill="#71717a" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid 3: Weekend vs Weekday + Payment Methods + Amount Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekend vs Weekday Comparison Card */}
        <div className="glass-card rounded-xl p-5 border border-zinc-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">5. Weekend vs Weekday Divergence</h3>
            <p className="text-xs text-zinc-400 mb-4">Comparison of ticket size and transactional volume</p>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-zinc-400">Weekend Transactions</span>
                  <span className="text-xs font-mono-code text-zinc-200">{wk?.weekend_count} entries</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold text-white font-mono-code">₹{wk?.weekend_mean}</span>
                  <span className="text-xs text-zinc-500 font-mono-code">Total: ₹{wk?.weekend_total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-zinc-400">Weekday Transactions</span>
                  <span className="text-xs font-mono-code text-zinc-200">{wk?.weekday_count} entries</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold text-white font-mono-code">₹{wk?.weekday_mean}</span>
                  <span className="text-xs text-zinc-500 font-mono-code">Total: ₹{wk?.weekday_total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 mt-4 pt-3 border-t border-zinc-800 font-mono-code">
            Mean weekend outflow: ₹{wk?.weekend_mean} vs weekday ₹{wk?.weekday_mean}
          </p>
        </div>

        {/* Payment Method Distribution */}
        <div className="glass-card rounded-xl p-5 border border-zinc-800">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-zinc-400" />
            6. Payment Channel Allocation
          </h3>
          <p className="text-xs text-zinc-400 mb-4">Breakdown across financial settlement mechanisms</p>

          <div className="space-y-2.5">
            {pmData.map((pm) => (
              <div key={pm.payment_method} className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-medium text-white">{pm.payment_method}</span>
                  <span className="font-mono-code text-white font-bold">{pm.percentage_volume}%</span>
                </div>
                <div className="w-full h-1 rounded bg-zinc-800 overflow-hidden mb-1">
                  <div 
                    className="h-full bg-white transition-all duration-300" 
                    style={{ width: `${pm.percentage_volume}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono-code">
                  <span>{pm.transaction_count} txns</span>
                  <span>Total: ₹{pm.total_spent.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Amount Distribution (Buckets) */}
        <div className="glass-card rounded-xl p-5 border border-zinc-800">
          <h3 className="text-sm font-bold text-white mb-1">7. Ticket Size Frequency Buckets</h3>
          <p className="text-xs text-zinc-400 mb-4">Histogram density of expense values</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buckets} margin={{ left: -15, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="range" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#27272a' }} />
                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#27272a' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px', color: '#fff' }}
                  formatter={(v: any) => [`${v} entries`, 'Frequency']}
                />
                <Bar dataKey="count" fill="#a1a1aa" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feature Correlation Matrix Table */}
      <div className="glass-card rounded-xl p-5 border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-heading">
              8. Feature Correlation Matrix (Pearson r)
            </h3>
            <p className="text-xs text-zinc-400">
              Pairwise correlations across Target Amount, Previous Expense, Rolling Averages, and Temporal Features
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono-code">
            Bounds: [-1.0, +1.0]
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-mono-code">
                <th className="py-2.5 px-3 text-left">Feature</th>
                {correlation?.features.map((f) => (
                  <th key={f} className="py-2.5 px-2 text-[10px] truncate max-w-[90px]">
                    {f.replace('Rolling_', 'R_').replace('_Average', '_Avg').replace('Previous_', 'Prev_')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 font-mono-code text-xs">
              {correlation?.features.map((rowFeat) => (
                <tr key={rowFeat}>
                  <td className="py-2 px-3 text-left font-medium text-zinc-200">{rowFeat}</td>
                  {correlation.features.map((colFeat) => {
                    const val = correlation.correlation_matrix[rowFeat]?.[colFeat] ?? 0;
                    let cellBg = 'bg-zinc-950/40 text-zinc-400';
                    if (val === 1) {
                      cellBg = 'bg-zinc-800 text-white font-bold';
                    } else if (val >= 0.5) {
                      cellBg = 'bg-zinc-800/70 text-zinc-100 font-semibold';
                    } else if (val >= 0.2) {
                      cellBg = 'bg-zinc-900 text-zinc-300';
                    } else if (val <= -0.2) {
                      cellBg = 'bg-zinc-900 text-zinc-400';
                    }
                    return (
                      <td key={colFeat} className={`py-2 px-2 ${cellBg}`}>
                        {val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
