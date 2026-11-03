import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  BarChart3, 
  BrainCircuit, 
  GitCompare, 
  Calculator, 
  TrendingUp, 
  Target,
  Sliders, 
  AlertTriangle, 
  Activity, 
  GraduationCap,
  FileText, 
  Settings,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 
  | 'dashboard' 
  | 'dataset' 
  | 'eda' 
  | 'train' 
  | 'comparison' 
  | 'predictions' 
  | 'forecast' 
  | 'budget'
  | 'scenarios'
  | 'anomalies' 
  | 'insights' 
  | 'viva'
  | 'reports' 
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const navItems: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }> = [
  { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
  { id: 'dataset', label: 'Historical Ledger', icon: Database, badge: '114' },
  { id: 'eda', label: 'Exploratory Analytics', icon: BarChart3 },
  { id: 'train', label: 'Pipeline & Training', icon: BrainCircuit },
  { id: 'comparison', label: 'Model Leaderboard', icon: GitCompare },
  { id: 'predictions', label: 'Expense Estimator', icon: Calculator },
  { id: 'forecast', label: 'Forward Forecast', icon: TrendingUp },
  { id: 'budget', label: 'Budget Allocations', icon: Target, badge: 'Active' },
  { id: 'scenarios', label: 'Sensitivity Simulator', icon: Sliders },
  { id: 'anomalies', label: 'Anomaly Detection', icon: AlertTriangle, badge: 'IQR' },
  { id: 'insights', label: 'Statistical Insights', icon: Activity },
  { id: 'viva', label: 'Methodology & Defense', icon: GraduationCap, badge: 'Theory' },
  { id: 'reports', label: 'Project Specification', icon: FileText },
  { id: 'settings', label: 'System Diagnostics', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel border-r border-zinc-800 flex flex-col transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-white text-black font-mono-code font-bold text-xs flex items-center justify-center shadow-sm">
              F
            </div>
            <div>
              <span className="font-heading font-bold text-sm tracking-tight text-white block leading-none">FYTE</span>
              <p className="text-[10px] text-zinc-500 font-mono-code mt-0.5">Supervised Engine</p>
            </div>
          </div>
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono-code">
            Platform Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors group ${
                  isActive
                    ? 'bg-zinc-800 text-white font-medium border border-zinc-700/80'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono-code ${
                      isActive 
                        ? 'bg-zinc-700 text-white' 
                        : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3 h-3 text-zinc-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-800 text-[11px] text-zinc-500 font-mono-code">
          <span>Release 1.0.0-PRO</span>
        </div>
      </aside>
    </>
  );
};
