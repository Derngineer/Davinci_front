/**
 * gradeReportPdf.ts
 * Builds a clean, branded A4-portrait PDF from grading data.
 * Uses jsPDF directly — vector text, no html2canvas screenshots.
 * Immune to dark mode, CSS variables, and animation issues.
 */

import { jsPDF } from 'jspdf';
import type { GradeData } from '../services/grader';
import { getQrBase64 } from './qrBase64';

/* ── Brand palette ─────────────────────────────────────────── */
const INDIGO      = '#6366f1';
const INDIGO_DARK = '#4f46e5';
const GREEN       = '#10b981';
const AMBER       = '#f59e0b';
const RED         = '#ef4444';
const DARK        = '#111827';
const GRAY        = '#374151';
const MUTED       = '#6b7280';
const LIGHT_GRAY  = '#9ca3af';
const BORDER      = '#e5e7eb';
const BG_LIGHT    = '#f9fafb';

/* ── Helpers ───────────────────────────────────────────────── */

function scoreColor(score: number, max: number): string {
  const r = score / (max || 1);
  if (r >= 0.75) return GREEN;
  if (r >= 0.5)  return AMBER;
  return RED;
}

/** Strip LaTeX delimiters for plain-text PDF rendering */
function stripLatex(text: string): string {
  return (text ?? '')
    // Block math: $$...$$ and \[...\]
    .replace(/\$\$(.*?)\$\$/gs, '$1')
    .replace(/\\\[(.*?)\\\]/gs, '$1')
    // Inline math: $...$ and \(...\)
    .replace(/\$(.*?)\$/g, '$1')
    .replace(/\\\((.*?)\\\)/g, '$1')
    // Common LaTeX commands with one argument: \textbf{...}, \emph{...}, etc.
    .replace(/\\(?:textbf|textit|textrm|texttt|emph|underline|overline|boldsymbol|mathbf|mathrm|mathit|mathcal|mathbb|text|operatorname)\{([^}]*)\}/g, '$1')
    // \frac{a}{b} → a/b
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
    // \sqrt{x} → √x
    .replace(/\\sqrt\{([^}]*)\}/g, '√$1')
    // Greek letters: \alpha → alpha, \beta → beta, etc.
    .replace(/\\(alpha|beta|gamma|delta|epsilon|theta|lambda|mu|sigma|omega|pi|phi|psi|tau|rho|nu|xi|zeta|eta|kappa|chi|infty|cdot|times|div|pm|mp|leq|geq|neq|approx|equiv|propto|sum|prod|int|partial|nabla|forall|exists|rightarrow|leftarrow|Rightarrow|Leftarrow|therefore|because)\b/gi, '$1')
    // Remaining \command → remove the backslash and command name
    .replace(/\\[a-zA-Z]+/g, '')
    // Remove stray braces and backslashes
    .replace(/[{}\\]/g, '')
    // Collapse multiple spaces / normalize whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

/**
 * Comprehensive sanitizer for jsPDF text.
 * Handles LaTeX, Markdown, HTML, Unicode, emoji, and long strings.
 * jsPDF Helvetica only supports Latin-1, so we replace everything else.
 */
