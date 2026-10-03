import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Transaction,
  LegalCheck,
  Payment,
  ClosingChecklistItem,
  Contract,
  ContractSignature,
} from '../types';

interface PdfData {
  transaction: Transaction;
  legalChecks: LegalCheck[];
  payments: Payment[];
  closingChecklist: ClosingChecklistItem[];
  contract: Contract | null;
  signatures: ContractSignature[];
}

export function generateTransactionPdf({
  transaction,
  legalChecks,
  payments,
  closingChecklist,
  contract,
  signatures,
}: PdfData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const nowStr = new Date().toUTCString();

  // Primary Header Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Brand Name
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('KRETZ', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(251, 191, 36); // amber-400
  doc.text('LEGAL PROPERTY TRANSACTION WORKSPACE • CONFIDENTIAL', 14, 18);

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`REPORT REF: ${transaction.id} | ${new Date().toLocaleDateString()}`, pageWidth - 14, 18, { align: 'right' });

  // Document Title
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('TRANSACTION STATUS & DUE DILIGENCE AUDIT SUMMARY', 14, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${nowStr} (UTC) | Encrypted Vault Export`, 14, 43);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(14, 46, pageWidth - 14, 46);

  // Section 1: Property & Client Overview
  autoTable(doc, {
    startY: 50,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [100, 116, 139], cellWidth: 35 },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', textColor: [100, 116, 139], cellWidth: 35 },
      3: { cellWidth: 55 },
    },
    body: [
      [
        'Property Name:',
        transaction.property_name,
        'Transaction Ref:',
        transaction.id,
      ],
      [
        'Legal Address:',
        transaction.property_address,
        'Current Stage:',
        `Stage ${transaction.current_step} of 8 (${transaction.status.replace(/_/g, ' ')})`,
      ],
      [
        'Cadastral Plot:',
        transaction.cadastral_id || 'Pending extract',
        'Buyer Principal:',
        `${transaction.client_name || 'Client'} (${transaction.client_email || ''})`,
      ],
      [
        'Habitable Surface:',
        `${transaction.property_size_sqm || 225} m² (Carrez Certified)`,
        'Assigned Counsel:',
        transaction.legal_officer_name || 'Maître Claire de Saint-Germain',
      ],
      [
        'Agreed Purchase Price:',
        `${transaction.currency} ${transaction.agreed_price.toLocaleString()}`,
        'Transaction Manager:',
        transaction.transaction_officer_name || 'Marcus Vance',
      ],
    ],
  });

  // Section 2: 9-Point Legal Due Diligence Checks
  let currentY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. LEGAL DUE DILIGENCE AUDIT CHECKS', 14, currentY);

  const checksData = legalChecks.map((c) => [
    c.title,
    c.status,
    c.assigned_professional_name,
    c.findings || c.client_visible_notes || 'Under review',
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Audit Check Item', 'Status', 'Assigned Auditor', 'Summary Findings']],
    body: checksData,
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2.5,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 40 },
      3: { cellWidth: 'auto' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        const val = String(data.cell.raw);
        if (val === 'CLEARED' || val === 'RESOLVED') {
          data.cell.styles.textColor = [16, 185, 129]; // emerald
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'IN_PROGRESS' || val === 'PENDING') {
          data.cell.styles.textColor = [37, 99, 235]; // blue
        } else if (val === 'ISSUE_FOUND') {
          data.cell.styles.textColor = [225, 29, 72]; // rose
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Section 3: Contract & E-Signature
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Add new page if space is low
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. CONTRACT & BILATERAL E-SIGNATURE STATUS', 14, currentY);

  const sigRows = signatures.map((s) => [
    s.signer_name,
    s.signer_role,
    new Date(s.signed_at).toLocaleString(),
    s.audit_certificate_hash.substring(0, 24) + '...',
  ]);

  if (sigRows.length === 0) {
    sigRows.push(['Pending Signatures', 'Buyer & Legal Counsel', 'Scheduled', 'Awaiting execution']);
  }

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Signatory Name', 'Role', 'Signed Timestamp', 'Cryptographic Seal Hash']],
    body: sigRows,
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 },
  });

  // Section 4: Escrow Payment Schedule
  currentY = (doc as any).lastAutoTable.finalY + 8;
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. NOTARIAL ESCROW & PAYMENT CLEARANCE SCHEDULE', 14, currentY);

  const paymentRows = payments.map((p) => [
    p.description,
    `${p.currency} ${p.amount.toLocaleString()}`,
    p.due_date || 'Closing',
    p.status,
    p.transaction_reference || 'Pending Wire',
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Payment Milestone', 'Amount', 'Due Date', 'Escrow Status', 'Bank Reference']],
    body: paymentRows,
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const val = String(data.cell.raw);
        if (val === 'CONFIRMED') {
          data.cell.styles.textColor = [16, 185, 129];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Section 5: Closing Checklist Summary
  currentY = (doc as any).lastAutoTable.finalY + 8;
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('4. FINAL CLOSING CHECKLIST PROGRESS (8 STAGES)', 14, currentY);

  const checklistRows = closingChecklist.map((item) => [
    `Stage ${item.order_index}: ${item.item_title}`,
    item.required_role,
    item.status,
    item.completed_at ? `${new Date(item.completed_at).toLocaleDateString()} (${item.completed_by})` : 'Pending',
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Milestone Item', 'Responsible Role', 'Status', 'Completion Details']],
    body: checklistRows,
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        const val = String(data.cell.raw);
        if (val === 'COMPLETED') {
          data.cell.styles.textColor = [16, 185, 129];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Footer on all pages
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 285, pageWidth - 14, 285);
    doc.text(
      'Kretz Legal Property Workspace • Legally Protected & Confidential Document • kretz.site',
      14,
      289,
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, 289, { align: 'right' });
  }

  // Save the PDF
  doc.save(`Kretz_Legal_Summary_${transaction.id}.pdf`);
}
