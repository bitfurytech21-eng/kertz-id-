import React, { useState, useEffect } from 'react';
import {
  Printer,
  FileText,
  Plus,
  PackageCheck,
  FileCode2,
  Search,
  Eye,
  Download,
  Trash2,
  CheckCircle2,
  Layers,
  X,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Building,
  Users,
  Compass,
  FileCheck2,
  Landmark,
  Scale,
  Video,
} from 'lucide-react';
import { api } from '../../services/api';
import { safeDownload } from '../../utils/safeDownload';

interface FormDocument {
  id: string;
  status: 'Draft' | 'Review' | 'Approved' | 'Signed';
  type: string;
  clientName: string;
  clientEmail: string;
  transactionTitle?: string;
  date: string;
  formTypeKey: string;
  customNotes?: string;
  jurisdiction?: string;
  notaryName?: string;
  cadastralId?: string;
  agreedPrice?: number;
}

const INITIAL_DOCUMENTS: FormDocument[] = [
  {
    id: 'DOC-2026-00482',
    status: 'Draft',
    type: 'Deed of Assignment',
    clientName: 'John Smith',
    clientEmail: 'john.smith@kretz.site',
    transactionTitle: 'Luxury Villa Acquisition - Côte d’Azur',
    date: '2026-10-02',
    formTypeKey: 'deed_assignment',
    customNotes: 'Pending final confirmation on mortgage clearance schedule.',
    jurisdiction: 'France · Alpes-Maritimes',
    notaryName: 'Maître Claire de Saint-Germain',
    cadastralId: 'AH-102',
    agreedPrice: 5900000,
  },
  {
    id: 'DOC-2026-002',
    status: 'Review',
    type: 'Sale Agreement (Compromis)',
    clientName: 'Sophia Mènor',
    clientEmail: 'melissamenorsophia@gmail.com',
    transactionTitle: 'Bastide d’exception du 19e vue Sainte-Victoire',
    date: '2026-10-01',
    formTypeKey: 'compromis',
    customNotes: 'Deposit of 10% cleared to notary escrow account.',
    jurisdiction: 'France · Bouches-du-Rhône',
    notaryName: 'Maître Claire de Saint-Germain',
    cadastralId: 'SV-402',
    agreedPrice: 3800000,
  },
  {
    id: 'DOC-2026-003',
    status: 'Approved',
    type: 'Lease Agreement',
    clientName: 'Jean-Luc Dupont',
    clientEmail: 'jldupont@paris.fr',
    transactionTitle: 'Penthouse Triangle d’Or - Paris 8e',
    date: '2026-09-28',
    formTypeKey: 'lease',
    customNotes: 'Long-term residential lease with furniture inventory.',
    jurisdiction: 'France · Paris 8e',
    notaryName: 'Maître Marcus Vance',
    cadastralId: 'PAR-881',
    agreedPrice: 1200000,
  },
  {
    id: 'DOC-2026-004',
    status: 'Signed',
    type: 'Power of Attorney (Procuration)',
    clientName: 'Elena Rostova',
    clientEmail: 'elena.rostova@monaco.mc',
    transactionTitle: 'Cap d’Antibes Waterfront Estate',
    date: '2026-09-25',
    formTypeKey: 'procuration',
    customNotes: 'eIDAS QES remote signature verified via Visio-Notaire.',
    jurisdiction: 'France · Alpes-Maritimes',
    notaryName: 'Maître Claire de Saint-Germain',
    cadastralId: 'ANT-902',
    agreedPrice: 14500000,
  },
  {
    id: 'DOC-2026-005',
    status: 'Signed',
    type: 'Acte Authentique de Vente',
    clientName: 'Alexandre Moreau',
    clientEmail: 'a.moreau@kretz.site',
    transactionTitle: 'Hôtel Particulier - Paris 16e',
    date: '2026-09-20',
    formTypeKey: 'acte',
    customNotes: 'Official deed registered with Conservation des Hypothèques.',
    jurisdiction: 'France · Paris 16e',
    notaryName: 'Maître Claire de Saint-Germain',
    cadastralId: 'PAR-1604',
    agreedPrice: 22000000,
  },
];

const WIZARD_STEPS = [
  { id: 1, key: '01', title: 'Transaction' },
  { id: 2, key: '02', title: 'Jurisdiction' },
  { id: 3, key: '03', title: 'Parties' },
  { id: 4, key: '04', title: 'Property' },
  { id: 5, key: '05', title: 'Details' },
  { id: 6, key: '06', title: 'Review' },
  { id: 7, key: '07', title: 'Generate' },
];

const TRANSACTION_TYPES = [
  'Property Purchase',
  'Property Sale',
  'Property Transfer',
  'Lease',
  'Mortgage',
  'Property Management',
  'Other',
];

const DOCUMENT_TYPES_BY_TRANSACTION: Record<string, string[]> = {
  'Property Purchase': [
    'Sale Agreement (Compromis de Vente)',
    'Acte Authentique de Vente',
    'Offre d’Achat Immobilier',
    'Promesse Unilatérale de Vente',
    'Mandat de Séquestre Notarié',
  ],
  'Property Sale': [
    'Mandat de Vente Exclusif',
    'Sale Agreement (Compromis de Vente)',
    'Acte Authentique de Vente',
    'Attestation Tracfin (AML)',
  ],
  'Property Transfer': [
    'Deed of Assignment',
    'Donation Entre Vifs (Gift Deed)',
    'Apport en Société (SCI Corporate Transfer)',
  ],
  Lease: [
    'Lease Agreement (Bail d’Habitation)',
    'Bail Commercial (Commercial Lease)',
    'Engagement de Location',
  ],
  Mortgage: [
    'Acte de Prêt Immobilier & Hypothèque',
    'Mainlevée d’Hypothèque',
    'Privilège de Prêteur de Deniers (PPD)',
  ],
  'Property Management': [
    'Mandat de Gestion Locative',
    'Power of Attorney (Procuration Notariée)',
    'Convention d’Indivision',
  ],
  Other: [
    'Power of Attorney (Procuration Notariée)',
    'Attestation Notariée Générale',
    'Attestation Tracfin (AML Compliance)',
  ],
};

