import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCountries, setCountry } from '../services/auth';
import { useAuth } from '../context/useAuth';
import BrandLogo from '../components/BrandLogo';
import { Link } from 'react-router-dom';
import stockImg from '../assets/pexels-polina-tankilevitch-6929273.jpg';
import './Auth.css';

export default function SelectCountry() {
  const navigate = useNavigate();
  const { token, refreshUser } = useAuth();

  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [error, setError] = useState('');

  // Guard: if the user somehow lands here without being logged in, redirect
  useEffect(() => {
    if (!token) navigate('/login', { replace: true });
  }, [token, navigate]);

  // Fetch country list (reuse same retry logic as Register)
  useEffect(() => {
    let cancelled = false;
    const load = async (retries = 3, delay = 3000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const data = await fetchCountries();
          if (!cancelled && Array.isArray(data)) {
            setCountries(data);
            setCountriesLoading(false);
            return;
          }
        } catch {
          if (i < retries - 1) await new Promise((r) => setTimeout(r, delay));
        }
      }
      if (!cancelled) setCountriesLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async () => {
    if (!selected) return;
    setError('');
    setLoading(true);

    try {
      await setCountry(selected);
      // Refresh the user profile in context so country is up-to-date
      await refreshUser();
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Failed to save country. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left: Image ── */}
      <div className="auth-image-section">
        <img src={stockImg} alt="Globe" />
        <div className="auth-image-overlay" />
        <div className="auth-image-content">
          <h1>Almost There!</h1>
          <p>Just one quick step before you start solving</p>
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div className="auth-form-section">
        <div className="auth-form-header">
          <Link to="/" className="auth-form-logo">
            <BrandLogo showSolver uppercase={false} />
          </Link>
        </div>

        <div className="auth-form-main auth-animate">
          <h1 className="auth-title">Where are you from?</h1>
          <p className="auth-subtitle">
            We use this to tailor your experience — you can change it later.
          </p>

          {error && <div className="auth-alert error">{error}</div>}

          <div className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="country">Country</label>
              <select
                id="country"
                className="form-input"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                disabled={countriesLoading}
              >
                <option value="">
                  {countriesLoading ? 'Loading countries\u2026' : 'Select your country'}
                </option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btn-auth"
              onClick={handleSubmit}
              disabled={!selected || loading}
            >
              {loading ? 'Saving\u2026' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
