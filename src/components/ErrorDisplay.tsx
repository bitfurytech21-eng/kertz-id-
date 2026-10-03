import React from 'react';
import { AlertCircle, WifiOff, ShieldAlert, FileX, RotateCcw, ArrowLeft } from 'lucide-react';

export type ErrorType =
  | 'NETWORK'
  | 'SERVER'
  | 'PERMISSION'
  | 'NOT_FOUND'
  | 'SESSION_EXPIRED'
  | 'ACTION_UNAVAILABLE'
  | 'UPLOAD_FAILED'
  | 'PAYMENT_FAILED'
  | 'CONTRACT_UNAVAILABLE'
  | 'CUSTOM';

interface ErrorDisplayProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onNavigateHome?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  type = 'SERVER',
  title: customTitle,
  message: customMessage,
  onRetry,
  onNavigateHome,
  className = '',
}) => {
  let title = customTitle;
  let description = customMessage;
  let Icon = AlertCircle;

  switch (type) {
    case 'NETWORK':
      title = title || 'Unable to load this information';
      description =
        description ||
        'We could not connect to the service. Please check your connection and try again.';
      Icon = WifiOff;
      break;
    case 'PERMISSION':
      title = title || 'Access not available';
      description =
        description || 'You do not have permission to access this information.';
      Icon = ShieldAlert;
      break;
    case 'NOT_FOUND':
      title = title || 'Information not found';
      description =
        description ||
        'The requested information could not be found or may no longer be available.';
      Icon = FileX;
      break;
    case 'SESSION_EXPIRED':
      title = title || 'Your session has expired';
      description = description || 'Please sign in again to continue.';
      Icon = ShieldAlert;
      break;
    case 'ACTION_UNAVAILABLE':
      title = title || 'Action unavailable';
      description =
        description ||
        'This action cannot be completed at the current stage of the transaction.';
      Icon = AlertCircle;
      break;
    case 'UPLOAD_FAILED':
      title = title || 'Document could not be uploaded';
      description =
        description || 'Please check the file type and size and try again.';
      Icon = AlertCircle;
      break;
    case 'PAYMENT_FAILED':
      title = title || 'Payment was not completed';
      description = description || 'The payment could not be confirmed.';
      Icon = AlertCircle;
      break;
    case 'CONTRACT_UNAVAILABLE':
      title = title || 'Contract unavailable';
      description = description || 'The contract could not be loaded. Please try again.';
      Icon = FileX;
      break;
    case 'SERVER':
    default:
      title = title || 'Something went wrong';
      description =
        description || 'We could not complete this request. Please try again.';
      Icon = AlertCircle;
      break;
  }

  return (
    <div className={`p-8 text-center border border-slate-200 rounded-2xl bg-white shadow-2xs space-y-4 max-w-lg mx-auto ${className}`}>
      <div className="w-12 h-12 bg-rose-50 text-rose-700 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-serif font-bold text-slate-900 text-base">{title}</h3>
        <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Try Again
          </button>
        )}

        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors border border-slate-200 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};
