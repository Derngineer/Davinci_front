import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './Landing.css';

/* ── Institution logos ── */
import gemswellington from '../assets/gemswellington.png';
import kingsalbarsha from '../assets/kingsalbarsha.png';
import dubaiIntlAcademy from '../assets/DubaiInternationaAcademy.png';
import stanford from '../assets/stanford.png';
import princeton from '../assets/princeton.png';
import delhiPublic from '../assets/delhi public school.png';
import heriotWatt from '../assets/heriot watt university.png';
import middlesex from '../assets/middlesexuniversity.png';
import nussingapore from '../assets/nussingapore.png';
import nairobiIntl from '../assets/nairobiinternationalschool.png';
import sidneyBoys from '../assets/sidneyboyshighschool.png';
import stMargerats from "../assets/stmargerat'school.png";
import uniJohannesburg from '../assets/universityofjohannesburg.png';
import uniZimbabwe from '../assets/universityofzimbabwe.png';
import admiralFarragut from '../assets/admiralfarragutacademcy(fl).png';
import fazekasMihaly from '../assets/fazekasMihaly.png';

/* ── Curriculum / learner icons ── */
import indianLogo from '../assets/indianlearninglogo.png';
import americanLogo from '../assets/americanlearninglogo.png';
import ukLogo from '../assets/uklearning.png';
import ibLogo from '../assets/iblogo.png';

/* ── Institution names for the carousel ───────────────────── */
const institutions = [
  { name: 'GEMS Wellington Academy', logo: gemswellington },
  { name: 'Kings School Al Barsha', logo: kingsalbarsha },
  { name: 'Dubai International Academy', logo: dubaiIntlAcademy },
  { name: 'Stanford University', logo: stanford },
  { name: 'Princeton University', logo: princeton },
  { name: 'Delhi Public School', logo: delhiPublic },
  { name: 'Heriot-Watt University', logo: heriotWatt },
  { name: 'Middlesex University', logo: middlesex },
  { name: 'NUS Singapore', logo: nussingapore },
  { name: 'Nairobi International School', logo: nairobiIntl },
  { name: 'Sidney Boys High School', logo: sidneyBoys },
  { name: "St Margaret's School", logo: stMargerats },
  { name: 'University of Johannesburg', logo: uniJohannesburg },
  { name: 'University of Zimbabwe', logo: uniZimbabwe },
  { name: 'Admiral Farragut Academy', logo: admiralFarragut },
  { name: 'Fazekas Mihály', logo: fazekasMihaly },
];

