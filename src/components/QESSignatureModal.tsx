import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  KeyRound,
  PenTool,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Download,
  Lock,
  ExternalLink,
  Shield,
  Layers,
  Smartphone
} from 'lucide-react';
import { Contract, QESContractSession, Transaction } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface QESSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  transaction: Transaction;
  onSignedSuccess: (contract: Contract, session: QESContractSession) => void;
}

export const QESSignatureModal: React.FC<QESSignatureModalProps> = ({
  isOpen,
  onClose,
  contract,
  transaction,
  onSignedSuccess,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'review' | 'otp' | 'sign' | 'complete'>('review');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [session, setSession] = useState<QESContractSession | null>(contract.qes_session || null);
  const [certificateData, setCertificateData] = useState<any | null>(null);

  // Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.qes
        .init(transaction.id, contract.id)
        .then((res) => {
          setSession(res.session);
        })
        .catch((err) => console.error('Failed to init QES session:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, transaction.id, contract.id]);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.qes.sendOtp(transaction.id, contract.id);
      setOtpSent(true);
      setDemoOtpCode(res.otpCode);
      setOtpCode(res.otpCode); // pre-populate for frictionless testing
      setStep('otp');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send 2FA OTP code.');
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

  const handleExecuteQESSignature = async () => {
    if (!hasSignature) {
      setErrorMsg('Please draw your official signature on the cryptographic pad.');
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
      const certRes = await api.qes.getCertificate(transaction.id, contract.id).catch(() => null);
      setCertificateData(certRes);
      setStep('complete');
      onSignedSuccess(res.contract, res.session);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to execute eIDAS Qualified signature.');
    } finally {
      setLoading(false);
    }
  };

  const signerRoleName = user?.role === 'CLIENT' ? 'Buyer (Acquéreur)' : 'Assigned Legal Counsel (Notaire)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-900 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 text-white p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                  eIDAS Qualified Electronic Signature (QES)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                  eIDAS EU / ANSSI Level 3
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Bilateral Purchase Agreement: {contract.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Bar */}
        <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className={`flex items-center gap-1.5 ${step === 'review' ? 'text-amber-400 font-bold' : ''}`}>
            <span>1. Review Deed</span>
          </div>
          <span>→</span>
          <div className={`flex items-center gap-1.5 ${step === 'otp' ? 'text-amber-400 font-bold' : ''}`}>
            <span>2. 2FA Identity OTP</span>
          </div>
          <span>→</span>
          <div className={`flex items-center gap-1.5 ${step === 'sign' ? 'text-amber-400 font-bold' : ''}`}>
            <span>3. Biometric Signature</span>
          </div>
          <span>→</span>
          <div className={`flex items-center gap-1.5 ${step === 'complete' ? 'text-emerald-400 font-bold' : ''}`}>
            <span>4. Cryptographic Seal</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* STEP 1: REVIEW DEED */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Compromis de Vente - Bilateral Terms</span>
                  <span className="font-mono text-[11px] text-slate-500">Document Ref: {contract.id}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Agreed Price</span>
                    <span className="font-bold text-slate-900">
                      {transaction.currency} {transaction.agreed_price.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Deposit (10%)</span>
                    <span className="font-bold text-amber-700">
                      {transaction.currency} {Math.round(transaction.agreed_price * 0.1).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Signer Role</span>
                    <span className="font-bold text-blue-900">{signerRoleName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Validity</span>
                    <span className="font-bold text-slate-700">{contract.valid_until}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-white max-h-56 overflow-y-auto font-sans leading-relaxed text-slate-700">
                <h4 className="font-bold text-slate-900">Legal Agreement Summary & Conditions Suspensives:</h4>
                <p>
                  1. <strong>Object:</strong> Bilateral acquisition agreement between Buyer and Seller for {transaction.property_name}, located at {transaction.property_address} (Cadastre: {transaction.cadastral_id}).
                </p>
                <p>
                  2. <strong>Earnest Escrow Deposit:</strong> 10% of total purchase price deposited into the designated Notarial Escrow Trust Account within 10 banking days of bilateral execution.
                </p>
                <p>
                  3. <strong>Statutory Cooling-off Period (Loi SRU Art. L271-1):</strong> The Buyer benefits from a 10-calendar-day mandatory statutory withdrawal period commencing from the formal delivery of the executed deed.
                </p>
                <p>
                  4. <strong>eIDAS Compliance:</strong> This deed is executed via eIDAS Qualified Electronic Signature (Regulation EU No 910/2014) conferring full evidentiary and binding legal force equivalent to a handwritten signature.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Proceeding to step 2 will generate a secure 6-digit identity authentication code (2FA OTP) to your verified email/phone.
                </span>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleSendOtp}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                Request 2FA Security OTP & Proceed to Signing
              </button>
            </div>
          )}

          {/* STEP 2: 2FA OTP CODE */}
          {step === 'otp' && (
            <div className="space-y-4 max-w-md mx-auto text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-serif font-bold text-base text-slate-900">Enter Your 2FA Security Code</h3>
                <p className="text-slate-500 text-xs mt-1">
                  A 6-digit eIDAS authentication code has been dispatched to your registered credentials ({user?.email})
                </p>
              </div>

              {demoOtpCode && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs font-mono">
                  Your 2FA Security OTP: <strong className="text-blue-700 text-sm tracking-widest">{demoOtpCode}</strong>
                </div>
              )}

              <div className="flex justify-center">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-48 text-center text-xl font-mono tracking-widest p-3 border-2 border-slate-300 rounded-xl focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('review')}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={otpCode.length < 6}
                  onClick={() => setStep('sign')}
                  className="px-6 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold disabled:opacity-50 transition"
                >
                  Verify Code & Draw Signature
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: BIOMETRIC SIGNATURE CANVAS */}
          {step === 'sign' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Draw Your Official Legal Signature</h3>
                  <p className="text-slate-500 text-xs">
                    Sign in the box below using your mouse, trackpad, or touchscreen finger/stylus
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline"
                >
                  Clear Pad
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-2 bg-slate-50 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={180}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="bg-white rounded-lg shadow-inner cursor-crosshair w-full max-w-lg h-44 touch-none border border-slate-200"
                />
              </div>

              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  eIDAS Qualified Legal Attestation
                </div>
                <p className="text-slate-400 text-[11px]">
                  By executing this signature, I {user?.profile ? `${user.profile.first_name} ${user.profile.last_name}` : user?.email} confirm my identity, accept the contract provisions for {transaction.property_name}, and authorize the cryptographic SHA-256 sealing of this bilateral deed.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('otp')}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Back
                </button>

                <button
                  type="button"
                  disabled={loading || !hasSignature}
                  onClick={handleExecuteQESSignature}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md transition flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Apply Qualified Electronic Signature & Seal Deed
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SIGNATURE COMPLETE */}
          {step === 'complete' && (
            <div className="space-y-5 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif font-bold text-xl text-slate-900">
                  Deed Cryptographically Sealed & Verified
                </h3>
                <p className="text-slate-500 text-xs max-w-md mx-auto">
                  Your eIDAS Qualified Electronic Signature has been stamped with ANSSI-certified timestamp and immutable SHA-256 audit fingerprint.
                </p>
              </div>

              {session && (
                <div className="p-4 bg-slate-900 text-white rounded-xl text-left font-mono text-xs space-y-2 border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">eIDAS Certificate ID:</span>
                    <span className="text-amber-400 font-bold">{session.certificate_id}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Trust Service Provider:</span>
                    <span className="text-slate-200">{session.trust_service_provider}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] block">Document SHA-256 Fingerprint:</span>
                    <span className="text-emerald-400 text-[11px] break-all block">{session.sha256_document_hash}</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
              >
                Done • Return to Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
