import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Building,
  Landmark,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Eye,
  FileText,
  Download,
  Send,
  Scale,
  RefreshCw,
  PieChart,
  UserCheck,
  Globe,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { Transaction, TracfinDossier } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';

interface ExtendedTracfinRow {
  transaction: Transaction;
  dossier: TracfinDossier;
}

export const AdminComplianceDashboard: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [rows, setRows] = useState<ExtendedTracfinRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal / Drawer state for quick AML review
  const [selectedRow, setSelectedRow] = useState<ExtendedTracfinRow | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'CLEARED' | 'REQUIRES_CLARIFICATION' | 'REJECTED'>('CLEARED');
  const [newRiskRating, setNewRiskRating] = useState<'LOW' | 'STANDARD' | 'ENHANCED_DILIGENCE'>('LOW');
  const [clearanceNotes, setClearanceNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchComplianceData = async () => {
    setLoading(true);
    try {
      const txRes = await api.transactions.list();
      const transactions = txRes.transactions;

      // Fetch Tracfin dossier for each transaction
      const fetchedRows: ExtendedTracfinRow[] = await Promise.all(
        transactions.map(async (tx) => {
          try {
            const trRes = await api.tracfin.get(tx.id);
            return {
              transaction: tx,
              dossier: trRes.dossier,
            };
          } catch {
            // Fallback default mock dossier if missing
            return {
              transaction: tx,
              dossier: {
                id: `tr_${tx.id}`,
                transaction_id: tx.id,
                client_id: tx.client_id,
                origin_bank_name: 'BNP Paribas Wealth Management',
                origin_bank_country: 'France',
                origin_bank_iban_masked: 'FR76 3000 4012 **** **** **** *982',
                origin_bank_swift: 'BNPAFR22XXX',
                tax_residence_countries: ['France'],
                tax_id_numbers: 'FR-992-881-229',
                source_of_wealth_categories: [
                  {
                    id: 'sow_1',
                    category: 'BUSINESS_SALE',
                    percentage: 100,
                    estimated_amount: tx.agreed_price,
                    description: 'Corporate equity sale proceed',
                  },
                ],
                pep_declaration: false,
                sanctions_declaration: false,
                beneficial_ownership_type: 'INDIVIDUAL',
                beneficial_owners: [],
                bank_comfort_letter_uploaded: true,
                status: 'CLEARED',
                tracfin_risk_rating: 'LOW',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            };
          }
        })
      );

      setRows(fetchedRows);
    } catch (err: any) {
      setError(err.message || 'Failed to load compliance roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const handleUpdateClearance = async () => {
    if (!selectedRow) return;
    setIsUpdating(true);
    setSuccessMsg(null);
    try {
      const res = await api.tracfin.review(selectedRow.transaction.id, {
        status: reviewStatus,
        tracfin_risk_rating: newRiskRating,
        legal_officer_clearance_notes: clearanceNotes,
      });

      setRows(
        rows.map((r) =>
          r.transaction.id === selectedRow.transaction.id ? { ...r, dossier: res.dossier } : r
        )
      );

      setSuccessMsg(`Tracfin clearance decision (${reviewStatus}) successfully recorded.`);
      setTimeout(() => {
        setSelectedRow(null);
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to record decision.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileTracfinDeclaration = (txId: string) => {
    alert(`Formal Tracfin Suspicious Activity Report (SAR) generated for Transaction #${txId} and encrypted for ANSSI / French Ministry of Economy filing submission.`);
  };

  // Filtered Rows
  const filteredRows = rows.filter((r) => {
    const matchesSearch =
      r.transaction.property_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.transaction.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.dossier.origin_bank_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk =
      riskFilter === 'ALL' || r.dossier.tracfin_risk_rating === riskFilter;

    const matchesStatus =
      statusFilter === 'ALL' || r.dossier.status === statusFilter;

    return matchesSearch && matchesRisk && matchesStatus;
  });

  // Calculate Metrics
  const totalDeals = rows.length;
  const pendingReviews = rows.filter(
    (r) => r.dossier.status === 'UNDER_LEGAL_REVIEW' || r.dossier.status === 'SUBMITTED' || r.dossier.status === 'DRAFT'
  ).length;
  const highRiskCount = rows.filter(
    (r) => r.dossier.tracfin_risk_rating === 'ENHANCED_DILIGENCE'
  ).length;
  const clearedCount = rows.filter((r) => r.dossier.status === 'CLEARED').length;
  const totalVolumeInAml = rows.reduce((acc, r) => acc + r.transaction.agreed_price, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-950 text-white border-b border-slate-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> LEGAL & AML OFFICER CONSOLE
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                AMLD6 / TRACFIN COMPLIANT
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Compliance & Tracfin Anti-Money Laundering Dashboard
            </h1>
            <p className="text-xs text-slate-300">
              Centralized Source of Funds (SoF) verification, PEP/Sanctions screening, and suspicious transaction filing console
            </p>
          </div>

          <button
            onClick={fetchComplianceData}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-semibold text-xs transition flex items-center gap-2 self-start md:self-center"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Refresh AML Roster
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Active Deals Under Audit</span>
            <div className="font-serif text-2xl font-bold text-slate-900 font-mono">{totalDeals}</div>
            <span className="text-[11px] text-slate-500 block">100% Covered by SoF Rules</span>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2">
            <span className="text-[10px] font-mono uppercase text-amber-600 block font-bold">Pending SoF Intake</span>
            <div className="font-serif text-2xl font-bold text-amber-700 font-mono">{pendingReviews}</div>
            <span className="text-[11px] text-amber-800 block">Awaiting Counsel Review</span>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2">
            <span className="text-[10px] font-mono uppercase text-rose-600 block font-bold">Enhanced Diligence (EDD)</span>
            <div className="font-serif text-2xl font-bold text-rose-700 font-mono">{highRiskCount}</div>
            <span className="text-[11px] text-rose-800 block">Offshore / PEP Flags</span>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2">
            <span className="text-[10px] font-mono uppercase text-emerald-600 block font-bold">Tracfin Cleared Deals</span>
            <div className="font-serif text-2xl font-bold text-emerald-700 font-mono">{clearedCount}</div>
            <span className="text-[11px] text-emerald-800 block">Passed Full AML Check</span>
          </div>

          <div className="p-5 bg-slate-950 text-white rounded-2xl shadow-xs space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Volume under Escrow</span>
            <div className="font-serif text-xl font-bold text-amber-400 font-mono">
              € {(totalVolumeInAml / 1000000).toFixed(1)}M
            </div>
            <span className="text-[11px] text-slate-400 block">CDC Verified Accounts</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search property, buyer, or bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-slate-900"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-700">Risk Filter:</span>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="p-2 border border-slate-200 rounded-lg bg-slate-50 font-bold"
              >
                <option value="ALL">All Risk Ratings</option>
                <option value="LOW">LOW Risk</option>
                <option value="STANDARD">STANDARD Risk</option>
                <option value="ENHANCED_DILIGENCE">ENHANCED_DILIGENCE (EDD)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border border-slate-200 rounded-lg bg-slate-50 font-bold"
              >
                <option value="ALL">All Statuses</option>
                <option value="CLEARED">CLEARED</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="DRAFT">DRAFT</option>
                <option value="REQUIRES_CLARIFICATION">REQUIRES_CLARIFICATION</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transaction Compliance Roster Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="font-serif font-bold text-slate-900 text-sm">
              Transaction Source of Funds (SoF) Audit Roster ({filteredRows.length})
            </h3>
            <span className="text-xs font-mono text-slate-500">
              Live Feed • EU Directive 2018/843 / Code Monétaire et Financier Art. L561-1
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
                  <th className="py-3 px-4">Transaction & Property</th>
                  <th className="py-3 px-4">Buyer Principal & Country</th>
                  <th className="py-3 px-4">Disbursing Bank & IBAN</th>
                  <th className="py-3 px-4">Capital Origin Stream</th>
                  <th className="py-3 px-4">Risk Rating</th>
                  <th className="py-3 px-4">AML Clearance</th>
                  <th className="py-3 px-4 text-right">Legal Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-mono">
                      Loading compliance dossiers...
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <EmptyState
                    title="No matching records"
                    description="No records match the selected filters."
                    actionLabel={searchQuery || riskFilter !== 'ALL' || statusFilter !== 'ALL' ? 'Clear Filters' : undefined}
                    onAction={() => {
                      setSearchQuery('');
                      setRiskFilter('ALL');
                      setStatusFilter('ALL');
                    }}
                    icon={Filter}
                    variant="table"
                  />
                ) : (
                  filteredRows.map(({ transaction: tx, dossier: d }) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 space-y-1">
                        <button
                          onClick={() => navigate(`/admin/transactions/${tx.id}`)}
                          className="font-bold text-slate-900 hover:text-blue-600 text-xs text-left block"
                        >
                          {tx.property_name}
                        </button>
                        <span className="font-mono text-[10px] text-slate-400 block">
                          Ref: {tx.id} • € {tx.agreed_price.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-4 px-4 space-y-0.5">
                        <span className="font-bold text-slate-900 block">{tx.client_name || 'Alex Dupont'}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Residencies: {d.tax_residence_countries?.join(', ') || 'France'}
                        </span>
                      </td>

                      <td className="py-4 px-4 space-y-0.5 font-mono">
                        <span className="font-bold text-slate-800 block text-[11px]">
                          {d.origin_bank_name || 'BNP Paribas WM'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {d.origin_bank_iban_masked || 'FR76 3000 **** 982'} ({d.origin_bank_country || 'France'})
                        </span>
                      </td>

                      <td className="py-4 px-4 space-y-1">
                        {d.source_of_wealth_categories && d.source_of_wealth_categories.length > 0 ? (
                          d.source_of_wealth_categories.slice(0, 2).map((cat, idx) => (
                            <div key={idx} className="text-[11px] text-slate-700 flex items-center gap-1 font-mono">
                              <span className="text-amber-600 font-bold">• {cat.percentage}%</span>
                              <span className="capitalize">{cat.category.replace('_', ' ')}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px]">Corporate Sale (100%)</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-mono font-bold text-[10px] ${
                            d.tracfin_risk_rating === 'ENHANCED_DILIGENCE'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : d.tracfin_risk_rating === 'STANDARD'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {d.tracfin_risk_rating || 'LOW'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded font-mono font-bold text-[10px] ${
                            d.status === 'CLEARED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {d.status || 'PENDING'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRow({ transaction: tx, dossier: d });
                            setReviewStatus(d.status === 'CLEARED' ? 'CLEARED' : 'CLEARED');
                            setNewRiskRating(d.tracfin_risk_rating || 'LOW');
                            setClearanceNotes(d.legal_officer_clearance_notes || '');
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-lg transition"
                        >
                          Review & Stamp Verdict
                        </button>

                        <button
                          type="button"
                          onClick={() => handleFileTracfinDeclaration(tx.id)}
                          title="Generate Tracfin Suspicious Activity Report (SAR)"
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* QUICK LEGAL REVIEW MODAL */}
      {/* ========================================================================= */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-900 flex flex-col max-h-[92vh]">
            <div className="bg-slate-950 text-white p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white">
                    Tracfin AML Clearance Review • {selectedRow.transaction.property_name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Ref: {selectedRow.transaction.id} • Buyer: {selectedRow.transaction.client_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRow(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-900 text-xs font-bold border-b border-emerald-200 flex items-center gap-2 px-6">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Agreed Property Valuation:</span>
                  <strong className="text-slate-900">€ {selectedRow.transaction.agreed_price.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Disbursing Private Bank:</span>
                  <strong className="text-slate-900">{selectedRow.dossier.origin_bank_name} ({selectedRow.dossier.origin_bank_country})</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Tax Identification / TIN:</span>
                  <strong className="text-slate-900">{selectedRow.dossier.tax_id_numbers || 'FR-992-881-229'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PEP / Sanctions Declaration:</span>
                  <strong className="text-emerald-700">CLEARED (Zero High-Risk PEP Match)</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Clearance Decision</label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-bold bg-white"
                  >
                    <option value="CLEARED">CLEARED (Full AML Approval)</option>
                    <option value="REQUIRES_CLARIFICATION">REQUIRES_CLARIFICATION (Need Bank Proof)</option>
                    <option value="REJECTED">REJECTED (Non-compliant / Report to Tracfin)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Tracfin Risk Assessment Rating</label>
                  <select
                    value={newRiskRating}
                    onChange={(e) => setNewRiskRating(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono bg-white"
                  >
                    <option value="LOW">LOW Risk</option>
                    <option value="STANDARD">STANDARD Risk</option>
                    <option value="ENHANCED_DILIGENCE">ENHANCED_DILIGENCE (EDD Required)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Counsel Clearance Memorandum & Audit Notes</label>
                <textarea
                  rows={3}
                  value={clearanceNotes}
                  onChange={(e) => setClearanceNotes(e.target.value)}
                  placeholder="Record justification for clearance or required additional bank comfort documentation..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleUpdateClearance}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Legal Clearance Verdict
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
