import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const tabs = ['All', 'Pending', 'Approved', 'Rejected', 'Completed'];

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Pending');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const load = () => api.get('/enrollments').then(r => setEnrollments(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = enrollments.filter(e => {
    const matchTab = tab === 'All' ? true
      : tab === 'Pending' ? e.paymentStatus === 'pending'
      : tab === 'Approved' ? e.paymentStatus === 'approved'
      : tab === 'Rejected' ? e.paymentStatus === 'rejected'
      : tab === 'Completed' ? e.completed
      : true;
    const matchSearch = !search || 
      e.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.course?.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.user?.email?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleAction = async (action) => {
    setProcessing(true);
    try {
      await api.put(`/enrollments/${selected.id}/payment`, { status: action, note });
      toast.success(action === 'approved' ? '✅ Payment approved! Student now has access.' : '❌ Payment rejected.');
      setSelected(null);
      setNote('');
      load();
    } catch { toast.error('Failed to update'); }
    finally { setProcessing(false); }
  };

  const tabCounts = {
    All: enrollments.length,
    Pending: enrollments.filter(e => e.paymentStatus === 'pending').length,
    Approved: enrollments.filter(e => e.paymentStatus === 'approved').length,
    Rejected: enrollments.filter(e => e.paymentStatus === 'rejected').length,
    Completed: enrollments.filter(e => e.completed).length,
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
          Manage <span className="gradient-text">Enrollments</span>
        </h1>
        <p style={{ color: '#9090b8' }}>
          Review payment submissions and manage student access
          {tabCounts.Pending > 0 && <span style={{ color: '#ffd700', marginLeft: 12 }}>⚠ {tabCounts.Pending} pending approval</span>}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '8px 18px', borderRadius: 8, border: `1px solid ${tab === t ? '#6c63ff' : 'rgba(108,99,255,0.2)'}`, cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 700 : 400, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
              background: tab === t ? 'rgba(108,99,255,0.2)' : 'transparent',
              color: tab === t ? '#6c63ff' : '#9090b8'
            }}>
            {t} {tabCounts[t] > 0 && <span style={{ marginLeft: 6, background: tab === t ? '#6c63ff' : 'rgba(108,99,255,0.3)', color: 'white', padding: '1px 7px', borderRadius: 50, fontSize: 11 }}>{tabCounts[t]}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input type="text" className="form-input" placeholder="🔍 Search by student name, email, or course..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 420 }} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No enrollments found</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(e => (
            <div key={e.id} style={{ background: 'linear-gradient(145deg, #0d0d25, #12122d)', border: `1px solid ${e.paymentStatus === 'pending' ? 'rgba(255,215,0,0.25)' : 'rgba(108,99,255,0.2)'}`, borderRadius: 16, padding: '20px 24px' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Student */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 180 }}>
                  <div className="avatar" style={{ width: 40, height: 40, fontSize: 16, flexShrink: 0 }}>{e.user?.name?.[0]}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{e.user?.name}</div>
                    <div style={{ fontSize: 12, color: '#9090b8' }}>{e.user?.email}</div>
                  </div>
                </div>

                {/* Course */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{e.course?.title}</div>
                  <div style={{ fontSize: 12, color: '#9090b8' }}>{e.course?.category}</div>
                </div>

                {/* Payment Info */}
                <div style={{ minWidth: 140 }}>
                  <div style={{ fontWeight: 700, color: '#6c63ff', fontSize: 16 }}>₹{e.amount?.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: '#9090b8', textTransform: 'capitalize' }}>{e.paymentMethod}</div>
                  {e.paymentDetails && Object.keys(e.paymentDetails).length > 0 && (
                    <div style={{ fontSize: 11, color: '#9090b8', marginTop: 4 }}>
                      {Object.entries(e.paymentDetails).slice(0, 2).map(([k, v]) => (
                        <div key={k}>{k}: <span style={{ color: '#c0c0d8' }}>{v}</span></div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status & Progress */}
                <div style={{ minWidth: 120 }}>
                  <span className={`badge ${e.paymentStatus === 'approved' ? 'badge-success' : e.paymentStatus === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                    {e.paymentStatus}
                  </span>
                  {e.status === 'active' && (
                    <div style={{ fontSize: 11, color: '#9090b8', marginTop: 6 }}>
                      {e.completedModules?.length || 0}/{e.course?.modules?.length || 0} modules
                    </div>
                  )}
                  {e.completed && <div style={{ marginTop: 4 }}><span className="badge badge-success" style={{ fontSize: 10 }}>✅ Completed</span></div>}
                </div>

                {/* Date */}
                <div style={{ fontSize: 12, color: '#9090b8', minWidth: 90 }}>
                  {new Date(e.enrolledAt).toLocaleDateString()}
                </div>

                {/* Action */}
                {e.paymentStatus === 'pending' && (
                  <button onClick={() => { setSelected(e); setNote(''); }} className="btn btn-primary btn-sm">
                    Review Payment
                  </button>
                )}
                {e.assignmentSubmitted && (
                  <button onClick={() => setSelected(e)} className="btn btn-secondary btn-sm">
                    View Assignment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Payment Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#9090b8', fontSize: 24, cursor: 'pointer' }}>✕</button>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
              {selected.paymentStatus === 'pending' ? 'Review Payment' : 'Enrollment Details'}
            </h2>

            {/* Student & Course Info */}
            <div style={{ background: 'rgba(108,99,255,0.06)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <div className="avatar">{selected.user?.name?.[0]}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{selected.user?.name}</div>
                  <div style={{ fontSize: 13, color: '#9090b8' }}>{selected.user?.email}</div>
                </div>
              </div>
              <div style={{ fontSize: 14, color: '#9090b8' }}>
                <div style={{ marginBottom: 4 }}>📚 <strong style={{ color: '#f0f0ff' }}>{selected.course?.title}</strong></div>
                <div style={{ marginBottom: 4 }}>💰 Amount: <strong style={{ color: '#6c63ff' }}>₹{selected.amount?.toLocaleString()}</strong></div>
                <div style={{ marginBottom: 4 }}>💳 Method: <strong style={{ color: '#f0f0ff', textTransform: 'capitalize' }}>{selected.paymentMethod}</strong></div>
              </div>
            </div>

            {/* Payment Details */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: '#9090b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Details Submitted</p>
              {Object.entries(selected.paymentDetails || {}).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(108,99,255,0.1)' }}>
                  <span style={{ fontSize: 13, color: '#9090b8', minWidth: 140 }}>{k}:</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f0ff' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Assignment Details (if viewing assignment) */}
            {selected.assignmentSubmitted && (
              <div style={{ background: 'rgba(67,232,216,0.06)', border: '1px solid rgba(67,232,216,0.2)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: '#43e8d8', fontWeight: 600, marginBottom: 8 }}>📝 Assignment Submitted</p>
                <p style={{ fontSize: 13, color: '#9090b8', lineHeight: 1.6 }}>{selected.assignmentText || 'No text submitted'}</p>
              </div>
            )}

            {selected.paymentStatus === 'pending' && (
              <>
                <div className="form-group">
                  <label className="form-label">Admin Note (Optional)</label>
                  <textarea className="form-input" rows={2} placeholder="Add a note for the student..." value={note} onChange={e => setNote(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => handleAction('rejected')} className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} disabled={processing}>
                    ❌ Reject
                  </button>
                  <button onClick={() => handleAction('approved')} className="btn btn-success" style={{ flex: 2, justifyContent: 'center' }} disabled={processing}>
                    {processing ? 'Processing...' : '✅ Approve Access'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
