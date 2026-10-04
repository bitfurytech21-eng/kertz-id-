import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  Search,
  MapPin,
  Maximize2,
  Bed,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Send,
  User,
  Calendar,
  AlertCircle,
  FileCheck,
  ChevronRight,
  Filter,
  Phone,
  Mail
} from 'lucide-react';
import { PropertyRequest, KretzProperty } from '../types';
import { api } from '../services/api';

interface AdminPropertySearchResponderModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PropertyRequest | null;
  onResponseSent: () => void;
}

export const AdminPropertySearchResponderModal: React.FC<AdminPropertySearchResponderModalProps> = ({
  isOpen,
  onClose,
  request,
  onResponseSent,
}) => {
  const [properties, setProperties] = useState<KretzProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedProperty, setSelectedProperty] = useState<KretzProperty | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load all 207 real properties fetched from https://kretz.site/#/annonce/
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      api.properties
        .list()
        .then((res) => {
          setProperties(res.properties || []);
          // If request already has a matched property, pre-select it
          if (request?.matched_property) {
            setSelectedProperty(request.matched_property);
          } else if (request?.matched_property_id) {
            const found = res.properties.find((p) => p.id === request.matched_property_id);
            if (found) setSelectedProperty(found);
          }
        })
        .catch((err) => {
          console.error('Failed to load Kretz properties:', err);
          setError('Failed to load Kretz property catalogue.');
        })
        .finally(() => setLoading(false));

      // Default notes template for admin response
      if (request) {
        setAdminNotes(
          request.admin_notes ||
            `Dear ${request.client_name || 'Client'},\n\nOur legal department and Kretz transaction officers have reviewed your acquisition criteria for a ${request.property_type} in ${request.preferred_city}. We have identified an exceptional match from our official portfolio. Cadastral surveys and preliminary title deeds have been reviewed with the local Notarial Chamber.`
        );
      }
    }
  }, [isOpen, request]);

  if (!isOpen || !request) return null;

  // Filter properties
  const filteredProperties = properties.filter((p) => {
    if (selectedType !== 'All' && p.property_type !== selectedType) return false;
    if (selectedCity !== 'All' && p.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.ref && p.ref.toLowerCase().includes(q)) ||
        p.headline.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Calculate recommendation match score based on client's search
  const getMatchScore = (prop: KretzProperty) => {
    let score = 50;
    if (request.preferred_city && prop.city.toLowerCase().includes(request.preferred_city.toLowerCase())) {
      score += 25;
    }
    if (request.property_type && prop.property_type.toLowerCase() === request.property_type.toLowerCase()) {
      score += 15;
    }
    if (request.budget && prop.asking_price <= request.budget * 1.15 && prop.asking_price >= request.budget * 0.7) {
      score += 10;
    }
    return Math.min(score, 100);
  };

  const handleSendResponse = async () => {
    if (!selectedProperty) {
      setError('Please select a property from the Kretz catalogue to respond with.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.propertyRequests.matchProperty(request.id, selectedProperty.id, adminNotes);
      setSuccessMessage(`Successfully responded to ${request.client_name || 'Client'} with ${selectedProperty.name}!`);
      setTimeout(() => {
        onResponseSent();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to send property response to client dashboard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Distinct cities from properties
  const cities = ['All', ...Array.from(new Set(properties.map((p) => p.city))).sort().slice(0, 15)];
  const propertyTypes = ['All', 'Villa', 'Apartment', 'Private Mansion', 'Château', 'House', 'Penthouse', 'Chalet'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-4 text-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-white">
                  Respond to Client Property Search
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {properties.length} Properties from kretz.site
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Match verified listings from <code className="text-amber-400">https://kretz.site/#/annonce/</code> directly to buyer acquisition dossiers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* LEFT 5 COLS: Client Detail & Response Composer */}
          <div className="lg:col-span-5 p-5 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/60 overflow-y-auto space-y-5">
            {/* Client Summary Dossier */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Client Search Details
                  </span>
                </div>
                <span className="font-mono text-[11px] text-blue-400 font-bold">{request.id}</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Client Principal:</span>
                  <span className="font-semibold text-white">{request.client_name || 'Registered Buyer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Client Email:</span>
                  <span className="font-mono text-slate-300">{request.client_email || 'client@kretz.site'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Requested Asset:</span>
                  <span className="font-semibold text-amber-300">{request.property_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Location:</span>
                  <span className="text-white">
                    {request.preferred_city}, {request.preferred_country}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Budget:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {request.currency} {request.budget.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Desired Surface:</span>
                  <span className="text-slate-300">
                    {request.min_size_sqm ? `${request.min_size_sqm} m²` : 'Any'} - {request.max_size_sqm ? `${request.max_size_sqm} m²` : 'Flexible'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Purchase Structure:</span>
                  <span className="text-slate-300">{request.purchase_structure} ({request.timeframe})</span>
                </div>
              </div>

              {request.special_instructions && (
                <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                  <strong className="text-amber-400 block mb-0.5">Buyer Requirements:</strong>
                  {request.special_instructions}
                </div>
              )}
            </div>

            {/* Selected Property Preview (if selected) */}
            {selectedProperty ? (
              <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-4 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold uppercase text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    Selected Property to Attach
                  </span>
                  <a
                    href={selectedProperty.annonce_url || `https://kretz.site/#/annonce/${(selectedProperty.ref || '').toLowerCase()}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <span>kretz.site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex gap-3">
                  <img
                    src={selectedProperty.images.hero}
                    alt={selectedProperty.name}
                    className="w-20 h-20 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-white line-clamp-1">{selectedProperty.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{selectedProperty.city}, {selectedProperty.state_region}</span>
                    </div>
                    <div className="font-mono font-bold text-amber-400">
                      €{selectedProperty.asking_price.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Ref: <strong className="text-slate-200">{selectedProperty.ref || selectedProperty.id}</strong> • {selectedProperty.living_area_sqm} m² • {selectedProperty.bedrooms} beds
                    </div>
                  </div>
                </div>

                {selectedProperty.agent && (
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2.5 text-[11px] text-slate-300">
                    <img
                      src={selectedProperty.agent.photo}
                      alt={selectedProperty.agent.name}
                      className="w-6 h-6 rounded-full object-cover border border-slate-700"
                    />
                    <div className="truncate">
                      <span className="text-white font-medium">{selectedProperty.agent.name}</span>
                      <span className="text-slate-500 ml-1.5">({selectedProperty.agent.phone})</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-900/60 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-400">
                <Building className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
                Select a property from the catalogue on the right to attach to this response.
              </div>
            )}

            {/* Admin Personalized Legal Response Note */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Personalized Legal Counsel & Agent Response Message
              </label>
              <textarea
                rows={5}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Write customized guidance for the client regarding this matched property..."
                className="w-full text-xs p-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden transition"
              />
              <span className="text-[10px] text-slate-500 block">
                This note will be featured prominently on the client's dashboard with the property dossier.
              </span>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              onClick={handleSendResponse}
              disabled={isSubmitting || !selectedProperty}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Dispatching to Client Dashboard...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Property Response to Client Dashboard</span>
                </>
              )}
            </button>
          </div>

          {/* RIGHT 7 COLS: All 207 Kretz Properties Directory */}
          <div className="lg:col-span-7 flex flex-col bg-slate-900/40 overflow-hidden">
            {/* Search and Filters Bar */}
            <div className="p-4 border-b border-slate-800 bg-slate-900 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search 207 properties by Reference (e.g. KP1-102), City, Title, Tag..."
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="text-xs px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-300"
                  >
                    {propertyTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="text-xs px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 max-w-[140px]"
                  >
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fast City Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1 text-[11px]">
                <span className="text-slate-400 text-[10px] font-mono shrink-0">Popular:</span>
                {['Paris', 'Roquebrune Cap Martin', 'Cannes', 'Saint Tropez', 'Antibes', 'Aix En Provence'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCity(selectedCity === c ? 'All' : c)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap transition ${
                      selectedCity === c
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Properties Grid */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {loading ? (
                <div className="py-20 text-center text-xs text-slate-400 font-mono">
                  Loading 207 real properties from kretz.site...
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="py-20 text-center text-xs text-slate-400">
                  No properties found matching your filter criteria.
                </div>
              ) : (
                filteredProperties.map((prop) => {
                  const isSelected = selectedProperty?.id === prop.id;
                  const matchScore = getMatchScore(prop);

                  return (
                    <div
                      key={prop.id}
                      onClick={() => setSelectedProperty(prop)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-400 shadow-md ring-1 ring-amber-400'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={prop.images.hero}
                          alt={prop.name}
                          className="w-20 h-20 rounded-lg object-cover shrink-0 border border-slate-700"
                        />

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                              {prop.ref || prop.id}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">{prop.property_type}</span>
                            {matchScore >= 80 && (
                              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold rounded">
                                {matchScore}% Criteria Match
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-sm text-white line-clamp-1 hover:text-amber-300 transition">
                            {prop.name}
                          </h3>

                          <div className="text-[11px] text-slate-400 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {prop.city} ({prop.state_region})
                            </span>
                            <span>•</span>
                            <span>{prop.living_area_sqm} m²</span>
                            <span>•</span>
                            <span>{prop.bedrooms} bed</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0">
                        <div className="font-mono text-base font-bold text-amber-400">
                          €{prop.asking_price.toLocaleString()}
                        </div>

                        <div className="flex items-center gap-2">
                          {prop.annonce_url && (
                            <a
                              href={prop.annonce_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                              title="View on kretz.site/#/annonce"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProperty(prop);
                            }}
                            className={`px-3 py-1 text-xs rounded-lg font-semibold transition ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
