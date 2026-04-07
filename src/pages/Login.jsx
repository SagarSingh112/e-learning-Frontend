import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, background: 'linear-gradient(135deg, #6c63ff, #ff6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
              ⚡ EduVerse
            </div>
          </Link>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Welcome Back</h1>
          <p style={{ color: '#9090b8', fontSize: 15 }}>Sign in to continue your learning journey</p>
        </div>

        <div style={{ background: 'linear-gradient(145deg, #0d0d25, #12122d)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 24, padding: 40 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '14px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, padding: '16px 0', borderTop: '1px solid rgba(108,99,255,0.15)' }}>
            <span style={{ color: '#9090b8', fontSize: 14 }}>Don't have an account? </span>
            <Link to="/register" style={{ color: '#6c63ff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Create one free</Link>
          </div>

          {/* Demo credentials */}
          <div style={{ marginTop: 16, padding: 16, background: 'rgba(108,99,255,0.08)', borderRadius: 12, border: '1px solid rgba(108,99,255,0.2)' }}>
            <p style={{ fontSize: 12, color: '#9090b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo Credentials</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => setForm({ email: 'admin@elearn.com', password: 'admin123' })}
                style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', color: '#ffd700', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
                ⚙ Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
