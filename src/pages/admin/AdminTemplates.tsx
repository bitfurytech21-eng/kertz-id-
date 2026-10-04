import React, { useState } from 'react';
import {
  FileCode2,
  Plus,
  Search,
  CheckCircle2,
  X,
  Edit,
  Trash2,
  Tag,
  Save,
  Download,
} from 'lucide-react';

interface TemplateItem {
  id: string;
  category: string;
  template: string;
  version: string;
  status: 'Active' | 'Draft' | 'Archived';
  description?: string;
  body?: string;
}

const INITIAL_TEMPLATES: TemplateItem[] = [
  {
    id: 'TPL-001',
    category: 'Sale',
    template: 'Deed of Assignment',
    version: 'v3.2',
    status: 'Active',
    description: 'Official land conveyance deed of assignment for property title transfers.',
    body: `DEED OF ASSIGNMENT

Template Version: 3.2
Jurisdiction: Alpes-Maritimes
Status: ACTIVE

THIS DEED OF ASSIGNMENT is made this _____ day of 2026 between:

1. ABC PROPERTIES LTD (Corporate Vendor / Assignor)
2. JOHN SMITH (Purchaser / Assignee)

WHEREAS the Assignor is the beneficial owner of Cadastral Parcel CAN-2026-8801 situated at Alpes-Maritimes, France.

NOW THIS DEED WITNESSETH that in consideration of the sum of $5,900,000 paid by the Assignee, the Assignor hereby CONVEYS and ASSIGNS unto the Assignee all estate, right, title and interest in the said property.`,
  },
  {
    id: 'TPL-002',
    category: 'Sale',
    template: 'Sale Agreement',
    version: 'v2.1',
    status: 'Active',
    description: 'Standard real estate purchase agreement and compromis de vente.',
    body: 'REAL ESTATE SALE AGREEMENT\n\nBetween Vendor and Purchaser for luxury residential property acquisition...',
  },
  {
    id: 'TPL-003',
    category: 'Lease',
    template: 'Tenancy Agreement',
    version: 'v1.8',
    status: 'Active',
    description: 'Residential & commercial long-term tenancy lease agreement.',
    body: 'TENANCY & LEASE AGREEMENT\n\nFixed term residential lease contract with furniture inventory and escrow deposit terms...',
  },
  {
    id: 'TPL-004',
    category: 'Mortgage',
    template: 'Legal Mortgage',
    version: 'v2.0',
    status: 'Active',
    description: 'Bank & financial institution property mortgage encumbrance deed.',
    body: 'LEGAL MORTGAGE & CHARGE DEED\n\nSecured property mortgage agreement registered with Land Registry Authority...',
  },
  {
    id: 'TPL-005',
    category: 'POA',
    template: 'Special POA',
    version: 'v1.4',
    status: 'Active',
    description: 'Special Power of Attorney for remote notarization and proxy execution.',
    body: 'SPECIAL POWER OF ATTORNEY (PROCURATION)\n\nGranting full legal authority to proxy representative for property transaction signing under eIDAS QES...',
  },
];

