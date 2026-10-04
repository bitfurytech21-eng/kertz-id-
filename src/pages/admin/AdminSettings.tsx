import React, { useState } from 'react';
import {
  Settings,
  Lock,
  ShieldCheck,
  Building,
  Bell,
  Key,
  CheckCircle2,
  Save,
  RefreshCw,
} from 'lucide-react';

export const AdminSettings: React.FC<{ navigate: (path: string) => void }> = () => {
  const [notaryOffice, setNotaryOffice] = useState('Etude Notariale Kretz & Associés');
  const [notaryAddress, setNotaryAddress] = useState('12 Place Vendôme, 75001 Paris, France');
  const [tracfinThreshold, setTracfinThreshold] = useState(150000);
  const [autoEmailNotify, setAutoEmailNotify] = useState(true);
  const [require2FA, setRequire2FA] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-300 mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>NOTARIAL OFFICE CONFIGURATION</span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          Portal Security, Encryption & System Settings
        </h1>
        <p className="text-xs text-slate-500">
          Manage notarial office identity, Tracfin compliance thresholds, and AES-256 encryption parameters.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>System configuration updated and encrypted parameters saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Office Identity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-600" />
            <span>Notarial Office Identity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Official Study / Notary Name
              </label>
              <input
                type="text"
                value={notaryOffice}
                onChange={(e) => setNotaryOffice(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Physical Office Address
              </label>
              <input
                type="text"
                value={notaryAddress}
                onChange={(e) => setNotaryAddress(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Security & Tracfin Parameters */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Compliance & Security Controls</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mandatory Tracfin AML Clearance Trigger (€)
              </label>
              <input
                type="number"
                value={tracfinThreshold}
                onChange={(e) => setTracfinThreshold(Number(e.target.value))}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 font-mono font-bold"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Transactions above this amount require formal Source of Funds dossier review.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={require2FA}
                  onChange={(e) => setRequire2FA(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <div className="text-xs">
                  <strong className="text-slate-900 block">Enforce 2FA SMS / OTP for Staff Logins</strong>
                  <span className="text-slate-500">Require eIDAS Level 3 two-factor authentication</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoEmailNotify}
                  onChange={(e) => setAutoEmailNotify(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <div className="text-xs">
                  <strong className="text-slate-900 block">Automated Email Notifications</strong>
                  <span className="text-slate-500">Alert buyers when legal clearance stages update</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Save className="w-4 h-4 text-amber-400" />
          <span>Save Notarial Settings</span>
        </button>
      </form>
    </div>
  );
};
