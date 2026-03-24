import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import BrandLogo from '../components/BrandLogo';
import stockImg from '../assets/pexels-polina-tankilevitch-6929273.jpg';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where to go after login — default to /solve if no "from" state
  const returnTo = (location.state as { from?: string })?.from || '/solve';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate(returnTo);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        || 'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left: Image ── */}
      <div className="auth-image-section">
        <img src={stockImg} alt="Student studying" />
        <div className="auth-image-overlay" />
        <div className="auth-image-content">
          <h1>Welcome Back</h1>
          <p>Your gateway to putting your school problems on chokehold</p>
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div className="auth-form-section">
        <div className="auth-form-header">
          <Link to="/" className="auth-form-logo"><BrandLogo showSolver uppercase={false} /></Link>
        </div>

        <div className="auth-form-main auth-animate">
          <h1 className="auth-title">Sign in</h1>
          <p className="auth-subtitle">Enter your credentials to access your account</p>

          {error && <div className="auth-alert error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="form-input"
                type="password"
                placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-auth"
              disabled={loading}
            >
              {loading ? 'Signing in\u2026' : 'Continue'}
            </button>
          </form>
        </div>

        <div className="auth-form-footer">
          <p>
            {"Don\u2019t have an account?"}
            <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
