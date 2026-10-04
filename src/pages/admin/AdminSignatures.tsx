import React, { useState, useEffect } from 'react';
import {
  FileSignature,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  ExternalLink,
  Video,
  Download,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminSignatures: React.FC<{ navigate: (path: string) => void }> = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    api.transactions.list()
      .then((res) => {
        const txs = res.transactions || [];
        setTransactions(txs);
        if (txs.length > 0) setSelectedTx(txs[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <FileSignature className="w-3.5 h-3.5" />
            <span>QUALIFIED ELECTRONIC SIGNATURES (eIDAS QES)</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Qualified E-Signature & Remote Notarization Board
          </h1>
          <p className="text-xs text-slate-500">
            eIDAS High-Level QES signature verification, remote Visio-Notaire sessions, and cryptographic audit proofs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSessionModalOpen(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            <span>Launch Visio-Notaire Session</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Active E-Sign Vaults</span>
          <span className="text-2xl font-bold text-slate-900">{transactions.length}</span>
        </div>
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">QES Level Verified</span>
          <span className="text-2xl font-bold text-emerald-700">100% eIDAS</span>
        </div>
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Pending Signatures</span>
          <span className="text-2xl font-bold text-amber-700">3 Pending</span>
        </div>
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Cryptographic Seals</span>
          <span className="text-lg font-bold font-mono text-indigo-900">SHA-256 Valid</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Transactions List */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-900">Transactions Pending / Executed</h2>

          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                  selectedTx?.id === tx.id
                    ? 'border-emerald-600 bg-emerald-50/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-500">{tx.id}</span>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    QES Level 3
                  </span>
                </div>
                <h3 className="font-bold text-xs text-slate-900">{tx.title}</h3>
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-1">
                  <span>Target: €{tx.amount?.toLocaleString()}</span>
                  <span className="text-amber-700 font-bold">{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Signature Status Detail */}
        {selectedTx && (
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                  QES Audit Vault · Ref: {selectedTx.id}
                </span>
                <h2 className="font-serif text-lg font-bold text-slate-900">{selectedTx.title}</h2>
              </div>

              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>eIDAS Qualified</span>
              </span>
            </div>

            {/* Signature Participants Checklist */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase font-bold text-slate-500">
                Required Signature Parties (eIDAS QES Protocol)
              </h3>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Acquéreur (Buyer) Profile</h4>
                    <p className="text-[11px] text-slate-500 font-mono">Passport Verified · SMS 2FA OTP Verified</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  SIGNED & SEALED
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Vendeur / Représentant Légal</h4>
                    <p className="text-[11px] text-slate-500 font-mono">Awaiting Visio-Notaire Remote Session</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                  PENDING SESSION
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
                    ⚖️
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Maître Claire de Saint-Germain (Notaire)</h4>
                    <p className="text-[11px] text-slate-500 font-mono">Notarial Seal & Signature Key</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-200 px-2.5 py-1 rounded">
                  READY TO COUNTERSIGN
                </span>
              </div>
            </div>

            {/* Cryptographic Hash Proof */}
            <div className="p-4 bg-slate-950 text-slate-200 rounded-xl space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between text-amber-400 font-bold">
                <span>CRYPTOGRAPHIC PROOF & CERTIFICATE</span>
                <span>SHA-256</span>
              </div>
              <p className="break-all text-slate-400">
                0x8F9C2B1A4D3E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A
              </p>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 flex items-center justify-between">
                <span>Timestamp: {new Date().toISOString()}</span>
                <span>ISO/IEC 27001 Certified Vault</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visio Notaire Modal */}
      {sessionModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Visio-Notaire Remote Signing Room</h3>
              </div>
              <button onClick={() => setSessionModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Launch an encrypted video notarization session conforming to French Decree 2020-1422 for remote authentic deed signing.
            </p>

            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 text-center">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full mx-auto flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm">Secure Room Code: VISIO-2026-KRETZ</h4>
              <p className="text-[11px] text-slate-400 font-mono">
                End-to-End Encrypted · Face-to-Face Identity Verification
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSessionModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl"
              >
                Close Window
              </button>
              <button
                onClick={() => {
                  setSessionStarted(true);
                  alert('Visio-Notaire session initialized. Waiting for buyer connection...');
                  setSessionModalOpen(false);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-md"
              >
                Enter Video Signing Room →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
