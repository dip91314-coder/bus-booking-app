import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export const PaymentProcessingModal = ({
  isOpen,
  currentStepMessage,
  amount,
  onComplete,
}) => {
  const [progress, setProgress] = useState(15);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const STEPS = [
    { title: 'Securing Gateway', subtitle: 'Connecting via 256-bit SSL encryption' },
    { title: 'Verifying Seats', subtitle: 'Atomic lock confirmed on bus inventory' },
    { title: 'Bank Authorization', subtitle: 'Authenticating with payment network' },
    { title: 'Issuing Digital Ticket', subtitle: 'Generating authenticated PNR' },
  ];

  useEffect(() => {
    if (!isOpen) {
      setProgress(15);
      setActiveStepIndex(0);
      return;
    }

    const t1 = setTimeout(() => {
      setProgress(40);
      setActiveStepIndex(1);
    }, 600);

    const t2 = setTimeout(() => {
      setProgress(75);
      setActiveStepIndex(2);
    }, 1400);

    const t3 = setTimeout(() => {
      setProgress(98);
      setActiveStepIndex(3);
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Payment in progress"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 transition-all duration-300"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#111726] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center overflow-hidden">
        {/* Top glowing ambient accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-primary to-emerald-500" />

        {/* Animated Security Shield Icon */}
        <div className="relative mx-auto w-20 h-20 mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/20 animate-ping opacity-75" />
          <div className="absolute inset-1 rounded-full bg-emerald-500/15 animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-blue-700 text-white flex items-center justify-center shadow-lg border border-white/20">
            {progress < 90 ? (
              <Loader2 className="w-8 h-8 text-amber-300 animate-spin" />
            ) : (
              <ShieldCheck className="w-9 h-9 text-emerald-400 animate-bounce" />
            )}
          </div>
        </div>

        {/* Title & Status message */}
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
          {progress < 90 ? 'Processing Secure Payment' : 'Finalizing Your Reservation'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[1.5rem] font-medium">
          {currentStepMessage || STEPS[activeStepIndex]?.subtitle}
        </p>

        {/* Amount Badge */}
        {amount && (
          <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 px-4 py-1.5 rounded-full text-xs font-mono font-bold my-4 border border-slate-200 dark:border-slate-700">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Amount: ₹{amount}</span>
          </div>
        )}

        {/* Progress Bar & Percentage */}
        <div className="space-y-1.5 my-4">
          <div className="flex justify-between text-[11px] font-bold text-slate-400">
            <span>Transaction Progress</span>
            <span className="font-mono text-primary dark:text-blue-400">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-primary to-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 4-Step Checklist */}
        <div className="space-y-2 text-left pt-2 pb-4">
          {STEPS.map((step, idx) => {
            const isCompleted = activeStepIndex > idx;
            const isCurrent = activeStepIndex === idx;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2 rounded-xl text-xs transition-colors ${
                  isCurrent
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800/60 font-semibold'
                    : isCompleted
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500 opacity-60'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-primary dark:text-blue-400 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] shrink-0">
                    {idx + 1}
                  </div>
                )}
                <div className="flex-1 truncate">
                  <span className="block">{step.title}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Regulatory & Security Compliance Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3 h-3 text-amber-500" />
            PCI-DSS Level 1
          </span>
          <span>•</span>
          <span className="font-semibold text-slate-500 dark:text-slate-400">256-Bit SSL</span>
          <span>•</span>
          <span className="font-semibold text-slate-500 dark:text-slate-400">RBI Compliant</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessingModal;
