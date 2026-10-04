import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  Search,
  MapPin,
  Maximize2,
  Bed,
  CheckCircle2,
  ShieldCheck,
  Tag,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { KretzProperty } from '../types';
import { api } from '../services/api';

interface KretzPropertySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProperty: (property: KretzProperty) => void;
  selectedPropertyId?: string;
}

export const KretzPropertySelectorModal: React.FC<KretzPropertySelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectProperty,
  selectedPropertyId,
}) => {
  const [properties, setProperties] = useState<KretzProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [previewProperty, setPreviewProperty] = useState<KretzProperty | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSyncKretz = async () => {
    setSyncing(true);
    setStatusMsg(null);
    try {
      const res = await api.properties.syncFromKretz();
      setProperties(res.properties || []);
      setStatusMsg({ type: 'success', text: res.message || 'Properties synchronized successfully.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Sync failed: ' + (err.message || 'Unknown error') });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.properties
        .list()
        .then((res) => {
          setProperties(res.properties || []);
          if (selectedPropertyId) {
            const current = res.properties.find((p) => p.id === selectedPropertyId);
            if (current) setPreviewProperty(current);
          }
        })
        .catch((err) => console.error('Failed to load properties:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, selectedPropertyId]);

  if (!isOpen) return null;

  const filteredProperties = properties.filter((prop) => {
    if (typeFilter !== 'All' && prop.property_type !== typeFilter) return false;
    if (countryFilter !== 'All' && prop.country !== countryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match =
        prop.id.toLowerCase().includes(q) ||
        (prop.ref && prop.ref.toLowerCase().includes(q)) ||
        (prop.slug && prop.slug.toLowerCase().includes(q)) ||
        (prop.annonce_url && prop.annonce_url.toLowerCase().includes(q)) ||
        prop.name.toLowerCase().includes(q) ||
        prop.city.toLowerCase().includes(q) ||
        prop.headline.toLowerCase().includes(q) ||
        prop.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const propertyTypes = ['All', 'Private Mansion', 'Villa', 'Penthouse', 'Chalet', 'Château', 'House', 'Apartment'];
  const countries = ['All', 'France', 'United States', 'Greece', 'Morocco'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-white tracking-wide flex items-center gap-2">
                Kretz Property Portfolio & Direct Import
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans font-medium">
                  kretz.site Verified
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select or paste any kretz.site property to immediately import its full legal, cadastral, and architectural specifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && (
          <div
            className={`px-4 py-2.5 text-xs flex items-center justify-between font-mono ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/80 border-b border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/80 border-b border-rose-800/60 text-rose-300'
            }`}
          >
            <span>{statusMsg.text}</span>
            <button
              onClick={() => setStatusMsg(null)}
              className="text-slate-400 hover:text-white font-sans text-xs underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city, property name, ref (e.g. KP1-11270B), or paste kretz.site URL to import..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {propertyTypes.map((t) => (
                <option key={t} value={t}>
                  Type: {t}
                </option>
              ))}
            </select>

            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  Location: {c}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSyncKretz}
              disabled={syncing}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shrink-0"
            >
              <Building className="w-3.5 h-3.5" />
              {syncing ? 'Syncing Routes...' : 'Fetch Routes from kretz.site'}
            </button>
          </div>
        </div>

        {/* Content Body: Split View (List & Detail) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Properties Grid */}
          <div className="lg:col-span-7 p-4 overflow-y-auto max-h-[58vh] space-y-3">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400 font-mono">
                Loading Kretz Property Portfolio...
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No matching properties found for your filter criteria.
              </div>
            ) : (
              filteredProperties.map((prop) => {
                const isSelected = selectedPropertyId === prop.id;
                const isPreview = previewProperty?.id === prop.id;

                return (
                  <div
                    key={prop.id}
                    onClick={() => setPreviewProperty(prop)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex gap-3.5 ${
                      isPreview
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-md'
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={prop.images.hero}
                      alt={prop.name}
                      className="w-24 h-24 rounded-lg object-cover shrink-0 border border-slate-700"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            {prop.id}
                          </span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            {prop.currency === 'USD' ? '$' : '€'}
                            {prop.asking_price.toLocaleString()} {prop.currency}
                          </span>
                        </div>

                        <h3 className="font-serif font-bold text-sm text-white truncate mt-1">
                          {prop.name}
                        </h3>

                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{prop.city}, {prop.country}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Maximize2 className="w-3 h-3 text-slate-500" />
                            {prop.living_area_sqm} m²
                          </span>
                          <span className="flex items-center gap-1">
                            <Bed className="w-3 h-3 text-slate-500" />
                            {prop.bedrooms} beds
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProperty(prop);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition shadow-xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Property Detail Preview Pane */}
          <div className="lg:col-span-5 p-5 overflow-y-auto max-h-[58vh] bg-slate-950/40 space-y-4">
            {previewProperty ? (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-slate-700">
                  <img
                    src={previewProperty.images.hero}
                    alt={previewProperty.name}
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30">
                        {previewProperty.property_type}
                      </span>
                      <h4 className="font-serif text-base font-bold text-white mt-1">
                        {previewProperty.name}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                  <div className="text-xs font-semibold text-slate-300">Financial & Cadastral Profile</div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Asking Price</span>
                      <span className="text-emerald-400 font-bold">
                        {previewProperty.currency === 'USD' ? '$' : '€'}
                        {previewProperty.asking_price.toLocaleString()} {previewProperty.currency}
                      </span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Living Surface</span>
                      <span className="text-slate-200 font-bold">{previewProperty.living_area_sqm} m² Carrez</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Cadastral Ref</span>
                      <span className="text-amber-400 truncate block">{previewProperty.cadastral_id}</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Legal Title</span>
                      <span className="text-slate-300 truncate block">{previewProperty.legal_title_type}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-slate-300 mb-1.5">Overview & Legal Dossier</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {previewProperty.description}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-slate-300 mb-2">Key Amenities & Security Specs</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {previewProperty.key_amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-300"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Notary Title Due Diligence Pack Cleared & Available</span>
                </div>

                <button
                  onClick={() => {
                    onSelectProperty(previewProperty);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Import This Property into Acquisition Request
                </button>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500">
                Select any property on the left to preview its full legal and architectural dossier.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">
            {filteredProperties.length} Registered Kretz Properties Available
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
