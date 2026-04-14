import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, UserPlus, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getErrorMessage } from '../../utils/formatters';

export default function Signup() {
  const { state, signup } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authErr, setAuthErr] = useState('');

  if (!state.authLoading && state.currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.email) nextErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Invalid email address';
    if (!form.password) nextErrors.password = 'Password is required';
    else if (form.password.length < 6) nextErrors.password = 'Minimum 6 characters';
    if (!form.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password';
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match';
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setAuthErr('');

    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      });
      navigate('/dashboard');
    } catch (error) {
      setAuthErr(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (event) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
      setErrors((prev) => ({ ...prev, [key]: '' }));
    },
  });

  return (
    <div style={S.page}>
      <div style={S.brandPanel}>
        <div style={S.brandContent}>
          <div style={S.logoRow}>
            <div style={S.logoBox}>
              <Zap size={26} color="#fff" fill="#fff" />
            </div>
            <span style={S.logoText}>FYTNODES</span>
          </div>
          <div style={S.heroText}>
            <p style={S.heroEye}>GYM MANAGEMENT PORTAL</p>
            <h1 style={S.heroHeading}>
              MANAGE WITH
              <br />
              <span style={{ color: 'var(--red)' }}>POWER.</span>
            </h1>
            <p style={S.heroDesc}>
              Register your gym management account to access the full dashboard — members, trainers, attendance, and more.
            </p>
          </div>
          <div style={S.featureList}>
            {[
              'Full admin dashboard access',
              'Manage members, trainers & subscriptions',
              'Track attendance and performance',
            ].map((item) => (
              <div key={item} style={S.featureItem}>
                <div style={S.featureDot} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={S.gridPattern} />
        <div style={S.redGlow} />
      </div>

      <div style={S.formPanel}>
        <div style={S.formCard}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={S.formHeading}>Create admin account</h2>
            <p style={S.formSubheading}>For gym owners and management staff only</p>
          </div>

          {authErr && (
            <div style={S.errBanner}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{authErr}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="John Doe" autoComplete="name" {...field('name')} />
              {errors.name && (
                <span className="form-error">
                  <AlertCircle size={11} />
                  {errors.name}
                </span>
              )}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@fytnodes.com"
                  autoComplete="email"
                  {...field('email')}
                />
                {errors.email && (
                  <span className="form-error">
                    <AlertCircle size={11} />
                    {errors.email}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="555-0100" autoComplete="tel" {...field('phone')} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    style={{ paddingRight: 44 }}
                    {...field('password')}
                  />
                  <button type="button" onClick={() => setShowPass((v) => !v)} style={S.eyeBtn} tabIndex={-1}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="form-error">
                    <AlertCircle size={11} />
                    {errors.password}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    style={{ paddingRight: 44 }}
                    {...field('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass((v) => !v)}
                    style={S.eyeBtn}
                    tabIndex={-1}
                  >
                    {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="form-error">
                    <AlertCircle size={11} />
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', marginTop: 4, fontSize: 14 }}
              disabled={loading}
            >
              {loading ? (
                <span style={S.spinner} />
              ) : (
                <>
                  <UserPlus size={15} /> Create Admin Account
                </>
              )}
            </button>
          </form>

          <p style={S.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={S.switchLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { display: 'flex', minHeight: '100vh', background: 'var(--bg)' },
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
    gap: 40,
    maxWidth: 460,
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 12 },
  logoBox: {
    width: 44,
    height: 44,
    background: 'var(--red)',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px var(--red-glow)',
  },
  logoText: { fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '0.15em' },
  heroEye: { fontSize: 10, fontWeight: 800, color: 'var(--red)', letterSpacing: '0.2em', marginBottom: 12 },
  heroHeading: { fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1.0, letterSpacing: '-1px', marginBottom: 16 },
  heroDesc: { fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 340 },
  heroText: { display: 'flex', flexDirection: 'column' },
  featureList: { display: 'flex', flexDirection: 'column', gap: 12 },
  featureItem: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--red)',
    boxShadow: '0 0 10px var(--red-glow-sm)',
    flexShrink: 0,
  },
  gridPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    zIndex: 1,
  },
  redGlow: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
    zIndex: 1,
  },
  formPanel: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' },
  formCard: { width: '100%', maxWidth: 480 },
  formHeading: { fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 6 },
  formSubheading: { fontSize: 14, color: 'var(--text-muted)' },
  errBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
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
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
  },
  spinner: {
    display: 'inline-block',
    width: 18,
    height: 18,
    border: '2px solid rgba(255,255,255,0.25)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.65s linear infinite',
  },
  switchText: {
    fontSize: 13,
    color: 'var(--text-muted)',
    marginTop: 18,
    textAlign: 'center',
  },
  switchLink: {
    color: 'var(--red)',
    textDecoration: 'none',
    fontWeight: 700,
  },
};
