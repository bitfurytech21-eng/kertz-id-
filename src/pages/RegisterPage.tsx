import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileCheck,
  Scale,
  Clock,
  ArrowRight,
  ChevronDown,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RegisterPageProps {
  navigate: (path: string) => void;
}

interface CountryOption {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  jurisdiction: 'domestic' | 'international';
  defaultState: string;
}

const COUNTRIES: CountryOption[] = [
  // Domestic / Francophone Core Notarial Jurisdictions
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33', jurisdiction: 'domestic', defaultState: 'Île-de-France' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨', dialCode: '+377', jurisdiction: 'domestic', defaultState: 'Monte Carlo' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', dialCode: '+41', jurisdiction: 'domestic', defaultState: 'Geneva / Vaud' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', dialCode: '+32', jurisdiction: 'domestic', defaultState: 'Brussels-Capital' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', dialCode: '+352', jurisdiction: 'domestic', defaultState: 'Luxembourg City' },

  // International Jurisdictions
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', jurisdiction: 'international', defaultState: 'Greater London' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1', jurisdiction: 'international', defaultState: 'New York' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971', jurisdiction: 'international', defaultState: 'Dubai' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49', jurisdiction: 'international', defaultState: 'Bavaria' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39', jurisdiction: 'international', defaultState: 'Lombardy / Milan' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34', jurisdiction: 'international', defaultState: 'Madrid' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31', jurisdiction: 'international', defaultState: 'North Holland' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', dialCode: '+43', jurisdiction: 'international', defaultState: 'Vienna' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', dialCode: '+353', jurisdiction: 'international', defaultState: 'Dublin' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351', jurisdiction: 'international', defaultState: 'Lisbon' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', dialCode: '+46', jurisdiction: 'international', defaultState: 'Stockholm' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', dialCode: '+47', jurisdiction: 'international', defaultState: 'Oslo' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', dialCode: '+45', jurisdiction: 'international', defaultState: 'Copenhagen' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1', jurisdiction: 'international', defaultState: 'Quebec / Ontario' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65', jurisdiction: 'international', defaultState: 'Central Region' },
  { code: 'HK', name: 'Hong Kong SAR', flag: '🇭🇰', dialCode: '+852', jurisdiction: 'international', defaultState: 'Hong Kong Island' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81', jurisdiction: 'international', defaultState: 'Tokyo' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61', jurisdiction: 'international', defaultState: 'New South Wales' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966', jurisdiction: 'international', defaultState: 'Riyadh' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', dialCode: '+974', jurisdiction: 'international', defaultState: 'Doha' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', dialCode: '+965', jurisdiction: 'international', defaultState: 'Al Asimah' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55', jurisdiction: 'international', defaultState: 'São Paulo' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27', jurisdiction: 'international', defaultState: 'Western Cape' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', dialCode: '+30', jurisdiction: 'international', defaultState: 'Attica' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', dialCode: '+212', jurisdiction: 'international', defaultState: 'Casablanca' },
];

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const { register } = useAuth();

  // Country select mode toggle: 'domestic' (French Notarial Zone) vs 'international' (Global cross-border buyer)
  const [countryMode, setCountryMode] = useState<'domestic' | 'international'>('domestic');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '+33 ',
    password: '',
    confirm_password: '',
    country: 'France',
    state: 'Île-de-France',
    date_of_birth: '1988-06-15',
    target_closing_date: '',
    terms_accepted: false,
  });

  const [datePreset, setDatePreset] = useState<'30' | '60' | '90' | 'custom'>('60');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize target date preset
  React.useEffect(() => {
    applyDatePreset('60');
  }, []);

  const applyDatePreset = (daysStr: '30' | '60' | '90' | 'custom') => {
    setDatePreset(daysStr);
    if (daysStr === 'custom') return;

    const days = parseInt(daysStr, 10);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const formatted = targetDate.toISOString().split('T')[0];
    setFormData((prev) => ({ ...prev, target_closing_date: formatted }));
  };

  const handleCountrySelect = (countryName: string) => {
    const selected = COUNTRIES.find((c) => c.name === countryName);
    if (!selected) {
      setFormData((prev) => ({ ...prev, country: countryName }));
      return;
    }

    setFormData((prev) => {
      // Auto-update dial code if phone starts with a known code or is blank
      let updatedPhone = prev.phone_number;
      if (!updatedPhone || updatedPhone.startsWith('+')) {
        const withoutOldDial = updatedPhone.replace(/^\+\d+\s*/, '');
        updatedPhone = `${selected.dialCode} ${withoutOldDial}`.trim();
      }

      return {
        ...prev,
        country: selected.name,
        state: prev.state || selected.defaultState,
        phone_number: updatedPhone.endsWith(' ') ? updatedPhone : `${updatedPhone} `,
      };
    });
  };

  const handleCountryToggleChange = (mode: 'domestic' | 'international') => {
    setCountryMode(mode);
    if (mode === 'domestic') {
      handleCountrySelect('France');
    } else {
      handleCountrySelect('United Kingdom');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!formData.terms_accepted) {
      setError('You must accept the Terms of Legal Service & Confidentiality Policy.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password,
        country: formData.country,
        state: formData.state,
        date_of_birth: formData.date_of_birth,
        target_closing_date: formData.target_closing_date,
        terms_accepted: formData.terms_accepted,
      });

      // Navigate to email verification with code
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}&code=${res?.verificationCode || ''}`);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter countries for active toggle
  const availableCountries = COUNTRIES.filter((c) =>
    countryMode === 'domestic' ? c.jurisdiction === 'domestic' : true
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* 
        ARCHITECTURAL SPLIT:
        - Left Panel: STATIC & PINNED on desktop (Trust, Legal Standards & Live Stepper)
        - Right Panel: SCROLLABLE on desktop (Interactive Multi-Field Registration Form)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================= */}
        {/* STATIC LEFT PANEL (Sticky on desktop, static orientation) */}
        {/* ========================================================= */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <div className="bg-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
            {/* Subtle glow backdrop */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-slate-700/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white text-black font-serif font-bold text-xl flex items-center justify-center rounded-lg shadow-sm">
                  K
                </div>
                <div>
                  <div className="font-serif tracking-widest text-sm font-bold uppercase text-white leading-none">
                    Kretz Legal
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 tracking-wider mt-1">
                    VERIFIED BUYER ACQUISITION VAULT
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                  Private Client Registration
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Establish your encrypted legal portal for high-value real estate due diligence, notarial escrow oversight, and executed deeds.
                </p>
              </div>

              {/* Registration Stepper Card */}
              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
                <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Registration Workflow</span>
                  <span className="text-slate-300">Phase 1 of 3</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2.5 text-white font-medium">
                    <div className="w-5 h-5 rounded-full bg-white text-black font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      1
                    </div>
                    <span>Civil Identity & Residence Jurisdiction</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 font-mono text-[10px] flex items-center justify-center shrink-0">
                      2
                    </div>
                    <span>Email & Two-Factor OTP Security</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 font-mono text-[10px] flex items-center justify-center shrink-0">
                      3
                    </div>
                    <span>Encrypted Property Vault Access</span>
                  </div>
                </div>
              </div>

              {/* Legal Guarantees */}
              <div className="space-y-3 pt-2 text-xs border-t border-slate-800">
                <div className="flex items-start gap-2.5 text-slate-300">
                  <Shield className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">French Civil Code Compliance:</strong> Civil status verified in compliance with Art. 1108 for binding Compromis de Vente.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-300">
                  <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">AES-256 Vault Isolation:</strong> All identity documents and closing contracts are cryptographically encrypted.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-300">
                  <Scale className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Tracfin AML Protocol:</strong> Automated source-of-funds clearance and notarial escrow routing.
                  </span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-800/80">
                <span>Direct Notarial Escrow</span>
                <span>•</span>
                <span>eIDAS QES Ready</span>
                <span>•</span>
                <span>SSL TLS 1.3</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* SCROLLABLE RIGHT PANEL (Forms with Country Toggle & Date) */}
        {/* ========================================================= */}
        <main className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                Client Legal Profile
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete your civil acquisition profile to unlock the legal transaction workspace
              </p>
            </div>
            <span className="hidden sm:inline-flex px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-mono rounded border border-slate-200">
              Confidential
            </span>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-800 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SECTION 1: PERSONAL CIVIL IDENTITY */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase font-mono tracking-wider">
                <User className="w-3.5 h-3.5 text-slate-700" />
                <span>1. Personal & Civil Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="e.g. Alexandre"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="e.g. de Montmirail"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: DATE CHOOSE (Date of Birth & Target Closing Date) */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase font-mono tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-slate-700" />
                <span>2. Date Chooser & Civil Timeline</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date of Birth Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Date of Birth <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Civil Status</span>
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      name="date_of_birth"
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      min="1920-01-01"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Required by French Notaries for formal title deeds & KYC civil verification.
                  </p>
                </div>

                {/* Target Acquisition / Closing Date Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Target Acquisition Date
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Closing Target</span>
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      name="target_closing_date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.target_closing_date}
                      onChange={(e) => {
                        setDatePreset('custom');
                        handleChange(e);
                      }}
                      className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition"
                    />
                    <Clock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  </div>

                  {/* Quick Date Choose Presets */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 font-mono mr-1">Presets:</span>
                    <button
                      type="button"
                      onClick={() => applyDatePreset('30')}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                        datePreset === '30'
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      30d
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset('60')}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                        datePreset === '60'
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      60d (Standard)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset('90')}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                        datePreset === '90'
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      90d
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: COUNTRY SELECT ON REGISTERING TOGGLE */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase font-mono tracking-wider">
                  <Globe className="w-3.5 h-3.5 text-slate-700" />
                  <span>3. Jurisdiction & Country Select</span>
                </div>

                {/* Country Selection Mode Toggle */}
                <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleCountryToggleChange('domestic')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                      countryMode === 'domestic'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>🇫🇷</span>
                    <span>Domestic French</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCountryToggleChange('international')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                      countryMode === 'international'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>🌍</span>
                    <span>International Buyer</span>
                  </button>
                </div>
              </div>

              {/* Fast Jurisdiction Pills */}
              <div className="space-y-2">
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Quick Jurisdiction Selector:</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    Selected: <strong>{formData.country}</strong>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(countryMode === 'domestic'
                    ? COUNTRIES.filter((c) => c.jurisdiction === 'domestic')
                    : COUNTRIES.slice(0, 10)
                  ).map((c) => {
                    const isSelected = formData.country === c.name;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleCountrySelect(c.name)}
                        className={`px-2.5 py-1 text-xs rounded-md border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white font-medium shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                        <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                          ({c.dialCode})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Country Select Dropdown & State / Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Country of Tax & Civil Residence <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="country"
                      required
                      value={formData.country}
                      onChange={(e) => handleCountrySelect(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-lg appearance-none focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition pr-8"
                    >
                      {availableCountries.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.name} ({c.dialCode})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State / Region / Department <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder={
                        formData.country === 'France'
                          ? 'e.g. Île-de-France, Paris, Alpes-Maritimes'
                          : 'e.g. Greater London, New York, Dubai'
                      }
                      className="w-full text-xs pl-8 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition"
                    />
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: CONTACT & CREDENTIALS */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase font-mono tracking-wider">
                <Lock className="w-3.5 h-3.5 text-slate-700" />
                <span>4. Contact Details & Vault Security</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confidential Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="client@kretz.site"
                      className="w-full text-xs pl-8 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / Mobile (with country dial code) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full text-xs pl-8 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition font-mono"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Master Vault Password (min 8 chars) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      name="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••••••"
                      className="w-full text-xs pl-8 pr-10 py-2.5 bg-slate-50/50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2.5 transition"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      name="confirm_password"
                      autoComplete="new-password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      placeholder="••••••••••••"
                      className="w-full text-xs pl-8 pr-10 py-2.5 bg-slate-50/50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2.5 transition"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* TERMS & PRIVACY */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer select-none p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition">
                <input
                  type="checkbox"
                  required
                  name="terms_accepted"
                  checked={formData.terms_accepted}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  I accept the <strong className="text-slate-900">Kretz Confidential Legal Terms</strong> and{' '}
                  <strong className="text-slate-900">Notarial Vault Due Diligence Agreement</strong>. I consent to encrypted KYC / Tracfin compliance verification and secure transaction communications.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Provisioning Encrypted Legal Vault...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Verify Legal Vault</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </form>

          <div className="text-center space-y-2 pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-600">
              Already have a private account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-slate-900 hover:underline font-bold"
              >
                Sign in to your private workspace &rarr;
              </button>
            </p>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-mono">
              <span>256-Bit SSL</span>
              <span>•</span>
              <span>Zero-Knowledge Vault</span>
              <span>•</span>
              <span>Direct Notarial Protocol</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
