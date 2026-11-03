import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Database, 
  Menu, 
  Plus, 
  User as UserIcon, 
  LogOut, 
  RotateCw,
  ChevronDown 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenSidebar?: () => void;
  totalRecords?: number;
  bestModelName?: string;
  onTrainClick?: () => void;
  onAddExpenseClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  onOpenSidebar,
  totalRecords = 114,
  bestModelName = 'Random Forest',
  onTrainClick,
  onAddExpenseClick
}) => {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-zinc-800 px-4 lg:px-8 py-2.5 transition-colors">
      <div className="flex items-center justify-between">
        {/* Left: Mobile menu toggle + Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-white text-black font-mono-code font-bold flex items-center justify-center text-sm shadow-sm">
              F
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white font-heading">
                  FYTE
                </h1>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono-code font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Core v1.0
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden md:block">
                Quantitative Expenditure Analytics & Econometric Modeling
              </p>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Add Expense Button */}
          {onAddExpenseClick && (
            <button
              onClick={onAddExpenseClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Expense</span>
            </button>
          )}

          {/* Dataset Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
            <Database className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-mono-code text-zinc-200">expense_data.csv</span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            <span className="text-zinc-400">{totalRecords} rows</span>
          </div>

          {/* Retrain ML Button */}
          {onTrainClick && (
            <button
              onClick={onTrainClick}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Retrain Model</span>
            </button>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-zinc-300" /> : <Moon className="w-4 h-4 text-zinc-300" />}
          </button>

          {/* User Profile & Logout Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors text-left"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover border border-zinc-700" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-white">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="hidden xl:block">
                <span className="text-xs font-semibold text-white block leading-tight truncate max-w-[110px]">{user?.name || 'User'}</span>
                <span className="text-[10px] text-zinc-400 block leading-tight">{user?.role?.split(' ')[0] || 'Member'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 glass-card rounded-xl p-2 border border-zinc-800 shadow-xl z-50 animate-in fade-in zoom-in-95">
                <div className="p-2 border-b border-zinc-800">
                  <p className="text-xs font-semibold text-white truncate">{user?.name || "Dr. Alex Morgan"}</p>
                  <p className="text-[11px] text-zinc-400 truncate">{user?.email || "admin@fyte.institution"}</p>
                  <span className="mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium">
                    {user?.role || "Quantitative Research Director"}
                  </span>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
