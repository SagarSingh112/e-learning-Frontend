import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enrollments/my').then(r => setEnrollments(r.data)).finally(() => setLoading(false));
  }, []);

  const active = enrollments.filter(e => e.status === 'active');
  const pending = enrollments.filter(e => e.paymentStatus === 'pending');
  const completed = enrollments.filter(e => e.completed);

  const getProgress = (e) => {
    if (!e.course?.modules?.length) return 0;
    return Math.round((e.completedModules?.length || 0) / e.course.modules.length * 100);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 800, marginBottom: 8 }}>
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ color: '#9090b8' }}>Track your learning progress and continue where you left off.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
          {[
            { icon: '📚', label: 'Enrolled Courses', value: active.length, color: '#6c63ff' },
            { icon: '⏳', label: 'Pending Payments', value: pending.length, color: '#ffd700' },
            { icon: '🏆', label: 'Completed', value: completed.length, color: '#43e8d8' },
            { icon: '📈', label: 'In Progress', value: active.filter(e => !e.completed).length, color: '#ff6584' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#9090b8' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : enrollments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: 'linear-gradient(145deg, #0d0d25, #12122d)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 24 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎓</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', marginBottom: 12 }}>No courses yet</h2>
            <p style={{ color: '#9090b8', marginBottom: 24 }}>Start your learning journey by enrolling in a course</p>
            <Link to="/courses" className="btn btn-primary">Browse Courses →</Link>
          </div>
        ) : (
          <>
            {/* Active / In Progress */}
            {active.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
                  📖 Continue Learning
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {active.map(e => {
                    const progress = getProgress(e);
                    return (
                      <div key={e.id} style={{ background: 'linear-gradient(145deg, #0d0d25, #12122d)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 16, padding: 24, display: 'flex', gap: 20, alignItems: 'center' }}>
                        <img src={e.course?.thumbnail} alt={e.course?.title}
                          style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80'; }} />
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{e.course?.title}</h3>
                          <p style={{ color: '#9090b8', fontSize: 13, marginBottom: 12 }}>
                            {e.completedModules?.length || 0} / {e.course?.modules?.length || 0} modules completed
                          </p>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                          </div>
                          <div style={{ fontSize: 12, color: '#9090b8', marginTop: 6 }}>{progress}% complete</div>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          {e.completed ? (
                            <span className="badge badge-success">✅ Completed</span>
                          ) : (
                            <Link to={`/learn/${e.id}`} className="btn btn-primary btn-sm">
                              {progress > 0 ? 'Continue →' : 'Start →'}
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Pending Payments */}
            {pending.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
                  ⏳ Awaiting Payment Approval
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pending.map(e => (
                    <div key={e.id} style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 16, padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                      <span style={{ fontSize: 28 }}>⏳</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{e.course?.title}</div>
                        <div style={{ fontSize: 13, color: '#9090b8' }}>₹{e.amount?.toLocaleString()} via {e.paymentMethod?.toUpperCase()} — Admin reviewing your payment</div>
                      </div>
                      <span className="badge badge-warning">Pending</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Quick Links */}
        <div style={{ marginTop: 20 }}>
          <Link to="/courses" className="btn btn-secondary">
            + Enroll in More Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
