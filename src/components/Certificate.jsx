import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Certificate({ enrollment, onClose }) {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);

  // Always use the logged-in user's name first, then fallbacks
  const studentName = user?.name || enrollment?.user?.name || enrollment?.studentName || 'Student';
  const courseTitle = enrollment?.course?.title || enrollment?.courseName || 'Course';
  const instructor = enrollment?.course?.instructor || 'Instructor';
  const completedDate = enrollment?.completedAt
    ? new Date(enrollment.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const certId = `EDV-${(enrollment?.id || 'XXXX').slice(0, 8).toUpperCase()}`;

  const downloadCertificate = () => {
    setDownloading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');

    function roundRect(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    }

    // ── Background ──
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, 1200, 850);

    // Subtle radial glow top-left
    const glow1 = ctx.createRadialGradient(200, 150, 0, 200, 150, 500);
    glow1.addColorStop(0, 'rgba(108,99,255,0.07)');
    glow1.addColorStop(1, 'transparent');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, 1200, 850);

    // Subtle radial glow bottom-right
    const glow2 = ctx.createRadialGradient(1000, 700, 0, 1000, 700, 400);
    glow2.addColorStop(0, 'rgba(255,101,132,0.06)');
    glow2.addColorStop(1, 'transparent');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, 1200, 850);

    // ── Outer border ──
    ctx.save();
    ctx.strokeStyle = '#6c63ff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.55;
    roundRect(ctx, 30, 30, 1140, 790, 24);
    ctx.stroke();
    ctx.globalAlpha = 0.12;
    ctx.lineWidth = 10;
    roundRect(ctx, 26, 26, 1148, 798, 27);
    ctx.stroke();
    ctx.restore();

    // ── Corner circles ──
    [[68, 68], [1132, 68], [68, 782], [1132, 782]].forEach(([cx, cy]) => {
      ctx.save();
      ctx.strokeStyle = '#6c63ff';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 0.15;
      ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    });

    // ── Top gradient line ──
    const topLine = ctx.createLinearGradient(60, 0, 1140, 0);
    topLine.addColorStop(0, '#6c63ff');
    topLine.addColorStop(0.5, '#ff6584');
    topLine.addColorStop(1, '#43e8d8');
    ctx.fillStyle = topLine;
    ctx.fillRect(60, 78, 1080, 4);

    // ── EduVerse logo ──
    ctx.textAlign = 'center';
    ctx.font = 'bold 26px Arial';
    ctx.fillStyle = '#c0c0e0';
    ctx.fillText('⚡ EduVerse', 600, 144);

    // ── "CERTIFICATE OF COMPLETION" ──
    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = '#6c63ff';
    ctx.fillText('C E R T I F I C A T E   O F   C O M P L E T I O N', 600, 184);

    // Thin separator
    ctx.strokeStyle = 'rgba(108,99,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(200, 204); ctx.lineTo(1000, 204); ctx.stroke();

    // ── "This is to certify that" ──
    ctx.font = 'italic 21px Georgia';
    ctx.fillStyle = '#9090b8';
    ctx.fillText('This is to certify that', 600, 268);

    // ── Student Name ──
    // Measure and scale font to fit within 900px wide
    let nameFontSize = 68;
    ctx.font = `bold ${nameFontSize}px Georgia`;
    while (ctx.measureText(studentName).width > 900 && nameFontSize > 36) {
      nameFontSize -= 2;
      ctx.font = `bold ${nameFontSize}px Georgia`;
    }
    const nameGrad = ctx.createLinearGradient(300, 0, 900, 0);
    nameGrad.addColorStop(0, '#6c63ff');
    nameGrad.addColorStop(1, '#ff6584');
    ctx.fillStyle = nameGrad;
    ctx.fillText(studentName, 600, 360);

    // Name underline
    const nameW = ctx.measureText(studentName).width;
    const lineGrad = ctx.createLinearGradient(600 - nameW / 2, 0, 600 + nameW / 2, 0);
    lineGrad.addColorStop(0, '#6c63ff');
    lineGrad.addColorStop(1, '#ff6584');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(600 - nameW / 2, 374);
    ctx.lineTo(600 + nameW / 2, 374);
    ctx.stroke();

    // ── "has successfully completed the course" ──
    ctx.font = 'italic 21px Georgia';
    ctx.fillStyle = '#9090b8';
    ctx.fillText('has successfully completed the course', 600, 426);

    // ── Course Title box ──
    ctx.save();
    ctx.fillStyle = 'rgba(108,99,255,0.07)';
    roundRect(ctx, 150, 450, 900, 88, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(108,99,255,0.28)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 150, 450, 900, 88, 14);
    ctx.stroke();
    ctx.restore();

    // Course title text (auto-wrap)
    ctx.font = 'bold 30px Georgia';
    ctx.fillStyle = '#f0f0ff';
    const maxW = 840;
    const words = courseTitle.split(' ');
    let line = '', lines = [];
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    }
    lines.push(line);
    const lh = 36;
    const titleStartY = 494 - ((lines.length - 1) * lh) / 2;
    lines.forEach((l, i) => ctx.fillText(l, 600, titleStartY + i * lh));

    // Instructor
    ctx.font = '17px Arial';
    ctx.fillStyle = '#9090b8';
    ctx.fillText(`Instructor: ${instructor}`, 600, 572);

    // ── Divider ──
    ctx.strokeStyle = 'rgba(255,101,132,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(200, 600); ctx.lineTo(1000, 600); ctx.stroke();

    // ── Date (left) ──
    ctx.textAlign = 'left';
    ctx.font = 'bold 19px Arial';
    ctx.fillStyle = '#f0f0ff';
    ctx.fillText(completedDate, 160, 658);
    ctx.font = '13px Arial';
    ctx.fillStyle = '#9090b8';
    ctx.fillText('Date of Completion', 160, 678);
    ctx.strokeStyle = 'rgba(108,99,255,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(160, 692); ctx.lineTo(390, 692); ctx.stroke();

    // ── Center Seal ──
    ctx.textAlign = 'center';
    // Gold outer ring
    ctx.save();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.arc(600, 655, 50, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(600, 655, 45, 0, Math.PI * 2); ctx.stroke();
    // Gold fill
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(600, 655, 43, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Trophy emoji
    ctx.font = '38px Arial';
    ctx.fillText('🏆', 600, 671);
    // CERTIFIED text
    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('C E R T I F I E D', 600, 722);

    // ── Cert ID (right) ──
    ctx.textAlign = 'right';
    ctx.font = 'bold 19px Arial';
    ctx.fillStyle = '#f0f0ff';
    ctx.fillText(certId, 1040, 658);
    ctx.font = '13px Arial';
    ctx.fillStyle = '#9090b8';
    ctx.fillText('Certificate ID', 1040, 678);
    ctx.strokeStyle = 'rgba(108,99,255,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(810, 692); ctx.lineTo(1040, 692); ctx.stroke();

    // ── Bottom gradient line ──
    const botLine = ctx.createLinearGradient(60, 0, 1140, 0);
    botLine.addColorStop(0, '#6c63ff');
    botLine.addColorStop(0.5, '#ff6584');
    botLine.addColorStop(1, '#43e8d8');
    ctx.fillStyle = botLine;
    ctx.fillRect(60, 764, 1080, 4);

    // ── Footer ──
    ctx.textAlign = 'center';
    ctx.font = '12px Arial';
    ctx.fillStyle = '#5a5a7a';
    ctx.fillText('EduVerse — Learn Without Limits  |  eduverse.com', 600, 808);

    // ── Download ──
    const link = document.createElement('a');
    link.download = `EduVerse_Certificate_${studentName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    setDownloading(false);
    toast.success('Certificate downloaded!');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div style={{
        background: 'linear-gradient(145deg,#0d0d25,#12122d)',
        border: '1px solid rgba(108,99,255,0.3)',
        borderRadius: 24, padding: 32,
        width: '100%', maxWidth: 760,
        position: 'relative', animation: 'fadeIn 0.3s ease',
        maxHeight: '92vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', color: '#9090b8', fontSize: 24, cursor: 'pointer' }}>✕</button>

        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 24 }}>🏆 Your Certificate</h2>

        {/* ── Preview ── */}
        <div style={{
          background: '#050510',
          border: '2px solid rgba(108,99,255,0.45)',
          borderRadius: 16, padding: '36px 44px',
          position: 'relative', overflow: 'hidden', marginBottom: 24,
          boxShadow: '0 0 40px rgba(108,99,255,0.12)',
        }}>
          {/* Top line */}
          <div style={{ height: 4, background: 'linear-gradient(90deg,#6c63ff,#ff6584,#43e8d8)', borderRadius: 2, marginBottom: 28 }} />

          <div style={{ textAlign: 'center' }}>
            {/* Logo */}
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, background: 'linear-gradient(135deg,#6c63ff,#ff6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>
              ⚡ EduVerse
            </div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#6c63ff', fontWeight: 700, marginBottom: 22, textTransform: 'uppercase' }}>
              Certificate of Completion
            </div>

            <p style={{ color: '#9090b8', fontSize: 14, marginBottom: 10, fontStyle: 'italic' }}>This is to certify that</p>

            {/* Student name */}
            <h1 style={{
              fontFamily: 'Georgia,serif',
              fontSize: 'clamp(26px,4vw,48px)',
              fontWeight: 700,
              background: 'linear-gradient(135deg,#6c63ff,#ff6584)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 6,
              wordBreak: 'break-word',
            }}>
              {studentName}
            </h1>
            <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#6c63ff,#ff6584,transparent)', borderRadius: 1, marginBottom: 16 }} />

            <p style={{ color: '#9090b8', fontSize: 14, marginBottom: 14, fontStyle: 'italic' }}>has successfully completed the course</p>

            <div style={{ background: 'rgba(108,99,255,0.07)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 12, padding: '14px 24px', marginBottom: 18 }}>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: '#f0f0ff', lineHeight: 1.4 }}>{courseTitle}</div>
              <div style={{ fontSize: 12, color: '#9090b8', marginTop: 4 }}>Instructor: {instructor}</div>
            </div>

            {/* Bottom row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#f0f0ff' }}>{completedDate}</div>
                <div style={{ fontSize: 11, color: '#9090b8' }}>Date of Completion</div>
                <div style={{ height: 1, background: 'rgba(108,99,255,0.4)', marginTop: 6, width: 130 }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36 }}>🏆</div>
                <div style={{ fontSize: 10, color: '#ffd700', fontWeight: 700, letterSpacing: '0.1em' }}>CERTIFIED</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#f0f0ff', fontFamily: 'monospace' }}>{certId}</div>
                <div style={{ fontSize: 11, color: '#9090b8' }}>Certificate ID</div>
                <div style={{ height: 1, background: 'rgba(108,99,255,0.4)', marginTop: 6, marginLeft: 'auto', width: 130 }} />
              </div>
            </div>
          </div>

          {/* Bottom line */}
          <div style={{ height: 4, background: 'linear-gradient(90deg,#6c63ff,#ff6584,#43e8d8)', borderRadius: 2, marginTop: 28 }} />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Close</button>
          <button onClick={downloadCertificate} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', background: 'linear-gradient(135deg,#43e8d8,#6c63ff)' }} disabled={downloading}>
            {downloading ? 'Generating…' : '⬇ Download Certificate (PNG)'}
          </button>
        </div>
      </div>
    </div>
  );
}
