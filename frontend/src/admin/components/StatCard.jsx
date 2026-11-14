import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const StatCard = ({
  title,
  value,
  subtitle,
  trend,
  trendType = 'up', // up, down, neutral
  icon: Icon,
  iconBg = 'bg-blue-50 text-primary',
  badge = null
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {badge}
            </span>
          )}
          {Icon && (
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
          {value}
        </h4>
      </div>

      {(trend || subtitle) && (
        <div className="flex items-center gap-1.5 mt-2.5 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded-md ${
                trendType === 'up'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : trendType === 'down'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {trendType === 'up' && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
              {trendType === 'down' && <ArrowDownRight className="w-3 h-3 mr-0.5" />}
              {trendType === 'neutral' && <Minus className="w-3 h-3 mr-0.5" />}
              {trend}
            </span>
          )}
          {subtitle && <span className="text-slate-400 dark:text-slate-500 font-medium truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
