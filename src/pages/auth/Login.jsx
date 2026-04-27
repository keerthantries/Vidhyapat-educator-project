import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { educatorLogin } from '@/services/auth.api'
import { saveSession } from '@/utils/auth.utils'
import './Login.css'

const SLIDES = [
  {
    img: 'https://res.cloudinary.com/doqbjnliq/image/upload/iStock-1168910967_tsxd9a.jpg',
    tag: 'Vidhyapat LMS',
    title: 'Empowering Educators,\nInspiring Learners',
    sub: 'A modern learning platform built for institutions that believe in the power of great teaching.',
  },
  {
    img: 'https://res.cloudinary.com/doqbjnliq/image/upload/International-students-236-2048x1365_xgemfh.jpg',
    tag: 'Global Reach',
    title: 'Education Without\nBoundaries',
    sub: 'Serve learners across geographies with multi-tenant architecture and localised content delivery.',
  },
  {
    img: 'https://res.cloudinary.com/doqbjnliq/image/upload/loginpage_ubv6op.jpg',
    tag: 'Live Classes',
    title: 'Real-Time Teaching,\nReal Impact',
    sub: 'Schedule, manage, and deliver live video classes with seamless tools built for educators.',
  },
]

const INITIAL_FORM = { orgSlug: 'vidhyapat-dev', email: '', password: '' }

export default function Login() {
  const nav = useNavigate()

  const [form, setForm]             = useState(INITIAL_FORM)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [showPw, setShowPw]         = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const timerRef = useRef(null)

  const startTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(
      () => setActiveSlide((p) => (p + 1) % SLIDES.length),
      5000
    )
  }

  useEffect(() => {
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [])

  const goSlide = (n) => {
    setActiveSlide((n + SLIDES.length) % SLIDES.length)
    startTimer()
  }

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await educatorLogin(form)
      saveSession(res.data)
      nav('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex vh-100 overflow-hidden">

      {/* ── LEFT: Carousel ─────────────────────── */}
      <div className="vp-carousel-panel flex-grow-1 position-relative overflow-hidden">

        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`vp-slide${i === activeSlide ? ' active' : ''}`}
            style={{ backgroundImage: `url('${slide.img}')` }}
          >
            <div className="vp-slide-content">
              <span
                className="badge bg-white bg-opacity-25 text-white fw-normal text-uppercase rounded-pill mb-3 px-3 py-2"
                style={{ fontSize: 'var(--text-xs)', letterSpacing: '1.5px' }}
              >
                {slide.tag}
              </span>
              <div className="vp-slide-title mb-2">{slide.title}</div>
              <p className="mb-0 small text-white-50">{slide.sub}</p>
            </div>
          </div>
        ))}

        <button className="vp-arrow vp-arrow-prev" onClick={() => goSlide(activeSlide - 1)}>
          &#8592;
        </button>
        <button className="vp-arrow vp-arrow-next" onClick={() => goSlide(activeSlide + 1)}>
          &#8594;
        </button>

        <div
          className="position-absolute d-flex gap-2"
          style={{ bottom: 28, right: 48, zIndex: 'var(--z-above)' }}
        >
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`vp-dot${i === activeSlide ? ' active' : ''}`}
              onClick={() => goSlide(i)}
            />
          ))}
        </div>
      </div>

      {/* ── RIGHT: Login Panel ─────────────────── */}
      <div className="vp-login-panel d-flex flex-column justify-content-center bg-white px-5 py-4 shadow-sm">

        <img
          src="https://res.cloudinary.com/doqbjnliq/image/upload/logoblue_qy56iu.png"
          alt="Vidhyapat"
          className="mb-4"
          style={{ height: 36, objectFit: 'contain', width: 'fit-content' }}
        />

        <h3 className="vp-login-heading fw-bold mb-1">Welcome back</h3>
        <p className="text-muted mb-4 text-base">Sign in to your educator account</p>

        {error && (
          <div className="alert alert-danger py-2 mb-3 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <div className="position-relative">
              <span className="vp-input-icon">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="form-control vp-field-input"
                placeholder="you@school.edu"
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="form-label">Password</label>
            <div className="position-relative">
              <span className="vp-input-icon">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                name="password"
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                className="form-control vp-field-input"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="vp-pw-toggle"
                onClick={() => setShowPw((p) => !p)}
                tabIndex={-1}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-3"
            disabled={loading}
          >
            {loading && <span className="vp-btn-spinner" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

        </form>

        <p className="text-center text-muted mt-4 mb-0 text-xs" style={{ lineHeight: 'var(--leading-loose)' }}>
          Protected by Vidhyapat security.<br />
          Forgot your password? Contact your administrator.
        </p>

      </div>
    </div>
  )
}
