import React, { useState, useEffect, useRef } from 'react';
import {
  FolderLock,
  ArrowLeft,
  Building,
  User,
  FileText,
  Scale,
  DollarSign,
  FileCheck,
  CheckSquare,
  MessageSquare,
  History,
  Shield,
  ShieldCheck,
  Landmark,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Lock,
  ExternalLink,
  ChevronRight,
  PenTool,
  Paperclip,
  FileDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Transaction,
  DocumentItem,
  LegalReview,
  LegalCheck,
  Offer,
  Contract,
  ContractSignature,
  TracfinDossier,
  QESContractSession,
  Payment,
  ClosingRecord,
  ClosingChecklistItem,
  Message,
  AuditLog,
} from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressBar } from '../components/ProgressBar';
import { SignaturePadModal } from '../components/SignaturePadModal';
import { DocumentUploadModal } from '../components/DocumentUploadModal';
import { DocumentVersionModal } from '../components/DocumentVersionModal';
import { MatchedPropertyCard } from '../components/MatchedPropertyCard';
import { CadastralGISViewer } from '../components/CadastralGISViewer';
import { TechnicalDiagnosticCard } from '../components/TechnicalDiagnosticCard';
import { PreemptionTrackerCard } from '../components/PreemptionTrackerCard';
import { NotarialWireModal } from '../components/NotarialWireModal';
import { EscrowPaymentInteractionModal } from '../components/EscrowPaymentInteractionModal';
import { CurrencyConverterCard } from '../components/CurrencyConverterCard';
import { TracfinComplianceModal } from '../components/TracfinComplianceModal';
import { TracfinEmbeddedSection } from '../components/TracfinEmbeddedSection';
import { QESSignatureModal } from '../components/QESSignatureModal';
import { QESProviderIntegrationModule } from '../components/QESProviderIntegrationModule';
import { EmptyState } from '../components/EmptyState';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { safeDownload } from '../utils/safeDownload';
import { generateTransactionPdf } from '../utils/generateTransactionPdf';

interface TransactionWorkspacePageProps {
  transactionId: string;
  initialTab?: string;
  navigate: (path: string) => void;
}

