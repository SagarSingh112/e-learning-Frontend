import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data.slice(0, 6))).finally(() => setLoading(false));
  }, []);

  const stats = [
    { value: '50K+', label: 'Students Enrolled' },
    { value: '200+', label: 'Expert Courses' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '24/7', label: 'Support Access' },
  ];

  const categories = [
    { icon: '💻', label: 'Web Development', count: 42 },
    { icon: '🤖', label: 'Data Science', count: 35 },
    { icon: '🎨', label: 'UI/UX Design', count: 28 },
    { icon: '📱', label: 'Mobile Dev', count: 19 },
    { icon: '🔐', label: 'Cybersecurity', count: 24 },
    { icon: '📈', label: 'Marketing', count: 31 },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{ padding: '100px 24px 80px', textAlign: 'center', position: 'relative' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="badge badge-primary" style={{ marginBottom: 24, display: 'inline-flex' }}>
            ⚡ Next-Gen Learning Platform
          </div>
          <h1 className="section-title" style={{ fontSize: 'clamp(40px, 6vw, 76px)', marginBottom: 24 }}>
            Unlock Your{' '}
            <span className="gradient-text">Full Potential</span>
            <br />with Expert-Led Courses
          </h1>
          <p style={{ color: '#9090b8', fontSize: 18, lineHeight: 1.7, maxWidth: 600, margin: '0 auto 40px' }}>
            Join thousands of learners mastering in-demand skills. From web development to data science — start your journey today.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/courses" className="btn btn-primary btn-lg">
              Explore Courses →
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Start Free Today
            </Link>
          </div>
        </div>

        {/* Floating Cards */}
        <div style={{ position: 'absolute', top: 80, left: '5%', opacity: 0.7 }} className="animate-float">
          <div style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 12, padding: '10px 16px', fontSize: 13, color: '#6c63ff', backdropFilter: 'blur(8px)' }}>
            🎓 New Course Added!
          </div>
        </div>
        <div style={{ position: 'absolute', top: 160, right: '5%', opacity: 0.7 }} className="animate-float" style2={{ animationDelay: '1s' }}>
          <div style={{ background: 'rgba(255,101,132,0.15)', border: '1px solid rgba(255,101,132,0.3)', borderRadius: 12, padding: '10px 16px', fontSize: 13, color: '#ff6584', backdropFilter: 'blur(8px)' }}>
            ✅ 1,200 Certificates Issued
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {stats.map((s, i) => (
              <div key={i} className="stat-card" style={{ textAlign: 'center' }}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title" style={{ fontSize: 'clamp(24px, 3vw, 40px)' }}>
              Browse <span className="gradient-text">Categories</span>
            </h2>
            <p className="section-subtitle">Choose from our diverse range of learning paths</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
            {categories.map((cat, i) => (
              <Link key={i} to={`/courses?category=${encodeURIComponent(cat.label)}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: 24, textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{cat.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0ff', marginBottom: 4 }}>{cat.label}</div>
                  <div style={{ fontSize: 12, color: '#9090b8' }}>{cat.count} courses</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <div>
              <h2 className="section-title" style={{ fontSize: 'clamp(24px, 3vw, 40px)', marginBottom: 8 }}>
                Featured <span className="gradient-text">Courses</span>
              </h2>
              <p className="section-subtitle">Hand-picked courses by our expert team</p>
            </div>
            <Link to="/courses" className="btn btn-secondary">View All →</Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '60px 24px 80px', background: 'rgba(108,99,255,0.03)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title" style={{ fontSize: 'clamp(24px, 3vw, 40px)' }}>
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { step: '01', icon: '📝', title: 'Create Account', desc: 'Register for free and set up your learner profile' },
              { step: '02', icon: '🎯', title: 'Choose Course', desc: 'Browse and select courses that match your goals' },
              { step: '03', icon: '💳', title: 'Enroll & Pay', desc: 'Complete manual payment and get instant access' },
              { step: '04', icon: '🏆', title: 'Get Certified', desc: 'Complete modules, pass assignments, earn certificate' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#6c63ff', marginBottom: 12 }}>STEP {item.step}</div>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ color: '#9090b8', fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(255,101,132,0.1))', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 32, padding: '64px 48px' }}>
            <h2 className="section-title" style={{ fontSize: 'clamp(28px, 4vw, 48px)', marginBottom: 16 }}>
              Ready to Start<br /><span className="gradient-text">Learning?</span>
            </h2>
            <p style={{ color: '#9090b8', fontSize: 16, marginBottom: 32 }}>
              Join 50,000+ students already learning on EduVerse
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(108,99,255,0.15)', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, background: 'linear-gradient(135deg, #6c63ff, #ff6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ⚡ EduVerse
            </div>
            <div style={{ color: '#5a5a7a', fontSize: 13 }}>© 2024 EduVerse. All rights reserved.</div>
            <div style={{ display: 'flex', gap: 24 }}>
              {['Privacy', 'Terms', 'Contact'].map(link => (
                <a key={link} href="#" style={{ color: '#9090b8', fontSize: 13, textDecoration: 'none' }}>{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
          <img
            src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'}
            alt={course.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'; }}
          />
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <span className="badge badge-primary" style={{ fontSize: 11 }}>{course.category}</span>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 8, lineHeight: 1.3, color: '#f0f0ff' }}>
            {course.title}
          </h3>
          <p style={{ fontSize: 13, color: '#9090b8', marginBottom: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {course.description}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#9090b8' }}>by {course.instructor}</span>
            <div className="stars">{'★'.repeat(Math.floor(course.rating || 4))} <span style={{ color: '#9090b8', fontSize: 12 }}>{course.rating}</span></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, background: 'linear-gradient(135deg, #6c63ff, #ff6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ₹{course.price?.toLocaleString()}
            </span>
            <span style={{ fontSize: 12, color: '#9090b8' }}>{course.moduleCount || 0} modules</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
