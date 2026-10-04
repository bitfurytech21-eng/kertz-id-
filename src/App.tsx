import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { DashboardPage } from './pages/DashboardPage';
import { PropertyRequestFormPage } from './pages/PropertyRequestFormPage';
import { PropertyRequestViewPage } from './pages/PropertyRequestViewPage';
import { TransactionsListPage } from './pages/TransactionsListPage';
import { TransactionWorkspacePage } from './pages/TransactionWorkspacePage';
import {
  AdminDashboard,
  AdminClients,
  AdminPropertyRequests,
  AdminDocuments,
  AdminAuditLogs,
} from './pages/admin/AdminPages';
import { AdminComplianceDashboard } from './pages/admin/AdminComplianceDashboard';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { OfflineIndicator } from './components/OfflineIndicator';

function Router() {
  const { user, isLoading, isStaff } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return (window.location.pathname || '/') + (window.location.search || '') + (window.location.hash || '');
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath((window.location.pathname || '/') + (window.location.search || '') + (window.location.hash || ''));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    const safePath = path.startsWith('/') ? path : `/${path}`;
    window.history.pushState({}, '', safePath);
    setCurrentPath(safePath);
    window.scrollTo(0, 0);
  };

  const [forceReady, setForceReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setForceReady(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading && !forceReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200 font-mono text-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span className="tracking-wider">INITIALIZING ENCRYPTED LEGAL VAULT...</span>
        </div>
        <button
          onClick={() => setForceReady(true)}
          className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] transition"
        >
          Proceed to Sign In &rarr;
        </button>
      </div>
    );
  }

  // Normalize path by stripping query params, hash, and trailing slashes
  const rawPath = currentPath.split('#')[0];
  const [pathOnly] = rawPath.split('?');
  const normalizedPath = (pathOnly === '/' ? '/' : pathOnly.replace(/\/+$/, '')) || '/';

  const renderContent = () => {
    if (normalizedPath === '/' || normalizedPath === '') {
      return <LandingPage navigate={navigate} />;
    }
    if (normalizedPath === '/login') {
      if (user) {
        return isStaff ? <AdminDashboard navigate={navigate} /> : <DashboardPage navigate={navigate} />;
      }
      return <LoginPage navigate={navigate} />;
    }
    if (normalizedPath === '/register') {
      if (user) {
        return isStaff ? <AdminDashboard navigate={navigate} /> : <DashboardPage navigate={navigate} />;
      }
      return <RegisterPage navigate={navigate} />;
    }
    if (normalizedPath === '/forgot-password') {
      return <ForgotPasswordPage navigate={navigate} />;
    }
    if (normalizedPath === '/verify-email' || normalizedPath.startsWith('/verify-email')) {
      return <VerifyEmailPage navigate={navigate} />;
    }

    if (normalizedPath === '/dashboard') {
      if (!user) return <LoginPage navigate={navigate} />;
      if (isStaff) return <AdminDashboard navigate={navigate} />;
      return <DashboardPage navigate={navigate} />;
    }

    if (normalizedPath === '/property-request') {
      if (!user) return <LoginPage navigate={navigate} />;
      return <PropertyRequestFormPage navigate={navigate} />;
    }
    if (normalizedPath.startsWith('/property-request/edit/')) {
      if (!user) return <LoginPage navigate={navigate} />;
      const id = normalizedPath.replace('/property-request/edit/', '');
      return <PropertyRequestFormPage navigate={navigate} requestId={id} />;
    }
    if (normalizedPath.startsWith('/property-request/')) {
      if (!user) return <LoginPage navigate={navigate} />;
      const id = normalizedPath.replace('/property-request/', '');
      return <PropertyRequestViewPage navigate={navigate} requestId={id} />;
    }

    if (normalizedPath === '/transactions') {
      if (!user) return <LoginPage navigate={navigate} />;
      return <TransactionsListPage navigate={navigate} />;
    }

    if (normalizedPath.startsWith('/transactions/')) {
      if (!user) return <LoginPage navigate={navigate} />;
      const sub = normalizedPath.replace('/transactions/', '');
      const parts = sub.split('/');
      const txId = parts[0];
      const tab = parts[1] || 'overview';
      return <TransactionWorkspacePage navigate={navigate} transactionId={txId} initialTab={tab} />;
    }

    // Admin & Staff Navigation Routes
    if (normalizedPath.startsWith('/admin')) {
      if (normalizedPath === '/admin/login') {
        if (user && isStaff) {
          return <AdminDashboard navigate={navigate} />;
        }
        return <AdminLoginPage navigate={navigate} />;
      }

      if (!user || !isStaff) {
        return <AdminLoginPage navigate={navigate} />;
      }

      if (normalizedPath === '/admin' || normalizedPath === '/admin/dashboard') {
        return <AdminDashboard navigate={navigate} />;
      }
      if (normalizedPath === '/admin/clients') {
        return <AdminClients navigate={navigate} />;
      }
      if (normalizedPath.startsWith('/admin/clients/')) {
        const clientId = normalizedPath.replace('/admin/clients/', '');
        return <AdminClients navigate={navigate} selectedClientId={clientId} />;
      }
      if (normalizedPath === '/admin/property-requests') {
        return <AdminPropertyRequests navigate={navigate} />;
      }
      if (normalizedPath.startsWith('/admin/property-requests/')) {
        const reqId = normalizedPath.replace('/admin/property-requests/', '');
        return <PropertyRequestViewPage navigate={navigate} requestId={reqId} />;
      }
      if (normalizedPath === '/admin/transactions') {
        return <TransactionsListPage navigate={navigate} />;
      }
      if (normalizedPath.startsWith('/admin/transactions/')) {
        const sub = normalizedPath.replace('/admin/transactions/', '');
        const parts = sub.split('/');
        const txId = parts[0];
        const tab = parts[1] || 'overview';
        return <TransactionWorkspacePage navigate={navigate} transactionId={txId} initialTab={tab} />;
      }
      if (normalizedPath === '/admin/documents') {
        return <AdminDocuments navigate={navigate} />;
      }
      if (normalizedPath === '/admin/compliance' || normalizedPath === '/admin/legal-review' || normalizedPath === '/admin/offers') {
        return <AdminComplianceDashboard navigate={navigate} />;
      }
      if (normalizedPath === '/admin/audit-logs') {
        return <AdminAuditLogs />;
      }
      return <AdminDashboard navigate={navigate} />;
    }

    // High-fidelity 404 Route Fallback
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center font-serif text-2xl font-bold shadow-xl">
          404
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-slate-900">Page Not Found</h2>
          <p className="text-xs text-slate-500 font-mono">
            The requested path <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{normalizedPath}</span> could not be found or has been relocated.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(isStaff ? '/admin/dashboard' : user ? '/dashboard' : '/')}
            className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition"
          >
            &larr; Return to {isStaff ? 'Admin Console' : user ? 'Workspace Dashboard' : 'Home'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-800 selection:text-white">
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="flex-1">{renderContent()}</main>
      <OfflineIndicator />

      <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-white tracking-widest uppercase">KRETZ</span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] text-slate-400">
              Confidential Legal Property Transaction Workspace • kretz.site
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
            <span>TLS 1.3 Encryption</span>
            <span>•</span>
            <span>AES-256 Vault</span>
            <span>•</span>
            <span>eIDAS Compliant E-Sign</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
