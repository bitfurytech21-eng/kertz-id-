import React from 'react';
import { Shield, Lock, FileCheck, CheckCircle2, Scale, ArrowRight, Key, FileText, Database, Building, MapPin, Maximize2, Bed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-xs font-mono">
            <Lock className="w-3.5 h-3.5" />
            Confidential Legal Acquisition Workspace for Kretz Buyers
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Private Legal Property <br className="hidden sm:inline" />
            <span className="text-amber-400">Transaction & Due Diligence</span> Platform
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            A dedicated, security-first legal workspace for verified buyers. Define your acquisition criteria, execute exhaustive title checks, manage encrypted legal documentation, and close transactions securely.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {user ? (
              <button
                onClick={() => navigate(user.role === 'CLIENT' ? '/dashboard' : '/admin/dashboard')}
                className="px-6 py-3 bg-slate-800 text-white font-semibold text-sm rounded-lg hover:bg-slate-700 border border-slate-700 shadow-md transition-all flex items-center gap-2"
              >
                Go to Workspace Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-3 bg-amber-400 text-slate-950 font-semibold text-sm rounded-lg hover:bg-amber-300 shadow-md transition-all flex items-center gap-2"
                >
                  Create Client Account <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-slate-800 text-white font-semibold text-sm rounded-lg hover:bg-slate-700 border border-slate-700 transition-all"
                >
                  Sign In to Workspace
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Enterprise Legal Architecture
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Strict client vault isolation and server-side authorization.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Client Vault Isolation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every client operates in an isolated environment. Server-enforced role-based access control prevents any exposure of requirements, documents, payments, or communications.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-900 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">AES-256 Encrypted Documents</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              All passports, deeds, surveys, and bank proofs are encrypted at rest with AES-256-GCM. Downloads utilize temporary, signed single-use HMAC tokens.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-900 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">9-Point Due Diligence Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Systematic verification covering ownership capacity, 30-year title chain, mortgage search, cadastral surveys, lien clearances, municipal pre-emptions, and AML screening.
            </p>
          </div>
        </div>
      </section>

      {/* 8-Stage Lifecycle */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 border border-slate-800">
          <div className="max-w-2xl mb-8 space-y-2">
            <h3 className="font-serif text-2xl font-bold text-white">
              End-to-End Acquisition Lifecycle
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm">
              From requirement submission to final title registration and key handover.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1.5">
              <div className="text-amber-400 font-mono text-[11px]">STAGE 01</div>
              <div className="font-bold text-white">Requirement Submission</div>
              <p className="text-slate-400 text-[11px]">Define property type, budget, location & intended use.</p>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1.5">
              <div className="text-amber-400 font-mono text-[11px]">STAGE 02</div>
              <div className="font-bold text-white">KYC & Document Vault</div>
              <p className="text-slate-400 text-[11px]">Upload encrypted ID, proof of address & source of funds.</p>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1.5">
              <div className="text-amber-400 font-mono text-[11px]">STAGE 03</div>
              <div className="font-bold text-white">Legal Due Diligence</div>
              <p className="text-slate-400 text-[11px]">Counsel verifies 30-year title, liens, and zoning clearance.</p>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1.5">
              <div className="text-amber-400 font-mono text-[11px]">STAGE 04</div>
              <div className="font-bold text-white">Offer & Terms</div>
              <p className="text-slate-400 text-[11px]">Submit structured offer with tailored legal conditions.</p>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1.5">
              <div className="text-amber-400 font-mono text-[11px]">STAGE 05</div>
              <div className="font-bold text-white">Contract E-Sign</div>
              <p className="text-slate-400 text-[11px]">Sign Compromis de Vente with cryptographic certificate.</p>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1.5">
              <div className="text-amber-400 font-mono text-[11px]">STAGE 06</div>
              <div className="font-bold text-white">Escrow Settlement</div>
              <p className="text-slate-400 text-[11px]">Notarial escrow confirmation and funds verification.</p>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1.5">
              <div className="text-amber-400 font-mono text-[11px]">STAGE 07</div>
              <div className="font-bold text-white">Closing Checklist</div>
              <p className="text-slate-400 text-[11px]">Notarial deed preparation and registration submission.</p>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1.5">
              <div className="text-amber-400 font-mono text-[11px]">STAGE 08</div>
              <div className="font-bold text-white">Title Handover</div>
              <p className="text-slate-400 text-[11px]">Final registration number and physical key handover.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
