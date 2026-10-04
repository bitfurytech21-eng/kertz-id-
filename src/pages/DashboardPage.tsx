import React, { useState, useEffect } from 'react';
import {
  FileText,
  Shield,
  Clock,
  ArrowRight,
  PlusCircle,
  FolderLock,
  CheckCircle2,
  AlertTriangle,
  Building,
  Bell,
  Scale,
  CheckSquare,
  DollarSign,
  Download,
  MapPin,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PropertyRequest, Transaction, DocumentItem, Notification, KretzProperty } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressBar } from '../components/ProgressBar';
import { EmptyState } from '../components/EmptyState';
import { safeDownload } from '../utils/safeDownload';
import { KretzPropertySelectorModal } from '../components/KretzPropertySelectorModal';

interface DashboardPageProps {
  navigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const clientName = user?.profile
    ? `${user.profile.first_name} ${user.profile.last_name}`
    : user?.email || 'Client';

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [reqData, txData, notifData] = await Promise.all([
        api.propertyRequests.list(),
        api.transactions.list(),
        api.notifications.list(),
      ]);

      setRequests(reqData.requests || []);
      setTransactions(txData.transactions || []);
      setNotifications(notifData.notifications || []);

      // If transactions exist, fetch documents for first transaction
      if (txData.transactions && txData.transactions.length > 0) {
        const docData = await api.documents.list(txData.transactions[0].id);
        setDocuments(docData.documents || []);
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const latestRequest = requests[0];
  const activeTx = transactions[0];

  // Calculate pending tasks for client
  const tasks = [];
  if (latestRequest && latestRequest.status === 'DRAFT') {
    tasks.push({
      id: 'task_req_draft',
      title: 'Complete Property Requirement Submission',
      desc: 'Finalize and submit your acquisition criteria to the legal team.',
      link: `/property-request/${latestRequest.id}`,
      badge: 'Action Required',
      priority: 'high',
    });
  } else if (!latestRequest) {
    tasks.push({
      id: 'task_new_req',
      title: 'Submit Property Acquisition Criteria',
      desc: 'Tell the legal team what type of property and jurisdiction you want to acquire.',
      link: '/property-request',
      badge: 'Step 1',
      priority: 'high',
    });
  }

  if (activeTx) {
    if (activeTx.current_step === 2 && documents.length === 0) {
      tasks.push({
        id: 'task_docs',
        title: 'Upload KYC Identification Documents',
        desc: 'Upload your passport and proof of address for legal due diligence clearance.',
        link: `/transactions/${activeTx.id}/documents`,
        badge: 'Legal Due Diligence',
        priority: 'high',
      });
    }
    if (activeTx.status === 'CONTRACT_SIGNING' || activeTx.current_step === 4) {
      tasks.push({
        id: 'task_sign',
        title: 'Review and Electronically Sign Contract',
        desc: 'The bilateral property acquisition agreement is ready for your cryptographic signature.',
        link: `/transactions/${activeTx.id}/contract`,
        badge: 'E-Signature Required',
        priority: 'urgent',
      });
    }
    if (activeTx.status === 'PAYMENTS_ESCROW' || activeTx.current_step === 5) {
      tasks.push({
        id: 'task_pay',
        title: 'Complete Escrow Deposit Settlement',
        desc: 'Wire the initial 10% deposit to the verified notary escrow holding account.',
        link: `/transactions/${activeTx.id}/payments`,
        badge: 'Escrow Settlement',
        priority: 'high',
      });
    }
  }

  const handleDownloadDoc = async (docId: string) => {
    try {
      const res = await api.documents.getSignedUrl(docId);
      safeDownload(res.download_url);
    } catch (err: any) {
      console.error('Failed to get download URL:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Private Buyer Workspace
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-500 font-mono">
              Account ID: {user?.id}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome, {clientName}
          </h1>
          <p className="text-xs text-slate-500">
            Your legal property acquisition matters and private vaults are active and protected.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowPortfolioModal(true)}
            className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-md shadow-xs transition-colors flex items-center gap-1.5"
            title="Browse all 207 luxury properties directly from kretz.site"
          >
            <Building className="w-4 h-4 text-slate-950" />
            <span>Explore 207 Kretz Properties</span>
          </button>

          <button
            onClick={() => navigate('/property-request')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            {latestRequest ? 'New Property Request' : 'Submit Property Request'}
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Property Request & Transactions */}
        <div className="lg:col-span-2 space-y-8">
          {/* SECTION 1: MY PROPERTY REQUEST */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-50 text-blue-900 rounded-md">
                  <Building className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  My Property Request
                </h2>
              </div>
              {latestRequest && (
                <StatusBadge status={latestRequest.status} size="sm" />
              )}
            </div>

            <div className="p-6">
              {latestRequest ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-slate-500">Reference:</span>
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {latestRequest.id}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/property-request/${latestRequest.id}`)}
                      className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
                    >
                      View Full Details <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Property Type</span>
                      <span className="font-semibold text-slate-900">{latestRequest.property_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Preferred Location</span>
                      <span className="font-semibold text-slate-900">
                        {latestRequest.preferred_city}, {latestRequest.preferred_country}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Budget</span>
                      <span className="font-semibold text-slate-900 font-mono">
                        {latestRequest.currency} {latestRequest.budget.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Purpose / Use</span>
                      <span className="font-semibold text-slate-900">{latestRequest.intended_use}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Preferred Size</span>
                      <span className="font-semibold text-slate-900">
                        {latestRequest.min_size_sqm || 'Any'} - {latestRequest.max_size_sqm || 'N/A'} m²
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Structure & Timeframe</span>
                      <span className="font-semibold text-slate-900">
                        {latestRequest.purchase_structure} ({latestRequest.timeframe})
                      </span>
                    </div>
                  </div>

                  {/* ADMIN PROPERTY RESPONSE & MATCH CARD */}
                  {latestRequest.matched_property && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                          <Building className="w-3.5 h-3.5 text-amber-500" />
                          <span>Legal Team Property Match & Acquisition Proposal</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                          Official Match from kretz.site
                        </span>
                      </div>

                      <div className="bg-slate-950 text-white rounded-xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                          <div className="flex gap-3.5 items-center">
                            <img
                              src={latestRequest.matched_property.images?.hero}
                              alt={latestRequest.matched_property.name}
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border border-slate-700 shrink-0"
                            />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                                  {latestRequest.matched_property.ref || latestRequest.matched_property.id}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  {latestRequest.matched_property.property_type}
                                </span>
                              </div>
                              <h3 className="font-bold text-sm sm:text-base text-white">
                                {latestRequest.matched_property.name}
                              </h3>
                              <div className="text-xs text-slate-400 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{latestRequest.matched_property.city}, {latestRequest.matched_property.state_region}</span>
                                <span>•</span>
                                <span>{latestRequest.matched_property.living_area_sqm} m²</span>
                                <span>•</span>
                                <span>{latestRequest.matched_property.bedrooms} beds</span>
                              </div>
                            </div>
                          </div>

                          <div className="sm:text-right space-y-2 w-full sm:w-auto">
                            <div className="font-mono text-xl font-bold text-amber-400">
                              €{latestRequest.matched_property.asking_price.toLocaleString()}
                            </div>
                            <div className="flex sm:justify-end gap-2">
                              {latestRequest.matched_property.annonce_url && (
                                <a
                                  href={latestRequest.matched_property.annonce_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                                >
                                  <span>kretz.site</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => navigate(`/property-request/${latestRequest.id}`)}
                                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
                              >
                                <span>Review Acquisition File</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Admin Counsel Notes */}
                        {latestRequest.admin_notes && (
                          <div className="p-3.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px] uppercase tracking-wider font-mono">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Legal Counsel & Agent Recommendation:</span>
                            </div>
                            <p className="whitespace-pre-line leading-relaxed text-slate-200">
                              {latestRequest.admin_notes}
                            </p>
                          </div>
                        )}

                        {/* Agent Info */}
                        {latestRequest.matched_property.agent && (
                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                              <img
                                src={latestRequest.matched_property.agent.photo}
                                alt={latestRequest.matched_property.agent.name}
                                className="w-6 h-6 rounded-full object-cover border border-slate-700"
                              />
                              <span className="text-white font-medium">
                                Lead Agent: {latestRequest.matched_property.agent.name}
                              </span>
                            </div>
                            <span className="font-mono text-slate-400">
                              {latestRequest.matched_property.agent.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No property request yet"
                  description="Tell us what type of property you are looking to acquire and your preferred requirements."
                  actionLabel="Create Property Request"
                  onAction={() => navigate('/property-request')}
                  icon={Building}
                  variant="compact"
                />
              )}
            </div>
          </div>

          {/* SECTION 2: MY TRANSACTIONS */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-50 text-emerald-900 rounded-md">
                  <FolderLock className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  My Active Legal Transactions
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {transactions.length} Active Transaction{transactions.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="p-6">
              {transactions.length === 0 ? (
                <EmptyState
                  title="No active transactions"
                  description="Your legal property transactions will appear here once a transaction has been opened."
                  icon={FolderLock}
                  variant="compact"
                />
              ) : (
                <div className="space-y-6">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all bg-slate-50/40 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {tx.id}
                            </span>
                            <StatusBadge status={tx.status} size="sm" />
                          </div>
                          <h3 className="font-serif text-lg font-bold text-slate-900 mt-1">
                            {tx.property_name}
                          </h3>
                          <p className="text-xs text-slate-500">{tx.property_address}</p>
                        </div>

                        <button
                          onClick={() => navigate(`/transactions/${tx.id}`)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center gap-2 self-start sm:self-center"
                        >
                          Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 8-Stage Progress Bar for this transaction */}
                      <ProgressBar currentStep={tx.current_step} />

                      {/* Key details strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Agreed Price</span>
                          <span className="font-bold text-slate-900 font-mono">
                            {tx.currency} {tx.agreed_price.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Assigned Legal Officer</span>
                          <span className="font-medium text-slate-900">{tx.legal_officer_name || 'Counsel'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Transaction Manager</span>
                          <span className="font-medium text-slate-900">{tx.transaction_officer_name || 'Manager'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Cadastral Reference</span>
                          <span className="font-mono text-slate-700">{tx.cadastral_id || 'Pending'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: RECENT DOCUMENTS */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-50 text-indigo-900 rounded-md">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Recent Legal Documents
                </h2>
              </div>
              {activeTx && (
                <button
                  onClick={() => navigate(`/transactions/${activeTx.id}/documents`)}
                  className="text-xs text-blue-700 hover:text-blue-900 font-semibold"
                >
                  View All Documents
                </button>
              )}
            </div>

            <div className="p-6">
              {documents.length === 0 ? (
                <EmptyState
                  title="No documents uploaded"
                  description="Documents requested for your transaction will appear here."
                  icon={FileText}
                  variant="compact"
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {documents.slice(0, 4).map((doc) => (
                    <div key={doc.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          {doc.document_name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{doc.document_type.replace(/_/g, ' ')}</span>
                          <span>•</span>
                          <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span className="font-mono text-[10px]">SHA256: {doc.sha256_hash.substring(0, 10)}...</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <StatusBadge status={doc.status} size="sm" />
                        <button
                          onClick={() => handleDownloadDoc(doc.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          title="Secure Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Tasks & Notifications - Sticky/Static while left content scrolls */}
        <div className="space-y-8 lg:sticky lg:top-24 self-start">
          {/* SECTION 4: REQUIRED TASKS */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Required Action Tasks
                </h3>
              </div>
              <span className="text-[11px] font-mono bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                {tasks.length} Action{tasks.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="p-6">
              {tasks.length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All buyer actions are currently up to date. Legal team is handling review.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => navigate(task.link)}
                      className="p-4 border border-amber-200 bg-amber-50/40 hover:bg-amber-50 rounded-lg cursor-pointer transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          {task.badge}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-800" />
                      </div>
                      <div className="font-bold text-slate-900 text-xs">{task.title}</div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{task.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: LEGAL TEAM NOTIFICATIONS */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Legal Team Notifications
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Live Feed
              </span>
            </div>

            <div className="p-6">
              {notifications.length === 0 ? (
                <EmptyState
                  title="No notifications"
                  description="You are up to date. New transaction updates will appear here."
                  icon={Bell}
                  variant="compact"
                />
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => n.link_url && navigate(n.link_url)}
                      className={`p-3.5 rounded-lg border text-xs space-y-1 transition-colors ${
                        n.link_url ? 'cursor-pointer hover:border-blue-300' : ''
                      } ${!n.is_read ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <div className="font-semibold text-slate-900 flex items-center justify-between">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Explore 207 Kretz Properties Portfolio Modal */}
      <KretzPropertySelectorModal
        isOpen={showPortfolioModal}
        onClose={() => setShowPortfolioModal(false)}
        onSelectProperty={(p) => {
          setShowPortfolioModal(false);
          navigate(`/property-request?property_id=${p.id}`);
        }}
      />
    </div>
  );
};
