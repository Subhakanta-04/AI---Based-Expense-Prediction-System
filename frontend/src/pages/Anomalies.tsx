import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  TrendingUp, 
  Layers 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { api } from '../services/api';
import { AnomalyReport } from '../types';

export const Anomalies: React.FC = () => {
  const [data, setData] = useState<AnomalyReport | null>(null);
  const [activeTab, setActiveTab] = useState<'anomalies' | 'normal'>('anomalies');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnomalies() {
      try {
        setLoading(true);
        const res = await api.getAnomalies();
        setData(res);
      } catch (err) {
        console.error("Failed to load anomalies", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnomalies();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-white animate-spin" />
        <p className="text-xs font-mono-code text-zinc-400">Computing IQR fences and Z-score dispersion...</p>
      </div>
    );
  }

  // Scatter plot points
  const scatterPoints = (data?.anomalies || []).map((a, i) => ({
    x: i + 1,
    y: a.amount,
    name: a.description,
    category: a.category,
    date: a.date,
    isAnomaly: true
  }));

  const normalPoints = (data?.normal_sample || []).map((n, i) => ({
    x: (data?.anomalies.length || 0) + i + 1,
    y: n.amount,
    name: n.description,
    category: n.category,
    date: n.date,
    isAnomaly: false
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-zinc-300" />
          Statistical Anomaly Isolation (IQR & Z-Score)
        </h2>
        <p className="text-xs text-zinc-400">
          Identify unusually large expenses that deviate statistically from baseline category distributions.
        </p>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5 border border-zinc-800">
          <span className="text-xs font-mono-code text-zinc-400 block mb-1">Outliers Flagged</span>
          <p className="text-2xl font-bold text-white font-mono-code">
            {data?.anomaly_count}
          </p>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            {data?.anomaly_percentage}% of total records
          </span>
        </div>

        <div className="glass-card rounded-xl p-5 border border-zinc-800">
          <span className="text-xs font-mono-code text-zinc-400 block mb-1">Anomalous Volume</span>
          <p className="text-2xl font-bold text-white font-mono-code">
            ₹{data?.total_anomalous_amount.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            High-dispersion volume
          </span>
        </div>

        <div className="glass-card rounded-xl p-5 border border-zinc-800">
          <span className="text-xs font-mono-code text-zinc-400 block mb-1">Global IQR Cutoff</span>
          <p className="text-2xl font-bold text-white font-mono-code">
            ₹{data?.global_iqr_threshold.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            Q3 + 1.5 × IQR fence
          </span>
        </div>

        <div className="glass-card rounded-xl p-5 border border-zinc-800">
          <span className="text-xs font-mono-code text-zinc-400 block mb-1">Isolation Algorithm</span>
          <p className="text-xl font-bold text-white mt-1">
            Category IQR
          </p>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            Contextual thresholds
          </span>
        </div>
      </div>

      {/* Visual Anomaly Chart */}
      <div className="glass-card rounded-xl p-6 border border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-sm font-bold text-white font-heading">
              Outlier Dispersion Scatter Analysis
            </h3>
            <p className="text-xs text-zinc-400">
              White points denote observations exceeding statistical category fences (IQR &gt; 1.5x)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-200">
              <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" /> Outliers ({data?.anomaly_count})
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 inline-block" /> Typical Observations
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ left: -10, right: 20, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Sequence" 
                tick={{ fill: '#71717a', fontSize: 10 }} 
                domain={['dataMin', 'dataMax']}
                axisLine={{ stroke: '#27272a' }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Amount" 
                tickFormatter={(v) => `₹${v}`} 
                tick={{ fill: '#71717a', fontSize: 10 }} 
                axisLine={{ stroke: '#27272a' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px', color: '#fff' }}
                formatter={(val: any, name: any, item: any) => [
                  `₹${Number(val).toLocaleString('en-IN')} (${item.payload.name} - ${item.payload.category})`,
                  'Amount'
                ]}
              />
              <ReferenceLine 
                y={data?.global_iqr_threshold} 
                stroke="#a1a1aa" 
                strokeDasharray="4 4" 
                label={{ value: `Global Fence: ₹${data?.global_iqr_threshold}`, fill: '#e4e4e7', fontSize: 10 }} 
              />
              <Scatter name="Anomalies" data={scatterPoints} fill="#ffffff" />
              <Scatter name="Normal" data={normalPoints} fill="#52525b" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs: Anomalies vs Normal Expenses */}
      <div className="glass-card rounded-xl p-6 border border-zinc-800">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('anomalies')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'anomalies'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Flagged Outliers ({data?.anomaly_count})
            </button>
            <button
              onClick={() => setActiveTab('normal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'normal'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Baseline Distribution Sample
            </button>
          </div>
        </div>

        {activeTab === 'anomalies' ? (
          <div className="space-y-2.5">
            {data?.anomalies.map((anom, idx) => (
              <div 
                key={idx} 
                className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-zinc-800 text-zinc-300">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-xs">{anom.description}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono-code bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {anom.category}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono-code">
                        {anom.date}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {anom.reason}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="text-base font-bold text-white font-mono-code">
                    ₹{anom.amount.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono-code">
                    Z-Score: +{anom.z_score}σ ({anom.payment_method})
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-300 font-sans">
                {data?.normal_sample.map((r, i) => (
                  <tr key={i} className="hover:bg-zinc-900/50">
                    <td className="py-2 px-3 font-mono-code text-zinc-400">{r.date}</td>
                    <td className="py-2 px-3">{r.category}</td>
                    <td className="py-2 px-3">{r.description}</td>
                    <td className="py-2 px-3 text-zinc-400">{r.payment_method}</td>
                    <td className="py-2 px-3 text-right font-mono-code font-bold text-white">₹{r.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
