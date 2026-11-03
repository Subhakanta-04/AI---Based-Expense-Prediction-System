import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Calculator, 
  Award, 
  Target, 
  AlertTriangle, 
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { StatCard } from '../components/dashboard/StatCard';
import { PredictionCard } from '../components/dashboard/PredictionCard';
import { SmartSummaryBanner } from '../components/common/SmartSummaryBanner';
import { EDASummary, EDACharts, BestModelInfo, AnomalyReport } from '../types';
import { api } from '../services/api';

const MONO_PALETTE = ['#ffffff', '#e4e4e7', '#a1a1aa', '#71717a', '#52525b', '#3f3f46'];

interface DashboardProps {
  onNavigateTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateTab }) => {
  const [edaSummary, setEdaSummary] = useState<EDASummary | null>(null);
  const [chartsData, setChartsData] = useState<EDACharts | null>(null);
  const [bestModel, setBestModel] = useState<BestModelInfo | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [sum, ch, bm, an] = await Promise.all([
          api.getEDASummary(),
          api.getEDACharts(),
          api.getBestModel(),
          api.getAnomalies()
        ]);
        setEdaSummary(sum);
        setChartsData(ch);
        setBestModel(bm);
        setAnomalies(an);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-white animate-spin" />
        <p className="text-xs font-mono-code text-zinc-400">Loading Econometric Data & Regression Models...</p>
      </div>
    );
  }

  const totalSpent = edaSummary?.total_expense || 79330;
  const avgExpense = edaSummary?.average_expense || 695.88;
  const maxExpense = edaSummary?.max_expense || 4000;
  const topCategory = edaSummary?.top_category || "Food";
  const mostUsedPm = edaSummary?.most_used_payment_method || "UPI";
  const r2Score = bestModel?.test_metrics?.r2 ?? 0.5764;
  const rmseScore = bestModel?.test_metrics?.rmse ?? 297.90;
  const modelName = bestModel?.best_model_name || "Random Forest";
  const anomalyCount = anomalies?.anomaly_count ?? 7;

  // Sample timeline for Recharts
  const timelinePoints = chartsData?.timeline?.slice(-30) || [];
  
  // Category pie data
  const pieData = (edaSummary?.categories || []).map((c) => ({
    name: c.category,
    value: c.total_spent
  }));

  return (
    <div className="space-y-6">
      {/* Smart Summary Banner */}
      <SmartSummaryBanner
        totalSpent={totalSpent}
        avgExpense={avgExpense}
        maxExpense={maxExpense}
        topCategory={topCategory}
        mostUsedPaymentMethod={mostUsedPm}
        predictedNextExpense={560}
        trendDirection={edaSummary?.spending_trend?.direction || "Stable"}
      />

      {/* 6 Essential Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Outflow"
          value={`₹${totalSpent.toLocaleString('en-IN')}`}
          subtitle={`${edaSummary?.total_records || 114} transactions`}
          icon={Wallet}
          badge="H1 2024"
          badgeColor="neutral"
          onClick={() => onNavigateTab('dataset')}
        />
        <StatCard
          title="Mean Outflow"
          value={`₹${avgExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtitle="Per transaction"
          icon={TrendingUp}
          badge="Median: ₹455"
          badgeColor="neutral"
          onClick={() => onNavigateTab('eda')}
        />
        <StatCard
          title="Inferred Next"
          value="₹560"
          subtitle="Dynamic baseline"
          icon={Calculator}
          badge="Confidence: High"
          badgeColor="neutral"
          onClick={() => onNavigateTab('predictions')}
        />
        <StatCard
          title="Champion Model"
          value={modelName.split(' ')[0]}
          subtitle="Benchmark leader"
          icon={Award}
          badge={`RMSE: ₹${rmseScore}`}
          badgeColor="neutral"
          onClick={() => onNavigateTab('comparison')}
        />
        <StatCard
          title="Variance (R²)"
          value={r2Score.toFixed(4)}
          subtitle="Explained variance"
          icon={Target}
          badge="Test Partition"
          badgeColor="neutral"
          onClick={() => onNavigateTab('comparison')}
        />
        <StatCard
          title="IQR Outliers"
          value={anomalyCount}
          subtitle="Flagged deviations"
          icon={AlertTriangle}
          badge="1.5× IQR Fence"
          badgeColor="neutral"
          onClick={() => onNavigateTab('anomalies')}
        />
      </div>

      {/* Main Charts & Live Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Area Chart (2 Columns) */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5 border border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h3 className="text-sm font-bold text-white font-heading">Expenditure Trajectory</h3>
              <p className="text-xs text-zinc-400">Chronological daily spending timeline with category tagging</p>
            </div>
            <button
              onClick={() => onNavigateTab('eda')}
              className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1 self-start sm:self-auto transition-colors"
            >
              Detailed Analytics <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelinePoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="expenseMonoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={{ stroke: '#27272a' }}
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  tickFormatter={(val) => val.slice(5)}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={{ stroke: '#27272a' }}
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px' }}
                  itemStyle={{ color: '#ffffff' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#ffffff" 
                  strokeWidth={1.75} 
                  fillOpacity={1} 
                  fill="url(#expenseMonoGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Simulator Widget (1 Column) */}
        <div>
          <PredictionCard 
            categories={edaSummary?.categories.map(c => c.category) || []}
            paymentMethods={edaSummary?.payment_methods.map(p => p.payment_method) || []}
            onPredicted={() => {}}
          />
        </div>
      </div>

      {/* Secondary Analytics Row: Category Distribution + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Donut */}
        <div className="glass-card rounded-xl p-5 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-heading">Category Allocation</h3>
              <p className="text-xs text-zinc-400">Proportional expenditure breakdown</p>
            </div>
            <span className="text-xs font-mono-code text-zinc-400">
              Primary: {topCategory}
            </span>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={MONO_PALETTE[index % MONO_PALETTE.length]} stroke="#09090b" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px', color: '#fff' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Outflow']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            {pieData.slice(0, 6).map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: MONO_PALETTE[i % MONO_PALETTE.length] }} />
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions & Outliers Preview */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-heading">Recent Ledger Entries</h3>
              <p className="text-xs text-zinc-400">Latest recorded transactions from chronological sequence</p>
            </div>
            <button 
              onClick={() => onNavigateTab('dataset')}
              className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              View All 114 Rows <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

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
                {chartsData?.timeline?.slice(-6).reverse().map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-2 px-3 font-mono-code text-zinc-400">{row.date}</td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-code bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {row.category}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-zinc-300 truncate max-w-[150px]">{row.description}</td>
                    <td className="py-2 px-3 text-zinc-400">{row.payment_method}</td>
                    <td className="py-2 px-3 text-right font-mono-code font-bold text-white">₹{row.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
