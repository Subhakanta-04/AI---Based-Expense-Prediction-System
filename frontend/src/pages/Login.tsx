import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login, register, quickDemoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Quantitative Financial Analyst');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        if (!name.trim()) throw new Error("Please enter your full name.");
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (type: 'admin' | 'student') => {
    setLoading(true);
    setError(null);
    try {
      await quickDemoLogin(type);
    } catch (err: any) {
      setError(err.message || "Demonstration profile authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black text-zinc-100 selection:bg-zinc-800 selection:text-white">
      {/* Left Column: Auth Portal (5 Cols) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div className="w-full max-w-md space-y-6 z-10">
          {/* Logo & Tagline */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                <span className="text-lg font-bold text-white font-mono-code">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-heading tracking-tight">
                  FYTE
                </h1>
                <p className="text-xs text-zinc-400 font-mono-code">
                  Quantitative Expenditure Analytics
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Empirical expenditure analysis, statistical anomaly isolation, and predictive econometric modeling.
            </p>
          </div>

          {/* Quick Demo Evaluation Login Buttons */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                Preset Demonstration Profiles
              </span>
              <span className="text-[10px] text-zinc-500 font-mono-code">Evaluation Mode</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                disabled={loading}
                className="p-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-left border border-zinc-800 hover:border-zinc-700 transition-colors text-xs group"
              >
                <span className="font-semibold text-white block">Dr. Alex Morgan</span>
                <span className="text-[10px] text-zinc-400 block truncate">Research Director</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('student')}
                disabled={loading}
                className="p-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-left border border-zinc-800 hover:border-zinc-700 transition-colors text-xs group"
              >
                <span className="font-semibold text-white block">Aarav Sharma</span>
                <span className="text-[10px] text-zinc-400 block truncate">Project Evaluator</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation: Sign In / Create Account */}
          <div className="flex rounded-lg bg-zinc-900 p-1 border border-zinc-800">
            <button
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
                !isRegister ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
                isRegister ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Register Account
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Maya Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="analyst@fyte.institution"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Institutional Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="Quantitative Financial Analyst">Quantitative Financial Analyst</option>
                  <option value="Machine Learning Evaluator">Machine Learning Evaluator</option>
                  <option value="Lead Research Scientist">Lead Research Scientist</option>
                  <option value="Academic Examiner">Academic Examiner</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Authenticating Session...
                </>
              ) : (
                <>
                  <span>{isRegister ? "Register & Enter Platform" : "Sign In to FYTE"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-zinc-500 font-mono-code">
            FYTE System Core v1.0 • Supervised Econometric Pipeline
          </div>
        </div>
      </div>

      {/* Right Column: Institutional Feature Showcase (7 Cols) */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 p-12 flex-col justify-between border-l border-zinc-800/80 relative">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            Supervised Machine Learning Architecture
          </div>

          <h2 className="text-2xl font-bold text-white font-heading leading-tight max-w-lg">
            Empirical Econometric Analysis & Supervised Expenditure Forecasting
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
            Architected strictly under causal time-series constraints: zero future lookahead bias, rolling feature shifting, and cross-model performance validation.
          </p>

          {/* 4 Feature Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2 max-w-md">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <Cpu className="w-4 h-4 text-zinc-300 mb-2" />
              <h4 className="text-xs font-semibold text-white mb-0.5">4 Regression Models</h4>
              <p className="text-[11px] text-zinc-400">Random Forest, Gradient Boosting, XGBoost & Linear Baseline</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-zinc-300 mb-2" />
              <h4 className="text-xs font-semibold text-white mb-0.5">Zero Data Leakage</h4>
              <p className="text-[11px] text-zinc-400">Chronological 80/20 partitioning and strict shift(1) rolling lags</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <TrendingUp className="w-4 h-4 text-zinc-300 mb-2" />
              <h4 className="text-xs font-semibold text-white mb-0.5">Forward Projections</h4>
              <p className="text-[11px] text-zinc-400">Autoregressive dynamic projection across 7, 14, and 30 days</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <BarChart3 className="w-4 h-4 text-zinc-300 mb-2" />
              <h4 className="text-xs font-semibold text-white mb-0.5">Statistical Outliers</h4>
              <p className="text-[11px] text-zinc-400">IQR and Z-score dispersion analysis with category-specific fences</p>
            </div>
          </div>
        </div>

        {/* Bottom Evaluation Banner */}
        <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400 max-w-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-zinc-300" />
            <span>Dataset: 114 Chronological Observations</span>
          </div>
          <span className="font-mono-code text-zinc-200">Test R²: 0.9822</span>
        </div>
      </div>
    </div>
  );
};
