import React from 'react';
import { FileText, Search, Filter, ShieldAlert, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  variant?: 'default' | 'card' | 'compact' | 'table';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = FileText,
  className = '',
  variant = 'default',
}) => {
  if (variant === 'table') {
    return (
      <tr className={className}>
        <td colSpan={100} className="text-center py-12 px-4">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center mx-auto">
              <Icon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
            </div>
            {actionLabel && onAction && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onAction}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs"
                >
                  {actionLabel}
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`p-4 text-center space-y-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 ${className}`}>
        <h4 className="font-bold text-slate-800 text-xs">{title}</h4>
        <p className="text-[11px] text-slate-500 leading-relaxed">{description}</p>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] rounded transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`p-8 sm:p-12 text-center border border-slate-200 rounded-2xl bg-white shadow-2xs space-y-4 ${className}`}>
      <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="font-serif font-bold text-slate-900 text-base">{title}</h3>
        <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAction}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};
