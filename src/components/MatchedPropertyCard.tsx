import React, { useState } from 'react';
import {
  Building,
  MapPin,
  Maximize2,
  Bed,
  ShieldCheck,
  CheckCircle2,
  Download,
  ExternalLink,
  Tag,
  Scale,
  FileText,
  DollarSign,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { KretzProperty } from '../types';

interface MatchedPropertyCardProps {
  property: KretzProperty;
  onOpenSelector?: () => void;
  showActions?: boolean;
}

export const MatchedPropertyCard: React.FC<MatchedPropertyCardProps> = ({
  property,
  onOpenSelector,
  showActions = true,
}) => {
  const [expandedGallery, setExpandedGallery] = useState(false);
  const [activeImage, setActiveImage] = useState(property.images.hero);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-amber-400/80 transition-all duration-200">
      {/* Top Banner with Badges */}
      <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded border border-amber-500/30">
            {property.id}
          </span>
          <span className="text-xs font-serif font-bold text-slate-100">
            KRETZ REGISTERED TROPHY ASSET
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Due Diligence Ready
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono text-[11px]">
            {property.legal_title_type}
          </span>
        </div>
      </div>

      {/* Main Grid: Visuals & Specifications */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Preview & Gallery */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-4/3 bg-slate-100 shadow-inner">
            <img
              src={activeImage}
              alt={property.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm text-white font-serif text-xs font-semibold">
              {property.property_type}
            </div>
            <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-sm text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
              {property.currency === 'USD' ? '$' : '€'}
              {property.asking_price.toLocaleString()} {property.currency}
            </div>
          </div>

          {/* Gallery Thumbnails */}
          {property.images.gallery && property.images.gallery.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {property.images.gallery.map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                    activeImage === imgUrl ? 'border-amber-500 scale-105 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Architectural & Legal Specifications */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {property.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{property.address} • {property.city}, {property.country}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-sans">
              {property.headline}
            </p>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono block">Living Area</span>
                <span className="text-xs font-bold text-slate-900 font-mono flex items-center gap-1 mt-0.5">
                  <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                  {property.living_area_sqm} m²
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono block">Bedrooms</span>
                <span className="text-xs font-bold text-slate-900 font-mono flex items-center gap-1 mt-0.5">
                  <Bed className="w-3.5 h-3.5 text-slate-500" />
                  {property.bedrooms} Suites
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono block">Cadastral Ref</span>
                <span className="text-xs font-bold text-amber-700 font-mono truncate block mt-0.5" title={property.cadastral_id}>
                  {property.cadastral_id}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono block">Land Registry</span>
                <span className="text-xs font-bold text-slate-700 font-mono truncate block mt-0.5" title={property.land_registry_ref}>
                  {property.land_registry_ref}
                </span>
              </div>
            </div>

            {/* Key Amenities */}
            <div className="mt-4">
              <div className="text-[11px] font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-600" /> Key Amenities & Highlights
              </div>
              <div className="flex flex-wrap gap-1.5">
                {property.key_amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-medium"
                  >
                    {amenity}
                  </span>
                ))}
                {property.tags.map((tag, idx) => (
                  <span
                    key={`t-${idx}`}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[11px]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Legal / Notary Jurisdiction Note */}
          <div className="p-3 rounded-lg bg-slate-900 text-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-800">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong className="text-white">Notary Jurisdiction:</strong> {property.notary_jurisdiction}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={property.annonce_url || `https://kretz.site/#/annonce/${(property.ref || '').toLowerCase()}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>kretz.site Listing</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {onOpenSelector && showActions && (
                <button
                  onClick={onOpenSelector}
                  className="text-xs text-amber-400 hover:text-amber-300 underline font-semibold shrink-0"
                >
                  Change
                </button>
              )}
            </div>
          </div>

          {/* Lead Kretz Family Agent */}
          {property.agent && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <img
                  src={property.agent.photo}
                  alt={property.agent.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-xs"
                />
                <div>
                  <div className="font-semibold text-slate-900 leading-none">{property.agent.name}</div>
                  <span className="text-[10px] text-slate-400">{property.agent.role}</span>
                </div>
              </div>

              <div className="font-mono text-xs text-slate-700 font-medium">
                {property.agent.phone}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
