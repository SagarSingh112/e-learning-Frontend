import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Certificate from '../components/Certificate';

function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/embed\/([^?&/]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function CourseLearn() {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showAssignment, setShowAssignment] = useState(false);
  const [assignmentText, setAssignmentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const [watchProgress, setWatchProgress] = useState({});  // moduleId -> 0-100
  const [autoCompleting, setAutoCompleting] = useState(false);

  const playerDivRef = useRef(null);
  const playerRef = useRef(null);
  const pollRef = useRef(null);
  const autoCompletedRef = useRef({});
  const activeModuleIdRef = useRef(null);

  // Load YT IFrame API script once
  useEffect(() => {
    if (!document.getElementById('yt-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'yt-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  }, []);

  useEffect(() => {
    api.get(`/enrollments/${enrollmentId}`)
      .then(r => {
        setEnrollment(r.data);
        if (r.data.course?.modules?.length > 0) {
          setActiveModule(r.data.course.modules[0]);
          setActiveIdx(0);
        }
      })
      .catch(() => navigate('/my-courses'))
      .finally(() => setLoading(false));
  }, [enrollmentId]);

  // Rebuild YouTube player whenever active module changes
  useEffect(() => {
    if (!activeModule) return;
    const videoId = getYouTubeId(activeModule.videoUrl);
    activeModuleIdRef.current = activeModule.id;

    clearInterval(pollRef.current);
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch (_) {}
      playerRef.current = null;
    }

    if (!videoId) return;

    const moduleId = activeModule.id;

    function buildPlayer() {
      if (!playerDivRef.current) return;
      // Ensure the div exists (YT replaces it)
      if (!document.getElementById('yt-player-container')) return;

      playerRef.current = new window.YT.Player('yt-player-container', {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { rel: 0, modestbranding: 1, controls: 1, iv_load_policy: 3 },
        events: {
          onStateChange(e) {
            if (e.data === window.YT.PlayerState.PLAYING) {
              startPoll(moduleId);
            } else if (e.data === window.YT.PlayerState.ENDED) {
              clearInterval(pollRef.current);
              setWatchProgress(prev => ({ ...prev, [moduleId]: 100 }));
              doAutoComplete(moduleId);
            } else {
              clearInterval(pollRef.current);
            }
          },
        },
      });
    }

    function startPoll(modId) {
      clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        if (activeModuleIdRef.current !== modId) { clearInterval(pollRef.current); return; }
        const p = playerRef.current;
        if (!p || typeof p.getCurrentTime !== 'function') return;
        const cur = p.getCurrentTime() || 0;
        const dur = p.getDuration() || 0;
        if (dur <= 0) return;
        const pct = Math.min(100, Math.round((cur / dur) * 100));
        setWatchProgress(prev => {
          if ((prev[modId] || 0) >= pct) return prev;
          return { ...prev, [modId]: pct };
        });
        if (pct >= 95) {
          clearInterval(pollRef.current);
          setWatchProgress(prev => ({ ...prev, [modId]: 100 }));
          doAutoComplete(modId);
        }
      }, 800);
    }

    if (window.YT && window.YT.Player) {
      buildPlayer();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        buildPlayer();
      };
    }

    return () => { clearInterval(pollRef.current); };
  }, [activeModule?.id]);

  const doAutoComplete = useCallback(async (moduleId) => {
    if (autoCompletedRef.current[moduleId]) return;
    autoCompletedRef.current[moduleId] = true;
    setAutoCompleting(true);
    try {
      const res = await api.post(`/enrollments/${enrollmentId}/modules/${moduleId}/complete`);
      setEnrollment(res.data);
      const modTitle = res.data.course?.modules?.find(m => m.id === moduleId)?.title || 'Module';
      toast.success(`✅ "${modTitle}" completed!`);
      if (res.data.allModulesCompleted) {
        setTimeout(() => toast.success('🎉 All modules done! Submit your assignment to earn the certificate.', { duration: 6000 }), 700);
      }
    } catch (err) {
      if (err.response?.status !== 400) autoCompletedRef.current[moduleId] = false;
    } finally {
      setAutoCompleting(false);
    }
  }, [enrollmentId]);

  const switchModule = (mod, idx) => {
    setActiveModule(mod);
    setActiveIdx(idx);
  };

  const submitAssignment = async () => {
    if (!assignmentText.trim()) return toast.error('Please write your assignment');
    setSubmitting(true);
    try {
      const res = await api.post(`/enrollments/${enrollmentId}/assignment`, { assignmentText });
      setEnrollment(res.data);
      setShowAssignment(false);
      toast.success('🏆 Course completed! Certificate earned!', { duration: 6000 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!enrollment) return null;

  const course = enrollment.course;
  const modules = course?.modules || [];
  const completedCount = enrollment.completedModules?.length || 0;
  const courseProgress = modules.length ? Math.round(completedCount / modules.length * 100) : 0;
  const allDone = enrollment.allModulesCompleted;
  const currentWatch = activeModule ? (watchProgress[activeModule.id] || 0) : 0;
  const isCompleted = (id) => enrollment?.completedModules?.includes(id);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#050510', overflow: 'hidden' }}>

      {/* ── SIDEBAR ── */}
      <div style={{ width: 320, borderRight: '1px solid rgba(108,99,255,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>

        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(108,99,255,0.15)', background: 'rgba(108,99,255,0.05)' }}>
          <Link to="/my-courses" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9090b8', textDecoration: 'none', fontSize: 13, marginBottom: 14 }}>
            ← Back to My Courses
          </Link>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>{course?.title}</h2>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9090b8', marginBottom: 6 }}>
              <span>{completedCount}/{modules.length} modules</span>
              <span style={{ color: '#6c63ff', fontWeight: 700 }}>{courseProgress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${courseProgress}%` }} />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {modules.map((mod, i) => {
            const done = isCompleted(mod.id);
            const isActive = activeModule?.id === mod.id;
            const wPct = watchProgress[mod.id] || 0;

            return (
              <button key={mod.id} onClick={() => switchModule(mod, i)}
                style={{
                  width: '100%', textAlign: 'left', padding: '14px 20px', border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s', display: 'flex', gap: 12, alignItems: 'flex-start',
                  background: isActive ? 'rgba(108,99,255,0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid #6c63ff' : '3px solid transparent',
                }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  background: done ? 'rgba(67,232,216,0.2)' : isActive ? 'rgba(108,99,255,0.25)' : 'rgba(255,255,255,0.06)',
                  color: done ? '#43e8d8' : isActive ? '#6c63ff' : '#9090b8',
                  border: `1.5px solid ${done ? 'rgba(67,232,216,0.5)' : isActive ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                  {done ? '✓' : i + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#f0f0ff' : done ? '#9090b8' : '#c0c0d8', lineHeight: 1.3, marginBottom: 3 }}>
                    {mod.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#5a5a7a', marginBottom: 5 }}>⏱ {mod.duration}</div>

                  {/* Watch % mini-bar in sidebar (hidden once done) */}
                  {!done && wPct > 0 && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: '#9090b8' }}>Watched</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: wPct >= 95 ? '#43e8d8' : '#6c63ff' }}>{wPct}%</span>
                      </div>
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 2, width: `${wPct}%`,
                          background: wPct >= 95 ? 'linear-gradient(90deg,#43e8d8,#6c63ff)' : 'linear-gradient(90deg,#6c63ff,#ff6584)',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  )}
                  {done && <div style={{ fontSize: 10, color: '#43e8d8', fontWeight: 600 }}>✓ Completed</div>}
                </div>
              </button>
            );
          })}

          {allDone && (
            <div style={{ margin: '12px 16px', padding: 16, background: enrollment.completed ? 'rgba(67,232,216,0.08)' : 'rgba(255,215,0,0.08)', border: `1px solid ${enrollment.completed ? 'rgba(67,232,216,0.3)' : 'rgba(255,215,0,0.3)'}`, borderRadius: 12 }}>
              {enrollment.completed ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#43e8d8' }}>Course Completed!</div>
                  <div style={{ fontSize: 11, color: '#9090b8', marginTop: 4, marginBottom: 12 }}>Certificate earned 🎓</div>
                  <button
                    onClick={() => setShowCert(true)}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: 12, padding: '10px', background: 'linear-gradient(135deg,#43e8d8,#6c63ff)' }}
                  >
                    🏆 Download Certificate
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 13, color: '#ffd700', fontWeight: 700, marginBottom: 6 }}>🎯 Final Assignment</div>
                  <div style={{ fontSize: 11, color: '#9090b8', marginBottom: 12, lineHeight: 1.5 }}>{course?.assignment?.title}</div>
                  <button onClick={() => setShowAssignment(true)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 12, padding: '10px' }}>
                    Submit Assignment →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN VIDEO AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeModule ? (
          <>
            {/* Video */}
            <div ref={playerDivRef} style={{ flex: 1, background: '#000', position: 'relative' }}>
              <div id="yt-player-container" style={{ width: '100%', height: '100%' }} />

              {/* Live watch % circular badge */}
              {!isCompleted(activeModule.id) && currentWatch > 0 && (
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  background: 'rgba(5,5,16,0.88)', backdropFilter: 'blur(10px)',
                  border: `1px solid ${currentWatch >= 95 ? 'rgba(67,232,216,0.5)' : 'rgba(108,99,255,0.4)'}`,
                  borderRadius: 12, padding: '10px 16px',
                  display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'none',
                }}>
                  {/* Circular progress */}
                  <svg width="38" height="38" viewBox="0 0 38 38">
                    <circle cx="19" cy="19" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
                    <circle cx="19" cy="19" r="15" fill="none"
                      stroke={currentWatch >= 95 ? '#43e8d8' : '#6c63ff'}
                      strokeWidth="3.5"
                      strokeDasharray={`${2 * Math.PI * 15}`}
                      strokeDashoffset={`${2 * Math.PI * 15 * (1 - currentWatch / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 19 19)"
                      style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                    />
                    <text x="19" y="23" textAnchor="middle" fontSize="8" fontWeight="bold"
                      fill={currentWatch >= 95 ? '#43e8d8' : '#6c63ff'}>
                      {currentWatch}%
                    </text>
                  </svg>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: currentWatch >= 95 ? '#43e8d8' : '#f0f0ff' }}>
                      {currentWatch >= 95 ? 'Almost done!' : 'Video Progress'}
                    </div>
                    <div style={{ fontSize: 11, color: '#9090b8' }}>
                      {currentWatch < 95 ? 'Watch fully to auto-complete' : 'Marking complete…'}
                    </div>
                  </div>
                </div>
              )}

              {/* Completed badge */}
              {isCompleted(activeModule.id) && (
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  background: 'rgba(67,232,216,0.15)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(67,232,216,0.45)',
                  borderRadius: 12, padding: '10px 18px',
                  fontSize: 13, fontWeight: 700, color: '#43e8d8', pointerEvents: 'none',
                }}>
                  ✓ Module Completed
                </div>
              )}

              {/* Auto-complete overlay */}
              {autoCompleting && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(5,5,16,0.65)', backdropFilter: 'blur(4px)', pointerEvents: 'none',
                }}>
                  <div style={{ background: 'rgba(13,13,37,0.96)', border: '1px solid rgba(67,232,216,0.4)', borderRadius: 16, padding: '28px 40px', textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 14px', borderTopColor: '#43e8d8' }} />
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#43e8d8' }}>Marking as Complete…</div>
                    <div style={{ fontSize: 12, color: '#9090b8', marginTop: 6 }}>Great job watching the full video!</div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div style={{ padding: '14px 28px 18px', background: 'linear-gradient(145deg, #0d0d25, #12122d)', borderTop: '1px solid rgba(108,99,255,0.15)' }}>

              {/* Progress bar for current video */}
              {!isCompleted(activeModule.id) && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: '#9090b8' }}>
                      {currentWatch === 0
                        ? '▶ Press play — module auto-completes when you finish watching'
                        : currentWatch >= 95
                        ? '🎉 Done! Auto-completing this module…'
                        : '⏳ Keep watching — module completes automatically at the end'}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: currentWatch >= 95 ? '#43e8d8' : currentWatch > 0 ? '#6c63ff' : '#5a5a7a' }}>
                      {currentWatch}% watched
                    </span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3, width: `${currentWatch}%`,
                      background: currentWatch >= 95 ? 'linear-gradient(90deg,#43e8d8,#6c63ff)' : 'linear-gradient(90deg,#6c63ff,#ff6584)',
                      transition: 'width 0.7s ease',
                    }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 2 }}>
                    {activeIdx + 1}. {activeModule.title}
                  </h3>
                  <p style={{ color: '#9090b8', fontSize: 13 }}>{activeModule.description}</p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexShrink: 0, marginLeft: 20 }}>
                  {activeIdx > 0 && (
                    <button onClick={() => switchModule(modules[activeIdx - 1], activeIdx - 1)} className="btn btn-secondary btn-sm">← Prev</button>
                  )}
                  {isCompleted(activeModule.id) && activeIdx < modules.length - 1 && (
                    <button onClick={() => switchModule(modules[activeIdx + 1], activeIdx + 1)} className="btn btn-primary btn-sm">Next Module →</button>
                  )}
                  {isCompleted(activeModule.id) && activeIdx === modules.length - 1 && allDone && !enrollment.completed && (
                    <button onClick={() => setShowAssignment(true)} className="btn btn-primary btn-sm">🎯 Submit Assignment →</button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="empty-state-icon">📺</div>
            <h3>Select a module to start learning</h3>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignment && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>🎯 Submit Final Assignment</h2>
            <div style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
              <p style={{ fontWeight: 600, marginBottom: 6, color: '#ffd700' }}>{course?.assignment?.title}</p>
              <p style={{ color: '#9090b8', fontSize: 14, lineHeight: 1.6 }}>{course?.assignment?.description}</p>
            </div>
            <div className="form-group">
              <label className="form-label">Your Response / GitHub Link / Submission</label>
              <textarea className="form-input" rows={8}
                placeholder="Write your response, paste your GitHub/project link, or describe your work…"
                value={assignmentText} onChange={e => setAssignmentText(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowAssignment(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={submitAssignment} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={submitting}>
                {submitting ? 'Submitting…' : '🏆 Submit & Complete Course'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Certificate Modal */}
      {showCert && (
        <Certificate
          enrollment={enrollment}
          onClose={() => setShowCert(false)}
        />
      )}
    </div>
  );
}