function sanitize(raw: string): string {
  let t = stripLatex(raw);

  // ── Strip Markdown formatting ──
  // Bold: **text** or __text__
  t = t.replace(/\*\*(.+?)\*\*/g, '$1');
  t = t.replace(/__(.+?)__/g, '$1');
  // Italic: *text* or _text_
  t = t.replace(/\*(.+?)\*/g, '$1');
  t = t.replace(/_(.+?)_/g, '$1');
  // Strikethrough: ~~text~~
  t = t.replace(/~~(.+?)~~/g, '$1');
  // Inline code: `text`
  t = t.replace(/`(.+?)`/g, '$1');
  // Headings: ### text → text
  t = t.replace(/^#{1,6}\s+/gm, '');
  // Bullet lists: - item or * item → • item
  t = t.replace(/^[-*]\s+/gm, '• ');
  // Numbered lists: 1. item → 1) item (keep the number)
  t = t.replace(/^(\d+)\.\s+/gm, '$1) ');
  // Links: [text](url) → text
  t = t.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Images: ![alt](url) → (remove entirely)
  t = t.replace(/!\[[^\]]*\]\([^)]+\)/g, '');

  // ── Strip HTML tags & decode entities ──
  t = t.replace(/<br\s*\/?>/gi, '\n');
  t = t.replace(/<[^>]+>/g, '');
  t = t.replace(/&amp;/g, '&');
  t = t.replace(/&lt;/g, '<');
  t = t.replace(/&gt;/g, '>');
  t = t.replace(/&quot;/g, '"');
  t = t.replace(/&#39;/g, "'");
  t = t.replace(/&nbsp;/g, ' ');

  // ── Replace Unicode math/symbols with Latin-1 safe equivalents ──
  const unicodeMap: Record<string, string> = {
    '≥': '>=', '≤': '<=', '≠': '!=', '≈': '~=', '≡': '===',
    '→': '->', '←': '<-', '⇒': '=>', '⇐': '<=',
    '∞': 'inf', '∑': 'sum', '∫': 'int', '∏': 'prod',
    '∂': 'd', '∇': 'nabla', '∀': 'for all', '∃': 'exists',
    '∈': 'in', '∉': 'not in', '⊂': 'subset', '⊃': 'superset',
    '∪': 'union', '∩': 'intersect', '∅': 'empty',
    'α': 'alpha', 'β': 'beta', 'γ': 'gamma', 'δ': 'delta',
    'ε': 'epsilon', 'ζ': 'zeta', 'η': 'eta', 'θ': 'theta',
    'ι': 'iota', 'κ': 'kappa', 'λ': 'lambda', 'μ': 'mu',
    'ν': 'nu', 'ξ': 'xi', 'π': 'pi', 'ρ': 'rho',
    'σ': 'sigma', 'τ': 'tau', 'υ': 'upsilon', 'φ': 'phi',
    'χ': 'chi', 'ψ': 'psi', 'ω': 'omega',
    'Δ': 'Delta', 'Σ': 'Sigma', 'Ω': 'Omega', 'Π': 'Pi',
    '×': 'x', '÷': '/', '±': '+/-', '∓': '-/+',
    '·': '.', '…': '...', '—': '-', '–': '-',
    '\u201C': '"', '\u201D': '"', '\u2018': "'", '\u2019': "'",
    '√': 'sqrt', '∝': 'prop. to',
  };
  for (const [uni, ascii] of Object.entries(unicodeMap)) {
    t = t.split(uni).join(ascii);
  }

  // ── Remove emoji (surrogate pairs and common emoji ranges) ──
  t = t.replace(/[\u{1F600}-\u{1F9FF}]/gu, '');   // emoticons & symbols
  t = t.replace(/[\u{2600}-\u{26FF}]/gu, '');      // misc symbols
  t = t.replace(/[\u{2700}-\u{27BF}]/gu, '');      // dingbats
  t = t.replace(/[\u{FE00}-\u{FE0F}]/gu, '');      // variation selectors
  t = t.replace(/[\u{200D}]/gu, '');                // zero-width joiner
  // Common check/cross marks
  t = t.replace(/[✓✔]/g, '(ok)');
  t = t.replace(/[✗✘✕]/g, '(x)');
  t = t.replace(/[★☆]/g, '*');

  // ── Break very long unbroken strings (>60 chars with no spaces) ──
  t = t.replace(/(\S{60})/g, '$1 ');

  // ── Final whitespace cleanup ──
  t = t.replace(/[ \t]+/g, ' ');
  t = t.replace(/\n{3,}/g, '\n\n');
  t = t.trim();

  return t;
}

/* ── Main ──────────────────────────────────────────────────── */

