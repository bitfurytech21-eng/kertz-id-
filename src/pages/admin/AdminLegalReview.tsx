import React, { useState } from 'react';
import { Scale, CheckCircle2, AlertCircle, Clock, Search, X, Eye, FileText, ArrowRight } from 'lucide-react';

interface LegalReviewItem {
  id: string;
  docRef: string;
  type: string;
  clientName: string;
  submittedDate: string;
  priority: 'Normal' | 'High' | 'Urgent';
  status: 'Pending' | 'Under Review' | 'Approved' | 'Requires Clarification';
  notes?: string;
  jurisdiction?: string;
}

const INITIAL_REVIEW_ITEMS: LegalReviewItem[] = [
  {
    id: 'REV-01',
    docRef: 'DOC-00482',
    type: 'Deed of Assignment',
    clientName: 'John Smith',
    submittedDate: '04 Oct',
    priority: 'Normal',
    status: 'Pending',
    notes: 'Submitted for Alpes-Maritimes property title transfer validation.',
    jurisdiction: 'France · Alpes-Maritimes',
  },
  {
    id: 'REV-02',
    docRef: 'DOC-00481',
    type: 'Sale Agreement',
    clientName: 'ABC Properties',
    submittedDate: '04 Oct',
    priority: 'High',
    status: 'Pending',
    notes: 'Escrow deposit verified. Priority closing requested.',
    jurisdiction: 'Paris 8e / Bouches-du-Rhône',
  },
];

export const AdminLegalReview: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [items, setItems] = useState<LegalReviewItem[]>(INITIAL_REVIEW_ITEMS);
  const [selectedItem, setSelectedItem] = useState<LegalReviewItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [decision, setReviewDecision] = useState<'Approved' | 'Requires Clarification'>('Approved');

  const handleCompleteReview = () => {
    if (!selectedItem) return;
    setItems(
      items.map((it) => (it.id === selectedItem.id ? { ...it, status: decision, notes: reviewNotes } : it))
    );
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 uppercase">
          LEGAL REVIEW
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Dossier review queue for generated deeds, sales agreements, and transaction instruments.
        </p>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-6 bg-white border border-slate-200 hover:border-slate-400 rounded-2xl shadow-xs transition-all space-y-4"
          >
            {/* Top Line: DOC-00482 Deed of Assignment John Smith */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                  {item.docRef}
                </span>
                <span className="font-serif font-bold text-sm text-slate-900">
                  {item.type}
                </span>
                <span className="text-xs font-semibold text-slate-700 font-sans">
                  {item.clientName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  item.priority === 'High'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  Priority: {item.priority}
                </span>

                <span className="text-xs font-mono text-slate-500">
                  Submitted: {item.submittedDate}
                </span>
              </div>
            </div>

            {/* Bottom Action: [Review] */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs font-mono text-slate-500">
                Status: <strong className="text-slate-800">{item.status.toUpperCase()}</strong>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(item)}
                className="px-5 py-2 bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-xs rounded-xl shadow-xs transition"
              >
                [Review]
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-[10px] text-slate-400 uppercase font-bold">{selectedItem.docRef}</span>
                <h3 className="font-serif font-bold text-base text-slate-900 uppercase">
                  Review: {selectedItem.type}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono text-[11px]">
              <div>Client: <strong className="text-slate-900">{selectedItem.clientName}</strong></div>
              <div>Submitted Date: {selectedItem.submittedDate}</div>
              <div>Priority: {selectedItem.priority}</div>
            </div>

            <div className="space-y-3">
              <label className="block font-semibold text-slate-700">Review Audit Decision</label>
              <select
                value={decision}
                onChange={(e) => setReviewDecision(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              >
                <option value="Approved">APPROVE & CLEAR LEGAL REVIEW</option>
                <option value="Requires Clarification">REQUEST FURTHER CLARIFICATION</option>
              </select>

              <label className="block font-semibold text-slate-700">Legal Reviewer Notes</label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter legal counsel remarks..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteReview}
                className="px-5 py-2 bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold rounded-xl shadow-md"
              >
                Submit Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
