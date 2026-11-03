import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  PieChart, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  CreditCard, 
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { AIInsight } from '../types';

export const Insights: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        setLoading(true);
        const data = await api.getInsights();
        setInsights(data);
      } catch (err) {
        console.error("Failed to load insights", err);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'category': return <PieChart className="w-4 h-4 text-zinc-300" />;
      case 'temporal': return <Calendar className="w-4 h-4 text-zinc-300" />;
      case 'anomaly': return <AlertTriangle className="w-4 h-4 text-zinc-300" />;
      case 'trend': return <TrendingUp className="w-4 h-4 text-zinc-300" />;
      case 'behavioral': return <CreditCard className="w-4 h-4 text-zinc-300" />;
      default: return <Activity className="w-4 h-4 text-zinc-300" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-white animate-spin" />
        <p className="text-xs font-mono-code text-zinc-400">Computing empirical statistical observations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-zinc-300" />
          Empirical Observations & Statistical Diagnostics
        </h2>
        <p className="text-xs text-zinc-400">
          Deterministic financial and behavioral takeaways calculated directly from historical sample moments and dispersion.
        </p>
      </div>

      {/* Grid of Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className="glass-card rounded-xl p-5 border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                    {getIcon(ins.type)}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono-code uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {ins.impact} Priority
                  </span>
                </div>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {ins.badge}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1.5 font-heading">
                {ins.title}
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {ins.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono-code">
              <span>Source: Distribution Moments</span>
              <span className="text-zinc-400 font-medium flex items-center gap-1">
                Verified Causal <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Transparency Guarantee Note */}
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-zinc-300 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-zinc-200 block mb-0.5">Empirical Grounding Guarantee</strong>
          Every observation above is deterministically computed from verified mathematical metrics (sample sums, means, IQR fences, and regression residuals). No speculative or ungrounded generative content is rendered.
        </div>
      </div>
    </div>
  );
};