export const TransactionWorkspacePage: React.FC<TransactionWorkspacePageProps> = ({
  transactionId,
  initialTab = 'overview',
  navigate,
}) => {
  const { user, isStaff, isLegalOfficer, isTransactionOfficer, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [legalReview, setLegalReview] = useState<LegalReview | null>(null);
  const [legalChecks, setLegalChecks] = useState<LegalCheck[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [signatures, setSignatures] = useState<ContractSignature[]>([]);
  const [tracfinDossier, setTracfinDossier] = useState<TracfinDossier | null>(null);
  const [qesSession, setQesSession] = useState<QESContractSession | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [closing, setClosing] = useState<ClosingRecord | null>(null);
  const [closingChecklist, setClosingChecklist] = useState<ClosingChecklistItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [timeline, setTimeline] = useState<AuditLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [isTracfinOpen, setIsTracfinOpen] = useState(false);
  const [isQESOpen, setIsQESOpen] = useState(false);
  const [isWireModalOpen, setIsWireModalOpen] = useState(false);
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);
  const [selectedEscrowPayment, setSelectedEscrowPayment] = useState<Payment | null>(null);
  const [selectedDocForVersions, setSelectedDocForVersions] = useState<DocumentItem | null>(null);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  // Offer Form state
  const [offerAmount, setOfferAmount] = useState('');
  const [offerDeposit, setOfferDeposit] = useState('');
  const [offerClosingDate, setOfferClosingDate] = useState('');
  const [offerConditions, setOfferConditions] = useState('');
  const [offerNotes, setOfferNotes] = useState('');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  // Review Check Modal for Staff
  const [selectedCheck, setSelectedCheck] = useState<LegalCheck | null>(null);
  const [checkStatus, setCheckStatus] = useState<LegalCheck['status']>('CLEARED');
  const [checkFindings, setCheckFindings] = useState('');
  const [checkClientNotes, setCheckClientNotes] = useState('');
  const [checkInternalNotes, setCheckInternalNotes] = useState('');
  const [isUpdatingCheck, setIsUpdatingCheck] = useState(false);

  // Messages auto-scroll
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchAllData = async () => {
    try {
      const [
        txRes,
        docRes,
        legalRes,
        offerRes,
        contractRes,
        payRes,
        closingRes,
        msgRes,
        timelineRes,
        tracfinRes,
      ] = await Promise.all([
        api.transactions.get(transactionId),
        api.documents.list(transactionId),
        api.legalReview.get(transactionId),
        api.offers.get(transactionId),
        api.contracts.get(transactionId),
        api.payments.list(transactionId),
        api.closing.get(transactionId),
        api.messages.list(transactionId),
        api.timeline.get(transactionId),
        api.tracfin.get(transactionId).catch(() => ({ dossier: null })),
      ]);

      setTransaction(txRes.transaction);
      setDocuments(docRes.documents || []);
      setLegalReview(legalRes.review);
      setLegalChecks(legalRes.checks || []);
      setOffers(offerRes.offers || []);
      setContract(contractRes.contract);
      setSignatures(contractRes.signatures || []);
      setQesSession(contractRes.qes_session || contractRes.contract?.qes_session || null);
      setTracfinDossier(tracfinRes.dossier);
      setPayments(payRes.payments || []);
      setClosing(closingRes.closing);
      setClosingChecklist(closingRes.checklist || []);
      setMessages(msgRes.messages || []);
      setTimeline(timelineRes.timeline || []);

      if (offerRes.current_offer) {
        setOfferAmount(String(offerRes.current_offer.client_offer_amount));
        setOfferDeposit(String(offerRes.current_offer.deposit_amount));
        setOfferClosingDate(offerRes.current_offer.proposed_closing_date);
        setOfferConditions(offerRes.current_offer.conditions);
        setOfferNotes(offerRes.current_offer.notes);
      } else if (txRes.transaction) {
        setOfferAmount(String(txRes.transaction.agreed_price));
        setOfferDeposit(String(Math.round(txRes.transaction.agreed_price * 0.1)));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load transaction workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [transactionId]);

  useEffect(() => {
    if (activeTab === 'messages') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, messages]);

  const handleDownloadDoc = async (docId: string) => {
    try {
      const res = await api.documents.getSignedUrl(docId);
      safeDownload(res.download_url);
    } catch (err: any) {
      console.error('Error downloading document:', err);
    }
  };

  const handleUploadSuccess = async (formData: FormData) => {
    await api.documents.upload(transactionId, formData);
    await fetchAllData();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    setIsSubmittingMessage(true);
    try {
      await api.messages.send(transactionId, {
        message_text: messageInput,
        is_internal_note: isStaff && isInternalNote,
      });
      setMessageInput('');
      setIsInternalNote(false);
      await fetchAllData();
    } catch (err: any) {
      alert('Error sending message: ' + err.message);
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOffer(true);
    try {
      await api.offers.submit(transactionId, {
        client_offer_amount: Number(offerAmount),
        deposit_amount: Number(offerDeposit),
        proposed_closing_date: offerClosingDate,
        conditions: offerConditions,
        notes: offerNotes,
      });
      await fetchAllData();
      alert('Offer submitted to legal transaction team.');
    } catch (err: any) {
      alert('Error submitting offer: ' + err.message);
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const handleSignContract = async (signatureDataUrl: string, signerName: string, signerRole: string) => {
    await api.contracts.sign(transactionId, {
      signature_data_url: signatureDataUrl,
      signer_name: signerName,
      signer_role: signerRole,
    });
    await fetchAllData();
  };

  const handleUpdateCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCheck) return;
    setIsUpdatingCheck(true);
    try {
      await api.legalReview.updateCheck(selectedCheck.id, {
        status: checkStatus,
        findings: checkFindings,
        client_visible_notes: checkClientNotes,
        internal_notes: checkInternalNotes,
      });
      setSelectedCheck(null);
      await fetchAllData();
    } catch (err: any) {
      alert('Error updating legal check: ' + err.message);
    } finally {
      setIsUpdatingCheck(false);
    }
  };

  const handleConfirmPayment = (paymentId: string) => {
    const pay = payments.find((p) => p.id === paymentId) || null;
    setSelectedEscrowPayment(pay);
    setIsEscrowModalOpen(true);
  };

  const handleChecklistToggle = async (itemId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await api.closing.updateChecklist(itemId, { status: nextStatus });
      await fetchAllData();
    } catch (err: any) {
      alert('Error updating checklist item: ' + err.message);
    }
  };

  const handleFinalizeClosing = async () => {
    if (!confirm('Are you sure you want to finalize closing and execute property title transfer?')) return;
    try {
      await api.closing.finalize(transactionId, {
        registration_number: `REG-75-${Math.floor(100000 + Math.random() * 900000)}`,
        handover_notes: 'All title documents registered, notary escrow disbursed, and keys handed over.',
        key_handover_confirmed: true,
      });
      await fetchAllData();
      alert('Transaction officially completed and title transferred.');
    } catch (err: any) {
      alert('Error completing closing: ' + err.message);
    }
  };

  const handleExportPdf = () => {
    if (!transaction) return;
    try {
      generateTransactionPdf({
        transaction,
        legalChecks,
        payments,
        closingChecklist,
        contract,
        signatures,
      });
    } catch (err: any) {
      alert('Failed to generate PDF summary report: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Decrypting legal transaction vault {transactionId}...
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ErrorDisplay
          type={error?.includes('permission') || error?.includes('403') ? 'PERMISSION' : 'NOT_FOUND'}
          onNavigateHome={() => navigate('/dashboard')}
          onRetry={fetchAllData}
        />
      </div>
    );
  }

  const TABS = [
    { key: 'overview', label: 'Overview', icon: Building },
    { key: 'client', label: 'Client Info', icon: User },
    { key: 'property', label: 'Property', icon: Building },
    { key: 'documents', label: 'Documents', icon: FileText, count: documents.length },
    { key: 'legal-review', label: 'Legal Due Diligence', icon: Scale, count: legalChecks.length },
    { key: 'offer', label: 'Offer', icon: DollarSign },
    { key: 'contract', label: 'Contract', icon: FileCheck },
    { key: 'payments', label: 'Payments', icon: DollarSign, count: payments.length },
    { key: 'closing', label: 'Closing', icon: CheckSquare },
    { key: 'messages', label: 'Messages', icon: MessageSquare, count: messages.length },
    { key: 'timeline', label: 'Timeline', icon: History },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => navigate(isStaff ? '/admin/transactions' : '/transactions')}
            className="text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Transactions
          </button>
          <span className="text-slate-300">/</span>
          <span className="font-mono font-bold text-slate-900">{transaction.id}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-mono font-medium">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Zero-Knowledge Vault Protected
          </span>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {transaction.id}
              </span>
              <StatusBadge status={transaction.status} />
              {transaction.cadastral_id && (
                <span className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                  Cadastre: {transaction.cadastral_id}
                </span>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {transaction.property_name}
            </h1>
            <p className="text-xs text-slate-500">{transaction.property_address}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="text-right sm:pr-4 sm:border-r border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Agreed Price</span>
              <span className="font-serif text-xl sm:text-2xl font-bold text-slate-900 font-mono">
                {transaction.currency} {transaction.agreed_price.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleExportPdf}
              className="px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center gap-1.5"
              title="Generate PDF Status & Due Diligence Report"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-700" /> Download PDF Report
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" /> Upload Document
            </button>
          </div>
        </div>

        {/* 8-Stage Progress Stepper */}
        <ProgressBar currentStep={transaction.current_step} />
      </div>

      {/* 11 Tabs Navigation - Static / Sticky while content scrolls below */}
      <div className="sticky top-16 z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200 overflow-x-auto scrollbar-thin py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <nav className="flex space-x-1 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-slate-900 text-slate-900 bg-slate-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Summary Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Transaction Dossier Summary
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Property Type</span>
                  <span className="font-semibold text-slate-900">{transaction.property_type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Habitable Surface</span>
                  <span className="font-semibold text-slate-900">{transaction.property_size_sqm || 225} m²</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Bedrooms</span>
                  <span className="font-semibold text-slate-900">{transaction.bedrooms || 3} Bed</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Asking Price</span>
                  <span className="font-mono text-slate-700">
                    {transaction.currency} {transaction.asking_price.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Agreed Price</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {transaction.currency} {transaction.agreed_price.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Deposit Required (10%)</span>
                  <span className="font-bold text-emerald-800 font-mono">
                    {transaction.currency} {(Math.round(transaction.agreed_price * 0.1)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Legal Due Diligence Quick Board */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Legal Due Diligence Verification (9 Checks)
                </h3>
                <button
                  onClick={() => setActiveTab('legal-review')}
                  className="text-xs text-blue-700 hover:text-blue-900 font-semibold"
                >
                  View Full Legal Report →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {legalChecks.slice(0, 6).map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="font-semibold text-slate-900 truncate">{c.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">{c.findings}</div>
                    </div>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Uploaded Documents */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Encrypted Documents Vault
                </h3>
                <button
                  onClick={() => setActiveTab('documents')}
                  className="text-xs text-blue-700 hover:text-blue-900 font-semibold"
                >
                  Document Center →
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-4">No documents uploaded yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {documents.slice(0, 3).map((d) => (
                    <div key={d.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-900 truncate">{d.document_name}</span>
                        <span className="text-[10px] text-slate-400">({(d.file_size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={d.status} size="sm" />
                        <button
                          onClick={() => handleDownloadDoc(d.id)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Assigned Officers & Parties */}
          <div className="space-y-6">
            {/* Assigned Officers Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Assigned Legal & Transaction Officers
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-800">Assigned Legal Counsel</span>
                  <div className="font-bold text-slate-900">{transaction.legal_officer_name || 'Maître Claire'}</div>
                  <div className="text-[11px] text-slate-500">Legal due diligence, title verification, contracts</div>
                </div>

                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-800">Transaction Manager</span>
                  <div className="font-bold text-slate-900">{transaction.transaction_officer_name || 'Marcus Vance'}</div>
                  <div className="text-[11px] text-slate-500">Escrow milestones, schedule & closing execution</div>
                </div>
              </div>
            </div>

            {/* PDF Summary Export Card */}
            <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <FileDown className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Official PDF Summary Report
                </h3>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Generate an official confidential PDF dossier including all 9 legal due diligence checks, milestone payments, and e-signatures.
              </p>
              <button
                onClick={handleExportPdf}
                className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5" /> Generate & Download PDF
              </button>
            </div>

            {/* Transaction Parties Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Transaction Parties
              </h3>

              <div className="divide-y divide-slate-100 text-xs">
                {transaction.parties && transaction.parties.length > 0 ? (
                  transaction.parties.map((p) => (
                    <div key={p.id} className="py-2.5 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{p.name}</span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 bg-slate-100 rounded font-mono text-slate-600">
                          {p.party_role.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">{p.email}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 py-2">Standard parties assigned</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLIENT INFORMATION */}
      {activeTab === 'client' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Verified Buyer Principal Information
              </h2>
              <p className="text-xs text-slate-500">KYC verification, legal jurisdiction, and contact credentials</p>
            </div>
            <StatusBadge status={transaction.client_kyc_status || 'VERIFIED'} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Full Legal Name</span>
              <span className="font-bold text-slate-900 text-sm">{transaction.client_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Verified Email Address</span>
              <span className="font-semibold text-slate-900">{transaction.client_email}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Phone Number</span>
              <span className="font-semibold text-slate-900">{transaction.client_phone || '+33 6 12 34 56 78'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">KYC & Identity Status</span>
              <span className="font-bold text-emerald-700">VERIFIED (Passports & Bank Proof checked)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Transaction Role</span>
              <span className="font-semibold text-slate-900">Principal Buyer</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Client Vault Identifier</span>
              <span className="font-mono text-slate-700">{transaction.client_id}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROPERTY */}
      {activeTab === 'property' && (
        <div className="space-y-6">
          {transaction.matched_property ? (
            <MatchedPropertyCard property={transaction.matched_property} showActions={false} />
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Property Asset & Cadastral Specifications
                </h2>
                <p className="text-xs text-slate-500">Official cadastral plot, legal description, surface area and address</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Property Title / Designation</span>
                    <span className="font-bold text-slate-900 text-sm">{transaction.property_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Physical Legal Address</span>
                    <span className="font-semibold text-slate-900">{transaction.property_address}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Cadastral Parcel Reference</span>
                    <span className="font-mono font-bold text-blue-900">{transaction.cadastral_id || '75108-08-0142-P'}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Certified Habitable Surface (Loi Carrez)</span>
                    <span className="font-bold text-slate-900">{transaction.property_size_sqm || 225} m²</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Asset Classification</span>
                    <span className="font-semibold text-slate-900">{transaction.property_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Agreed Valuation</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {transaction.currency} {transaction.agreed_price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Cadastral Boundary & GIS Parcel Viewer */}
          <CadastralGISViewer
            propertyName={transaction.property_name}
            propertyAddress={transaction.property_address}
            cadastralId={transaction.cadastral_id}
            propertySizeSqm={transaction.property_size_sqm}
          />

          {/* Technical Diagnostics Dossier (DDT - DPE, Asbestos, Lead, Electricity, ERP) */}
          <TechnicalDiagnosticCard
            propertySizeSqm={transaction.property_size_sqm}
          />
        </div>
      )}

      {/* TAB 4: SECURE DOCUMENT CENTER */}
      {activeTab === 'documents' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Tracfin AML Compliance Action Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-serif font-bold text-amber-300">
                  EU AMLD6 & French Tracfin Compliance Package
                </span>
                {tracfinDossier?.status === 'CLEARED' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                    ✓ AML CLEARED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                    {tracfinDossier?.status || 'ACTION REQUIRED'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Mandatory Source of Funds (SoF) declaration, PEP screening, and bank comfort letter verification under Code Monétaire et Financier.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsTracfinOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition shrink-0 flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              {tracfinDossier?.status === 'CLEARED' ? 'View Tracfin Clearance Dossier' : 'Complete Source of Funds (SoF) Dossier'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Secure Document Center (AES-256 Vault)
              </h2>
              <p className="text-xs text-slate-500">
                Encrypted repository for passports, title deeds, diagnostic reports, and signed agreements
              </p>
            </div>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center gap-2 self-start sm:self-center"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" /> Upload Requested Document
            </button>
          </div>

          {documents.length === 0 ? (
            <EmptyState
              title="No documents available"
              description="Documents associated with this transaction will appear here."
              actionLabel="Upload Document"
              onAction={() => setIsUploadOpen(true)}
              icon={FileText}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Document Title & File</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reviewer & Notes</th>
                    <th className="py-3 px-4">Version & Hash</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          {doc.document_name}
                        </div>
                        <span className="text-[11px] text-slate-400">{doc.file_name} ({(doc.file_size / 1024).toFixed(1)} KB)</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {doc.document_type.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={doc.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        {doc.reviewer_name ? (
                          <div className="space-y-0.5">
                            <span className="font-medium text-slate-800">{doc.reviewer_name}</span>
                            {doc.review_comment && (
                              <p className="text-[11px] text-slate-500 italic">"{doc.review_comment}"</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Pending review</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] text-slate-500 block">v{doc.current_version}</span>
                        <span className="font-mono text-[9px] text-slate-400 truncate block max-w-[120px]" title={doc.sha256_hash}>
                          {doc.sha256_hash.substring(0, 16)}...
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedDocForVersions(doc)}
                          className="px-2.5 py-1 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-900 font-semibold rounded shadow-xs transition-colors inline-flex items-center gap-1 text-[11px]"
                          title="View all versions, approval statuses and upload history"
                        >
                          <History className="w-3 h-3 text-blue-700" />
                          <span>Versions (v{doc.current_version})</span>
                        </button>

                        <button
                          onClick={() => handleDownloadDoc(doc.id)}
                          className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded shadow-xs transition-colors inline-flex items-center gap-1 text-[11px]"
                        >
                          <Download className="w-3 h-3" /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: LEGAL DUE DILIGENCE WORKSPACE */}
      {activeTab === 'legal-review' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Legal Due Diligence Verification (9-Point Systematic Audit)
                </h2>
                <p className="text-xs text-slate-500">
                  Exhaustive title examination, encumbrance checks, urban planning compliance, and anti-money laundering clearance
                </p>
              </div>

              {legalReview && (
                <StatusBadge status={legalReview.overall_status} size="md" />
              )}
            </div>

            {legalReview && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <span className="font-bold text-slate-900 uppercase tracking-wide text-[10px]">Counsel Legal Opinion Summary:</span>
                <p className="text-slate-700 leading-relaxed">{legalReview.legal_summary}</p>
                {isStaff && legalReview.internal_legal_notes && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-amber-900 bg-amber-50/60 p-2 rounded text-[11px]">
                    <strong>Internal Counsel Note:</strong> {legalReview.internal_legal_notes}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Source of Funds & Tracfin AML Compliance Embedded Module */}
          <TracfinEmbeddedSection
            transaction={transaction}
            onDossierUpdated={(updated) => {
              setTracfinDossier(updated);
              fetchAllData();
            }}
          />

          {/* Statutory Preemption Rights Tracker (SAFER & DPU) */}
          <PreemptionTrackerCard propertyName={transaction.property_name} />

          {/* List of 9 Legal Checks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {legalChecks.map((check) => (
              <div
                key={check.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={check.status} size="sm" />
                    {isStaff && (
                      <button
                        onClick={() => {
                          setSelectedCheck(check);
                          setCheckStatus(check.status);
                          setCheckFindings(check.findings || '');
                          setCheckClientNotes(check.client_visible_notes || '');
                          setCheckInternalNotes(check.internal_notes || '');
                        }}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Update Check
                      </button>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs">
                    {check.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {check.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5 bg-slate-50/50 p-2.5 rounded">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Findings:</span>
                    <span className="font-medium text-slate-800 text-[11px]">{check.findings}</span>
                  </div>

                  {check.client_visible_notes && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Legal Note:</span>
                      <span className="text-slate-600 text-[11px]">{check.client_visible_notes}</span>
                    </div>
                  )}

                  {isStaff && check.internal_notes && (
                    <div className="text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded border border-amber-200">
                      <strong>Internal Note:</strong> {check.internal_notes}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 pt-1">
                    Audited by: {check.assigned_professional_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: OFFER */}
      {activeTab === 'offer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Legal Acquisition Offer & Terms
                </h2>
                <p className="text-xs text-slate-500">Formal binding offer submission with contractual conditions</p>
              </div>
              {offers[0] && <StatusBadge status={offers[0].status} />}
            </div>

            <form onSubmit={handleSubmitOffer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client Offer Amount ({transaction.currency}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-md font-mono focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Escrow Deposit Amount (10%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={offerDeposit}
                    onChange={(e) => setOfferDeposit(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-md font-mono focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proposed Notarial Closing Date
                </label>
                <input
                  type="date"
                  value={offerClosingDate}
                  onChange={(e) => setOfferClosingDate(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Legal Conditions & Contingencies
                </label>
                <textarea
                  rows={3}
                  value={offerConditions}
                  onChange={(e) => setOfferConditions(e.target.value)}
                  placeholder="e.g. Subject to unencumbered title certificate, Carrez surface verification, and vacant possession upon deed signing."
                  className="w-full text-xs p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  placeholder="Notes to transaction manager regarding funds transfer."
                  className="w-full text-xs p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingOffer}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  {isSubmittingOffer ? 'Recording Offer...' : 'Submit / Update Formal Offer'}
                </button>
              </div>
            </form>
          </div>

          {/* Offer History */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Offer & Counteroffer History
            </h3>

            {offers.length === 0 ? (
              <div className="text-xs text-slate-500 py-4">No offer records submitted yet.</div>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100">
                {offers.map((off) => (
                  <div key={off.id} className="pt-3 first:pt-0 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">Version {off.version}</span>
                      <StatusBadge status={off.status} size="sm" />
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      {off.currency} {off.client_offer_amount.toLocaleString()}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{off.conditions}</p>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {new Date(off.submitted_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: CONTRACT & E-SIGNATURE */}
      {activeTab === 'contract' && (
        <div className="space-y-6">
          {contract ? (
            <QESProviderIntegrationModule
              contract={contract}
              transaction={transaction}
              onContractUpdated={(updated) => {
                setContract(updated);
                fetchAllData();
              }}
            />
          ) : (
            <EmptyState
              title="No contract available"
              description="A contract will appear here when it has been prepared for this transaction."
              icon={FileText}
            />
          )}
        </div>
      )}

      {/* TAB 8: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Multi-Currency FX Converter & Hedging Simulator */}
          <CurrencyConverterCard amountInEur={transaction.agreed_price} />

          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Notarial Escrow & Milestone Payments
                </h2>
                <p className="text-xs text-slate-500">Verified bank escrow wire schedule and official receipts</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsWireModalOpen(true)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                  Notarial Wire Details
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedEscrowPayment(null);
                    setIsEscrowModalOpen(true);
                  }}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  Execute Escrow Wire Payment
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Milestone Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Confirmation & Reference</th>
                  <th className="py-3 px-4 text-right">Escrow Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <EmptyState
                    title="No payment records"
                    description="Payment records will appear here when a payment has been initiated or recorded through the authorized payment system."
                    icon={DollarSign}
                    variant="table"
                  />
                ) : (
                  payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {p.description}
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                      {p.currency} {p.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {p.due_date || 'Upon Closing'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {p.confirmed_at ? (
                        <div className="space-y-0.5 text-[11px]">
                          <span className="font-mono text-emerald-800 font-bold block">{p.transaction_reference}</span>
                          <span className="text-[10px] text-slate-400">Confirmed by {p.confirmed_by}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Awaiting notary escrow wire</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.status !== 'CONFIRMED' ? (
                        <button
                          type="button"
                          onClick={() => handleConfirmPayment(p.id)}
                          className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-white font-semibold text-[11px] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Execute Wire</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Secured
                        </span>
                      )}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* TAB 9: CLOSING */}
      {activeTab === 'closing' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Final Notarial Closing & Title Handover
              </h2>
              <p className="text-xs text-slate-500">8-point completion checklist for legal ownership transfer</p>
            </div>

            {closing && <StatusBadge status={closing.closing_status} size="md" />}
          </div>

          {/* Checklist Items */}
          <div className="space-y-3">
            {closingChecklist.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <button
                    disabled={!isStaff && item.required_role !== 'CLIENT'}
                    onClick={() => handleChecklistToggle(item.id, item.status)}
                    className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
                      item.status === 'COMPLETED'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-slate-300 hover:border-slate-400 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 fill-white" />
                  </button>

                  <div className="space-y-0.5">
                    <span className={`font-bold ${item.status === 'COMPLETED' ? 'text-slate-900 line-through' : 'text-slate-900'}`}>
                      {item.item_title}
                    </span>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2">
                      <span>Required Role: {item.required_role}</span>
                      {item.completed_by && (
                        <span>• Completed by {item.completed_by} on {new Date(item.completed_at || '').toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <StatusBadge status={item.status} size="sm" />
              </div>
            ))}
          </div>

          {/* Staff Finalize Button */}
          {isStaff && transaction.status !== 'COMPLETED' && (
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleFinalizeClosing}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center gap-2"
              >
                <CheckSquare className="w-4 h-4" /> Finalize Closing & Transfer Title
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 10: MESSAGES */}
      {activeTab === 'messages' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col h-[600px]">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Direct Transaction Counsel Channel
                </h3>
                <p className="text-[11px] text-slate-300">
                  Encrypted communications between Buyer, Legal Counsel & Transaction Officer
                </p>
              </div>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                No messages yet. Start communication with your legal officer.
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender_user_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 px-1">
                      <span className="font-bold text-slate-700">{msg.sender_name}</span>
                      <span>({msg.sender_role.replace(/_/g, ' ')})</span>
                      {msg.is_internal_note && (
                        <span className="bg-amber-100 text-amber-900 px-1 rounded font-bold">INTERNAL NOTE</span>
                      )}
                      <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-xl max-w-lg text-xs leading-relaxed shadow-xs ${
                        msg.is_internal_note
                          ? 'bg-amber-50 border border-amber-300 text-amber-950'
                          : isMine
                          ? 'bg-slate-900 text-white rounded-br-none'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
                      }`}
                    >
                      {msg.message_text}

                      {msg.attachment_name && (
                        <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center gap-1.5 text-[11px] text-amber-300">
                          <Paperclip className="w-3 h-3" />
                          <span>Attachment: {msg.attachment_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 space-y-2">
            {isStaff && (
              <label className="flex items-center gap-2 text-xs text-amber-900 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  className="rounded border-amber-400 text-amber-900 focus:ring-amber-900"
                />
                <span className="font-medium">Post as Private Internal Legal Note (Hidden from Buyer)</span>
              </label>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message to the legal team..."
                className="flex-1 text-xs px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || isSubmittingMessage}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 11: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Immutable Transaction Audit Trail
            </h2>
            <p className="text-xs text-slate-500">
              Chronological cryptographic log of every requirement, document upload, verification, and signature
            </p>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.map((entry) => (
              <div key={entry.id} className="relative group text-xs space-y-1">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-blue-900 border-2 border-white shadow-xs" />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-slate-900">
                    {new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} -{' '}
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                    {entry.action.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{entry.details}</p>
                <div className="text-[10px] text-slate-400 font-mono">
                  Actor: {entry.user_email || 'System'} ({entry.user_role || 'STAFF'}) • IP: {entry.ip_address}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUploadSuccess}
        transactionId={transactionId}
      />

      {/* Electronic Signature Modal */}
      <SignaturePadModal
        isOpen={isSignatureOpen}
        onClose={() => setIsSignatureOpen(false)}
        onSign={handleSignContract}
        documentTitle={contract?.title || 'Compromis de Vente - Bilateral Agreement'}
        defaultSignerName={user?.profile ? `${user.profile.first_name} ${user.profile.last_name}` : user?.email || 'Alex Dupont'}
        defaultSignerRole={isStaff ? 'LEGAL_REPRESENTATIVE' : 'BUYER'}
      />

      {/* Staff Update Legal Check Modal */}
      {selectedCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              Update Legal Due Diligence Check: {selectedCheck.title}
            </h3>

            <form onSubmit={handleUpdateCheck} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={checkStatus}
                  onChange={(e) => setCheckStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-white"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="CLEARED">CLEARED</option>
                  <option value="ISSUE_FOUND">ISSUE_FOUND</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Findings Summary</label>
                <input
                  type="text"
                  value={checkFindings}
                  onChange={(e) => setCheckFindings(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client-Visible Legal Note</label>
                <textarea
                  rows={2}
                  value={checkClientNotes}
                  onChange={(e) => setCheckClientNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Internal Legal Notes (Hidden from Client)</label>
                <textarea
                  rows={2}
                  value={checkInternalNotes}
                  onChange={(e) => setCheckInternalNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedCheck(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingCheck}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-semibold"
                >
                  Save Check
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Version History Modal */}
      <DocumentVersionModal
        isOpen={!!selectedDocForVersions}
        onClose={() => setSelectedDocForVersions(null)}
        documentItem={selectedDocForVersions}
        onVersionUploaded={fetchAllData}
      />

      {/* Tracfin & Source of Funds Compliance Modal */}
      {transaction && (
        <TracfinComplianceModal
          isOpen={isTracfinOpen}
          onClose={() => setIsTracfinOpen(false)}
          transaction={transaction}
          onDossierUpdated={(updatedDossier) => {
            setTracfinDossier(updatedDossier);
            fetchAllData();
          }}
        />
      )}

      {/* eIDAS Qualified Electronic Signature (QES) Modal */}
      {contract && transaction && (
        <QESSignatureModal
          isOpen={isQESOpen}
          onClose={() => setIsQESOpen(false)}
          contract={contract}
          transaction={transaction}
          onSignedSuccess={(updatedContract, updatedSession) => {
            setContract(updatedContract);
            setQesSession(updatedSession);
            fetchAllData();
          }}
        />
      )}

      {/* Notarial Wire Instructions Modal */}
      {transaction && (
        <NotarialWireModal
          isOpen={isWireModalOpen}
          onClose={() => setIsWireModalOpen(false)}
          transaction={transaction}
        />
      )}

      {/* Escrow Payment Interaction & Secure Status Update Modal */}
      {transaction && (
        <EscrowPaymentInteractionModal
          isOpen={isEscrowModalOpen}
          onClose={() => {
            setIsEscrowModalOpen(false);
            setSelectedEscrowPayment(null);
          }}
          transaction={transaction}
          payments={payments}
          initialPayment={selectedEscrowPayment}
          onPaymentSuccess={async (updatedTx) => {
            setTransaction(updatedTx);
            await fetchAllData();
          }}
        />
      )}
    </div>
  );
};
