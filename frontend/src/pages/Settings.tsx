import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  RotateCcw, 
  Activity, 
  Cpu
} from 'lucide-react';
import { api } from '../services/api';

interface SettingsProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const SettingsPage: React.FC<SettingsProps> = ({ darkMode, setDarkMode }) => {
  const [health, setHealth] = useState<{ status: string; app: string; version: string } | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const apiHealthUrl = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}/health`
    : '/api/health';

  useEffect(() => {
    fetch(apiHealthUrl)
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(() => setHealth({ status: 'offline', app: 'FYTE', version: '1.0.0' }));
  }, [apiHealthUrl]);

  const handleReset = async () => {
    if (!window.confirm("Restore default expense_data.csv (114 records)?")) return;
    setResetting(true);
    try {
      const res = await api.resetDataset();
      setResetMessage(res.message);
    } catch (err: any) {
      setResetMessage(`Error: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2.5">
          <SettingsIcon className="w-5 h-5 text-zinc-300" />
          System Settings & Runtime Diagnostics
        </h2>
        <p className="text-xs text-zinc-400">
          Configure interface appearance, verify backend health, and manage local storage.
        </p>
      </div>

      {/* Theme Appearance Card */}
      <div className="glass-card rounded-xl p-6 border border-zinc-800">
        <h3 className="text-sm font-bold text-white mb-1">Theme Appearance</h3>
        <p className="text-xs text-zinc-400 mb-4">Toggle between dark institutional mode and clean light mode</p>

        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            onClick={() => setDarkMode(true)}
            className={`p-3 rounded-lg border flex items-center justify-center gap-2.5 text-xs font-semibold transition-colors ${
              darkMode
                ? 'bg-white text-black border-white'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark Mode</span>
          </button>

          <button
            onClick={() => setDarkMode(false)}
            className={`p-3 rounded-lg border flex items-center justify-center gap-2.5 text-xs font-semibold transition-colors ${
              !darkMode
                ? 'bg-white text-black border-white'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Light Mode</span>
          </button>
        </div>
      </div>

      {/* Backend & Environment Health */}
      <div className="glass-card rounded-xl p-6 border border-zinc-800">
        <h3 className="text-sm font-bold text-white mb-1">Backend Microservice Health</h3>
        <p className="text-xs text-zinc-400 mb-4">FastAPI runtime daemon status</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 block mb-1 font-mono-code">Daemon Status</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${health?.status === 'healthy' ? 'bg-zinc-200' : 'bg-zinc-500'}`} />
              <span className="text-sm font-bold text-white font-mono-code uppercase">{health?.status || 'Online'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 block mb-1 font-mono-code">Endpoint URL</span>
            <span className="text-xs font-mono-code text-zinc-200">{import.meta.env.VITE_API_URL || '/api'}</span>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 block mb-1 font-mono-code">Runtime Environment</span>
            <span className="text-xs font-mono-code text-zinc-200">Python 3.13 • Scikit-Learn • XGBoost</span>
          </div>
        </div>
      </div>

      {/* Dataset Maintenance */}
      <div className="glass-card rounded-xl p-6 border border-zinc-800">
        <h3 className="text-sm font-bold text-white mb-1">Dataset Reinitialization</h3>
        <p className="text-xs text-zinc-400 mb-4">
          Reset dataset to the original default `expense_data.csv` (114 records)
        </p>

        {resetMessage && (
          <div className="p-3 mb-3 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-mono-code">
            {resetMessage}
          </div>
        )}

        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
          <span>{resetting ? "Reinitializing..." : "Restore Default expense_data.csv"}</span>
        </button>
      </div>
    </div>
  );
};
