import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { educatorSignup } from '@/services/auth.api'
import { saveSession } from '@/utils/auth.utils'

// ── Inline styles (no external CSS file needed) ──────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .vp-signup-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    min-height: 100vh;
    display: flex;
    overflow: hidden;
  }

  /* ── LEFT CAROUSEL PLACEHOLDER ── */
  .vp-su-carousel {
    flex: 1;
    background: linear-gradient(145deg, #0a1c50 0%, #1a56db 100%);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .vp-su-carousel::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(99,179,237,0.18) 0%, transparent 55%),
      radial-gradient(circle at 80% 20%, rgba(26,86,219,0.35) 0%, transparent 55%);
  }
  .vp-su-carousel-text {
    position: relative;
    z-index: 2;
    color: white;
    text-align: center;
    padding: 48px;
  }
  .vp-su-carousel-tag {
    display: inline-block;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    color: rgba(255,255,255,0.9);
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 6px 16px;
    border-radius: 999px;
    margin-bottom: 24px;
  }
  .vp-su-carousel-title {
    font-size: clamp(28px, 3vw, 48px);
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 16px;
    letter-spacing: -0.5px;
  }
  .vp-su-carousel-sub {
    font-size: 15px;
    color: rgba(255,255,255,0.6);
    max-width: 380px;
    line-height: 1.7;
  }

  /* decorative circles */
  .vp-su-deco {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .vp-su-deco-1 { width: 500px; height: 500px; top: -120px; right: -120px; }
  .vp-su-deco-2 { width: 300px; height: 300px; bottom: -60px; left: -60px; }
  .vp-su-deco-3 { width: 180px; height: 180px; top: 40%; right: 40px; background: rgba(255,255,255,0.03); }

  /* ── RIGHT PANEL ── */
  .vp-su-panel {
    width: 520px;
    min-width: 420px;
    background: #fff;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 36px 44px;
    box-shadow: -8px 0 40px rgba(0,0,0,0.06);
  }

  /* ── STEPPER ── */
  .vp-stepper {
    display: flex;
    align-items: center;
    margin-bottom: 36px;
  }
  .vp-step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex: 1;
  }
  .vp-step-circle {
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px;
    font-weight: 700;
    transition: all 0.35s ease;
    position: relative;
    z-index: 1;
  }
  .vp-step-circle.done {
    background: #1a56db;
    color: #fff;
  }
  .vp-step-circle.active {
    background: #1a56db;
    color: #fff;
    box-shadow: 0 0 0 4px rgba(26,86,219,0.15);
  }
  .vp-step-circle.idle {
    background: #f1f5f9;
    color: #94a3b8;
  }
  .vp-step-label {
    font-size: 10px;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    font-weight: 600;
    margin-top: 6px;
    color: #94a3b8;
    transition: color 0.3s;
  }
  .vp-step-label.active { color: #1a56db; }
  .vp-step-label.done   { color: #1a56db; }
  .vp-step-connector {
    flex: 1;
    height: 2px;
    background: #e2e8f0;
    margin: 0 4px;
    margin-bottom: 18px;
    position: relative;
    overflow: hidden;
  }
  .vp-step-connector::after {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    background: #1a56db;
    transition: width 0.4s ease;
  }
  .vp-step-connector.filled::after { width: 100%; }

  /* ── FORM ── */
  .vp-su-heading {
    font-size: 26px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.4px;
    margin-bottom: 4px;
  }
  .vp-su-sub {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 28px;
  }

  .vp-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #475569;
    margin-bottom: 6px;
  }
  .vp-input-wrap {
    position: relative;
    margin-bottom: 20px;
  }
  .vp-input {
    width: 100%;
    padding: 13px 16px 13px 42px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    font-family: inherit;
    color: #0f172a;
    background: #f8fafc;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    outline: none;
    box-sizing: border-box;
  }
  .vp-input:focus {
    border-color: #1a56db;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(26,86,219,0.1);
  }
  .vp-input.no-icon { padding-left: 16px; }
  .vp-input-icon {
    position: absolute;
    left: 13px;
    top: 50%; transform: translateY(-50%);
    color: #94a3b8;
    display: flex;
    pointer-events: none;
  }
  .vp-pw-toggle {
    position: absolute;
    right: 13px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: #94a3b8; padding: 0; font-size: 15px;
    display: flex; align-items: center;
  }

  .vp-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  /* ── BUTTONS ── */
  .vp-btn-primary {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #1a56db, #1e40af);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    letter-spacing: 0.3px;
    box-shadow: 0 4px 14px rgba(26,86,219,0.3);
  }
  .vp-btn-primary:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(26,86,219,0.4);
  }
  .vp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .vp-btn-ghost {
    background: none;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 13px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
    flex: 1;
  }
  .vp-btn-ghost:hover { border-color: #1a56db; color: #1a56db; }

  .vp-btn-row {
    display: flex; gap: 12px; margin-top: 24px;
  }

  /* ── STEP CONTENT ANIMATION ── */
  .vp-step-content {
    animation: vp-fade-up 0.35s ease;
  }
  @keyframes vp-fade-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── PASSWORD STRENGTH ── */
  .vp-pw-strength {
    display: flex; gap: 4px; margin-top: 8px;
  }
  .vp-pw-bar {
    flex: 1; height: 3px; border-radius: 99px; background: #e2e8f0;
    transition: background 0.3s;
  }
  .vp-pw-bar.filled-weak   { background: #ef4444; }
  .vp-pw-bar.filled-fair   { background: #f59e0b; }
  .vp-pw-bar.filled-good   { background: #10b981; }
  .vp-pw-bar.filled-strong { background: #059669; }
  .vp-pw-hint { font-size: 11px; color: #94a3b8; margin-top: 4px; }

  /* ── SUCCESS ── */
  .vp-success {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; padding: 20px 0;
    animation: vp-fade-up 0.4s ease;
  }
  .vp-success-icon {
    width: 72px; height: 72px;
    background: linear-gradient(135deg, #1a56db, #1e40af);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
    box-shadow: 0 8px 24px rgba(26,86,219,0.3);
  }

  /* ── ERROR ── */
  .vp-alert {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
    font-size: 13px;
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 16px;
  }

  /* ── SPINNER ── */
  .vp-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: vp-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes vp-spin { to { transform: rotate(360deg); } }

  /* ── TEXTAREA ── */
  .vp-textarea {
    width: 100%;
    padding: 13px 16px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    font-family: inherit;
    color: #0f172a;
    background: #f8fafc;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
    resize: none;
    box-sizing: border-box;
  }
  .vp-textarea:focus {
    border-color: #1a56db;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(26,86,219,0.1);
  }

  /* ── SELECT ── */
  .vp-select {
    width: 100%;
    padding: 13px 16px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    font-family: inherit;
    color: #0f172a;
    background: #f8fafc;
    transition: border-color 0.2s;
    outline: none;
    appearance: none;
    cursor: pointer;
    box-sizing: border-box;
  }
  .vp-select:focus { border-color: #1a56db; box-shadow: 0 0 0 3px rgba(26,86,219,0.1); }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .vp-su-carousel { display: none; }
    .vp-su-panel { width: 100%; min-width: unset; padding: 36px 24px; }
  }
`

// ── Password strength helper ──────────────────────────────────────────────────
function getPwStrength(pw) {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const PW_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const PW_CLASSES = ['', 'filled-weak', 'filled-fair', 'filled-good', 'filled-strong']

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconMail = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
  </svg>
)
const IconLock = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const IconUser = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="7" r="4" /><path d="M5 21v-1a7 7 0 0 1 14 0v1" />
  </svg>
)
const IconPhone = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.15 9.8 19.8 19.8 0 0 1 .07 1.18 2 2 0 0 1 2.04 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L6.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 20 14.92z" />
  </svg>
)
const IconBriefcase = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="12" />
  </svg>
)
const IconCheck = () => (
  <svg width="32" height="32" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconArrow = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

// ── Stepper component ─────────────────────────────────────────────────────────
const STEPS = ['Account', 'Profile', 'Review']

function Stepper({ current }) {
  return (
    <div className="vp-stepper">
      {STEPS.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'idle'
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? '1' : 'none' }}>
            <div className="vp-step-item" style={{ flex: 'none' }}>
              <div className={`vp-step-circle ${state}`}>
                {state === 'done'
                  ? <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                  : i + 1
                }
              </div>
              <span className={`vp-step-label ${state}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`vp-step-connector ${i < current ? 'filled' : ''}`} style={{ flex: 1, margin: '0 6px', marginBottom: 18 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main Signup component ─────────────────────────────────────────────────────
export default function Signup() {
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    // Step 0
    name: '',
    phone: '',
    email: '',
    password: '',
    // Step 1
    title: '',
    qualification: '',
    experience: '',
    subject: '',
    bio: '',
  })

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const pwStrength = getPwStrength(form.password)

  // ── Validate step 0 ──
  const canNext0 = form.name.trim() && form.email.trim() && form.password.length >= 6

  // ── Submit ──
  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await educatorSignup({
        ...form,
        orgSlug: 'vidhyapat-dev'
      })
      if (res.success) {
        saveSession(res.data)
        nav('/dashboard')
      } else {
        setError(res.message || 'Signup failed.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 0: Account basics ──────────────────────────────────────────────────
  const Step0 = (
    <div className="vp-step-content" key="s0">
      <div className="vp-su-heading">Create your account</div>
      <div className="vp-su-sub">Start teaching on Vidhyapat in minutes</div>

      {error && <div className="vp-alert">{error}</div>}

      <div className="vp-row-2">
        <div>
          <label className="vp-label">Full Name</label>
          <div className="vp-input-wrap" style={{ marginBottom: 0 }}>
            <span className="vp-input-icon"><IconUser /></span>
            <input className="vp-input" placeholder="John Doe" name="name" value={form.name} onChange={set('name')} />
          </div>
        </div>
        <div>
          <label className="vp-label">Phone</label>
          <div className="vp-input-wrap" style={{ marginBottom: 0 }}>
            <span className="vp-input-icon"><IconPhone /></span>
            <input className="vp-input" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
          </div>
        </div>
      </div>

      <div style={{ height: 20 }} />

      <label className="vp-label">Email Address</label>
      <div className="vp-input-wrap">
        <span className="vp-input-icon"><IconMail /></span>
        <input className="vp-input" type="email" placeholder="you@school.edu" value={form.email} onChange={set('email')} />
      </div>

      <label className="vp-label">Password</label>
      <div className="vp-input-wrap" style={{ marginBottom: 6 }}>
        <span className="vp-input-icon"><IconLock /></span>
        <input className="vp-input" type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={set('password')} />
        <button className="vp-pw-toggle" type="button" onClick={() => setShowPw(p => !p)}>
          {showPw
            ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
            : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
          }
        </button>
      </div>

      {form.password && (
        <>
          <div className="vp-pw-strength">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className={`vp-pw-bar ${pwStrength >= n ? PW_CLASSES[pwStrength] : ''}`} />
            ))}
          </div>
          <div className="vp-pw-hint">{PW_LABELS[pwStrength]} password</div>
        </>
      )}

      <button
        className="vp-btn-primary"
        style={{ marginTop: 24 }}
        disabled={!canNext0}
        onClick={() => { setError(''); setStep(1) }}
        type="button"
      >
        Continue <IconArrow />
      </button>

      <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 20, marginBottom: 0 }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#1a56db', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </div>
  )

  // ── Step 1: Professional profile ───────────────────────────────────────────
  const Step1 = (
    <div className="vp-step-content" key="s1">
      <div className="vp-su-heading">Your educator profile</div>
      <div className="vp-su-sub">Help students know who you are <span style={{ color: '#94a3b8' }}>(optional — skip anytime)</span></div>

      <label className="vp-label">Professional Title</label>
      <div className="vp-input-wrap">
        <span className="vp-input-icon"><IconBriefcase /></span>
        <input className="vp-input" placeholder="e.g. Senior Math Educator" value={form.title} onChange={set('title')} />
      </div>

      <div className="vp-row-2">
        <div>
          <label className="vp-label">Qualification</label>
          <select className="vp-select" value={form.qualification} onChange={set('qualification')}>
            <option value="">Select…</option>
            <option>B.Ed</option>
            <option>M.Ed</option>
            <option>B.Sc / B.A</option>
            <option>M.Sc / M.A</option>
            <option>PhD</option>
            <option>B-Tech</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="vp-label">Experience (yrs)</label>
          <input className="vp-input no-icon" placeholder="e.g. 5" type="number" min="0" value={form.experience} onChange={set('experience')} />
        </div>
      </div>

      <label className="vp-label" style={{ marginTop: 4 }}>Primary Subject</label>
      <div className="vp-input-wrap">
        <input className="vp-input no-icon" placeholder="e.g. AIML, Full stack…" value={form.subject} onChange={set('subject')} />
      </div>

      <label className="vp-label">Short Bio</label>
      <textarea
        className="vp-textarea"
        rows={3}
        placeholder="Tell students a little about yourself…"
        value={form.bio}
        onChange={set('bio')}
      />

      <div className="vp-btn-row">
        <button className="vp-btn-ghost" type="button" onClick={() => setStep(0)}>← Back</button>
        <button className="vp-btn-primary" style={{ flex: 2 }} type="button" onClick={() => setStep(2)}>
          Review &amp; Finish <IconArrow />
        </button>
      </div>
    </div>
  )

  // ── Step 2: Review ─────────────────────────────────────────────────────────
  const ReviewRow = ({ label, value }) => value ? (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}>{value}</span>
    </div>
  ) : null

  const Step2 = (
    <div className="vp-step-content" key="s2">
      <div className="vp-su-heading">Looks good!</div>
      <div className="vp-su-sub">Review your details before creating your account</div>

      {error && <div className="vp-alert">{error}</div>}

      <div style={{
        background: '#f8fafc', borderRadius: 12, padding: '4px 16px',
        border: '1.5px solid #e2e8f0', marginBottom: 20
      }}>
        <ReviewRow label="Name" value={form.name} />
        <ReviewRow label="Email" value={form.email} />
        <ReviewRow label="Phone" value={form.phone} />
        <ReviewRow label="Title" value={form.title} />
        <ReviewRow label="Qualification" value={form.qualification} />
        <ReviewRow label="Experience" value={form.experience ? `${form.experience} years` : ''} />
        <ReviewRow label="Subject" value={form.subject} />
      </div>

      <div style={{
        background: 'rgba(26,86,219,0.05)', border: '1px solid rgba(26,86,219,0.15)',
        borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#1e40af',
        display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 20
      }}>
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        You can always update your profile details from your account settings after signing up.
      </div>

      <button className="vp-btn-primary" type="button" onClick={handleSubmit} disabled={loading}>
        {loading && <span className="vp-spinner" />}
        {loading ? 'Creating account…' : 'Create My Account'}
      </button>

      <div className="vp-btn-row" style={{ marginTop: 12 }}>
        <button className="vp-btn-ghost" style={{ flex: 1 }} type="button" onClick={() => setStep(1)}>← Edit Profile</button>
      </div>
    </div>
  )

  // ── Success state ──────────────────────────────────────────────────────────
  const Success = (
    <div className="vp-success" key="success">
      <div className="vp-success-icon"><IconCheck /></div>
      <div className="vp-su-heading" style={{ marginBottom: 8 }}>You're all set, {form.name.split(' ')[0]}!</div>
      <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginBottom: 28, maxWidth: 340 }}>
        Your educator account has been created. Check your email to verify your address, then head to your dashboard.
      </p>
      <button className="vp-btn-primary" style={{ maxWidth: 260 }} type="button" onClick={() => nav('/dashboard')}>
        Go to Dashboard <IconArrow />
      </button>
    </div>
  )

  return (
    <>
      <style>{css}</style>
      <div className="vp-signup-root">

        {/* LEFT: Carousel-style panel */}
        <div className="vp-su-carousel">
          <div className="vp-su-deco vp-su-deco-1" />
          <div className="vp-su-deco vp-su-deco-2" />
          <div className="vp-su-deco vp-su-deco-3" />
          <div className="vp-su-carousel-text">
            <div className="vp-su-carousel-tag">Join Vidhyapat</div>
            <div className="vp-su-carousel-title">
              {step === 0 && 'Start your\nteaching journey'}
              {step === 1 && 'Share your\nexpertise'}
              {step === 2 && 'One step\naway from greatness, '}
              {done && 'Welcome to\nVidhyapat!'}
            </div>
            <p className="vp-su-carousel-sub">
              {step === 0 && 'Join thousands of educators empowering learners across India and beyond.'}
              {step === 1 && 'A rich profile helps students connect with the right educator. Make yours shine.'}
              {step === 2 && 'Review your details and launch your educator profile today.'}
              {done && 'Your account is ready. Welcome to a community of passionate educators.'}
            </p>
          </div>
        </div>

        {/* RIGHT: Form panel */}
        <div className="vp-su-panel">
          <img
            src="https://res.cloudinary.com/doqbjnliq/image/upload/logoblue2_t5elbf.png"
            alt="Vidhyapat"
            style={{ height: 52, objectFit: 'contain', width: 'fit-content', marginBottom: 28 }}
          />

          {!done && <Stepper current={step} />}

          {done ? Success : step === 0 ? Step0 : step === 1 ? Step1 : Step2}

          {!done && (
            <p style={{ textAlign: 'center', fontSize: 11, color: '#cbd5e1', marginTop: 32, lineHeight: 1.7 }}>
              Protected by Vidhyapat security ·{' '}
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</a>
            </p>
          )}
        </div>

      </div>
    </>
  )
}