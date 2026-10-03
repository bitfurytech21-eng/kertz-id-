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
import { OfflineIndicator } from './components/OfflineIndicator';
import { ErrorDisplay } from './components/ErrorDisplay';

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
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-amber-400 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>INITIALIZING ENCRYPTED LEGAL VAULT...</span>
        </div>
      </div>
    );
  }

  // Parse Path
  const path = currentPath;

  // Render Component based on path
  const renderContent = () => {
    // Public routes
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

    // Client Dashboard
    if (path === '/dashboard') {
      if (!user) return <LoginPage navigate={navigate} />;
      return <DashboardPage navigate={navigate} />;
    }

    // Property Request creation / edit / view
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

    // Transactions list
    if (path === '/transactions') {
      if (!user) return <LoginPage navigate={navigate} />;
      return <TransactionsListPage navigate={navigate} />;
    }

    // Transaction Workspace routes: /transactions/:id, /transactions/:id/documents, etc.
    if (path.startsWith('/transactions/')) {
      if (!user) return <LoginPage navigate={navigate} />;
      const sub = path.replace('/transactions/', '');
      const parts = sub.split('/');
      const txId = parts[0];
      const tab = parts[1] || 'overview';
      return <TransactionWorkspacePage navigate={navigate} transactionId={txId} initialTab={tab} />;
    }

    // Admin & Staff Routes
    if (path.startsWith('/admin')) {
      if (!user) return <LoginPage navigate={navigate} />;
      if (!isStaff) return <ErrorDisplay type="PERMISSION" onNavigateHome={() => navigate('/dashboard')} />;

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
      if (path === '/admin/compliance' || path === '/admin/legal-review') {
        return <AdminComplianceDashboard navigate={navigate} />;
      }
      if (path === '/admin/offers') {
        return <AdminComplianceDashboard navigate={navigate} />;
      }
      if (path === '/admin/audit-logs') {
        return <AdminAuditLogs />;
      }
      return <AdminDashboard navigate={navigate} />;
    }

    // Fallback
    return <LandingPage navigate={navigate} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-200 selection:text-slate-900">
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="flex-1">{renderContent()}</main>
      <OfflineIndicator />

      {/* Footer */}
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
