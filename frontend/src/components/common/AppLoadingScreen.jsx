import React from 'react';
import { Bus, Sparkles } from 'lucide-react';

export const AppLoadingScreen = ({ message = "Loading YatraBus..." }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md text-white transition-opacity duration-300"
    >
      <div className="relative flex flex-col items-center max-w-sm px-6 text-center space-y-6">
        {/* Animated Brand Logo with Glowing Rings */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-blue-500/20 animate-ping" />
          <div className="absolute w-20 h-20 rounded-full bg-primary/40 animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent shadow-xl flex items-center justify-center text-white border border-white/20">
            <Bus className="w-8 h-8 animate-bounce text-amber-300" />
          </div>
        </div>

        {/* Brand Name & Status Message */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-0.5 rounded-full border border-amber-400/20">
            <Sparkles className="w-3 h-3" />
            <span>Pan-India Transit Network</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">YatraBus</h2>
          <p className="text-xs text-slate-300 font-medium">{message}</p>
        </div>

        {/* Shimmer Animated Progress Track */}
        <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 bg-gradient-to-r from-primary via-accent to-amber-400 w-1/2 rounded-full animate-[progress_1.4s_ease-in-out_infinite]" />
        </div>

        <span className="text-[10px] text-slate-400 font-mono">
          Safe • Verified Seats • Instant E-Tickets
        </span>
      </div>
    </div>
  );
};

export default AppLoadingScreen;
