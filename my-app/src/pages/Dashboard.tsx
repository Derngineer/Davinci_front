import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { changePassword } from '../services/auth';
import './Dashboard.css';

const MAX_DAILY = 20;

export default function Dashboard() {
  const { user, refreshUser, logout } = useAuth();

  /* ── Change-password state ─────────────────────────────── */
  const [showPwForm, setShowPwForm] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  if (!user) return null;

  const solvedToday = Math.max(0, MAX_DAILY - user.daily_count);
  const remaining  = user.daily_count;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg('');
    setPwErr('');

    if (newPw !== confirmPw) {
      setPwErr('New passwords do not match.');
      return;
    }
    if (newPw.length < 8) {
      setPwErr('New password must be at least 8 characters.');
      return;
    }

    setPwLoading(true);
    try {
      const res = await changePassword(oldPw, newPw);
      // Backend rotates token — store the new one
      if (res.token) {
        localStorage.setItem('dv_token', res.token);
      }
      setPwMsg('Password changed successfully!');
      setOldPw('');
      setNewPw('');
      setConfirmPw('');
      setShowPwForm(false);
      await refreshUser();
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || 'Failed to change password.';
      setPwErr(detail);
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner">
        {/* Greeting */}
        <div className="dashboard-greeting">
          <h1>Hey, {user.first_name} 👋</h1>
          <p>What would you like to do today?</p>
        </div>

        {/* ── Feature action cards ─────────────────────────── */}
        <div className="dash-actions-grid">
          <Link to="/solve" className="dash-action-card dash-action--solve">
            <div className="dash-action-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <h3>Solve</h3>
            <p>Snap a photo or upload a problem for step-by-step solutions</p>
            <span className="dash-action-arrow">→</span>
          </Link>

          <Link to="/grade" className="dash-action-card dash-action--grade">
            <div className="dash-action-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <h3>Grade</h3>
            <p>Upload essays, IAs, or assignments for detailed marking feedback</p>
            <span className="dash-action-arrow">→</span>
          </Link>

          <Link to="/outline" className="dash-action-card dash-action--outline">
            <div className="dash-action-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <h3>Course Outline</h3>
            <p>Generate a full syllabus plan for any subject and exam board</p>
            <span className="dash-action-arrow">→</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Solved Today</div>
            <div className="stat-value green">{solvedToday}</div>
            <div className="stat-sub">{remaining} remaining</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Daily Limit</div>
            <div className="stat-value">{MAX_DAILY}</div>
            <div className="stat-sub">Resets every 24 h</div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="profile-section">
          <h2>Your Profile</h2>

          <div className="profile-row">
            <span className="label">Name</span>
            <span className="value">{user.first_name} {user.last_name}</span>
          </div>
          <div className="profile-row">
            <span className="label">Email</span>
            <span className="value">{user.email}</span>
          </div>
          <div className="profile-row">
            <span className="label">Email Verified</span>
            <span className={`value ${user.email_verified ? 'verified' : 'unverified'}`}>
              {user.email_verified ? '✓ Verified' : '✗ Not verified'}
            </span>
          </div>
          <div className="profile-row">
            <span className="label">Account Type</span>
            <span className={`value ${user.is_premium_active ? 'verified' : ''}`}>
              {user.is_premium_active ? '⭐ Premium' : 'Free'}
            </span>
          </div>
        </div>

        {/* Change Password */}
        <div className="password-section">
          <div className="password-header">
            <h2>Security</h2>
            {!showPwForm && (
              <button className="btn-text" onClick={() => { setShowPwForm(true); setPwMsg(''); setPwErr(''); }}>
                Change Password
              </button>
            )}
          </div>

          {pwMsg && <div className="pw-success">{pwMsg}</div>}
          {pwErr && <div className="pw-error">{pwErr}</div>}

          {showPwForm && (
            <form className="pw-form" onSubmit={handleChangePassword}>
              <div className="pw-field">
                <label htmlFor="oldPw">Current Password</label>
                <input
                  id="oldPw"
                  type="password"
                  value={oldPw}
                  onChange={e => setOldPw(e.target.value)}
                  required
                />
              </div>
              <div className="pw-field">
                <label htmlFor="newPw">New Password</label>
                <input
                  id="newPw"
                  type="password"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="pw-field">
                <label htmlFor="confirmPw">Confirm New Password</label>
                <input
                  id="confirmPw"
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="pw-actions">
                <button type="submit" className="btn-primary" disabled={pwLoading}>
                  {pwLoading ? 'Saving…' : 'Update Password'}
                </button>
                <button type="button" className="btn-ghost" onClick={() => setShowPwForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Logout */}
        <button className="btn-logout" onClick={logout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
