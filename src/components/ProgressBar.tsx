import React from 'react';
import { Check, Circle } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number; // 1 to 8
  className?: string;
}

const STAGES = [
  { id: 1, label: 'Client Information' },
  { id: 2, label: 'Documents' },
  { id: 3, label: 'Legal Due Diligence' },
  { id: 4, label: 'Offer' },
  { id: 5, label: 'Contract' },
  { id: 6, label: 'Payment' },
  { id: 7, label: 'Closing' },
  { id: 8, label: 'Completed' },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, className = '' }) => {
  return (
    <div className={`w-full bg-white border border-slate-200 rounded-lg p-5 shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Transaction Progress Status
        </h3>
        <span className="text-xs font-medium text-slate-700">
          Stage <strong className="text-slate-900">{Math.min(currentStep, 8)}</strong> of 8
        </span>
      </div>

      {/* Desktop Stepper */}
      <div className="hidden lg:grid grid-cols-8 gap-2 relative">
        {STAGES.map((stage) => {
          const isDone = currentStep > stage.id;
          const isCurrent = currentStep === stage.id;
          const isFuture = currentStep < stage.id;

          return (
            <div key={stage.id} className="flex flex-col items-center text-center relative group">
              {/* Connector line */}
              {stage.id < 8 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-0.5 -z-0 transition-colors ${
                    isDone ? 'bg-emerald-500' : isCurrent ? 'bg-blue-400' : 'bg-slate-200'
                  }`}
                  style={{ width: 'calc(100% - 1rem)', transform: 'translateX(50%)' }}
                />
              )}

              {/* Indicator Node */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all shadow-xs ${
                  isDone
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                    : isCurrent
                    ? 'bg-blue-900 text-white ring-4 ring-blue-100 ring-offset-1'
                    : 'bg-slate-100 text-slate-400 border border-slate-300'
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                ) : (
                  <span>{stage.id}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-2.5 text-xs tracking-tight ${
                  isCurrent
                    ? 'font-bold text-slate-900'
                    : isDone
                    ? 'font-medium text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {stage.label}
              </span>

              {/* Status Mark */}
              <span className="text-[10px] font-mono mt-0.5">
                {isDone ? (
                  <span className="text-emerald-600 font-bold">✓</span>
                ) : isCurrent ? (
                  <span className="text-blue-600 font-bold">●</span>
                ) : (
                  <span className="text-slate-300">○</span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile / Tablet Horizontal Scroll */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {STAGES.map((stage) => {
          const isDone = currentStep > stage.id;
          const isCurrent = currentStep === stage.id;
          return (
            <div
              key={stage.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs whitespace-nowrap border ${
                isCurrent
                  ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                  : isDone
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <span className="font-mono text-xs">
                {isDone ? '✓' : isCurrent ? '●' : '○'}
              </span>
              <span>{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
