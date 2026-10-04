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
      {/* Hero Section with Enhanced Animated Luxury Architecture Background */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Animated Background Picture & Light Effects */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {/* High-Resolution Luxury Architectural Photography */}
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2560&q=85"
            alt="Kretz Private Luxury Architecture"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center animate-hero-bg scale-105 opacity-35 filter brightness-85 contrast-125 saturate-110"
          />

          {/* Dynamic Light Sweep Shimmer across architectural facade */}
          <div className="absolute inset-y-0 -inset-x-full w-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent animate-light-sweep pointer-events-none" />

          {/* Deep Slate Vignette & Multilayered Overlays for High-Contrast Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/85" />
          <div className="absolute inset-0 bg-radial-[circle_at_center,_transparent_0%,_rgba(2,6,23,0.85)_80%]" />

          {/* Ambient Platinum & Slate-Blue Light Glows */}
          <div className="absolute -top-24 left-1/4 w-[32rem] h-[32rem] bg-slate-200/10 rounded-full blur-3xl animate-ambient-glow" />
          <div className="absolute -bottom-24 right-1/4 w-[32rem] h-[32rem] bg-blue-500/10 rounded-full blur-3xl animate-ambient-glow [animation-delay:5s]" />

          {/* Subtle Geometric Blueprint Grid Overlay */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs font-mono shadow-inner shadow-black/50 backdrop-blur-md">
            <Lock className="w-3.5 h-3.5 text-slate-300" />
            Confidential Legal Acquisition Workspace for Kretz Buyers
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Private Legal Property <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
              Transaction & Due Diligence
            </span>{' '}
            Platform
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            A dedicated, security-first legal workspace for verified buyers. Define your acquisition criteria, execute exhaustive title checks, manage encrypted legal documentation, and close transactions securely.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {user ? (
              <button
                onClick={() => navigate(user.role === 'CLIENT' ? '/dashboard' : '/admin/dashboard')}
                className="px-6 py-3 bg-white text-slate-950 font-semibold text-sm rounded-lg hover:bg-slate-100 shadow-xl shadow-white/5 active:scale-[0.99] transition-all flex items-center gap-2 border border-white"
              >
                Go to Workspace Dashboard <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-3 bg-white text-slate-950 font-semibold text-sm rounded-lg hover:bg-slate-100 shadow-xl shadow-white/5 active:scale-[0.99] transition-all flex items-center gap-2 border border-white"
                >
                  Create Client Account <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-slate-900/85 text-white font-semibold text-sm rounded-lg hover:bg-slate-800 border border-slate-700/80 backdrop-blur-sm shadow-md active:scale-[0.99] transition-all"
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
            <div className="w-10 h-10 bg-slate-100 text-slate-900 rounded-lg flex items-center justify-center">
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
              <div className="text-slate-300 font-mono text-[11px] font-semibold tracking-wider">STAGE 01</div>
              <div className="font-bold text-white">Requirement Submission</div>
              <p className="text-slate-400 text-[11px]">Define property type, budget, location & intended use.</p>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1.5">
              <div className="text-slate-300 font-mono text-[11px] font-semibold tracking-wider">STAGE 02</div>
              <div className="font-bold text-white">KYC & Document Vault</div>
              <p className="text-slate-400 text-[11px]">Upload encrypted ID, proof of address & source of funds.</p>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1.5">
              <div className="text-slate-300 font-mono text-[11px] font-semibold tracking-wider">STAGE 03</div>
              <div className="font-bold text-white">Legal Due Diligence</div>
              <p className="text-slate-400 text-[11px]">Counsel verifies 30-year title, liens, and zoning clearance.</p>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1.5">
              <div className="text-slate-300 font-mono text-[11px] font-semibold tracking-wider">STAGE 04</div>
              <div className="font-bold text-white">Offer & Terms</div>
              <p className="text-slate-400 text-[11px]">Submit structured offer with tailored legal conditions.</p>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1.5">
              <div className="text-slate-300 font-mono text-[11px] font-semibold tracking-wider">STAGE 05</div>
              <div className="font-bold text-white">Contract E-Sign</div>
              <p className="text-slate-400 text-[11px]">Sign Compromis de Vente with cryptographic certificate.</p>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1.5">
              <div className="text-slate-300 font-mono text-[11px] font-semibold tracking-wider">STAGE 06</div>
              <div className="font-bold text-white">Escrow Settlement</div>
              <p className="text-slate-400 text-[11px]">Notarial escrow confirmation and funds verification.</p>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1.5">
              <div className="text-slate-300 font-mono text-[11px] font-semibold tracking-wider">STAGE 07</div>
              <div className="font-bold text-white">Closing Checklist</div>
              <p className="text-slate-400 text-[11px]">Notarial deed preparation and registration submission.</p>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1.5">
              <div className="text-slate-300 font-mono text-[11px] font-semibold tracking-wider">STAGE 08</div>
              <div className="font-bold text-white">Title Handover</div>
              <p className="text-slate-400 text-[11px]">Final registration number and physical key handover.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