export async function downloadGradeReportPdf(data: GradeData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const qrBase64 = await getQrBase64();

  const W  = doc.internal.pageSize.getWidth();   // 210
  const H  = doc.internal.pageSize.getHeight();  // 297
  const ML = 14;
  const MR = 14;
  const CW = W - ML - MR; // usable content width ~182

  const pct = Math.round(((data.overall_score ?? 0) / (data.overall_max ?? 1)) * 100);
  const col = scoreColor(data.overall_score ?? 0, data.overall_max ?? 1);

  let y = 14;

  /* ═══════ HEADER ═══════ */
  const qrSize = 16;

  // Brand name
  doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(INDIGO);
  doc.text('DaVinci Solver', ML, y);

  // URL below brand
  doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(MUTED);
  doc.text('www.davincisolver.com', ML, y + 5);

  // "Grading Report" label — right of brand
  doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(INDIGO_DARK);
  doc.text('Grading Report', W - MR - qrSize - 4, y, { align: 'right' });

  // QR code — top right, positioned so no line intersects it
  const qrY = y - 5;
  doc.addImage(qrBase64, 'PNG', W - MR - qrSize, qrY, qrSize, qrSize);

  // Move past header area (below QR code bottom)
  y = qrY + qrSize + 3;

  /* ═══════ SUBJECT / DOCUMENT TYPE ═══════ */
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(MUTED);
  doc.text(`${data.subject ?? '—'}  ·  ${data.document_type ?? '—'}`, ML, y);
  y += 7;

  /* ═══════ OVERALL SCORE BOX ═══════ */
  const boxH = 32;
  // Light bg box
  doc.setFillColor(BG_LIGHT).setDrawColor(BORDER).setLineWidth(0.3);
  doc.roundedRect(ML, y, CW, boxH, 3, 3, 'FD');

  // Big score
  doc.setFont('helvetica', 'bold').setFontSize(36).setTextColor(col);
  doc.text(`${data.overall_score ?? 0}`, ML + 12, y + 20);

  // "/ max"
  const scoreW = doc.getTextWidth(`${data.overall_score ?? 0}`);
  doc.setFont('helvetica', 'normal').setFontSize(14).setTextColor(LIGHT_GRAY);
  doc.text(`/ ${data.overall_max ?? 0}`, ML + 12 + scoreW + 2, y + 20);

  // Percentage
  doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(col);
  doc.text(`${pct}%`, ML + 12 + scoreW + 2 + doc.getTextWidth(`/ ${data.overall_max ?? 0}`) + 6, y + 20);

  // Grade boundary — right side of box
  doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(DARK);
  doc.text(data.grade_boundary ?? '', W - MR - 8, y + 14, { align: 'right' });

  // Estimated range
  if (data.estimated_range) {
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(MUTED);
    doc.text(`Range: ${data.estimated_range}`, W - MR - 8, y + 21, { align: 'right' });
  }

  y += boxH + 6;

  /* ═══════ SUMMARY ═══════ */
  if (data.summary) {
    const summaryText = sanitize(data.summary);
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(GRAY);
    const lines = doc.splitTextToSize(summaryText, CW);
    doc.text(lines, ML, y);
    y += lines.length * 4 + 4;
  }

  /* ═══════ PAGE-CHECK HELPER ═══════ */
  function ensureSpace(needed: number) {
    if (y + needed > H - 20) {
      addFooter();
      doc.addPage();
      y = 14;
    }
  }

  /* ═══════ CRITERION BREAKDOWN ═══════ */
  const criteria = data.criteria ?? [];
  if (criteria.length > 0) {
    ensureSpace(10);
    doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(DARK);
    doc.text('Criterion Breakdown', ML, y);
    y += 6;

    const LH = 3.8;   // line height for body text (8pt)
    const LH_SM = 3.4; // line height for small text (7-7.5pt)
    const PAD = 4;     // internal card padding

    criteria.forEach((c) => {
      const cCol = scoreColor(c.score, c.max_score);
      const feedback = sanitize(c.feedback);
      const improvement = sanitize(c.improvement);
      const isMax = c.score === c.max_score;

      // Pre-measure text
      doc.setFont('helvetica', 'normal').setFontSize(8);
      const fbLines: string[] = doc.splitTextToSize(feedback, CW - PAD * 2);
      doc.setFont('helvetica', 'normal').setFontSize(7.5);
      const impLines: string[] = doc.splitTextToSize(improvement, CW - PAD * 2 - 8);

      // Calculate exact card height
      const headerH = 6;                              // code + name row
      const pipH = 5;                                  // pip bar + gap
      const fbH = fbLines.length * LH + 2;            // feedback text + gap
      const impLabelH = 4;                             // "How to improve" label
      const impTextH = impLines.length * LH_SM;       // improvement text
      const impBoxPad = 4;                             // padding inside imp box
      const cardH = PAD + headerH + pipH + fbH + impLabelH + impTextH + impBoxPad + PAD;

      ensureSpace(cardH + 4);

      // ── Draw card background ──
      const cardTop = y;
      doc.setFillColor('#ffffff').setDrawColor(BORDER).setLineWidth(0.25);
      doc.roundedRect(ML, cardTop, CW, cardH, 2, 2, 'FD');

      // ── Header row: code, name, score ──
      let cy = cardTop + PAD + 2;
      doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(INDIGO);
      doc.text(c.code, ML + PAD, cy);

      const codeW = doc.getTextWidth(c.code);
      doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(DARK);
      const nameMaxW = CW - PAD * 2 - codeW - 30;
      const nameTrunc = doc.splitTextToSize(c.name, nameMaxW)[0] ?? c.name;
      doc.text(nameTrunc, ML + PAD + codeW + 3, cy);

      doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(cCol);
      doc.text(`${c.score} / ${c.max_score}`, W - MR - PAD, cy, { align: 'right' });

      // ── Pip bar ──
      cy += 5;
      const pipW = 4;
      const pipBarH = 1.8;
      const pipGap = 1;
      // Cap pips so they fit within the card width
      const maxPips = Math.min(c.max_score ?? 0, Math.floor((CW - PAD * 2) / (pipW + pipGap)));
      const displayScore = Math.min(c.score ?? 0, maxPips);
      for (let i = 0; i < maxPips; i++) {
        doc.setFillColor(i < displayScore ? cCol : BORDER);
        doc.roundedRect(ML + PAD + i * (pipW + pipGap), cy, pipW, pipBarH, 0.5, 0.5, 'F');
      }
      // If capped, show numeric score as fallback
      if (maxPips < (c.max_score ?? 0)) {
        doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(cCol);
        doc.text(`${c.score}/${c.max_score}`, ML + PAD + maxPips * (pipW + pipGap) + 2, cy + 1.5);
      }
      cy += pipBarH + 3;

      // ── Feedback text ──
      doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(GRAY);
      doc.text(fbLines, ML + PAD, cy);
      cy += fbLines.length * LH + 2;

      // ── Improvement box ──
      const impBoxTop = cy;
      const impBoxH = impLabelH + impLines.length * LH_SM + impBoxPad;

      doc.setFillColor(isMax ? '#f0fdf4' : '#fef2f2');
      doc.roundedRect(ML + PAD, impBoxTop, CW - PAD * 2, impBoxH, 1.5, 1.5, 'F');

      // Left accent bar
      doc.setFillColor(isMax ? GREEN : RED);
      doc.rect(ML + PAD, impBoxTop, 1, impBoxH, 'F');

      // Improve label
      doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(isMax ? '#059669' : '#dc2626');
      doc.text(isMax ? '✓ Maximum achieved' : '↑ How to improve', ML + PAD + 4, impBoxTop + 3.5);

      // Improve text
      doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(GRAY);
      doc.text(impLines, ML + PAD + 4, impBoxTop + 3.5 + impLabelH);

      y = cardTop + cardH + 3;
    });
  }

  /* ═══════ REVISION PRIORITY ORDER ═══════ */
  const priorities = data.top_priorities ?? [];
  if (priorities.length > 0) {
    ensureSpace(12);
    doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(DARK);
    doc.text('Revision Priority Order', ML, y);
    y += 6;

    priorities.forEach((p, i) => {
      const text = sanitize(p);
      const lines = doc.splitTextToSize(text, CW - 14);
      ensureSpace(lines.length * 3.5 + 6);

      // Number circle
      doc.setFillColor(INDIGO);
      doc.circle(ML + 4, y + 1, 3, 'F');
      doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor('#ffffff');
      doc.text(`${i + 1}`, ML + 4, y + 2.2, { align: 'center' });

      // Text
      doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(GRAY);
      doc.text(lines, ML + 10, y + 1.5);
      y += lines.length * 3.5 + 4;
    });

    // Do not touch
    if (data.do_not_touch) {
      const dntText = sanitize(data.do_not_touch);
      const dntLines = doc.splitTextToSize(dntText, CW - 10);
      ensureSpace(dntLines.length * 3.5 + 8);

      doc.setFillColor('#f0fdf4');
      doc.roundedRect(ML, y, CW, dntLines.length * 3.5 + 6, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor('#059669');
      doc.text('Do not touch:', ML + 4, y + 4);
      doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(GRAY);
      doc.text(dntLines, ML + 4, y + 8);
      y += dntLines.length * 3.5 + 10;
    }
  }

  /* ═══════ REGRADE NOTE ═══════ */
  if (data.regrade_note) {
    const noteText = sanitize(data.regrade_note);
    const noteLines = doc.splitTextToSize(noteText, CW - 10);
    ensureSpace(noteLines.length * 3.5 + 8);

    doc.setFillColor('#eff6ff');
    doc.roundedRect(ML, y, CW, noteLines.length * 3.5 + 6, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor('#1e40af');
    doc.text('Regrade note:', ML + 4, y + 4);
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor('#1e40af');
    doc.text(noteLines, ML + 4, y + 8);
  }

  /* ═══════ FOOTER ON EVERY PAGE ═══════ */
  function addFooter() {
    const fy = H - 14;
    doc.setDrawColor(INDIGO).setLineWidth(0.3);
    doc.line(ML, fy, W - MR, fy);

    // QR in footer
    const fqr = 9;
    doc.addImage(qrBase64, 'PNG', ML, fy + 1, fqr, fqr);

    // Brand text
    const tx = ML + fqr + 2;
    doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(INDIGO);
    doc.text('DaVinci Solver', tx, fy + 4.5);
    doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(MUTED);
    doc.text('  —  www.davincisolver.com', tx + doc.getTextWidth('DaVinci Solver'), fy + 4.5);

    // Page number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pg = (doc as any).internal.getCurrentPageInfo().pageNumber;
    doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(LIGHT_GRAY);
    doc.text(`Page ${pg}`, W - MR, fy + 4.5, { align: 'right' });
  }

  // Add footer to all pages
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter();
  }

  /* ═══════ SAVE ═══════ */
  const subj = (data.subject ?? 'Report').replace(/[^a-zA-Z0-9 ]/g, '').trim();
  doc.save(`DaVinci_Grade_${subj}_${data.overall_score ?? 0}-${data.overall_max ?? 0}.pdf`);
}
