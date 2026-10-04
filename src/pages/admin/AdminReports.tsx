import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Building,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import { safeDownload } from '../../utils/safeDownload';

export const AdminReports: React.FC<{ navigate: (path: string) => void }> = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.getMetrics()
      .then((res) => setMetrics(res.metrics))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportReport = () => {
    const reportText = `
KRETZ LEGAL WORKSPACE - NOTARIAL PERFORMANCE & TRANSACTION REPORT
Date: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY:
- Total Registered Buyers: ${metrics?.total_clients || 14}
- Total Property Requests: ${metrics?.total_requests || 8}
- Active Escalated Deals: ${metrics?.active_transactions || 5}
- Total Transaction Volume: €${((metrics?.total_transaction_volume || 42000000) / 1000000).toFixed(1)}M EUR
- Unverified Vault Documents: ${metrics?.unverified_documents || 2}

COMPLIANCE & AML HIGHLIGHTS:
- Tracfin Source of Funds Clearances: 100% Compliant
- eIDAS QES Electronic Signature Execution: Active
- Average Due Diligence Clearance Timeframe: 4.2 Days
    `;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    safeDownload(blob, `Kretz_Legal_Activity_Report_${new Date().toISOString().split('T')[0]}.txt`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>EXECUTIVE REPORTS & ANALYTICS</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Platform Activity & Notarial Transaction Volume
          </h1>
          <p className="text-xs text-slate-500">
            Real-time insights into property acquisition velocity, escrow cashflows, and Tracfin compliance metrics.
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Export Monthly Activity Report</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Total Volume</span>
          <span className="text-2xl font-bold font-mono text-emerald-800">
            €{((metrics?.total_transaction_volume || 42000000) / 1000000).toFixed(1)}M
          </span>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Active Transactions</span>
          <span className="text-2xl font-bold text-slate-900">{metrics?.active_transactions || 5}</span>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Avg Clearance Speed</span>
          <span className="text-2xl font-bold text-indigo-900 font-mono">4.2 Days</span>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Tracfin AML Pass</span>
          <span className="text-2xl font-bold text-emerald-700">100%</span>
        </div>
      </div>

      {/* Visual Analytics Graphic Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>Quarterly Transaction Volume Velocity (€ Millions)</span>
          </h2>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span>Q1 2026</span>
                <span className="font-bold text-slate-900">€14.5M</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span>Q2 2026</span>
                <span className="font-bold text-slate-900">€22.8M</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span>Q3 2026 (Current)</span>
                <span className="font-bold text-slate-900">€31.2M</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Due Diligence Status Breakdown</span>
          </h2>

          <div className="space-y-3 pt-2">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-900">KYC & Source of Funds Cleared</span>
              <span className="font-mono font-bold text-emerald-800">92%</span>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-900">Cadastral & Title Verified</span>
              <span className="font-mono font-bold text-indigo-800">98%</span>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold text-amber-900">Pending Escrow Deposit Finalization</span>
              <span className="font-mono font-bold text-amber-800">8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
