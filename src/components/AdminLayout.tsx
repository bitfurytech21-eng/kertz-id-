import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Building,
  Briefcase,
  FileText,
  Printer,
  FileCode2,
  Scale,
  FileSignature,
  Search,
  Compass,
  Landmark,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Lock,
  Bell,
  UserCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  navigate: (path: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPath, navigate }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    documents: any[];
    clients: any[];
    transactions: any[];
  }>({ documents: [], clients: [], transactions: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  // Global search trigger
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ documents: [], clients: [], transactions: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [clientsRes, txRes] = await Promise.all([
          api.admin.getClients().catch(() => ({ clients: [] })),
          api.transactions.list().catch(() => ({ transactions: [] })),
        ]);

        const q = searchQuery.toLowerCase();

        const matchedClients = (clientsRes.clients || []).filter(
          (c: any) =>
            c.email?.toLowerCase().includes(q) ||
            `${c.profile?.first_name} ${c.profile?.last_name}`.toLowerCase().includes(q)
        ).slice(0, 4);

        const matchedTx = (txRes.transactions || []).filter(
          (t: any) =>
            t.title?.toLowerCase().includes(q) ||
            t.id?.toLowerCase().includes(q) ||
            t.status?.toLowerCase().includes(q)
        ).slice(0, 4);

        setSearchResults({
          documents: [],
          clients: matchedClients,
          transactions: matchedTx,
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const navGroups = [
    {
      title: 'CORE WORKSPACE',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Clients', path: '/admin/clients', icon: Users },
        { name: 'Properties', path: '/admin/property-requests', icon: Building },
        { name: 'Transactions', path: '/admin/transactions', icon: Briefcase },
      ],
    },
    {
      title: 'LEGAL',
      items: [
        { name: 'Documents', path: '/admin/documents', icon: FileText },
        { name: 'Form Printer', path: '/admin/form-printer', icon: Printer },
        { name: 'Templates', path: '/admin/templates', icon: FileCode2 },
        { name: 'Reviews', path: '/admin/compliance', icon: Scale },
        { name: 'Signatures', path: '/admin/signatures', icon: FileSignature },
      ],
    },
    {
      title: 'REGISTRATION',
      items: [
        { name: 'Title Search', path: '/admin/title-search', icon: Compass },
        { name: 'Registration', path: '/admin/registration', icon: Landmark },
      ],
    },
    {
      title: 'SYSTEM & AUDIT',
      items: [
        { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
        { name: 'Audit Log', path: '/admin/audit-logs', icon: ShieldCheck },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const isItemActive = (itemPath: string) => {
    if (itemPath === '/admin/dashboard' || itemPath === '/admin') {
      return currentPath === '/admin' || currentPath === '/admin/dashboard' || currentPath === '/';
    }
    return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* ========================================================= */}
      {/* 1. TOP HEADER (LOGO | GLOBAL SEARCH | ADMIN PROFILE)      */}
      {/* ========================================================= */}
      <header className="bg-slate-950 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div className="w-8 h-8 bg-amber-400 text-slate-950 font-serif font-bold text-lg flex items-center justify-center rounded-lg shadow-md group-hover:bg-amber-300 transition">
                K
              </div>
              <div className="hidden sm:block">
                <div className="font-serif tracking-widest text-xs font-bold uppercase text-white flex items-center gap-2">
                  <span>KRETZ LEGAL</span>
                  <span className="text-[9px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded font-semibold">
                    STAFF PORTAL
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 tracking-tight">
                  NOTARIAL PROPERTY WORKSPACE
                </div>
              </div>
            </div>
          </div>

          {/* Center Global Search Bar */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-6 relative">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                placeholder="Search documents, titles, clients, transactions..."
                className="w-full bg-slate-900/90 border border-slate-800 text-slate-100 text-xs pl-9 pr-8 py-2 rounded-xl focus:bg-slate-900 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Modal/Dropdown */}
            {isSearchOpen && searchQuery.trim() !== '' && (
              <div className="absolute left-0 right-0 top-11 bg-white text-slate-900 border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto p-3 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-[11px] text-slate-500 font-mono">
                  <span>Search Results for "{searchQuery}"</span>
                  {isSearching && <span className="text-amber-600 animate-pulse">Searching vault...</span>}
                </div>

                {/* Documents Match */}
                {searchResults.documents.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 block px-2">
                      Documents ({searchResults.documents.length})
                    </span>
                    {searchResults.documents.map((doc: any) => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          navigate('/admin/documents');
                        }}
                        className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="font-semibold text-slate-800">{doc.document_type || doc.id}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{doc.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Clients Match */}
                {searchResults.clients.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 block px-2">
                      Clients ({searchResults.clients.length})
                    </span>
                    {searchResults.clients.map((c: any) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          navigate(`/admin/clients/${c.id}`);
                        }}
                        className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-semibold text-slate-800">
                            {c.profile ? `${c.profile.first_name} ${c.profile.last_name}` : c.email}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{c.email}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Transactions Match */}
                {searchResults.transactions.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 block px-2">
                      Transactions ({searchResults.transactions.length})
                    </span>
                    {searchResults.transactions.map((tx: any) => (
                      <div
                        key={tx.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          navigate(`/admin/transactions/${tx.id}`);
                        }}
                        className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-semibold text-slate-800">{tx.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{tx.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.documents.length === 0 &&
                  searchResults.clients.length === 0 &&
                  searchResults.transactions.length === 0 &&
                  !isSearching && (
                    <div className="text-center py-4 text-xs text-slate-500 font-mono">
                      No matching records found in vault.
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Right User Badge & Quick Logout */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2.5 pl-2">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-white">
                    {user.profile ? `${user.profile.first_name} ${user.profile.last_name}` : user.email}
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 flex items-center justify-end gap-1">
                    <UserCheck className="w-3 h-3 text-amber-400" />
                    {user.role.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs">
                  {user.profile?.first_name ? user.profile.first_name[0] : 'A'}
                </div>

                <button
                  onClick={async () => {
                    await logout();
                    navigate('/admin/login');
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition"
                  title="Sign Out of Staff Portal"
                >
                  <LogOut className="w-4 h-4 text-rose-400 hover:text-rose-300" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. BODY CONTAINER (SIDEBAR + MAIN CONTENT AREA)          */}
      {/* ========================================================= */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex items-start">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-64 shrink-0 bg-slate-900 text-slate-300 border-r border-slate-800 min-h-[calc(100vh-4rem)] p-4 space-y-6 sticky top-16 shadow-lg select-none">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 px-3 py-1">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.path);

                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        active
                          ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/10'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {active && <ChevronRight className="w-3.5 h-3.5 text-slate-950" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Footer Security Badge */}
          <div className="pt-4 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 space-y-1 px-3">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>TLS 1.3 / AES-256 Vault</span>
            </div>
            <p className="text-slate-400 leading-tight">
              Confidential Legal Portal • Notarial Clearance Authority
            </p>
          </div>
        </aside>

        {/* MOBILE DRAWER SIDEBAR */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="relative w-72 bg-slate-900 text-slate-300 border-r border-slate-800 h-full p-4 space-y-6 overflow-y-auto z-10 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-amber-400 text-slate-950 font-serif font-bold text-sm flex items-center justify-center rounded">
                    K
                  </div>
                  <span className="font-serif font-bold text-xs text-white uppercase tracking-wider">
                    Staff Navigation
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 px-3 py-1">
                    {group.title}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isItemActive(item.path);

                      return (
                        <button
                          key={item.path}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            navigate(item.path);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            active
                              ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
                            <span>{item.name}</span>
                          </div>
                          {active && <ChevronRight className="w-3.5 h-3.5 text-slate-950" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </aside>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
