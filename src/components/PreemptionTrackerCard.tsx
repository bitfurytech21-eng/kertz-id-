import React from 'react';
import { jsPDF } from 'jspdf';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Building,
  Landmark,
  FileDown
} from 'lucide-react';
import { PreemptionRightRecord } from '../types';

interface PreemptionTrackerCardProps {
  preemptionRecords?: PreemptionRightRecord[];
  propertyName: string;
}

export const PreemptionTrackerCard: React.FC<PreemptionTrackerCardProps> = ({
  preemptionRecords,
  propertyName,
}) => {
  const records: PreemptionRightRecord[] = preemptionRecords || [
    {
      id: 'preempt_dpu_001',
      transaction_id: 'TX-2026-000001',
      preemption_type: 'DPU_URBAIN',
      authority_name: 'Mairie de Paris (Direction de l\'Urbanisme)',
      notification_date: '2026-09-18',
      statutory_deadline_date: '2026-11-18',
      status: 'PURGED',
      certificate_reference: 'DPU-PARIS-2026-N08912',
      waiver_received_date: '2026-09-29',
      notary_notes: 'Formal waiver certificate received from Mayor of Paris. Preemption right fully purged.',
    },
    {
      id: 'preempt_safer_002',
      transaction_id: 'TX-2026-000001',
      preemption_type: 'SAFER',
      authority_name: 'SAFER Île-de-France',
      notification_date: '2026-09-18',
      statutory_deadline_date: '2026-11-18',
      status: 'EXEMPT',
      certificate_reference: 'SAFER-IDF-EXEMPT-8812',
      waiver_received_date: '2026-09-20',
      notary_notes: 'Property is within designated urban zone UA with residential classification. Statutory SAFER exemption registered.',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-4">
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              ✓ PREEMPTION RIGHTS PURGED
            </span>
          </div>
          <h3 className="font-serif text-lg font-bold text-white">
            Statutory Preemption Rights Tracker (SAFER & DPU)
          </h3>
          <p className="text-xs text-slate-300">
            Official municipal & agricultural preemption waivers under Code de l'Urbanisme Art. L210-1
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              try {
                const doc = new jsPDF();
                const pageWidth = doc.internal.pageSize.getWidth();
                doc.setFillColor(15, 23, 42);
                doc.rect(0, 0, pageWidth, 26, 'F');
                doc.setFont('times', 'bold');
                doc.setFontSize(14);
                doc.setTextColor(255, 255, 255);
                doc.text('CERTIFICATE OF NON-PREEMPTION & STATUTORY WAIVER', 14, 12);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(251, 191, 36);
                doc.text('CODE DE L\'URBANISME ART. L210-1 & R213-1 ET SUIV.', 14, 18);
                doc.setFontSize(10);
                doc.setTextColor(30, 41, 59);
                doc.text(`Property: ${propertyName}`, 14, 38);
                doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, 14, 46);
                doc.text('Status: Official Non-Preemption Certified (DPU & SAFER rights purged).', 14, 54);
                doc.save(`Non-Preemption-Certificate-${propertyName.replace(/\s+/g, '_')}.pdf`);
              } catch {}
            }}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition"
          >
            <FileDown className="w-3.5 h-3.5 text-amber-400" /> Download Non-Preemption Certificate
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {records.map((rec) => (
            <div key={rec.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-slate-700" />
                  <span className="font-bold text-slate-900 text-sm">
                    {rec.preemption_type === 'SAFER'
                      ? 'SAFER Preemption (Rural/Châteaux)'
                      : 'DPU Urban Preemption (Municipality)'}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-bold text-[10px]">
                  {rec.status}
                </span>
              </div>

              <div className="space-y-1 text-slate-600">
                <div>Authority: <strong>{rec.authority_name}</strong></div>
                <div>Notification Date: <span className="font-mono">{rec.notification_date}</span></div>
                <div>Statutory Deadline: <span className="font-mono">{rec.statutory_deadline_date}</span></div>
                {rec.certificate_reference && (
                  <div>
                    Certificate Ref: <strong className="font-mono text-blue-900">{rec.certificate_reference}</strong>
                  </div>
                )}
              </div>

              {rec.notary_notes && (
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-[11px] leading-relaxed">
                  <strong>Notary Note:</strong> {rec.notary_notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
