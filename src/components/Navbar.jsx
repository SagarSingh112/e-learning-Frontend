import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(5, 5, 16, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(108, 99, 255, 0.15)',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '72px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>⚡</div>
          <span style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '22px',
            background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>EduVerse</span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[
            { to: '/', label: 'Home' },
            { to: '/courses', label: 'Courses' },
          ].map(link => (
            <Link key={link.to} to={link.to} style={{
              padding: '8px 16px', borderRadius: '8px', textDecoration: 'none',
              fontSize: '14px', fontWeight: 500,
              color: isActive(link.to) ? '#6c63ff' : '#9090b8',
              background: isActive(link.to) ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
              transition: 'all 0.2s',
            }}>{link.label}</Link>
          ))}
          {user && (
            <>
              <Link to="/dashboard" style={{
                padding: '8px 16px', borderRadius: '8px', textDecoration: 'none',
                fontSize: '14px', fontWeight: 500,
                color: isActive('/dashboard') ? '#6c63ff' : '#9090b8',
                background: isActive('/dashboard') ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
              }}>Dashboard</Link>
              <Link to="/my-courses" style={{
                padding: '8px 16px', borderRadius: '8px', textDecoration: 'none',
                fontSize: '14px', fontWeight: 500,
                color: isActive('/my-courses') ? '#6c63ff' : '#9090b8',
                background: isActive('/my-courses') ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
              }}>My Learning</Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={{
                  padding: '8px 16px', borderRadius: '8px', textDecoration: 'none',
                  fontSize: '14px', fontWeight: 500, color: '#ffd700',
                  background: 'rgba(255, 215, 0, 0.08)',
                }}>⚙ Admin</Link>
              )}
            </>
          )}
        </div>

        {/* Auth buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                  {user.name[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '14px', color: '#9090b8' }}>{user.name.split(' ')[0]}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
