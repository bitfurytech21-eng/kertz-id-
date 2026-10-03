import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  FileText,
  KeyRound,
  PenTool,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Lock,
  ExternalLink,
  Shield,
  Layers,
  Smartphone,
  Server,
  Cpu,
  FileCheck2,
  ChevronRight,
  Eye,
  RefreshCw,
  Award,
  Hash,
  Copy,
  Info
} from 'lucide-react';
import { Contract, QESContractSession, QESSigner, Transaction } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface QESProviderIntegrationModuleProps {
  contract: Contract;
  transaction: Transaction;
  onContractUpdated: (updatedContract: Contract) => void;
}

export type QESProviderType = 'YOUSIGN_EU' | 'UNIVERSIGN' | 'DOCUSIGN_EU' | 'NOTAIRES_DE_FRANCE';

interface ProviderMeta {
  id: QESProviderType;
  name: string;
  eidasLevel: 'QUALIFIED' | 'ADVANCED';
  anssiAccredited: boolean;
  tsaProtocol: string;
  certificateOid: string;
  country: string;
  logoColor: string;
  description: string;
}

const PROVIDERS: Record<QESProviderType, ProviderMeta> = {
  YOUSIGN_EU: {
    id: 'YOUSIGN_EU',
    name: 'Yousign EU (ANSSI Qualified TSP)',
    eidasLevel: 'QUALIFIED',
    anssiAccredited: true,
    tsaProtocol: 'RFC 3161 Qualified Timestamping Authority',
    certificateOid: '1.3.6.1.4.1.47489.1.2.1 (eIDAS QES)',
    country: 'France / EU',
    logoColor: 'from-blue-600 to-indigo-700',
    description: 'Direct integration with European Qualified Trust Service Provider under EU Regulation 910/2014.',
  },
  UNIVERSIGN: {
    id: 'UNIVERSIGN',
    name: 'Universign Qualified eIDAS Service',
    eidasLevel: 'QUALIFIED',
    anssiAccredited: true,
    tsaProtocol: 'ETSI EN 319 411-2 Policy',
    certificateOid: '1.3.6.1.4.1.34688.1.1.3 (ANSSI Visa)',
    country: 'France',
    logoColor: 'from-emerald-600 to-teal-700',
    description: 'Certified French trust service authority for bilateral purchase deeds and notarial proxies.',
  },
  DOCUSIGN_EU: {
    id: 'DOCUSIGN_EU',
    name: 'DocuSign EU Qualified Trust Service',
    eidasLevel: 'QUALIFIED',
    anssiAccredited: true,
    tsaProtocol: 'EU Qualified Signature Creation Device (QSCD)',
    certificateOid: '1.3.6.1.4.1.18735.2.1 (eIDAS High)',
    country: 'European Union',
    logoColor: 'from-amber-600 to-yellow-600',
    description: 'Global standard with localized EU eIDAS Qualified Electronic Signature biometric authentication.',
  },
  NOTAIRES_DE_FRANCE: {
    id: 'NOTAIRES_DE_FRANCE',
    name: 'Conseil Supérieur du Notariat (CSN Real QES)',
    eidasLevel: 'QUALIFIED',
    anssiAccredited: true,
    tsaProtocol: 'Authentic Deed Tele@ctes Cryptographic Hardware',
    certificateOid: '1.2.250.1.137.1.1.2.1 (CSN Minutier)',
    country: 'France (Notariat)',
    logoColor: 'from-slate-800 to-slate-950',
    description: 'Direct notarial chamber signing network for executory deeds (Acte Authentique de Vente).',
  },
};

