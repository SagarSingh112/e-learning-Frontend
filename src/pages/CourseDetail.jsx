import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI Transfer', icon: '📱', fields: ['UPI ID'] },
  { id: 'bank', label: 'Bank Transfer', icon: '🏦', fields: ['Account Number', 'IFSC Code', 'Account Holder Name'] },
  { id: 'wallet', label: 'Digital Wallet', icon: '💳', fields: ['Wallet ID / Phone Number'] },
];

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [payMethod, setPayMethod] = useState('upi');
  const [payDetails, setPayDetails] = useState({});
  const [existingEnrollment, setExistingEnrollment] = useState(null);

  useEffect(() => {
    api.get(`/courses/${id}`).then(r => setCourse(r.data)).catch(() => navigate('/courses')).finally(() => setLoading(false));
    if (user) {
      api.get('/enrollments/my').then(r => {
        const found = r.data.find(e => e.courseId === id);
        setExistingEnrollment(found || null);
      }).catch(() => {});
    }
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    setShowPayment(true);
  };

  const submitEnrollment = async () => {
    const method = PAYMENT_METHODS.find(m => m.id === payMethod);
    const missingField = method.fields.find(f => !payDetails[f]);
    if (missingField) return toast.error(`Please enter ${missingField}`);

    setEnrolling(true);
    try {
      await api.post('/enrollments', {
        courseId: course.id,
        paymentMethod: payMethod,
        paymentDetails: payDetails
      });
      toast.success('Enrollment submitted! Awaiting payment approval from admin.');
      setShowPayment(false);
      navigate('/my-courses');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!course) return null;

  const statusBadge = existingEnrollment ? {
    pending_payment: { text: 'Payment Pending', cls: 'badge-warning' },
    active: { text: 'Enrolled', cls: 'badge-success' },
    payment_rejected: { text: 'Payment Rejected', cls: 'badge-danger' },
  }[existingEnrollment.status] || { text: 'Enrolled', cls: 'badge-primary' } : null;

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start' }}>
          {/* Left: Course Info */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <span className="badge badge-primary" style={{ marginRight: 8 }}>{course.category}</span>
              <span className={`badge ${course.level === 'Beginner' ? 'badge-success' : course.level === 'Advanced' ? 'badge-danger' : 'badge-warning'}`}>{course.level}</span>
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(24px, 3vw, 42px)', fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
              {course.title}
            </h1>
            <p style={{ color: '#9090b8', fontSize: 16, lineHeight: 1.7, marginBottom: 24 }}>{course.description}</p>

            <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9090b8', fontSize: 14 }}>
                <span>👤</span> <span>{course.instructor}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9090b8', fontSize: 14 }}>
                <span className="stars">★</span> <span style={{ color: '#ffd700' }}>{course.rating}</span>
                <span>({course.students?.toLocaleString()} students)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9090b8', fontSize: 14 }}>
                <span>⏱</span> <span>{course.duration}</span>
              </div>
            </div>

            {/* Modules */}
            <div style={{ background: 'linear-gradient(145deg, #0d0d25, #12122d)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 20, padding: 32, marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
                📚 Course Curriculum ({course.modules?.length || 0} Modules)
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(course.modules || []).map((mod, i) => (
                  <div key={mod.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'rgba(108,99,255,0.05)', borderRadius: 12, border: '1px solid rgba(108,99,255,0.12)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #ff6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0, color: 'white' }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{mod.title}</div>
                      <div style={{ color: '#9090b8', fontSize: 13 }}>{mod.description}</div>
                    </div>
                    <div style={{ color: '#9090b8', fontSize: 13, flexShrink: 0 }}>⏱ {mod.duration}</div>
                    <div style={{ color: '#5a5a7a', fontSize: 18 }}>🔒</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment */}
            {course.assignment && (
              <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 20, padding: 28 }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, color: '#ffd700', marginBottom: 12 }}>🏆 Final Assignment</h3>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>{course.assignment.title}</p>
                <p style={{ color: '#9090b8', fontSize: 14, lineHeight: 1.6 }}>{course.assignment.description}</p>
              </div>
            )}
          </div>

          {/* Right: Enrollment Card */}
          <div style={{ position: 'sticky', top: 100 }}>
            <div style={{ background: 'linear-gradient(145deg, #0d0d25, #12122d)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 24, overflow: 'hidden' }}>
              <div style={{ height: 220, overflow: 'hidden' }}>
                <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'; }} />
              </div>
              <div style={{ padding: 28 }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, background: 'linear-gradient(135deg, #6c63ff, #ff6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 20 }}>
                  ₹{course.price?.toLocaleString()}
                </div>
                {existingEnrollment ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <span className={`badge ${statusBadge?.cls}`}>{statusBadge?.text}</span>
                    </div>
                    {existingEnrollment.status === 'active' && (
                      <Link to={`/learn/${existingEnrollment.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                        Continue Learning →
                      </Link>
                    )}
                    {existingEnrollment.status === 'pending_payment' && (
                      <div style={{ color: '#9090b8', fontSize: 13, lineHeight: 1.6, background: 'rgba(255,215,0,0.05)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,215,0,0.2)' }}>
                        ⏳ Your payment is under review. You'll get access once admin approves it.
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={handleEnroll} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                    Enroll Now →
                  </button>
                )}
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[`📚 ${course.modules?.length || 0} video modules`, `⏱ ${course.duration} total`, `🏆 Certificate of completion`, `♾ Lifetime access`, `📱 Mobile accessible`].map((item, i) => (
                    <div key={i} style={{ fontSize: 13, color: '#9090b8' }}>{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="modal-overlay" onClick={() => setShowPayment(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowPayment(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#9090b8', fontSize: 24, cursor: 'pointer' }}>✕</button>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Complete Payment</h2>
            <p style={{ color: '#9090b8', fontSize: 14, marginBottom: 28 }}>
              Send <strong style={{ color: '#6c63ff' }}>₹{course.price?.toLocaleString()}</strong> via your preferred method and submit your payment details. Admin will verify and approve your access.
            </p>

            {/* Payment Method Selection */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
              {PAYMENT_METHODS.map(m => (
                <button key={m.id} onClick={() => { setPayMethod(m.id); setPayDetails({}); }}
                  style={{ flex: 1, padding: '14px 12px', borderRadius: 12, border: `2px solid ${payMethod === m.id ? '#6c63ff' : 'rgba(108,99,255,0.2)'}`, background: payMethod === m.id ? 'rgba(108,99,255,0.12)' : 'transparent', color: payMethod === m.id ? '#6c63ff' : '#9090b8', cursor: 'pointer', fontSize: 13, fontWeight: 600, textAlign: 'center', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{m.icon}</div>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Admin Payment Info Banner */}
            <div style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: '#9090b8', lineHeight: 1.6 }}>
                📌 <strong style={{ color: '#f0f0ff' }}>Payment Instructions:</strong> Transfer the amount to our {PAYMENT_METHODS.find(m => m.id === payMethod)?.label} and enter your transaction details below. Our admin will verify within 24 hours.
              </p>
            </div>

            {PAYMENT_METHODS.find(m => m.id === payMethod)?.fields.map(field => (
              <div key={field} className="form-group">
                <label className="form-label">{field}</label>
                <input type="text" className="form-input" placeholder={`Enter your ${field}`}
                  value={payDetails[field] || ''}
                  onChange={e => setPayDetails({ ...payDetails, [field]: e.target.value })} />
              </div>
            ))}

            <div className="form-group">
              <label className="form-label">Transaction / Reference ID (Optional)</label>
              <input type="text" className="form-input" placeholder="Enter transaction ID for faster verification"
                value={payDetails['transactionId'] || ''}
                onChange={e => setPayDetails({ ...payDetails, transactionId: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={() => setShowPayment(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={submitEnrollment} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={enrolling}>
                {enrolling ? 'Submitting...' : `Submit Payment — ₹${course.price?.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
