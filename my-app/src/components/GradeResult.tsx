import { useState, useEffect, useRef, useCallback } from 'react';
import type { GradeData, GradeCriterion } from '../services/grader';
import MathText from './MathText';
import { downloadGradeReportPdf } from '../utils/gradeReportPdf';
import './GradeResult.css';

interface GradeResultProps {
  data: GradeData;
  onClose: () => void;
}

// ── Helpers ──────────────────────────────────────────────────

function scoreColor(score: number, max: number): 'green' | 'amber' | 'red' {
  const r = score / max;
  if (r >= 0.75) return 'green';
  if (r >= 0.5)  return 'amber';
  return 'red';
}

function priorityDot(priority: string): string {
  if (priority === 'high')   return '#ef4444';
  if (priority === 'medium') return '#f59e0b';
  return '#10b981';
}

// ── Score ring ───────────────────────────────────────────────

function ScoreRing({ score, max, animate }: { score: number; max: number; animate: boolean }) {
  const radius = 52;
  const stroke = 7;
  const circ   = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setOffset(circ - (score / max) * circ), 300);
    return () => clearTimeout(t);
  }, [animate, score, max, circ]);

  const col = scoreColor(score, max);
  const strokeColor = col === 'green' ? '#10b981' : col === 'amber' ? '#f59e0b' : '#ef4444';
  const pct = Math.round((score / max) * 100);

  return (
    <div className="gr-ring-wrap">
      <svg width="130" height="130" viewBox="0 0 130 130" className="gr-ring-svg">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#e9ecef" strokeWidth={stroke} />
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="gr-ring-center">
        <span className="gr-ring-score">{score}</span>
        <span className="gr-ring-max">/ {max}</span>
        <span className="gr-ring-pct" style={{ color: strokeColor }}>{pct}%</span>
      </div>
    </div>
  );
}

// ── Pip bar ──────────────────────────────────────────────────

