import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gradeUploadedImage, gradeDocument, type GradeData } from '../services/grader';
import GradeResult from '../components/GradeResult';
import AuthPromptModal from '../components/AuthPromptModal';
import { useAuth } from '../context/useAuth';
import { useGuestQuery } from '../hooks/useGuestQuery';
import './Grader.css';

type Stage = 'upload' | 'processing' | 'result';

const STORAGE_KEY = 'dv_grade_session';

const DOCUMENT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

function isDocumentFile(file: File): boolean {
  if (file.type.startsWith('image/')) return false;
  if (DOCUMENT_TYPES.has(file.type)) return true;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return ['pdf', 'doc', 'docx', 'txt'].includes(ext);
}

/** Restore saved grading session from sessionStorage */
function restoreSession(): { stage: Stage; gradeData: GradeData | null } {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { stage: 'upload', gradeData: null };
    const parsed = JSON.parse(raw);
    if (parsed.stage === 'result' && parsed.gradeData) {
      return { stage: 'result', gradeData: parsed.gradeData };
    }
  } catch { /* ignore corrupt data */ }
  return { stage: 'upload', gradeData: null };
}

export default function Grader() {
  const { token } = useAuth();
  const { canQuery, consumeQuery, remaining: guestRemaining } = useGuestQuery('grade');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [stage,     setStage]     = useState<Stage>(() => restoreSession().stage);
  const [gradeData, setGradeData] = useState<GradeData | null>(() => restoreSession().gradeData);
  const [error,     setError]     = useState('');
  const [dragOver,  setDragOver]  = useState(false);
  const [fileName,  setFileName]  = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist grading result to sessionStorage whenever it changes
  useEffect(() => {
    if (stage === 'result' && gradeData) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ stage, gradeData }));
    } else if (stage === 'upload') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [stage, gradeData]);

  function checkGuestQuota(): boolean {
    if (token) return true;
    if (canQuery) return true;
    setShowAuthModal(true);
    return false;
  }

  async function processFile(file: File) {
    if (!checkGuestQuota()) return;
    setFileName(file.name);
    setError('');
    setStage('processing');
    try {
      const data = isDocumentFile(file)
        ? await gradeDocument(file)
        : await gradeUploadedImage(file);
      if (!token) consumeQuery();
      setGradeData(data);
      setStage('result');
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail || 'Grading failed. Please try again.';
      setError(detail);
      setStage('upload');
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // reset so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const resetToUpload = () => {
    setGradeData(null);
    setFileName('');
    setError('');
    setStage('upload');
  };

  return (
    <div className="grader-page">

      {/* Top bar */}
      <div className="grader-topbar">
    
        <div className="grader-topbar-right">
          {!token && (
            <span className="grader-guest-badge">
              {guestRemaining} free {guestRemaining === 1 ? 'grade' : 'grades'} left
            </span>
          )}
          <Link to="/dashboard" className="grader-back">← Dashboard</Link>
        </div>
      </div>

      {/* ── Upload stage ─────────────────────────────────── */}
      {stage === 'upload' && (
        <div className="grader-upload-wrap">
          <div className="grader-upload-header">
            <h1 className="grader-upload-title">Grade your work</h1>
            <p className="grader-upload-sub">
              Upload an essay, IB IA, lab report, assignment, or any document.
              Get scored feedback against the exact marking criteria.
            </p>
          </div>

          {error && <div className="grader-error">{error}</div>}

          {/* Drop zone */}
          <div
            className={`grader-dropzone ${dragOver ? 'grader-dropzone--over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="grader-dropzone-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="12" y2="12"/>
                <line x1="15" y1="15" x2="12" y2="12"/>
              </svg>
            </div>
            <p className="grader-dropzone-label">
              Drop your file here, or <span className="grader-dropzone-link">browse</span>
            </p>
            <p className="grader-dropzone-hint">
              PDF, DOCX, TXT, or images — up to 10 MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Supported formats chips */}
          <div className="grader-format-chips">
            {['PDF', 'DOCX', 'TXT', 'JPG / PNG'].map((f) => (
              <span key={f} className="grader-format-chip">{f}</span>
            ))}
          </div>

          {/* What gets graded */}
          <div className="grader-supported-list">
            {[
              'IB Internal Assessments (IA)',
              'Essays & extended responses',
              'Lab reports & practicals',
              'AP free-response (FRQ)',
              'GCSE & A-Level coursework',
              'University assignments',
            ].map((item) => (
              <div key={item} className="grader-supported-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Processing ───────────────────────────────────── */}
      {stage === 'processing' && (
        <div className="grader-processing">
          <div className="grader-spinner" />
          <p className="grader-processing-title">Grading your work…</p>
          <p className="grader-processing-sub">
            {fileName && <><strong>{fileName}</strong><br /></>}
            Analysing against marking criteria
          </p>
        </div>
      )}

      {/* ── Result ───────────────────────────────────────── */}
      {stage === 'result' && gradeData && (
        <div className="grader-result-wrap">
          <GradeResult data={gradeData} onClose={resetToUpload} />
        </div>
      )}

      {/* ── Auth modal ───────────────────────────────────── */}
      {showAuthModal && (
        <AuthPromptModal feature="grade" onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
