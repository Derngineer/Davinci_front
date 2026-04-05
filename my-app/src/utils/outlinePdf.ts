/**
 * outlinePdf.ts
 * Builds a clean, branded A4-portrait PDF from a course-outline API response.
 * jsPDF + jspdf-autotable — real vector PDF, not a screenshot.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getQrBase64 } from './qrBase64';

/* ── Types ─────────────────────────────────────────────────── */
interface OutlinePdfData {
  student_name: string;
  grade: string;
  subject: string;
  exam_board: string;
  course_outline: string; // raw HTML with a <table>
}

/* ── Brand palette (navy / indigo / blue) ──────────────────── */
const NAVY = '#0b1a3e';          // deep navy — header bg
const INDIGO = '#1d0a7f';        // indigo accent
const BLUE = '#2E3192';          // brand blue — logo, rules
const BLUE_MID = '#0d6efd';      // mid blue — section text
const BLUE_LIGHT = '#e8f0fe';    // light blue tint — alt rows
const DARK = '#1a1a1a';
const GRAY = '#333333';
const MUTED = '#999999';
const HEAD_BG = NAVY;            // dark navy header
const HEAD_TEXT = '#ffffff';      // white text on navy
const ALT_BG = BLUE_LIGHT;       // light blue alternating rows

/* ── Helpers ───────────────────────────────────────────────── */

function stripHtml(html: string): string {
  const el = document.createElement('div');
  el.innerHTML = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|li|ul|ol|tr|td|th|h\d)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  return (el.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
}

function parseHtmlTable(html: string): { headers: string[]; rows: string[][] } {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const table = doc.querySelector('table');
  if (!table) return { headers: [], rows: [] };

  // Detect checkbox columns
  const cbCols = new Set<number>();
  table.querySelectorAll('tr').forEach((tr) =>
    tr.querySelectorAll('th, td').forEach((cell, i) => {
      if (cell.querySelector('input[type="checkbox"]')) cbCols.add(i);
    }),
  );

  // Headers
  const headers: string[] = [];
  const headRow = table.querySelector('thead tr') || table.querySelector('tr:has(th)');
  headRow?.querySelectorAll('th, td').forEach((cell, i) => {
    if (!cbCols.has(i)) headers.push(stripHtml(cell.innerHTML));
  });

  // Body
  const bodyTrs = table.querySelectorAll('tbody tr');
  const trs = bodyTrs.length ? bodyTrs : table.querySelectorAll('tr');
  const rows: string[][] = [];
  trs.forEach((tr, idx) => {
    if (!bodyTrs.length && idx === 0 && headRow === tr) return;
    const cells: string[] = [];
    tr.querySelectorAll('td, th').forEach((td, i) => {
      if (!cbCols.has(i)) cells.push(stripHtml(td.innerHTML));
    });
    if (cells.length) rows.push(cells);
  });

  if (!headers.length && rows.length) headers.push(...rows.shift()!);
  return { headers, rows };
}

/* ── Main ──────────────────────────────────────────────────── */

