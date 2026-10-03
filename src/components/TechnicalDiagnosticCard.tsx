import React from 'react';
import {
  Zap,
  Flame,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Activity,
  Layers,
  Sparkles,
  Calendar,
  Building
} from 'lucide-react';
import { TechnicalDiagnosticDDT } from '../types';

interface TechnicalDiagnosticCardProps {
  diagnostic?: TechnicalDiagnosticDDT;
  propertySizeSqm?: number;
}

export const TechnicalDiagnosticCard: React.FC<TechnicalDiagnosticCardProps> = ({
  diagnostic,
  propertySizeSqm = 650,
}) => {
  const ddt: TechnicalDiagnosticDDT = diagnostic || {
    dpe_energy_class: 'B',
    dpe_energy_kwh_sqm_year: 82,
    dpe_ghg_class: 'A',
    dpe_ghg_kg_co2_sqm_year: 4,
    carrez_surface_sqm: propertySizeSqm,
    lead_status: 'NEGATIVE',
    asbestos_status: 'NEGATIVE',
    termites_status: 'CLEAR',
    electrical_status: 'CONFORM',
    gas_status: 'CONFORM',
    erp_flood_risk: 'LOW',
    erp_seismic_zone: 'Zone 1 (Très faible)',
    erp_soil_shrinkage: 'LOW',
    diagnostic_company_name: 'Bureau Veritas & Socotec Diagnostics France',
    diagnostic_date: '2026-09-15',
    valid_until: '2036-09-15',
  };

  const DPE_CLASSES = [
    { label: 'A', range: '≤ 70', color: 'bg-emerald-600 text-white' },
    { label: 'B', range: '71 - 110', color: 'bg-emerald-500 text-white' },
    { label: 'C', range: '111 - 180', color: 'bg-lime-500 text-slate-900' },
    { label: 'D', range: '181 - 250', color: 'bg-amber-400 text-slate-900' },
    { label: 'E', range: '251 - 330', color: 'bg-orange-500 text-white' },
    { label: 'F', range: '331 - 420', color: 'bg-rose-500 text-white' },
    { label: 'G', range: '> 420', color: 'bg-red-700 text-white' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              ✓ DDT VALID & AUDITED
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Auditor: {ddt.diagnostic_company_name}
            </span>
          </div>
          <h3 className="font-serif text-lg font-bold text-white">
            Technical Diagnostic Dossier (Dossier de Diagnostic Technique - DDT)
          </h3>
          <p className="text-xs text-slate-300">
            Certified French notarial diagnostics: Energy performance, Loi Carrez surface, electrical safety & environmental risks
          </p>
        </div>

        <div className="text-right text-xs font-mono text-slate-300">
          <div>Audit Date: <strong className="text-white">{ddt.diagnostic_date}</strong></div>
          <div className="text-[11px] text-slate-400">Valid until: {ddt.valid_until}</div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* DPE & GHG Energy Efficiency Dual Rating Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Energy Rating DPE */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Diagnostic de Performance Énergétique (DPE)
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Primary Energy Consumption: <strong>{ddt.dpe_energy_kwh_sqm_year} kWh/m²/year</strong>
                  </span>
                </div>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${
                  ddt.dpe_energy_class === 'A' || ddt.dpe_energy_class === 'B'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 text-slate-950'
                }`}
              >
                {ddt.dpe_energy_class}
              </div>
            </div>

            {/* Visual DPE Scale */}
            <div className="space-y-1">
              {DPE_CLASSES.map((cls) => {
                const isActive = cls.label === ddt.dpe_energy_class;
                return (
                  <div key={cls.label} className="flex items-center gap-2">
                    <div
                      className={`h-5 rounded flex items-center justify-between px-2 text-[10px] font-bold font-mono transition-all ${
                        cls.color
                      } ${isActive ? 'ring-2 ring-slate-900 shadow-sm scale-[1.02]' : 'opacity-40'}`}
                      style={{ width: `${35 + DPE_CLASSES.indexOf(cls) * 10}%` }}
                    >
                      <span>{cls.label}</span>
                      <span>{cls.range}</span>
                    </div>
                    {isActive && (
                      <span className="text-[11px] font-bold text-slate-900 font-mono">
                        ← {ddt.dpe_energy_kwh_sqm_year} kWh/m²
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Greenhouse Gas Emissions (GHG / GES) */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-indigo-500" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Greenhouse Gas Emissions (GES)
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Carbon Footprint: <strong>{ddt.dpe_ghg_kg_co2_sqm_year} kg CO₂/m²/year</strong>
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {ddt.dpe_ghg_class}
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Certified Surface Area (Loi Carrez):</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{ddt.carrez_surface_sqm} m²</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Estimated Annual Energy Cost:</span>
                <span className="font-bold text-emerald-700 font-mono">€ 2,450 – € 3,120 / year</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Insulation & Glazing:</span>
                <span className="font-semibold text-slate-800">Double Glazing Acoustic & Thermal</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6-Point Technical Diagnostics Matrix */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Mandatory French Notarial Diagnostics Verification Matrix
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Amiante (Asbestos)</span>
              <div className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>NEGATIVE</span>
              </div>
              <span className="text-[10px] text-slate-400 block">No asbestos detected</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Plomb (Lead / CREP)</span>
              <div className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>NEGATIVE</span>
              </div>
              <span className="text-[10px] text-slate-400 block">No lead paint detected</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Termites & Pests</span>
              <div className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CLEAR</span>
              </div>
              <span className="text-[10px] text-slate-400 block">No infestation</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Electrical Safety</span>
              <div className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CONFORM</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Schneider compliant</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Gas Installation</span>
              <div className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CONFORM</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Certified safe</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">ERP Natural Risks</span>
              <div className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>LOW RISK</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Zone 1 / Non-flood</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