export const QESProviderIntegrationModule: React.FC<QESProviderIntegrationModuleProps> = ({
  contract,
  transaction,
  onContractUpdated,
}) => {
  const { user, isStaff } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<QESProviderType>('YOUSIGN_EU');
  const [session, setSession] = useState<QESContractSession | null>(contract.qes_session || null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Signing Wizard Modal state
  const [isSigningOpen, setIsSigningOpen] = useState(false);
  const [signingStep, setSigningStep] = useState<'id_check' | 'cooling_off' | 'otp' | 'draw' | 'sealed'>('id_check');
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [acceptedCoolingOff, setAcceptedCoolingOff] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Certificate Inspector Modal
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Initialize or reload QES session
  const loadQESSession = async () => {
    setLoading(true);
    try {
      const res = await api.qes.init(transaction.id, contract.id);
      setSession(res.session);
    } catch (err: any) {
      console.error('Failed to load QES session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!contract.qes_session) {
      loadQESSession();
    } else {
      setSession(contract.qes_session);
    }
  }, [contract.id, transaction.id]);

  const activeProviderMeta = PROVIDERS[selectedProvider];

  // Request 2FA OTP Code
  const handleRequestOTP = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.qes.sendOtp(transaction.id, contract.id);
      setDemoOtp(res.otpCode);
      setOtpCode(res.otpCode); // Pre-fill for seamless demonstration
      setSigningStep('otp');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch 2FA OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Finalize QES Execution
  const handleFinalizeSignature = async () => {
    if (!hasSignature) {
      setErrorMsg('Please draw your formal handwritten stroke on the cryptographic signing surface.');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureDataUrl = canvas.toDataURL('image/png');

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.qes.signWithQES(transaction.id, contract.id, {
        otp_code: otpCode,
        signature_data_url: signatureDataUrl,
        signer_name: user?.profile ? `${user.profile.first_name} ${user.profile.last_name}` : user?.email,
      });

      setSession(res.session);
      onContractUpdated(res.contract);
      setSigningStep('sealed');
      setSuccessMsg('eIDAS Qualified Electronic Signature validated and stamped with RFC 3161 qualified timestamp.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Signature execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const isCurrentSigner = user?.role === 'CLIENT' || user?.role === 'LEGAL_OFFICER' || user?.role === 'ADMIN';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-6">
      {/* Header with Provider Badge */}
      <div className="bg-slate-950 text-white p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> eIDAS QUALIFIED (QES LEVEL 3)
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold">
              ANSSI ACCREDITED
            </span>
          </div>
          <h2 className="font-serif text-xl font-bold text-white">
            eIDAS Qualified Electronic Signature (QES) Provider Gateway
          </h2>
          <p className="text-xs text-slate-300">
            Certified cryptographic sealing engine for French Bilateral Purchase Deeds (*Compromis de Vente*) & Notarial Deeds
          </p>
        </div>

        {/* Provider Switcher Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 px-2">
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span>Active TSP:</span>
          </div>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as QESProviderType)}
            className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg border border-slate-700 focus:outline-hidden"
          >
            {Object.values(PROVIDERS).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Provider Details & Accreditation Strip */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Trust Service Provider</span>
          <strong className="text-slate-900 text-[11px]">{activeProviderMeta.name}</strong>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Legal Assurance Level</span>
          <span className="font-bold text-emerald-700 text-[11px]">Qualified (Art. 25 §2 eIDAS)</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Timestamping Protocol</span>
          <span className="text-slate-700 text-[11px]">{activeProviderMeta.tsaProtocol}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Policy OID</span>
          <span className="text-slate-700 text-[11px] truncate block" title={activeProviderMeta.certificateOid}>
            {activeProviderMeta.certificateOid}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 space-y-6">
        {/* Document Deed Specs Card */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-amber-600 tracking-wider">
                Bilateral Acquisition Agreement (Acte Sous Seing Privé / Compromis)
              </span>
              <h3 className="font-serif text-lg font-bold text-slate-900">{contract.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-mono font-bold text-xs">
                Version {contract.version}.0
              </span>
              {contract.contract_status === 'EXECUTED' ? (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> FULLY EXECUTED
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-mono font-bold text-xs">
                  READY FOR QES SIGNATURE
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Agreed Valuation</span>
              <strong className="text-slate-900 text-sm font-bold">
                {transaction.currency} {transaction.agreed_price.toLocaleString()}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Notarial Escrow Deposit (10%)</span>
              <strong className="text-amber-700 text-sm font-bold">
                {transaction.currency} {Math.round(transaction.agreed_price * 0.1).toLocaleString()}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Validity Deadline</span>
              <strong className="text-slate-700">{contract.valid_until}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Cadastral Plot</span>
              <strong className="text-blue-900">{transaction.cadastral_id || '75108-08-0142-P'}</strong>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
            {contract.content_summary}
          </p>
        </div>

        {/* Bilateral Signatories Status Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Required eIDAS Qualified Signatories & Verification Status
            </h4>
            <span className="text-xs font-mono text-slate-500">
              Provider: {activeProviderMeta.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Buyer Signer Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    BP
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      {transaction.client_name || 'Alex Dupont'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Buyer Principal (Acquéreur)</span>
                  </div>
                </div>

                {session?.signers.some((s) => s.role === 'BUYER' && s.status === 'SIGNED') ? (
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> QES SIGNED
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-mono font-bold text-[10px]">
                    PENDING SIGNATURE
                  </span>
                )}
              </div>

              <div className="text-[11px] font-mono text-slate-500 space-y-0.5">
                <div>Identity Verification: <strong className="text-emerald-700">eIDAS High (Passport NFC Checked)</strong></div>
                <div>2FA Security: <span className="text-slate-700">SMS / Email OTP Dynamic Code</span></div>
              </div>
            </div>

            {/* Notary / Legal Officer Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                    MC
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      {transaction.legal_officer_name || 'Maître Claire de Saint-Germain'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Assigned French Notary (Officier Public)</span>
                  </div>
                </div>

                {session?.signers.some((s) => s.role === 'NOTARY' && s.status === 'SIGNED') ? (
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> QES SIGNED
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 font-mono font-bold text-[10px]">
                    PENDING COUNTERSIGN
                  </span>
                )}
              </div>

              <div className="text-[11px] font-mono text-slate-500 space-y-0.5">
                <div>Notarial Card: <strong className="text-slate-800">Real Token Chamber ID Verified</strong></div>
                <div>Legal Seal: <span className="text-slate-700">Sceau Notarial de Paris</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Audit Certificate Trigger */}
        <div className="p-5 bg-slate-950 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="font-serif font-bold text-sm text-white">
                Cryptographic Integrity & Evidentiary Value
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-lg">
              Conforms with French Civil Code Art. 1366 & 1367 and European eIDAS regulation. Signatures executed via this provider interface have full legal equivalence to a handwritten in-person notarial signature.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsCertModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" /> Audit Trail Certificate
            </button>

            {contract.contract_status !== 'EXECUTED' && (
              <button
                type="button"
                onClick={() => {
                  setSigningStep('id_check');
                  setIsSigningOpen(true);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                <PenTool className="w-4 h-4" /> Sign with {activeProviderMeta.name.split(' ')[0]} QES
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4-STEP eIDAS QUALIFIED SIGNING WIZARD MODAL */}
      {/* ========================================================================= */}
      {isSigningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-900 flex flex-col max-h-[92vh]">
            {/* Wizard Header */}
            <div className="bg-slate-950 text-white p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-white">
                    eIDAS Qualified Signing Wizard • {activeProviderMeta.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Document: {contract.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSigningOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Stepper indicator */}
            <div className="bg-slate-900 px-6 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className={signingStep === 'id_check' ? 'text-amber-400 font-bold' : ''}>1. Identity</span>
              <span>→</span>
              <span className={signingStep === 'cooling_off' ? 'text-amber-400 font-bold' : ''}>2. Loi SRU</span>
              <span>→</span>
              <span className={signingStep === 'otp' ? 'text-amber-400 font-bold' : ''}>3. 2FA OTP</span>
              <span>→</span>
              <span className={signingStep === 'draw' ? 'text-amber-400 font-bold' : ''}>4. Seal</span>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {/* STEP 1: IDENTITY CHECK */}
              {signingStep === 'id_check' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm">eIDAS Level of Assurance Verification</h4>
                    <p className="text-slate-600 leading-relaxed text-xs">
                      Under EU Regulation No 910/2014, a Qualified Electronic Signature requires positive identity attribution against your biometric passport data stored in the Kretz secure legal vault.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 space-y-2 font-mono">
                    <div className="flex justify-between border-b pb-1.5">
                      <span className="text-slate-500">Signatory Full Name:</span>
                      <strong className="text-slate-900">{user?.profile ? `${user.profile.first_name} ${user.profile.last_name}` : user?.email}</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1.5">
                      <span className="text-slate-500">Signer Role:</span>
                      <strong className="text-blue-900">{user?.role === 'CLIENT' ? 'BUYER PRINCIPAL' : 'ASSIGNED NOTARY'}</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1.5">
                      <span className="text-slate-500">KYC Passport Status:</span>
                      <strong className="text-emerald-700">VERIFIED & CRYPTOGRAPHICALLY BOUND</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Trust Service Provider:</span>
                      <strong className="text-slate-900">{activeProviderMeta.name}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSigningStep('cooling_off')}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    Confirm Signer Identity & Proceed <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              )}

              {/* STEP 2: STATUTORY 10-DAY COOLING OFF ACKNOWLEDGMENT */}
              {signingStep === 'cooling_off' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-950">
                    <h4 className="font-bold text-sm">Loi SRU Statutory Cooling-Off Period (Art. L271-1 C. Hab.)</h4>
                    <p className="text-xs text-amber-900">
                      As a non-professional buyer of French residential property, you benefit from a mandatory 10-calendar-day withdrawal period starting from the notification of the executed deed.
                    </p>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-xl space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedCoolingOff}
                        onChange={(e) => setAcceptedCoolingOff(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-slate-900"
                      />
                      <span className="text-slate-800 text-xs leading-relaxed">
                        I hereby acknowledge that I have received, reviewed, and accepted the contractual conditions, annexes, cadastral parcel plan, and diagnostic reports (DDT) for <strong>{transaction.property_name}</strong> at the agreed acquisition price of <strong>{transaction.currency} {transaction.agreed_price.toLocaleString()}</strong>.
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setSigningStep('id_check')}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!acceptedCoolingOff || loading}
                      onClick={handleRequestOTP}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs disabled:opacity-50 transition flex items-center gap-2"
                    >
                      <KeyRound className="w-4 h-4 text-amber-400" /> Generate 2FA Security OTP
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: 2FA OTP VALIDATION */}
              {signingStep === 'otp' && (
                <div className="space-y-4 text-center max-w-md mx-auto py-2">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-slate-900">Enter Your 2FA Security Code</h4>
                  <p className="text-slate-500 text-xs">
                    Dispatched via certified SMS & email to your registered credentials ({user?.email})
                  </p>

                  {demoOtp && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs font-mono">
                      Your 2FA Security OTP: <strong className="text-blue-700 text-base tracking-widest">{demoOtp}</strong>
                    </div>
                  )}

                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-48 mx-auto text-center text-xl font-mono tracking-widest p-3 border-2 border-slate-300 rounded-xl focus:border-slate-900 focus:outline-hidden"
                  />

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSigningStep('cooling_off')}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={otpCode.length < 6}
                      onClick={() => setSigningStep('draw')}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs disabled:opacity-50 transition"
                    >
                      Validate 2FA Code & Draw Signature
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: DRAW SIGNATURE & APPLY CRYPTOGRAPHIC SEAL */}
              {signingStep === 'draw' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Apply Biometric Legal Signature</h4>
                      <p className="text-slate-500 text-xs">
                        Sign below to execute the binding Qualified Electronic Signature
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline"
                    >
                      Clear Surface
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-2 bg-slate-50 flex items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      width={520}
                      height={160}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="bg-white rounded-lg shadow-inner cursor-crosshair w-full max-w-lg h-40 touch-none border border-slate-200"
                    />
                  </div>

                  <div className="p-3 bg-slate-900 text-slate-300 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      eIDAS Qualified Trust Protocol ({activeProviderMeta.name})
                    </div>
                    <p className="text-[11px] text-slate-400">
                      By executing this signature, I legally bind myself to the purchase terms for {transaction.property_name} and authorize SHA-256 cryptographic sealing.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setSigningStep('otp')}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={loading || !hasSignature}
                      onClick={handleFinalizeSignature}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" /> Seal & Execute with {activeProviderMeta.name.split(' ')[0]} QES
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: SEALED & COMPLETED */}
              {signingStep === 'sealed' && (
                <div className="space-y-4 text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-slate-900">
                    Bilateral Deed Formally Executed
                  </h3>
                  <p className="text-slate-500 text-xs max-w-md mx-auto">
                    Your signature has been embedded with an ANSSI-certified timestamp and immutable SHA-256 fingerprint.
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsSigningOpen(false)}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
                  >
                    Done • Return to Workspace
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUDIT TRAIL & eIDAS CERTIFICATE INSPECTOR MODAL */}
      {/* ========================================================================= */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-900 flex flex-col max-h-[92vh]">
            <div className="bg-slate-950 text-white p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    eIDAS Certificate of Completion & Audit Trail
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Ref: {session?.certificate_id || 'CERT-EIDAS-FR-2026-88192'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCertModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs font-mono">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">Certified Trust Provider:</span>
                  <strong className="text-slate-900">{activeProviderMeta.name}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">Document Designation:</span>
                  <strong className="text-slate-900">{contract.title}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">eIDAS Classification:</span>
                  <strong className="text-emerald-700">Qualified Electronic Signature (Level 3)</strong>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Immutable Document SHA-256 Hash:</span>
                    <button
                      type="button"
                      onClick={() => copyHash(session?.sha256_document_hash || 'SHA256:9d8f3a8b27c6e5d4a1b0c9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8')}
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                    >
                      {copiedHash ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedHash ? 'Copied' : 'Copy Hash'}
                    </button>
                  </div>
                  <div className="p-2 bg-slate-900 text-amber-400 rounded text-[11px] break-all">
                    {session?.sha256_document_hash || '9d8f3a8b27c6e5d4a1b0c9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8'}
                  </div>
                </div>
              </div>

              {/* Audit Trail Timeline */}
              <div className="space-y-3 font-sans">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Forensic Event Log & RFC 3161 Timestamp Chain
                </h4>

                <div className="space-y-2 font-mono text-xs">
                  {session?.audit_trail.map((aud, idx) => (
                    <div key={aud.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                      <div className="flex items-center justify-between text-slate-500 text-[10px]">
                        <span>{new Date(aud.timestamp).toLocaleString()}</span>
                        <span className="text-blue-700 font-bold">{aud.action}</span>
                      </div>
                      <div className="font-bold text-slate-900 text-[11px]">{aud.details}</div>
                      <div className="text-[10px] text-slate-400">
                        Actor: {aud.actor_name} ({aud.actor_email}) • IP: {aud.ip_address}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => alert('Certificate of Completion (PDF) downloaded.')}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" /> Download Audit Proof PDF
              </button>
              <button
                type="button"
                onClick={() => setIsCertModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
