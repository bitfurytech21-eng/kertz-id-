import React, { useState, useEffect } from 'react';
import {
  Users,
  Building,
  FolderLock,
  FileText,
  Scale,
  DollarSign,
  FileCheck,
  CheckSquare,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { api } from '../../services/api';
import {
  PlatformMetrics,
  PropertyRequest,
  Transaction,
  DocumentItem,
  LegalCheck,
  Payment,
  AuditLog,
} from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { safeDownload } from '../../utils/safeDownload';
import { useAuth } from '../../context/AuthContext';
import { DocumentVersionModal } from '../../components/DocumentVersionModal';
import { EmptyState } from '../../components/EmptyState';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import { AdminPropertySearchResponderModal } from '../../components/AdminPropertySearchResponderModal';

// ==========================================
// 1. ADMIN DASHBOARD
// ==========================================
export const AdminDashboard: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.getMetrics()
      .then((res) => setMetrics(res.metrics))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
          Legal & Transaction Management Console
        </h1>
        <p className="text-xs text-slate-500">
          Global platform overview, due diligence clearance queues, and escrow oversight
        </p>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Registered Buyers</span>
            <span className="text-xl font-bold text-slate-900">{metrics.total_clients}</span>
          </div>
          <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Property Requests</span>
            <span className="text-xl font-bold text-slate-900">{metrics.total_requests}</span>
          </div>
          <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Active Transactions</span>
            <span className="text-xl font-bold text-blue-900">{metrics.active_transactions}</span>
          </div>
          <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Pending Legal Checks</span>
            <span className="text-xl font-bold text-amber-700">{metrics.pending_legal_checks}</span>
          </div>
          <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Doc Review Queue</span>
            <span className="text-xl font-bold text-indigo-700">{metrics.unverified_documents}</span>
          </div>
          <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Total Volume (EUR)</span>
            <span className="text-lg font-bold text-emerald-800 font-mono">
              €{(metrics.total_transaction_volume / 1000000).toFixed(1)}M
            </span>
          </div>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <button
          onClick={() => navigate('/admin/property-requests')}
          className="p-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 hover:border-amber-400 rounded-xl shadow-xs text-left transition-all space-y-2 group"
        >
          <div className="w-9 h-9 bg-amber-400 text-slate-950 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-900">
            Property Portfolio Matches
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Match verified listings from kretz.site to client searches.
          </p>
        </button>

        <button
          onClick={() => navigate('/admin/property-requests')}
          className="p-5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs text-left transition-all space-y-2 group"
        >
          <div className="w-9 h-9 bg-blue-50 text-blue-900 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-900">
            Property Requests Queue
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Review incoming acquisition parameters and convert to transactions.
          </p>
        </button>

        <button
          onClick={() => navigate('/admin/documents')}
          className="p-5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs text-left transition-all space-y-2 group"
        >
          <div className="w-9 h-9 bg-indigo-50 text-indigo-900 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-900">
            Document Verification
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Review passports, KYC proofs, and technical diagnostics.
          </p>
        </button>

        <button
          onClick={() => navigate('/admin/legal-review')}
          className="p-5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs text-left transition-all space-y-2 group"
        >
          <div className="w-9 h-9 bg-amber-50 text-amber-900 rounded-lg flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-900">
            Legal Due Diligence Board
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Manage 9-point title checks, encumbrances, and municipal clearances.
          </p>
        </button>

        <button
          onClick={() => navigate('/admin/audit-logs')}
          className="p-5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs text-left transition-all space-y-2 group"
        >
          <div className="w-9 h-9 bg-slate-100 text-slate-900 rounded-lg flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">
            Audit Trail & Logs
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Examine cryptographic tamper-evident activity logs.
          </p>
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 2. ADMIN CLIENTS REGISTRY
// ==========================================
export const AdminClients: React.FC<{ navigate: (path: string) => void; selectedClientId?: string }> = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = () => {
    setLoading(true);
    setError(null);
    api.admin.getClients()
      .then((res) => setClients(res.clients || []))
      .catch((err) => setError(err.message || 'Failed to load clients'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleKycChange = async (clientId: string, kycStatus: any) => {
    try {
      await api.admin.updateKyc(clientId, kycStatus);
      fetchClients();
    } catch (err: any) {
      setError('Error updating KYC: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">Verified Client Registry</h1>
        <p className="text-xs text-slate-500">Manage buyer accounts, verified profiles, and KYC identification status</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Client Name & Email</th>
                <th className="py-3 px-4">Phone & Jurisdiction</th>
                <th className="py-3 px-4">KYC Identity Status</th>
                <th className="py-3 px-4">Requests / Transactions</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Update KYC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.length === 0 ? (
                <EmptyState
                  title="No clients found"
                  description="No client accounts match the current search or filters."
                  icon={Users}
                  variant="table"
                />
              ) : (
                clients.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">
                      {c.profile ? `${c.profile.first_name} ${c.profile.last_name}` : 'Unregistered Profile'}
                    </div>
                    <span className="text-[11px] text-slate-500">{c.email}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <div>{c.profile?.phone_number || 'N/A'}</div>
                    <span className="text-[11px] text-slate-400">{c.profile?.city || ''} {c.profile?.country || ''}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={c.profile?.kyc_status || 'PENDING'} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {c.requests_count} req / {c.transactions_count} tx
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={c.profile?.kyc_status || 'PENDING'}
                      onChange={(e) => handleKycChange(c.id, e.target.value)}
                      className="text-xs px-2 py-1 border border-slate-300 rounded bg-white"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="VERIFIED">VERIFIED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. ADMIN PROPERTY REQUESTS & CONVERSION
// ==========================================
export const AdminPropertyRequests: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertModalRequest, setConvertModalRequest] = useState<PropertyRequest | null>(null);
  const [responderRequest, setResponderRequest] = useState<PropertyRequest | null>(null);
  const [propName, setPropName] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');
  const [isSubmittingConvert, setIsSubmittingConvert] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  const fetchRequests = () => {
    setLoading(true);
    api.propertyRequests.list()
      .then((res) => setRequests(res.requests || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenConvert = (req: PropertyRequest) => {
    setConvertModalRequest(req);
    setConvertError(null);
    setPropName(`${req.property_type} - ${req.preferred_city}`);
    setPropAddress(`${req.preferred_neighborhood || ''} ${req.preferred_city}, ${req.preferred_country}`);
    setAgreedPrice(String(req.budget));
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertModalRequest) return;
    setIsSubmittingConvert(true);
    setConvertError(null);
    try {
      const res = await api.propertyRequests.convertToTransaction(convertModalRequest.id, {
        property_name: propName,
        property_address: propAddress,
        agreed_price: Number(agreedPrice),
      });
      setConvertModalRequest(null);
      navigate(`/transactions/${res.transaction.id}`);
    } catch (err: any) {
      setConvertError(err.message || 'Error creating transaction');
    } finally {
      setIsSubmittingConvert(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">Property Acquisition Requests</h1>
        <p className="text-xs text-slate-500">Review incoming buyer criteria and initialize legal transaction workspaces</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Buyer Principal</th>
                <th className="py-3 px-4">Asset & Location</th>
                <th className="py-3 px-4">Budget</th>
                <th className="py-3 px-4">Structure</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <EmptyState
                  title="No property requests found"
                  description="There are currently no property requests matching the selected filters."
                  icon={Building}
                  variant="table"
                />
              ) : (
                requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                    {r.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{r.client_name}</div>
                    <span className="text-[11px] text-slate-400">{r.client_email}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900">{r.property_type}</div>
                    <span className="text-[11px] text-slate-500">{r.preferred_city}, {r.preferred_country}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                    {r.currency} {r.budget.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {r.purchase_structure} ({r.timeframe})
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <StatusBadge status={r.status} size="sm" />
                      {r.matched_property && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate max-w-[130px] font-mono">
                            {r.matched_property.ref || r.matched_property.id}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setResponderRequest(r)}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded shadow-xs text-xs inline-flex items-center gap-1 transition"
                      title="Search 207 Kretz properties and respond to client"
                    >
                      <Building className="w-3.5 h-3.5" />
                      <span>{r.matched_property ? 'Update Match' : 'Respond with Property'}</span>
                    </button>

                    <button
                      onClick={() => navigate(`/property-request/${r.id}`)}
                      className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded text-slate-700 font-medium text-xs"
                    >
                      View
                    </button>
                    {r.status !== 'TRANSACTION_STARTED' && r.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleOpenConvert(r)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded shadow-xs text-xs"
                      >
                        Start Tx
                      </button>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Search Responder Modal (207 Kretz listings from kretz.site) */}
      <AdminPropertySearchResponderModal
        isOpen={!!responderRequest}
        onClose={() => setResponderRequest(null)}
        request={responderRequest}
        onResponseSent={fetchRequests}
      />

      {/* Convert to Transaction Modal */}
      {convertModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              Initialize Transaction Workspace for {convertModalRequest.id}
            </h3>

            <form onSubmit={handleConvert} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Property Name / Designation</label>
                <input
                  type="text"
                  required
                  value={propName}
                  onChange={(e) => setPropName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Property Address</label>
                <input
                  type="text"
                  required
                  value={propAddress}
                  onChange={(e) => setPropAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agreed Valuation / Price ({convertModalRequest.currency})</label>
                <input
                  type="number"
                  required
                  value={agreedPrice}
                  onChange={(e) => setAgreedPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setConvertModalRequest(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingConvert}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-semibold"
                >
                  Create & Launch Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. ADMIN CENTRAL DOCUMENT REVIEW
// ==========================================
export const AdminDocuments: React.FC<{ navigate: (path: string) => void }> = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [versionDoc, setVersionDoc] = useState<DocumentItem | null>(null);
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [reviewComment, setReviewComment] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchDocs = async () => {
    // For admin, we fetch transactions and their documents
    const txs = await api.transactions.list();
    const docPromises = (txs.transactions || []).map((t) => api.documents.list(t.id));
    const docResults = await Promise.all(docPromises);
    const allDocs = docResults.flatMap((r) => r.documents || []);
    setDocuments(allDocs);
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    setIsReviewing(true);
    setReviewError(null);
    try {
      await api.documents.review(selectedDoc.id, {
        status: reviewStatus,
        review_comment: reviewComment,
      });
      setSelectedDoc(null);
      await fetchDocs();
    } catch (err: any) {
      setReviewError(err.message || 'Error reviewing document');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleDownload = async (docId: string) => {
    try {
      const res = await api.documents.getSignedUrl(docId);
      safeDownload(res.download_url);
    } catch (err: any) {
      console.error('Download error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">Document Verification Queue</h1>
        <p className="text-xs text-slate-500">Legal verification of encrypted passports, deeds, surveys, and escrow proofs</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reviewer & Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.length === 0 ? (
                <EmptyState
                  title="No documents found"
                  description="No documents match the current search or filters."
                  icon={FileText}
                  variant="table"
                />
              ) : (
                documents.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      {d.document_name}
                    </div>
                    <span className="text-[11px] text-slate-400">{d.file_name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {d.document_type.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                    {d.transaction_id}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={d.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 max-w-xs text-slate-600">
                    {d.reviewer_name ? `${d.reviewer_name}: "${d.review_comment || ''}"` : 'Pending review'}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => setVersionDoc(d)}
                      className="px-2.5 py-1 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-900 font-semibold rounded text-[11px]"
                      title="View all versions and approval trail"
                    >
                      Versions (v{d.current_version})
                    </button>
                    <button
                      onClick={() => handleDownload(d.id)}
                      className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded text-slate-700 font-medium text-[11px]"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDoc(d);
                        setReviewStatus(d.status === 'UPLOADED' ? 'APPROVED' : d.status);
                        setReviewComment(d.review_comment || '');
                      }}
                      className="px-3 py-1 bg-slate-900 text-white rounded font-semibold text-[11px]"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              Review Document: {selectedDoc.document_name}
            </h3>

            <form onSubmit={handleReview} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Review Decision</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-white"
                >
                  <option value="APPROVED">APPROVED</option>
                  <option value="REQUIRES_CORRECTION">REQUIRES_CORRECTION</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Feedback Comment for Buyer</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="e.g. Document verified and compliant with French notarial standards."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReviewing}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-semibold"
                >
                  Save Review Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      <DocumentVersionModal
        isOpen={!!versionDoc}
        onClose={() => setVersionDoc(null)}
        documentItem={versionDoc}
        onVersionUploaded={fetchDocs}
      />
    </div>
  );
};

// ==========================================
// 5. ADMIN AUDIT LOGS
// ==========================================
export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = (action?: string) => {
    setLoading(true);
    api.admin.getAuditLogs({ action })
      .then((res) => setLogs(res.logs || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">Immutable Audit Trail Logs</h1>
          <p className="text-xs text-slate-500">Tamper-evident record of all platform authentication, document views, reviews & signatures</p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action or user..."
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Transaction / Resource</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Client IP</th>
                <th className="py-3 px-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <EmptyState
                  title="No audit activity found"
                  description="No audit events match the current filters."
                  icon={ShieldAlert}
                  variant="table"
                />
              ) : (
                filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className="font-semibold text-slate-900 block">{log.user_email || 'Anonymous'}</span>
                    <span className="text-[10px] text-slate-400">{log.user_role || 'STAFF'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-900">
                    {log.transaction_id || log.resource_id || '-'}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-700 max-w-sm">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {log.ip_address}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.result === 'SUCCESS' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                      {log.result}
                    </span>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