function PipBar({ score, max }: { score: number; max: number }) {
  const safeMax = max > 0 ? max : 1;
  const safeScore = score ?? 0;
  const col = scoreColor(safeScore, safeMax);
  const fill = col === 'green' ? '#10b981' : col === 'amber' ? '#f59e0b' : '#ef4444';
  return (
    <div className="gr-pips">
      {Array.from({ length: safeMax }, (_, i) => (
        <div
          key={i}
          className="gr-pip"
          style={{
            background: i < safeScore ? fill : 'var(--dv-gray-200)',
            transition: `background 0.3s ease ${i * 0.06}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Criterion card ───────────────────────────────────────────

function CriterionCard({
  criterion,
  index,
  isTopPriority,
}: {
  criterion: GradeCriterion;
  index: number;
  isTopPriority: boolean;
}) {
  const safeScore = criterion.score ?? 0;
  const safeMax   = criterion.max_score > 0 ? criterion.max_score : 1;
  const [open, setOpen] = useState(criterion.priority === 'high');
  const col = scoreColor(safeScore, safeMax);
  const badgeStyle = {
    background: col === 'green' ? 'rgba(16,185,129,0.12)' : col === 'amber' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
    color:      col === 'green' ? '#10b981'               : col === 'amber' ? '#f59e0b'               : '#ef4444',
  };
  const isMax = safeScore === safeMax;

  return (
    <div
      className={`gr-crit-card ${isTopPriority ? 'gr-crit-card--priority' : ''}`}
      style={{ animationDelay: `${index * 0.07}s` }}
      onClick={() => setOpen((o) => !o)}
    >
      <div className="gr-crit-header">
        <div className="gr-crit-code">{criterion.code}</div>
        <span className="gr-crit-name">{criterion.name}</span>
        <span className="gr-crit-badge" style={badgeStyle}>
          {safeScore} / {safeMax}
        </span>
        <span className={`gr-crit-chevron ${open ? 'open' : ''}`}>›</span>
      </div>
      <PipBar score={safeScore} max={safeMax} />

      {open && (
        <div className="gr-crit-body">
          <span className="gr-crit-pageref">{criterion.page_ref}</span>
          <p className="gr-crit-feedback"><MathText text={criterion.feedback} /></p>
          <div
            className="gr-crit-improve"
            style={{
              borderLeftColor: isMax ? '#10b981' : '#ef4444',
              background: isMax ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.05)',
            }}
          >
            <span
              className="gr-crit-improve-label"
              style={{ color: isMax ? '#059669' : '#dc2626' }}
            >
              {isMax ? '✓ Maximum achieved' : '↑ How to improve'}
            </span>
            <MathText text={criterion.improvement} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────

export default function GradeResult({ data, onClose }: GradeResultProps) {
  const [animated, setAnimated] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setAnimated(true); },
      { threshold: 0.1 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const handleDownload = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadGradeReportPdf(data);
    } catch (err) {
      console.error('PDF download failed:', err);
    } finally {
      setDownloading(false);
    }
  }, [downloading, data]);

  const criteria       = data.criteria       ?? [];
  const priorityOrder  = data.priority_order  ?? [];
  const topPriorities  = data.top_priorities  ?? [];
  const topPriorityCodes = priorityOrder.slice(0, 2);

  return (
    <div className="gr-root" ref={ref}>

      {/* Close / regrade bar */}
      <div className="gr-topbar">
        <span className="gr-topbar-label">Grading Report</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="gr-download-btn"
            onClick={handleDownload}
            disabled={downloading}
            aria-label="Download report as PDF"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {downloading ? 'Saving…' : 'PDF'}
          </button>
          <button className="gr-close-btn" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Hero score card ── */}
      <div className="gr-hero-card gr-anim">
        <div className="gr-subject-tag">{data.subject ?? '—'} · {data.document_type ?? '—'}</div>
        <div className="gr-score-row">
          <ScoreRing score={data.overall_score ?? 0} max={data.overall_max ?? 1} animate={animated} />
          <div className="gr-score-meta">
            <div className="gr-boundary">{data.grade_boundary ?? '—'}</div>
            <p className="gr-summary"><MathText text={data.summary ?? ''} /></p>
          </div>
        </div>
        {data.estimated_range && (
          <div className="gr-range-strip">
            <div>
              <span className="gr-range-label">Estimated examiner range</span>
              <span className="gr-range-sub">IB examiners typically vary by ±1–2 marks</span>
            </div>
            <span className="gr-range-value">{data.estimated_range}</span>
          </div>
        )}
      </div>

      {/* ── Priority chips ── */}
      {criteria.length > 0 && (
        <div className="gr-chips gr-anim gr-anim--d1">
          {criteria
            .slice()
            .sort((a, b) => (b.max_score - b.score) - (a.max_score - a.score))
            .slice(0, 3)
            .map((c) => (
              <div key={c.code} className="gr-chip">
                <span className="gr-chip-dot" style={{ background: priorityDot(c.priority) }} />
                {c.priority === 'high'   ? `Fix ${c.code} first`
                 : c.priority === 'medium' ? `Improve ${c.code}`
                 : `${c.code} is solid`}
              </div>
            ))}
        </div>
      )}

      {/* ── Criteria label ── */}
      {criteria.length > 0 && (
        <div className="gr-section-label gr-anim gr-anim--d2">
          Criterion breakdown — tap to expand
        </div>
      )}

      {/* ── Criterion cards ── */}
      <div className="gr-criteria-list">
        {criteria.map((c, i) => (
          <CriterionCard
            key={c.code}
            criterion={c}
            index={i}
            isTopPriority={topPriorityCodes.includes(c.code)}
          />
        ))}
      </div>

      {/* ── Priority action list ── */}
      {topPriorities.length > 0 && (
        <div className="gr-priorities gr-anim gr-anim--d4">
          <div className="gr-priorities-title">Revision priority order</div>
          {topPriorities.map((p, i) => (
            <div key={i} className="gr-priority-row">
              <div className="gr-priority-num">{i + 1}</div>
              <p className="gr-priority-text"><MathText text={p} /></p>
            </div>
          ))}
          {data.do_not_touch && (
            <div className="gr-do-not-touch">
              <span className="gr-dnt-label">Do not touch: </span>
              <MathText text={data.do_not_touch} />
            </div>
          )}
        </div>
      )}

      {/* ── Regrade note ── */}
      {data.regrade_note && (
        <div className="gr-regrade-note gr-anim gr-anim--d5">
          <span className="gr-regrade-label">Regrade note</span>
          {data.regrade_note}
        </div>
      )}

      {/* ── Grade another CTA ── */}
      <button className="gr-another-btn gr-anim gr-anim--d5" onClick={onClose}>
        Grade another submission →
      </button>

    </div>
  );
}