export const AdminFormPrinter: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [documents, setDocuments] = useState<FormDocument[]>(INITIAL_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<FormDocument | null>(null);

  // Document Generated Success State Flag
  const [isDocGenerated, setIsDocGenerated] = useState(false);

  // Step 3 Editing Drawers
  const [isChangingBuyer, setIsChangingBuyer] = useState(false);
  const [isChangingSeller, setIsChangingSeller] = useState(false);
  const [additionalParties, setAdditionalParties] = useState<
    Array<{ id: string; role: string; name: string; type: string; verified: boolean }>
  >([]);

  // Step 5 Uploaded Documents List
  const [uploadedDocs, setUploadedDocs] = useState<
    Array<{ id: string; name: string; size: string; date: string }>
  >([
    { id: 'DOC-ATT-01', name: 'Identity_Passport_Proof_John_Smith.pdf', size: '2.4 MB', date: '2026-10-04' },
  ]);

  // Step 6 Selected Status
  const [selectedReviewStatus, setSelectedReviewStatus] = useState<string>('Draft');

  // Step 7 Generation Options State
  const [outputs, setOutputs] = useState({
    pdf: true,
    print: false,
    clientCopy: false,
    legalOfficeCopy: false,
    registryCopy: false,
  });

  const [markings, setMarkings] = useState({
    docId: true,
    txId: true,
    pageNumbers: true,
    versionNumber: true,
    generationDate: true,
  });

  // Package Modal State
  const [packageTxId] = useState('TXN-2026-00182');
  const [packageDocChecklist, setPackageDocChecklist] = useState([
    { id: 'chk-1', label: 'Client KYC', checked: true },
    { id: 'chk-2', label: 'Identity Verification', checked: true },
    { id: 'chk-3', label: 'Property Details', checked: true },
    { id: 'chk-4', label: 'Title Documents', checked: true },
    { id: 'chk-5', label: 'Search Report', checked: true },
    { id: 'chk-6', label: 'Offer Letter', checked: true },
    { id: 'chk-7', label: 'Sale Agreement', checked: true },
    { id: 'chk-8', label: 'Deed of Assignment', checked: true },
    { id: 'chk-9', label: 'Payment Statement', checked: true },
    { id: 'chk-10', label: 'Registration Checklist', checked: true },
    { id: 'chk-11', label: 'Completion Certificate', checked: false },
  ]);

  // 7-Step Wizard Form State
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    transactionType: 'Property Transfer',
    docType: 'Deed of Assignment',
    transactionTitle: 'Luxury Villa Acquisition - Côte d’Azur',
    purpose: 'Property Assignment & Title Conveyance',

    // Step 02: Jurisdiction
    country: 'France',
    state: 'Alpes-Maritimes - Cannes',
    registry: 'Service de la Publicité Foncière (Land Registry)',
    transactionLocation: '12 Place Vendôme, 75001 Paris / Cannes Office',

    notaryStudy: 'Etude Notariale Kretz & Associés - Paris / Cannes',
    notaryOfficer: 'Maître Claire de Saint-Germain',
    governingLaw: 'Code Civil Français & Decree 2020-1422 (eIDAS QES)',

    // Step 03: Parties
    buyerName: 'John Smith',
    buyerEmail: 'john.smith@kretz.site',
    buyerPhone: '+33 1 42 68 00 00',
    buyerCountry: 'France',
    sellerName: 'ABC Properties Ltd',
    sellerEmail: 'contact@abcproperties.com',

    // Step 04: Property
    propertyName: 'Villa Waterfront Estate - Cap d’Antibes',
    propertyAddress: '24 Boulevard de la Croisette, 06400 Cannes',
    cadastralId: 'CAN-2026-8801',
    surfaceSqm: 2400,
    agreedPrice: 5900000,

    // Step 05: Transaction Details
    consideration: 5900000,
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Pending',
    agreementDate: '2026-10-15',
    possessionDate: '2026-11-15',
    specialConditions: 'Standard mortgage financing condition waived; pre-emption rights cleared by Mayor office.',

    depositAmount: 590000,
    customNotes: 'Priority registration with Conservation des Hypothèques de Nice.',
    docStatus: 'Draft' as 'Draft' | 'Review' | 'Approved' | 'Signed',
  });

  // Generated Document State for Step 7
  const [generatedDoc, setGeneratedDoc] = useState<FormDocument | null>(null);

  // Load API Clients
  const [clients, setClients] = useState<any[]>([]);
  useEffect(() => {
    api.admin.getClients()
      .then((res) => {
        if (res.clients) setClients(res.clients);
      })
      .catch(() => {});
  }, []);

  // Filter Documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesStatus = statusFilter === 'All' || doc.status === statusFilter;
    const matchesSearch =
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.transactionTitle && doc.transactionTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Open Wizard
  const openCreateWizard = () => {
    setWizardStep(1);
    setIsDocGenerated(false);
    setGeneratedDoc(null);
    setIsWizardOpen(true);
  };

  // Final Generate Step (Step 6 -> Step 7)
  const executeGenerate = () => {
    const mappedStatus: FormDocument['status'] =
      selectedReviewStatus === 'Legal Review'
        ? 'Review'
        : selectedReviewStatus === 'Approved'
        ? 'Approved'
        : selectedReviewStatus === 'Signed'
        ? 'Signed'
        : 'Draft';

    const newDoc: FormDocument = {
      id: `DOC-2026-00482`,
      status: mappedStatus,
      type: formData.docType,
      clientName: formData.buyerName,
      clientEmail: formData.buyerEmail,
      transactionTitle: formData.transactionTitle,
      date: new Date().toISOString().split('T')[0],
      formTypeKey: formData.docType.toLowerCase().replace(/[^a-z]/g, '_'),
      customNotes: formData.specialConditions,
      jurisdiction: `${formData.country} · ${formData.state}`,
      notaryName: formData.notaryOfficer,
      cadastralId: formData.cadastralId,
      agreedPrice: formData.consideration,
    };

    setDocuments([newDoc, ...documents.filter((d) => d.id !== 'DOC-2026-00482')]);
    setGeneratedDoc(newDoc);
    setWizardStep(7);
  };

  // Status Badge Helper
  const renderStatusBadge = (status: FormDocument['status']) => {
    switch (status) {
      case 'Draft':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300">Draft</span>;
      case 'Review':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">Review</span>;
      case 'Approved':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">Approved</span>;
      case 'Signed':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Signed</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 uppercase">
          LEGAL FORM PRINTER
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Create, review and print transaction documents.
        </p>
      </div>

      {/* ========================================================= */}
      {/* 3 HERO ACTION CARDS                                       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: + NEW DOCUMENT */}
        <button
          onClick={openCreateWizard}
          className="p-6 bg-white border border-slate-200 hover:border-slate-900 rounded-2xl shadow-xs hover:shadow-md transition-all text-left group space-y-3 relative overflow-hidden"
        >
          <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-sm text-slate-900 uppercase tracking-wider group-hover:text-amber-900">
              + NEW DOCUMENT
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Create a form
            </p>
          </div>
        </button>

        {/* Card 2: DOCUMENT PACKAGE */}
        <button
          onClick={() => setIsPackageModalOpen(true)}
          className="p-6 bg-white border border-slate-200 hover:border-slate-900 rounded-2xl shadow-xs hover:shadow-md transition-all text-left group space-y-3 relative overflow-hidden"
        >
          <div className="w-10 h-10 bg-indigo-50 text-indigo-800 rounded-xl flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-sm text-slate-900 uppercase tracking-wider group-hover:text-indigo-900">
              DOCUMENT PACKAGE
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Build closing package
            </p>
          </div>
        </button>

        {/* Card 3: TEMPLATES */}
        <button
          onClick={() => navigate('/admin/templates')}
          className="p-6 bg-white border border-slate-200 hover:border-slate-900 rounded-2xl shadow-xs hover:shadow-md transition-all text-left group space-y-3 relative overflow-hidden"
        >
          <div className="w-10 h-10 bg-amber-50 text-amber-800 rounded-xl flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-sm text-slate-900 uppercase tracking-wider group-hover:text-amber-900">
              TEMPLATES
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Manage templates
            </p>
          </div>
        </button>
      </div>

      {/* ========================================================= */}
      {/* DOCUMENTS TABLE SECTION                                   */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <h2 className="font-serif font-bold text-lg text-slate-900 uppercase tracking-wider">
            DOCUMENTS
          </h2>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {['All', 'Draft', 'Review', 'Approved', 'Signed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-mono font-bold uppercase text-slate-400">
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {renderStatusBadge(doc.status)}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                      {doc.type}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">{doc.id}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-800">{doc.clientName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{doc.clientEmail}</div>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap font-mono text-slate-500">
                    {doc.date}
                  </td>
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedDocForPreview(doc)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Print & Review</span>
                      </button>
                      <button
                        onClick={() => setDocuments(documents.filter((d) => d.id !== doc.id))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7-STEP CREATE LEGAL DOCUMENT WIZARD MODAL                 */}
      {/* ========================================================= */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200 relative my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-amber-700 tracking-wider">
                  KRETZ LEGAL WORKSPACE · STEP WIZARD
                </span>
                <h2 className="font-serif font-bold text-xl text-slate-900 uppercase">
                  CREATE LEGAL DOCUMENT
                </h2>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* HORIZONTAL STEP INDICATOR AT TOP */}
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center justify-between min-w-[650px] border-b border-slate-100 pb-3">
                {WIZARD_STEPS.map((step) => {
                  const isActive = wizardStep === step.id;
                  const isCompleted = wizardStep > step.id;

                  return (
                    <button
                      key={step.id}
                      onClick={() => {
                        if (step.id < wizardStep) setWizardStep(step.id);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                        isActive
                          ? 'bg-slate-950 text-amber-400 shadow-md ring-2 ring-slate-900'
                          : isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-[10px]">
                        {isCompleted ? '✓' : step.key}
                      </span>
                      <span>{step.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP CONTENT BODY */}
            <div className="py-2 text-xs">
              {/* STEP 01: TRANSACTION */}
              {wizardStep === 1 && (
                <div className="space-y-6">
                  {/* Transaction Type Radio Options */}
                  <div className="space-y-3">
                    <label className="block font-serif font-bold text-sm text-slate-900 uppercase tracking-wider">
                      Transaction Type
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {TRANSACTION_TYPES.map((type) => {
                        const isSelected = formData.transactionType === type;
                        const defaultDocForType = (DOCUMENT_TYPES_BY_TRANSACTION[type] || [])[0] || 'Power of Attorney (Procuration Notariée)';

                        return (
                          <label
                            key={type}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                transactionType: type,
                                docType: defaultDocForType,
                              });
                            }}
                            className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 select-none ${
                              isSelected
                                ? 'bg-slate-950 text-white border-slate-900 shadow-md'
                                : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-400 bg-white'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                            </div>
                            <span className="font-semibold text-xs">{type}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Document Type Dropdown */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block font-serif font-bold text-sm text-slate-900 uppercase tracking-wider">
                      Document Type
                    </label>

                    <select
                      value={formData.docType}
                      onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition shadow-xs"
                    >
                      <option value="" disabled>
                        [ Select document type ]
                      </option>
                      {(DOCUMENT_TYPES_BY_TRANSACTION[formData.transactionType] || [
                        'Sale Agreement (Compromis de Vente)',
                        'Acte Authentique de Vente',
                      ]).map((docTypeOption) => (
                        <option key={docTypeOption} value={docTypeOption}>
                          {docTypeOption}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 02: JURISDICTION */}
              {wizardStep === 2 && (
                <div className="space-y-5">
                  <h3 className="font-serif font-bold text-sm text-slate-900 uppercase tracking-wider">
                    JURISDICTION
                  </h3>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-700">Country</label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                    >
                      <option value="France">France (Fr)</option>
                      <option value="Monaco">Monaco (MC)</option>
                      <option value="United Kingdom">United Kingdom (UK)</option>
                      <option value="Switzerland">Switzerland (CH)</option>
                      <option value="United States">United States (US)</option>
                      <option value="United Arab Emirates">United Arab Emirates (UAE)</option>
                    </select>
                  </div>

                  {/* State */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-700">State / Region</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                    >
                      <option value="Rivers State">Rivers State</option>
                      <option value="Paris Saint Germain">Paris Saint Germain</option>
                      <option value="Paris 8ème - Triangle d'Or">Paris 8ème - Triangle d'Or</option>
                      <option value="Paris 16ème - Muette">Paris 16ème - Muette</option>
                      <option value="Alpes-Maritimes - Cannes / Roquebrune">Alpes-Maritimes - Cannes / Roquebrune</option>
                      <option value="Var - Saint-Tropez">Var - Saint-Tropez</option>
                      <option value="Bouches-du-Rhône - Aix-en-Provence">Bouches-du-Rhône - Aix-en-Provence</option>
                    </select>
                  </div>

                  {/* Registry / Authority */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-700">Registry / Authority</label>
                    <select
                      value={formData.registry}
                      onChange={(e) => setFormData({ ...formData, registry: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                    >
                      <option value="" disabled>[ Select registry ]</option>
                      <option value="Service de la Publicité Foncière (Land Registry)">Service de la Publicité Foncière (Land Registry)</option>
                      <option value="Conservation des Hypothèques de Paris">Conservation des Hypothèques de Paris</option>
                      <option value="Conservation des Hypothèques de Cannes / Nice">Conservation des Hypothèques de Cannes / Nice</option>
                      <option value="Chambre des Notaires de Paris & Yvelines">Chambre des Notaires de Paris & Yvelines</option>
                      <option value="Tribunal Judiciaire & Registre du Commerce">Tribunal Judiciaire & Registre du Commerce</option>
                    </select>
                  </div>

                  {/* Transaction location */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-700">Transaction location</label>
                    <input
                      type="text"
                      value={formData.transactionLocation}
                      onChange={(e) => setFormData({ ...formData, transactionLocation: e.target.value })}
                      placeholder="e.g. 12 Place Vendôme, 75001 Paris or Saint-Germain-en-Laye"
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                    />
                  </div>
                </div>
              )}

              {/* STEP 03: PARTIES */}
              {wizardStep === 3 && (
                <div className="space-y-6">
                  <h3 className="font-serif font-bold text-sm text-slate-900 uppercase tracking-wider">
                    PARTIES
                  </h3>

                  {/* BUYER CARD */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-xs font-mono uppercase text-slate-500">BUYER</span>
                    <div className="p-5 bg-white border border-slate-300 rounded-2xl shadow-xs space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-bold text-base text-slate-900">{formData.buyerName || 'John Smith'}</h4>
                          <div className="text-xs text-slate-500 font-medium">Individual</div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 pt-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Identity verified</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                          PURCHASER
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            alert(`BUYER DOSSIER SUMMARY:\nName: ${formData.buyerName || 'John Smith'}\nEmail: ${formData.buyerEmail || 'john.smith@kretz.site'}\nType: Individual\nKYC Clearance: VERIFIED (Passport & Proof of Residence On File)\nSource of Funds: Clear`);
                          }}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition"
                        >
                          View Client
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsChangingBuyer(!isChangingBuyer)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition"
                        >
                          Change
                        </button>
                      </div>

                      {/* Change Buyer Selector */}
                      {isChangingBuyer && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs pt-3">
                          <label className="block font-semibold text-slate-700">Select Client Profile / Enter Buyer Name</label>
                          {clients.length > 0 ? (
                            <select
                              value={formData.buyerName}
                              onChange={(e) => {
                                const found = clients.find((c) =>
                                  c.profile ? `${c.profile.first_name} ${c.profile.last_name}` === e.target.value : c.email === e.target.value
                                );
                                if (found) {
                                  setFormData({
                                    ...formData,
                                    buyerName: found.profile ? `${found.profile.first_name} ${found.profile.last_name}` : found.email,
                                    buyerEmail: found.email,
                                  });
                                } else {
                                  setFormData({ ...formData, buyerName: e.target.value });
                                }
                                setIsChangingBuyer(false);
                              }}
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
                            >
                              <option value="John Smith">John Smith (john.smith@kretz.site)</option>
                              {clients.map((c) => {
                                const name = c.profile ? `${c.profile.first_name} ${c.profile.last_name}` : c.email;
                                return <option key={c.id} value={name}>{name} ({c.email})</option>;
                              })}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={formData.buyerName}
                              onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SELLER CARD */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-xs font-mono uppercase text-slate-500">SELLER</span>
                    <div className="p-5 bg-white border border-slate-300 rounded-2xl shadow-xs space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-bold text-base text-slate-900">{formData.sellerName || 'ABC Properties Ltd'}</h4>
                          <div className="text-xs text-slate-500 font-medium">Corporate</div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 pt-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>KYC complete</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                          VENDOR
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            alert(`SELLER ENTITY SUMMARY:\nName: ${formData.sellerName || 'ABC Properties Ltd'}\nType: Corporate Entity (RCS Paris 882 104 990)\nKYC / Beneficial Owner Clearance: COMPLETE\nRepresentative: Director Board`);
                          }}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition"
                        >
                          View Client
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsChangingSeller(!isChangingSeller)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition"
                        >
                          Change
                        </button>
                      </div>

                      {/* Change Seller Drawer */}
                      {isChangingSeller && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs pt-3">
                          <label className="block font-semibold text-slate-700">Enter Seller Corporate Entity / Individual Name</label>
                          <input
                            type="text"
                            value={formData.sellerName}
                            onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Parties */}
                  {additionalParties.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {additionalParties.map((party) => (
                        <div key={party.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-[10px] font-mono uppercase text-slate-400 block">{party.role}</span>
                            <strong className="text-slate-900 font-bold block text-sm">{party.name}</strong>
                            <span className="text-slate-500">{party.type} · Verified</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAdditionalParties(additionalParties.filter((p) => p.id !== party.id))}
                            className="text-rose-600 font-bold text-xs hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* + Add Party Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const newParty = {
                        id: `PARTY-${Date.now()}`,
                        role: 'Guarantor / Caution Solidaire',
                        name: 'Banque Notariale de Garantie',
                        type: 'Financial Institution',
                        verified: true,
                      };
                      setAdditionalParties([...additionalParties, newParty]);
                    }}
                    className="w-full py-3.5 border-2 border-dashed border-slate-300 hover:border-slate-900 rounded-2xl text-slate-900 font-semibold text-xs transition flex items-center justify-center gap-2 hover:bg-slate-50"
                  >
                    <Plus className="w-4 h-4 text-amber-600" />
                    <span>+ Add Party</span>
                  </button>
                </div>
              )}

              {/* STEP 04: PROPERTY */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Property Designation Title
                      </label>
                      <input
                        type="text"
                        value={formData.propertyName}
                        onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Cadastral Parcel Reference
                      </label>
                      <input
                        type="text"
                        value={formData.cadastralId}
                        onChange={(e) => setFormData({ ...formData, cadastralId: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Full Physical Address
                    </label>
                    <input
                      type="text"
                      value={formData.propertyAddress}
                      onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Total Land / Parcel Surface Area (m²)
                      </label>
                      <input
                        type="number"
                        value={formData.surfaceSqm}
                        onChange={(e) => setFormData({ ...formData, surfaceSqm: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Agreed Acquisition Purchase Price (€ EUR)
                      </label>
                      <input
                        type="number"
                        value={formData.agreedPrice}
                        onChange={(e) => setFormData({ ...formData, agreedPrice: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 05: TRANSACTION DETAILS */}
              {wizardStep === 5 && (
                <div className="space-y-5">
                  <h3 className="font-serif font-bold text-sm text-slate-900 uppercase tracking-wider">
                    TRANSACTION DETAILS
                  </h3>

                  {/* Consideration */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-700">Consideration ($ / €)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400 font-mono font-bold">$</span>
                      <input
                        type="number"
                        value={formData.consideration}
                        onChange={(e) => setFormData({ ...formData, consideration: Number(e.target.value) })}
                        placeholder="e.g. 5900000"
                        className="w-full pl-8 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-700">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Notarial Wire Transfer (Virement Notarié)">Notarial Wire Transfer (Virement Notarié)</option>
                      <option value="Escrow Deposit (Compte Séquestre)">Escrow Deposit (Compte Séquestre)</option>
                      <option value="Certified Bank Draft">Certified Bank Draft</option>
                      <option value="Mortgage Loan Proceeds">Mortgage Loan Proceeds</option>
                    </select>
                  </div>

                  {/* Payment Status */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-700">Payment Status</label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Partial Deposit Cleared">Partial Deposit Cleared</option>
                      <option value="Escrow Deposit Verified">Escrow Deposit Verified</option>
                      <option value="Paid in Full">Paid in Full</option>
                    </select>
                  </div>

                  {/* Agreement Date & Possession Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-slate-700">Agreement Date</label>
                      <input
                        type="date"
                        value={formData.agreementDate}
                        onChange={(e) => setFormData({ ...formData, agreementDate: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-semibold text-slate-700">Possession Date</label>
                      <input
                        type="date"
                        value={formData.possessionDate}
                        onChange={(e) => setFormData({ ...formData, possessionDate: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Special Conditions */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-700">Special Conditions</label>
                    <textarea
                      rows={3}
                      value={formData.specialConditions}
                      onChange={(e) => setFormData({ ...formData, specialConditions: e.target.value })}
                      placeholder="Specify special clauses, suspensory financing conditions, or possession terms..."
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                    />
                  </div>

                  {/* Supporting Documents */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-700">Supporting Documents</label>

                    {uploadedDocs.length > 0 && (
                      <div className="space-y-1.5">
                        {uploadedDocs.map((file) => (
                          <div key={file.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-indigo-600" />
                              <span className="font-semibold text-slate-800">{file.name}</span>
                              <span className="text-slate-400 text-[10px]">({file.size})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setUploadedDocs(uploadedDocs.filter((f) => f.id !== file.id))}
                              className="text-rose-600 font-bold hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const newDoc = {
                          id: `DOC-ATT-${Date.now()}`,
                          name: `Source_of_Funds_Statement_${uploadedDocs.length + 1}.pdf`,
                          size: '1.8 MB',
                          date: new Date().toISOString().split('T')[0],
                        };
                        setUploadedDocs([...uploadedDocs, newDoc]);
                      }}
                      className="w-full py-3.5 border-2 border-dashed border-slate-300 hover:border-slate-900 rounded-2xl text-slate-900 font-semibold text-xs transition flex items-center justify-center gap-2 hover:bg-slate-50"
                    >
                      <Plus className="w-4 h-4 text-amber-600" />
                      <span>+ Upload Document</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 06: REVIEW */}
              {wizardStep === 6 && (
                <div className="space-y-6">
                  {/* Header Info */}
                  <div className="space-y-1 border-b border-slate-200 pb-4">
                    <h3 className="font-serif font-bold text-base text-slate-900 uppercase tracking-wider">
                      REVIEW DOCUMENT
                    </h3>
                    <div className="font-bold text-sm text-slate-900">
                      {formData.docType || 'Deed of Assignment'}
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-mono text-slate-500">
                      <span>Version 1.0</span>
                      <span>•</span>
                      <span>{formData.state || 'Rivers State'} ({formData.country || 'France'})</span>
                    </div>
                  </div>

                  {/* Checklist Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                    <div className="p-3.5 bg-slate-50 font-mono font-bold uppercase text-[11px] text-slate-400 flex justify-between">
                      <span>Section</span>
                      <span>Audit Status</span>
                    </div>

                    <div className="p-3.5 flex items-center justify-between font-semibold text-slate-800">
                      <span>PARTIES</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>✓ COMPLETE</span>
                      </span>
                    </div>

                    <div className="p-3.5 flex items-center justify-between font-semibold text-slate-800">
                      <span>PROPERTY</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>✓ COMPLETE</span>
                      </span>
                    </div>

                    <div className="p-3.5 flex items-center justify-between font-semibold text-slate-800">
                      <span>TRANSACTION</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>✓ COMPLETE</span>
                      </span>
                    </div>

                    <div className="p-3.5 flex items-center justify-between font-semibold text-slate-800">
                      <span>SUPPORTING DOCUMENTS</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <span>⚠ 1 MISSING</span>
                      </span>
                    </div>

                    <div className="p-3.5 flex items-center justify-between font-semibold text-slate-800">
                      <span>WITNESSES</span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <span>⚠ INCOMPLETE</span>
                      </span>
                    </div>
                  </div>

                  {/* DOCUMENT STATUS Radio Options */}
                  <div className="space-y-3 pt-2">
                    <label className="block font-serif font-bold text-xs text-slate-900 uppercase tracking-wider">
                      DOCUMENT STATUS
                    </label>

                    <div className="space-y-2">
                      {[
                        { key: 'Draft', label: 'Draft' },
                        { key: 'Legal Review', label: 'Legal Review' },
                        { key: 'Approved', label: 'Approved' },
                        { key: 'Signed', label: 'Signed' },
                        { key: 'Registered', label: 'Registered' },
                      ].map((st) => {
                        const isSelected = selectedReviewStatus === st.key;
                        return (
                          <label
                            key={st.key}
                            onClick={() => setSelectedReviewStatus(st.key)}
                            className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 select-none text-xs font-semibold ${
                              isSelected
                                ? 'bg-slate-950 text-white border-slate-900 shadow-sm'
                                : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-400 bg-white'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                            </div>
                            <span>{st.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition w-full sm:w-auto"
                    >
                      [Edit Information]
                    </button>

                    <button
                      type="button"
                      onClick={executeGenerate}
                      className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <FileCheck2 className="w-4 h-4 text-amber-400" />
                      <span>[Send for Legal Review]</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 07: GENERATE */}
              {wizardStep === 7 && generatedDoc && (
                <div>
                  {isDocGenerated ? (
                    /* DOCUMENT GENERATED SUCCESS STATE & ACTIONS */
                    <div className="space-y-6 text-xs">
                      {/* Success Banner */}
                      <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-emerald-900 font-serif font-bold text-base uppercase">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                          <span>DOCUMENT GENERATED</span>
                        </div>
                        <p className="font-semibold text-emerald-800 text-xs">
                          ✓ Document successfully generated
                        </p>

                        <div className="pt-2 border-t border-emerald-200/60 font-mono space-y-1">
                          <div className="text-sm font-bold text-slate-900">{generatedDoc.type || 'Deed of Assignment'}</div>
                          <div className="text-slate-600 font-bold">{generatedDoc.id || 'DOC-2026-00482'}</div>
                          <div className="text-slate-500 uppercase font-semibold">
                            Status: <span className="text-slate-900 font-bold">{generatedDoc.status.toUpperCase()}</span>
                          </div>
                        </div>

                        {/* Primary Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setIsWizardOpen(false);
                              setSelectedDocForPreview(generatedDoc);
                            }}
                            className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl shadow-xs transition"
                          >
                            [Open PDF]
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDocForPreview(generatedDoc);
                              setTimeout(() => window.print(), 300);
                            }}
                            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded-xl transition"
                          >
                            [Print]
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const content = `OFFICIAL DEED: ${generatedDoc.type}\nRef: ${generatedDoc.id}\nClient: ${generatedDoc.clientName}\nStatus: ${generatedDoc.status}`;
                              safeDownload(new Blob([content], { type: 'text/plain' }), `${generatedDoc.id}_Executed.txt`);
                            }}
                            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded-xl transition"
                          >
                            [Download]
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDocuments(
                                documents.map((d) => (d.id === generatedDoc.id ? { ...d, status: 'Review' } : d))
                              );
                              alert(`Document ${generatedDoc.id} sent for Legal Review.`);
                            }}
                            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded-xl transition"
                          >
                            [Send for Review]
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              alert(`Document ${generatedDoc.id} sent to Client (${generatedDoc.clientEmail}) for eIDAS QES signature notification.`);
                            }}
                            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded-xl transition"
                          >
                            [Send to Client]
                          </button>
                        </div>
                      </div>

                      {/* DOCUMENT ACTIONS PANEL */}
                      <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
                        <h3 className="font-serif font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                          DOCUMENT ACTIONS
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-medium">
                          <button
                            type="button"
                            onClick={() => alert(`eIDAS Digital Signature request initiated for ${generatedDoc.clientName}.`)}
                            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 transition flex items-center justify-between"
                          >
                            <span>Request Signature</span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </button>

                          <button
                            type="button"
                            onClick={() => alert(`Counterpart deed generated for ${generatedDoc.id}.`)}
                            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 transition flex items-center justify-between"
                          >
                            <span>Create Counterpart</span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsWizardOpen(false);
                              setIsPackageModalOpen(true);
                            }}
                            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 transition flex items-center justify-between"
                          >
                            <span>Create Document Package</span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </button>

                          <button
                            type="button"
                            onClick={() => alert(`Executed signed deed scan upload initialized for ${generatedDoc.id}.`)}
                            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 transition flex items-center justify-between"
                          >
                            <span>Upload Executed Copy</span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              alert(`Document ${generatedDoc.id} archived into Notarial Safe Vault.`);
                              setIsWizardOpen(false);
                            }}
                            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 transition flex items-center justify-between sm:col-span-2"
                          >
                            <span>Archive</span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* GENERATE DOCUMENT CONFIG CARD & PREVIEW */
                    <div className="space-y-6">
                      <div className="p-6 bg-slate-950 text-white rounded-2xl space-y-5 border border-slate-800 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h3 className="font-serif font-bold text-base text-amber-400 uppercase tracking-wider">
                            GENERATE DOCUMENT
                          </h3>
                          <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                            REF: {generatedDoc.id}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px] uppercase font-bold">Document</span>
                            <strong className="text-white text-sm font-semibold">{generatedDoc.type || 'Deed of Assignment'}</strong>
                          </div>

                          <div>
                            <span className="text-slate-400 block font-mono text-[10px] uppercase font-bold">Template</span>
                            <strong className="text-amber-300 font-mono">{generatedDoc.type} — Rivers State — v3.2</strong>
                          </div>
                        </div>

                        {/* Output Checkboxes */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          <label className="block font-serif font-bold text-xs text-slate-300 uppercase tracking-wider">
                            Output
                          </label>
                          <div className="flex flex-wrap items-center gap-4 text-xs">
                            {[
                              { key: 'pdf', label: 'PDF' },
                              { key: 'print', label: 'Print' },
                              { key: 'clientCopy', label: 'Client Copy' },
                              { key: 'legalOfficeCopy', label: 'Legal Office Copy' },
                              { key: 'registryCopy', label: 'Registry Copy' },
                            ].map((opt) => (
                              <label key={opt.key} className="flex items-center gap-2 cursor-pointer text-slate-200 select-none">
                                <input
                                  type="checkbox"
                                  checked={(outputs as any)[opt.key]}
                                  onChange={(e) => setOutputs({ ...outputs, [opt.key]: e.target.checked })}
                                  className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400"
                                />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Document Markings Checkboxes */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          <label className="block font-serif font-bold text-xs text-slate-300 uppercase tracking-wider">
                            Document markings
                          </label>
                          <div className="flex flex-wrap items-center gap-4 text-xs">
                            {[
                              { key: 'docId', label: 'Document ID' },
                              { key: 'txId', label: 'Transaction ID' },
                              { key: 'pageNumbers', label: 'Page numbers' },
                              { key: 'versionNumber', label: 'Version number' },
                              { key: 'generationDate', label: 'Generation date' },
                            ].map((opt) => (
                              <label key={opt.key} className="flex items-center gap-2 cursor-pointer text-slate-200 select-none">
                                <input
                                  type="checkbox"
                                  checked={(markings as any)[opt.key]}
                                  onChange={(e) => setMarkings({ ...markings, [opt.key]: e.target.checked })}
                                  className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400"
                                />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column: DOCUMENT INFORMATION */}
                        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs">
                          <h3 className="font-serif font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3">
                            DOCUMENT INFORMATION
                          </h3>

                          <div className="space-y-3">
                            <div>
                              <span className="font-mono text-[10px] text-slate-400 uppercase block font-bold">Type</span>
                              <strong className="text-slate-900 text-sm font-semibold">{generatedDoc.type || formData.docType}</strong>
                            </div>

                            <div>
                              <span className="font-mono text-[10px] text-slate-400 uppercase block font-bold">Version</span>
                              <strong className="text-slate-800 font-mono">1.0</strong>
                            </div>

                            <div>
                              <span className="font-mono text-[10px] text-slate-400 uppercase block font-bold">Status</span>
                              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 text-white inline-block mt-0.5">
                                {generatedDoc.status}
                              </span>
                            </div>

                            <div>
                              <span className="font-mono text-[10px] text-slate-400 uppercase block font-bold">Client</span>
                              <strong className="text-slate-900 text-xs font-semibold">{generatedDoc.clientName || formData.buyerName}</strong>
                              <div className="text-[10px] font-mono text-slate-500">{generatedDoc.clientEmail || formData.buyerEmail}</div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-200">
                            <button
                              type="button"
                              onClick={() => setWizardStep(1)}
                              className="px-4 py-1.5 bg-white border border-slate-300 hover:border-slate-900 text-slate-800 font-semibold rounded-lg transition"
                            >
                              [Edit]
                            </button>
                          </div>
                        </div>

                        {/* Right Column: DOCUMENT PREVIEW */}
                        <div className="p-6 bg-white border border-slate-300 rounded-2xl shadow-sm space-y-4 text-xs font-serif flex flex-col justify-between">
                          <div className="space-y-4">
                            <h3 className="font-serif font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3 font-sans">
                              DOCUMENT PREVIEW
                            </h3>

                            <div className="p-5 border-2 border-slate-900 rounded-xl space-y-3 bg-slate-50/50 shadow-inner">
                              <div className="flex justify-between text-[10px] font-sans font-mono text-slate-500 border-b border-slate-200 pb-2">
                                <span>RÉPUBLIQUE FRANÇAISE</span>
                                <span>REF: {generatedDoc.id}</span>
                              </div>

                              <div className="font-bold text-xs uppercase text-slate-950 font-serif">
                                {generatedDoc.type}
                              </div>

                              <p className="text-[11px] font-sans leading-relaxed text-slate-700 italic">
                                Conveyance deed executed between {generatedDoc.clientName} (Acquéreur) and {formData.sellerName} (Vendeur) for property parcel {formData.cadastralId || 'AH-102'} at {formData.transactionLocation || 'Rivers State'}.
                              </p>

                              <div className="pt-2 flex justify-between items-center text-[10px] font-mono text-slate-500 border-t border-slate-200">
                                <span>Sealed by Notary</span>
                                <span className="text-emerald-700 font-bold">✓ eIDAS Validated</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-[11px] font-sans text-slate-500 italic text-center pt-2">
                            Ready for print, signature, or archival dispatch.
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsWizardOpen(false);
                            }}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition"
                          >
                            [Save Draft]
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDocuments(
                                documents.map((d) => (d.id === generatedDoc.id ? { ...d, status: 'Review' } : d))
                              );
                              setIsWizardOpen(false);
                            }}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition"
                          >
                            [Send for Review]
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setIsDocGenerated(true);
                          }}
                          className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
                        >
                          <Download className="w-4 h-4 text-amber-400" />
                          <span>[Generate Document]</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* WIZARD FOOTER NAVIGATION BUTTONS */}
            {wizardStep < 6 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    if (wizardStep === 1) setIsWizardOpen(false);
                    else setWizardStep(wizardStep - 1);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{wizardStep === 1 ? 'Cancel' : 'Back'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWizardStep(wizardStep + 1)}
                  className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CREATE DOCUMENT PACKAGE                          */}
      {/* ========================================================= */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200 relative my-8 text-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="font-serif font-bold text-base text-slate-900 uppercase tracking-wider">
                CREATE DOCUMENT PACKAGE
              </h3>
              <button
                onClick={() => setIsPackageModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Transaction Reference & Category */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-400 uppercase font-bold">Transaction</span>
                <span className="font-mono font-bold text-slate-900">{packageTxId}</span>
              </div>

              <div className="pt-1">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                  PROPERTY PURCHASE
                </span>
              </div>
            </div>

            {/* Documents Checkbox List */}
            <div className="space-y-2">
              <label className="block font-serif font-bold text-xs text-slate-900 uppercase tracking-wider">
                DOCUMENTS
              </label>

              <div className="space-y-1.5 max-h-64 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                {packageDocChecklist.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center justify-between p-2 hover:bg-white rounded-lg transition cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => {
                          setPackageDocChecklist(
                            packageDocChecklist.map((d) =>
                              d.id === item.id ? { ...d, checked: e.target.checked } : d
                            )
                          );
                        }}
                        className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                      />
                      <span className={`font-medium ${item.checked ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                        {item.label}
                      </span>
                    </div>
                    {item.checked ? (
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">✓ Included</span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">Optional</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Summary Counter & Action Button */}
            <div className="space-y-4 pt-3 border-t border-slate-200">
              <div className="text-right font-mono font-bold text-slate-700 text-xs">
                {packageDocChecklist.filter((d) => d.checked).length} documents selected
              </div>

              <button
                type="button"
                onClick={() => {
                  const checkedDocs = packageDocChecklist.filter((d) => d.checked).map((d) => d.label);
                  const content = `NOTARIAL CLOSING DOSSIER PACKAGE\nTransaction: ${packageTxId}\nType: PROPERTY PURCHASE\nIncluded Documents (${checkedDocs.length}):\n${checkedDocs.map((d, i) => `${i + 1}. ${d}`).join('\n')}`;
                  safeDownload(new Blob([content], { type: 'text/plain' }), `${packageTxId}_Closing_Binder.txt`);
                  setIsPackageModalOpen(false);
                }}
                className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
              >
                <PackageCheck className="w-4 h-4 text-amber-400" />
                <span>[Generate Package]</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: PRINTABLE DEED PAPER PREVIEW                      */}
      {/* ========================================================= */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl space-y-6 border border-slate-200 relative my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-slate-900" />
                <h3 className="font-serif font-bold text-base text-slate-900 uppercase">
                  Notarial Deed Form Preview — {selectedDocForPreview.type}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDocForPreview(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Canvas */}
            <div className="p-8 sm:p-12 bg-white border-2 border-slate-900 rounded-xl space-y-8 font-serif shadow-inner">
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <div className="font-bold text-lg text-slate-950 uppercase tracking-widest">
                    RÉPUBLIQUE FRANÇAISE
                  </div>
                  <div className="text-xs font-sans text-slate-600 font-semibold uppercase">
                    MINISTÈRE DE LA JUSTICE · NOTARIAT
                  </div>
                  <div className="text-[11px] font-sans font-mono text-slate-500">
                    Etude Notariale Kretz & Associés — Paris / Cannes
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="w-10 h-10 ml-auto bg-slate-950 text-amber-400 font-bold text-xl flex items-center justify-center rounded shadow">
                    K
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">{selectedDocForPreview.id}</div>
                </div>
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold uppercase tracking-wider text-slate-950">
                  {selectedDocForPreview.type}
                </h2>
                <div className="text-xs font-sans text-slate-500 italic">
                  Status: {selectedDocForPreview.status} · Form Ref: {selectedDocForPreview.id}
                </div>
              </div>

              <div className="space-y-4 text-xs font-sans leading-relaxed border-t border-b border-slate-200 py-4">
                <div>
                  <strong className="text-slate-900 font-mono block mb-1">PARTIE DU CLIENT / ACQUÉREUR:</strong>
                  <p className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {selectedDocForPreview.clientName} ({selectedDocForPreview.clientEmail})
                  </p>
                </div>

                <div>
                  <strong className="text-slate-900 font-mono block mb-1">TRANSACTION IMMOBILIÈRE:</strong>
                  <p className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {selectedDocForPreview.transactionTitle || 'Kretz Private Luxury Acquisition'}
                  </p>
                </div>

                {selectedDocForPreview.cadastralId && (
                  <div>
                    <strong className="text-slate-900 font-mono block mb-1">DESIGNATION PARCELLE CADASTRE:</strong>
                    <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono">
                      Parcel Reference: {selectedDocForPreview.cadastralId} · Price: €{selectedDocForPreview.agreedPrice?.toLocaleString()} EUR
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 grid grid-cols-2 gap-6 text-xs font-sans">
                <div className="p-3 border border-dashed border-slate-300 rounded-xl text-center space-y-1">
                  <span className="font-bold block text-[10px] font-mono text-slate-600">
                    Signature du Client
                  </span>
                  <div className="h-8 flex items-center justify-center font-mono text-slate-400 italic text-[11px]">
                    [eIDAS QES Signed]
                  </div>
                </div>

                <div className="p-3 border border-dashed border-slate-300 rounded-xl text-center space-y-1 bg-slate-50">
                  <span className="font-bold block text-[10px] font-mono text-slate-600">
                    Sceau du Notaire
                  </span>
                  <div className="h-8 flex items-center justify-center font-serif font-bold text-amber-900 text-xs">
                    {selectedDocForPreview.notaryName || 'Maître Claire de Saint-Germain'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setSelectedDocForPreview(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl"
              >
                Close Preview
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const content = `DEED FORM: ${selectedDocForPreview.type}\nRef: ${selectedDocForPreview.id}\nClient: ${selectedDocForPreview.clientName}`;
                    safeDownload(new Blob([content], { type: 'text/plain' }), `${selectedDocForPreview.id}.txt`);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Raw Text</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Print Official Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
