import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import BrandLogo from './BrandLogo';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Hide navbar on solver and auth pages for immersive experience
  const hiddenPaths = ['/solve', '/login', '/register'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand"><BrandLogo /></Link>

        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/solve" className="nav-solve-btn">Solve</Link>
              <Link to="/outline" className="nav-outline-btn">Course Outline</Link>
              <Link to="/dashboard">Dashboard</Link>
              <button onClick={logout}>Logout</button>
              <Link to="/dashboard" className="nav-user-badge">
                <span className="nav-avatar">
                  {user.first_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="nav-cta">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
