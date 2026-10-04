import React, { useRef, useState, useEffect } from 'react';
import { X, ShieldCheck, PenTool, Type, RotateCcw, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signatureDataUrl: string, signerName: string, signerRole: string) => Promise<void>;
  documentTitle: string;
  defaultSignerName: string;
  defaultSignerRole?: string;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSign,
  documentTitle,
  defaultSignerName,
  defaultSignerRole = 'BUYER',
}) => {
  const [mode, setMode] = useState<'DRAW' | 'TYPE'>('DRAW');
  const [signerName, setSignerName] = useState(defaultSignerName);
  const [signerRole, setSignerRole] = useState(defaultSignerRole);
  const [typedSignature, setTypedSignature] = useState(defaultSignerName);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    setSignerName(defaultSignerName);
    setTypedSignature(defaultSignerName);
    setError(null);
  }, [defaultSignerName, isOpen]);

  useEffect(() => {
    if (isOpen && mode === 'DRAW' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const generateSignatureImage = (): string => {
    if (mode === 'DRAW') {
      return canvasRef.current?.toDataURL('image/png') || '';
    } else {
      // Render typed signature onto hidden canvas
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'italic 38px "Cinzel", "Times New Roman", serif';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedSignature || signerName, canvas.width / 2, canvas.height / 2);
      }
      return canvas.toDataURL('image/png');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agreed) return;
    if (mode === 'DRAW' && !hasDrawn) {
      setError('Please draw your signature in the signature area.');
      return;
    }
    if (mode === 'TYPE' && !typedSignature.trim()) {
      setError('Please type your legal signature name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataUrl = generateSignatureImage();
      await onSign(dataUrl, signerName, signerRole);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit electronic signature');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600 rounded-md text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Kretz Secure E-Signature Vault</h3>
              <p className="text-xs text-slate-300">Legally Binding Cryptographic Signature</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Document Summary */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div className="text-slate-500 font-medium">Document to Sign:</div>
            <div className="font-semibold text-slate-900">{documentTitle}</div>
            <div className="text-[11px] text-slate-500">
              Audit Record: Timestamped UTC, client IP logged, signed with SHA-256 certificate hash.
            </div>
          </div>

          {/* Signer Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Signer Role
              </label>
              <select
                value={signerRole}
                onChange={(e) => setSignerRole(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              >
                <option value="BUYER">Buyer / Principal</option>
                <option value="LEGAL_REPRESENTATIVE">Legal Representative / Counsel</option>
                <option value="SELLER">Seller / Titleholder</option>
                <option value="NOTARY">Notary / Escrow Officer</option>
              </select>
            </div>
          </div>

          {/* Mode Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">Signature Method</label>
              <div className="flex rounded-md bg-slate-100 p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setMode('DRAW')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
                    mode === 'DRAW' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <PenTool className="w-3 h-3" /> Draw Signature
                </button>
                <button
                  type="button"
                  onClick={() => setMode('TYPE')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
                    mode === 'TYPE' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Type className="w-3 h-3" /> Type Signature
                </button>
              </div>
            </div>

            {/* Drawing Canvas */}
            {mode === 'DRAW' ? (
              <div className="relative border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[140px] cursor-crosshair touch-none bg-white"
                />
                <div className="absolute bottom-2 left-3 text-[10px] text-slate-400 select-none">
                  Draw your legal signature above the baseline
                </div>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="absolute top-2 right-2 text-xs flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded shadow-xs text-slate-600 hover:bg-slate-50"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              </div>
            ) : (
              <div className="border border-slate-300 rounded-lg p-4 bg-slate-50 space-y-3">
                <input
                  type="text"
                  placeholder="Type signature as it appears on legal ID"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-hidden"
                />
                <div className="p-4 bg-white border border-slate-200 rounded-md text-center">
                  <span className="font-serif italic text-2xl text-slate-900 tracking-wide">
                    {typedSignature || 'Signature Preview'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Legal Acknowledgement Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I hereby affirm that this electronic signature is intended to legally execute the agreement in accordance with the Electronic Signatures in Global and National Commerce Act (E-SIGN) and eIDAS Regulation.
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!agreed || isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-xs transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>Signing & Generating Hash...</>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Sign Contract Bilaterally
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
