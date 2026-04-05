import { Link } from 'react-router-dom';
import iaGradingImg from '../assets/ia_grading.png';
import './IBGradingSection.css';

export default function IBGradingSection() {
  return (
    <section className="ibg-section">
      <div className="container">
        <div className="ibg-inner">

          {/* ── Left: content ── */}
          <div className="ibg-content">
            <h2 className="ibg-title">
              Criterion-by-criterion<br />IB IA grading 
            </h2>
            <p className="ibg-desc">
              Upload your IB Internal Assessment draft and get instant, rubric-accurate
              feedback. DaVinci grades each criterion individually — matching the exact
              descriptors IB examiners use — so you know precisely where marks are lost
              and what to fix. For college students, you're not left out, DaVinci's IA 
              grading also supports university-level research papers by switching modes 
              and general and use of standard academic grading rubrics,
              providing detailed feedback aligned with IB standards to help you excel in your academic writing. 
            </p>

            <ul className="ibg-list">
              <li>
                <span className="ibg-check">✓</span>
                Covers Biology, Chemistry, Physics, Math AA/AI, Economics, History &amp; more
              </li>
              <li>
                <span className="ibg-check">✓</span>
                Score per criterion + exact descriptor match
              </li>
              <li>
                <span className="ibg-check">✓</span>
                Parallel write-up approach — revise, re-upload, track improvement
              </li>
              <li>
                <span className="ibg-check">✓</span>
                Extended Essay graded on Criterion A–E
              </li>
            </ul>

            <Link to="/grade" className="mockup-card-btn mockup-card-btn--purple ibg-btn">
              Grade my IA
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          {/* ── Right: screenshot ── */}
          <div className="ibg-image-wrap">
            <img src={iaGradingImg} alt="IB IA grading result screenshot" className="ibg-image" />
          </div>

        </div>
      </div>
    </section>
  );
}
