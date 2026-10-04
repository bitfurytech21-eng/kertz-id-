import React, { useState } from 'react';
import {
  Compass,
  Search,
  Building,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Landmark,
  Layers,
} from 'lucide-react';
import { CadastralGISViewer } from '../../components/CadastralGISViewer';

export const AdminTitleSearch: React.FC<{ navigate: (path: string) => void }> = () => {
  const [parcelQuery, setParcelQuery] = useState('AH-102');
  const [commune, setCommune] = useState('06029 - CANNES');
  const [isSearching, setIsSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setSearchDone(true);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>LAND REGISTRY & TITLE SEARCH ENGINE</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Cadastral Title Search & Mortgage Registry Verification
          </h1>
          <p className="text-xs text-slate-500">
            Official Land Registry (Service de la Publicité Foncière) search, 30-year title ownership history, and municipal encumbrance audit.
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Cadastral Parcel Reference Number
            </label>
            <input
              type="text"
              required
              value={parcelQuery}
              onChange={(e) => setParcelQuery(e.target.value)}
              placeholder="e.g. Section AH Parcel 102 or 000-AH-102"
              className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 font-mono"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Commune / Municipality Code
            </label>
            <select
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 font-medium"
            >
              <option value="06029 - CANNES">06029 - CANNES (Alpes-Maritimes)</option>
              <option value="75108 - PARIS 8E">75108 - PARIS 8ème (Île-de-France)</option>
              <option value="83119 - SAINT-TROPEZ">83119 - SAINT-TROPEZ (Var)</option>
              <option value="06083 - NICE">06083 - NICE (Alpes-Maritimes)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <span>Querying Land Registry...</span>
              ) : (
                <>
                  <Search className="w-4 h-4 text-amber-400" />
                  <span>Execute Title Search</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Search Results Display */}
      {searchDone && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Cadastral & Encumbrances Report */}
          <div className="lg:col-span-7 space-y-6">
            {/* Title Certificate Box */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-slate-900">
                      Cadastral Parcel {parcelQuery} — Clear Title Verified
                    </h2>
                    <p className="text-xs text-slate-500 font-mono">
                      Service de la Publicité Foncière de {commune.split('-')[1]}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-mono font-bold rounded-lg">
                  UNENCUMBERED
                </span>
              </div>

              {/* Parcel Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase block">Surface Area</span>
                  <span className="font-bold text-slate-900">1,420 m²</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase block">Cadastral Value</span>
                  <span className="font-bold text-slate-900">€2,450,000</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase block">Zoning Code</span>
                  <span className="font-bold text-slate-900">Zone Ua (Urban)</span>
                </div>
              </div>

              {/* 30-Year Ownership Chain */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-mono font-bold uppercase text-slate-500">
                  30-Year Ownership & Title Deed Trace
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 block">2018 – Present: Private Owner (Current Seller)</strong>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Notarial Deed Volume 2018P, No. 4102 · Etude Kretz Paris
                      </span>
                    </div>
                    <span className="text-emerald-700 font-mono font-bold text-[11px]">ACTIVE DEED</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 block">2002 – 2018: SCI Montfleury Investment</strong>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Notarial Deed Volume 2002P, No. 1820
                      </span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">ARCHIVED</span>
                  </div>
                </div>
              </div>

              {/* Encumbrances & Pre-emption Rights Check */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-mono font-bold uppercase text-slate-500">
                  Encumbrance & Municipal Right of Pre-emption Audit
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Mortgages & Liens</span>
                    </span>
                    <p className="text-[11px] text-emerald-800 leading-snug">
                      No active mortgage liens or judicial seizures recorded on parcel.
                    </p>
                  </div>

                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Municipal DPU / SAFER</span>
                    </span>
                    <p className="text-[11px] text-emerald-800 leading-snug">
                      Purged pre-emption waiver certificate received from Mayor's Office.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right GIS GIS Parcel Viewer */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Interactive Cadastral GIS Viewer</span>
              </h2>

              <CadastralGISViewer
                propertyName={`Cadastral Plot ${parcelQuery}`}
                propertyAddress={commune}
                cadastralId={parcelQuery}
                propertySizeSqm={1420}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
