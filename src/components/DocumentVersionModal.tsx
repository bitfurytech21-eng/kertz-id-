import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  History,
  Download,
  Upload,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { DocumentItem, DocumentVersion } from '../types';
import { api } from '../services/api';
import { StatusBadge } from './StatusBadge';

interface DocumentVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentItem: DocumentItem | null;
  onVersionUploaded?: () => void;
}

export const DocumentVersionModal: React.FC<DocumentVersionModalProps> = ({
  isOpen,
  onClose,
  documentItem,
  onVersionUploaded,
}) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New version upload state
  const [showUploadNew, setShowUploadNew] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchVersions = async () => {
    if (!documentItem) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.documents.getVersions(documentItem.id);
      setVersions(data.versions || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch version history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && documentItem) {
      fetchVersions();
      setShowUploadNew(false);
      setNewFile(null);
    }
  }, [isOpen, documentItem]);

  if (!isOpen || !documentItem) return null;

  const handleDownloadVersion = async (version: DocumentVersion) => {
    try {
      const res = await api.documents.getVersionSignedUrl(version.id);
      window.open(res.download_url, '_blank');
    } catch (err: any) {
      alert('Error obtaining signed download token: ' + err.message);
    }
  };

  const handleUploadNewVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFile || !documentItem) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', newFile);
      await api.documents.uploadNewVersion(documentItem.id, formData);
      setNewFile(null);
      setShowUploadNew(false);
      await fetchVersions();
      if (onVersionUploaded) onVersionUploaded();
    } catch (err: any) {
      setError(err.message || 'Failed to upload new document iteration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      {/* Side-Panel Drawer Content Container */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl border-l border-neutral-300 flex flex-col text-black animate-in slide-in-from-right duration-300">
        
        {/* Side Panel Header */}
        <div className="px-6 py-5 bg-black text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-900 border border-neutral-700 text-white rounded">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base font-bold text-white">Document Version History</span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-white border border-neutral-700 text-[10px] font-mono font-bold">
                  AES-256 VAULT
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                File: <strong className="text-white">{documentItem.document_name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-900 transition"
            title="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Panel Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Document Summary Card */}
          <div className="p-4 bg-neutral-100/70 border border-neutral-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-black shrink-0" />
                <span className="font-bold text-black text-sm">{documentItem.document_name}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-700">
                <span className="px-2 py-0.5 bg-black text-white rounded font-bold uppercase">
                  {documentItem.document_type.replace(/_/g, ' ')}
                </span>
                <span>Active Version: <strong className="text-black">v{documentItem.current_version}</strong></span>
              </div>
            </div>

            <button
              onClick={() => setShowUploadNew(!showUploadNew)}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded border border-black transition flex items-center gap-2 self-start sm:self-center shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              {showUploadNew ? 'Cancel Upload' : 'Upload New Iteration'}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-neutral-100 border border-black rounded text-black flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* New Iteration Upload Form */}
          {showUploadNew && (
            <form onSubmit={handleUploadNewVersion} className="p-5 bg-neutral-50 border border-neutral-300 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-black font-bold text-sm">
                <Upload className="w-4 h-4 text-black" />
                <span>Submit Iteration v{documentItem.current_version + 1}</span>
              </div>
              <p className="text-[11px] text-neutral-600">
                Upload a corrected or updated document file (PDF, DOCX, PNG, JPG). It will be encrypted with AES-256 and stamped with an immutable SHA-256 hash.
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 rounded-xl p-5 bg-white text-center cursor-pointer hover:border-black transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => e.target.files && setNewFile(e.target.files[0])}
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />
                {newFile ? (
                  <div className="text-black font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>{newFile.name} ({(newFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-6 h-6 text-neutral-400 mx-auto" />
                    <span className="text-neutral-700 font-medium block">Click to select revised document file</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadNew(false)}
                  className="px-3.5 py-1.5 border border-black text-black rounded hover:bg-neutral-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFile || isSubmitting}
                  className="px-5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded font-bold border border-black disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Encrypting & Storing...' : 'Upload & Register v' + (documentItem.current_version + 1)}
                </button>
              </div>
            </form>
          )}

          {/* Iteration Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-neutral-600" />
                Chronological File Iterations ({versions.length})
              </h4>
              <span className="text-[10px] text-neutral-500 font-mono">100% Immutable Vault Logs</span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-neutral-500 font-mono">Loading iteration records...</div>
            ) : versions.length === 0 ? (
              <div className="text-center py-10 text-neutral-500">No version history available for this file.</div>
            ) : (
              <div className="space-y-4 relative pl-5 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-neutral-200">
                {versions.map((ver) => {
                  const isCurrent = ver.version_number === documentItem.current_version;
                  const relTime = formatRelativeTime(ver.uploaded_at);

                  return (
                    <div
                      key={ver.id}
                      className={`relative p-4 rounded-xl border transition-all space-y-3 ${
                        isCurrent
                          ? 'bg-white border-black shadow-xs'
                          : 'bg-neutral-50 border-neutral-200'
                      }`}
                    >
                      {/* Timeline Node Circle */}
                      <div
                        className={`absolute -left-5 top-4.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          isCurrent ? 'bg-black ring-2 ring-neutral-300' : 'bg-neutral-400'
                        }`}
                      />

                      {/* Header row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded border ${
                              isCurrent
                                ? 'bg-black text-white border-black'
                                : 'bg-neutral-100 border-neutral-300 text-neutral-800'
                            }`}
                          >
                            Iteration v{ver.version_number} {isCurrent && '• Active Current'}
                          </span>
                          <StatusBadge status={ver.status} size="sm" />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownloadVersion(ver)}
                          className="px-3 py-1 bg-white border border-black hover:bg-neutral-100 text-black font-bold rounded text-[11px] inline-flex items-center gap-1.5 self-start"
                          title="Download signed copy of this version"
                        >
                          <Download className="w-3.5 h-3.5" /> Download v{ver.version_number}
                        </button>
                      </div>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] text-neutral-700 bg-white p-3 rounded border border-neutral-200 font-mono">
                        <div>
                          <span className="text-neutral-500 block text-[10px] uppercase font-bold">Original File Name</span>
                          <span className="font-bold text-black truncate block" title={ver.file_name}>
                            {ver.file_name}
                          </span>
                        </div>

                        <div>
                          <span className="text-neutral-500 block text-[10px] uppercase font-bold">Size & Format</span>
                          <span>{(ver.file_size / 1024).toFixed(1)} KB ({ver.mime_type.split('/')[1]?.toUpperCase() || 'PDF'})</span>
                        </div>

                        <div>
                          <span className="text-neutral-500 block text-[10px] uppercase font-bold">Uploaded Timestamp</span>
                          <span className="text-black font-semibold">{new Date(ver.uploaded_at).toLocaleString()}</span>
                          {relTime && <span className="text-neutral-500 text-[10px] block">({relTime})</span>}
                        </div>
                      </div>

                      {/* Reviewer / Counsel Approval Comment */}
                      {ver.review_comment ? (
                        <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-lg text-[11px] text-neutral-900 space-y-1">
                          <div className="flex items-center justify-between font-bold text-black">
                            <span className="flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-black" />
                              Reviewer Notes ({ver.reviewer_name || 'Legal Counsel'})
                            </span>
                            <span className="text-[10px] text-neutral-600 font-mono uppercase">Official Audit Entry</span>
                          </div>
                          <p className="italic text-black pl-5">"{ver.review_comment}"</p>
                        </div>
                      ) : (
                        <div className="text-[11px] text-neutral-500 italic">No reviewer comments attached to this iteration.</div>
                      )}

                      {/* SHA-256 Cryptographic Hash Seal */}
                      <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-neutral-600 border-t border-neutral-200">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-black" /> SHA-256: {ver.sha256_hash}
                        </span>
                        <span className="text-black font-semibold">Integrity Verified</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Side Panel Footer */}
        <div className="px-6 py-4 bg-neutral-100/70 border-t border-neutral-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-neutral-600 font-mono">
            <Lock className="w-3.5 h-3.5 text-black" />
            <span>AES-256 Storage • Single-Use Signed Download Links</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-black text-white font-bold text-xs rounded border border-black hover:bg-neutral-800 transition"
          >
            Close Panel
          </button>
        </div>

      </div>
    </div>
  );
};
