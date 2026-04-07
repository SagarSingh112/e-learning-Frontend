import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Certificate from '../components/Certificate';

const tabs = ['All', 'Active', 'Pending', 'Completed'];

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const [certEnrollment, setCertEnrollment] = useState(null);

  useEffect(() => {
    api.get('/enrollments/my').then(r => setEnrollments(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = enrollments.filter(e => {
    if (tab === 'All') return true;
    if (tab === 'Active') return e.status === 'active' && !e.completed;
    if (tab === 'Pending') return e.paymentStatus === 'pending';
    if (tab === 'Completed') return e.completed;
    return true;
  });

  const getProgress = (e) => {
    if (!e.course?.modules?.length) return 0;
    return Math.round((e.completedModules?.length || 0) / e.course.modules.length * 100);
  };

  const getStatusInfo = (e) => {
    if (e.completed) return { label: '✅ Completed', cls: 'badge-success' };
    if (e.status === 'active') return { label: '📖 In Progress', cls: 'badge-primary' };
    if (e.paymentStatus === 'pending') return { label: '⏳ Payment Pending', cls: 'badge-warning' };
    if (e.paymentStatus === 'rejected') return { label: '❌ Payment Rejected', cls: 'badge-danger' };
    return { label: e.status, cls: 'badge-primary' };
  };

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 800, marginBottom: 8 }}>
            My <span className="gradient-text">Learning</span>
          </h1>
          <p style={{ color: '#9090b8' }}>All your enrolled courses in one place</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, background: 'rgba(108,99,255,0.08)', padding: 6, borderRadius: 12, width: 'fit-content' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 500, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                background: tab === t ? 'linear-gradient(135deg, #6c63ff, #ff6584)' : 'transparent',
                color: tab === t ? 'white' : '#9090b8',
              }}>
              {t}
              {t === 'Completed' && enrollments.filter(e => e.completed).length > 0 && (
                <span style={{ marginLeft: 6, background: 'rgba(67,232,216,0.3)', color: '#43e8d8', padding: '1px 7px', borderRadius: 50, fontSize: 11 }}>
                  {enrollments.filter(e => e.completed).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>No courses found</h3>
            <p style={{ marginBottom: 20 }}>
              {tab === 'All' ? "You haven't enrolled in any courses yet." : `No ${tab.toLowerCase()} courses.`}
            </p>
            <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filtered.map(e => {
              const progress = getProgress(e);
              const status = getStatusInfo(e);
              return (
                <div key={e.id} style={{ background: 'linear-gradient(145deg, #0d0d25, #12122d)', border: `1px solid ${e.completed ? 'rgba(67,232,216,0.25)' : 'rgba(108,99,255,0.2)'}`, borderRadius: 20, overflow: 'hidden' }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: 200, flexShrink: 0, position: 'relative' }}>
                      <img src={e.course?.thumbnail} alt={e.course?.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={ev => { ev.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'; }} />
                      {e.completed && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,16,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ fontSize: 40 }}>🏆</div>
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, padding: 28 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700 }}>{e.course?.title}</h3>
                        <span className={`badge ${status.cls}`} style={{ flexShrink: 0, marginLeft: 16 }}>{status.label}</span>
                      </div>

                      <div style={{ fontSize: 13, color: '#9090b8', marginBottom: 16 }}>
                        👤 {e.course?.instructor} &nbsp;•&nbsp; ₹{e.amount?.toLocaleString()} paid
                        &nbsp;•&nbsp; Enrolled {new Date(e.enrolledAt).toLocaleDateString()}
                        {e.completed && e.completedAt && (
                          <> &nbsp;•&nbsp; Completed {new Date(e.completedAt).toLocaleDateString()}</>
                        )}
                      </div>

                      {e.status === 'active' && !e.completed && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, color: '#9090b8' }}>
                              {e.completedModules?.length || 0} / {e.course?.modules?.length || 0} modules
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#6c63ff' }}>{progress}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Completed: show certificate banner */}
                      {e.completed && (
                        <div style={{ background: 'rgba(67,232,216,0.06)', border: '1px solid rgba(67,232,216,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#43e8d8', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                          🎓 <span>Course completed — your certificate is ready to download!</span>
                        </div>
                      )}

                      {e.paymentStatus === 'pending' && (
                        <div style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ffd700', marginBottom: 16 }}>
                          ⏳ Payment under review — you'll gain access once approved by admin
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {e.completed && (
                          <button
                            onClick={() => setCertEnrollment(e)}
                            className="btn btn-primary btn-sm"
                            style={{ background: 'linear-gradient(135deg,#43e8d8,#6c63ff)', boxShadow: '0 4px 16px rgba(67,232,216,0.25)' }}
                          >
                            🏆 View & Download Certificate
                          </button>
                        )}
                        {e.status === 'active' && !e.completed && (
                          <Link to={`/learn/${e.id}`} className="btn btn-primary btn-sm">
                            {progress > 0 ? 'Continue Learning →' : 'Start Course →'}
                          </Link>
                        )}
                        <Link to={`/courses/${e.courseId}`} className="btn btn-secondary btn-sm">
                          Course Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {certEnrollment && (
        <Certificate
          enrollment={certEnrollment}
          onClose={() => setCertEnrollment(null)}
        />
      )}
    </div>
  );
}
