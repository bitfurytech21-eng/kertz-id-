import React, { useState, useEffect } from 'react';
import { Building, Save, Send, Shield, AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PropertyRequest, KretzProperty } from '../types';
import { KretzPropertySelectorModal } from '../components/KretzPropertySelectorModal';
import { MatchedPropertyCard } from '../components/MatchedPropertyCard';

interface PropertyRequestFormPageProps {
  navigate: (path: string) => void;
  requestId?: string;
}

export const PropertyRequestFormPage: React.FC<PropertyRequestFormPageProps> = ({ navigate, requestId }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    property_type: 'Apartment' as PropertyRequest['property_type'],
    preferred_country: 'France',
    preferred_state: 'Île-de-France',
    preferred_city: 'Paris',
    preferred_neighborhood: '',
    min_size_sqm: '',
    max_size_sqm: '',
    bedrooms: '',
    budget: '3500000',
    currency: 'EUR',
    intended_use: 'Residential' as PropertyRequest['intended_use'],
    purchase_structure: 'Cash' as PropertyRequest['purchase_structure'],
    timeframe: '1 to 3 months',
    additional_requirements: '',
    special_instructions: '',
  });

  const [selectedProperty, setSelectedProperty] = useState<KretzProperty | null>(null);
  const [showPropertySelector, setShowPropertySelector] = useState(false);
  const [propertyNumberInput, setPropertyNumberInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  const parsePropertyLookupValue = (raw: string): string => {
    const value = raw.trim();
    if (!value) return '';

    // Handle full kretz.site URLs (with hash or direct, and tour URLs)
    // e.g. https://kretz.site/#/annonce/kp1-11270b/bastide
    // e.g. https://kretz.site/kretz-tour/en/annonce/kp1-11270b/bastide/
    const urlPattern = /(?:https?:\/\/[^/]+)?(?:\/#)?(?:\/)?(?:kretz-tour\/[a-z]{2}\/)?(?:annonce|property)\/([^?#\s]+)/i;
    const match = value.match(urlPattern);
    if (match?.[1]) {
      return decodeURIComponent(match[1]).replace(/\/+$/, '');
    }

    return value;
  };

  const handlePropertyNumberLookup = async () => {
    const rawInput = propertyNumberInput.trim();
    if (!rawInput) {
      setError('Please enter a property reference, slug, or kretz.site URL.');
      return;
    }

    const lookupValue = parsePropertyLookupValue(rawInput);
    setError(null);
    setSavedSuccess(null);
    setLoading(true);

    try {
      let property: KretzProperty | null = null;

      // 1. Dedicated lookup with parsed lookupValue
      const directRes = await api.properties.lookup(lookupValue).catch(() => null);
      if (directRes?.property) {
        property = directRes.property;
      }

      // 2. Direct lookup with raw input if different
      if (!property && rawInput !== lookupValue) {
        const rawRes = await api.properties.lookup(rawInput).catch(() => null);
        if (rawRes?.property) {
          property = rawRes.property;
        }
      }

      // 3. Fallback: Search endpoint with lookupValue
      if (!property) {
        const listRes = await api.properties.list({ search: lookupValue }).catch(() => ({ properties: [] }));
        if (listRes.properties && listRes.properties.length > 0) {
          const lowerVal = lookupValue.toLowerCase();
          property =
            listRes.properties.find(
              (item) =>
                item.id.toLowerCase() === lowerVal ||
                (item.ref && item.ref.toLowerCase() === lowerVal) ||
                (item.slug && item.slug.toLowerCase() === lowerVal) ||
                (item.annonce_url && item.annonce_url.toLowerCase().includes(lowerVal)) ||
                (item.name && item.name.toLowerCase().includes(lowerVal))
            ) || listRes.properties[0];
        }
      }

      // 4. Fallback: Extract code e.g. 11270b or 11270
      if (!property) {
        const codeMatch = lookupValue.match(/([0-9]{3,6}[a-z]?)/i);
        if (codeMatch) {
          const code = codeMatch[1];
          const directCodeRes = await api.properties.get(encodeURIComponent(code)).catch(() => null);
          if (directCodeRes?.property) {
            property = directCodeRes.property;
          } else {
            const listRes = await api.properties.list({ search: code }).catch(() => ({ properties: [] }));
            if (listRes.properties && listRes.properties.length > 0) {
              property = listRes.properties[0];
            }
          }
        }
      }

      if (property) {
        handleSelectKretzProperty(property);
        setSavedSuccess(`Property ${property.id} (${property.name}) loaded successfully from the Kretz portfolio.`);
      } else {
        setError(`Property "${rawInput}" could not be found in the Kretz portfolio. Please verify the reference or URL.`);
      }
    } catch (err: any) {
      setError('Failed to fetch property: ' + (err.message || 'unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      setLoading(true);
      api.propertyRequests
        .get(requestId)
        .then((res) => {
          const req = res.request;
          setFormData({
            property_type: req.property_type,
            preferred_country: req.preferred_country,
            preferred_state: req.preferred_state,
            preferred_city: req.preferred_city,
            preferred_neighborhood: req.preferred_neighborhood || '',
            min_size_sqm: req.min_size_sqm ? String(req.min_size_sqm) : '',
            max_size_sqm: req.max_size_sqm ? String(req.max_size_sqm) : '',
            bedrooms: req.bedrooms ? String(req.bedrooms) : '',
            budget: String(req.budget),
            currency: req.currency,
            intended_use: req.intended_use,
            purchase_structure: req.purchase_structure,
            timeframe: req.timeframe,
            additional_requirements: req.additional_requirements || '',
            special_instructions: req.special_instructions || '',
          });
          if (req.matched_property) {
            setSelectedProperty(req.matched_property);
          } else if (req.matched_property_id) {
            api.properties.get(req.matched_property_id).then((pRes) => {
              setSelectedProperty(pRes.property);
            }).catch(() => {});
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      // Check if property_id was passed via query params (e.g. from Dashboard or Portfolio)
      const params = new URLSearchParams(window.location.search);
      const queryPropId = params.get('property_id') || params.get('ref') || params.get('id');
      if (queryPropId) {
        setPropertyNumberInput(queryPropId);
        setLoading(true);
        api.properties
          .lookup(queryPropId)
          .then((res) => {
            if (res.property) {
              handleSelectKretzProperty(res.property);
              setSavedSuccess(`Property ${res.property.id} (${res.property.name}) automatically imported into acquisition specifications.`);
            }
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      }
    }
  }, [requestId]);

  const handleSelectKretzProperty = (prop: KretzProperty) => {
    setSelectedProperty(prop);

    let mappedType: PropertyRequest['property_type'] = 'House';
    if (prop.property_type === 'Apartment' || prop.property_type === 'Penthouse') {
      mappedType = 'Apartment';
    } else if (prop.property_type === 'Commercial property') {
      mappedType = 'Commercial property';
    } else if (prop.property_type === 'Land') {
      mappedType = 'Land';
    } else {
      mappedType = 'House';
    }

    setFormData((prev) => ({
      ...prev,
      property_type: mappedType,
      preferred_country: prop.country,
      preferred_state: prop.state_region,
      preferred_city: prop.city,
      preferred_neighborhood: prop.address,
      min_size_sqm: String(prop.living_area_sqm),
      max_size_sqm: String(prop.living_area_sqm + 50),
      bedrooms: String(prop.bedrooms),
      budget: String(prop.asking_price),
      currency: prop.currency,
      additional_requirements: prop.headline,
      special_instructions: `Direct acquisition inquiry for registered Kretz asset: ${prop.name} (Ref: ${prop.id}, Cadastre: ${prop.cadastral_id}, Jurisdiction: ${prop.notary_jurisdiction}). Title status: ${prop.legal_title_type}.`,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (isDraft: boolean) => {
    setError(null);
    setSavedSuccess(null);
    setIsSubmitting(true);

    try {
      const payload: any = {
        property_type: formData.property_type,
        preferred_country: formData.preferred_country,
        preferred_state: formData.preferred_state,
        preferred_city: formData.preferred_city,
        preferred_neighborhood: formData.preferred_neighborhood,
        min_size_sqm: formData.min_size_sqm ? Number(formData.min_size_sqm) : undefined,
        max_size_sqm: formData.max_size_sqm ? Number(formData.max_size_sqm) : undefined,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
        budget: Number(formData.budget) || 0,
        currency: formData.currency,
        intended_use: formData.intended_use,
        purchase_structure: formData.purchase_structure,
        timeframe: formData.timeframe,
        additional_requirements: formData.additional_requirements,
        special_instructions: formData.special_instructions,
        matched_property_id: selectedProperty?.id || undefined,
        is_draft: isDraft,
      };

      if (requestId) {
        payload.status = isDraft ? 'DRAFT' : 'SUBMITTED';
        await api.propertyRequests.update(requestId, payload);
        if (selectedProperty) {
          await api.properties.matchToRequest(requestId, selectedProperty.id).catch(() => {});
        }
        setSavedSuccess(isDraft ? 'Draft saved successfully.' : 'Property request submitted to legal review team.');
        setTimeout(() => navigate(`/property-request/${requestId}`), 1000);
      } else {
        const res = await api.propertyRequests.create(payload);
        if (selectedProperty) {
          await api.properties.matchToRequest(res.request.id, selectedProperty.id).catch(() => {});
        }
        setSavedSuccess(isDraft ? 'Draft saved successfully.' : 'Property request submitted to legal review team.');
        setTimeout(() => navigate(`/property-request/${res.request.id}`), 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save property request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-mono">
            <Building className="w-3 h-3" />
            Confidential Acquisition Specification
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            What type of property are you looking to acquire?
          </h1>
          <p className="text-xs text-slate-500">
            Provide the legal parameters and specifications for your intended acquisition.
          </p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="border-b border-neutral-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-0.5">
            <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <span>Property Number / Reference / kretz.site URL Lookup & Import</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                Auto-Import Ready
              </span>
            </h2>
            <p className="text-xs text-neutral-500">
              Enter any registered property number, asset slug, or live kretz.site announcement URL to immediately import full legal, pricing, and architectural specifications.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPropertySelector(true)}
            className="text-xs font-semibold text-slate-700 hover:text-black flex items-center gap-1 underline shrink-0"
          >
            Browse Full Kretz Portfolio &rarr;
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={propertyNumberInput}
            onChange={(e) => setPropertyNumberInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handlePropertyNumberLookup();
              }
            }}
            placeholder="Enter reference (e.g. KP1-11270B) or URL (e.g. https://kretz.site/#/annonce/kp1-11270b/bastide)..."
            className="w-full flex-1 px-3.5 py-2.5 rounded-lg bg-white border border-neutral-300 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black font-mono shadow-inner"
          />
          <button
            type="button"
            onClick={handlePropertyNumberLookup}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-black text-white font-bold text-xs hover:bg-neutral-800 transition shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Importing Asset...</span>
              </>
            ) : (
              <>
                <Building className="w-3.5 h-3.5 text-amber-400" />
                <span>Import Property Details</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-neutral-200 rounded w-48"></div>
            <div className="h-4 bg-neutral-200 rounded w-28"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="h-32 bg-neutral-100 rounded-lg"></div>
            <div className="md:col-span-2 space-y-3">
              <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
              <div className="h-12 bg-neutral-100 rounded w-full"></div>
            </div>
          </div>
          <div className="text-center py-2 text-xs text-neutral-600 font-medium flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-black" />
            Synchronizing property details & syncing essential data points (pricing, square footage, descriptions) from kretz.site...
          </div>
        </div>
      )}

      {selectedProperty && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Selected Kretz Acquisition Target
            </span>
            <button
              type="button"
              onClick={() => setSelectedProperty(null)}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
            >
              Clear & Enter Custom Specification
            </button>
          </div>
          <MatchedPropertyCard property={selectedProperty} onOpenSelector={() => setShowPropertySelector(true)} />
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedSuccess}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-8 space-y-8">
        <section className="space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              1. Property Information
            </h2>
            <p className="text-xs text-slate-500">Asset classification, location, and dimensions</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property Type <span className="text-rose-500">*</span>
              </label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleChange}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              >
                <option value="House">House / Villa / Hôtel Particulier</option>
                <option value="Apartment">Apartment / Penthouse</option>
                <option value="Land">Land / Development Plot</option>
                <option value="Commercial property">Commercial property</option>
                <option value="Office">Office Building / Workspace</option>
                <option value="Industrial property">Industrial property / Logistics</option>
                <option value="Other">Other Unique Asset</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Intended Use <span className="text-rose-500">*</span>
              </label>
              <select
                name="intended_use"
                value={formData.intended_use}
                onChange={handleChange}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              >
                <option value="Residential">Residential (Primary / Secondary Residence)</option>
                <option value="Investment">Investment / Rental Yield</option>
                <option value="Commercial">Commercial / Corporate Use</option>
                <option value="Development">Development / Redevelopment Project</option>
                <option value="Other">Other Purpose</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Country <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                name="preferred_country"
                value={formData.preferred_country}
                onChange={handleChange}
                placeholder="France, Monaco, Switzerland..."
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State / Department <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                name="preferred_state"
                value={formData.preferred_state}
                onChange={handleChange}
                placeholder="Île-de-France, Côte d'Azur..."
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City / Municipality <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                name="preferred_city"
                value={formData.preferred_city}
                onChange={handleChange}
                placeholder="Paris, Cannes, Neuilly-sur-Seine..."
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preferred Neighborhood / District
            </label>
            <input
              type="text"
              name="preferred_neighborhood"
              value={formData.preferred_neighborhood}
              onChange={handleChange}
              placeholder="e.g. 8th Arrondissement (Triangle d’Or), 16th, Marais, Cap d'Antibes"
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Minimum Size (m²)
              </label>
              <input
                type="number"
                name="min_size_sqm"
                value={formData.min_size_sqm}
                onChange={handleChange}
                placeholder="e.g. 150"
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maximum Size (m²)
              </label>
              <input
                type="number"
                name="max_size_sqm"
                value={formData.max_size_sqm}
                onChange={handleChange}
                placeholder="e.g. 350"
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bedrooms (if applicable)
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                placeholder="e.g. 3"
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Acquisition Budget <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="3500000"
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-md font-mono focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-md bg-white font-mono focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CHF">CHF</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4 pt-4 border-t border-slate-200">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              2. Acquisition & Legal Structure
            </h2>
            <p className="text-xs text-slate-500">Financing methodology, purchase timeframe, and legal specifics</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Financing Method <span className="text-rose-500">*</span>
              </label>
              <select
                name="purchase_structure"
                value={formData.purchase_structure}
                onChange={handleChange}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              >
                <option value="Cash">Cash (Unconditional Settlement)</option>
                <option value="Financing">Bank Financing / Mortgage Contingency</option>
                <option value="Hybrid">Hybrid / Private Equity Escrow</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Purchase Timeframe <span className="text-rose-500">*</span>
              </label>
              <select
                name="timeframe"
                value={formData.timeframe}
                onChange={handleChange}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              >
                <option value="Immediate (< 30 days)">Immediate (&lt; 30 days)</option>
                <option value="1 to 3 months">1 to 3 months</option>
                <option value="3 to 6 months">3 to 6 months</option>
                <option value="6+ months / Flexible">6+ months / Flexible</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Specific Legal & Architectural Requirements
            </label>
            <textarea
              rows={3}
              name="additional_requirements"
              value={formData.additional_requirements}
              onChange={handleChange}
              placeholder="e.g. Haussmannian stone building, high ceilings (>3.2m), private elevator, unencumbered rooftop terrace, concierge."
              className="w-full text-xs p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Special Instructions & Corporate Entity Details
            </label>
            <textarea
              rows={2}
              name="special_instructions"
              value={formData.special_instructions}
              onChange={handleChange}
              placeholder="e.g. Acquisition will be executed via French SCI entity. Request expedited 30-year title chain report."
              className="w-full text-xs p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>
        </section>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Encrypted with strict client vault isolation</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-3.5 h-3.5" /> Save Draft
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(false)}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" /> Submit Property Request
            </button>
          </div>
        </div>
      </div>

      <KretzPropertySelectorModal
        isOpen={showPropertySelector}
        onClose={() => setShowPropertySelector(false)}
        onSelectProperty={handleSelectKretzProperty}
        selectedPropertyId={selectedProperty?.id}
      />
    </div>
  );
};
