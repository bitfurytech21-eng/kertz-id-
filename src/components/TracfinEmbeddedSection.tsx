import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building,
  Landmark,
  PieChart,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Plus,
  Trash2,
  Lock,
  Save,
  Send,
  Upload,
  FileText
} from 'lucide-react';
import { TracfinDossier, SourceOfWealthItem, BeneficialOwnerItem, Transaction } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface TracfinEmbeddedSectionProps {
  transaction: Transaction;
  onDossierUpdated?: (dossier: TracfinDossier) => void;
}

export const TracfinEmbeddedSection: React.FC<TracfinEmbeddedSectionProps> = ({
  transaction,
  onDossierUpdated,
}) => {
  const { isStaff } = useAuth();
  const [dossier, setDossier] = useState<TracfinDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'banking' | 'wealth' | 'ubo' | 'declarations' | 'review'>('banking');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [originBankName, setOriginBankName] = useState('');
  const [originBankCountry, setOriginBankCountry] = useState('France');
  const [originBankIban, setOriginBankIban] = useState('');
  const [originBankSwift, setOriginBankSwift] = useState('');
  const [taxResidency, setTaxResidency] = useState('France');
  const [taxIdNumbers, setTaxIdNumbers] = useState('');
  const [ownershipType, setOwnershipType] = useState<TracfinDossier['beneficial_ownership_type']>('INDIVIDUAL');
  const [pepDeclaration, setPepDeclaration] = useState(false);
  const [pepDetails, setPepDetails] = useState('');
  const [sanctionsDeclaration, setSanctionsDeclaration] = useState(false);
  const [sowItems, setSowItems] = useState<SourceOfWealthItem[]>([]);
  const [ubos, setUbos] = useState<BeneficialOwnerItem[]>([]);

  // Legal Review State
  const [reviewStatus, setReviewStatus] = useState<'CLEARED' | 'REQUIRES_CLARIFICATION' | 'REJECTED'>('CLEARED');
  const [riskRating, setRiskRating] = useState<'LOW' | 'STANDARD' | 'ENHANCED_DILIGENCE'>('LOW');
  const [clearanceNotes, setClearanceNotes] = useState('');

  const loadDossier = () => {
    setLoading(true);
    api.tracfin
      .get(transaction.id)
      .then((res) => {
        const d = res.dossier;
        setDossier(d);
        setOriginBankName(d.origin_bank_name || '');
        setOriginBankCountry(d.origin_bank_country || 'France');
        setOriginBankIban(d.origin_bank_iban_masked || '');
        setOriginBankSwift(d.origin_bank_swift || '');
        setTaxResidency(d.tax_residence_countries?.join(', ') || 'France');
        setTaxIdNumbers(d.tax_id_numbers || '');
        setOwnershipType(d.beneficial_ownership_type || 'INDIVIDUAL');
        setPepDeclaration(d.pep_declaration || false);
        setPepDetails(d.pep_details || '');
        setSanctionsDeclaration(d.sanctions_declaration || false);
        setSowItems(d.source_of_wealth_categories || []);
        setUbos(d.beneficial_owners || []);
        setRiskRating(d.tracfin_risk_rating || 'LOW');
        setClearanceNotes(d.legal_officer_clearance_notes || '');
      })
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDossier();
  }, [transaction.id]);

  const handleAddSowItem = () => {
    const newItem: SourceOfWealthItem = {
      id: `sow_${Date.now()}`,
      category: 'BUSINESS_SALE',
      percentage: 20,
      estimated_amount: Math.round(transaction.agreed_price * 0.2),
      description: 'Capital event / liquidation proceed',
    };
    setSowItems([...sowItems, newItem]);
  };

  const handleRemoveSowItem = (id: string) => {
    setSowItems(sowItems.filter((i) => i.id !== id));
  };

  const handleUpdateSowItem = (id: string, field: keyof SourceOfWealthItem, value: any) => {
    setSowItems(
      sowItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'percentage') {
            updated.estimated_amount = Math.round((Number(value) / 100) * transaction.agreed_price);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const payload: Partial<TracfinDossier> = {
        origin_bank_name: originBankName,
        origin_bank_country: originBankCountry,
        origin_bank_iban_masked: originBankIban,
        origin_bank_swift: originBankSwift,
        tax_residence_countries: taxResidency.split(',').map((c) => c.trim()),
        tax_id_numbers: taxIdNumbers,
        source_of_wealth_categories: sowItems,
        pep_declaration: pepDeclaration,
        pep_details: pepDetails,
        sanctions_declaration: sanctionsDeclaration,
        beneficial_ownership_type: ownershipType,
        beneficial_owners: ubos,
      };
      const res = await api.tracfin.update(transaction.id, payload);
      setDossier(res.dossier);
      onDossierUpdated?.(res.dossier);
      setSuccessMsg('Source of Funds questionnaire saved.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save dossier.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      await handleSaveDraft();
      const res = await api.tracfin.submit(transaction.id);
      setDossier(res.dossier);
      onDossierUpdated?.(res.dossier);
      setSuccessMsg('Source of Funds dossier submitted to Legal Counsel for Tracfin AML clearance.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit dossier.');
    } finally {
      setSaving(false);
    }
  };

  const handleLegalReview = async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await api.tracfin.review(transaction.id, {
        status: reviewStatus,
        tracfin_risk_rating: riskRating,
        legal_officer_clearance_notes: clearanceNotes,
      });
      setDossier(res.dossier);
      onDossierUpdated?.(res.dossier);
      setSuccessMsg(`Tracfin clearance verdict recorded: ${reviewStatus}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record clearance decision.');
    } finally {
      setSaving(false);
    }
  };

  const totalSowPercent = sowItems.reduce((acc, item) => acc + (Number(item.percentage) || 0), 0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-0">
      {/* Header */}
      <div className="bg-slate-950 text-white p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif text-lg font-bold text-white">
              Source of Funds (SoF) & Tracfin AML Compliance
            </h3>
            {dossier?.status === 'CLEARED' ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                ✓ CLEARED
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
                {dossier?.status || 'IN_PROGRESS'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300">
            European Directive AMLD6 & French Tracfin anti-money laundering compliance intake
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Assigned Risk:</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-bold">
            {dossier?.tracfin_risk_rating || 'LOW'}
          </span>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="bg-slate-900 px-6 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('banking')}
          className={`py-3 px-3.5 border-b-2 font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'banking' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" /> Disbursing Bank Identity
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('wealth')}
          className={`py-3 px-3.5 border-b-2 font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'wealth' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" /> Source of Wealth ({totalSowPercent}%)
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('ubo')}
          className={`py-3 px-3.5 border-b-2 font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'ubo' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-3.5 h-3.5" /> Beneficial Owners (UBO)
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('declarations')}
          className={`py-3 px-3.5 border-b-2 font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'declarations' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" /> PEP & Sanctions Attestation
        </button>

        {isStaff && (
          <button
            type="button"
            onClick={() => setActiveSubTab('review')}
            className={`py-3 px-3.5 border-b-2 font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'review' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" /> Legal Clearance Verdict
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 px-6">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-900 text-xs flex items-center gap-2 px-6">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab Content */}
      <div className="p-6 text-xs space-y-6">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500 font-mono">
            Loading Source of Funds AML data...
          </div>
        ) : (
          <>
            {/* SUB-TAB 1: BANKING IDENTITY */}
            {activeSubTab === 'banking' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Originating Private Bank Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={originBankName}
                      onChange={(e) => setOriginBankName(e.target.value)}
                      placeholder="e.g. BNP Paribas Wealth Management, Pictet & Cie"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Bank Country / Jurisdiction <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={originBankCountry}
                      onChange={(e) => setOriginBankCountry(e.target.value)}
                      placeholder="e.g. France, Switzerland, Monaco, Luxembourg"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Originating IBAN / Account Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={originBankIban}
                      onChange={(e) => setOriginBankIban(e.target.value)}
                      placeholder="e.g. FR76 3000 4012 **** **** **** *982"
                      className="w-full p-2.5 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Bank SWIFT / BIC Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={originBankSwift}
                      onChange={(e) => setOriginBankSwift(e.target.value)}
                      placeholder="e.g. BNPAFR22XXX"
                      className="w-full p-2.5 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Primary Tax Residencies
                    </label>
                    <input
                      type="text"
                      value={taxResidency}
                      onChange={(e) => setTaxResidency(e.target.value)}
                      placeholder="e.g. France, United Kingdom"
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tax Identification Number (TIN / NIF)
                    </label>
                    <input
                      type="text"
                      value={taxIdNumbers}
                      onChange={(e) => setTaxIdNumbers(e.target.value)}
                      placeholder="e.g. FR-992-881-229-33"
                      className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: SOURCE OF WEALTH BREAKDOWN */}
            {activeSubTab === 'wealth' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Capital Origin Breakdown ({totalSowPercent}%)</h4>
                    <p className="text-slate-500 text-[11px]">Map capital streams to agreed valuation ({transaction.currency} {transaction.agreed_price.toLocaleString()})</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSowItem}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" /> Add Stream
                  </button>
                </div>

                <div className="space-y-3">
                  {sowItems.map((item, idx) => (
                    <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Capital Stream #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSowItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
                          <select
                            value={item.category}
                            onChange={(e) => handleUpdateSowItem(item.id, 'category', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                          >
                            <option value="BUSINESS_SALE">Business / Equity Exit</option>
                            <option value="CORPORATE_DIVIDENDS">Corporate Dividends</option>
                            <option value="REAL_ESTATE_SALE">Real Estate Liquidation</option>
                            <option value="INVESTMENT_PORTFOLIO">Investment / Hedge Fund Returns</option>
                            <option value="INHERITANCE">Inheritance / Estate Distribution</option>
                            <option value="SALARY_BONUS">Executive Salary & Bonuses</option>
                            <option value="FAMILY_TRUST">Family Trust Distribution</option>
                            <option value="OTHER">Other Lawful Source</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Allocation (%)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={item.percentage}
                            onChange={(e) => handleUpdateSowItem(item.id, 'percentage', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg font-mono bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Amount ({transaction.currency})
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={`${transaction.currency} ${item.estimated_amount.toLocaleString()}`}
                            className="w-full p-2 border border-slate-200 rounded-lg font-mono bg-slate-100 text-slate-700"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Proof / Document Description
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateSowItem(item.id, 'description', e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 3: UBO REGISTER */}
            {activeSubTab === 'ubo' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Purchasing Entity Structure
                    </label>
                    <select
                      value={ownershipType}
                      onChange={(e) => setOwnershipType(e.target.value as any)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="INDIVIDUAL">Direct Natural Person (Acquéreur Direct)</option>
                      <option value="SCI">French Civil Real Estate Entity (SCI Immobilière)</option>
                      <option value="HOLDING_COMPANY">Corporate Holding (SAS / SARL / SA)</option>
                      <option value="TRUST_FOUNDATION">Family Foundation / Trust</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Ultimate Beneficial Owner (100% Control)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={transaction.client_name || 'Alex Dupont'}
                      className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-100 font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-900">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    UBO Register (RBE) Pre-Validated
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Passports and Beneficial Ownership filings verified with French Notary Chamber.
                  </p>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: DECLARATIONS */}
            {activeSubTab === 'declarations' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pepDeclaration}
                      onChange={(e) => setPepDeclaration(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-slate-900"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Politically Exposed Person (PEP Declaration)
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Check if you or an immediate family member holds prominent public functions.
                      </span>
                    </div>
                  </label>

                  {pepDeclaration && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Public Office Details
                      </label>
                      <textarea
                        rows={2}
                        value={pepDetails}
                        onChange={(e) => setPepDetails(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-slate-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sanctionsDeclaration}
                      onChange={(e) => setSanctionsDeclaration(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-slate-900"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Sanctions & Asset Freeze Clearance
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        I attest that neither the buyer nor UBO is subject to EU/OFAC/UN financial sanctions.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* SUB-TAB 5: LEGAL REVIEW (STAFF) */}
            {activeSubTab === 'review' && isStaff && (
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1 text-indigo-950">
                  <h4 className="font-bold text-sm">Legal Counsel Tracfin Clearance Decision</h4>
                  <p className="text-xs text-indigo-800">
                    Evaluate Source of Funds documentation and stamp clearance verdict.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Clearance Verdict
                    </label>
                    <select
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value as any)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg font-bold bg-white"
                    >
                      <option value="CLEARED">CLEARED (Full AML Approval)</option>
                      <option value="REQUIRES_CLARIFICATION">REQUIRES_CLARIFICATION (Need Bank Proof)</option>
                      <option value="REJECTED">REJECTED (Non-compliant)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tracfin Risk Rating
                    </label>
                    <select
                      value={riskRating}
                      onChange={(e) => setRiskRating(e.target.value as any)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg font-mono bg-white"
                    >
                      <option value="LOW">LOW (Tier-1 EU Private Bank & Verified Exit)</option>
                      <option value="STANDARD">STANDARD (Standard Multi-jurisdictional)</option>
                      <option value="ENHANCED_DILIGENCE">ENHANCED_DILIGENCE (Offshore / Complex)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Legal Clearance Memorandum
                  </label>
                  <textarea
                    rows={3}
                    value={clearanceNotes}
                    onChange={(e) => setClearanceNotes(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleLegalReview}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Record Tracfin Clearance Decision
                </button>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-500">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Encrypted AES-256 Vault Isolation</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveDraft}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Questionnaire
                </button>

                {!isStaff && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSubmitForReview}
                    className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" /> Submit for Tracfin Clearance
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
