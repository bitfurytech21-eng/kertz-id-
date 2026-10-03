import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, AlertCircle, ArrowRight, ShieldCheck, Scale, Briefcase, UserCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AdminLoginPageProps {
  navigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ navigate }) => {
  const { login, demoSwitch } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password, remember_me: rememberMe });
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid officer credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStaffDemo = async (role: UserRole) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await demoSwitch(role);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Staff demo login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-slate-900/5">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-slate-950 text-emerald-400 rounded-xl shadow-lg border border-slate-800">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-950">
            Legal & Staff Administration Portal
          </h2>
          <p className="text-xs text-slate-500">
            Authorized Legal Counsel, Transaction Officers & System Administrators
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white p-8 border border-slate-300 rounded-xl shadow-md space-y-5">
          <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Staff activity is recorded in tamper-evident audit logs.</span>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Staff Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maitre.claire@kretz.site"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden font-mono"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs text-slate-600">Secure Staff Session (8 hours)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying Credentials...' : 'Authenticate to Staff Portal'}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <p className="text-center text-xs text-slate-600">
          Looking for Buyer Account login?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-800 font-semibold underline"
          >
            Go to Buyer Portal Login
          </button>
        </p>
      </div>
    </div>
  );
};
