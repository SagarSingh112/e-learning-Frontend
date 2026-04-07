import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/courses', label: 'Courses', icon: '📚' },
  { to: '/admin/users', label: 'Students', icon: '👥' },
  { to: '/admin/enrollments', label: 'Enrollments', icon: '📋' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: 260, background: 'linear-gradient(180deg, #080820 0%, #0a0a1f 100%)', borderRight: '1px solid rgba(108,99,255,0.2)', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', top: 0, left: 0, zIndex: 50 }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(108,99,255,0.15)' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, background: 'linear-gradient(135deg, #6c63ff, #ff6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>
            ⚡ EduVerse
          </div>
          <div style={{ fontSize: 11, color: '#ffd700', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Panel</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, textDecoration: 'none', marginBottom: 4, fontSize: 14, fontWeight: isActive ? 600 : 400, transition: 'all 0.2s',
                background: isActive ? 'rgba(108,99,255,0.2)' : 'transparent',
                color: isActive ? '#6c63ff' : '#9090b8',
                borderLeft: isActive ? '3px solid #6c63ff' : '3px solid transparent'
              })}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(108,99,255,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div className="avatar" style={{ width: 36, height: 36, fontSize: 14 }}>{user?.name?.[0]}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#ffd700' }}>Administrator</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 260, minHeight: '100vh', padding: '32px', background: '#050510' }}>
        <Outlet />
      </main>
    </div>
  );
}
