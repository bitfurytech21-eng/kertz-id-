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
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
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

  const path = currentPath;

  const renderContent = () => {
    if (path === '/' || path === '') {
      return <LandingPage navigate={navigate} />;
    }
    if (path === '/login') {
      return <LoginPage navigate={navigate} />;
    }
    if (path === '/register') {
      return <RegisterPage navigate={navigate} />;
    }
    if (path === '/forgot-password') {
      return <ForgotPasswordPage navigate={navigate} />;
    }
    if (path.startsWith('/verify-email')) {
      return <VerifyEmailPage navigate={navigate} />;
    }

    if (path === '/dashboard') {
      if (!user) return <LoginPage navigate={navigate} />;
      return <DashboardPage navigate={navigate} />;
    }

    if (path === '/property-request') {
      if (!user) return <LoginPage navigate={navigate} />;
      return <PropertyRequestFormPage navigate={navigate} />;
    }
    if (path.startsWith('/property-request/edit/')) {
      if (!user) return <LoginPage navigate={navigate} />;
      const id = path.replace('/property-request/edit/', '');
      return <PropertyRequestFormPage navigate={navigate} requestId={id} />;
    }
    if (path.startsWith('/property-request/')) {
      if (!user) return <LoginPage navigate={navigate} />;
      const id = path.replace('/property-request/', '');
      return <PropertyRequestViewPage navigate={navigate} requestId={id} />;
    }

    if (path === '/transactions') {
      if (!user) return <LoginPage navigate={navigate} />;
      return <TransactionsListPage navigate={navigate} />;
    }

    if (path.startsWith('/transactions/')) {
      if (!user) return <LoginPage navigate={navigate} />;
      const sub = path.replace('/transactions/', '');
      const parts = sub.split('/');
      const txId = parts[0];
      const tab = parts[1] || 'overview';
      return <TransactionWorkspacePage navigate={navigate} transactionId={txId} initialTab={tab} />;
    }

    if (path.startsWith('/admin')) {
      if (path === '/admin/login') {
        if (user && isStaff) {
          return <AdminDashboard navigate={navigate} />;
        }
        return <AdminLoginPage navigate={navigate} />;
      }

      if (!user || !isStaff) {
        return <AdminLoginPage navigate={navigate} />;
      }

      if (path === '/admin' || path === '/admin/dashboard') {
        return <AdminDashboard navigate={navigate} />;
      }
      if (path === '/admin/clients') {
        return <AdminClients navigate={navigate} />;
      }
      if (path.startsWith('/admin/clients/')) {
        const clientId = path.replace('/admin/clients/', '');
        return <AdminClients navigate={navigate} selectedClientId={clientId} />;
      }
      if (path === '/admin/property-requests') {
        return <AdminPropertyRequests navigate={navigate} />;
      }
      if (path.startsWith('/admin/property-requests/')) {
        const reqId = path.replace('/admin/property-requests/', '');
        return <PropertyRequestViewPage navigate={navigate} requestId={reqId} />;
      }
      if (path === '/admin/transactions') {
        return <TransactionsListPage navigate={navigate} />;
      }
      if (path.startsWith('/admin/transactions/')) {
        const txId = path.replace('/admin/transactions/', '');
        return <TransactionWorkspacePage navigate={navigate} transactionId={txId} initialTab="overview" />;
      }
      if (path === '/admin/documents') {
        return <AdminDocuments navigate={navigate} />;
      }
      if (path === '/admin/compliance' || path === '/admin/legal-review' || path === '/admin/offers') {
        return <AdminComplianceDashboard navigate={navigate} />;
      }
      if (path === '/admin/audit-logs') {
        return <AdminAuditLogs />;
      }
      return <AdminDashboard navigate={navigate} />;
    }

    return <LandingPage navigate={navigate} />;
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
