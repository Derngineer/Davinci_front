import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import BrandLogo from './BrandLogo';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Hide navbar on solver and auth pages for immersive experience
  const hiddenPaths = ['/solve', '/login', '/register'];
  if (hiddenPaths.includes(location.pathname)) return null;

  // Helper to check if a path is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand"><BrandLogo /></Link>

        {/* ── Nav links (always inline for guests, burger for logged-in on mobile) ── */}
        {user ? (
          <>
            <div className="navbar-links navbar-desktop">
              <Link to="/solve" className={`nav-solve-btn${isActive('/solve') ? ' active' : ''}`}>Solve</Link>
              <Link to="/outline" className={`nav-outline-btn${isActive('/outline') ? ' active' : ''}`}>Course Outline</Link>
              <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link>
              <button onClick={logout}>Logout</button>
              <Link to="/dashboard" className="nav-user-badge">
                <span className="nav-avatar">
                  {user.first_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </Link>
            </div>
            {/* Burger button only for logged-in users */}
            <button
              className={`burger-btn ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
            >
              <span />
              <span />
              <span />
            </button>
          </>
        ) : (
          <div className="navbar-links navbar-desktop">
            <Link to="/login" className={isActive('/login') ? 'active' : ''}>Login</Link>
            <Link to="/register" className={`nav-cta${isActive('/register') ? ' active' : ''}`}>Get Started</Link>
          </div>
        )}
      </div>

      {/* ── Mobile backdrop ── */}
      {menuOpen && <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />}

      {/* ── Mobile drawer ── */}
      <div className={`nav-drawer ${menuOpen ? 'open' : ''}`}>
        {user ? (
          <>
            <div className="drawer-user">
              <span className="nav-avatar nav-avatar-lg">
                {user.first_name?.charAt(0).toUpperCase() || 'U'}
              </span>
              <div>
                <strong>{user.first_name} {user.last_name}</strong>
                <span className="drawer-email">{user.email}</span>
              </div>
            </div>
            <div className="drawer-divider" />
            <Link to="/solve" className={`drawer-link drawer-link-primary${isActive('/solve') ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
              Solve
            </Link>
            <Link to="/outline" className={`drawer-link${isActive('/outline') ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Course Outline
            </Link>
            <Link to="/dashboard" className={`drawer-link${isActive('/dashboard') ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              Dashboard
            </Link>
            <div className="drawer-divider" />
            <button onClick={() => { logout(); setMenuOpen(false); }} className="drawer-link drawer-link-logout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={`drawer-link${isActive('/login') ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" className={`drawer-link drawer-link-primary${isActive('/register') ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
