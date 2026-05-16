/**
 * Receipt PDF Generator
 * Generates professional receipts with school branding
 */
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const PAYMENT_TYPE_LABELS = {
  mensualite: 'Mensualité',
  assurance: 'Assurance Scolaire',
  transport: 'Transport Scolaire',
  autre: 'Autre',
};

const PAYMENT_METHOD_LABELS = {
  especes: 'Espèces',
  cheque: 'Chèque',
  virement: 'Virement Bancaire',
};

export async function generateReceiptPDF({ payment: p, student: s, settings }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait' });
  const W = 148; // A5 width
  let y = 0;

  const schoolName = settings?.school_name || 'Le Schéma';
  const schoolAddr = settings?.school_address || 'Maroc';
  const schoolPhone = settings?.school_phone || '';
  const schoolEmail = settings?.school_email || '';
  const footer = settings?.receipt_footer || 'Merci de votre confiance';

  // ─── Header Background ─────────────────────────────────────────
  doc.setFillColor(249, 115, 22); // orange
  doc.rect(0, 0, W, 35, 'F');

  // School name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(schoolName, W / 2, 13, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(schoolAddr, W / 2, 19, { align: 'center' });
  if (schoolPhone) doc.text(`Tél: ${schoolPhone}`, W / 2, 24, { align: 'center' });
  if (schoolEmail) doc.text(schoolEmail, W / 2, 29, { align: 'center' });

  y = 40;

  // ─── Receipt title + number ────────────────────────────────────
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('REÇU DE PAIEMENT', W / 2, y, { align: 'center' });
  y += 7;

  doc.setFillColor(249, 245, 235);
  doc.roundedRect(10, y - 3, W - 20, 10, 2, 2, 'F');
  doc.setTextColor(249, 115, 22);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(p.receiptNumber, W / 2, y + 3.5, { align: 'center' });
  y += 14;

  // ─── Date + Method ──────────────────────────────────────────────
  const pDate = new Date(p.paymentDate).toLocaleDateString('fr-MA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const pTime = new Date(p.paymentDate).toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' });

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${pDate} à ${pTime}`, 12, y);
  doc.text(`Mode: ${PAYMENT_METHOD_LABELS[p.paymentMethod] || p.paymentMethod}`, W - 12, y, { align: 'right' });
  y += 8;

  // ─── Divider ────────────────────────────────────────────────────
  doc.setDrawColor(220, 220, 220);
  doc.line(10, y, W - 10, y);
  y += 8;

  // ─── Student info ──────────────────────────────────────────────
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(10, y - 3, W - 20, 30, 2, 2, 'F');
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(10, y - 3, W - 20, 30, 2, 2, 'D');

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMATIONS ÉLÈVE', 14, y + 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);

  const studentInfoLeft = [
    ['Nom complet:', `${s.firstName} ${s.lastName}`],
    ['Classe:', s.className || '—'],
    ['Code élève:', s.code],
  ];
  const studentInfoRight = [
    ['Parent:', s.parentName],
    ['Téléphone:', s.parentPhone],
  ];

  let infoY = y + 8;
  studentInfoLeft.forEach(([label, val]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text(label, 14, infoY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(val, 40, infoY);
    infoY += 5.5;
  });

  infoY = y + 8;
  studentInfoRight.forEach(([label, val]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text(label, W / 2 + 4, infoY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(val, W / 2 + 22, infoY);
    infoY += 5.5;
  });

  y += 35;

  // ─── Payment details table ─────────────────────────────────────
  doc.setDrawColor(200, 200, 200);
  doc.line(10, y, W - 10, y);
  y += 5;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('DÉSIGNATION', 14, y);
  doc.text('PÉRIODE', 80, y);
  doc.text('MONTANT', W - 14, y, { align: 'right' });
  y += 3;

  doc.setDrawColor(249, 115, 22);
  doc.setLineWidth(0.5);
  doc.line(10, y, W - 10, y);
  doc.setLineWidth(0.2);
  doc.setDrawColor(200, 200, 200);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  const typeLabel = PAYMENT_TYPE_LABELS[p.type] || p.type;
  doc.text(typeLabel, 14, y);
  if (p.month) doc.text(p.month, 80, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`${p.amount.toFixed(2)} DH`, W - 14, y, { align: 'right' });
  y += 6;

  doc.line(10, y, W - 10, y);
  y += 5;

  // Totals
  const totals = [
    { label: 'Montant Total:', value: `${p.amount.toFixed(2)} DH`, bold: false },
    { label: 'Montant Payé:', value: `${p.amountPaid.toFixed(2)} DH`, bold: true, color: [22, 163, 74] },
  ];

  if (p.remaining > 0) {
    totals.push({ label: 'Reste à Payer:', value: `${p.remaining.toFixed(2)} DH`, bold: true, color: [220, 38, 38] });
  }

  totals.forEach(({ label, value, bold, color }) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 10 : 9);
    doc.setTextColor(color ? color[0] : (bold ? 30 : 100), color ? color[1] : (bold ? 30 : 100), color ? color[2] : (bold ? 30 : 100));
    doc.text(label, W - 50, y);
    doc.text(value, W - 14, y, { align: 'right' });
    y += 6;
  });

  y += 5;

  // ─── Partial payment warning ────────────────────────────────────
  if (p.remaining > 0) {
    doc.setFillColor(255, 245, 230);
    doc.roundedRect(10, y - 3, W - 20, 10, 2, 2, 'F');
    doc.setTextColor(180, 80, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`⚠ Paiement partiel - Reste dû: ${p.remaining.toFixed(2)} DH`, W / 2, y + 2, { align: 'center' });
    y += 14;
  }

  y += 5;

  // ─── Signatures ────────────────────────────────────────────────
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Signature du Payeur:', 14, y);
  doc.text('Cachet & Signature:', W - 14, y, { align: 'right' });
  y += 18;

  doc.setDrawColor(180, 180, 180);
  doc.line(14, y, 60, y);
  doc.line(W - 60, y, W - 14, y);
  y += 8;

  // ─── Footer ─────────────────────────────────────────────────────
  doc.setFillColor(249, 115, 22);
  doc.rect(0, doc.internal.pageSize.getHeight() - 12, W, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(footer, W / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });

  return doc.output('arraybuffer');
}
