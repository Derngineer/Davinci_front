import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './SolutionCard.css';

interface SolutionCardProps {
  solution: string;
  remaining?: number;
  onClose: () => void;
  mode?: 'solving' | 'grading';
}

/**
 * The AI returns clean Markdown with:
 *  - $$...$$ for display math  (remark-math handles natively)
 *  - \(...\) for inline math   (needs converting to $...$)
 *  - \[...\] for display math  (needs converting to $$...$$)
 *
 * That's it — no stripping, no hacks.
 */
function prepareContent(raw: string): string {
  let text = raw;
  // \( inline \) → $ inline $
  text = text.replace(/\\\((.+?)\\\)/g, (_m, inner: string) => `$${inner}$`);
  // \[ display \] → $$ display $$
  text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_m, inner: string) => `$$${inner}$$`);
  return text;
}

export default function SolutionCard({ solution, remaining, onClose, mode = 'solving' }: SolutionCardProps) {
  const content = prepareContent(solution);
  const isGrading = mode === 'grading';

  return (
    <div className={`solution-card animate-fade-in-up${isGrading ? ' solution-card--grading' : ''}`}>
      <div className="solution-header">
        <div className="solution-header-left">
          {isGrading ? (
            <svg className="solution-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          ) : (
            <svg className="solution-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )}
          <span className="solution-title">{isGrading ? 'Grading Report' : 'Solution'}</span>
        </div>
        <button className="solution-close" onClick={onClose} aria-label="Close solution">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="solution-body">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {content}
        </ReactMarkdown>
      </div>

      {isGrading && (
        <div className="solution-ai-disclaimer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>AI-generated feedback — consult a teacher or professional for official grading.</span>
        </div>
      )}

      <div className="solution-footer">
        {remaining !== undefined && (
          <span className="solution-remaining">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            {remaining} solves remaining today
          </span>
        )}
        <button className="solution-new-btn" onClick={onClose}>
          {isGrading ? 'Grade another' : 'Solve another'}
        </button>
      </div>
    </div>
  );
}
