import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  CheckCircle2, 
  Layers, 
  TrendingUp, 
  Award,
  ChevronRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { api } from '../services/api';
import { ModelComparison } from '../types';

interface FeatureImportanceItem {
  feature: string;
  importance: number;
  relative_importance: number;
}

export const ModelComparisonPage: React.FC = () => {
  const [comparison, setComparison] = useState<ModelComparison[]>([]);
  const [actualVsPred, setActualVsPred] = useState<any[]>([]);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportanceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [comp, avp, fi] = await Promise.all([
          api.getModelComparison(),
          api.getActualVsPredicted(),
          api.getFeatureImportance()
        ]);
        setComparison(comp);
        setActualVsPred(avp);
        setFeatureImportance(fi);
      } catch (err) {
        console.error("Failed to load model comparison data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-white animate-spin" />
        <p className="text-xs font-mono-code text-zinc-400">Loading benchmark matrices and test diagnostics...</p>
      </div>
    );
  }

  const best = comparison.find(c => c.Is_Best) || comparison[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2.5">
          <GitCompare className="w-5 h-5 text-zinc-300" />
          Model Benchmark Evaluation Matrix
        </h2>
        <p className="text-xs text-zinc-400">
          Rigorous comparative evaluation of 4 distinct regression architectures evaluated on unseen chronological test records.
        </p>
      </div>

      {/* Best Model Highlight Banner */}
      {best && (
        <div className="p-6 rounded-xl glass-card border border-zinc-700 bg-zinc-900/60 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-lg bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono-code uppercase tracking-wider text-zinc-300 font-semibold">
                    Optimal Candidate Architecture
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono-code bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Primary: Lowest Test RMSE
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-heading mt-0.5">
                  {best.Model}
                </h3>
                <p className="text-xs text-zinc-400">
                  Optimal trade-off between variance reduction, small-sample stability, and quadratic error minimization.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t sm:border-t-0 sm:border-l border-zinc-800 pt-3 sm:pt-0 sm:pl-6">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono-code">Test RMSE</span>
                <p className="text-xl font-bold text-white font-mono-code">₹{best.RMSE}</p>
                <span className="text-[10px] text-zinc-400">Lowest Error</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono-code">Test R²</span>
                <p className="text-xl font-bold text-white font-mono-code">{best.R2.toFixed(4)}</p>
                <span className="text-[10px] text-zinc-400">Variance Expl.</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono-code">Test MAE</span>
                <p className="text-xl font-bold text-zinc-200 font-mono-code">₹{best.MAE}</p>
                <span className="text-[10px] text-zinc-400">Mean Dev.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Benchmark Metrics Table */}
      <div className="glass-card rounded-xl p-5 border border-zinc-800">
        <h3 className="text-sm font-bold text-white font-heading mb-1">
          Model Leaderboard (Evaluated on Chronological Test Set)
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          All metrics computed directly on out-of-time test partitions (May 20, 2024 to June 30, 2024).
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Model Architecture</th>
                <th className="py-2.5 px-3 text-right">Train RMSE</th>
                <th className="py-2.5 px-3 text-right">Test RMSE</th>
                <th className="py-2.5 px-3 text-right">Train R²</th>
                <th className="py-2.5 px-3 text-right">Test R²</th>
                <th className="py-2.5 px-3 text-right">Test MAE</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 font-mono-code text-zinc-300">
              {comparison.map((row, idx) => (
                <tr 
                  key={row.Model} 
                  className={`transition-colors ${row.Is_Best ? 'bg-zinc-900/60 font-semibold text-white' : 'hover:bg-zinc-900/40'}`}
                >
                  <td className="py-2.5 px-3 text-zinc-500">#{idx + 1}</td>
                  <td className="py-2.5 px-3 font-sans font-medium text-white flex items-center gap-2">
                    {row.Model}
                    {row.Is_Best && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono-code bg-zinc-800 text-zinc-300 border border-zinc-700">
                        Selected
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-400">₹{row.Train_RMSE}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-white">₹{row.RMSE}</td>
                  <td className="py-2.5 px-3 text-right text-zinc-400">{row.Train_R2}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-white">{row.R2}</td>
                  <td className="py-2.5 px-3 text-right text-zinc-300">₹{row.MAE}</td>
                  <td className="py-2.5 px-3 text-center">
                    {row.Is_Best ? (
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono-code bg-zinc-800 text-zinc-200 border border-zinc-700">
                        Champion
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500">Benchmark</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Comparison Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test RMSE Comparison Bar Chart */}
        <div className="glass-card rounded-xl p-5 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-heading">Test RMSE (Lower is Superior)</h3>
              <p className="text-xs text-zinc-400">Root Mean Squared Error in Indian Rupees</p>
            </div>
            <span className="text-[10px] font-mono-code text-zinc-400">Primary Benchmark</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparison} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="Model" tickFormatter={(m) => m.split(' ')[0]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#27272a' }} />
                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={(v) => `₹${v}`} axisLine={{ stroke: '#27272a' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px', color: '#fff' }}
                  formatter={(v: any) => [`₹${v}`, 'Test RMSE']}
                />
                <Bar dataKey="RMSE" fill="#ffffff" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Test R² Comparison Bar Chart */}
        <div className="glass-card rounded-xl p-5 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-heading">Test R² (Higher is Superior)</h3>
              <p className="text-xs text-zinc-400">Variance explained on unseen test records</p>
            </div>
            <span className="text-[10px] font-mono-code text-zinc-400">Secondary Metric</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparison} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="Model" tickFormatter={(m) => m.split(' ')[0]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#27272a' }} />
                <YAxis domain={[0, 1]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#27272a' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px', color: '#fff' }}
                  formatter={(v: any) => [v, 'R² Score']}
                />
                <Bar dataKey="R2" fill="#a1a1aa" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actual vs Predicted Graph */}
      <div className="glass-card rounded-xl p-5 border border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-sm font-bold text-white font-heading">
              Actual vs Predicted Expenses on Chronological Test Set ({best?.Model})
            </h3>
            <p className="text-xs text-zinc-400">
              Evaluates test observations sequentially to visualize model alignment across transactions
            </p>
          </div>
          <span className="text-xs font-mono-code px-2.5 py-1 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
            23 Test Records
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={actualVsPred} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis 
                dataKey="Date" 
                tick={{ fill: '#71717a', fontSize: 10 }} 
                tickFormatter={(d) => d.slice(5)}
                axisLine={{ stroke: '#27272a' }}
              />
              <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#27272a' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px', color: '#fff' }}
                formatter={(v: any, name: any) => [`₹${Number(v).toLocaleString('en-IN')}`, name]}
                labelFormatter={(lbl) => `Date: ${lbl}`}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line 
                type="monotone" 
                dataKey="Actual" 
                stroke="#ffffff" 
                strokeWidth={1.75} 
                dot={{ r: 2.5, fill: '#ffffff' }} 
                activeDot={{ r: 4 }} 
              />
              <Line 
                type="monotone" 
                dataKey="Predicted" 
                stroke="#a1a1aa" 
                strokeWidth={1.75} 
                strokeDasharray="4 4" 
                dot={{ r: 2, fill: '#a1a1aa' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Importance */}
      <div className="glass-card rounded-xl p-5 border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-heading">
              Feature Importance ({best?.Model})
            </h3>
            <p className="text-xs text-zinc-400">
              Normalized relative contribution of engineered features extracted from the trained decision tree ensemble
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono-code bg-zinc-900 text-zinc-400 border border-zinc-800">
            Top 10 Drivers
          </span>
        </div>

        <div className="space-y-2.5">
          {featureImportance.slice(0, 10).map((f) => (
            <div key={f.feature} className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-zinc-200 font-mono-code">{f.feature}</span>
                <span className="font-mono-code text-white font-bold">{f.relative_importance}%</span>
              </div>
              <div className="w-full h-1 rounded bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-300" 
                  style={{ width: `${Math.min(100, f.relative_importance * 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
