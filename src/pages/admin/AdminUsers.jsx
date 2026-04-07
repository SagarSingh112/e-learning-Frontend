import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => api.get('/admin/users').then(r => setUsers(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete student "${name}"? This will also remove their enrollments.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('Student deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = users.filter(u => u.role === 'student').filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const admins = users.filter(u => u.role === 'admin');

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
          Manage <span className="gradient-text">Students</span>
        </h1>
        <p style={{ color: '#9090b8' }}>{filtered.length} registered students</p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <input type="text" className="form-input" placeholder="🔍 Search students by name or email..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 400 }} />
      </div>

      {/* Students Table */}
      <div style={{ background: 'linear-gradient(145deg, #0d0d25, #12122d)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 20, overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(108,99,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700 }}>Students ({filtered.length})</h2>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No students found</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="avatar" style={{ width: 36, height: 36, fontSize: 15 }}>{u.name[0]}</div>
                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: '#9090b8' }}>{u.email}</td>
                    <td style={{ fontSize: 13, color: '#9090b8' }}>{u.phone || '—'}</td>
                    <td style={{ fontSize: 13, color: '#9090b8' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => handleDelete(u.id, u.name)} className="btn btn-danger btn-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admins */}
      <div style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,215,0,0.15)' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#ffd700' }}>⚙ Administrators ({admins.length})</h2>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar" style={{ width: 36, height: 36, fontSize: 15, background: 'linear-gradient(135deg, #ffd700, #ff6584)' }}>{u.name[0]}</div>
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: '#9090b8' }}>{u.email}</td>
                  <td><span className="badge badge-warning">Admin</span></td>
                  <td style={{ fontSize: 13, color: '#9090b8' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
