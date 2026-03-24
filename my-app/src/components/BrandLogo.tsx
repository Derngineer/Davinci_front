import './BrandLogo.css';

interface BrandLogoProps {
  /** Show "Solver" suffix — used on auth pages & footer */
  showSolver?: boolean;
  /** Use uppercase "DA VINCI" (navbar/solver) vs title-case "Da Vinci" */
  uppercase?: boolean;
}

/**
 * The DaVinci brand mark.
 * The "A" is rendered as a lambda-style glyph (Λ without the crossbar).
 */
export default function BrandLogo({ showSolver = false, uppercase = true }: BrandLogoProps) {
  const d = uppercase ? 'D' : 'D';
  const vinci = uppercase ? 'VINCI' : 'inci';
  const aLabel = uppercase ? '' : '';

  return (
    <span className="brand-logo" aria-label={`D${aLabel}Vinci${showSolver ? ' Solver' : ''}`}>
      <span className="brand-dark">{d}</span>
      {/* Lambda-style A — the letter A without the horizontal crossbar */}
      <svg
        className="brand-lambda"
        viewBox="0 0 28 32"
        aria-hidden="true"
      >
        <path
          d="M14 2 L2 30 L7 30 L14 13 L21 30 L26 30 Z"
          fill="currentColor"
        />
      </svg>
      <span className="brand-blue">{vinci}</span>
      {showSolver && <span className="brand-solver">{uppercase ? ' SOLVER' : ' Solver'}</span>}
    </span>
  );
}
