import { Link } from 'react-router-dom';
import courseOutlineImg from '../assets/courseoutline.png';
import './CourseOutlineSection.css';

export default function CourseOutlineSection() {
  return (
    <section className="cos-section">
      <div className="container">
        <div className="cos-inner">

          {/* ── Left: screenshot ── */}
          <div className="cos-image-wrap">
            <img src={courseOutlineImg} alt="Course outline generator screenshot" className="cos-image" />
          </div>

          {/* ── Right: content ── */}
          <div className="cos-content">
            <h2 className="cos-title">
              Your full syllabus,<br />planned in seconds
            </h2>
            <p className="cos-desc">
              Generate a complete, curriculum-aligned course outline for any subject and
              exam board. DaVinci maps your syllabus into working hours, highlights HL/SL splits,
              builds in IA deadlines, and keeps your revision timeline on track. You can download it 
              as a PDF and use it as a pre-exam checklist too ! 
              Say goodbye to syllabus overwhelm and hello to focused, smart efficient learning.
            </p>

            <ul className="cos-list">
              <li>
                <span className="cos-check">✓</span>
                IB DP: two-year plan with HL/SL distinctions, IA milestones &amp; TOK/EE timelines
              </li>
              <li>
                <span className="cos-check">✓</span>
                A-Level & International A-level: topic breakdown by hours and exam board — AQA, Edexcel, OCR
              </li>
              <li>
                <span className="cos-check">✓</span>
                IGCSE/GCSE: topic weighting by exam board spec — AQA, Edexcel, OCR, Cambridge
              </li>
              <li>
                <span className="cos-check">✓</span>
                IB Math AA/AI: GDC-permitted topics clearly flagged per unit
              </li>
              <li>
                <span className="cos-check">✓</span>
                AP Courses covered include: Calculus AB/BC, Statistics, Computer Science A, Physics 1/2/C, Chemistry, Biology, Environmental Science, Psychology, and more
              </li>
            </ul>

            <Link to="/outline" className="mockup-card-btn mockup-card-btn--blue cos-btn">
              Generate my outline
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
