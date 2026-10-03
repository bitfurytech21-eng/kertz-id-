import React, { useState, useRef } from 'react';
import { X, Upload, Shield, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { DocumentType } from '../types';
import { useAuth } from '../context/AuthContext';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => Promise<void>;
  transactionId: string;
}

const DOCUMENT_TYPES: { type: DocumentType; label: string }[] = [
  { type: 'GOVERNMENT_ID', label: 'Government National ID' },
  { type: 'PASSPORT', label: 'Passport Identity Page' },
  { type: 'DRIVERS_LICENSE', label: 'Driver’s License' },
  { type: 'PROOF_OF_ADDRESS', label: 'Proof of Address (Utility / Tax Bill < 3 mos)' },
  { type: 'BANK_PROOF', label: 'Bank Escrow / Source of Funds Evidence' },
  { type: 'PROPERTY_DEED', label: 'Property Title Deed / Cadastre Extract' },
  { type: 'SURVEY_REPORT', label: 'Survey Report / Technical Diagnostics' },
  { type: 'TAX_CLEARANCE', label: 'Tax Clearance Certificate' },
  { type: 'SIGNED_AGREEMENT', label: 'Signed Addendum or Power of Attorney' },
  { type: 'OTHER', label: 'Other Supporting Document' },
];

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  transactionId,
}) => {
  const { isStaff } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('GOVERNMENT_ID');
  const [isPrivateInternal, setIsPrivateInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!documentName) {
        setDocumentName(selected.name.replace(/\.[^/.]+$/, ''));
      }
      setError(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      if (!documentName) {
        setDocumentName(dropped.name.replace(/\.[^/.]+$/, ''));
      }
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a document file to upload.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_name', documentName.trim() || file.name);
      formData.append('document_type', documentType);
      if (isStaff) {
        formData.append('is_private_internal', isPrivateInternal ? 'true' : 'false');
      }

      await onUpload(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-600 rounded-md text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Encrypted Document Upload</h3>
              <p className="text-xs text-slate-300">End-to-end AES-256 Storage Vault</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop File Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-blue-600 bg-blue-50/50'
                : file
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.jpg,.jpeg,.png"
              className="hidden"
            />
            {file ? (
              <div className="flex flex-col items-center gap-1.5 text-xs text-slate-800">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
                <span className="font-semibold">{file.name}</span>
                <span className="text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                <span className="text-[11px] text-blue-700 underline mt-1">Click to replace file</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-xs text-slate-600">
                <Upload className="w-8 h-8 text-slate-400" />
                <span className="font-semibold text-slate-800">Click to upload or drag & drop</span>
                <span className="text-slate-400 text-[11px]">PDF, DOCX, PNG, JPG (up to 25MB)</span>
              </div>
            )}
          </div>

          {/* Document Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            >
              {DOCUMENT_TYPES.map((dt) => (
                <option key={dt.type} value={dt.type}>
                  {dt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Document Label Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Display Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g. Buyer Passport - Alex Dupont"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Staff-only Internal Toggle */}
          {isStaff && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPrivateInternal}
                  onChange={(e) => setIsPrivateInternal(e.target.checked)}
                  className="rounded border-amber-400 text-amber-900 focus:ring-amber-900"
                />
                <span className="text-xs font-medium text-amber-900">
                  Private Internal Legal Document (Hidden from Buyer)
                </span>
              </label>
            </div>
          )}

          {/* Security Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              All documents are encrypted with AES-256-GCM before storage. Download URLs are short-lived (5 min) and protected by cryptographic tokens.
            </span>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-xs transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>Encrypting & Storing...</>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Encrypt & Save Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
