import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

function Register({ onSwitchToLogin }) {
  const { register, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    if (error) clearError();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return;
    await register(formData.name, formData.email, formData.password);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-icon">✨</span>
            <span className="auth-badge">NEW HERO</span>
          </div>
          <h2 className="auth-title">REGISTER PLAYER</h2>
          <p className="auth-subtitle">Create an account to track your productivity quest</p>
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
            <label className="auth-label" htmlFor="name">
              <span>👤</span> PLAYER NAME
            </label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🎮</span>
              <input
                id="name"
                type="text"
                name="name"
                className="auth-input"
                placeholder="Alex Mercer"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

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
              <span>🔑</span> PASSWORD (MIN 6 CHARS)
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
                minLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'CREATING...' : 'JOIN QUEST ➔'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?
          <span className="auth-toggle-link" onClick={onSwitchToLogin}>
            Login Here ✦
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register;
