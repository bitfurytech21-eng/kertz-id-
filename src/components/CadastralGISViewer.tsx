import React, { useState } from 'react';
import {
  MapPin,
  Maximize2,
  Layers,
  Compass,
  Building,
  ShieldCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  Search,
  Info
} from 'lucide-react';
import { CadastralPlotInfo } from '../types';

interface CadastralGISViewerProps {
  cadastralInfo?: CadastralPlotInfo;
  propertyName: string;
  propertyAddress: string;
  cadastralId?: string;
  propertySizeSqm?: number;
}

export const CadastralGISViewer: React.FC<CadastralGISViewerProps> = ({
  cadastralInfo,
  propertyName,
  propertyAddress,
  cadastralId = '75108-08-0142-P',
  propertySizeSqm = 650,
}) => {
  const [viewMode, setViewMode] = useState<'cadastre' | 'satellite' | 'zoning'>('cadastre');
  const [showServitudes, setShowServitudes] = useState(true);
  const [showHeritage, setShowHeritage] = useState(true);
  const [selectedParcel, setSelectedParcel] = useState<string>(cadastralId);

  // Fallback default cadastral data
  const plot: CadastralPlotInfo = cadastralInfo || {
    parcel_id: cadastralId,
    section: '08',
    plot_number: '0142',
    commune: 'Paris 7ème',
    department: '75 - Paris',
    surface_sqm: propertySizeSqm,
    cadastral_sheet: '75107000AP01',
    zoning_code: 'Zone UA (Site Patrimonial Remarquable)',
    heritage_perimeter: true,
    servitudes: [
      'Servitude de vue et de cour commune (Art. 678 C. Civ.)',
      'Périmètre de protection des Monuments Historiques (500m ABF)',
      'Alignement voirie municipale - Conforme',
    ],
    urban_certificate_status: 'GRANTED',
    coordinates: { lat: 48.8584, lng: 2.2945 },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
              Cadastre.gouv.fr Verified Plot
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
              PLU CONFORM
            </span>
          </div>
          <h3 className="font-serif text-lg font-bold text-white">
            Cadastral Boundary & GIS Parcel Survey
          </h3>
          <p className="text-xs text-slate-300">
            Parcel Reference: <span className="font-mono text-amber-300">{plot.parcel_id}</span> • Section {plot.section}, Plot n° {plot.plot_number} ({plot.commune})
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs self-start sm:self-center">
          <button
            onClick={() => setViewMode('cadastre')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              viewMode === 'cadastre' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            Cadastral Plan
          </button>
          <button
            onClick={() => setViewMode('satellite')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              viewMode === 'satellite' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            Orthophoto Satellite
          </button>
          <button
            onClick={() => setViewMode('zoning')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              viewMode === 'zoning' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            PLU Zoning (URBA)
          </button>
        </div>
      </div>

      {/* Main Vector / GIS Canvas Area */}
      <div className="relative bg-slate-950 h-80 sm:h-96 w-full flex items-center justify-center overflow-hidden select-none">
        {/* Background Grid / Satellite Texture */}
        {viewMode === 'satellite' ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80')`,
            }}
          />
        ) : (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />
        )}

        {/* Vector SVG Cadastral Plot Graphic */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400">
          <defs>
            <linearGradient id="plotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.25" />
            </linearGradient>
            <pattern id="heritageHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.3" />
            </pattern>
          </defs>

          {/* Adjacent Surrounding Plots */}
          <polygon points="120,60 280,40 290,140 140,150" fill="#1e293b" fillOpacity="0.6" stroke="#475569" strokeWidth="1.5" />
          <text x="200" y="100" fill="#64748b" fontSize="11" fontFamily="monospace">Parcelle 0140 (185m²)</text>

          <polygon points="490,50 670,70 650,170 480,150" fill="#1e293b" fillOpacity="0.6" stroke="#475569" strokeWidth="1.5" />
          <text x="550" y="110" fill="#64748b" fontSize="11" fontFamily="monospace">Parcelle 0143 (320m²)</text>

          <polygon points="140,270 300,280 290,370 120,360" fill="#1e293b" fillOpacity="0.6" stroke="#475569" strokeWidth="1.5" />
          <text x="190" y="330" fill="#64748b" fontSize="11" fontFamily="monospace">Parcelle 0141 (210m²)</text>

          <polygon points="480,260 660,250 670,360 490,370" fill="#1e293b" fillOpacity="0.6" stroke="#475569" strokeWidth="1.5" />
          <text x="560" y="320" fill="#64748b" fontSize="11" fontFamily="monospace">Parcelle 0144 (280m²)</text>

          {/* Public Highway / Street Vector */}
          <line x1="0" y1="200" x2="800" y2="200" stroke="#334155" strokeWidth="36" />
          <line x1="0" y1="200" x2="800" y2="200" stroke="#94a3b8" strokeDasharray="12,12" strokeWidth="2" />
          <text x="40" y="205" fill="#94a3b8" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
            Voie Publique / Avenue Principale (DPU Actif)
          </text>

          {/* Heritage Protection Perimeter Overlay */}
          {showHeritage && plot.heritage_perimeter && (
            <circle cx="390" cy="200" r="160" fill="url(#heritageHatch)" stroke="#38bdf8" strokeDasharray="6,4" strokeWidth="1.5" />
          )}

          {/* TARGET PROPERTY PARCEL (Section 08, Plot 0142) */}
          <polygon
            points="295,70 480,75 475,325 290,320"
            fill="url(#plotGradient)"
            stroke="#fbbf24"
            strokeWidth="3.5"
            className="cursor-pointer hover:stroke-white transition"
          />

          {/* Target Parcel Highlight Marker */}
          <circle cx="385" cy="195" r="7" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />
          <text x="330" y="160" fill="#ffffff" fontWeight="bold" fontSize="14" fontFamily="serif">
            {propertyName}
          </text>
          <text x="335" y="180" fill="#fde68a" fontWeight="bold" fontSize="12" fontFamily="monospace">
            ★ PARCELLE {plot.plot_number} ({plot.surface_sqm} m²)
          </text>
          <text x="345" y="225" fill="#e2e8f0" fontSize="10" fontFamily="monospace">
            {plot.zoning_code}
          </text>
        </svg>

        {/* Floating GIS Overlay Info Badge */}
        <div className="absolute top-4 left-4 p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 text-white text-xs space-y-1 shadow-lg max-w-xs pointer-events-none">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <Compass className="w-4 h-4" />
            <span>Cadastral GPS Coordinates</span>
          </div>
          <div className="font-mono text-[11px] text-slate-300">
            {plot.coordinates.lat.toFixed(5)}° N, {plot.coordinates.lng.toFixed(5)}° E
          </div>
          <div className="text-[10px] text-slate-400">
            IGN RGE Altimetry • French National Land Registry Authority
          </div>
        </div>

        {/* Floating Layer Controls */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 text-xs">
          <label className="flex items-center gap-1.5 text-slate-200 px-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showHeritage}
              onChange={(e) => setShowHeritage(e.target.checked)}
              className="w-3.5 h-3.5 text-amber-500 rounded"
            />
            <span className="text-[11px]">ABF 500m Monument Perimeter</span>
          </label>
        </div>
      </div>

      {/* Cadastral & Urban Planning Breakdown Grid */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs bg-slate-50/50 border-t border-slate-200">
        <div className="space-y-1.5">
          <span className="font-mono uppercase font-bold text-slate-500 text-[10px]">
            Official Cadastral Sheet & Parcel
          </span>
          <div className="font-bold text-slate-900 text-sm font-mono">{plot.parcel_id}</div>
          <p className="text-slate-500 text-[11px]">
            Sheet: {plot.cadastral_sheet} • Certified Surface: <strong>{plot.surface_sqm} m²</strong>
          </p>
        </div>

        <div className="space-y-1.5">
          <span className="font-mono uppercase font-bold text-slate-500 text-[10px]">
            PLU Urban Planning Zoning
          </span>
          <div className="font-bold text-slate-900 text-sm">{plot.zoning_code}</div>
          <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Certificat d'Urbanisme: {plot.urban_certificate_status}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="font-mono uppercase font-bold text-slate-500 text-[10px]">
            Encumbrances & Servitudes
          </span>
          <div className="space-y-1">
            {plot.servitudes.map((srv, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                <span className="text-amber-500 font-bold">•</span>
                <span>{srv}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
