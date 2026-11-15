import React from 'react';

/**
 * Universal Skeleton Component for smooth shimmering loading placeholders
 */
export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
};

export const TripCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-44 rounded-md" />
          <Skeleton className="h-3.5 w-28 rounded-md" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="grid grid-cols-3 gap-4 py-2 border-y border-slate-100 dark:border-slate-800/80">
        <div className="space-y-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex flex-col items-center justify-center space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-1 w-24 rounded-full" />
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="h-5 w-16 ml-auto" />
          <Skeleton className="h-3 w-20 ml-auto" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const DestinationCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between">
      <div>
        <Skeleton className="h-56 w-full rounded-none" />
        <div className="p-6 space-y-3">
          <Skeleton className="h-4 w-1/3 rounded" />
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-5/6 rounded" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-2.5 w-14" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const PackageCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-[#121829] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div>
        <Skeleton className="h-48 w-full rounded-none" />
        <div className="p-5 space-y-3">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-5 w-4/5 rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-2/3 rounded" />
        </div>
      </div>
      <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-2 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-8 w-28 rounded-xl" />
      </div>
    </div>
  );
};

export const DashboardBookingSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-9 w-32 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full space-y-3">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex gap-4 items-center p-3 border-b border-slate-100 dark:border-slate-800">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <Skeleton key={cIdx} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
