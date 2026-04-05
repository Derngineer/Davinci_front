import { useState, useEffect, useCallback } from 'react';
import './WaitingAnimation.css';

/* ── Per-feature message banks ─────────────────────────────── */
const MESSAGES: Record<string, string[]> = {
  solving: [
    'Reading your handwriting\u2026 impressive penmanship btw',
    'Consulting ancient mathematicians\u2026',
    'Asking Newton if he\u2019s sure about that formula',
    'Doing the math you didn\u2019t want to do',
    'Channeling Einstein\u2019s ghost\u2026 hold on',
    'Crunching numbers at the speed of light',
    'Your calculator could never',
    'Teaching the AI to carry the one\u2026',
    'Solving this faster than your tutor',
    'Running this through 47 dimensions of math',
    'Factoring polynomials while you wait',
    'Making your math teacher proud',
    'Turning panic into step-by-step clarity',
    'This problem thought it was hard lol',
    'Pythagoras just called \u2014 he\u2019s impressed',
    'Integrating\u2026 and not just mathematically',
    'Derivatives? More like child\u2019s play',
    'Working harder than a TI-84 right now',
  ],
  grading: [
    'Reading every word\u2026 yes, even that paragraph',
    'Putting on our strictest teacher glasses',
    'Cross-referencing the marking scheme\u2026',
    'Your essay is being judged (fairly, we promise)',
    'Counting how many times you wrote "however"',
    'Checking if your thesis actually has a thesis',
    'Grading harder than your IB examiner',
    'Looking for the analysis your teacher wants',
    'Making sure your IA isn\u2019t just vibes',
    'Evaluating like an examiner on three coffees',
    'Scanning for "in conclusion" (please say you didn\u2019t)',
    'Your bibliography is under investigation',
    'Hunting for supporting evidence\u2026',
    'Comparing against the rubric\u2026 ruthlessly',
    'Giving you the feedback your teacher was too nice to give',
    'Determining if this is a 7 or a "nice try"',
    'Spellcheck passed. Now for the hard part\u2026',
    'Looking for critical thinking\u2026 found some!',
  ],
  outline: [
    'Mapping your entire syllabus\u2026',
    'Building a study plan that actually makes sense',
    'Organising topics your teacher never bothered to',
    'Creating the checklist you\u2019ll actually use',
    'Putting HL and SL in their correct lanes',
    'Scheduling your IA deadline (sorry)',
    'Making revision look less terrifying',
    'Aligning everything to your exam board spec',
    'Calculating optimal study hours\u2026 you\u2019ll need coffee',
    'Planning your semester so you don\u2019t have to',
    'Building the outline your future self will thank you for',
    'Cross-referencing with past papers\u2026',
    'Adding revision timelines (you\u2019re welcome)',
    'Turning syllabus chaos into beautiful order',
    'This outline is about to change your life',
    'Structuring knowledge like a pro librarian',
  ],
};

/* ── Fake progress phrases ── */
const PROGRESS_PHASES = [
  'Initialising',
  'Analysing',
  'Processing',
  'Almost there',
  'Polishing',
];

interface Props {
  mode: 'solving' | 'grading' | 'outline';
}

export default function WaitingAnimation({ mode }: Props) {
  const bank = MESSAGES[mode] ?? MESSAGES.solving;

  /* ── State ── */
  const [msgIndex, setMsgIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState<'typing' | 'visible' | 'striking' | 'fading'>('typing');
  const [progressIdx, setProgressIdx] = useState(0);
  const [dots, setDots] = useState('');

  /* Pick a random starting message */
  const pickNext = useCallback(() => {
    setMsgIndex((prev) => {
      let next = Math.floor(Math.random() * bank.length);
      while (next === prev && bank.length > 1) {
        next = Math.floor(Math.random() * bank.length);
      }
      return next;
    });
  }, [bank]);

  /* ── Typewriter effect ── */
  useEffect(() => {
    const msg = bank[msgIndex];

    if (phase === 'typing') {
      if (displayed.length < msg.length) {
        const t = setTimeout(() => {
          setDisplayed(msg.slice(0, displayed.length + 1));
        }, 30 + Math.random() * 25);
        return () => clearTimeout(t);
      }
      // Done typing → show for a beat
      const t = setTimeout(() => setPhase('visible'), 600);
      return () => clearTimeout(t);
    }

    if (phase === 'visible') {
      const t = setTimeout(() => setPhase('striking'), 1200);
      return () => clearTimeout(t);
    }

    if (phase === 'striking') {
      const t = setTimeout(() => setPhase('fading'), 700);
      return () => clearTimeout(t);
    }

    if (phase === 'fading') {
      const t = setTimeout(() => {
        pickNext();
        setDisplayed('');
        setPhase('typing');
      }, 400);
      return () => clearTimeout(t);
    }
  }, [phase, displayed, msgIndex, bank, pickNext]);

  /* ── Animated dots on progress text ── */
  useEffect(() => {
    const t = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(t);
  }, []);

  /* ── Cycle progress phases ── */
  useEffect(() => {
    const t = setInterval(() => {
      setProgressIdx((i) => (i + 1) % PROGRESS_PHASES.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const accentClass =
    mode === 'solving' ? 'wa-accent--blue' :
    mode === 'grading' ? 'wa-accent--green' :
    'wa-accent--purple';

  return (
    <div className="wa-container">
      {/* Animated gradient orb */}
      <div className={`wa-orb ${accentClass}`} />

      {/* Progress label */}
      <p className={`wa-progress ${accentClass}`}>
        {PROGRESS_PHASES[progressIdx]}{dots}
      </p>

      {/* Typewriter message area */}
      <div className="wa-message-area">
        <span
          className={`wa-message ${
            phase === 'striking' ? 'wa-message--strike' : ''
          } ${phase === 'fading' ? 'wa-message--fade' : ''}`}
        >
          {displayed}
          {phase === 'typing' && <span className="wa-cursor">|</span>}
        </span>
      </div>

      {/* Subtle bottom hint */}
      <p className="wa-hint">This usually takes 10–30 seconds</p>
    </div>
  );
}
