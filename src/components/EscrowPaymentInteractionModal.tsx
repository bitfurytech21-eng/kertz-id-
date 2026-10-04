import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Building,
  Landmark,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  FileCheck2,
  FileDown,
  Hash,
  Scale,
  DollarSign,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Transaction, Payment } from '../types';
import { api } from '../services/api';
import { StatusBadge } from './StatusBadge';

interface EscrowPaymentInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  payments: Payment[];
  onPaymentSuccess: (updatedTransaction: Transaction) => void;
  initialPayment?: Payment | null;
}

interface StatusUpdateData {
  previous_status: string;
  new_status: string;
  current_step: number;
  amount: number;
  currency: string;
  reference: string;
  confirmed_at: string;
  confirmed_by: string;
  verification_hash: string;
  notary_jurisdiction: string;
}

export const EscrowPaymentInteractionModal: React.FC<EscrowPaymentInteractionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  payments,
  onPaymentSuccess,
  initialPayment,
}) => {
  const defaultDepositAmount = Math.round(transaction.agreed_price * 0.05);

  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(initialPayment?.id || '');
  const [depositType, setDepositType] = useState<'5_PERCENT' | '10_PERCENT' | 'CUSTOM'>('5_PERCENT');
  const [customAmount, setCustomAmount] = useState<string>(String(defaultDepositAmount));
  const [wireReference, setWireReference] = useState<string>(
    `CDC-ESCROW-${transaction.id}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [paymentRail, setPaymentRail] = useState<string>('SEPA Instant Notarial Wire (Banque des Notaires / CDC)');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [statusUpdateResult, setStatusUpdateResult] = useState<StatusUpdateData | null>(null);

  if (!isOpen) return null;

  const currentAmount =
    depositType === '5_PERCENT'
      ? defaultDepositAmount
      : depositType === '10_PERCENT'
      ? Math.round(transaction.agreed_price * 0.1)
      : Number(customAmount) || 0;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExecuteEscrowPayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await api.payments.escrowDeposit(transaction.id, {
        payment_id: selectedPaymentId || undefined,
        amount: currentAmount,
        description:
          depositType === '5_PERCENT'
            ? '5% Notarial Guarantee Escrow Deposit (Caisse des Dépôts)'
            : depositType === '10_PERCENT'
            ? '10% Compromis de Vente Downpayment'
            : 'Custom Milestone Escrow Wire Payment',
        transaction_reference: wireReference.trim(),
        payment_rail: paymentRail,
      });

      setStatusUpdateResult(res.status_update);
      onPaymentSuccess(res.transaction);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process escrow deposit.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!statusUpdateResult) return;
    const content = `
================================================================================
                    RÉPUBLIQUE FRANÇAISE - CHAMBRE DES NOTAIRES
                OFFICIAL NOTARIAL ESCROW RECEIPT & AUDIT CERTIFICATE
================================================================================

TRANSACTION IDENTIFIER:   ${transaction.id}
PROPERTY TARGET:          ${transaction.property_name}
LOCATION:                 ${transaction.property_address}
TOTAL TRANSACTION VALUE:  ${transaction.currency} ${transaction.agreed_price.toLocaleString()}

ESCROW DEPOSIT DETAILS
--------------------------------------------------------------------------------
AMOUNT SECURED:           ${statusUpdateResult.currency} ${statusUpdateResult.amount.toLocaleString()}
ESCROW REFERENCE:         ${statusUpdateResult.reference}
PAYMENT METHOD / RAIL:    ${paymentRail}
BENEFICIARY ACCOUNT:      Caisse des Dépôts et Consignations (CDC)
JURISDICTION:             ${statusUpdateResult.notary_jurisdiction}

TRANSACTION STATUS TRANSITION
--------------------------------------------------------------------------------
PREVIOUS STATUS:          ${statusUpdateResult.previous_status}
NEW SECURED STATUS:       ${statusUpdateResult.new_status} (Step ${statusUpdateResult.current_step}/8)
CONFIRMED AT:             ${new Date(statusUpdateResult.confirmed_at).toLocaleString()}
CONFIRMED BY:             ${statusUpdateResult.confirmed_by}

CRYPTOGRAPHIC VERIFICATION SEAL
--------------------------------------------------------------------------------
VAULT PROOF HASH:         ${statusUpdateResult.verification_hash}
TAMPER-EVIDENT STATUS:    IMMUTABLE • CERTIFIED BY KRETZ LEGAL VAULT

================================================================================
          This document constitutes legally binding proof of escrow deposit.
================================================================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NOTARIAL_ESCROW_RECEIPT_${transaction.id}_${statusUpdateResult.reference}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-950 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Notarial Escrow Wire Interaction
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {transaction.id} • {transaction.property_name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* STEP 1: PAYMENT INTERACTION FORM */}
          {!statusUpdateResult ? (
            <div className="space-y-6">
              {/* Notary Security Notice */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-amber-900">
                  <div className="font-bold flex items-center gap-1.5">
                    Protected Notarial Escrow (Caisse des Dépôts et Consignations)
                  </div>
                  <p className="text-amber-800 leading-relaxed text-[11px]">
                    In French luxury real estate acquisitions, funds are never transferred to private accounts. All escrow deposits are held exclusively in the segregated client accounts of the Banque des Notaires (CDC), legally protected against insolvency.
                  </p>
                </div>
              </div>

              {/* Deposit Milestone Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Escrow Milestone to Execute
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setDepositType('5_PERCENT')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      depositType === '5_PERCENT'
                        ? 'border-slate-950 bg-slate-900 text-white shadow-md ring-2 ring-slate-900'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="text-[11px] font-mono opacity-80">5% Notarial Guarantee</div>
                    <div className="text-base font-bold font-mono mt-1">
                      {transaction.currency} {defaultDepositAmount.toLocaleString()}
                    </div>
                    <span className="text-[10px] mt-1 block opacity-75">Compulsory legal hold</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositType('10_PERCENT')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      depositType === '10_PERCENT'
                        ? 'border-slate-950 bg-slate-900 text-white shadow-md ring-2 ring-slate-900'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="text-[11px] font-mono opacity-80">10% Compromis Deposit</div>
                    <div className="text-base font-bold font-mono mt-1">
                      {transaction.currency} {(Math.round(transaction.agreed_price * 0.1)).toLocaleString()}
                    </div>
                    <span className="text-[10px] mt-1 block opacity-75">Compromis de vente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositType('CUSTOM')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      depositType === 'CUSTOM'
                        ? 'border-slate-950 bg-slate-900 text-white shadow-md ring-2 ring-slate-900'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="text-[11px] font-mono opacity-80">Custom Milestone</div>
                    <div className="text-sm font-bold font-mono mt-1">Custom Amount</div>
                    <span className="text-[10px] mt-1 block opacity-75">Specific wire amount</span>
                  </button>
                </div>

                {depositType === 'CUSTOM' && (
                  <div className="mt-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Custom Escrow Amount ({transaction.currency})
                    </label>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="e.g. 500000"
                      className="w-full text-xs font-mono px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              {/* Escrow Bank Account Reference Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-600" /> Caisse des Dépôts (Banque des Notaires)
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    ESCROW VERIFIED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Beneficiary Account</span>
                    <span className="font-semibold text-slate-900 text-[11px]">Étude Claire de Saint-Germain (CDC)</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Notary Chamber Code</span>
                    <span className="font-mono text-slate-900 font-bold text-[11px]">PARIS-75-9921</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">IBAN (CDC Escrow)</span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-900">
                      <span>FR76 3000 4012 3456 7890 1234 567</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('FR7630004012345678901234567', 'iban')}
                        className="text-slate-400 hover:text-slate-700"
                        title="Copy IBAN"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {copiedField === 'iban' && <span className="text-[9px] text-emerald-600 font-sans">Copied!</span>}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">BIC / SWIFT</span>
                    <span className="font-mono text-slate-900 font-bold text-[11px]">CDCXFRPPXXX</span>
                  </div>
                </div>
              </div>

              {/* Wire Details Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank Transfer Rail
                  </label>
                  <select
                    value={paymentRail}
                    onChange={(e) => setPaymentRail(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  >
                    <option value="SEPA Instant Notarial Wire (Banque des Notaires / CDC)">
                      SEPA Instant Notarial Wire (CDC)
                    </option>
                    <option value="Target2 Real-Time Gross Settlement (RTGS)">
                      Target2 Central Bank Clearing
                    </option>
                    <option value="SWIFT MT103 International Escrow Transfer">
                      SWIFT MT103 (Cross-Border Escrow)
                    </option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Official Escrow Wire Reference
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setWireReference(
                          `CDC-ESCROW-${transaction.id}-${Math.floor(1000 + Math.random() * 9000)}`
                        )
                      }
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-mono"
                    >
                      Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={wireReference}
                    onChange={(e) => setWireReference(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden font-bold text-slate-900"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleExecuteEscrowPayment}
                  disabled={isProcessing || currentAmount <= 0}
                  className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Verifying & Locking Escrow Deposit...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Authorize & Secure Escrow ({transaction.currency} {currentAmount.toLocaleString()})
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: SECURE TRANSACTION STATUS UPDATE UI */
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Status Update Banner */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-6 rounded-2xl border border-emerald-500/30 shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl shadow-md animate-bounce">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                      Transaction Status Updated
                    </span>
                    <h3 className="text-xl font-bold font-serif text-white">
                      Escrow Secured & Stage Advanced
                    </h3>
                  </div>
                </div>

                {/* Status Transition Visualizer */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Previous Stage:</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      {statusUpdateResult.previous_status}
                    </span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-emerald-400 hidden sm:block shrink-0" />

                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 text-[11px]">Current Stage:</span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      {statusUpdateResult.new_status} (Step {statusUpdateResult.current_step}/8)
                    </span>
                  </div>
                </div>
              </div>

              {/* Cryptographic Deposit Voucher Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" /> Official Notarial Escrow Voucher
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(statusUpdateResult.confirmed_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Secured Escrow Wire</span>
                    <span className="text-sm font-bold font-mono text-emerald-700">
                      {statusUpdateResult.currency} {statusUpdateResult.amount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Escrow Wire Reference</span>
                    <span className="font-mono text-slate-900 font-bold">{statusUpdateResult.reference}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Notary Holding Authority</span>
                    <span className="text-slate-800 font-medium">{statusUpdateResult.notary_jurisdiction}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Authorized Officer / Stamp</span>
                    <span className="text-slate-800 font-medium">{statusUpdateResult.confirmed_by}</span>
                  </div>
                </div>

                {/* Cryptographic Seal */}
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                    Cryptographic Verification Seal (SHA-256)
                  </span>
                  <div className="flex items-center justify-between bg-white border border-slate-200 px-3 py-2 rounded-lg text-[11px] font-mono text-slate-700">
                    <span className="truncate mr-2">{statusUpdateResult.verification_hash}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(statusUpdateResult.verification_hash, 'hash')}
                      className="text-slate-400 hover:text-slate-800 shrink-0"
                      title="Copy Seal Hash"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {copiedField === 'hash' && (
                    <span className="text-[10px] text-emerald-600 font-sans mt-0.5 block">
                      Cryptographic seal copied to clipboard!
                    </span>
                  )}
                </div>
              </div>

              {/* Unlocked Milestones Notification */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2">
                <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Automatically Unlocked Legal Milestones
                </span>
                <ul className="text-xs text-emerald-900 space-y-1 pl-4 list-disc text-[11px]">
                  <li>Deposit payment status marked <strong>COMPLETED</strong> in the Closing Checklist.</li>
                  <li>Title transfer dossier and Land Registry Cadastre reservation initialized.</li>
                  <li>Final Authentic Deed (Acte Authentique de Vente) signing unlocked.</li>
                </ul>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <FileDown className="w-4 h-4 text-slate-600" />
                  <span>Download Escrow Receipt (.txt)</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>Continue to Workspace</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