export default function Landing() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggle = (i: number) => setOpenFaq(openFaq === i ? null : i);

  /* ── Snap-and-solve animation phase: 0=camera, 1=snap, 2=solution ── */
  const [animPhase, setAnimPhase] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const durations = [2200, 1400, 2600];
    const step = () => {
      setAnimPhase((prev) => {
        const next = (prev + 1) % 3;
        timerRef.current = setTimeout(step, durations[next]);
        return next;
      });
    };
    timerRef.current = setTimeout(step, durations[0]);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const faqs = [
    {
      q: 'Is DaVinci Solver completely free?',
      a: 'Yes \u2014 DaVinci Solver is 100% free for all registered users. There are no hidden fees, no premium tiers, and no limits on the number of problems you can solve. Just create a free account and start solving.',
    },
    {
      q: 'What problems can this app solve?',
      a: 'Our app solves a wide range of problems \u2014 math equations, word problems, physics, chemistry, biology, and more. Just snap a clear picture and the app analyses and provides the solution. Problems can be in any language, and solutions are given in the language of inquiry \u2014 Russian, Arabic, French, Chinese, you name it.',
    },
    {
      q: 'Can the app solve handwritten problems?',
      a: 'Yes! The app handles handwritten problems, but the handwriting must be neat and legible. If the app has difficulty recognizing your handwriting, try printing more clearly or adjusting the lighting.',
    },
    {
      q: 'Can I use this app on my phone?',
      a: 'Absolutely. DaVinci Solver is built mobile-first. Open it on your phone, snap a photo with your camera, and get solutions instantly. Works on any smartphone or tablet.',
    },
    {
      q: 'How do I take a good picture for the app to analyze?',
      a: 'Ensure the problem is well-lit and clearly visible. Avoid blurriness and make sure the text is legible. Focus on one problem at a time. Even your laptop webcam works fine \u2014 no special camera needed!',
    },
    {
      q: 'Can the app handle problems in different languages?',
      a: 'Yes. DaVinci Solver supports problem-solving in over 50 languages, including English, Spanish, French, Chinese, Russian, Arabic, Portuguese, Hindi, and many more.',
    },
    {
      q: "What should I do if the app doesn\u2019t recognize my problem?",
      a: "Try taking another picture with better lighting and focus. If the problem persists, it may be outside the app\u2019s current capabilities. This is rare for academic work but can happen with abstract images like objects and faces.",
    },
    {
      q: 'Which exam boards and curriculums are supported?',
      a: "DaVinci Solver covers SAT, PSAT, AP, IGCSE, GCSE, Oxford AQA, AQA, IAL, A-Levels, IB MYP, IB PYP, IB DP, CBSE, ICSE, ISC, and all major international curriculums. If it\u2019s academic, we solve it.",
    },
    {
      q: 'Can DaVinci create a detailed curriculum and study plan for my course?',
      a: 'Yes \u2014 DaVinci generates comprehensive, course-specific outlines tailored to your exact syllabus. For AP students, that means unit-by-unit breakdowns aligned to the College Board framework (e.g. AP Calculus AB units 1\u201310 with key theorems and FRQ practice). For IGCSE and GCSE students, outlines follow the specification of your exam board \u2014 Edexcel, AQA, OCR, or Cambridge \u2014 with topic weighting and revision timelines. IB DP students get a full two-year plan with HL/SL distinctions, IA milestones, and TOK/EE deadlines. University students receive module-level study plans with lecture alignment, reading lists, and assessment schedules. Every plan is structured around your learning system so you know exactly what to study and when.',
    },
    {
      q: 'Can DaVinci grade my assignments, essays, and writeups?',
      a: 'Absolutely. Upload any assignment, essay, lab report, IB IA, coursework, or writeup and DaVinci will grade it against the relevant marking criteria \u2014 whether that\u2019s an IB IA rubric, AP FRQ scoring guidelines, GCSE mark scheme, or university rubric. You get a detailed score breakdown, specific strengths, weaknesses, and actionable feedback on how to improve. It\u2019s like having a private tutor review every piece of work before you submit it.',
    },
  ];

  return (
    <div className="landing">

      {/* ══════════ HERO ══════════ */}
      <section className="hero">
        {/* Floating academic symbols */}
        <div className="hero-symbols">
          <span>θ</span><span>∫</span><span>π</span><span>Σ</span><span>√</span>
          <span>∞</span><span>Δ</span><span>λ</span><span>φ</span><span>Ω</span>
          <span>∂</span><span>≈</span><span>ψ</span><span>∮</span><span>ε</span>
          <span>H₂O</span><span>α</span><span>β</span><span>∇</span><span>ℏ</span>
          <span>CO₂</span><span>ω</span><span>γ</span><span>ℝ</span><span>⊗</span>
          <span>Fe</span><span>∑</span><span>NaCl</span><span>ξ</span><span>μ</span>
          <span>τ</span><span>ρ</span><span>σ</span><span>ζ</span><span>η</span>
          <span>⇒</span><span>∝</span><span>ℵ</span><span>⊕</span><span>ℓ</span>
          <span>O₂</span><span>κ</span><span>ν</span><span>χ</span><span>δ</span>
          <span>∏</span><span>⊂</span><span>∧</span><span>≠</span><span>∈</span>
        </div>
        {/* Faint grid lines */}
        <div className="hero-grid-bg" />
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <h1>
                Snap a Problem.<br />
                Get the Solution.<br />
                <span className="hero-accent">In Any Language.</span>
              </h1>
              <p className="hero-desc">
                Point your phone at any problem handwritten or printed,
                in any language. DaVinci reads it instantly and delivers
                step-by-step solutions in <strong>over 50 languages</strong>.
              </p>
              <div className="hero-actions">
                {user ? (
                  <>
                    <Link to="/solve" className="btn btn-dark btn-lg">
                      Open Solver
                    </Link>
                    <Link to="/outline" className="btn btn-outline-dark btn-lg">
                      Get Free Outline
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-dark btn-lg">
                      Get Started Free
                    </Link>
                    <Link to="/outline" className="btn btn-outline-dark btn-lg">
                      Get Free Outline
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* ── Animated phone mock ── */}
            <div className="hero-visual">
              <div className="phone-mock">
                <div className="phone-mock-notch" />
                <div className="phone-mock-screen">
                  {/* Phase 0: camera viewfinder */}
                  <div className={`anim-layer anim-camera ${animPhase === 0 ? 'active' : ''}`}>
                    <div className="anim-viewfinder">
                      <svg viewBox="0 0 64 64" width="40" height="40">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#fff" strokeWidth="2" />
                        <circle cx="32" cy="32" r="10" fill="none" stroke="#fff" strokeWidth="2" />
                      </svg>
                    </div>
                    <span className="anim-label">Point at problem</span>
                  </div>
                  {/* Phase 1: shutter flash */}
                  <div className={`anim-layer anim-snap ${animPhase === 1 ? 'active' : ''}`}>
                    <div className="anim-shutter-ring" />
                    <span className="anim-label">Snap!</span>
                  </div>
                  {/* Phase 2: solution appears */}
                  <div className={`anim-layer anim-solve ${animPhase === 2 ? 'active' : ''}`}>
                    <div className="anim-solution-lines">
                      <span style={{ width: '80%' }} />
                      <span style={{ width: '60%' }} />
                      <span style={{ width: '90%' }} />
                      <span style={{ width: '45%' }} />
                    </div>
                    <span className="anim-label anim-label-green">Solution ready &#10003;</span>
                  </div>
                  {/* static math symbols in bg */}
                  <div className="phone-math-bg">
                    <span>&int;</span><span>&pi;</span><span>&Sigma;</span><span>&radic;</span>
                    <span>&infin;</span><span>&Delta;</span><span>&theta;</span><span>&lambda;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Three-feature callout (full-width row) ── */}
          <div className="hero-features">
            <div className="hero-feature">
              <span className="hero-feature-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </span>
              <div>
                <strong>Snap &amp; Solve</strong>
                <p>Photo any problem  get step-by-step solutions instantly</p>
              </div>
            </div>
            <div className="hero-feature">
              <span className="hero-feature-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </span>
              <div>
                <strong>Grade &amp; Feedback</strong>
                <p>Submit essays, IB IAs, projects &amp; assignments  get detailed grading and actionable feedback</p>
              </div>
            </div>
            <div className="hero-feature">
              <span className="hero-feature-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </span>
              <div>
                <strong>Course Outlines</strong>
                <p>Get your full course outline and requirements  organised and ready to follow</p>
              </div>
            </div>
          </div>

          {/* ── Where our learners come from ── */}
          <div className="hero-trusted">
            <div className="hero-trusted-icons">
              {/* Person icon */}
              <svg className="trusted-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {/* Group icon */}
              <svg className="trusted-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              {/* Globe icon */}
              <svg className="trusted-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>
              {/* Graduation cap icon */}
              <svg className="trusted-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10l-10-5L2 10l10 5 10-5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/><line x1="22" y1="10" x2="22" y2="16"/></svg>
            </div>
            <p className="hero-trusted-label">Where our learners come from</p>
          </div>
        </div>

        {/* ── Institutions carousel (inside hero) ── */}
        <div className="carousel-wrap">
          <div className="carousel-track">
            {[...institutions, ...institutions].map((inst, i) => (
              <div key={i} className="carousel-item">
                <img src={inst.logo} alt={inst.name} className="carousel-logo" />
                <span className="carousel-name">{inst.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="how-section">
        <div className="container">
          <h2 className="section-title">Homework solved in 3 taps</h2>
          <p className="section-subtitle">No typing equations. No searching. Just point your phone and solve.</p>
          <div className="steps-row">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Open Camera</h3>
              <p>Launch DaVinci on your phone. The camera opens instantly ready to capture.</p>
            </div>
            <div className="step-divider" />
            <div className="step">
              <div className="step-num">2</div>
              <h3>Snap the Problem</h3>
              <p>Take a photo of any homework problem  handwritten or printed, any language.</p>
            </div>
            <div className="step-divider" />
            <div className="step">
              <div className="step-num">3</div>
              <h3>Get the Solution</h3>
              <p>AI reads the problem and delivers a detailed, step-by-step solution in seconds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ EXAM BOARDS & CURRICULUMS ══════════ */}
      <section className="boards-section">
        <div className="container">
          <h2 className="section-title">Every curriculum. Every exam board.</h2>
          <p className="section-subtitle">
            Whether you are in Dubai, London, Delhi, or New York DaVinci covers your syllabus.
          </p>

          <div className="boards-grid">
            <div className="board-group">
              <div className="board-group-header">
                <img src={americanLogo} alt="US" className="board-group-logo" />
                <h4>US &amp; International Exams</h4>
              </div>
              <div className="board-tags">
                {['SAT', 'PSAT', 'AP Calculus', 'AP Physics', 'AP Chemistry', 'Pre-Calculus', 'Calculus'].map((t) => (
                  <span key={t} className="board-tag">{t}</span>
                ))}
              </div>
            </div>
            <div className="board-group">
              <div className="board-group-header">
                <img src={ukLogo} alt="UK" className="board-group-logo" />
                <h4>UK Exam Boards</h4>
              </div>
              <div className="board-tags">
                {['GCSE', 'IGCSE', 'A-Levels', 'IAL', 'AQA', 'Oxford AQA', 'Edexcel', 'OCR'].map((t) => (
                  <span key={t} className="board-tag">{t}</span>
                ))}
              </div>
            </div>
            <div className="board-group">
              <div className="board-group-header">
                <img src={ibLogo} alt="IB" className="board-group-logo" />
                <h4>IB Programme</h4>
              </div>
              <div className="board-tags">
                {['IB DP', 'IB MYP', 'IB PYP', 'IB Math AA', 'IB Math AI', 'IB Physics'].map((t) => (
                  <span key={t} className="board-tag">{t}</span>
                ))}
              </div>
            </div>
            <div className="board-group">
              <div className="board-group-header">
                <img src={indianLogo} alt="India" className="board-group-logo" />
                <h4>Indian Curriculums</h4>
              </div>
              <div className="board-tags">
                {['CBSE', 'ICSE', 'ISC', 'State Boards', 'JEE Prep', 'NEET Prep'].map((t) => (
                  <span key={t} className="board-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ SUBJECTS ══════════ */}
      <section className="subjects-section">
        <div className="container">
          <h2 className="section-title">Every STEM subject. Every level.</h2>
          <div className="subjects-grid">
            {[
              { icon: '\u{1F4D0}', name: 'Algebra & Geometry' },
              { icon: '\u{1F4CA}', name: 'Calculus & Pre-Calc' },
              { icon: '\u{1F4C8}', name: 'Statistics' },
              { icon: '\u269B\uFE0F', name: 'Physics' },
              { icon: '\u{1F9EA}', name: 'Chemistry' },
              { icon: '\u{1F9EC}', name: 'Biology' },
              { icon: '\u{1F522}', name: 'Trigonometry' },
              { icon: '\u{1F30D}', name: '50+ Languages' },
            ].map((s) => (
              <div key={s.name} className="subject-card">
                <span className="subject-icon">{s.icon}</span>
                <span className="subject-name">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Built for real students, real problems</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrap">&#129504;</div>
              <h4>GPT-4 Powered AI</h4>
              <p>The most advanced AI model reads your problems with OCR precision and solves with expert-level accuracy.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap">&#128241;</div>
              <h4>Phone-First Design</h4>
              <p>Built for your phone. Open camera, snap, done. No desktop required &mdash; solve homework from anywhere.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap">&#127760;</div>
              <h4>50+ Languages</h4>
              <p>Snap a problem in Arabic, French, Chinese, Hindi, or any language &mdash; get solutions in that same language.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap">&#128221;</div>
              <h4>Step-by-Step Solutions</h4>
              <p>Not just answers &mdash; full working shown with every step explained so you actually learn the method.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap">&#9997;&#65039;</div>
              <h4>Handwriting Support</h4>
              <p>Snap handwritten problems straight from your notebook. Legible handwriting is all you need.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap">&#127379;</div>
              <h4>Completely Free</h4>
              <p>No subscriptions, no paywalls, no catches. DaVinci Solver is free for every student.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">What our students say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <p>&ldquo;This app has been a lifesaver for my math homework. The solutions are accurate and easy to understand!&rdquo;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">S</div>
                <div>
                  <strong>Sarah</strong>
                  <span>High School Student, Dubai</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <p>&ldquo;I love how it supports multiple languages. Perfect for my bilingual classroom.&rdquo;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">A</div>
                <div>
                  <strong>Mr. Ahmed</strong>
                  <span>IGCSE Teacher, Abu Dhabi</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <p>&ldquo;I just snap my IB homework and get step-by-step solutions. Genuinely a game-changer.&rdquo;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">M</div>
                <div>
                  <strong>Maria</strong>
                  <span>IB DP Student, Sharjah</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section className="faq-section">
        <div className="container">
          <h2 className="section-title">Frequently asked questions</h2>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-q" onClick={() => toggle(i)}>
                  <span>{faq.q}</span>
                  <svg
                    className={`faq-chevron ${openFaq === i ? 'rotated' : ''}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className={`faq-a-wrap ${openFaq === i ? 'expanded' : ''}`}>
                  <p className="faq-a">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to solve your homework?</h2>
            <p>Join thousands of students across the UAE and worldwide using DaVinci Solver &mdash; completely free.</p>
            <div className="cta-actions">
              {user ? (
                <>
                  <Link to="/solve" className="btn btn-white">Open Solver</Link>
                  <Link to="/outline" className="btn btn-outline-white">Get Course Outline</Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-white">Create Free Account</Link>
                  <Link to="/outline" className="btn btn-outline-white">Get Course Outline</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
