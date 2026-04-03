import { Link } from 'react-router-dom';
import type { GuestFeature } from '../hooks/useGuestQuery';
import { GUEST_LIMITS } from '../hooks/useGuestQuery';
import './AuthPromptModal.css';

interface AuthPromptModalProps {
  feature: GuestFeature;
  onClose: () => void;
}

const FEATURE_COPY: Record<GuestFeature, { icon: string; title: string; body: string }> = {
  solve: {
    icon: '📷',
    title: "You've used your free solves",
    body: `You've used all ${GUEST_LIMITS.solve} free solves. Create a free account to keep solving unlimited problems — no credit card, no catch.`,
  },
  grade: {
    icon: '✓',
    title: "You've used your free grade",
    body: `You've used your ${GUEST_LIMITS.grade} free grade. Create a free account to keep grading essays, IAs, and assignments with detailed AI feedback.`,
  },
  outline: {
    icon: '📚',
    title: "You've used your free outline",
    body: `You've used your ${GUEST_LIMITS.outline} free outline. Create a free account to generate unlimited course outlines for any subject or syllabus.`,
  },
};

export default function AuthPromptModal({ feature, onClose }: AuthPromptModalProps) {
  const copy = FEATURE_COPY[feature];

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="auth-modal-icon">{copy.icon}</div>
        <h2 className="auth-modal-title">{copy.title}</h2>
        <p className="auth-modal-body">{copy.body}</p>

        <div className="auth-modal-actions">
          <Link to="/register" className="auth-modal-btn auth-modal-btn-primary">
            Create Free Account
          </Link>
          <Link to="/login" className="auth-modal-btn auth-modal-btn-ghost">
            Log In
          </Link>
        </div>

        <button className="auth-modal-skip" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
