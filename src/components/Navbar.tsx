import React from 'react';
import { Lock, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, isStaff, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-black border-b border-neutral-800 text-white select-none">
      {/* Top Security Banner */}
      <div className="bg-neutral-950 px-4 py-1 text-[11px] font-mono border-b border-neutral-800 flex items-center justify-between text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-white font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            AES-256 ENCRYPTED
          </span>
          <span className="hidden sm:inline text-neutral-700">|</span>
          <span className="hidden sm:inline">Zero-Knowledge Private Transaction Vault</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          {isStaff ? (
            <span className="text-white font-sans font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Legal Administration
            </span>
          ) : user ? (
            <span className="text-neutral-300 font-sans font-medium flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Verified Buyer Session
            </span>
          ) : null}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => navigate(isStaff ? '/admin/dashboard' : user ? '/dashboard' : '/')}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white text-black font-serif font-bold text-lg flex items-center justify-center rounded border border-neutral-300">
              K
            </div>
            <div className="flex flex-col">
              <span className="font-serif tracking-widest text-base font-bold text-white leading-tight uppercase">
                KRETZ
              </span>
              <span className="text-[10px] tracking-wider text-neutral-400 font-mono font-medium">
                {isStaff ? 'LEGAL & ADMINISTRATIVE CONSOLE' : 'LEGAL PROPERTY WORKSPACE'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        {user && (
          <nav className="hidden md:flex items-center space-x-1 text-xs font-medium">
            {!isStaff ? (
              // Buyer-only navigation routes
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`px-3 py-2 rounded transition-colors ${
                    currentPath === '/dashboard' ? 'bg-white text-black font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/property-request')}
                  className={`px-3 py-2 rounded transition-colors ${
                    currentPath.startsWith('/property-request') ? 'bg-white text-black font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  Property Requirements
                </button>
                <button
                  onClick={() => navigate('/transactions')}
                  className={`px-3 py-2 rounded transition-colors ${
                    currentPath.startsWith('/transactions') ? 'bg-white text-black font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  My Transactions
                </button>
              </>
            ) : (
              // Staff / Legal / Admin navigation routes
              <>
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className={`px-2.5 py-1.5 rounded transition-colors ${
                    currentPath === '/admin/dashboard' ? 'bg-white text-black font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/admin/clients')}
                  className={`px-2.5 py-1.5 rounded transition-colors ${
                    currentPath === '/admin/clients' ? 'bg-white text-black font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  Clients
                </button>
                <button
                  onClick={() => navigate('/admin/property-requests')}
                  className={`px-2.5 py-1.5 rounded transition-colors ${
                    currentPath === '/admin/property-requests' ? 'bg-white text-black font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  Requests
                </button>
                <button
                  onClick={() => navigate('/admin/transactions')}
                  className={`px-2.5 py-1.5 rounded transition-colors ${
                    currentPath.startsWith('/admin/transactions') ? 'bg-white text-black font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  Transactions
                </button>
                <button
                  onClick={() => navigate('/admin/documents')}
                  className={`px-2.5 py-1.5 rounded transition-colors ${
                    currentPath === '/admin/documents' ? 'bg-white text-black font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  Documents
                </button>
                <button
                  onClick={() => navigate('/admin/compliance')}
                  className={`px-2.5 py-1.5 rounded transition-colors border ${
                    currentPath === '/admin/compliance' ? 'bg-white text-black border-white font-bold' : 'text-neutral-300 border-neutral-700 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  Compliance & AML
                </button>
                <button
                  onClick={() => navigate('/admin/legal-review')}
                  className={`px-2.5 py-1.5 rounded transition-colors ${
                    currentPath === '/admin/legal-review' ? 'bg-white text-black font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  Legal Checks
                </button>
                <button
                  onClick={() => navigate('/admin/audit-logs')}
                  className={`px-2.5 py-1.5 rounded transition-colors ${
                    currentPath === '/admin/audit-logs' ? 'bg-white text-black font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  Audit Logs
                </button>
              </>
            )}
          </nav>
        )}

        {/* Right Side: Notifications & User */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NotificationDropdown onNavigate={navigate} />

              <div className="flex items-center gap-2.5 pl-2 border-l border-neutral-800">
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="text-xs font-semibold text-white">
                    {user.profile ? `${user.profile.first_name} ${user.profile.last_name}` : user.email}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {user.role.replace(/_/g, ' ')}
                  </span>
                </div>

                <button
                  onClick={async () => {
                    await logout();
                    navigate(isStaff ? '/admin/login' : '/login');
                  }}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="px-3.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-1.5 text-xs font-bold text-black bg-white border border-white hover:bg-neutral-200 rounded transition-colors"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
