import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Eye, EyeOff, AlertCircle, Zap } from 'lucide-react';

const DEMO_CREDS = [
  { role: 'Admin',   email: 'admin@gym.com',   password: 'admin123',   desc: 'Full access' },
  { role: 'Trainer', email: 'trainer@gym.com',  password: 'trainer123', desc: 'Staff view' },
  { role: 'Member',  email: 'member@gym.com',   password: 'member123',  desc: 'Member view' },
];

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authErr, setAuthErr] = useState('');

  const validate = () => {
    const e = {};
    if (!form.email)    e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setAuthErr('');
    await new Promise(r => setTimeout(r, 700));
    const result = login(form.email, form.password);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setAuthErr(result.error);
  };

  const fillDemo = (c) => {
    setForm({ email: c.email, password: c.password });
    setErrors({}); setAuthErr('');
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })); },
  });

  return (
    <div style={S.page}>
      {/* Left — Brand panel */}
      <div style={S.brandPanel}>
        <div style={S.brandContent}>
          <div style={S.logoRow}>
            <div style={S.logoBox}><Zap size={26} color="#fff" fill="#fff" /></div>
            <span style={S.logoText}>FYTNODES</span>
          </div>

          <div style={S.heroText}>
            <p style={S.heroEye}>FITNESS MANAGEMENT SYSTEM</p>
            <h1 style={S.heroHeading}>
              PUSH YOUR<br />
              <span style={{ color: 'var(--red)' }}>LIMITS.</span>
            </h1>
            <p style={S.heroDesc}>
              Manage members, track performance, and grow your fitness business — all in one powerful dashboard.
            </p>
          </div>

          <div style={S.statRow}>
            {[['500+', 'Members'], ['98%', 'Retention'], ['24/7', 'Access']].map(([val, label]) => (
              <div key={label} style={S.statItem}>
                <span style={S.statVal}>{val}</span>
                <span style={S.statLbl}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grid overlay pattern */}
        <div style={S.gridPattern} />
        <div style={S.redGlow} />
      </div>

      {/* Right — Form panel */}
      <div style={S.formPanel}>
        <div style={S.formCard}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={S.formHeading}>Welcome back</h2>
            <p style={S.formSubheading}>Sign in to your account to continue</p>
          </div>

          {authErr && (
            <div style={S.errBanner}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{authErr}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@fytnodes.com"
                autoComplete="email"
                {...field('email')}
              />
              {errors.email && <span className="form-error"><AlertCircle size={11} />{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                  {...field('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={S.eyeBtn}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <span className="form-error"><AlertCircle size={11} />{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', marginTop: 4, fontSize: 14 }}
              disabled={loading}
            >
              {loading
                ? <span style={S.spinner} />
                : <><Zap size={15} fill="white" /> Sign In</>}
            </button>
          </form>

          {/* Demo quick access */}
          <div style={S.demoSection}>
            <div style={S.demoHeader}>
              <div style={S.demoDivLine} />
              <span style={S.demoLabel}>Quick Demo Access</span>
              <div style={S.demoDivLine} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {DEMO_CREDS.map(c => (
                <button key={c.role} onClick={() => fillDemo(c)} style={S.demoBtn}>
                  <span style={S.demoRole}>{c.role}</span>
                  <span style={S.demoDesc}>{c.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg)',
  },

  /* ─── Brand panel */
  brandPanel: {
    flex: '0 0 44%',
    background: '#0c0c0c',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRight: '1px solid var(--border)',
  },
  brandContent: {
    position: 'relative',
    zIndex: 2,
    padding: '60px 52px',
    display: 'flex',
    flexDirection: 'column',
    gap: 48,
    maxWidth: 460,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    width: 44, height: 44,
    background: 'var(--red)',
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 20px var(--red-glow)',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 900,
    color: '#fff',
    letterSpacing: '0.15em',
  },
  heroEye: {
    fontSize: 10,
    fontWeight: 800,
    color: 'var(--red)',
    letterSpacing: '0.2em',
    marginBottom: 12,
  },
  heroHeading: {
    fontSize: 52,
    fontWeight: 900,
    color: '#fff',
    lineHeight: 1.0,
    letterSpacing: '-1px',
    marginBottom: 16,
  },
  heroDesc: {
    fontSize: 14,
    color: 'var(--text-muted)',
    lineHeight: 1.7,
    maxWidth: 320,
  },
  heroText: { display: 'flex', flexDirection: 'column' },
  statRow: {
    display: 'flex',
    gap: 32,
    paddingTop: 28,
    borderTop: '1px solid var(--border-soft)',
  },
  statItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  statVal: {
    fontSize: 24,
    fontWeight: 900,
    color: '#fff',
    letterSpacing: '-0.5px',
  },
  statLbl: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  gridPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    zIndex: 1,
  },
  redGlow: {
    position: 'absolute',
    bottom: -100, left: -80,
    width: 400, height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
    zIndex: 1,
  },

  /* ─── Form panel */
  formPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
  },
  formHeading: {
    fontSize: 26,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.4px',
    marginBottom: 6,
  },
  formSubheading: {
    fontSize: 14,
    color: 'var(--text-muted)',
  },
  errBanner: {
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '11px 14px',
    background: 'var(--danger-faint)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--danger)',
    fontSize: 13,
    marginBottom: 18,
    fontWeight: 500,
  },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
    transition: 'color 0.2s',
  },
  spinner: {
    display: 'inline-block', width: 18, height: 18,
    border: '2px solid rgba(255,255,255,0.25)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.65s linear infinite',
  },

  /* ─── Demo section */
  demoSection: { marginTop: 32 },
  demoHeader: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
  },
  demoDivLine: { flex: 1, height: 1, background: 'var(--border)' },
  demoLabel: {
    fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap',
  },
  demoBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '11px 8px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    gap: 3,
  },
  demoRole: {
    fontSize: 12, fontWeight: 800, color: 'var(--red)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  demoDesc: { fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 },
};
