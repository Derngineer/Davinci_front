import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/auth';
import api from '../services/api';
import BrandLogo from '../components/BrandLogo';
import stockImg from '../assets/pexels-polina-tankilevitch-6929273.jpg';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();

  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    confirm_email: '',
    password: '',
    country: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch countries on mount
  useEffect(() => {
    api.get('/accounts/countries/')
      .then((res) => {
        const data = res.data;
        setCountries(Array.isArray(data) ? data : []);
      })
      .catch(() => { /* silently fail — user can still type */ });
  }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.email !== form.confirm_email) {
      setError('Emails do not match.');
      return;
    }

    setLoading(true);
    try {
      await signup(form);
      setSuccess('Account created! Redirecting to sign in\u2026');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const messages = Object.values(data)
          .flat()
          .join(' ');
        setError(messages || 'Registration failed.');
      } else if (typeof data === 'string') {
        setError(data);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left: Image ── */}
      <div className="auth-image-section">
        <img src={stockImg} alt="Student learning" />
        <div className="auth-image-overlay" />
        <div className="auth-image-content">
          <h1>Start Solving</h1>
          <p>Create your account in seconds</p>
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div className="auth-form-section">
        <div className="auth-form-header">
          <Link to="/" className="auth-form-logo"><BrandLogo showSolver uppercase={false} /></Link>
        </div>

        <div className="auth-form-main auth-animate">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Fill in your details to get started</p>

          {error && <div className="auth-alert error">{error}</div>}
          {success && <div className="auth-alert success">{success}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="first_name">First Name</label>
                <input
                  id="first_name"
                  className="form-input"
                  placeholder="Ada"
                  value={form.first_name}
                  onChange={set('first_name')}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="last_name">Last Name</label>
                <input
                  id="last_name"
                  className="form-input"
                  placeholder="Lovelace"
                  value={form.last_name}
                  onChange={set('last_name')}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-email">Confirm Email</label>
              <input
                id="confirm-email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.confirm_email}
                onChange={set('confirm_email')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                className="form-input"
                type="password"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={set('password')}
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="country">Country</label>
              <select
                id="country"
                className="form-input"
                value={form.country}
                onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                required
              >
                <option value="">Select your country</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn-auth"
              disabled={loading}
            >
              {loading ? 'Creating account\u2026' : 'Create Account'}
            </button>
          </form>
        </div>

        <div className="auth-form-footer">
          <p>
            Already have an account?
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
