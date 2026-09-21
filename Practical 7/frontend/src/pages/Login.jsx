import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

function Login({ onSwitchToRegister }) {
  const { login, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    if (error) clearError();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    await login(formData.email, formData.password);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-icon">🎮</span>
            <span className="auth-badge">NEXT TASK</span>
          </div>
          <h2 className="auth-title">PLAYER LOGIN</h2>
          <p className="auth-subtitle">Enter your credentials to continue your quest</p>
        </div>

        <div className="auth-divider"></div>

        {error && (
          <div className="auth-error-badge">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="email">
              <span>📧</span> EMAIL ADDRESS
            </label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">✉️</span>
              <input
                id="email"
                type="email"
                name="email"
                className="auth-input"
                placeholder="player@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label" htmlFor="password">
              <span>🔑</span> PASSWORD
            </label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔒</span>
              <input
                id="password"
                type="password"
                name="password"
                className="auth-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'LOGGING IN...' : 'START GAME ➔'}
          </button>
        </form>

        <div className="auth-footer">
          New to NextTask?
          <span className="auth-toggle-link" onClick={onSwitchToRegister}>
            Create Account ✦
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
