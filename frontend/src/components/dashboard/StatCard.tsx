import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple' | 'blue' | 'neutral';
  accentColor?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'neutral',
  onClick
}) => {
  const badgeClasses = {
    emerald: 'bg-zinc-900 text-zinc-300 border-zinc-700',
    amber: 'bg-zinc-900 text-zinc-300 border-zinc-700',
    rose: 'bg-zinc-900 text-zinc-300 border-zinc-700',
    indigo: 'bg-zinc-900 text-zinc-300 border-zinc-700',
    purple: 'bg-zinc-900 text-zinc-300 border-zinc-700',
    blue: 'bg-zinc-900 text-zinc-300 border-zinc-700',
    neutral: 'bg-zinc-900 text-zinc-300 border-zinc-700',
  }[badgeColor] || 'bg-zinc-900 text-zinc-300 border-zinc-700';

  return (
    <div 
      onClick={onClick}
      className={`glass-card rounded-xl p-4 sm:p-5 relative border border-zinc-800 transition-colors ${onClick ? 'cursor-pointer hover:border-zinc-700' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-semibold text-zinc-400 tracking-wider uppercase font-mono-code">
            {title}
          </span>
          <h3 className="text-2xl font-bold text-white mt-1.5 font-mono-code tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1 font-sans">
              {subtitle}
            </p>
          )}
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {badge && (
        <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono-code font-medium border ${badgeClasses}`}>
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};
