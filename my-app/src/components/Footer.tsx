import { Link, useLocation } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import './Footer.css';

export default function Footer() {
  const location = useLocation();

  // Hide footer on solver and auth pages
  const hiddenPaths = ['/solve', '/login', '/register'];
  if (hiddenPaths.includes(location.pathname)) return null;

  const whatsappMsg = encodeURIComponent(
    'Hi, I would like to know more about DaVinci Solver. Could you please share more details?'
  );
  const whatsappUrl = `https://wa.me/971523375703?text=${whatsappMsg}`;

  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-brand"><BrandLogo showSolver uppercase={false} /></span>
        <div className="footer-links">
          <Link to="/outline">Course Outline</Link>
          <Link to="/about">About</Link>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Contact</a>
        </div>
        <p className="footer-copy">
          © {new Date().getFullYear()} DaVinci Solver. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