export const AdminTemplates: React.FC<{ navigate: (path: string) => void }> = () => {
  const [templates, setTemplates] = useState<TemplateItem[]>(INITIAL_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [activeTab, setActiveTab] = useState('Document Structure');
  const [isCreating, setIsEditing] = useState(false);

  // New Template Form
  const [newCategory, setNewCategory] = useState('Sale');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newVersion, setNewVersion] = useState('v1.0');

  const filteredTemplates = templates.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.template.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.version.toLowerCase().includes(q)
    );
  });

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) return;
    const item: TemplateItem = {
      id: `TPL-${Date.now()}`,
      category: newCategory,
      template: newTemplateName,
      version: newVersion,
      status: 'Active',
      description: 'Custom generated legal document template.',
      body: `OFFICIAL ${newTemplateName.toUpperCase()} TEMPLATE\n\nVersion ${newVersion}`,
    };
    setTemplates([item, ...templates]);
    setNewTemplateName('');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 uppercase">
            LEGAL TEMPLATES
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage notarial contract templates, version history, and clause clauses.
          </p>
        </div>

        {/* Action Button: + Create Template */}
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>[ + Create Template ]</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates __________________"
          className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none transition font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-mono font-bold uppercase text-slate-500">
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Template</th>
                <th className="py-3.5 px-4">Version</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredTemplates.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  onClick={() => {
                    setSelectedTemplate(t);
                    setActiveTab('Document Structure');
                  }}
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md font-mono text-[11px] font-bold">
                      {t.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                      {t.template}
                    </div>
                    {t.description && (
                      <div className="text-[10px] text-slate-400 line-clamp-1">{t.description}</div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-mono font-semibold text-slate-600">
                    {t.version}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{t.status}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplate(t);
                        setActiveTab('Document Structure');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 font-semibold rounded-lg text-xs transition"
                    >
                      View Template
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TEMPLATE MODAL */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-serif font-bold text-base text-slate-900 uppercase">
                + Create Legal Template
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="Sale">Sale</option>
                  <option value="Lease">Lease</option>
                  <option value="Mortgage">Mortgage</option>
                  <option value="POA">POA</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Template Name</label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g. Deed of Assignment — Rivers State"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Version</label>
                <input
                  type="text"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  placeholder="e.g. v3.2"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateTemplate}
                className="px-5 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl shadow-md"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE DETAIL VIEW MODAL */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200 relative my-8 text-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <h2 className="font-serif font-bold text-xl text-slate-900 uppercase tracking-wider">
                  {selectedTemplate.template || 'DEED OF ASSIGNMENT'}
                </h2>
                <div className="flex flex-wrap items-center gap-3 font-mono text-slate-500 text-xs">
                  <span>Template Version: <strong className="text-slate-900">{selectedTemplate.version || '3.2'}</strong></span>
                  <span>•</span>
                  <span>Jurisdiction: <strong className="text-slate-900">France · Alpes-Maritimes</strong></span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase">
                    Status: {selectedTemplate.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3">
              {[
                'Document Structure',
                'Fields',
                'Clauses',
                'Validation',
                'Version History',
                'Approval History',
              ].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg font-mono font-bold transition text-xs ${
                      isActive
                        ? 'bg-slate-950 text-amber-400 shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    [{tab}]
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT */}
            <div className="py-2 min-h-[200px]">
              {/* Document Structure */}
              {activeTab === 'Document Structure' && (
                <div className="space-y-3 font-mono">
                  <h4 className="font-serif font-bold text-xs uppercase text-slate-900">1. Parties & Recitals Section</h4>
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-[11px]">
                    - Recital A: Assignor holds valid title over Cadastral Parcel CAN-2026-8801.
                    <br />
                    - Recital B: Assignee agrees to acquire title subject to agreed financial consideration.
                  </p>

                  <h4 className="font-serif font-bold text-xs uppercase text-slate-900">2. Operative & Conveyance Clauses</h4>
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-[11px]">
                    - Clause 1: Transfer of Rights and Interest.
                    <br />
                    - Clause 2: Covenant of Quiet Enjoyment & Indemnity.
                  </p>

                  <h4 className="font-serif font-bold text-xs uppercase text-slate-900">3. Execution & Notarial Seal Block</h4>
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-[11px]">
                    - eIDAS QES Digital Signature Stamp & Notary Seal verification.
                  </p>
                </div>
              )}

              {/* Fields */}
              {activeTab === 'Fields' && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between font-mono">
                    <span className="font-bold text-indigo-700">{`{ASSIGNOR_NAME}`}</span>
                    <span className="text-slate-500">ABC Properties Ltd (Corporate Vendor)</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between font-mono">
                    <span className="font-bold text-indigo-700">{`{ASSIGNEE_NAME}`}</span>
                    <span className="text-slate-500">John Smith (Purchaser)</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between font-mono">
                    <span className="font-bold text-indigo-700">{`{CONSIDERATION}`}</span>
                    <span className="text-slate-500">€5,900,000 EUR</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between font-mono">
                    <span className="font-bold text-indigo-700">{`{PARCEL_REF}`}</span>
                    <span className="text-slate-500">CAN-2026-8801</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between font-mono">
                    <span className="font-bold text-indigo-700">{`{EXECUTION_DATE}`}</span>
                    <span className="text-slate-500">15/10/2026</span>
                  </div>
                </div>
              )}

              {/* Clauses */}
              {activeTab === 'Clauses' && (
                <pre className="p-4 bg-slate-900 text-slate-100 font-mono rounded-xl leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto text-[11px]">
                  {selectedTemplate.body || 'OPERATIVE COVENANTS:\n\n1. Covenant of Good Right to Convey.\n2. Freedom from Prior Charges & Encumbrances.\n3. Further Assurance for Registration with Conservation des Hypothèques.'}
                </pre>
              )}

              {/* Validation */}
              {activeTab === 'Validation' && (
                <div className="space-y-2">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center justify-between">
                    <span className="font-semibold">Code Civil Français & Service de la Publicité Foncière</span>
                    <span className="font-mono font-bold text-emerald-700">✓ PASSED</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center justify-between">
                    <span className="font-semibold">eIDAS Regulation (EU 910/2014) QES Standard</span>
                    <span className="font-mono font-bold text-emerald-700">✓ VALIDATED</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center justify-between">
                    <span className="font-semibold">Tracfin AML / Beneficial Owner Screening</span>
                    <span className="font-mono font-bold text-emerald-700">✓ CLEARED</span>
                  </div>
                </div>
              )}

              {/* Version History */}
              {activeTab === 'Version History' && (
                <div className="space-y-2 font-mono">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div>
                      <strong className="text-slate-900 block font-bold">Version 3.2 (Active Current)</strong>
                      <span className="text-slate-500 text-[10px]">Updated Notarial Pre-emption Consent clause.</span>
                    </div>
                    <span className="text-slate-400 text-[10px]">2026-10-02</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center opacity-70">
                    <div>
                      <strong className="text-slate-900 block font-bold">Version 3.1</strong>
                      <span className="text-slate-500 text-[10px]">Added eIDAS remote signature placeholder.</span>
                    </div>
                    <span className="text-slate-400 text-[10px]">2026-08-15</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center opacity-60">
                    <div>
                      <strong className="text-slate-900 block font-bold">Version 2.0</strong>
                      <span className="text-slate-500 text-[10px]">Initial notary board standardization release.</span>
                    </div>
                    <span className="text-slate-400 text-[10px]">2026-01-10</span>
                  </div>
                </div>
              )}

              {/* Approval History */}
              {activeTab === 'Approval History' && (
                <div className="space-y-2 font-mono">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div>
                      <strong className="text-slate-900 block font-bold">Maître Claire de Saint-Germain</strong>
                      <span className="text-slate-500 text-[10px]">Senior Notary Officer · Approved v3.2</span>
                    </div>
                    <span className="text-emerald-700 font-bold text-[10px]">APPROVED</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div>
                      <strong className="text-slate-900 block font-bold">Notarial Board Legal Audit</strong>
                      <span className="text-slate-500 text-[10px]">Chambre des Notaires Registry Clearance</span>
                    </div>
                    <span className="text-emerald-700 font-bold text-[10px]">VERIFIED</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl"
              >
                Close Detail View
              </button>

              <button
                type="button"
                onClick={() => {
                  alert(`Template ${selectedTemplate.template} active version v3.2 ready for document generation.`);
                  setSelectedTemplate(null);
                }}
                className="px-5 py-2 bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold rounded-xl shadow-md"
              >
                Use Template for Generation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
