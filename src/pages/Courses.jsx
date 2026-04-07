import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const categories = ['All', 'Web Development', 'Data Science', 'Design', 'Marketing', 'Mobile Development', 'Cybersecurity'];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('All');
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState(searchParams.get('category') || 'All');

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor?.toLowerCase().includes(search.toLowerCase());
    const matchLevel = level === 'All' || c.level === level;
    const matchCategory = category === 'All' || c.category === category;
    return matchSearch && matchLevel && matchCategory;
  });

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 className="section-title" style={{ marginBottom: 12 }}>
            All <span className="gradient-text">Courses</span>
          </h1>
          <p className="section-subtitle">Explore {courses.length}+ expert-led courses</p>
        </div>

        {/* Filters */}
        <div style={{ background: 'linear-gradient(145deg, #0d0d25, #12122d)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 16, padding: 24, marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Search courses, instructors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200 }}
            />
            <select className="form-input" value={category} onChange={e => setCategory(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="form-input" value={level} onChange={e => setLevel(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <p style={{ color: '#9090b8', fontSize: 14 }}>
            Showing <span style={{ color: '#6c63ff', fontWeight: 600 }}>{filtered.length}</span> courses
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No courses found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {filtered.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course }) {
  const levelColors = { Beginner: 'badge-success', Intermediate: 'badge-warning', Advanced: 'badge-danger' };

  return (
    <Link to={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ height: '100%' }}>
        <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
          <img
            src={course.thumbnail}
            alt={course.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'; }}
          />
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <span className={`badge ${levelColors[course.level] || 'badge-primary'}`}>{course.level}</span>
          </div>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', height: 'calc(100% - 200px)' }}>
          <div style={{ marginBottom: 8 }}>
            <span className="badge badge-primary" style={{ fontSize: 11 }}>{course.category}</span>
          </div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 8, lineHeight: 1.3, color: '#f0f0ff' }}>
            {course.title}
          </h3>
          <p style={{ fontSize: 13, color: '#9090b8', marginBottom: 16, lineHeight: 1.6, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {course.description}
          </p>
          <div style={{ fontSize: 13, color: '#9090b8', marginBottom: 12 }}>👤 {course.instructor}</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#9090b8', marginBottom: 16 }}>
            <span>⏱ {course.duration}</span>
            <span>📚 {course.moduleCount} modules</span>
            <span>👥 {course.students?.toLocaleString()} students</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid rgba(108,99,255,0.15)' }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, background: 'linear-gradient(135deg, #6c63ff, #ff6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ₹{course.price?.toLocaleString()}
            </span>
            <div className="stars">★ {course.rating}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
