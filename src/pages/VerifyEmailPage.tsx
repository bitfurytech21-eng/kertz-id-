import React, { useState, useEffect } from 'react';
import { MailCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface VerifyEmailPageProps {
  navigate: (path: string) => void;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ navigate }) => {
  const { verifyEmail, user } = useAuth();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    const emailParam = params.get('email');
    if (codeParam) setCode(codeParam);
    if (emailParam) setEmail(emailParam);
    else if (user?.email) setEmail(user.email);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setError(null);
    setIsSubmitting(true);

    try {
      await verifyEmail(code, email);
      setSuccess(true);
      setTimeout(() => {
        navigate('/property-request');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 border border-slate-200 rounded-xl shadow-xs space-y-6 text-center">
        <div className="inline-flex p-3 bg-blue-50 text-blue-900 rounded-full">
          <MailCheck className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-bold text-slate-900">Verify Email Address</h2>
          <p className="text-xs text-slate-500">
            We have generated a secure 6-digit confirmation code for {email || 'your email account'}.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs space-y-2">
            <div className="flex items-center justify-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              Email Verified Successfully!
            </div>
            <p className="text-[11px]">Redirecting to Property Acquisition Requirement form...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-widest font-mono text-xl py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying Code...' : 'Confirm & Proceed to Dashboard'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
