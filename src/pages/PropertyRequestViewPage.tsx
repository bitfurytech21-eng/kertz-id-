import React, { useState, useEffect } from 'react';
import { Building, ArrowLeft, Edit3, FolderLock, Shield, Clock, Calendar, CheckCircle2, AlertCircle, Sparkles, Link as LinkIcon } from 'lucide-react';
import { api } from '../services/api';
import { PropertyRequest, KretzProperty } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { MatchedPropertyCard } from '../components/MatchedPropertyCard';
import { KretzPropertySelectorModal } from '../components/KretzPropertySelectorModal';

interface PropertyRequestViewPageProps {
  requestId: string;
  navigate: (path: string) => void;
}

export const PropertyRequestViewPage: React.FC<PropertyRequestViewPageProps> = ({ requestId, navigate }) => {
  const { isStaff, user } = useAuth();
  const [request, setRequest] = useState<PropertyRequest | null>(null);
  const [matchedProperty, setMatchedProperty] = useState<KretzProperty | null>(null);
  const [showPropertySelector, setShowPropertySelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    api.propertyRequests
      .get(requestId)
      .then((res) => {
        setRequest(res.request);
        if (res.request.matched_property) {
          setMatchedProperty(res.request.matched_property);
        } else if (res.request.matched_property_id) {
          api.properties.get(res.request.matched_property_id).then((pRes) => {
            setMatchedProperty(pRes.property);
          }).catch(() => {});
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [requestId]);

  const handleMatchProperty = async (prop: KretzProperty) => {
    try {
      await api.properties.matchToRequest(requestId, prop.id);
      setMatchedProperty(prop);
      loadData();
    } catch (err: any) {
      setError('Failed to match property: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading property acquisition dossier...
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error || 'Property request not found.'}</span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>
      </div>
    );
  }

  const canEdit = !['TRANSACTION_STARTED', 'COMPLETED', 'CANCELLED'].includes(request.status) || isStaff;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(isStaff ? '/admin/property-requests' : '/dashboard')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {canEdit && (
          <button
            onClick={() => navigate(`/property-request/edit/${request.id}`)}
            className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Request
          </button>
        )}
      </div>

      {/* Main Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {request.id}
              </span>
              <StatusBadge status={request.status} />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {request.property_type} Acquisition Dossier
            </h1>
            <p className="text-xs text-slate-500">
              Submitted for {request.preferred_city}, {request.preferred_country} • Created on {new Date(request.created_at).toLocaleDateString()}
            </p>
          </div>

          {request.associated_transaction_id && (
            <button
              onClick={() => navigate(`/transactions/${request.associated_transaction_id}`)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center gap-2"
            >
              <FolderLock className="w-4 h-4 text-emerald-400" />
              Open Legal Transaction
            </button>
          )}
        </div>
      </div>

      {/* Matched Kretz Property Section */}
      {matchedProperty ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Matched Registered Property (kretz.site)
            </span>
            <span className="text-xs font-mono text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Due Diligence File Linked
            </span>
          </div>
          <MatchedPropertyCard
            property={matchedProperty}
            onOpenSelector={() => setShowPropertySelector(true)}
            showActions={canEdit}
          />
        </div>
      ) : (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-serif font-bold text-amber-300">
                Match from Registered Kretz Portfolio
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Attach a verified trophy asset (Paris Hôtels Particuliers, French Riviera Villas, Courchevel Chalets) directly to this dossier.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowPropertySelector(true)}
            className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition shrink-0 flex items-center gap-2"
          >
            <Building className="w-4 h-4" />
            Browse & Link Property
          </button>
        </div>
      )}

      {/* Specification Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden divide-y divide-slate-100">
        {/* Client Ownership */}
        <div className="p-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Client Principal
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Client Name</span>
              <span className="font-semibold text-slate-900">{request.client_name || user?.profile?.first_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Client Email</span>
              <span className="font-semibold text-slate-900">{request.client_email || user?.email}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Submission Date</span>
              <span className="font-semibold text-slate-900 font-mono">
                {new Date(request.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Property Parameters */}
        <div className="p-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Asset Criteria
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Property Type</span>
              <span className="font-semibold text-slate-900">{request.property_type}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Target Budget</span>
              <span className="font-bold text-slate-900 font-mono">
                {request.currency} {request.budget.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Habitable Surface</span>
              <span className="font-semibold text-slate-900">
                {request.min_size_sqm || 'Any'} - {request.max_size_sqm || 'Flexible'} m²
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Bedrooms</span>
              <span className="font-semibold text-slate-900">{request.bedrooms || 'Not specified'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Jurisdiction & Location</span>
              <span className="font-semibold text-slate-900">
                {request.preferred_city}, {request.preferred_state}, {request.preferred_country}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Preferred Neighborhood / District</span>
              <span className="font-semibold text-slate-900">
                {request.preferred_neighborhood || 'Any prime location'}
              </span>
            </div>
          </div>
        </div>

        {/* Legal & Acquisition Structure */}
        <div className="p-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Acquisition Structure & Requirements
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Intended Purpose</span>
              <span className="font-semibold text-slate-900">{request.intended_use}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Purchase Structure</span>
              <span className="font-semibold text-slate-900">{request.purchase_structure}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Timeframe</span>
              <span className="font-semibold text-slate-900">{request.timeframe}</span>
            </div>
          </div>

          {request.additional_requirements && (
            <div className="pt-2 text-xs">
              <span className="text-slate-500 block text-[11px]">Specific Requirements</span>
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-md text-slate-800 leading-relaxed mt-1">
                {request.additional_requirements}
              </p>
            </div>
          )}

          {request.admin_notes && (
            <div className="pt-2 text-xs">
              <span className="text-amber-800 font-bold block text-[11px] uppercase tracking-wider font-mono">
                Legal Team & Agent Counsel Response
              </span>
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-lg text-slate-800 leading-relaxed mt-1 space-y-1">
                <p className="whitespace-pre-line">{request.admin_notes}</p>
                {request.admin_response_at && (
                  <span className="text-[10px] text-slate-400 block pt-1 font-mono">
                    Dispatched on {new Date(request.admin_response_at).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          )}

          {request.special_instructions && (
            <div className="pt-2 text-xs">
              <span className="text-slate-500 block text-[11px]">Special Legal Instructions</span>
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-md text-slate-800 leading-relaxed mt-1">
                {request.special_instructions}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Property Selector Modal */}
      <KretzPropertySelectorModal
        isOpen={showPropertySelector}
        onClose={() => setShowPropertySelector(false)}
        onSelectProperty={handleMatchProperty}
        selectedPropertyId={matchedProperty?.id}
      />
    </div>
  );
};
