import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const emptyForm = { title: '', description: '', instructor: '', price: '', category: 'Web Development', level: 'Beginner', thumbnail: '', duration: '', modules: [], assignment: { title: '', description: '' } };
const emptyModule = { title: '', description: '', videoUrl: '', duration: '' };
const categories = ['Web Development', 'Data Science', 'Design', 'Marketing', 'Mobile Development', 'Cybersecurity', 'Business', 'Other'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleForm, setModuleForm] = useState(emptyModule);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const load = () => api.get('/courses').then(r => setCourses(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditCourse(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (course) => {
    setEditCourse(course);
    setForm({ ...course, assignment: course.assignment || { title: '', description: '' } });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.price) return toast.error('Title and price are required');
    setSaving(true);
    try {
      if (editCourse) {
        await api.put(`/courses/${editCourse.id}`, form);
        toast.success('Course updated!');
      } else {
        await api.post('/courses', form);
        toast.success('Course created!');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course and all its enrollments?')) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const handleAddModule = async () => {
    if (!moduleForm.title || !moduleForm.videoUrl) return toast.error('Module title and video URL required');
    try {
      await api.post(`/courses/${selectedCourse.id}/modules`, moduleForm);
      toast.success('Module added!');
      setModuleForm(emptyModule);
      setShowModuleForm(false);
      load();
    } catch { toast.error('Failed to add module'); }
  };

  const handleDeleteModule = async (courseId, moduleId) => {
    try {
      await api.delete(`/courses/${courseId}/modules/${moduleId}`);
      toast.success('Module removed');
      load();
    } catch { toast.error('Failed to delete module'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
            Manage <span className="gradient-text">Courses</span>
          </h1>
          <p style={{ color: '#9090b8' }}>{courses.length} courses total</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">+ Add New Course</button>
      </div>

      {/* Courses Table */}
      <div style={{ background: 'linear-gradient(145deg, #0d0d25, #12122d)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 20, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Category</th>
                <th>Price</th>
                <th>Modules</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={course.thumbnail} alt={course.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80'; }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, maxWidth: 220 }}>{course.title}</div>
                        <div style={{ fontSize: 12, color: '#9090b8' }}>by {course.instructor}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-primary" style={{ fontSize: 11 }}>{course.category}</span></td>
                  <td style={{ fontWeight: 700, color: '#6c63ff' }}>₹{course.price?.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{course.moduleCount || 0}</span>
                      <button onClick={() => { setSelectedCourse(course); setShowModuleForm(true); }}
                        style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)', color: '#6c63ff', borderRadius: 6, padding: '2px 8px', fontSize: 11, cursor: 'pointer' }}>
                        + Add
                      </button>
                    </div>
                  </td>
                  <td>{course.students?.toLocaleString() || 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(course)} className="btn btn-secondary btn-sm">Edit</button>
                      <button onClick={() => handleDelete(course.id)} className="btn btn-danger btn-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal modal-lg" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowForm(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#9090b8', fontSize: 24, cursor: 'pointer' }}>✕</button>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700, marginBottom: 28 }}>
              {editCourse ? 'Edit Course' : 'Add New Course'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Course Title *</label>
                <input type="text" className="form-input" placeholder="e.g. Complete Web Development Bootcamp" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Description *</label>
                <textarea className="form-input" rows={3} placeholder="Course description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Instructor</label>
                <input type="text" className="form-input" placeholder="Instructor name" value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input type="number" className="form-input" placeholder="e.g. 4999" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Level</label>
                <select className="form-input" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                  {levels.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Thumbnail URL</label>
                <input type="url" className="form-input" placeholder="https://..." value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <input type="text" className="form-input" placeholder="e.g. 40 hours" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
              </div>
            </div>
            <div className="divider" />
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, marginBottom: 16 }}>Final Assignment</h3>
            <div className="form-group">
              <label className="form-label">Assignment Title</label>
              <input type="text" className="form-input" placeholder="e.g. Build a Full-Stack App" value={form.assignment?.title || ''} onChange={e => setForm({ ...form, assignment: { ...form.assignment, title: e.target.value } })} />
            </div>
            <div className="form-group">
              <label className="form-label">Assignment Description</label>
              <textarea className="form-input" rows={3} value={form.assignment?.description || ''} onChange={e => setForm({ ...form, assignment: { ...form.assignment, description: e.target.value } })} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={() => setShowForm(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleSave} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={saving}>
                {saving ? 'Saving...' : editCourse ? 'Update Course' : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Module Modal */}
      {showModuleForm && selectedCourse && (
        <div className="modal-overlay">
          <div className="modal">
            <button onClick={() => setShowModuleForm(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#9090b8', fontSize: 24, cursor: 'pointer' }}>✕</button>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Add Module</h2>
            <p style={{ color: '#9090b8', fontSize: 14, marginBottom: 24 }}>to: <strong style={{ color: '#f0f0ff' }}>{selectedCourse.title}</strong></p>

            {/* Existing modules */}
            {(selectedCourse.modules || []).length > 0 && (
              <div style={{ marginBottom: 24, maxHeight: 200, overflowY: 'auto' }}>
                <p style={{ fontSize: 12, color: '#9090b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>Existing Modules</p>
                {(selectedCourse.modules || []).map((m, i) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(108,99,255,0.05)', borderRadius: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13 }}>{i + 1}. {m.title}</span>
                    <button onClick={() => handleDeleteModule(selectedCourse.id, m.id)}
                      style={{ background: 'none', border: 'none', color: '#ff6584', cursor: 'pointer', fontSize: 16 }}>✕</button>
                  </div>
                ))}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Module Title *</label>
              <input type="text" className="form-input" placeholder="e.g. HTML Fundamentals" value={moduleForm.title} onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input type="text" className="form-input" placeholder="Brief module description" value={moduleForm.description} onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">YouTube Embed URL *</label>
              <input type="url" className="form-input" placeholder="https://www.youtube.com/embed/VIDEO_ID" value={moduleForm.videoUrl} onChange={e => setModuleForm({ ...moduleForm, videoUrl: e.target.value })} />
              <p style={{ fontSize: 11, color: '#9090b8', marginTop: 4 }}>Use embed URL format: youtube.com/embed/VIDEO_ID</p>
            </div>
            <div className="form-group">
              <label className="form-label">Duration</label>
              <input type="text" className="form-input" placeholder="e.g. 2h 30m" value={moduleForm.duration} onChange={e => setModuleForm({ ...moduleForm, duration: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowModuleForm(false)} className="btn btn-secondary" style={{ flex: 1 }}>Done</button>
              <button onClick={handleAddModule} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>Add Module</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
