import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, FileText, Ban, RefreshCw } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const normalized = (status || '').toUpperCase();

  let colorClasses = 'bg-neutral-100 text-black border-neutral-300';
  let Icon = Clock;
  let label = status?.replace(/_/g, ' ') || 'UNKNOWN';

  switch (normalized) {
    // Approved / Completed / Confirmed / Verified -> Solid Black Badge with White Text
    case 'CLEARED':
    case 'APPROVED':
    case 'COMPLETED':
    case 'CONFIRMED':
    case 'EXECUTED':
    case 'VERIFIED':
    case 'ACCEPTED':
      colorClasses = 'bg-black text-white border-black font-bold';
      Icon = CheckCircle2;
      break;

    // Active Workflow / Processing -> Subtle Light Gray Badge with Black Text
    case 'IN_PROGRESS':
    case 'UNDER_REVIEW':
    case 'SUBMITTED':
    case 'PROCESSING':
    case 'PARTIALLY_SIGNED':
    case 'PROPERTY_IDENTIFIED':
    case 'TRANSACTION_STARTED':
    case 'LEGAL_DUE_DILIGENCE':
    case 'OFFER_STAGE':
    case 'CONTRACT_SIGNING':
    case 'PAYMENTS_ESCROW':
    case 'CLOSING':
      colorClasses = 'bg-neutral-100 text-black border-neutral-300 font-semibold';
      Icon = RefreshCw;
      break;

    // Ready for Action / Draft -> Crisp White with Black Border
    case 'READY_FOR_SIGNATURE':
    case 'UPLOADED':
    case 'DRAFT':
    case 'INITIATED':
      colorClasses = 'bg-white text-black border-neutral-400 font-medium';
      Icon = FileText;
      break;

    // Pending / Waiting
    case 'PENDING':
      colorClasses = 'bg-neutral-100 text-neutral-700 border-neutral-300';
      Icon = Clock;
      break;

    // Issues / Rejected / Cancelled -> Dark Neutral Badge with High Contrast
    case 'REQUIRES_CORRECTION':
    case 'COUNTEROFFER':
    case 'ISSUE_FOUND':
    case 'REJECTED':
    case 'FAILED':
    case 'CANCELLED':
    case 'WITHDRAWN':
      colorClasses = 'bg-neutral-900 text-white border-black font-mono font-bold';
      Icon = AlertCircle;
      break;

    default:
      colorClasses = 'bg-neutral-100 text-black border-neutral-300';
      Icon = Clock;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span className={`inline-flex items-center rounded border tracking-wide uppercase ${sizeClasses} ${colorClasses}`}>
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{label}</span>
    </span>
  );
};
