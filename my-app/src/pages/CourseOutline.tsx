import { useState } from 'react';
import { generateOutline, type OutlineRequest, type OutlineResponse } from '../services/outline';
import { downloadOutlinePdf } from '../utils/outlinePdf';
import AuthPromptModal from '../components/AuthPromptModal';
import { useAuth } from '../context/useAuth';
import { useGuestQuery } from '../hooks/useGuestQuery';
import WaitingAnimation from '../components/WaitingAnimation';
import './CourseOutline.css';

const EXAM_BOARDS = [
  'IB', 'Cambridge IGCSE', 'Edexcel', 'AQA', 'OCR', 'Oxford AQA',
  'AP / College Board', 'CBSE', 'ICSE', 'State Board', 'Other',
];

export default function CourseOutline() {
  const { token } = useAuth();
  const { canQuery, consumeQuery, remaining: guestRemaining } = useGuestQuery('outline');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [form, setForm] = useState<OutlineRequest>({
    student_name: '',
    grade: '',
    subject: '',
    exam_board: '',
    curriculum: '',
    course_content: '',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OutlineResponse | null>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Guest quota check
    if (!token && !canQuery) {
      setShowAuthModal(true);
      return;
    }
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await generateOutline(form);
      if (!token) consumeQuery();
      setResult(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail || (err instanceof Error ? err.message : 'Something went wrong');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    await downloadOutlinePdf(result);
  };

  const resetForm = () => {
    setResult(null);
    setError('');
  };

  return (
    <div className="outline-page">
      <div className="outline-container">
        {/* ── Loading animation ── */}
        {loading && !result && (
          <div className="outline-form-wrap animate-fade-in-up wa-inline">
            <WaitingAnimation mode="outline" />
          </div>
        )}

        {!result && !loading && (
          <div className="outline-form-wrap animate-fade-in-up">
            <div className="outline-form-header">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <div>
                <h1>Course Outline Generator</h1>
                <p>
                  Get a structured, printable checklist for your entire course.
                  {!token && (
                    <span className="outline-guest-note">
                      {' '}{guestRemaining} free {guestRemaining === 1 ? 'outline' : 'outlines'} remaining
                    </span>
                  )}
                </p>
              </div>
            </div>

            {error && <div className="outline-error">{error}</div>}

            <form onSubmit={handleSubmit} className="outline-form">
              <div className="outline-field-row">
                <label className="outline-field">
                  <span>Full Name</span>
                  <input
                    name="student_name"
                    value={form.student_name}
                    onChange={handleChange}
                    placeholder="e.g. Alice Johnson"
                    required
                  />
                </label>
                <label className="outline-field">
                  <span>Grade / Year</span>
                  <input
                    name="grade"
                    value={form.grade}
                    onChange={handleChange}
                    placeholder="e.g. Grade 11"
                    required
                  />
                </label>
              </div>

              <div className="outline-field-row">
                <label className="outline-field">
                  <span>Subject</span>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="e.g. Physics"
                    required
                  />
                </label>
                <label className="outline-field">
                  <span>Exam Board</span>
                  <select name="exam_board" value={form.exam_board} onChange={handleChange} required>
                    <option value="">Select board…</option>
                    {EXAM_BOARDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="outline-field">
                <span>Curriculum / Syllabus</span>
                <input
                  name="curriculum"
                  value={form.curriculum}
                  onChange={handleChange}
                  placeholder="e.g. IB DP Physics HL"
                  required
                />
              </label>

              <label className="outline-field">
                <span>Topics / Content (optional — helps refine the outline)</span>
                <textarea
                  name="course_content"
                  value={form.course_content}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g. Mechanics, Waves, Electricity, Thermal Physics… copy topics from your syllabus for best results."
                />
              </label>

              <button type="submit" className="outline-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="outline-spinner" />
                    Generating outline…
                  </>
                ) : (
                  'Generate Outline'
                )}
              </button>
            </form>
          </div>
        )}

        {result && (
          <div className="outline-result animate-fade-in-up">
            <div className="outline-result-header">
              <div className="outline-result-meta">
                <h2>{result.subject} — Course Outline</h2>
                <p>{result.student_name} · {result.grade} · {result.exam_board}</p>
              </div>
              <div className="outline-result-actions">
                <button className="outline-btn outline-btn-pdf" onClick={handleDownloadPdf}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download PDF
                </button>
                <button className="outline-btn outline-btn-new" onClick={resetForm}>
                  New Outline
                </button>
              </div>
            </div>

            <div className="outline-table-wrap">
              <div
                className="outline-table-body"
                dangerouslySetInnerHTML={{ __html: result.course_outline }}
              />
            </div>
          </div>
        )}
      </div>

      {showAuthModal && (
        <AuthPromptModal feature="outline" onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
