import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/enrollments')
    ]).then(([statsRes, enrRes]) => {
      setStats(statsRes.data);
      setEnrollments(enrRes.data.slice(0, 8));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const statCards = [
    { icon: '👥', label: 'Total Students', value: stats?.totalStudents || 0, color: '#6c63ff' },
    { icon: '📚', label: 'Total Courses', value: stats?.totalCourses || 0, color: '#43e8d8' },
    { icon: '⏳', label: 'Pending Payments', value: stats?.pendingPayments || 0, color: '#ffd700' },
    { icon: '✅', label: 'Active Enrollments', value: stats?.approvedEnrollments || 0, color: '#ff6584' },
    { icon: '🏆', label: 'Completions', value: stats?.completedCourses || 0, color: '#43e8d8' },
    { icon: '💰', label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, color: '#6c63ff' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Admin <span className="gradient-text">Dashboard</span>
        </h1>
        <p style={{ color: '#9090b8' }}>Overview of your e-learning platform</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#9090b8' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Enrollments */}
      <div style={{ background: 'linear-gradient(145deg, #0d0d25, #12122d)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 20, padding: 28 }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Recent Enrollments</h2>
        {enrollments.length === 0 ? (
          <div className="empty-state"><p>No enrollments yet</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map(e => (
                  <tr key={e.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{e.user?.name?.[0]}</div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{e.user?.name}</div>
                          <div style={{ fontSize: 12, color: '#9090b8' }}>{e.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, maxWidth: 200 }}>{e.course?.title}</td>
                    <td style={{ fontWeight: 600, color: '#6c63ff' }}>₹{e.amount?.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${e.paymentStatus === 'approved' ? 'badge-success' : e.paymentStatus === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {e.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${e.completed ? 'badge-success' : e.status === 'active' ? 'badge-primary' : 'badge-warning'}`}>
                        {e.completed ? 'Completed' : e.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#9090b8' }}>{new Date(e.enrolledAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
