import React, { useState } from 'react';
import { Lock, Mail, Shield, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password, remember_me: rememberMe });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative">
      {/* Background Ambient Accents */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-950 text-amber-400 rounded-2xl shadow-xl border border-slate-800">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-amber-600 font-semibold block mb-1">
              Private Client Portal
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Sign In to Your Workspace
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Confidential access to your private luxury acquisition dossier, due diligence vaults, and escrow workspace.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white p-7 sm:p-8 border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/5 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Client Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.dupont@kretz.site"
                  className="w-full text-xs pl-9 pr-3.5 py-3 bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-hidden transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[11px] text-slate-600 hover:text-slate-900 font-medium transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs pl-9 pr-10 py-3 bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-hidden transition"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-3 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs text-slate-600">Keep me signed in for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-slate-950/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Encrypted Identity...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Private Workspace</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Client Registration Navigation - No Staff/Legal Scopes */}
        <div className="text-center space-y-3">
          <p className="text-xs text-slate-600">
            Don't have a private buyer account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-slate-900 hover:underline font-bold"
            >
              Register client profile &rarr;
            </button>
          </p>

          <div className="pt-3 flex items-center justify-center gap-4 text-[11px] text-slate-600 font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              256-Bit SSL
            </span>
            <span>•</span>
            <span>Zero-Knowledge Vault</span>
            <span>•</span>
            <span>Direct Notarial Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};
