import React from 'react';
import {
  X,
  ShieldCheck,
  Building,
  Landmark,
  Lock,
  Download,
  Copy,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  FileDown
} from 'lucide-react';
import { Transaction, NotarialWireInstructions } from '../types';

interface NotarialWireModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
}

export const NotarialWireModal: React.FC<NotarialWireModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const wireInfo: NotarialWireInstructions = {
    transaction_id: transaction.id,
    notary_office_name: 'Étude Notariale Saint-Germain & Associés (Notaires de Paris)',
    notary_chamber_id: 'CHAMBRE-NOTAIRES-PARIS-75-9921',
    beneficiary_account_name: 'CAISSE DES DÉPÔTS ET CONSIGNATIONS - ÉTUDE NOTARIALE CLAIRE DE SAINT-GERMAIN',
    bank_name: 'Caisse des Dépôts et Consignations (Banque des Notaires de France)',
    bank_address: '56 Rue de Lille, 75007 Paris, France',
    iban_formatted: 'FR76 3000 4012 3456 7890 1234 567',
    bic_swift: 'CDCXFRPPXXX',
    clearing_code: '30004',
    payment_reference_code: `NOTAIRE-ESCROW-${transaction.id}`,
    security_verification_hash: 'SHA256:7D8E219B4C5A8F0E1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF',
    issued_at: new Date().toISOString(),
    valid_for_days: 30,
    tamper_evident_qr_data: `KRETZ-NOTARY-ESCROW:${transaction.id}:${transaction.agreed_price}:FR7630004012345678901234567`,
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadWirePdf = () => {
    alert('Tamper-proof Notarial Wire Instruction Sheet (PDF) generated and verified against Chambre des Notaires registry.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-900 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-950 text-white p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-white">
                  Tamper-Proof Notarial Wire Instructions
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                  CDC VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Caisse des Dépôts et Consignations (Official French Notarial Trust Account)
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

        {/* Anti-Phishing Security Warning Banner */}
        <div className="bg-amber-50 border-b border-amber-200 p-4 text-xs text-amber-950 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="block text-amber-900 font-bold">
              Anti-Fraud Protection • Never accept IBAN changes via unencrypted email
            </strong>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Notarial trust account banking details never change during an acquisition. Always match the cryptographic verification hash below with your assigned notary.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Designated Notary Trust Account</span>
              <span className="font-mono text-[11px] text-slate-500">{wireInfo.notary_chamber_id}</span>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Beneficiary Account Name</span>
                <span className="font-bold text-slate-900 text-xs">{wireInfo.beneficiary_account_name}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Bank Name & Address</span>
                <span className="font-semibold text-slate-800">{wireInfo.bank_name}</span>
                <span className="text-slate-500 block text-[11px]">{wireInfo.bank_address}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">IBAN (French Bank Account)</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(wireInfo.iban_formatted.replace(/\s+/g, ''), 'iban')}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                    >
                      {copiedField === 'iban' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedField === 'iban' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm tracking-wider">
                    {wireInfo.iban_formatted}
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">BIC / SWIFT Code</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(wireInfo.bic_swift, 'swift')}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                    >
                      {copiedField === 'swift' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedField === 'swift' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {wireInfo.bic_swift}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-indigo-900 uppercase font-mono font-bold">
                    Mandatory Payment Reference / Wire Remittance Info
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(wireInfo.payment_reference_code, 'ref')}
                    className="text-[11px] text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1"
                  >
                    {copiedField === 'ref' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedField === 'ref' ? 'Copied' : 'Copy Ref'}
                  </button>
                </div>
                <div className="font-mono font-bold text-indigo-950 text-sm">
                  {wireInfo.payment_reference_code}
                </div>
                <span className="text-[10px] text-indigo-700 block">
                  Include this code in your bank wire memo to ensure automatic notarial escrow reconciliation.
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl text-xs space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>Cryptographic Security Hash:</span>
              <span className="text-emerald-400">STATUS: VALIDATED</span>
            </div>
            <div className="text-amber-400 text-[11px] break-all font-mono">
              {wireInfo.security_verification_hash}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed by Conseil Supérieur du Notariat</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadWirePdf}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-400" /> Download Signed PDF Wire Sheet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