export async function downloadOutlinePdf(data: OutlinePdfData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const qrBase64 = await getQrBase64();
  const W = doc.internal.pageSize.getWidth();   // 210
  const H = doc.internal.pageSize.getHeight();  // 297
  const ML = 14;
  const MR = 14;
  const CW = W - ML - MR; // 182 mm usable

  let y = 16;

  /* ── Header ─────────────────────────────────────────────── */
  // Brand — top left
  doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(BLUE);
  doc.text('DAVINCI', ML, y);

  // Website URL — below brand name
  doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(MUTED);
  doc.text('www.davincisolver.com', ML, y + 4.5);

  // QR code — top right
  const qrSize = 18; // mm
  doc.addImage(qrBase64, 'PNG', W - MR - qrSize, y - 6, qrSize, qrSize);

  /* ── Title — to the right of the brand ──────────────────── */
  const titleX = ML + 46;
  doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(INDIGO);
  const titleText = `${data.exam_board} \u2014 ${data.subject} Course Outline`;
  const titleLines = doc.splitTextToSize(titleText, CW - 46);
  doc.text(titleLines, titleX, y);

  const titleBottom = y + titleLines.length * 5;

  // Navy rule from title to right margin
  doc.setDrawColor(NAVY).setLineWidth(0.5);
  doc.line(titleX, titleBottom + 1, W - MR, titleBottom + 1);

  /* ── Student details — labelled, below the rule ─────────── */
  let dy = titleBottom + 5;
  doc.setFontSize(9).setTextColor(GRAY);

  const details = [
    { label: 'Student:', value: data.student_name },
    { label: 'Grade:', value: data.grade },
    { label: 'Exam Board:', value: data.exam_board },
  ];
  details.forEach(({ label, value }) => {
    doc.setFont('helvetica', 'bold').setTextColor(BLUE_MID);
    doc.text(label, titleX, dy);
    doc.setFont('helvetica', 'normal').setTextColor(DARK);
    doc.text(` ${value}`, titleX + doc.getTextWidth(label) + 1, dy);
    dy += 4.5;
  });

  y = dy + 4;

  /* ── Table ──────────────────────────────────────────────── */
  const { headers, rows } = parseHtmlTable(data.course_outline);

  if (!headers.length && !rows.length) {
    // Fallback — plain text
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(GRAY);
    doc.text(doc.splitTextToSize(stripHtml(data.course_outline), CW), ML, y);
  } else {
    /* ── Detect checklist / review column and insert ---- dividers ── */
    const checklistIdx: number[] = [];
    headers.forEach((h, i) => {
      const lower = h.toLowerCase();
      if (
        lower.includes('checklist') ||
        lower.includes('review') ||
        lower.includes('notes') ||
        lower.includes('comment')
      ) {
        checklistIdx.push(i);
      }
    });

    // Insert ---- separators between bullet items in those columns
    const processedRows = rows.map((row) => {
      return row.map((cell, colIdx) => {
        if (!checklistIdx.includes(colIdx)) return cell;
        // Split on newlines, rejoin with ---- between items
        const lines = cell
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length > 0);
        if (lines.length <= 1) return cell;
        return lines.join('\n────\n');
      });
    });

    /* ── Column styles — widen checklist/review/notes columns ── */
    const columnStyles: Record<number, object> = {};
    const colCount = headers.length;

    // Give checklist/review/notes columns 35% extra weight
    // by setting a generous minCellWidth
    checklistIdx.forEach((idx) => {
      columnStyles[idx] = { cellWidth: Math.max(45, CW / colCount * 1.35) };
    });

    // Narrow columns: #, Week, Hours, Term
    headers.forEach((h, i) => {
      const lower = h.toLowerCase().trim();
      if (['#', 'week', 'term', 'no', 'no.'].includes(lower) ||
          lower.includes('hour') || lower.includes('est.') || lower.includes('time')) {
        columnStyles[i] = { cellWidth: 16, halign: 'center' };
      }
    });

    autoTable(doc, {
      startY: y,
      margin: { left: ML, right: MR, top: 14, bottom: 14 },
      head: [headers],
      body: processedRows,
      columnStyles,

      styles: {
        font: 'helvetica',
        fontSize: 8,
        textColor: GRAY,
        lineColor: '#c5cae9',       // soft indigo grid lines
        lineWidth: 0.15,
        cellPadding: 2.5,
        overflow: 'linebreak',
        valign: 'top',
      },
      headStyles: {
        fillColor: HEAD_BG,         // navy
        textColor: HEAD_TEXT,       // white on navy
        fontStyle: 'bold',
        fontSize: 8,
        lineColor: '#1a237e',       // darker navy grid
        lineWidth: 0.3,
      },
      alternateRowStyles: { fillColor: ALT_BG },  // light blue tint

      /* Footer on every page */
      didDrawPage: (hookData) => {
        // Thin navy line above footer
        const fy = H - 12;
        doc.setDrawColor(NAVY).setLineWidth(0.3);
        doc.line(ML, fy, W - MR, fy);

        // QR code in footer — left side
        const footerQr = 9; // mm
        doc.addImage(qrBase64, 'PNG', ML, fy + 0.5, footerQr, footerQr);

        // Footer text in brand blue — shifted right to make room for QR
        const textStart = ML + footerQr + 2;
        doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(BLUE);
        doc.text('DAVINCI', textStart, fy + 4);
        doc.setFont('helvetica', 'normal').setTextColor(MUTED);
        doc.text(' \u2014 www.davincisolver.com', textStart + doc.getTextWidth('DAVINCI') + 1, fy + 4);

        // Page number right-aligned
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pg = (doc as any).internal.getCurrentPageInfo().pageNumber;
        doc.setTextColor(INDIGO);
        doc.text(`Page ${pg}`, W - MR, fy + 4, { align: 'right' });

        // Light navy rule on continuation pages
        if (hookData.pageNumber > 1) {
          doc.setDrawColor(NAVY).setLineWidth(0.2);
          doc.line(ML, 10, W - MR, 10);
        }
      },
    });
  }

  /* ── Save ────────────────────────────────────────────────── */
  const name = data.student_name.replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'Student';
  const subj = data.subject.replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'Course';
  doc.save(`${name} - ${subj} Course Outline.pdf`);
}
